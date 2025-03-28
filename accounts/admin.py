from django.contrib import admin
from .models import UserProfile, ActivityLog

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'dark_mode', 'enable_photo_recognition', 'enable_fraud_detection', 'enable_phishing_detection', 'created_at')
    list_filter = ('dark_mode', 'enable_photo_recognition', 'enable_fraud_detection', 'enable_phishing_detection')
    search_fields = ('user__username',)

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action_type', 'description', 'ip_address', 'timestamp')
    list_filter = ('action_type', 'timestamp')
    search_fields = ('user__username', 'description', 'ip_address')
    readonly_fields = ('user', 'action_type', 'description', 'ip_address', 'timestamp')