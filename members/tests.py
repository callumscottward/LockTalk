from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.urls import reverse
from user_messages.models import Log

User = get_user_model()


class AuthTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="password123"
        )


    def test_login_success(self):
        response = self.client.post("/api/login/", {
            "email": "testuser",
            "password": "password123"
        })

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])


    def test_login_failure(self):
        response = self.client.post("/api/login/", {
            "email": "testuser",
            "password": "wrongpassword"
        })

        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data["success"])


    def test_logout(self):
        self.client.login(username="testuser", password="password123")

        response = self.client.post("/api/logout/")

        self.assertEqual(response.status_code, 200)


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

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])


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

        self.user = User.objects.create_user(
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
        self.assertTrue(len(response.data) > 0)


    def test_user_search(self):
        self.client.login(username="user1", password="password")

        response = self.client.get("/api/users/?search=user2")

        self.assertEqual(response.status_code, 200)


class MemberDetailTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="test",
            password="password"
        )


    def test_member_detail(self):
        response = self.client.get(f"/api/member/{self.user.id}/")

        self.assertEqual(response.status_code, 200)
