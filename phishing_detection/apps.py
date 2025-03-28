from django.apps import AppConfig


class PhishingDetectionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'phishing_detection'
    
    def ready(self):
        # Import any signals or startup code here
        pass
