from django.urls import path
from .import views
from .views import ConversationListView, MessageListView, MessageCreateView, AddMemberView, RemoveMemberView

# App sepcific URLS

# When you visit a url, it will reference the specific views.[function name]
urlpatterns = [
    path("dashboard/", ConversationListView.as_view()),
    path("dashboard/<uuid:id>/messages/", MessageListView.as_view()),
    path("dashboard/<uuid:conversation_id>/messages/create/", MessageCreateView.as_view(), name="message-create"),
    path('api/logs/', views.LogListView.as_view(), name='logs-list'),
    path("api/conversations/<uuid:conversation_id>/members/add/", AddMemberView.as_view()),
    path("api/conversations/<uuid:conversation_id>/members/remove/", RemoveMemberView.as_view()),
]