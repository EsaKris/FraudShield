from django.contrib import admin
from .models import ModelSettings, PhotoResult

@admin.register(ModelSettings)
class ModelSettingsAdmin(admin.ModelAdmin):
    list_display = ('id', 'use_high_accuracy_model', 'preload_models', 'models_loaded', 'updated_at')
    list_filter = ('models_loaded', 'use_high_accuracy_model', 'preload_models')

@admin.register(PhotoResult)
class PhotoResultAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'name', 'age', 'gender', 'nationality', 'fraud_risk', 'confidence', 'timestamp')
    list_filter = ('fraud_risk', 'gender', 'timestamp')
    search_fields = ('name', 'location', 'nationality', 'user__username')
    readonly_fields = ('timestamp',)