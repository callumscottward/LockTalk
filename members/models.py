from django.db import models

from user_messages.consumers import User
from user_messages.models import Conversation

## @class UserKemKey
# @brief Defines a database table to store encryption keys for users
class UserKemKey(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="kem_key"
    )
    public_key = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
