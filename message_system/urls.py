from django.urls import path
from .import views
from .views import ConversationListView, MessageListView

# App sepcific URLS

# When you visit a url, it will reference the specific views.[function name]
urlpatterns = [
    path("conversations/", ConversationListView.as_view()),
    path("conversations/<uuid:id>/messages/", MessageListView.as_view()),
]