from django.core.exceptions import ValidationError
from django.db import models
from .user import User
from .post import Post
from .comment import Comment

class Report(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('REVIEWED', 'Reviewed'),
        ('DELETED', 'Deleted'),
    ]
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True, related_name='reports')
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True, related_name='reports')
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if not self.post and not self.comment:
            raise ValidationError('A report must reference a post or a comment.')

    def __str__(self):
        target = self.post if self.post else self.comment
        return f"Report {self.id} on {target}"
