from django.urls import path
from .import views
from .views import ConversationListView, MessageListView, MessageCreateView

# App sepcific URLS

# When you visit a url, it will reference the specific views.[function name]
urlpatterns = [
    path("dashboard/", ConversationListView.as_view()),
    path("dashboard/<uuid:id>/messages/", MessageListView.as_view()),
    path("dashboard/<uuid:conversation_id>/messages/create/", MessageCreateView.as_view(), name="message-create"),
]