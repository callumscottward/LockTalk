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

class member_detail_api(APIView):
    permission_classes = [AllowAny]

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

class login_api(APIView):
    permission_classes = [AllowAny]

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
                "message": "Login successful",
                "user": {
                    "email": user.email,
                    "username": user.username
                }
            })

        Log.objects.create(
            event_type='LOGIN',
            sender=email,
            receiver='SYSTEM',
            success=False
        )

        return Response({
            "success": False,
            "message": "Invalid email or password"
        }, status=400)
    
class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

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

class register_api(APIView):
    permission_classes = [AllowAny]

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
    
class current_user_api(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({
            "id": user.id,
            "email": user.email,
            "username": user.username
        })

class UserListView(APIView):
    permission_classes = [IsAuthenticated]

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
    
class UserSearchAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get("search", "")
        users = User.objects.filter(username__icontains=query)[:10]
        data = [{"id": u.id, "username": u.username} for u in users]
        return Response(data)