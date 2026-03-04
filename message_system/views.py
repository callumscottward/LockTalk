from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth import get_user_model
from .models import Message, Conversation
from .serializers import ConversationSerializer
from .serializers import MessageSerializer

User = get_user_model()

class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        conversations = Conversation.objects.filter(participants=user)

        # Optional filters
        chat_type = request.query_params.get("type")
        username = request.query_params.get("username")

        if chat_type == "group":
            conversations = conversations.filter(is_group=True)
        elif chat_type == "direct":
            conversations = conversations.filter(is_group=False)

        if username:
            other_user = User.objects.filter(username=username).first()
            if other_user:
                conversations = conversations.filter(participants=other_user)

        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data)

class MessageListView(ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs["id"]
        user = self.request.user

        conversation = Conversation.objects.filter(id=conversation_id).first()

        if not conversation:
            return Message.objects.none()

        if user not in conversation.participants.all():
            raise PermissionDenied("You are not part of this conversation.")

        return conversation.messages.all()