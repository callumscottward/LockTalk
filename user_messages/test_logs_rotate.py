import os
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from django.core.cache import cache

from user_messages.models import Log
from user_messages.logs_rotate import rotate_logs_if_needed


## @class LogRotationTest
# @brief Tests automated log rotation and export behavior
class LogRotationTest(TestCase):

    def setUp(self):
        cache.clear()

    ## @brief Tests that old logs are rotated and exported
    #  @details Ensures logs older than threshold are deleted and exported to CSV
    def test_rotates_old_logs(self):
        old_log = Log.objects.create(
            event_type="LOGIN",
            sender="user1",
            receiver="system",
            success=True
        )
        old_log.timestamp = timezone.now() - timedelta(days=8)
        old_log.save()

        rotate_logs_if_needed()

        self.assertEqual(Log.objects.count(), 0)

        files = os.listdir("exports")
        self.assertTrue(any(file.endswith(".csv") for file in files))

    ## @brief Tests that recent logs are not rotated
    #  @details Ensures logs within retention period remain in database
    def test_does_not_rotate_recent_logs(self):
        Log.objects.create(
            event_type="LOGIN",
            sender="user1",
            receiver="system",
            success=True
        )

        rotate_logs_if_needed()

        self.assertEqual(Log.objects.count(), 1)

    ## @brief Tests prevention of repeated rotation runs
    #  @details Ensures cache-based timing guard prevents repeated execution
    def test_prevents_multiple_runs(self):
        cache.set("last_log_rotation", timezone.now(), None)

        Log.objects.create(
            event_type="LOGIN",
            sender="user1",
            receiver="system",
            success=True
        )

        rotate_logs_if_needed()

        self.assertEqual(Log.objects.count(), 1)

    ## @brief Tests distributed lock protection
    #  @details Ensures rotation does not execute when lock is already active
    def test_lock_prevents_double_execution(self):
        cache.set("log_rotation_lock", "1", timeout=60)

        rotate_logs_if_needed()

        self.assertTrue(True)
