from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # The path name
    re_path(r'ws/conversation/(?P<conversation_id>\d+)/$', consumers.ChatConsumer.as_asgi()),
]