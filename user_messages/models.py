from django.db import models

# Create your models here.
class User_Messages(models.Model):
    message = models.CharField(max_length=255)