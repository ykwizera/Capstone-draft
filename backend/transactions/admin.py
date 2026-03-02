from django.contrib import admin
from .models import PaymentTransaction, TokenPurchase


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "meter", "amount_rwf", "method", "status", "external_reference", "created_at")
    list_display_links = ("id",)
    list_filter = ("method", "status")
    search_fields = ("id", "user__username", "user__phone_number", "external_reference")
    ordering = ("-created_at",)
    readonly_fields = ("created_at",)
    autocomplete_fields = ("user", "meter")


@admin.register(TokenPurchase)
class TokenPurchaseAdmin(admin.ModelAdmin):
    list_display = ("id", "payment", "meter", "units_generated", "token_generated", "status", "created_at")
    list_display_links = ("id",)
    list_filter = ("status",)
    search_fields = ("id", "meter__meter_number", "meter__name", "token_generated")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at")
    autocomplete_fields = ("payment", "meter")