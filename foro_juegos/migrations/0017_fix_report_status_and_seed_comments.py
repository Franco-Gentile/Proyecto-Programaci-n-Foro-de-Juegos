# Generated on 2026-10-31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('foro_juegos', '0016_post_likes_comment_likes_is_pinned'),
    ]

    operations = [
        migrations.AlterField(
            model_name='report',
            name='status',
            field=models.CharField(
                choices=[
                    ('PENDING', 'Pending'),
                    ('REVIEWED', 'Reviewed'),
                    ('RESOLVED', 'Resolved'),
                    ('DISMISSED', 'Dismissed'),
                    ('DELETED', 'Deleted'),
                ],
                default='PENDING',
                max_length=15,
            ),
        ),
        migrations.AlterModelOptions(
            name='report',
            options={'ordering': ['-created_at']},
        ),
    ]
