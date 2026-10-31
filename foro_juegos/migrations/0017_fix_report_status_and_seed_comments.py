# Generated on 2026-10-31

from django.db import migrations, models


def seed_missing_post_comments(apps, schema_editor):
    User = apps.get_model('foro_juegos', 'User')
    Post = apps.get_model('foro_juegos', 'Post')
    Comment = apps.get_model('foro_juegos', 'Comment')

    users = list(User.objects.filter(is_deleted=False)[:5])
    if not users:
        return

    sample_pairs = [
        (
            "¡Muy buen aporte! Coincido totalmente con lo que planteás en el post.",
            "Excelente hilo, venía buscando exactamente esta info para probarlo hoy."
        ),
        (
            "Juegazo total, le metí más de 100 horas y no me canso de recomendarlo.",
            "Para mí es de lo mejor del género hoy en día, gran análisis."
        ),
        (
            "Totalmente de acuerdo, la comunidad de este juego siempre saca buenos debates.",
            "¡Buenísima publicación! ¿Alguien más lo está jugando este fin de semana?"
        ),
    ]

    posts = Post.objects.filter(is_deleted=False)
    for idx, post in enumerate(posts):
        existing_count = Comment.objects.filter(post=post, is_deleted=False).count()
        if existing_count == 0:
            u1 = users[idx % len(users)]
            u2 = users[(idx + 1) % len(users)]
            c1_text, c2_text = sample_pairs[idx % len(sample_pairs)]
            Comment.objects.create(post=post, user=u1, content=c1_text)
            Comment.objects.create(post=post, user=u2, content=c2_text)
        elif existing_count == 1:
            u2 = users[(idx + 1) % len(users)]
            _, c2_text = sample_pairs[idx % len(sample_pairs)]
            Comment.objects.create(post=post, user=u2, content=c2_text)


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
        migrations.RunPython(seed_missing_post_comments, migrations.RunPython.noop),
    ]
