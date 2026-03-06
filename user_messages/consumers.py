import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    # Connects and separates the chats into different users
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # Attempt to make the user only see their own stuff
        self.user = self.scope["user"]

        if self.user.is_authenticated:
            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()

            await self.send(text_data=json.dumps({
                'type': 'user_info',
                'username': f"{self.user.first_name} {self.user.last_name}"
            }))
        else:
            # Not logged in reject
            await self.close()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket (React Frontend)
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']

        # Send message
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_name': f"{self.user.first_name} {self.user.last_name}",
                'sender_id':self.user.id
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'sender': event['sender_name'],
        }))