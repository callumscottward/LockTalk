import json
from channels.testing import WebsocketCommunicator
from django.test import TransactionTestCase
from django.contrib.auth import get_user_model
from user_messages.models import Conversation, Message
from LockTalk.asgi import application  # adjust if needed

User = get_user_model()


class ChatConsumerTest(TransactionTestCase):

    async def asyncSetUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="password"
        )

        self.conversation = Conversation.objects.create()
        self.conversation.participants.add(self.user)

    async def test_connect_success(self):
        communicator = WebsocketCommunicator(
            application,
            f"/ws/conversation/{self.conversation.id}/"
        )

        communicator.scope["user"] = self.user

        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        await communicator.disconnect()

    async def test_send_message(self):
        communicator = WebsocketCommunicator(
            application,
            f"/ws/conversation/{self.conversation.id}/"
        )

        communicator.scope["user"] = self.user
        await communicator.connect()

        await communicator.send_json_to({
            "message": "Hello"
        })

        response = await communicator.receive_json_from()

        self.assertEqual(response["type"], "chat_message")

        self.assertEqual(Message.objects.count(), 1)

        await communicator.disconnect()
