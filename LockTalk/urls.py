"""
URL configuration for LockTalk project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path

# Will need to include the reference to the apps url. You can also make everything in a specific app have a specific directory 
urlpatterns = [
    path('', include('members.urls')),
    path('', include('message_system.urls')),
    path('', include('user_messages.urls')),
    path('admin/', admin.site.urls),
]
