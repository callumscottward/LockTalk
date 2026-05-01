from django.test import TestCase
from django.contrib.auth import get_user_model
from user_messages.models import Conversation, Message, Log

User = get_user_model()


## @class ConversationTest
# @brief Tests Conversation model creation and defaults
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

    ## @brief Tests creating a conversation with participants
    #  @details Ensures conversation fields and relationships are correctly saved
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

    ## @brief Tests default values for Conversation model
    #  @details Ensures defaults such as is_group and latestUpdate are set correctly
    def test_default_values(self):
        conversation = Conversation.objects.create()

        self.assertFalse(conversation.is_group)
        self.assertIsNotNone(conversation.latestUpdate)

    ## @brief Tests retention_days field
    #  @details Ensures retention policy value is stored correctly
    def test_retention_days(self):
        conversation = Conversation.objects.create(
            retention_days=30
        )

        self.assertEqual(conversation.retention_days, 30)


## @class MessageTest
# @brief Tests Message model creation and behavior
class MessageTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="password"
        )

        self.conversation = Conversation.objects.create()
        self.conversation.participants.add(self.user)

    ## @brief Tests creating a normal message
    #  @details Ensures message content, sender, and timestamps are correct
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

    ## @brief Tests message type assignment
    #  @details Ensures system message type is stored correctly
    def test_message_type(self):
        message = Message.objects.create(
            conversation=self.conversation,
            sender=self.user,
            content="System message",
            message_type=Message.MessageType.SYSTEM
        )

        self.assertEqual(message.message_type, "system")


## @class LogTest
# @brief Tests Log model creation and string representation
class LogTest(TestCase):

    ## @brief Tests log entry creation
    #  @details Ensures log success flag and string formatting are correct
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
