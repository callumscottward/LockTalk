from django.test import TestCase
from members.forms import CustomUserCreationForm
from django.contrib.auth.models import User

## @file test_forms.py
#  @brief Unit tests for CustomUserCreationForm.
#
#  This file contains test cases to verify:
#  - Valid form submission
#  - Password mismatch validation
#  - Required field validation
#  - Proper user creation and database persistence


## @class CustomUserCreationFormTest
#  @brief Test suite for the CustomUserCreationForm.
#
#  This class ensures the form behaves correctly under various conditions,
#  including valid input, invalid input, and saving users.
class CustomUserCreationFormTest(TestCase):

    ## @brief Tests that the form is valid with correct input data.
    #  @return None
    #
    #  Verifies that a properly filled form passes validation.
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

    ## @brief Tests that the form fails when passwords do not match.
    #  @return None
    #
    #  Ensures validation catches mismatched password fields.
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

    ## @brief Tests that required fields are enforced.
    #  @return None
    #
    #  Ensures the form is invalid when required fields are missing.
    def test_missing_required_fields(self):
        form = CustomUserCreationForm(data={})

        self.assertFalse(form.is_valid())
        self.assertIn("email", form.errors)
        self.assertIn("first_name", form.errors)

    ## @brief Tests that saving the form creates a valid user.
    #  @return None
    #
    #  Verifies:
    #  - User fields are correctly assigned
    #  - User is saved to the database
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
