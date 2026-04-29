from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from user_messages.models import Conversation, Message

User = get_user_model()


class ConversationTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user1 = User.objects.create_user(username="user1", password="pass")
        self.user2 = User.objects.create_user(username="user2", password="pass")

        self.conversation = Conversation.objects.create(name="Test Chat")
        self.conversation.participants.add(self.user1, self.user2)

    def test_get_conversations(self):
        self.client.login(username="user1", password="pass")

        response = self.client.get("/api/conversations/")

        self.assertEqual(response.status_code, 200)


class MessageTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(username="user", password="pass")

        self.conversation = Conversation.objects.create()
        self.conversation.participants.add(self.user)

    def test_get_messages(self):
        self.client.login(username="user", password="pass")

        response = self.client.get(f"/api/messages/{self.conversation.id}/")

        self.assertEqual(response.status_code, 200)

    def test_send_message(self):
        self.client.login(username="user", password="pass")

        response = self.client.post(
            f"/api/messages/{self.conversation.id}/create/",
            {"content": "Hello"}
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Message.objects.count(), 1)

    def test_send_empty_message(self):
        self.client.login(username="user", password="pass")

        response = self.client.post(
            f"/api/messages/{self.conversation.id}/create/",
            {"content": ""}
        )

        self.assertEqual(response.status_code, 400)


class ConversationCreateTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="user", password="pass")

    def test_create_conversation(self):
        self.client.login(username="user", password="pass")

        response = self.client.post("/api/conversations/create/", {
            "name": "New Chat",
            "participants": []
        })

        self.assertEqual(response.status_code, 201)


class MemberManagementTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user1 = User.objects.create_user(username="user1", password="pass")
        self.user2 = User.objects.create_user(username="user2", password="pass")

        self.conversation = Conversation.objects.create()
        self.conversation.participants.add(self.user1)

    def test_add_member(self):
        self.client.login(username="user1", password="pass")

        response = self.client.post(
            f"/api/conversations/{self.conversation.id}/add/",
            {"username": "user2"}
        )

        self.assertEqual(response.status_code, 200)

    def test_remove_member(self):
        self.conversation.participants.add(self.user2)
        self.client.login(username="user1", password="pass")

        response = self.client.post(
            f"/api/conversations/{self.conversation.id}/remove/",
            {"userId": self.user2.id}
        )

        self.assertEqual(response.status_code, 200)


class LogTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.admin = User.objects.create_user(
            username="admin",
            password="pass",
            is_staff=True
        )

    def test_logs_admin_only(self):
        self.client.login(username="admin", password="pass")

        response = self.client.get("/api/logs/")

        self.assertEqual(response.status_code, 200)


class CurrentUserTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="user", password="pass")

    def test_get_current_user(self):
        self.client.login(username="user", password="pass")

        response = self.client.get("/api/me/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["username"], "user")
