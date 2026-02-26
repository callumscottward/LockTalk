from django.urls import path
from .import views

# App sepcific URLS

# When you visit a url, it will reference the specific views.[function name]
urlpatterns = [
    path('', views.login_view, name='login'),
    path('main/', views.main, name='main'),
    path('members/', views.members, name='members'),
    path('members/details/<int:id>', views.detail, name="details"),
    path('login/', views.login_view, name="login"),

]