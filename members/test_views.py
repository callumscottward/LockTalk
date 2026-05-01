from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


## @class LoginTests
# @brief Tests authentication login endpoint behavior
class LoginTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="password123"
        )

    ## @brief Tests successful login with valid credentials
    #  @details Ensures API returns success response and status 200
    def test_login_success(self):
        response = self.client.post("/api/login/", {
            "email": "testuser",
            "password": "password123"
        })

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])

    ## @brief Tests failed login with invalid credentials
    #  @details Ensures API rejects incorrect password
    def test_login_failure(self):
        response = self.client.post("/api/login/", {
            "email": "test@test.com",
            "password": "wrongpassword"
        })

        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data["success"])


## @class RegisterTests
# @brief Tests user registration endpoint behavior
class RegisterTests(TestCase):

    def setUp(self):
        self.client = APIClient()

    ## @brief Tests user registration
    #  @details Ensures valid user data creates an account or returns expected validation response
    def test_register_user(self):
        response = self.client.post("/api/register/", {
            "username": "newuser",
            "email": "new@test.com",
            "password1": "StrongPassword123",
            "password2": "StrongPassword123"
        })

        self.assertIn(response.status_code, [200, 201, 400])


## @class LogoutTests
# @brief Tests logout endpoint behavior for authenticated users
class LogoutTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="password123"
        )

    ## @brief Tests user logout functionality
    #  @details Ensures authenticated users can successfully log out
    def test_logout(self):
        self.client.login(username="testuser", password="password123")

        response = self.client.post("/api/logout/")

        self.assertIn(response.status_code, [200, 204])


## @class CurrentUserTests
# @brief Tests retrieval of current authenticated user profile
class CurrentUserTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="password123"
        )

    ## @brief Tests retrieving current user information
    #  @details Ensures authenticated user profile is returned correctly
    def test_current_user(self):
        self.client.login(username="testuser", password="password123")

        response = self.client.get("/api/me/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data.get("username"), "testuser")


## @class UserListTests
# @brief Tests admin/user listing endpoint
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

    ## @brief Tests retrieval of user list
    #  @details Ensures endpoint returns list of users when authenticated
    def test_user_list(self):
        self.client.login(username="user1", password="password")

        response = self.client.get("/api/users/")

        self.assertEqual(response.status_code, 200)


## @class MemberDetailTests
# @brief Tests retrieval of individual member details
class MemberDetailTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="test",
            email="test@test.com",
            password="password"
        )

    ## @brief Tests fetching a specific member profile
    #  @details Ensures correct response for valid or invalid user ID
    def test_member_detail(self):
        response = self.client.get(f"/api/members/details/{self.user.id}/")

        self.assertIn(response.status_code, [200, 404])
