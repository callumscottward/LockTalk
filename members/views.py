from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from .models import Member

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
        username = request.POST["username"]
        password = request.POST["password"]

        user = authenticate(request, username = username, password = password)
        if user is not None:
            login(request, user)
            messages.success(request, f"Welcome back, {user.first_name}!")
            return redirect("/")
        else:
            messages.error(request, "Login failed. Invalid username or password.")
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
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password1"]
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f"Welcome {user.first_name}! Your account has been created successfully.")
                return redirect("/")
        else:
            return render(request, "register.html", {"form": form})
    else:
        form = CustomUserCreationForm()
        return render(request, "register.html", {"form": form})
    
@never_cache
def account_view(request):
    # At this point, request.user is guaranteed to be authenticated
    username = request.user.username
    return render(request, 'account.html', {"username": username})