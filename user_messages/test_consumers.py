import json
from channels.testing import WebsocketCommunicator
from django.test import TransactionTestCase
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from user_messages.models import Conversation, Message
from LockTalk.asgi import application

User = get_user_model()


class ChatConsumerTest(TransactionTestCase):

    async def create_user(self):
        return await database_sync_to_async(User.objects.create_user)(
            username="testuser",
            password="password"
        )

    async def create_conversation(self, user):
        convo = await database_sync_to_async(Conversation.objects.create)()
        await database_sync_to_async(convo.participants.add)(user)
        return convo

    async def test_connect_success(self):

        user = await self.create_user()
        conversation = await self.create_conversation(user)

        communicator = WebsocketCommunicator(
            application,
            f"/ws/conversation/{conversation.id}/"
        )

        communicator.scope["user"] = user

        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        await communicator.disconnect()

    async def test_send_message(self):

        user = await self.create_user()
        conversation = await self.create_conversation(user)

        communicator = WebsocketCommunicator(
            application,
            f"/ws/conversation/{conversation.id}/"
        )

        communicator.scope["user"] = user

        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        await communicator.send_json_to({
            "message": "Hello"
        })

        response = await communicator.receive_json_from()

        self.assertEqual(response["type"], "chat_message")
        self.assertEqual(response["content"], "Hello")

        count = await database_sync_to_async(Message.objects.count)()
        self.assertEqual(count, 1)

        await communicator.disconnect()
