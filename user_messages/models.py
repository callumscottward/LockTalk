from django.db import models
from django.conf import settings
import uuid

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
