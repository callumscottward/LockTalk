from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

## @file forms.py
#  @brief Forms related to user creation and authentication.
#
#  This file defines custom forms used for:
#  - Registering new users
#  - Extending Django's default UserCreationForm

## @class CustomerUserCreationForm
# @brief Creates form for creating a new user
# @details overrides Django's default UserCreation FOrm to use email as username and require additional user info
class CustomUserCreationForm(UserCreationForm):
    #first name input field
    first_name = forms.CharField(
        max_length=30,
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'First Name'})
    )
    #last name input field
    last_name = forms.CharField(
        max_length=30,
        required=True,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Last Name'})
    )
    #email input field (used as username)
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email'})
    )
    #password input field
    password1 = forms.CharField(
        label='Password',
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Password'})
    )
    #password confirmation input field
    password2 = forms.CharField(
        label='Confirm Password',
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Confirm Password'})
    )

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'password1', 'password2')

    ## @brief Saves the new user to the database.
    #  @param commit Boolean indicating whether to save immediately to the database.
    #  @return User object that has been created and saved (if commit=True).
    #
    #  This method:
    #  - Sets the username to the user's email
    #  - Stores first name, last name, and email
    #  - Saves the user if commit is True
    def save(self, commit=True):
        user = super().save(commit=False)
        #use email as username
        user.username = self.cleaned_data['email']
        #assign additional fields
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
        return user