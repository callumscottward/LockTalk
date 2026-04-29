from django.urls import path
from .import views
from .views import ConversationListView, MessageListView, MessageCreateView, AddMemberView, RemoveMemberView, get_current_user, all_conversations_directory, all_users_list

# App sepcific URLS

# When you visit a url, it will reference the specific views.[function name]
urlpatterns = [
    path("api/dashboard/", ConversationListView.as_view()),
    path("api/dashboard/<uuid:id>/messages/", MessageListView.as_view()),
    path("api/dashboard/<uuid:conversation_id>/messages/create/", MessageCreateView.as_view(), name="message-create"),
    path('api/logs/', views.LogListView.as_view(), name='logs-list'),
    path('api/verify-staff/', get_current_user, name='get_current_user'),
    path("api/conversations/<uuid:conversation_id>/members/add/", AddMemberView.as_view()),
    path("api/conversations/<uuid:conversation_id>/members/remove/", RemoveMemberView.as_view()),
    path('api/admin/all-conversations/', all_conversations_directory, name='all_conversations'),
    path('api/admin/all-users/', all_users_list, name='all_users_list'),
]