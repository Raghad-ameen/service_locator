import uuid
from django.core.cache import cache
from django.utils import timezone

READ_TTL = 60 * 60  # ساعة

def send_notification(user_id, message, meta=None):
    notif_id = str(uuid.uuid4())
    key = f"notif:{user_id}:{notif_id}"

    cache.set(
        key,
        {
            "id": notif_id,
            "message": message,
            "meta": meta or {},
            "read_at": None,
            "created_at": timezone.now().isoformat()
        },
        timeout=None  # ❗ بدون انتهاء
    )


def get_user_notifications(user_id):
    keys = cache.keys(f"notif:{user_id}:*")
    notifications = []

    for key in keys:
        notif = cache.get(key)
        if notif:
            notifications.append(notif)

    return sorted(
        notifications,
        key=lambda x: x["created_at"],
        reverse=True
    )


def open_notification(user_id, notif_id):
    key = f"notif:{user_id}:{notif_id}"
    notif = cache.get(key)

    if notif and notif["read_at"] is None:
        notif["read_at"] = timezone.now().isoformat()
        cache.set(key, notif, timeout=READ_TTL)
