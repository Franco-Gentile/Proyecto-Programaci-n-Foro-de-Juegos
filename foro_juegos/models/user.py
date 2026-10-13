from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        MODERATOR = 'MODERATOR', 'Moderator'
        USER = 'USER', 'User'

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.USER)
    bio = models.CharField(max_length=250, blank=True, default='')
    avatar = models.CharField(max_length=250, default='👾')
    avatar_image = models.FileField(upload_to='avatars/%Y/%m/', null=True, blank=True)
    banner_color = models.CharField(max_length=20, default='#6366f1')
    banner_url = models.URLField(max_length=500, blank=True, default='')
    platforms = models.JSONField(default=list, blank=True)
    steam_id = models.CharField(max_length=60, blank=True, default='')
    discord_tag = models.CharField(max_length=60, blank=True, default='')
    favorite_games = models.ManyToManyField('foro_juegos.Game', blank=True, related_name='favorited_by')
    is_deleted = models.BooleanField(default=False)



    class Meta:
        db_table = 'forum_user'

    def __str__(self):
        return self.username
