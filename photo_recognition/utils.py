import os
import cv2
import numpy as np
from django.conf import settings
from PIL import Image
import io
import json
import random
from datetime import datetime

def analyze_face_with_opencv(photo):
    """
    Analyze a face using OpenCV and return detected information
    """
    try:
        # Convert InMemoryUploadedFile to numpy array
        image = Image.open(photo)
        image_array = np.array(image.convert('RGB'))
        
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        
        # Load face detector cascade
        face_cascade_path = os.path.join(settings.FACE_RECOGNITION_MODELS_PATH, 'haarcascade_frontalface_default.xml')
        
        # If the model doesn't exist, download it or use a default path
        if not os.path.exists(face_cascade_path):
            face_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        
        face_cascade = cv2.CascadeClassifier(face_cascade_path)
        
        # Detect faces
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) == 0:
            return {
                'success': False,
                'message': 'No faces detected in the image'
            }
        
        # Get the largest face (assuming that's the main subject)
        largest_face = max(faces, key=lambda rect: rect[2] * rect[3])
        x, y, w, h = largest_face
        
        # Extract face region
        face_region = image_array[y:y+h, x:x+w]
        
        # Basic analysis (in a real system, use more sophisticated models for these predictions)
        # For demo purposes, we'll use very simple heuristics
        
        # Very simple age estimation based on face proportions
        # In a real system, use a trained age estimation model
        avg_color = np.mean(face_region, axis=(0, 1))
        brightness = np.mean(avg_color)
        
        # Basic heuristic - just a simple example, not accurate
        age = int(25 + (brightness / 255) * 30)
        
        # Simplified gender estimation
        # In a real system, use a trained gender classification model
        # For demo, we'll use random value since this is just a placeholder
        gender = random.choice(['Male', 'Female'])
        
        # Return analysis results
        return {
            'success': True,
            'data': {
                'name': "Unknown",
                'location': "Unknown",
                'age': age,
                'gender': gender,
                'nationality': "Unknown",
                'socials': {},
                'confidence': 0.7,
                'fraud_risk': "Low"
            }
        }
    
    except Exception as e:
        return {
            'success': False,
            'message': f'Error analyzing image: {str(e)}'
        }

def estimate_fraud_risk(face_data):
    """
    Estimate fraud risk based on face analysis
    This is a simplified version for demonstration
    """
    # In a real system, this would use more sophisticated models and heuristics
    risk_scores = {
        'undetected_face': 0.8,
        'low_confidence': 0.6,
        'average': 0.3,
        'high_confidence': 0.1
    }
    
    confidence = face_data.get('confidence', 0)
    
    if not face_data.get('success', False):
        return 'High', risk_scores['undetected_face']
    elif confidence < 0.5:
        return 'Medium', risk_scores['low_confidence']
    elif confidence < 0.7:
        return 'Low', risk_scores['average']
    else:
        return 'Very Low', risk_scores['high_confidence']

def download_models():
    """
    Download or ensure the face recognition models are available
    """
    try:
        models_dir = settings.FACE_RECOGNITION_MODELS_PATH
        os.makedirs(models_dir, exist_ok=True)
        
        # For OpenCV, the models are typically included with the library
        # but we can copy them to our models directory for consistency
        haarcascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        
        if os.path.exists(haarcascade_path):
            # Copy the model file to our models directory
            target_path = os.path.join(models_dir, 'haarcascade_frontalface_default.xml')
            if not os.path.exists(target_path):
                with open(haarcascade_path, 'rb') as src, open(target_path, 'wb') as dst:
                    dst.write(src.read())
            
            return {'success': True, 'message': 'Face detection models downloaded successfully'}
        else:
            return {'success': False, 'message': 'Could not find OpenCV face detection models'}
    
    except Exception as e:
        return {'success': False, 'message': f'Error downloading models: {str(e)}'}