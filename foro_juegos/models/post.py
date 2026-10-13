from django.db import models
from .user import User
from .category import Category
from .game import Game

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    content = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='posts', null=True, blank=True)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='posts', null=True, blank=True)
    mentioned_users = models.ManyToManyField(User, related_name='mentioned_in_posts', blank=True)
    is_deleted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
