from django.test import TestCase
from django.contrib.auth import get_user_model
from user_messages.models import Conversation, Message, Log

User = get_user_model()

## @file test_models.py
#  @brief Unit tests for Conversation, Message, and Log models.
#
#  This file verifies:
#  - Conversation creation and default values
#  - Message creation and field integrity
#  - Log creation and string representation


## @class ConversationTest
#  @brief Test suite for the Conversation model.
#
#  Tests conversation creation, participant handling,
#  and default field values.
class ConversationTest(TestCase):

    ## @brief Sets up test users for conversation tests.
    #  @return None
    def setUp(self):
        self.user1 = User.objects.create_user(
            username="user1",
            password="password"
        )

        self.user2 = User.objects.create_user(
            username="user2",
            password="password"
        )

    ## @brief Tests creating a conversation with participants.
    #  @return None
    #
    #  Verifies:
    #  - Conversation fields are correctly assigned
    #  - Participants are properly added
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

    ## @brief Tests default values of a conversation.
    #  @return None
    #
    #  Ensures:
    #  - is_group defaults to False
    #  - latestUpdate is automatically set
    def test_default_values(self):
        conversation = Conversation.objects.create()

        self.assertFalse(conversation.is_group)
        self.assertIsNotNone(conversation.latestUpdate)

## @class MessageTest
#  @brief Test suite for the Message model.
#
#  Tests message creation and field correctness.
class MessageTest(TestCase):

    ## @brief Sets up a user and conversation for message tests.
    #  @return None
    def setUp(self):
        self.user = User.objects.create_user(
            username="test",
            password="password"
        )

        self.conversation = Conversation.objects.create()
        self.conversation.participants.add(self.user)

    ## @brief Tests creating a message.
    #  @return None
    #
    #  Verifies:
    #  - Message content and sender are correct
    #  - Default message type is assigned
    #  - Timestamp is automatically set
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

## @class LogTest
#  @brief Test suite for the Log model.
#
#  Tests log creation and string representation.
class LogTest(TestCase):

    ## @brief Tests creating a log entry.
    #  @return None
    #
    #  Verifies:
    #  - Default success value is True
    #  - String representation is formatted correctly
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
