from rest_framework import serializers
from django.contrib.auth.models import User
from accounts.models import UserProfile, ActivityLog
from photo_recognition.models import ModelSettings, PhotoResult
from fraud_detection.models import FraudRule, FraudAlert
from phishing_detection.models import PhishingEmail, PhishingIndicator

# User serializers
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'dark_mode', 'notifications_enabled', 'auto_logout', 'auto_logout_time',
            'enable_photo_recognition', 'enable_fraud_detection', 'enable_phishing_detection',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class UserWithProfileSerializer(serializers.ModelSerializer):
    settings = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'settings']
        read_only_fields = ['id']
    
    def get_settings(self, obj):
        try:
            profile = obj.profile
            return UserProfileSerializer(profile).data
        except UserProfile.DoesNotExist:
            return None

class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = ['id', 'action_type', 'description', 'ip_address', 'timestamp']
        read_only_fields = ['id', 'timestamp']

# Photo recognition serializers
class ModelSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelSettings
        fields = ['use_high_accuracy_model', 'preload_models', 'models_loaded', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class PhotoResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhotoResult
        fields = [
            'id', 'name', 'image_url', 'location', 'age', 'gender', 'nationality',
            'socials', 'confidence', 'fraud_risk', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']

# Fraud detection serializers
class FraudRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = FraudRule
        fields = ['id', 'name', 'description', 'enabled', 'threshold', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class FraudAlertSerializer(serializers.ModelSerializer):
    triggered_rules = FraudRuleSerializer(many=True, read_only=True)
    
    class Meta:
        model = FraudAlert
        fields = [
            'id', 'title', 'description', 'source_data', 'triggered_rules',
            'risk_score', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

# Phishing detection serializers
class PhishingIndicatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhishingIndicator
        fields = ['id', 'indicator_type', 'description', 'severity', 'location', 'created_at']
        read_only_fields = ['id', 'created_at']

class PhishingEmailSerializer(serializers.ModelSerializer):
    indicators = PhishingIndicatorSerializer(many=True, read_only=True)
    
    class Meta:
        model = PhishingEmail
        fields = [
            'id', 'subject', 'sender', 'recipient', 'content', 'received_at',
            'analyzed_at', 'status', 'phishing_score', 'created_at', 'updated_at', 'indicators'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']