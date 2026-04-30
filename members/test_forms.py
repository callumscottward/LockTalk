from django.test import TestCase
from members.forms import CustomUserCreationForm
from django.contrib.auth.models import User

class CustomUserCreationFormTest(TestCase):

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


    def test_missing_required_fields(self):
        form = CustomUserCreationForm(data={})

        self.assertFalse(form.is_valid())
        self.assertIn("email", form.errors)
        self.assertIn("first_name", form.errors)


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
