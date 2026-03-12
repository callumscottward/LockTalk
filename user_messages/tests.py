from django.test import TestCase
from user_messages.models import User_Messages

class MessageTest(TestCase):
    def test_message_creation(self):
        msg = User_Messages.objects.create(message="Hello")
        self.assertEqual(msg.message, "Hello")