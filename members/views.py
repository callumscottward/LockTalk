from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from .models import Member
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache
from .forms import CustomUserCreationForm

#The views is where you first get your .html file reference but also do any data processing and analysis

@csrf_exempt
def members_api(request):
    members = list(Member.objects.all().values())
    return JsonResponse(members)


@csrf_exempt
def member_detail_api(request, id):
    member = Member.objects.get(id=id)
    
    data = {
        "id": member.id,
        "firstName": member.firstName,
        "lastName": member.lastName,
    }

    return JsonResponse(data)

@csrf_exempt
def login_api(request):
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")

        user = authenticate(request, username = email, password = password)

        if user is not None:
            login(request, user)
            return JsonResponse({
                "success": True,
                "message": f"Welcome back, {user.first_name}!",
                "user": {
                    "email": user.email,
                    "first_name": user.first_name,
                }
            })
        else:
            return JsonResponse({
                "success": False,
                "message": "Invalid email or password."
            }, status=400)

@csrf_exempt
def logout_view(request):
    logout(request)
    return JsonResponse({"success": True})

@csrf_exempt
def register_api(request):
    if request.method != "POST":
        return JsonResponse({"message": "Invalid request method"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"message": "Invalid JSON"}, status=400)

    form = CustomUserCreationForm(data)

    if form.is_valid():
        user = form.save()

        email = form.cleaned_data["email"]
        password = form.cleaned_data["password1"]

        user = authenticate(request, username=email, password=password)

        if user is not None:
            login(request, user)

            return JsonResponse({
                "success": True,
                "message": "Account created successfully"
            })

        return JsonResponse({
            "success": False,
            "message": "Authentication failed after registration"
        }, status=400)

    return JsonResponse({
        "success": False,
        "errors": form.errors
    }, status=400)

@csrf_exempt
def current_user_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({
            "success": False,
            "message": "User not authenticated"
        }, status=401)

    user = request.user

    return JsonResponse({
        "id": user.id,
        "email": user.email,
        "username": user.username
    })