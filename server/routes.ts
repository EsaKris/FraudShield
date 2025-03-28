import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { photoService } from "./services/photoService";
import { fraudService } from "./services/fraudService";
import { z } from "zod";
import { insertPhotoResultSchema, insertFraudAlertSchema, insertActivityLogSchema } from "@shared/schema";
import path from "path";
import fs from "fs";

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  
  // Dashboard stats endpoint
  app.get('/api/stats', async (_req: Request, res: Response) => {
    // In a real implementation, this would fetch actual stats
    const stats = {
      identitiesVerified: 1254,
      fraudDetected: 37,
      suspiciousCases: 86,
      systemUptime: '99.8%'
    };
    
    res.json(stats);
  });
  
  // Activity logs endpoints
  app.get('/api/activities', async (_req: Request, res: Response) => {
    const activities = await storage.getActivityLogs();
    res.json(activities);
  });
  
  app.get('/api/activities/photo', async (_req: Request, res: Response) => {
    const activities = await storage.getActivityLogsByType('Photo Recognition');
    res.json(activities);
  });
  
  // Photo recognition endpoint
  app.post('/api/photo-recognition', upload.single('photo'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No photo provided' });
      }
      
      // Process the image
      const photoBuffer = req.file.buffer;
      const purpose = req.body.purpose || 'Identity Verification';
      
      // Call photo service to process the image
      const processResult = await photoService.processImage(photoBuffer);
      
      if (!processResult.success || !processResult.result) {
        return res.status(400).json({ message: processResult.error || 'Failed to process image' });
      }
      
      // Assess fraud risk
      const resultWithRisk = photoService.assessFraudRisk(processResult.result);
      
      // Save the result to storage
      const savedResult = await storage.createPhotoResult({
        userId: 1, // Use the default user (in a real app, this would be the authenticated user)
        imageUrl: null, // In a real app, this would be a URL to the saved image
        name: resultWithRisk.name,
        location: resultWithRisk.location,
        age: resultWithRisk.age,
        gender: resultWithRisk.gender,
        nationality: resultWithRisk.nationality,
        socials: resultWithRisk.socials,
        confidence: resultWithRisk.confidence,
        fraudRisk: resultWithRisk.fraudRisk
      });
      
      // Log the activity
      await storage.createActivityLog({
        userId: 1,
        activityType: 'Photo Recognition',
        details: `Identity verification for ${savedResult.name}`,
        status: 'Successful'
      });
      
      res.json(savedResult);
    } catch (error) {
      console.error('Photo recognition error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'An error occurred during photo processing' });
    }
  });
  
  // Fraud detection endpoints
  app.get('/api/fraud/alerts', async (_req: Request, res: Response) => {
    // Get fraud alerts from storage or use sample data
    const alerts = await storage.getFraudAlerts();
    
    // If there are no alerts in storage, use sample data
    if (alerts.length === 0) {
      const sampleAlerts = fraudService.getSampleFraudAlerts();
      res.json(sampleAlerts);
    } else {
      res.json(alerts);
    }
  });
  
  app.get('/api/fraud/rules', async (_req: Request, res: Response) => {
    const rules = fraudService.getRules();
    res.json(rules);
  });
  
  app.post('/api/fraud/rules', async (req: Request, res: Response) => {
    try {
      const updatedRules = req.body;
      const result = fraudService.updateRules(updatedRules);
      res.json(result);
    } catch (error) {
      console.error('Update rules error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to update fraud rules' });
    }
  });
  
  app.post('/api/fraud/check', async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const result = fraudService.detectFraud(data);
      
      // If fraud is detected, create an alert
      if (result.isFraudulent) {
        const alertData = {
          userId: 1,
          alertType: result.triggeredRules[0], // Use the first triggered rule as the alert type
          details: `Potential fraud detected: ${result.triggeredRules.join(', ')}`,
          severity: result.severity,
          status: 'Flagged'
        };
        
        await storage.createFraudAlert(alertData);
        
        // Log the activity
        await storage.createActivityLog({
          userId: 1,
          activityType: 'Fraud Alert',
          details: alertData.details,
          status: 'Flagged'
        });
      }
      
      res.json(result);
    } catch (error) {
      console.error('Fraud check error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to check for fraud' });
    }
  });
  
  const httpServer = createServer(app);
  
  return httpServer;
}
