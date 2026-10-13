from django.db import models
from .post import Post


class PostMedia(models.Model):
    class MediaType(models.TextChoices):
        IMAGE = 'IMAGE', 'Imagen'
        VIDEO = 'VIDEO', 'Video'
        YOUTUBE = 'YOUTUBE', 'YouTube'

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='media_items')
    media_type = models.CharField(max_length=10, choices=MediaType.choices, default=MediaType.IMAGE)
    file = models.FileField(upload_to='posts_media/%Y/%m/', null=True, blank=True)
    media_url = models.URLField(max_length=500, null=True, blank=True)
    order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.media_type} #{self.id} for Post {self.post_id}"
