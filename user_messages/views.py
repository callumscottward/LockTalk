from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth import get_user_model
from rest_framework import status
from .models import Message, Conversation, Log
from .serializers import ConversationSerializer
from .serializers import MessageSerializer
from .serializers import LogSerializer

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

        serializer = ConversationSerializer(conversations, many=True, context={"request": request})
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
    
class MessageCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):
        conversation = get_object_or_404(Conversation, id=conversation_id)

        if request.user not in conversation.participants.all():
            return Response({"detail": "Not a participant in this conversation."}, status=status.HTTP_403_FORBIDDEN)

        content = request.data.get("content", "").strip()
        if not content:
            return Response({"detail": "Message cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=content
        )
        Log.objects.create(
            event_type='SMS',
            sender=request.user.username,
            receiver=request.user.username,
            success=True
        )   

        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class ConversationCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        name = request.data.get("name", "")
        usernames = request.data.get("participants", [])

        participants = list(User.objects.filter(username__in=usernames))
        participants.append(request.user)

        conversation = Conversation.objects.create(
            name=name,
            moderator=request.user,
            is_group=len(participants) >= 3
        )

        conversation.participants.add(*participants)

        serializer = ConversationSerializer(conversation)
        return Response(serializer.data, status=201)
    
class LogListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logs = Log.objects.all().order_by('-timestamp')  # newest first
        serializer = LogSerializer(logs, many=True)
        return Response(serializer.data)