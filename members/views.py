from django.http import HttpResponse
from django.template import loader

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

def main(request):
    template = loader.get_template('main.html')
    return HttpResponse(template.render())

def members(request):
    mymembers = Member.objects.all().values()
    template = loader.get_template('allMembers.html')
    context = {
        'mymembers': mymembers
    }
    return HttpResponse(template.render(context, request))


def detail(request, id):
    member = Member.objects.get(id=id)
    template = loader.get_template('memberDetails.html')
    context = {
        'member': member
    }
    return HttpResponse(template.render(context, request))

def login_view(request):
    if request.method == "POST":
        email = request.POST["email"]
        password = request.POST["password"]

        user = authenticate(request, username = email, password = password)
        if user is not None:
            login(request, user)
            messages.success(request, f"Welcome back, {user.first_name}!")
            return render(request, "main.html", {"user": user})
        else:
            messages.error(request, "Login failed. Invalid email or password.")
            return render(request, "login.html", {})
    else:
        return render(request, 'login.html', {})

def logout_view(request):
    logout(request)
    messages.success(request, "You have been successfully logged out.")
    return redirect("/")

def register_view(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            email = form.cleaned_data["email"]
            password = form.cleaned_data["password1"]
            user = authenticate(request, username=email, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f"Welcome {user.first_name}! Your account has been created successfully.")
                return redirect("/")
            else:
                return render(request, "signup.html", {"form": form})
    else:
        form = CustomUserCreationForm()
        
    return render(request, "signup.html", {"form": form})
    
# @never_cache
def account_view(request):
    # At this point, request.user is guaranteed to be authenticated
    email = request.user.email
    return render(request, 'account.html', {"email": email})