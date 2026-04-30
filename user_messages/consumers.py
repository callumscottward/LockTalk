import json
from django.contrib.auth import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer, AsyncJsonWebsocketConsumer
from .serializers import ConversationSerializer
from .models import Conversation, Message, ConversationKey
from channels.db import database_sync_to_async
from django.utils import timezone
from django.db.models import Count
from user_messages.models import Log

## @file consumers.py
#  @brief WebSocket consumers for real-time chat functionality.
#
#  This file implements real-time communication features including:
#  - Sending and receiving chat messages
#  - Managing conversations (create, delete, update)
#  - Adding/removing members in group chats
#  - Logging user actions (messages, deletions)
#  - Handling KEM key exchange for secure messaging
User = get_user_model()

## @brief Creates logs when a message is sent in a conversation.
#  @param conversation The conversation where the message was sent.
#  @param user The user sending the message.
@database_sync_to_async
def create_msg_logs(conversation, user):
    #creates logs when a message is sent
    other_participants = conversation.participants.exclude(id=user.id)
    for participant in other_participants:
        Log.objects.create(
            event_type='SMS',
            sender=user.username,
            receiver=participant.username,
            success=True
        )


## @brief Creates a log entry when a message is deleted.
#  @param user The user who deleted the message.
@database_sync_to_async
def create_del_msg_logs(user):
    Log.objects.create(
        event_type='DELETE_SMS',
        sender=user.username,
        receiver='SYSTEM',
        success=True
    )

## @brief Creates a log entry when a conversation is deleted.
#  @param user The user who deleted the conversation.
@database_sync_to_async
def create_del_convo_logs(user):
    Log.objects.create(
        event_type='DELETE_CONVO',
        sender=user.username,
        receiver='SYSTEM',
        success=True
    )

## @brief Deletes messages older than 90 days.
#  @return None
def delete_old_messages():
    from django.utils import timezone
    from datetime import timedelta
    from .models import Message

    cutoff = timezone.now() - timedelta(days=90)

    Message.objects.filter(
        created_at__lt=cutoff
    ).delete()

## @class ChatConsumer
#  @brief Handles real-time messaging within a single conversation.
#
#  Responsible for:
#  - Connecting users to a conversation room
#  - Sending and receiving messages
#  - Deleting messages
#  - Handling KEM handshake for encryption keys
class ChatConsumer(AsyncWebsocketConsumer):
     ## @brief Connects a user to a conversation WebSocket room.
    #  @return None
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

    ## @brief Disconnects the user from the conversation room.
    #  @param close_code WebSocket close code.
    #  @return None
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    ## @brief Handles incoming WebSocket messages.
    #  @param text_data JSON string received from frontend.
    #  @return None
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

    ## @brief Sends a chat message to the frontend.
    #  @param event Event dictionary containing message data.
    #  @return None
    async def chat_message(self, event):
        #sends message information to frontend
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "content": event["content"],
            "sender_email": event["sender_email"],
            "sender_name": event["sender_name"],
            "message_id": event["message_id"],
            "timestamp": event["timestamp"],
            "priority": event.get("priority", "normal"), 
        }))
        
    ## @brief Deletes a message from the conversation.
    #  @param content Dictionary containing message_id.
    #  @return None
    async def delete_message(self, content):
        #deletes a message
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
            
    ## @brief Sends message deletion event to frontend.
    #  @param event Event dictionary.
    #  @return None
    async def message_deleted(self, event):
        await self.send(text_data=json.dumps({
            "type": "message_deleted",
            "message_id": event["message_id"]
        }))
    
    ## @brief Handles KEM key exchange handshake.
    #  @param data Dictionary containing wrapped encryption keys.
    #  @return None
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

    ## @brief Sends KEM handshake data to frontend.
    #  @param event Event dictionary.
    #  @return None
    async def kem_handshake(self, event):
        await self.send(text_data=json.dumps({
            "type": "kem_handshake",
            "conversationId": event["conversationId"],
            "wrappedKeys": event["wrappedKeys"],
        }))

## @class ConversationConsumer
#  @brief Handles real-time conversation management over WebSockets.
#
#  Responsible for:
#  - Creating conversations (group and direct)
#  - Deleting conversations
#  - Adding/removing members
#  - Broadcasting conversation updates to affected users
#  - Managing per-user and global conversation channels
class ConversationConsumer(AsyncJsonWebsocketConsumer):
    ## @brief Establishes a WebSocket connection for the authenticated user.
    #
    #  - Rejects anonymous users
    #  - Adds user to:
    #      - Personal group channel (user_{id})
    #      - Global conversations channel
    #  - Accepts connection if valid
    #  @return None
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
        
    ## @brief Routes incoming WebSocket JSON messages to handlers.
    #
    #  Supported actions:
    #  - create_conversation
    #  - delete_conversation
    #  - add_member
    #  - remove_member
    #
    #  @param content Incoming JSON payload from client
    #  @return None
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
        
    ## @brief Creates a new conversation or returns an existing direct chat.
    #
    #  For direct messages, checks if a conversation already exists between users
    #  before creating a new one.
    #
    #  @param content Dictionary containing:
    #      - name: Conversation name
    #      - participants: List of usernames
    #  @return None
    async def create_conversation(self, content):
        #creates a conversation
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
    ## @brief Sends newly created conversation event to client.
    #  @param event Event payload from channel layer
    #  @return None
    async def conversation_created(self, event):
        await self.send_json(event)

    ## @brief Sends a new conversation notification to client.
    #  @param event Event payload containing conversation data
    #  @return None
    async def new_conversation(self, event):
        await self.send_json({
            "type": "new_conversation",
            "conversation": event["conversation"]
        })
        
    ## @brief Deletes a conversation and broadcasts deletion event.
    #
    #  @param content Dictionary containing:
    #      - conversation_id: ID of conversation to delete
    #  @return None
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
        
    ## @brief Sends conversation deletion event to client.
    #  @param event Event payload containing conversation_id
    #  @return None
    async def conversation_deleted(self, event):
        await self.send_json({
            "type": "conversation_deleted",
            "conversation_id": event["conversation_id"]
        })
    
    ## @brief Adds a member to a group conversation.
    #
    #  Broadcasts updated conversation to all participants.
    #
    #  @param content Dictionary containing:
    #      - username: Username to add
    #      - conversation_id: Target conversation ID
    #  @return None
    async def add_member(self, content):
        #adds a member to a group conversation
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
            
    ## @brief Removes a member from a group conversation.
    #
    #  Broadcasts updated conversation to affected users.
    #
    #  @param content Dictionary containing:
    #      - userId: ID of user to remove
    #      - conversation_id: Target conversation ID
    #  @return None
    async def remove_member(self, content):
        #removes a member from a group conversation
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

    ## @brief Sends conversation update event to client.
    #  @param event Event payload containing updated conversation
    #  @return None      
    async def conversation_updated(self, event):
        await self.send_json({
            "type": "conversation_updated",
            "conversation": event["conversation"]
        })
