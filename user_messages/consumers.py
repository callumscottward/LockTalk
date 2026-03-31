import json
from django.contrib.auth import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer, AsyncJsonWebsocketConsumer
from .serializers import ConversationSerializer
from .models import Conversation, Message
from channels.db import database_sync_to_async
from django.utils import timezone
from django.db.models import Count
from user_messages.models import Log


User = get_user_model()

@database_sync_to_async
def create_logs(conversation, user):
    other_participants = conversation.participants.exclude(id=user.id)
    for participant in other_participants:
        Log.objects.create(
            event_type='SMS',
            sender=user.username,
            receiver=participant.username,
            success=True
        )

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
        lambda: self.user in self.conversation.participants.all()
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
        message = data.get("message")
        if not message:
            return
        
         # Save message to database
        details = await database_sync_to_async(
            lambda: Message.objects.create(
                conversation=self.conversation,
                sender=self.user,
                content=message
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
            }
        )

        await create_logs(self.conversation, self.user)
        
        await database_sync_to_async(
            lambda: Conversation.objects.filter(id=self.conversation_id)
            .update(latestUpdate=timezone.now())
        )()

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "content": event["content"],
            "sender_email": event["sender_email"],
            "sender_name": event["sender_name"],
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

        await self.accept()
        

    async def receive_json(self, content):
        action = content.get("action")

        if action == "create_group":
            await self.create_group(content)

    async def create_group(self, content):
        user = self.scope["user"]
        name = content.get("name", "")
        usernames = content.get("participants", [])
        time = timezone.now()

        # Fetch participants
        participants = await database_sync_to_async(
            lambda: list(User.objects.filter(username__in=usernames))
        )()
        participants.append(user)  # Add creator
        selected_user_ids = [u.id for u in participants]
        participants_ids_set = set(selected_user_ids)

        # Fetch existing conversations with any of these users
        existing = await database_sync_to_async(
            lambda: list(
                Conversation.objects.annotate(num_participants=Count('participants'))
                .filter(participants__in=participants)
                .distinct()
            )
        )()

        # Check for exact participant match
        conversation = None
        for conv in existing:
            conv_participants_ids = set(await database_sync_to_async(
                lambda: list(conv.participants.values_list('id', flat=True))
            )())
            if conv_participants_ids == participants_ids_set:
                conversation = conv
                break

        # Create new conversation if none exists
        if not conversation:
            conversation = await database_sync_to_async(
                lambda: Conversation.objects.create(
                    name=name,
                    moderator=user,
                    latestUpdate=time
                )
            )()
            await database_sync_to_async(lambda: conversation.participants.add(*selected_user_ids))()

        # Mark as group if 3+ participants
        if len(participants) >= 3:
            await database_sync_to_async(lambda: setattr(conversation, "is_group", True))()
            await database_sync_to_async(lambda: conversation.save(update_fields=["is_group"]))()

        # Broadcast to participants
        serialized = await database_sync_to_async(
            lambda: ConversationSerializer(conversation, context={"request": self.scope}).data
        )()
        for participant in participants:
            await self.channel_layer.group_send(
                f"user_{participant.id}",
                {"type": "new_conversation", "conversation": serialized}
            )

    async def conversation_created(self, event):
        await self.send_json(event)

    async def new_conversation(self, event):
        await self.send_json({
            "type": "new_conversation",
            "conversation": event["conversation"]
        })