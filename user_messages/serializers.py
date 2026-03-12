from rest_framework import serializers
from .models import Conversation, Message

class MessageSerializer(serializers.ModelSerializer):
    # We want the sender's username, not their ID number
    sender = serializers.ReadOnlyField(source='sender.username')
    sender_email = serializers.EmailField(source='sender.email', read_only=True)

    class Meta:
        model = Message
        fields = ["id", "sender", "content", "created_at", "sender_email"]

class ConversationSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    last_msg = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ["id", "name", "is_group", "last_msg", "time"]

    def get_name(self, obj):
        if obj.is_group:
            return obj.name or f"Group {obj.id.hex[:4]}"
        
        # Safe check for request context
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return "Private Chat"

        # Find the person who isn't the current user
        other = obj.participants.exclude(id=request.user.id).first()
        return other.username if other else "Unknown User"
        #return other.name if other else "Unknown User"

    def get_last_msg(self, obj):
        # We use .content because that's what is in your Message model
        last = obj.messages.order_by("-created_at").first()
        return last.content if last else ""

    def get_time(self, obj):
        # We use .created_at because that's what is in your Message model
        last = obj.messages.order_by("-created_at").first()
        return last.created_at if last else None