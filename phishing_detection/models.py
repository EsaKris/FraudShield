from django.db import models
from django.contrib.auth.models import User

class PhishingEmail(models.Model):
    STATUS_CHOICES = (
        ('new', 'New'),
        ('analyzing', 'Analyzing'),
        ('flagged', 'Flagged as Phishing'),
        ('legitimate', 'Legitimate'),
        ('unsure', 'Unsure'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='phishing_emails', null=True)
    subject = models.CharField(max_length=255)
    sender = models.CharField(max_length=255)
    recipient = models.CharField(max_length=255)
    content = models.TextField()
    received_at = models.DateTimeField()
    analyzed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='new')
    phishing_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.subject} - {self.sender}"
    
    class Meta:
        ordering = ['-received_at']

class PhishingIndicator(models.Model):
    INDICATOR_TYPES = (
        ('Suspicious Link', 'Suspicious Link'),
        ('Spoofed Domain', 'Spoofed Domain'),
        ('Request for Sensitive Information', 'Request for Sensitive Information'),
        ('Suspicious Attachment', 'Suspicious Attachment'),
        ('Impersonation Attempt', 'Impersonation Attempt'),
        ('Urgency or Pressure', 'Urgency or Pressure'),
        ('Grammar Errors', 'Grammar Errors'),
        ('Mismatched URLs', 'Mismatched URLs'),
    )
    
    email = models.ForeignKey(PhishingEmail, on_delete=models.CASCADE, related_name='indicators')
    indicator_type = models.CharField(max_length=50, choices=INDICATOR_TYPES)
    description = models.TextField()
    severity = models.FloatField(default=0.5)  # 0-1 scale
    location = models.TextField(null=True, blank=True)  # Where in the email the indicator was found
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.indicator_type} in {self.email.subject}"
    
    class Meta:
        ordering = ['-severity']