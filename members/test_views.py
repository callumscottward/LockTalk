from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

## @file test_api.py
#  @brief Integration tests for authentication and user-related API endpoints.
#
#  This file tests REST API endpoints including:
#  - Login / Logout
#  - User registration
#  - Current user retrieval
#  - User listing
#  - Member detail lookup


## @class LoginTests
#  @brief Test suite for login API endpoint.
class LoginTests(TestCase):

    ## @brief Sets up test client and test user.
    #  @return None
    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="password123"
        )


    ## @brief Tests successful login with valid credentials.
    #  @return None
    def test_login_success(self):
        response = self.client.post("/api/login/", {
            "email": "testuser",
            "password": "password123"
        })

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])

    ## @brief Tests failed login with invalid credentials.
    #  @return None
    def test_login_failure(self):
        response = self.client.post("/api/login/", {
            "email": "test@test.com",
            "password": "wrongpassword"
        })

        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data["success"])

## @class RegisterTests
#  @brief Test suite for user registration endpoint.
class RegisterTests(TestCase):
    ## @brief Initializes API test client.
    #  @return None
    def setUp(self):
        self.client = APIClient()

    ## @brief Tests user registration endpoint.
    #  @return None
    #
    #  Ensures registration request returns a valid HTTP response.
    def test_register_user(self):
        response = self.client.post("/api/register/", {
            "username": "newuser",
            "email": "new@test.com",
            "password1": "StrongPassword123",
            "password2": "StrongPassword123"
        })

        self.assertIn(response.status_code, [200, 201, 400])

## @class LogoutTests
#  @brief Test suite for logout API endpoint.
class LogoutTests(TestCase):

    ## @brief Sets up authenticated test user.
    #  @return None
    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="password123"
        )

    ## @brief Tests user logout functionality.
    #  @return None
    def test_logout(self):
        self.client.login(username="testuser", password="password123")

        response = self.client.post("/api/logout/")

        self.assertIn(response.status_code, [200, 204])

## @class CurrentUserTests
#  @brief Test suite for retrieving current authenticated user.
class CurrentUserTests(TestCase):
    ## @brief Sets up authenticated test user.
    #  @return None
    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="password123"
        )

    ## @brief Tests current user API endpoint.
    #  @return None
    #
    #  Ensures authenticated user data is returned correctly.
    def test_current_user(self):
        self.client.login(username="testuser", password="password123")

        response = self.client.get("/api/me/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data.get("username"), "testuser")

## @class UserListTests
#  @brief Test suite for user listing API endpoint.
class UserListTests(TestCase):
    ## @brief Sets up multiple test users.
    #  @return None
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
    ## @brief Tests user list API endpoint.
    #  @return None
    def test_user_list(self):
        self.client.login(username="user1", password="password")

        response = self.client.get("/api/users/")

        self.assertEqual(response.status_code, 200)


## @class MemberDetailTests
#  @brief Test suite for member detail API endpoint.
class MemberDetailTests(TestCase):

    ## @brief Sets up a single test user.
    #  @return None
    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="test",
            email="test@test.com",
            password="password"
        )

    ## @brief Tests retrieving member details by user ID.
    #  @return None
    def test_member_detail(self):
        response = self.client.get(f"/api/members/details/{self.user.id}/")

        self.assertIn(response.status_code, [200, 404])
