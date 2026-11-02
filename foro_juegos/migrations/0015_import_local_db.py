# Migration placeholder: local database dump removed to protect credentials
# and maintain test suite integrity. Data seeding has been moved to management command: seed_forum_data.

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('foro_juegos', '0014_seed_initial_forum_data'),
    ]

    operations = [
        migrations.RunPython(migrations.RunPython.noop, migrations.RunPython.noop),
    ]
