from django.contrib import admin
from .models import FraudRule, FraudAlert

@admin.register(FraudRule)
class FraudRuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'enabled', 'threshold', 'created_at', 'updated_at')
    list_filter = ('enabled', 'created_at')
    search_fields = ('name', 'description')

@admin.register(FraudAlert)
class FraudAlertAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'risk_score', 'status', 'created_at')
    list_filter = ('status', 'risk_score', 'created_at')
    search_fields = ('title', 'description', 'user__username')
    readonly_fields = ('created_at',)
    filter_horizontal = ('triggered_rules',)