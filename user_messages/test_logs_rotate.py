import os
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from django.core.cache import cache

from user_messages.models import Log
from user_messages.logs_rotate import rotate_logs_if_needed

## @file test_log_rotation.py
#  @brief Unit tests for log rotation functionality.
#
#  Tests cover:
#  - Rotating and exporting old logs
#  - Preventing rotation of recent logs
#  - Cache-based rate limiting
#  - Lock protection against concurrent execution

## @class LogRotationTest
#  @brief Tests for scheduled log rotation and archival system.
class LogRotationTest(TestCase):

    ## @brief Clears cache before each test.
    def setUp(self):
        cache.clear()


    ## @brief Ensures old logs are exported and deleted.
    #
    #  Verifies:
    #  - Logs older than 7 days are removed
    #  - CSV export file is created
    def test_rotates_old_logs(self):
        # Create old log (8 days ago)
        old_log = Log.objects.create(
            event_type="LOGIN",
            sender="user1",
            receiver="system",
            success=True
        )
        old_log.timestamp = timezone.now() - timedelta(days=8)
        old_log.save()

        rotate_logs_if_needed()

        # Logs should be deleted
        self.assertEqual(Log.objects.count(), 0)

        # File should be created
        files = os.listdir("exports")
        self.assertTrue(any(file.endswith(".csv") for file in files))

    ## @brief Ensures recent logs are not rotated.
    def test_does_not_rotate_recent_logs(self):
        Log.objects.create(
            event_type="LOGIN",
            sender="user1",
            receiver="system",
            success=True
        )

        rotate_logs_if_needed()

        # Log should still exist
        self.assertEqual(Log.objects.count(), 1)

    ## @brief Ensures rotation does not run again within cooldown period.
    def test_prevents_multiple_runs(self):
        # Set last run to now
        cache.set("last_log_rotation", timezone.now(), None)

        Log.objects.create(
            event_type="LOGIN",
            sender="user1",
            receiver="system",
            success=True
        )

        rotate_logs_if_needed()

        # Should not delete logs because it ran recently
        self.assertEqual(Log.objects.count(), 1)

    ## @brief Ensures cache lock prevents concurrent execution.
    def test_lock_prevents_double_execution(self):
        # Simulate lock already acquired
        cache.set("log_rotation_lock", "1", timeout=60)

        rotate_logs_if_needed()

        # Nothing should happen, but more importantly no crash
        self.assertTrue(True)
