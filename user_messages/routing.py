from django.urls import re_path
from . import consumers

#Creates websocket url patterns for conversations

websocket_urlpatterns = [
    # The path name
    re_path(r'ws/conversation/(?P<conversation_id>[0-9a-f-]+)/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/conversations/$', consumers.ConversationConsumer.as_asgi()),
]