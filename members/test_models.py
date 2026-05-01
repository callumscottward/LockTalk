from django.test import TestCase
from django.contrib.auth import get_user_model
from user_messages.models import Conversation, Message, Log

User = get_user_model()


## @class ConversationTest
# @brief Tests Conversation model behavior and defaults
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

    ## @brief Tests creation of a conversation with participants and moderator
    #  @details Ensures fields are correctly saved and relationships are set
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
    #  @details Ensures is_group defaults correctly and timestamps exist
    def test_default_values(self):
        conversation = Conversation.objects.create()

        self.assertFalse(conversation.is_group)
        self.assertIsNotNone(conversation.latestUpdate)


## @class MessageTest
# @brief Tests Message model creation and field integrity
class MessageTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="test",
            password="password"
        )

        self.conversation = Conversation.objects.create()
        self.conversation.participants.add(self.user)

    ## @brief Tests creation of a normal message
    #  @details Ensures message content, sender, and defaults are correct
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
# @brief Tests Log model creation and string representation
class LogTest(TestCase):

    ## @brief Tests creation of a system log entry
    #  @details Ensures log fields are stored correctly and __str__ output is correct
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
