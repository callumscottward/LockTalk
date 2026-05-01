import json
from channels.testing import WebsocketCommunicator
from channels.db import database_sync_to_async
from django.test import TransactionTestCase
from django.contrib.auth import get_user_model
from user_messages.models import Conversation, Message
from LockTalk.asgi import application

User = get_user_model()


class ChatConsumerTest(TransactionTestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="password"
        )

        self.conversation = Conversation.objects.create()
        self.conversation.participants.add(self.user)

    async def _create_communicator(self):
        communicator = WebsocketCommunicator(
            application,
            f"/ws/conversation/{self.conversation.id}/"
        )

        # Proper way to inject auth in tests
        communicator.scope["user"] = self.user
        communicator.scope["url_route"] = {
            "kwargs": {"conversation_id": str(self.conversation.id)}
        }

        return communicator

    async def test_connect_success(self):
        communicator = await self._create_communicator()

        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        await communicator.disconnect()

    async def test_send_message(self):
        communicator = await self._create_communicator()

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
