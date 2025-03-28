from django.db import models
from django.contrib.auth.models import User

class ModelSettings(models.Model):
    use_high_accuracy_model = models.BooleanField(default=True)
    preload_models = models.BooleanField(default=True)
    models_loaded = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Model Settings (Updated: {self.updated_at})"

class PhotoResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='photo_results', null=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    image_url = models.ImageField(upload_to='photos/', null=True, blank=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=50, blank=True, null=True)
    nationality = models.CharField(max_length=100, blank=True, null=True)
    socials = models.JSONField(default=dict, blank=True, null=True)
    confidence = models.FloatField(null=True, blank=True)
    fraud_risk = models.CharField(max_length=50, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Photo Analysis: {self.id} - {self.timestamp}"
    
    class Meta:
        ordering = ['-timestamp']