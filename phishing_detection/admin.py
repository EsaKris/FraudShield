from django.contrib import admin
from .models import PhishingEmail, PhishingIndicator

class PhishingIndicatorInline(admin.TabularInline):
    model = PhishingIndicator
    extra = 0
    fields = ('indicator_type', 'description', 'severity', 'location')

@admin.register(PhishingEmail)
class PhishingEmailAdmin(admin.ModelAdmin):
    list_display = ('subject', 'sender', 'status', 'phishing_score', 'received_at', 'analyzed_at')
    list_filter = ('status', 'received_at', 'analyzed_at')
    search_fields = ('subject', 'sender', 'recipient', 'content')
    readonly_fields = ('received_at', 'analyzed_at', 'created_at')
    inlines = [PhishingIndicatorInline]

@admin.register(PhishingIndicator)
class PhishingIndicatorAdmin(admin.ModelAdmin):
    list_display = ('email', 'indicator_type', 'severity', 'created_at')
    list_filter = ('indicator_type', 'severity', 'created_at')
    search_fields = ('description', 'location', 'email__subject')