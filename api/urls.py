from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from . import views

urlpatterns = [
    # Authentication
    path('token/', obtain_auth_token, name='api_token_auth'),
    path('register/', views.register_user, name='register'),
    path('user/', views.get_user_info, name='user_info'),
    path('logout/', views.logout_user, name='logout'),
    
    # User settings
    path('settings/', views.get_user_settings, name='user_settings'),
    path('settings/update/', views.update_user_settings, name='update_settings'),
    
    # Activity logs
    path('activities/', views.get_activity_logs, name='activity_logs'),
    path('activities/<str:action_type>/', views.get_activity_logs_by_type, name='activity_logs_by_type'),
    
    # Statistics
    path('stats/', views.get_statistics, name='stats'),
    
    # Photo Recognition
    path('photo-recognition/models/status/', views.get_model_status, name='model_status'),
    path('photo-recognition/models/download/', views.download_models, name='download_models'),
    path('photo-recognition/models/settings/', views.update_model_settings, name='update_model_settings'),
    path('photo-recognition/', views.analyze_photo, name='analyze_photo'),
    path('photo-recognition/results/', views.get_photo_results, name='photo_results'),
    path('photo-recognition/results/<int:result_id>/', views.get_photo_result_by_id, name='photo_result_by_id'),
    
    # Fraud Detection
    path('fraud/rules/', views.get_fraud_rules, name='fraud_rules'),
    path('fraud/rules/create/', views.create_fraud_rule, name='create_fraud_rule'),
    path('fraud/rules/<int:rule_id>/update/', views.update_fraud_rule, name='update_fraud_rule'),
    path('fraud/alerts/', views.get_fraud_alerts, name='fraud_alerts'),
    path('fraud/alerts/<int:alert_id>/', views.get_fraud_alert_by_id, name='fraud_alert_by_id'),
    path('fraud/alerts/<int:alert_id>/update-status/', views.update_fraud_alert_status, name='update_fraud_alert_status'),
    path('fraud/check/', views.check_fraud, name='check_fraud'),
    
    # Phishing Detection
    path('phishing/emails/', views.get_phishing_emails, name='phishing_emails'),
    path('phishing/emails/<int:email_id>/', views.get_phishing_email_by_id, name='phishing_email_by_id'),
    path('phishing/emails/<int:email_id>/update-status/', views.update_phishing_email_status, name='update_phishing_email_status'),
    path('phishing/analyze/', views.analyze_email, name='analyze_email'),
]