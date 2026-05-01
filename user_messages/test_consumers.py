import json
from channels.testing import WebsocketCommunicator
from django.test import TransactionTestCase
from django.contrib.auth import get_user_model
from user_messages.models import Conversation, Message
from locktalk.asgi import application

User = get_user_model()


class ChatConsumerTest(TransactionTestCase):

    async def test_connect_success(self):

        user = User.objects.create_user(
            username="testuser",
            password="password"
        )

        conversation = Conversation.objects.create()
        conversation.participants.add(user)

        communicator = WebsocketCommunicator(
            application,
            f"/ws/conversation/{conversation.id}/"
        )

        communicator.scope["user"] = user

        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        await communicator.disconnect()

    async def test_send_message(self):

        user = User.objects.create_user(
            username="testuser",
            password="password"
        )

        conversation = Conversation.objects.create()
        conversation.participants.add(user)

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
