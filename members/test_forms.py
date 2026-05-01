from django.test import TestCase
from members.forms import CustomUserCreationForm
from django.contrib.auth.models import User


## @class CustomUserCreationFormTest
# @brief Tests custom user registration form validation and user creation
class CustomUserCreationFormTest(TestCase):

    ## @brief Tests valid form submission
    #  @details Ensures form accepts valid user input and passes validation
    def test_valid_form(self):
        form_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@test.com",
            "password1": "StrongPassword123",
            "password2": "StrongPassword123"
        }

        form = CustomUserCreationForm(data=form_data)

        self.assertTrue(form.is_valid())

    ## @brief Tests password mismatch validation
    #  @details Ensures form rejects mismatched passwords and returns error on password2
    def test_password_mismatch(self):
        form_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@test.com",
            "password1": "password123",
            "password2": "differentpassword"
        }

        form = CustomUserCreationForm(data=form_data)

        self.assertFalse(form.is_valid())
        self.assertIn("password2", form.errors)

    ## @brief Tests required field validation
    #  @details Ensures missing required fields cause form validation to fail
    def test_missing_required_fields(self):
        form = CustomUserCreationForm(data={})

        self.assertFalse(form.is_valid())
        self.assertIn("email", form.errors)
        self.assertIn("first_name", form.errors)

    ## @brief Tests saving a valid form creates a user
    #  @details Ensures form.save() correctly creates and stores a user in the database
    def test_save_creates_user(self):
        form_data = {
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane@test.com",
            "password1": "StrongPassword123",
            "password2": "StrongPassword123"
        }

        form = CustomUserCreationForm(data=form_data)

        self.assertTrue(form.is_valid())

        user = form.save()

        self.assertEqual(user.username, "jane@test.com")
        self.assertEqual(user.email, "jane@test.com")
        self.assertEqual(user.first_name, "Jane")
        self.assertEqual(user.last_name, "Doe")

        # Ensure user exists in DB
        self.assertTrue(User.objects.filter(email="jane@test.com").exists())
