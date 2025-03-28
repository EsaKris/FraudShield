from django.db import models
from django.contrib.auth.models import User

class FraudRule(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    enabled = models.BooleanField(default=True)
    threshold = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class FraudAlert(models.Model):
    STATUS_CHOICES = (
        ('new', 'New'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('false_positive', 'False Positive'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fraud_alerts', null=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    source_data = models.JSONField(default=dict)
    triggered_rules = models.ManyToManyField(FraudRule, related_name='alerts')
    risk_score = models.FloatField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - Risk Score: {self.risk_score}"
    
    class Meta:
        ordering = ['-created_at']