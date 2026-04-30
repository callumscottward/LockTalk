from django.test import TestCase
from django.contrib.auth import get_user_model
from user_messages.models import Conversation, Message, Log

## @file test_models.py
#  @brief Unit tests for messaging system database models.
#
#  Covers:
#  - Conversation model behavior and defaults
#  - Message creation and type handling
#  - Log creation and string representation

User = get_user_model()

## @class ConversationTest
#  @brief Tests for Conversation model behavior.
class ConversationTest(TestCase):
    ## @brief Creates test users.
    def setUp(self):
        self.user1 = User.objects.create_user(
            username="user1",
            password="password"
        )

        self.user2 = User.objects.create_user(
            username="user2",
            password="password"
        )

    ## @brief Validates conversation creation and participant handling.
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

    ## @brief Ensures default field values are set correctly.
    def test_default_values(self):
        conversation = Conversation.objects.create()

        self.assertFalse(conversation.is_group)
        self.assertIsNotNone(conversation.latestUpdate)

    ## @brief Validates retention_days field storage.
    def test_retention_days(self):
        conversation = Conversation.objects.create(
            retention_days=30
        )

        self.assertEqual(conversation.retention_days, 30)

## @class MessageTest
#  @brief Tests for Message model behavior.
class MessageTest(TestCase):

    ## @brief Sets up a user and conversation.
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="password"
        )

        self.conversation = Conversation.objects.create()
        self.conversation.participants.add(self.user)

    ## @brief Validates basic message creation.
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

    ## @brief Validates message type assignment.
    def test_message_type(self):
        message = Message.objects.create(
            conversation=self.conversation,
            sender=self.user,
            content="System message",
            message_type=Message.MessageType.SYSTEM
        )

        self.assertEqual(message.message_type, "system")

## @class LogTest
#  @brief Tests for Log model behavior.
class LogTest(TestCase):

    ## @brief Ensures log creation and string output are correct.
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
