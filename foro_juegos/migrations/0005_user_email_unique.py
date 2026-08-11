from django.db import migrations, models


def deduplicate_emails(apps, schema_editor):
    User = apps.get_model('foro_juegos', 'User')
    seen_emails = {}
    for user in User.objects.order_by('date_joined').values_list('id', 'email'):
        user_id, email = user
        if email in seen_emails:
            local, domain = email.split('@', 1)
            new_email = f'{local}+dup{user_id}@{domain}'
            User.objects.filter(pk=user_id).update(email=new_email)
        else:
            seen_emails[email] = user_id


class Migration(migrations.Migration):

    dependencies = [
        ('foro_juegos', '0004_alter_user_role'),
    ]

    operations = [
        migrations.RunPython(deduplicate_emails, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(unique=True),
        ),
    ]
