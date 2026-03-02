import uuid
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class PaymentTransaction(models.Model):
    class Method(models.TextChoices):
        MOMO = "momo", "Mobile Money"
        CARD = "card", "Card"
        CASH = "cash", "Cash"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payments"
    )
    meter = models.ForeignKey(
        "meters.Meter",
        on_delete=models.PROTECT,
        related_name="payments",
        null=True,
        blank=True
    )
    amount_rwf = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    method = models.CharField(max_length=10, choices=Method.choices, default=Method.MOMO)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    external_reference = models.CharField(max_length=100, blank=True, null=True, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["meter"]),
        ]

    def __str__(self):
        return f"{self.user} - {self.amount_rwf} RWF - {self.status}"


class TokenPurchase(models.Model):
    class Status(models.TextChoices):
        CREATED = "created", "Created"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment = models.OneToOneField(
        PaymentTransaction,
        on_delete=models.PROTECT,
        related_name="token_purchase"
    )
    meter = models.ForeignKey(
        "meters.Meter",
        on_delete=models.PROTECT,
        related_name="token_purchases"
    )
    units_generated = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        validators=[MinValueValidator(0)]
    )
    token_generated = models.CharField(max_length=25, unique=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.CREATED)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["meter"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.meter.meter_number} - {self.units_generated} units"
