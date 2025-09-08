from django.contrib import admin
from .models import QuoteRequest

# Register your models here.


@admin.register(QuoteRequest)
class QuoteRequestAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "email", "phone", "service_type", "created_at")
    list_filter = ("service_type", "created_at")
    search_fields = ("first_name", "last_name", "email", "phone", "service_address", "description")
    readonly_fields = ("created_at",)
