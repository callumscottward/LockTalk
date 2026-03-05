from django.urls import path
from .import views

# App sepcific URLS

# When you visit a url, it will reference the specific views.[function name]
urlpatterns = [
    path('api/members/', views.members_api, name='members'),
    path('api/members/details/<int:id>', views.member_detail_api, name="member details"),
    path('api/login/', views.login_api, name="login"),
    path('api/register/', views.register_api, name="register"),
]