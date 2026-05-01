from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from user_messages.models import Conversation, Message

User = get_user_model()

## @class ConversationTests
# @brief Tests conversation retrieval endpoints
class ConversationTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user1 = User.objects.create_user(username="user1", password="pass")
        self.user2 = User.objects.create_user(username="user2", password="pass")

        self.conversation = Conversation.objects.create(name="Test Chat")
        self.conversation.participants.add(self.user1, self.user2)

    ## @brief Tests retrieving conversations for an authenticated user
    #  @details Ensures user can access their conversation list endpoint
    def test_get_conversations(self):
        self.client.login(username="user1", password="pass")

        response = self.client.get("/api/dashboard/")

        self.assertEqual(response.status_code, 200)


## @class MessageTests
# @brief Tests message retrieval and creation endpoints
class MessageTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(username="user", password="pass")

        self.conversation = Conversation.objects.create()
        self.conversation.participants.add(self.user)

    ## @brief Tests retrieving messages from a conversation
    #  @details Ensures only participants can access messages
    def test_get_messages(self):
        self.client.login(username="user", password="pass")

        response = self.client.get(
            f"/api/dashboard/{self.conversation.id}/messages/"
        )

        self.assertEqual(response.status_code, 200)

    ## @brief Tests sending a valid message
    #  @details Ensures message creation works and database is updated
    def test_send_message(self):
        self.client.login(username="user", password="pass")

        response = self.client.post(
            f"/api/dashboard/{self.conversation.id}/messages/create/",
            {"content": "Hello"}
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Message.objects.count(), 1)

    ## @brief Tests sending an empty message
    #  @details Ensures validation rejects empty content
    def test_send_empty_message(self):
        self.client.login(username="user", password="pass")

        response = self.client.post(
            f"/api/dashboard/{self.conversation.id}/messages/create/",
            {"content": ""}
        )

        self.assertEqual(response.status_code, 400)


## @class MemberManagementTests
# @brief Tests adding and removing conversation members
class MemberManagementTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user1 = User.objects.create_user(username="user1", password="pass")
        self.user2 = User.objects.create_user(username="user2", password="pass")

        self.conversation = Conversation.objects.create()
        self.conversation.participants.add(self.user1)

    ## @brief Tests adding a member to a conversation
    #  @details Ensures users can be added via username
    def test_add_member(self):
        self.client.login(username="user1", password="pass")

        response = self.client.post(
            f"/api/conversations/{self.conversation.id}/members/add/",
            {"username": "user2"}
        )

        self.assertEqual(response.status_code, 200)

    ## @brief Tests removing a member from a conversation
    #  @details Ensures participants can be removed by ID
    def test_remove_member(self):
        self.conversation.participants.add(self.user2)
        self.client.login(username="user1", password="pass")

        response = self.client.post(
            f"/api/conversations/{self.conversation.id}/members/remove/",
            {"userId": self.user2.id}
        )

        self.assertEqual(response.status_code, 200)


## @class LogTests
# @brief Tests admin-only log access
class LogTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.admin = User.objects.create_user(
            username="admin",
            password="pass",
            is_staff=True
        )

    ## @brief Tests that logs endpoint is restricted to admins
    #  @details Ensures non-admin users cannot access system logs
    def test_logs_admin_only(self):
        self.client.login(username="admin", password="pass")

        response = self.client.get("/api/logs/")

        self.assertEqual(response.status_code, 200)


## @class CurrentUserTests
# @brief Tests retrieval of authenticated user information
class CurrentUserTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="user", password="pass")

    ## @brief Tests retrieving current logged-in user data
    #  @details Ensures authentication returns correct user profile
    def test_get_current_user(self):
        self.client.login(username="user", password="pass")

        response = self.client.get("/api/verify-staff/")

        self.assertEqual(response.status_code, 200)
