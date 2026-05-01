from django.test import TestCase
from django.contrib.auth import get_user_model
from user_messages.models import Conversation, Message, Log

User = get_user_model()


class ConversationTest(TestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(
            username="user1",
            password="password"
        )

        self.user2 = User.objects.create_user(
            username="user2",
            password="password"
        )

    def test_create_conversation(self):
        conversation = Conversation.objects.create(
            name="Test Chat",
            moderator=self.user1,
            is_group=True
        )

        conversation.participants.add(self.user1, self.user2)

        self.assertEqual(conversation.name, "Test Chat")
        self.assertTrue(conversation.is_group)
        self.assertIsNotNone(conversation.id)
        self.assertEqual(conversation.participants.count(), 2)

    def test_default_values(self):
        conversation = Conversation.objects.create()

        self.assertFalse(conversation.is_group)
        self.assertIsNotNone(conversation.latestUpdate)

    def test_retention_days(self):
        conversation = Conversation.objects.create(
            retention_days=30
        )

        self.assertEqual(conversation.retention_days, 30)


class MessageTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="password"
        )

        self.conversation = Conversation.objects.create()
        self.conversation.participants.add(self.user)

    def test_create_message(self):
        message = Message.objects.create(
            conversation=self.conversation,
            sender=self.user,
            content="Hello world"
        )

        self.assertEqual(message.content, "Hello world")
        self.assertEqual(message.sender, self.user)
        self.assertEqual(message.message_type, "normal")
        self.assertIsNotNone(message.created_at)

    def test_message_type(self):
        message = Message.objects.create(
            conversation=self.conversation,
            sender=self.user,
            content="System message",
            message_type=Message.MessageType.SYSTEM
        )

        self.assertEqual(message.message_type, "system")


class LogTest(TestCase):

    def test_create_log(self):
        log = Log.objects.create(
            event_type="LOGIN",
            sender="user1",
            receiver="system"
        )

        self.assertTrue(log.success)
        self.assertEqual(
            str(log),
            "LOGIN from user1 to system"
        )
