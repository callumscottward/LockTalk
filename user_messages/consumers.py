import json
from django.contrib.auth import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Conversation, Message
from channels.db import database_sync_to_async

User = get_user_model()
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
                "sender_name": f"{self.user.first_name} {self.user.last_name}",            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "content": event["content"],
            "sender_email": event["sender_email"],
            "sender_name": event["sender_name"],
        }))