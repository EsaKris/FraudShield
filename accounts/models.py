from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    dark_mode = models.BooleanField(default=True)
    notifications_enabled = models.BooleanField(default=True)
    auto_logout = models.BooleanField(default=False)
    auto_logout_time = models.IntegerField(default=30)  # minutes
    enable_photo_recognition = models.BooleanField(default=True)
    enable_fraud_detection = models.BooleanField(default=True)
    enable_phishing_detection = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

class ActivityLog(models.Model):
    ACTION_TYPES = (
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('photo', 'Photo Recognition'),
        ('fraud', 'Fraud Detection'),
        ('phishing', 'Phishing Detection'),
        ('settings', 'Settings Update'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.action_type} - {self.timestamp}"
        
    class Meta:
        ordering = ['-timestamp']