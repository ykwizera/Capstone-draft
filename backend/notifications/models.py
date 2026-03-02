from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Type(models.TextChoices):
        LOW_BALANCE = "low_balance", "Low Balance"
        PAYMENT = "payment", "Payment"
        GENERAL = "general", "General"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications"
    )
    meter = models.ForeignKey(
        "meters.Meter",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notifications"
    )
    notification_type = models.CharField(
        max_length=20,
        choices=Type.choices,
        default=Type.GENERAL
    )
    title = models.CharField(max_length=120)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "is_read"]),
            models.Index(fields=["user", "notification_type"]),
            models.Index(fields=["notification_type"]),
        ]

    def __str__(self):
        return f"{self.user} - {self.notification_type} - {self.title}"