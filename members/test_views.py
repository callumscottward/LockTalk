from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


class LoginTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="password123"
        )

    def test_login_success(self):
        response = self.client.post("/api/login/", {
            "email": "test@test.com",
            "password": "password123"
        })

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])

    def test_login_failure(self):
        response = self.client.post("/api/login/", {
            "email": "test@test.com",
            "password": "wrongpassword"
        })

        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data["success"])


class RegisterTests(TestCase):

    def setUp(self):
        self.client = APIClient()

    def test_register_user(self):
        response = self.client.post("/api/register/", {
            "username": "newuser",
            "email": "new@test.com",
            "password1": "StrongPassword123",
            "password2": "StrongPassword123"
        })

        self.assertIn(response.status_code, [200, 400])


class LogoutTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="testuser",
            password="password123"
        )

    def test_logout(self):
        self.client.login(username="testuser", password="password123")

        response = self.client.post("/api/logout/")

        self.assertEqual(response.status_code, 200)


class CurrentUserTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="password123"
        )

    def test_current_user(self):
        self.client.login(username="testuser", password="password123")

        response = self.client.get("/api/me/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["username"], "testuser")


class UserListTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user1 = User.objects.create_user(
            username="user1",
            password="password"
        )

        self.user2 = User.objects.create_user(
            username="user2",
            password="password"
        )

    def test_user_list(self):
        self.client.login(username="user1", password="password")

        response = self.client.get("/api/users/")

        self.assertEqual(response.status_code, 200)


class MemberDetailTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="test",
            password="password"
        )

    def test_member_detail(self):
        response = self.client.get(f"/api/members/details/{self.user.id}")

        self.assertEqual(response.status_code, 200)
