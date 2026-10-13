import re
from foro_juegos.models.user import User

# Match mentions like @usuario, avoiding email addresses or invalid characters
MENTION_PATTERN = re.compile(r'(?<=^|(?<=[^\w@]))@([a-zA-Z0-9_]{1,30})\b')


def extract_mentions(text):
    """
    Extracts a unique list of usernames mentioned in text using @username syntax.
    """
    if not text:
        return []
    return list({m.lower() for m in MENTION_PATTERN.findall(text)})


def sync_mentions(instance, text):
    """
    Finds mentioned users that exist in the database and links them to the instance
    (e.g. Post or Comment). Case-insensitive matching.
    """
    usernames = extract_mentions(text)
    if not usernames:
        instance.mentioned_users.clear()
        return []

    from django.db.models.functions import Lower
    matched_users = User.objects.annotate(username_lower=Lower('username')).filter(
        username_lower__in=usernames,
        is_deleted=False
    )
    instance.mentioned_users.set(matched_users)
    return list(matched_users)
