from django.contrib import admin
from .models import Meter


@admin.register(Meter)
class MeterAdmin(admin.ModelAdmin):
    list_display = ("meter_number", "name", "owner", "status", "current_balance_units", "is_low_balance", "created_at")
    list_display_links = ("meter_number", "name")
    list_filter = ("status", "owner")
    search_fields = ("meter_number", "name", "owner__username", "owner__phone_number")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at")
    autocomplete_fields = ("owner",)

    @admin.display(boolean=True, description="Low Balance?")
    def is_low_balance(self, obj):
        return obj.is_low_balance