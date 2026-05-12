from django.contrib.auth.models import AbstractUser
from django.db import models

USER_ROLE_CHOICES = [
    ('USER', 'User'),
    ('MODERATOR', 'Moderator'),
    ('ADMIN', 'Admin'),
]

class User(AbstractUser):
    role = models.CharField(max_length=10, choices=USER_ROLE_CHOICES, default='USER')
    is_deleted = models.BooleanField(default=False)

    class Meta:
        db_table = 'forum_user'