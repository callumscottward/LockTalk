import json
from django.contrib.auth import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer, AsyncJsonWebsocketConsumer
from .serializers import ConversationSerializer
from .models import Conversation, Message, ConversationKey
from channels.db import database_sync_to_async
from django.utils import timezone
from django.db.models import Count
from user_messages.models import Log

User = get_user_model()

@database_sync_to_async
def create_msg_logs(conversation, user):
    other_participants = conversation.participants.exclude(id=user.id)
    for participant in other_participants:
        Log.objects.create(
            event_type='SMS',
            sender=user.username,
            receiver=participant.username,
            success=True
        )

@database_sync_to_async
def create_del_msg_logs(user):
    Log.objects.create(
        event_type='DELETE_SMS',
        sender=user.username,
        receiver='SYSTEM',
        success=True
    )

@database_sync_to_async
def create_del_convo_logs(user):
    Log.objects.create(
        event_type='DELETE_CONVO',
        sender=user.username,
        receiver='SYSTEM',
        success=True
    )

def delete_old_messages():
    from django.utils import timezone
    from datetime import timedelta
    from .models import Message

    cutoff = timezone.now() - timedelta(days=90)

    Message.objects.filter(
        created_at__lt=cutoff
    ).delete()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
            return

      
        # Grab conversation_id from URL route
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']

         # Validate user is part of the conversation
        self.conversation = await database_sync_to_async(
            lambda: Conversation.objects.get(id=self.conversation_id)
        )()

        is_member = await database_sync_to_async(
            lambda: self.conversation.participants.filter(id=self.user.id).exists()
        ) ()

        if not is_member:
            await self.close()
            return
        
        self.group_name = f"conversation_{self.conversation_id}"

        # Add user to group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)

        if data.get("type") == "kem_handshake":
            await self.handle_kem_handshake(data)
            return

        action = data.get("action")

        if action == "delete_message":
            await self.delete_message(data)
        else:
            message = data.get("message")
            priority = data.get("priority", "normal")
            if not message:
                return
            
            # Save message to database
            details = await database_sync_to_async(
                lambda: Message.objects.create(
                    conversation=self.conversation,
                    sender=self.user,
                    content=message,
                    priority=priority,
            )
            )()
            
            # Broadcast to group
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "chat_message",
                    "content": details.content,
                    "sender_email": self.user.email,
                    "sender_name": f"{self.user.first_name} {self.user.last_name}",
                    "message_id": details.id,
                    "timestamp": details.created_at.isoformat(),
                    "priority": details.priority,
                }
            )
            
            participants = await database_sync_to_async(
                lambda: list(self.conversation.participants.all())
            )()
            
            serialized = await database_sync_to_async(
                lambda: ConversationSerializer(
                    self.conversation,
                    context={"user": self.user}
                ).data
            )()

            for p in participants:
                await self.channel_layer.group_send(
                    f"user_{p.id}",
                    {
                        "type": "conversation_updated",
                        "conversation": serialized
                    }
                )
            
            await create_msg_logs(self.conversation, self.user)

            await database_sync_to_async(
                lambda: Conversation.objects.filter(id=self.conversation_id)
                .update(latestUpdate=timezone.now())
            )()

            await database_sync_to_async(delete_old_messages)()

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "content": event["content"],
            "sender_email": event["sender_email"],
            "sender_name": event["sender_name"],
            "message_id": event["message_id"],
            "timestamp": event["timestamp"],
            "priority": event.get("priority", "normal"), 
        }))
        
    async def delete_message(self, content):
        user = self.scope["user"]
        message_id = content.get("message_id")

        try:
            message = await database_sync_to_async(lambda: Message.objects.get(id=message_id))()

            await create_del_msg_logs(user);

            await database_sync_to_async(lambda: message.delete())()

            await self.channel_layer.group_send(
                self.group_name,
                {"type": "message_deleted", "message_id": message_id}
            )
    
        except Message.DoesNotExist:
            pass
            
    async def message_deleted(self, event):
        await self.send(text_data=json.dumps({
            "type": "message_deleted",
            "message_id": event["message_id"]
        }))
    
    async def handle_kem_handshake(self, data):
        wrapped_keys = data.get("wrappedKeys", [])

        for wrapped in wrapped_keys:
            await database_sync_to_async(
                lambda wrapped=wrapped: ConversationKey.objects.update_or_create(
                    conversation_id=self.conversation_id,
                    recipient_id=wrapped["recipientId"],
                    defaults={
                        "kem_ciphertext": wrapped["kemCiphertext"],
                        "encrypted_conversation_key": wrapped["encryptedConversationKey"],
                    },
                )
            )()

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "kem_handshake",
                "conversationId": self.conversation_id,
                "wrappedKeys": wrapped_keys,
            }
        )

    async def kem_handshake(self, event):
        await self.send(text_data=json.dumps({
            "type": "kem_handshake",
            "conversationId": event["conversationId"],
            "wrappedKeys": event["wrappedKeys"],
        }))

class ConversationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
            return

        # Join user-specific group
        self.group_name = f"user_{self.user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.channel_layer.group_add("conversations", self.channel_name)


        await self.accept()
        

    async def receive_json(self, content):
        action = content.get("action")

        if action == "create_conversation":
            await self.create_conversation(content)
        elif action == "delete_conversation":
            await self.delete_conversation(content)
        elif action == "add_member":
            await self.add_member(content)
        elif action == "remove_member":
            await self.remove_member(content)
        

    async def create_conversation(self, content):
        user = self.scope["user"]
        name = content.get("name", "")
        usernames = content.get("participants", [])
        time = timezone.now()

        # Get participants + include current user
        participants = await database_sync_to_async(
            lambda: list(User.objects.filter(username__in=usernames))
        )()
        participants.append(user)

        participant_ids = set(u.id for u in participants)
        is_group = len(participants) >= 3

        conversation = None
        created_new = False

        # --- Check for existing direct chat ---
        if not is_group:
            all_convos = await database_sync_to_async(
                lambda: list(
                    Conversation.objects.filter(is_group=False)
                    .prefetch_related("participants")
                )
            )()

            for conv in all_convos:
                ids = set(await database_sync_to_async(
                    lambda c=conv: list(c.participants.values_list("id", flat=True))
                )())

                if ids == participant_ids:
                    conversation = conv
                    break

        # --- Create if not found ---
        if not conversation:
            created_new = True 

            conversation = await database_sync_to_async(
                lambda: Conversation.objects.create(
                    name=name,
                    moderator= user if is_group else None,
                    is_group=is_group,
                    latestUpdate=time
                )
            )()

            await database_sync_to_async(
                lambda: conversation.participants.add(*participant_ids)
            )()

        serialized = await database_sync_to_async(
            lambda: ConversationSerializer(
                conversation,
                context={"request": type("req", (), {"user": self.user})()}
            ).data
        )()

        # Broadcast to all participants
        for participant in participants:
            await self.channel_layer.group_send(
                f"user_{participant.id}",
                {
                    "type": "new_conversation",
                    "conversation": serialized,
                    "already_exists": not created_new
                }
            )

    async def conversation_created(self, event):
        await self.send_json(event)

    async def new_conversation(self, event):
        await self.send_json({
            "type": "new_conversation",
            "conversation": event["conversation"]
        })
        
    async def delete_conversation(self, content):
        user = self.scope["user"]
        conv_id = content.get("conversation_id")

        try:
            conversation = await database_sync_to_async(
                Conversation.objects.get
            )(id=conv_id)

            # For Later when we restrict this to moderator only
            #if user != conversation.moderator:
            #    return

            # Get participants BEFORE deleting (for broadcast)
            participants = await database_sync_to_async(
                lambda: list(conversation.participants.all())
            )()

            # Delete conversation (messages auto-delete via CASCADE)
            await database_sync_to_async(conversation.delete)()
            
            await create_del_convo_logs(user);

            await self.channel_layer.group_send(
                "conversations",
                {
                    "type": "conversation_deleted",
                    "conversation_id": conv_id
                }
            )

        except Conversation.DoesNotExist:
            pass
        
    async def conversation_deleted(self, event):
        await self.send_json({
            "type": "conversation_deleted",
            "conversation_id": event["conversation_id"]
        })
    
    async def add_member(self, content):
        User = get_user_model()

        username = content.get("username")
        conv_id = content.get("conversation_id")

        if not username or not conv_id:
            return

        conversation = await database_sync_to_async(
            lambda: Conversation.objects.prefetch_related("participants").get(id=conv_id)
        )()

        user_to_add = await database_sync_to_async(
            User.objects.get
        )(username=username)

        await database_sync_to_async(
            lambda: conversation.participants.add(user_to_add)
        )()

        await database_sync_to_async(conversation.refresh_from_db)()

        serialized = await database_sync_to_async(
            lambda: ConversationSerializer(
                conversation,
                context={"request": type("req", (), {"user": self.user})()}
            ).data
        )()

        # broadcast to ALL affected users
        participants = await database_sync_to_async(
            lambda: list(conversation.participants.all())
        )()
        
        for p in participants:
            await self.channel_layer.group_send(
                f"user_{p.id}",
                {
                    "type": "conversation_updated",
                    "conversation": serialized
                }
            )
            
    async def remove_member(self, content):
        User = get_user_model()

        user_id = content.get("userId")
        conv_id = content.get("conversation_id")

        if not user_id or not conv_id:
            return

        conversation = await database_sync_to_async(
            lambda: Conversation.objects.prefetch_related("participants").get(id=conv_id)
        )()

        user_to_remove = await database_sync_to_async(
            User.objects.get
        )(id=user_id)

        # IMPORTANT: store participants BEFORE removal for proper broadcasting
        participants_before = await database_sync_to_async(
            lambda: list(conversation.participants.all())
        )()

        # remove user
        await database_sync_to_async(
            lambda: conversation.participants.remove(user_to_remove)
        )()

        await database_sync_to_async(conversation.refresh_from_db)()

        serialized = await database_sync_to_async(
            lambda: ConversationSerializer(
                conversation,
                context={"user": self.scope["user"]}
            ).data
        )()

        target_users = set(participants_before + [user_to_remove])

        for p in target_users:
            await self.channel_layer.group_send(
                f"user_{p.id}",
                {
                    "type": "conversation_updated",
                    "conversation": serialized
                }
            )
            
    async def conversation_updated(self, event):
        await self.send_json({
            "type": "conversation_updated",
            "conversation": event["conversation"]
        })
