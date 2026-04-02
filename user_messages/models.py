from django.db import models
from django.conf import settings
import uuid
from django.utils import timezone

class Conversation(models.Model):
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


class Message(models.Model):
    class MessageType(models.TextChoices):
        NORMAL = "normal", "Normal"
        SYSTEM = "system", "System"
        IMAGE = "image", "Image"

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

class Log(models.Model):
    EVENT_CHOICES = [
        ('SMS', 'SMS'),
        ('LOGIN', 'Login'),
        ('REGISTER', 'Register')
    ]

    event_type = models.CharField(max_length=50, choices=EVENT_CHOICES)
    sender = models.CharField(max_length=255)
    receiver = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    success = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.event_type} from {self.sender} to {self.receiver}"