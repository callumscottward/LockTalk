from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework import generics, permissions
from django.contrib.auth import get_user_model
from rest_framework import status
from .models import Message, Conversation, Log
from .serializers import ConversationSerializer
from .serializers import CurrentUserSerializer
from .serializers import MessageSerializer
from .serializers import LogSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser

User = get_user_model()

## @class ConversationListView
# @brief View to list all the users conversations
# @details Can support filtering by group / direct or username
class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]
    
    ## @brief Handles get requests to retrieve conversations.
    #  @param request object is called.
    #  @param[in] type (Query Param) Filter by 'group' or 'direct'.
    #  @param[in] username (Query Param) Filter by a specific participant's username.
    #  @return Response object containing serialized conversation data.
    def get(self, request):
        user = request.user

        conversations = Conversation.objects.filter(participants=user)

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

## @class MessageListView
# @brief Provides a list of messages for a specific conversation if not denied
class MessageListView(ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    ## @brief Retrieves the queryset of messages for the given conversation ID.
    #  @exception PermissionDenied if the user is not a participant.
    #  @return A queryset of Message objects or an empty queryset if not found.
    def get_queryset(self):
        conversation_id = self.kwargs["id"]
        user = self.request.user

        conversation = Conversation.objects.filter(id=conversation_id).first()

        if not conversation:
            return Message.objects.none()

        if user not in conversation.participants.all():
            raise PermissionDenied("You are not part of this conversation.")

        return conversation.messages.all()

## @class MessageCreateView
#  @brief Handles the creation of new messages within a conversation.
class MessageCreateView(APIView):
    permission_classes = [IsAuthenticated]


    ## @brief post method to create a message.
    #  @param request The request object.
    #  @param conversation_id The ID of the conversation to post to.
    #  @return HTTP_201_CREATED Created on success, HTTP_400_BAD_REQUEST if empty, HTTP_403_FORBIDDEN if unauthorized.
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
    
class AddMemberView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):
        conversation = get_object_or_404(Conversation, id=conversation_id)

        username = request.data.get("username")
        if not username:
            return Response({"error": "username required"}, status=400)

        user = get_object_or_404(User, username=username)

        if conversation.participants.filter(id=user.id).exists():
            return Response({"message": "already a member"}, status=200)

        conversation.participants.add(user)
        conversation.refresh_from_db()

        return Response(
            ConversationSerializer(conversation, context={"request": request}).data,
            status=200
        )

class RemoveMemberView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):
        conversation = get_object_or_404(Conversation, id=conversation_id)

        user_id = request.data.get("userId")
        if not user_id:
            return Response({"error": "userId required"}, status=400)

        user = get_object_or_404(User, id=user_id)

        # only remove if they exist
        if not conversation.participants.filter(id=user.id).exists():
            return Response({"error": "User not in conversation"}, status=400)

        conversation.participants.remove(user)
        conversation.refresh_from_db()

        return Response(
            ConversationSerializer(conversation, context={"request": request}).data,
            status=200
        )


class LogListView(APIView):
    # Changed from IsAuthenticated so admins can only see the logs even fetching them
    permission_classes = [IsAdminUser]

    def get(self, request):
        logs = Log.objects.all().order_by('-timestamp')  # newest first
        serializer = LogSerializer(logs, many=True)
        return Response(serializer.data)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    # This uses the UserSerializer you modified with 'is_staff'
    serializer = CurrentUserSerializer(request.user)
    return Response(serializer.data)

# Admins use this to get all the conversations (for chatDirectory)
@api_view(['GET'])
@permission_classes([IsAdminUser])
def all_conversations_directory(request):
    conversations = Conversation.objects.all()
    serializer = ConversationSerializer(conversations, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def all_users_list(request):
    users = User.objects.all().order_by('-date_joined')
    data = [{
        "id": u.id,
        "username": u.username,
        "email": u.email,
        "is_staff": u.is_staff,
        "is_active": u.is_active,
        "date_joined": u.date_joined
    } for u in users]

    #response
    return Response(data)