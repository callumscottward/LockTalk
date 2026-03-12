import json
from django.contrib.auth import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Conversation

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
        conversation = await database_sync_to_async(
            lambda: Conversation.objects.filter(id=self.conversation_id, participants=self.user).first()
        )()

        if not conversation:
            # Reject connection if user is not a participant
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

        # Broadcast to group
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat_message",
                "message": message,
                "sender": f"{self.user.first_name} {self.user.last_name}",
            }
        )

    async def chat_message(self, event):
        # Send to WebSocket
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": event["message"],
            "sender": event["sender"],
        }))