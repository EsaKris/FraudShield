from django.shortcuts import get_object_or_404
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.db.models import Count, Avg, Sum
from django.utils import timezone

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny

from accounts.models import UserProfile, ActivityLog
from photo_recognition.models import ModelSettings, PhotoResult
from fraud_detection.models import FraudRule, FraudAlert
from phishing_detection.models import PhishingEmail, PhishingIndicator

# Authentication views
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user and create their profile"""
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email', '')
    
    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.create_user(username=username, email=email, password=password)
    
    # Create user profile with default settings
    UserProfile.objects.create(user=user)
    
    # Log the registration activity
    ActivityLog.objects.create(
        user=user,
        action_type='login',
        description=f"User {username} registered an account",
        ip_address=request.META.get('REMOTE_ADDR')
    )
    
    # Login the user
    login(request, user)
    
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email
    }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    """Get the current user's information"""
    user = request.user
    profile = user.profile
    
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'settings': {
            'dark_mode': profile.dark_mode,
            'notifications_enabled': profile.notifications_enabled,
            'auto_logout': profile.auto_logout,
            'auto_logout_time': profile.auto_logout_time,
            'enable_photo_recognition': profile.enable_photo_recognition,
            'enable_fraud_detection': profile.enable_fraud_detection,
            'enable_phishing_detection': profile.enable_phishing_detection,
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """Logout the current user"""
    # Log the logout activity
    ActivityLog.objects.create(
        user=request.user,
        action_type='logout',
        description=f"User {request.user.username} logged out",
        ip_address=request.META.get('REMOTE_ADDR')
    )
    
    logout(request)
    return Response({'success': 'User logged out successfully'})

# User settings views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_settings(request):
    """Get the current user's settings"""
    profile = request.user.profile
    
    return Response({
        'dark_mode': profile.dark_mode,
        'notifications_enabled': profile.notifications_enabled,
        'auto_logout': profile.auto_logout,
        'auto_logout_time': profile.auto_logout_time,
        'enable_photo_recognition': profile.enable_photo_recognition,
        'enable_fraud_detection': profile.enable_fraud_detection,
        'enable_phishing_detection': profile.enable_phishing_detection,
    })

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_settings(request):
    """Update the current user's settings"""
    profile = request.user.profile
    
    # Update fields if provided
    if 'dark_mode' in request.data:
        profile.dark_mode = request.data['dark_mode']
    
    if 'notifications_enabled' in request.data:
        profile.notifications_enabled = request.data['notifications_enabled']
        
    if 'auto_logout' in request.data:
        profile.auto_logout = request.data['auto_logout']
        
    if 'auto_logout_time' in request.data:
        profile.auto_logout_time = request.data['auto_logout_time']
        
    if 'enable_photo_recognition' in request.data:
        profile.enable_photo_recognition = request.data['enable_photo_recognition']
        
    if 'enable_fraud_detection' in request.data:
        profile.enable_fraud_detection = request.data['enable_fraud_detection']
        
    if 'enable_phishing_detection' in request.data:
        profile.enable_phishing_detection = request.data['enable_phishing_detection']
    
    profile.save()
    
    # Log the settings update activity
    ActivityLog.objects.create(
        user=request.user,
        action_type='settings',
        description=f"User {request.user.username} updated their settings",
        ip_address=request.META.get('REMOTE_ADDR')
    )
    
    return Response({
        'dark_mode': profile.dark_mode,
        'notifications_enabled': profile.notifications_enabled,
        'auto_logout': profile.auto_logout,
        'auto_logout_time': profile.auto_logout_time,
        'enable_photo_recognition': profile.enable_photo_recognition,
        'enable_fraud_detection': profile.enable_fraud_detection,
        'enable_phishing_detection': profile.enable_phishing_detection,
    })

# Activity logs views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_activity_logs(request):
    """Get the current user's activity logs"""
    logs = ActivityLog.objects.filter(user=request.user).order_by('-timestamp')
    
    # Handle optional pagination
    page = int(request.query_params.get('page', 1))
    limit = int(request.query_params.get('limit', 10))
    
    start = (page - 1) * limit
    end = page * limit
    
    logs_data = []
    for log in logs[start:end]:
        logs_data.append({
            'id': log.id,
            'action_type': log.action_type,
            'description': log.description,
            'ip_address': log.ip_address,
            'timestamp': log.timestamp,
        })
    
    return Response({
        'logs': logs_data,
        'total': logs.count(),
        'page': page,
        'limit': limit,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_activity_logs_by_type(request, action_type):
    """Get the current user's activity logs of a specific type"""
    logs = ActivityLog.objects.filter(user=request.user, action_type=action_type).order_by('-timestamp')
    
    # Handle optional pagination
    page = int(request.query_params.get('page', 1))
    limit = int(request.query_params.get('limit', 10))
    
    start = (page - 1) * limit
    end = page * limit
    
    logs_data = []
    for log in logs[start:end]:
        logs_data.append({
            'id': log.id,
            'action_type': log.action_type,
            'description': log.description,
            'ip_address': log.ip_address,
            'timestamp': log.timestamp,
        })
    
    return Response({
        'logs': logs_data,
        'total': logs.count(),
        'page': page,
        'limit': limit,
    })

# Statistics view
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_statistics(request):
    """Get overall statistics for the user's security activities"""
    user = request.user
    
    # Get activity counts
    total_activities = ActivityLog.objects.filter(user=user).count()
    
    # Get photo recognition stats
    photo_analyses = PhotoResult.objects.filter(user=user).count()
    
    # Get fraud detection stats
    fraud_alerts = FraudAlert.objects.filter(user=user).count()
    
    # Get phishing detection stats
    phishing_emails = PhishingEmail.objects.filter(user=user).count()
    
    # Get average risk scores
    avg_fraud_risk = FraudAlert.objects.filter(user=user).aggregate(Avg('risk_score'))['risk_score__avg'] or 0
    avg_phishing_score = PhishingEmail.objects.filter(user=user).aggregate(Avg('phishing_score'))['phishing_score__avg'] or 0
    
    # Get recent activity date
    latest_activity = ActivityLog.objects.filter(user=user).order_by('-timestamp').first()
    latest_activity_date = latest_activity.timestamp if latest_activity else None
    
    return Response({
        'total_activities': total_activities,
        'photo_analyses': photo_analyses,
        'fraud_alerts': fraud_alerts,
        'phishing_emails': phishing_emails,
        'avg_fraud_risk': round(avg_fraud_risk, 2),
        'avg_phishing_score': round(avg_phishing_score, 2),
        'latest_activity_date': latest_activity_date,
    })

# Photo recognition views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_model_status(request):
    """Get the status of face recognition models"""
    # Get or create model settings
    settings, created = ModelSettings.objects.get_or_create(pk=1)
    
    return Response({
        'models_loaded': settings.models_loaded,
        'use_high_accuracy_model': settings.use_high_accuracy_model,
        'preload_models': settings.preload_models,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def download_models(request):
    """Download face recognition models"""
    # Get or create model settings
    settings, created = ModelSettings.objects.get_or_create(pk=1)
    
    # Use our utility function to download models
    from photo_recognition.utils import download_models as download_face_models
    result = download_face_models()
    
    if result['success']:
        settings.models_loaded = True
        settings.save()
        
        # Log the activity
        ActivityLog.objects.create(
            user=request.user,
            action_type='settings',
            description=f"User {request.user.username} downloaded face recognition models",
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({
            'models_loaded': settings.models_loaded,
            'use_high_accuracy_model': settings.use_high_accuracy_model,
            'preload_models': settings.preload_models,
            'message': result['message']
        })
    else:
        return Response({
            'models_loaded': settings.models_loaded,
            'use_high_accuracy_model': settings.use_high_accuracy_model,
            'preload_models': settings.preload_models,
            'error': result['message']
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_model_settings(request):
    """Update face recognition model settings"""
    # Get or create model settings
    settings, created = ModelSettings.objects.get_or_create(pk=1)
    
    # Update fields if provided
    if 'use_high_accuracy_model' in request.data:
        settings.use_high_accuracy_model = request.data['use_high_accuracy_model']
    
    if 'preload_models' in request.data:
        settings.preload_models = request.data['preload_models']
    
    settings.save()
    
    # Log the activity
    ActivityLog.objects.create(
        user=request.user,
        action_type='settings',
        description=f"User {request.user.username} updated face recognition model settings",
        ip_address=request.META.get('REMOTE_ADDR')
    )
    
    return Response({
        'models_loaded': settings.models_loaded,
        'use_high_accuracy_model': settings.use_high_accuracy_model,
        'preload_models': settings.preload_models,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_photo(request):
    """Analyze a photo for facial recognition"""
    if 'photo' not in request.FILES:
        return Response({'error': 'No photo provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    photo = request.FILES['photo']
    
    # Use OpenCV-based face analysis
    from photo_recognition.utils import analyze_face_with_opencv, estimate_fraud_risk
    
    # Analyze the photo
    analysis_result = analyze_face_with_opencv(photo)
    
    if not analysis_result['success']:
        return Response({'error': analysis_result['message']}, status=status.HTTP_400_BAD_REQUEST)
    
    face_data = analysis_result['data']
    
    # Estimate fraud risk based on face analysis
    fraud_risk, risk_score = estimate_fraud_risk(analysis_result)
    
    # Save the analysis result
    photo_result = PhotoResult.objects.create(
        user=request.user,
        name=face_data['name'],
        image_url=photo,
        location=face_data['location'],
        age=face_data['age'],
        gender=face_data['gender'],
        nationality=face_data['nationality'],
        socials=face_data['socials'],
        confidence=face_data['confidence'],
        fraud_risk=fraud_risk
    )
    
    # Log the activity
    ActivityLog.objects.create(
        user=request.user,
        action_type='photo',
        description=f"User {request.user.username} analyzed a photo",
        ip_address=request.META.get('REMOTE_ADDR')
    )
    
    return Response({
        'id': photo_result.id,
        'name': photo_result.name,
        'image_url': request.build_absolute_uri(photo_result.image_url.url) if photo_result.image_url else None,
        'location': photo_result.location,
        'age': photo_result.age,
        'gender': photo_result.gender,
        'nationality': photo_result.nationality,
        'socials': photo_result.socials,
        'confidence': photo_result.confidence,
        'fraud_risk': photo_result.fraud_risk,
        'timestamp': photo_result.timestamp,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_photo_results(request):
    """Get all photo analysis results for the current user"""
    results = PhotoResult.objects.filter(user=request.user).order_by('-timestamp')
    
    # Handle optional pagination
    page = int(request.query_params.get('page', 1))
    limit = int(request.query_params.get('limit', 10))
    
    start = (page - 1) * limit
    end = page * limit
    
    results_data = []
    for result in results[start:end]:
        results_data.append({
            'id': result.id,
            'name': result.name,
            'image_url': request.build_absolute_uri(result.image_url.url) if result.image_url else None,
            'location': result.location,
            'age': result.age,
            'gender': result.gender,
            'nationality': result.nationality,
            'socials': result.socials,
            'confidence': result.confidence,
            'fraud_risk': result.fraud_risk,
            'timestamp': result.timestamp,
        })
    
    return Response({
        'results': results_data,
        'total': results.count(),
        'page': page,
        'limit': limit,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_photo_result_by_id(request, result_id):
    """Get a specific photo analysis result by ID"""
    result = get_object_or_404(PhotoResult, id=result_id, user=request.user)
    
    return Response({
        'id': result.id,
        'name': result.name,
        'image_url': request.build_absolute_uri(result.image_url.url) if result.image_url else None,
        'location': result.location,
        'age': result.age,
        'gender': result.gender,
        'nationality': result.nationality,
        'socials': result.socials,
        'confidence': result.confidence,
        'fraud_risk': result.fraud_risk,
        'timestamp': result.timestamp,
    })

# Fraud detection views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_fraud_rules(request):
    """Get all fraud detection rules"""
    rules = FraudRule.objects.all().order_by('name')
    
    rules_data = []
    for rule in rules:
        rules_data.append({
            'id': rule.id,
            'name': rule.name,
            'description': rule.description,
            'enabled': rule.enabled,
            'threshold': rule.threshold,
            'created_at': rule.created_at,
            'updated_at': rule.updated_at,
        })
    
    return Response(rules_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_fraud_rule(request):
    """Create a new fraud detection rule"""
    name = request.data.get('name')
    description = request.data.get('description', '')
    enabled = request.data.get('enabled', True)
    threshold = request.data.get('threshold')
    
    if not name:
        return Response({'error': 'Rule name is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    rule = FraudRule.objects.create(
        name=name,
        description=description,
        enabled=enabled,
        threshold=threshold
    )
    
    # Log the activity
    ActivityLog.objects.create(
        user=request.user,
        action_type='fraud',
        description=f"User {request.user.username} created fraud rule: {name}",
        ip_address=request.META.get('REMOTE_ADDR')
    )
    
    return Response({
        'id': rule.id,
        'name': rule.name,
        'description': rule.description,
        'enabled': rule.enabled,
        'threshold': rule.threshold,
        'created_at': rule.created_at,
        'updated_at': rule.updated_at,
    }, status=status.HTTP_201_CREATED)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_fraud_rule(request, rule_id):
    """Update an existing fraud detection rule"""
    rule = get_object_or_404(FraudRule, id=rule_id)
    
    # Update fields if provided
    if 'name' in request.data:
        rule.name = request.data['name']
    
    if 'description' in request.data:
        rule.description = request.data['description']
        
    if 'enabled' in request.data:
        rule.enabled = request.data['enabled']
        
    if 'threshold' in request.data:
        rule.threshold = request.data['threshold']
    
    rule.save()
    
    # Log the activity
    ActivityLog.objects.create(
        user=request.user,
        action_type='fraud',
        description=f"User {request.user.username} updated fraud rule: {rule.name}",
        ip_address=request.META.get('REMOTE_ADDR')
    )
    
    return Response({
        'id': rule.id,
        'name': rule.name,
        'description': rule.description,
        'enabled': rule.enabled,
        'threshold': rule.threshold,
        'created_at': rule.created_at,
        'updated_at': rule.updated_at,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_fraud_alerts(request):
    """Get all fraud alerts for the current user"""
    alerts = FraudAlert.objects.filter(user=request.user).order_by('-created_at')
    
    # Handle optional pagination
    page = int(request.query_params.get('page', 1))
    limit = int(request.query_params.get('limit', 10))
    
    start = (page - 1) * limit
    end = page * limit
    
    alerts_data = []
    for alert in alerts[start:end]:
        rules = []
        for rule in alert.triggered_rules.all():
            rules.append({
                'id': rule.id,
                'name': rule.name,
            })
        
        alerts_data.append({
            'id': alert.id,
            'title': alert.title,
            'description': alert.description,
            'source_data': alert.source_data,
            'triggered_rules': rules,
            'risk_score': alert.risk_score,
            'status': alert.status,
            'created_at': alert.created_at,
            'updated_at': alert.updated_at,
        })
    
    return Response({
        'alerts': alerts_data,
        'total': alerts.count(),
        'page': page,
        'limit': limit,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_fraud_alert_by_id(request, alert_id):
    """Get a specific fraud alert by ID"""
    alert = get_object_or_404(FraudAlert, id=alert_id, user=request.user)
    
    rules = []
    for rule in alert.triggered_rules.all():
        rules.append({
            'id': rule.id,
            'name': rule.name,
        })
    
    return Response({
        'id': alert.id,
        'title': alert.title,
        'description': alert.description,
        'source_data': alert.source_data,
        'triggered_rules': rules,
        'risk_score': alert.risk_score,
        'status': alert.status,
        'created_at': alert.created_at,
        'updated_at': alert.updated_at,
    })

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_fraud_alert_status(request, alert_id):
    """Update the status of a fraud alert"""
    alert = get_object_or_404(FraudAlert, id=alert_id, user=request.user)
    
    status_value = request.data.get('status')
    if not status_value:
        return Response({'error': 'Status is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    valid_statuses = [choice[0] for choice in FraudAlert.STATUS_CHOICES]
    if status_value not in valid_statuses:
        return Response({'error': f'Invalid status. Must be one of {valid_statuses}'}, status=status.HTTP_400_BAD_REQUEST)
    
    alert.status = status_value
    alert.save()
    
    # Log the activity
    ActivityLog.objects.create(
        user=request.user,
        action_type='fraud',
        description=f"User {request.user.username} updated fraud alert status to {status_value}",
        ip_address=request.META.get('REMOTE_ADDR')
    )
    
    return Response({
        'id': alert.id,
        'status': alert.status,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_fraud(request):
    """Check for potential fraud in provided data"""
    data = request.data
    
    # In a production environment, this would actually analyze the data
    # For now, we'll simulate a fraud check with dummy data
    
    # Find some enabled rules to associate with the alert
    enabled_rules = FraudRule.objects.filter(enabled=True)[:2]
    
    # Create a fraud alert
    alert = FraudAlert.objects.create(
        user=request.user,
        title="Potential fraud detected",
        description="Suspicious activity patterns identified in the provided data",
        source_data=data,
        risk_score=0.75,
        status='new'
    )
    
    # Associate rules with the alert
    for rule in enabled_rules:
        alert.triggered_rules.add(rule)
    
    # Log the activity
    ActivityLog.objects.create(
        user=request.user,
        action_type='fraud',
        description=f"User {request.user.username} ran a fraud check",
        ip_address=request.META.get('REMOTE_ADDR')
    )
    
    rules = []
    for rule in alert.triggered_rules.all():
        rules.append({
            'id': rule.id,
            'name': rule.name,
        })
    
    return Response({
        'id': alert.id,
        'title': alert.title,
        'description': alert.description,
        'source_data': alert.source_data,
        'triggered_rules': rules,
        'risk_score': alert.risk_score,
        'status': alert.status,
        'created_at': alert.created_at,
    })

# Phishing detection views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_phishing_emails(request):
    """Get all phishing email analyses for the current user"""
    emails = PhishingEmail.objects.filter(user=request.user).order_by('-received_at')
    
    # Handle optional pagination
    page = int(request.query_params.get('page', 1))
    limit = int(request.query_params.get('limit', 10))
    
    start = (page - 1) * limit
    end = page * limit
    
    emails_data = []
    for email in emails[start:end]:
        emails_data.append({
            'id': email.id,
            'subject': email.subject,
            'sender': email.sender,
            'recipient': email.recipient,
            'received_at': email.received_at,
            'analyzed_at': email.analyzed_at,
            'status': email.status,
            'phishing_score': email.phishing_score,
        })
    
    return Response({
        'emails': emails_data,
        'total': emails.count(),
        'page': page,
        'limit': limit,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_phishing_email_by_id(request, email_id):
    """Get a specific phishing email analysis by ID"""
    email = get_object_or_404(PhishingEmail, id=email_id, user=request.user)
    
    # Get the indicators for this email
    indicators = PhishingIndicator.objects.filter(email=email).order_by('-severity')
    
    indicators_data = []
    for indicator in indicators:
        indicators_data.append({
            'id': indicator.id,
            'indicator_type': indicator.indicator_type,
            'description': indicator.description,
            'severity': indicator.severity,
            'location': indicator.location,
        })
    
    return Response({
        'id': email.id,
        'subject': email.subject,
        'sender': email.sender,
        'recipient': email.recipient,
        'content': email.content,
        'received_at': email.received_at,
        'analyzed_at': email.analyzed_at,
        'status': email.status,
        'phishing_score': email.phishing_score,
        'indicators': indicators_data,
    })

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_phishing_email_status(request, email_id):
    """Update the status of a phishing email"""
    email = get_object_or_404(PhishingEmail, id=email_id, user=request.user)
    
    status_value = request.data.get('status')
    if not status_value:
        return Response({'error': 'Status is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    valid_statuses = [choice[0] for choice in PhishingEmail.STATUS_CHOICES]
    if status_value not in valid_statuses:
        return Response({'error': f'Invalid status. Must be one of {valid_statuses}'}, status=status.HTTP_400_BAD_REQUEST)
    
    email.status = status_value
    email.save()
    
    # Log the activity
    ActivityLog.objects.create(
        user=request.user,
        action_type='phishing',
        description=f"User {request.user.username} updated phishing email status to {status_value}",
        ip_address=request.META.get('REMOTE_ADDR')
    )
    
    return Response({
        'id': email.id,
        'status': email.status,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_email(request):
    """Analyze an email for phishing indicators"""
    subject = request.data.get('subject', '')
    sender = request.data.get('sender', '')
    recipient = request.data.get('recipient', '')
    content = request.data.get('content', '')
    
    if not content:
        return Response({'error': 'Email content is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # In a production environment, this would actually analyze the email
    # For now, we'll simulate a phishing check with dummy data
    
    now = timezone.now()
    
    # Create a phishing email record
    email = PhishingEmail.objects.create(
        user=request.user,
        subject=subject,
        sender=sender,
        recipient=recipient,
        content=content,
        received_at=now,
        analyzed_at=now,
        status='flagged',
        phishing_score=0.85
    )
    
    # Add some sample indicators
    indicators = [
        {
            'indicator_type': 'Suspicious Link',
            'description': 'Email contains links to suspicious domains',
            'severity': 0.9,
            'location': 'Body, paragraph 2'
        },
        {
            'indicator_type': 'Urgency or Pressure',
            'description': 'Email creates a false sense of urgency',
            'severity': 0.7,
            'location': 'Subject line and first paragraph'
        },
        {
            'indicator_type': 'Grammar Errors',
            'description': 'Email contains multiple grammar and spelling errors',
            'severity': 0.5,
            'location': 'Throughout email'
        }
    ]
    
    indicator_objects = []
    for indicator in indicators:
        indicator_obj = PhishingIndicator.objects.create(
            email=email,
            indicator_type=indicator['indicator_type'],
            description=indicator['description'],
            severity=indicator['severity'],
            location=indicator['location']
        )
        indicator_objects.append({
            'id': indicator_obj.id,
            'indicator_type': indicator_obj.indicator_type,
            'description': indicator_obj.description,
            'severity': indicator_obj.severity,
            'location': indicator_obj.location,
        })
    
    # Log the activity
    ActivityLog.objects.create(
        user=request.user,
        action_type='phishing',
        description=f"User {request.user.username} analyzed an email for phishing",
        ip_address=request.META.get('REMOTE_ADDR')
    )
    
    return Response({
        'id': email.id,
        'subject': email.subject,
        'sender': email.sender,
        'recipient': email.recipient,
        'status': email.status,
        'phishing_score': email.phishing_score,
        'analyzed_at': email.analyzed_at,
        'indicators': indicator_objects,
    })