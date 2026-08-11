# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('foro_juegos', '0004_alter_user_role'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(unique=True),
        ),
    ]
