from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout

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

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(request, username=email, password=password)

        if user:
            login(request, user)
            return Response({
                "success": True,
                "message": "Login successful",
                "user": {
                    "email": user.email,
                    "username": user.username
                }
            })

        return Response({
            "success": False,
            "message": "Invalid email or password"
        }, status=400)
    
class LogoutAPIView(APIView):
    def post(self, request):
        logout(request)
        return Response({"success": True})


class register_api(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        form = CustomUserCreationForm(request.data)

        if form.is_valid():
            user = form.save()

            email = form.cleaned_data["email"]
            password = form.cleaned_data["password1"]

            user = authenticate(request, username=email, password=password)

            if user is not None:
                login(request, user)

                return Response({
                    "success": True,
                    "message": "Account created successfully"
                })

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