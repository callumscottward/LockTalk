from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta

from .models import Log
import csv
import os


def rotate_logs_if_needed():
    lock_key = "log_rotation_lock"
    last_run_key = "last_log_rotation"

    # prevent double execution across requests
    if not cache.add(lock_key, "1", timeout=60):
        return

    try:
        last_run = cache.get(last_run_key)

        # already ran in last 7 days
        if last_run and (timezone.now() - last_run) < timedelta(days=7):
            return

        cutoff = timezone.now() - timedelta(days=7)
        old_logs = Log.objects.filter(timestamp__lt=cutoff)

        if not old_logs.exists():
            cache.set(last_run_key, timezone.now(), None)
            return

        os.makedirs("exports", exist_ok=True)
        filename = f"exports/logs_{timezone.now().date()}.csv"

        with open(filename, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["Event Type", "Sender", "Receiver", "Success", "Timestamp"])

            for log in old_logs:
                writer.writerow([
                    log.event_type,
                    log.sender,
                    log.receiver,
                    log.success,
                    log.timestamp,
                ])

        old_logs.delete()

        cache.set(last_run_key, timezone.now(), None)

    finally:
        cache.delete(lock_key)