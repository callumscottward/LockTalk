from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from user_messages.models import Log
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.utils.decorators import method_decorator

from django_ratelimit.decorators import ratelimit

from .forms import CustomUserCreationForm
from .models import UserKemKey

## @file views.py
#  @brief API views for user management and authentication.
#
#  This file includes endpoints for:
#  - User login/logout/registration
#  - Retrieving user details
#  - Searching users
#  - Managing KEM public keys
#  - Listing users


## @class member_detail_api
# @brief creates API views for member detail, login, logout, register, current user, user list, user search
# @details retrieves details by user id
class member_detail_api(APIView):
    permission_classes = [AllowAny]

    ## @brief Handles POST request for user login.
    #  @param request The request object containing email and password
    #  @return Response indicating success or failure of login attempt

    def get(self, request, id):
        try:
            member = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response({"error": "Member not found"}, status=404)

        return Response({
            "id": member.id,
            "firstName": member.first_name,
            "lastName": member.last_name
        })

## @class login_api
# @brief creates api view for login page
# @details handles user authentication
class login_api(APIView):
    permission_classes = [AllowAny]

    ## @brief Handles POST request for user login.
    #  @param request The request object containing email and password.
    #  @return Response indicating success or failure of login attempt.
    @method_decorator(ratelimit(key='ip', rate='2/m', block=False))
    @method_decorator(ratelimit(key='post:email', rate='2/m', block=False))
    def post(self, request):
        if getattr(request, "limited", False):
            return Response({"error": "Too many attempts"}, status=429)

        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(request, username=email, password=password)

        if user:
            login(request, user)
            Log.objects.create(
                event_type='LOGIN',
                sender=user.username,
                receiver='SYSTEM',
                success=True
            )
            return Response({
                "success": True,
                "user": {
                    "email": user.email,
                    "username": user.username
                }
            })

        
        Log.objects.create(
            event_type='LOGIN',
            sender=email or "UNKNOWN",
            receiver='SYSTEM',
            success=False
        )

        return Response({
            "success": False,
            "message": "Invalid email or password"
        }, status=400)
    
## @class LogoutAPIView
# @brief creates API view for logout
# @details handles user logout
class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    ## @brief Logs out the currently authenticated user.
    #  @param request The request object.
    #  @return Response confirming logout.
    def post(self, request):
        user_email = request.user.email

        logout(request)
        Log.objects.create(
                event_type='LOGOUT',
                sender=user_email,
                receiver='SYSTEM',
                success=True
            )
        return Response({"message": "Logged out successfully"})

## @class current_user_api
# @brief creates register api view
# @details handles user registration
class register_api(APIView):
    permission_classes = [AllowAny]

    ## @brief Handles POST request to register a new user.
    #  @param request The request object containing registration data.
    #  @return Response indicating success or failure of registration.
    def post(self, request):

        form = CustomUserCreationForm(request.data)

        if form.is_valid():
            user = form.save()

            email = form.cleaned_data["email"]
            password = form.cleaned_data["password1"]

# Log successful registration
            Log.objects.create(
                event_type='REGISTER',
                sender='SYSTEM',       # system-created event
                receiver=user.username, # the newly created user                    success=True
            )

            user = authenticate(request, username=email, password=password)

            if user is not None:
                login(request, user)

                return Response({
                    "success": True,
                    "message": "Account created successfully"
                })
            else:
                Log.objects.create(
                    event_type='REGISTER',
                    sender='SYSTEM',
                    receiver=user.username,
                    success=False
                )

            return Response({
                "success": False,
                "message": "Authentication failed after registration"
            }, status=400)

        return Response({
            "success": False,
            "errors": form.errors
        }, status=400)
    
## @class current_user_api
# @brief creates current user api view
# @details retrieves 
class current_user_api(APIView):
    permission_classes = [IsAuthenticated]

    ## @brief Handles GET request to retrieve current user info.
    #  @param request The request object.
    #  @return Response containing current user details.
    def get(self, request):
        user = request.user

        return Response({
            "id": user.id,
            "email": user.email,
            "username": user.username
        })

## @class save_my_kem_public_key_api
# @brief creates api view for users public kem key
# @details saves or updates the user's public kem key
class save_my_kem_public_key_api(APIView):
    permission_classes = [IsAuthenticated]

    ## @brief Handles POST request to store user's public key.
    #  @param request The request object containing public_key.
    #  @return Response indicating success or validation error.
    def post(self, request):
        public_key = request.data.get("public_key")

        if not isinstance(public_key, list):
            return Response({"error": "public_key must be a list"}, status=400)

        UserKemKey.objects.update_or_create(
            user=request.user,
            defaults={"public_key": public_key}
        )

        return Response({
            "message": "Public key saved successfully"
        })


## @class UserListView
# @brief creates an api view for the user list
# @details retrieves a list of users with optional search filtering
class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    ## @brief Handles GET request to list users.
    #  @param request The request object.
    #  @param[in] search (Query Param) Optional username filter.
    #  @return Response containing list of users.
    def get(self, request):
        query = request.GET.get("search", "")

        users = User.objects.exclude(id=request.user.id)

        if query:
            users = users.filter(username__icontains=query)

        data = [
            {
                "id": user.id,
                "username": user.username,
                "name": f"{user.first_name} {user.last_name}"
            }
            for user in users
        ]

        return Response(data)
    
## @class UserSearchAPI
# @brief creates an api view for user search
# @details provides a limited user serch endpoint
class UserSearchAPI(APIView):
    permission_classes = [IsAuthenticated]

    ## @brief Handles GET request to search users (limited results).
    #  @param request The request object.
    #  @param[in] search (Query Param) Username search string.
    #  @return Response containing up to 10 matching users.
    def get(self, request):
        query = request.GET.get("search", "")
        users = User.objects.filter(username__icontains=query)[:10]
        data = [{"id": u.id, "username": u.username} for u in users]
        return Response(data)

## @class user_public_key_api
# @brief creates an api view for the public kem key
# @details retrieves an user's public KEM key
class user_public_key_api(APIView):
    permission_classes = [IsAuthenticated]

     ## @brief Handles GET request to fetch a user's public key.
    #  @param request The request object.
    #  @param id The ID of the user.
    #  @return Response containing the public key or 404 if not found.
    def get(self, request, id):
        try:
            key = UserKemKey.objects.get(user_id=id)
        except UserKemKey.DoesNotExist:
            return Response({"error": "No public KEM key found"}, status=404)

        return Response({
            "public_key": key.public_key
        })
