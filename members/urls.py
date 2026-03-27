from django.urls import path
from .import views

# App sepcific URLS

# When you visit a url, it will reference the specific views.[function name]
urlpatterns = [
    path('api/members/details/<int:id>', views.member_detail_api.as_view(), name="member details"),
    path('api/login/', views.login_api.as_view(), name="login"),
    path('api/register/', views.register_api.as_view(), name="register"),
    path("api/me/", views.current_user_api.as_view()),
    path("api/users/", views.UserSearchAPI.as_view(), name="user-search"),
]