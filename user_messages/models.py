## @file models.py
#  @brief Messaging system database models.
#
#  @details Defines core messaging structures including conversations, messages, encryption keys, and system logs.

from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
import uuid
from django.utils import timezone

User = get_user_model()

## @class Conversation
#  @brief Represents a chat conversation between users.
#
#  @details Supports both direct and group chats, including moderator control, participant tracking, and update metadata.
class Conversation(models.Model):
    #conversation model defining participants, moderator, a boolean for group chat or not, the latest update, and retention days

    #Unique, randomly generated 128 but number that will be used to be more secure
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    name = models.CharField(max_length=255, blank=True)

    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="conversations"
    )

    moderator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="moderated_conversations"
    )

    is_group = models.BooleanField(default=False)

    latestUpdate = models.DateTimeField(default=timezone.now)

    retention_days = models.IntegerField(null=True, blank=True)

## @class ConversationKey
#  @brief Stores encryption keys for secure conversation messaging.
class ConversationKey(models.Model):
    #Creates keys from the conversation for encryption
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE)
    kem_ciphertext = models.JSONField()
    encrypted_conversation_key = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("conversation", "recipient")

## @class Message
#  @brief Represents a message sent inside a conversation.
class Message(models.Model):
    ## @class MessageType
    #  @brief Types of messages supported
    class MessageType(models.TextChoices):
        NORMAL = "normal", "Normal"
        SYSTEM = "system", "System"
        IMAGE = "image", "Image"

    PRIORITY_CHOICES = [
        ("normal", "Normal"),
        ("sensitive", "Sensitive"),
        ("highly_sensitive", "Highly Sensitive"),
    ]

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    content = models.TextField()

    message_type = models.CharField(
        max_length=20,
        choices=MessageType.choices,
        default=MessageType.NORMAL
    )

    created_at = models.DateTimeField(auto_now_add=True)

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default="normal"
    )

## @class Log
#  @brief Stores system audit logs for user actions.
class Log(models.Model):
    EVENT_CHOICES = [
        ('SMS', 'SMS'),
        ('LOGIN', 'Login'),
        ('REGISTER', 'Register'),
        ('DELETE_SMS', 'DELETE_SMS'),
        ('LOGOUT', 'LOGOUT'),
        ('DELETE_CONVO', 'DELETE_CONVO')
    ]

    event_type = models.CharField(max_length=50, choices=EVENT_CHOICES)
    sender = models.CharField(max_length=255)
    receiver = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    success = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.event_type} from {self.sender} to {self.receiver}"