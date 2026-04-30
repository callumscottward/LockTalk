from django.test import TestCase
from django.contrib.auth import get_user_model
from user_messages.models import Conversation, Message, Log
from user_messages.serializers import (
    MessageSerializer,
    ConversationSerializer,
    CurrentUserSerializer,
    LogSerializer
)

User = get_user_model()


class SerializerTest(TestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(
            username="user1",
            email="user1@test.com",
            password="password"
        )
        self.user2 = User.objects.create_user(
            username="user2",
            email="user2@test.com",
            password="password"
        )

        self.conversation = Conversation.objects.create(is_group=False)
        self.conversation.participants.add(self.user1, self.user2)

        self.message = Message.objects.create(
            conversation=self.conversation,
            sender=self.user1,
            content="Hello"
        )

    def test_message_serializer(self):
        serializer = MessageSerializer(self.message)
        data = serializer.data

        self.assertEqual(data["sender"], "user1")
        self.assertEqual(data["sender_email"], "user1@test.com")
        self.assertEqual(data["content"], "Hello")

    def test_conversation_serializer_participants(self):
        serializer = ConversationSerializer(
            self.conversation,
            context={"request": type("req", (), {"user": self.user1})()}
        )
        data = serializer.data

        self.assertEqual(len(data["participants"]), 2)

    def test_conversation_last_message(self):
        serializer = ConversationSerializer(
            self.conversation,
            context={"request": type("req", (), {"user": self.user1})()}
        )
        data = serializer.data

        self.assertEqual(data["last_msg"], "Hello")

    def test_conversation_name_fallback(self):
        serializer = ConversationSerializer(
            self.conversation,
            context={"request": type("req", (), {"user": self.user1})()}
        )
        data = serializer.data

        # Since it's direct chat, should show other user's username
        self.assertEqual(data["name"], "user2")

    def test_current_user_serializer(self):
        serializer = CurrentUserSerializer(self.user1)
        data = serializer.data

        self.assertEqual(data["username"], "user1")
        self.assertIn("is_staff", data)

    def test_log_serializer(self):
        log = Log.objects.create(
            event_type="LOGIN",
            sender="user1",
            receiver="system"
        )

        serializer = LogSerializer(log)
        data = serializer.data

        self.assertEqual(data["event_type"], "LOGIN")
        self.assertEqual(data["sender"], "user1")
