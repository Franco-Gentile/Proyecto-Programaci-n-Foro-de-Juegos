from django.db import models
from .post import Post

class Image(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image {self.id} for post {self.post.id}"
