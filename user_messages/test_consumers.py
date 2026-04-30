import json
from channels.testing import WebsocketCommunicator
from channels.db import database_sync_to_async
from django.test import TransactionTestCase
from django.contrib.auth import get_user_model
from user_messages.models import Conversation, Message
from LockTalk.asgi import application

## @file test_chat_consumer.py
#  @brief Unit tests for ChatConsumer WebSocket functionality.
#
#  Tests cover:
#  - WebSocket connection handling
#  - Message sending and reception
#  - Database persistence of messages

User = get_user_model()

## @class ChatConsumerTest
#  @brief Integration tests for ChatConsumer WebSocket behavior.
class ChatConsumerTest(TransactionTestCase):
    ## @brief Sets up test user and conversation.
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="password"
        )

        self.conversation = Conversation.objects.create()
        self.conversation.participants.add(self.user)
    
    ## @brief Tests successful WebSocket connection.
    async def test_connect_success(self):
        communicator = WebsocketCommunicator(
            application,
            f"/ws/conversation/{self.conversation.id}/"
        )

        communicator.scope["user"] = self.user

        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        await communicator.disconnect()

    ## @brief Tests sending and receiving a chat message.
    #
    #  Ensures:
    #  - Message is broadcast via WebSocket
    #  - Message is persisted in the database
    async def test_send_message(self):
        communicator = WebsocketCommunicator(
            application,
            f"/ws/conversation/{self.conversation.id}/"
        )

        communicator.scope["user"] = self.user

        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Send message
        await communicator.send_json_to({
            "message": "Hello"
        })

        # Receive websocket response
        response = await communicator.receive_json_from()

        self.assertEqual(response["type"], "chat_message")
        self.assertEqual(response["content"], "Hello")

        # ✅ FIX: ORM access must be async-safe
        message_count = await database_sync_to_async(Message.objects.count)()
        self.assertEqual(message_count, 1)

        await communicator.disconnect()
