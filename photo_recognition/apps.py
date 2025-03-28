from django.apps import AppConfig


class PhotoRecognitionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'photo_recognition'
    
    def ready(self):
        # Import any signals or startup code here
        pass
