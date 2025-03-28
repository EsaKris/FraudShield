import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { photoService } from "./services/photoService";
import { fraudService } from "./services/fraudService";
import { phishingService } from "./services/phishingService";
import { z } from "zod";
import { 
  insertPhotoResultSchema, 
  insertFraudAlertSchema, 
  insertActivityLogSchema,
  insertPhishingEmailSchema,
  insertPhishingIndicatorSchema
} from "@shared/schema";
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
      console.log("Received photo upload request", { 
        contentType: req.headers['content-type'],
        hasFile: !!req.file,
        fileSize: req.file?.size,
        mimetype: req.file?.mimetype,
        fieldname: req.file?.fieldname,
        purpose: req.body?.purpose
      });
      
      if (!req.file) {
        console.error("No file uploaded or file field name doesn't match 'photo'");
        return res.status(400).json({ 
          message: 'No photo provided',
          details: 'Make sure you are uploading a file with the field name "photo"'
        });
      }
      
      // Process the image
      const photoBuffer = req.file.buffer;
      const purpose = req.body.purpose || 'Identity Verification';
      
      console.log(`Processing photo for purpose: ${purpose}, buffer size: ${photoBuffer.length} bytes, mime type: ${req.file.mimetype}`);
      
      // Call photo service to process the image
      const processResult = await photoService.processImage(photoBuffer);
      
      if (!processResult.success || !processResult.result) {
        console.error("Photo processing failed", processResult.error);
        return res.status(400).json({ 
          message: processResult.error || 'Failed to process image',
          details: 'The image could not be processed. Try a different image or check if it contains a clear face.'
        });
      }
      
      console.log("Photo processed successfully, assessing fraud risk");
      
      // Assess fraud risk
      const resultWithRisk = photoService.assessFraudRisk(processResult.result);
      
      console.log("Saving results to storage", {
        name: resultWithRisk.name,
        confidence: resultWithRisk.confidence,
        fraudRisk: resultWithRisk.fraudRisk
      });
      
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
      
      console.log("Creating activity log");
      
      // Log the activity
      await storage.createActivityLog({
        userId: 1,
        activityType: 'Photo Recognition',
        details: `Identity verification for ${savedResult.name || 'Unknown Person'}`,
        status: 'Successful'
      });
      
      console.log("Photo recognition complete, returning results");
      
      // Return both the saved DB record and the processed result
      // This ensures we have the correct data types and format from both sources
      res.json({
        ...savedResult,
        ...resultWithRisk
      });
    } catch (error) {
      console.error('Photo recognition error:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      });
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
  
  // Phishing email endpoints
  app.get('/api/phishing/emails', async (_req: Request, res: Response) => {
    try {
      const emails = await storage.getPhishingEmails();
      res.json(emails);
    } catch (error) {
      console.error('Get phishing emails error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to retrieve phishing emails' });
    }
  });
  
  app.get('/api/phishing/emails/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid email ID' });
      }
      
      const email = await storage.getPhishingEmailById(id);
      if (!email) {
        return res.status(404).json({ message: 'Email not found' });
      }
      
      res.json(email);
    } catch (error) {
      console.error('Get phishing email error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to retrieve phishing email' });
    }
  });
  
  app.post('/api/phishing/analyze', async (req: Request, res: Response) => {
    try {
      const { content, sender, subject, recipient } = req.body;
      
      if (!content || !sender || !subject || !recipient) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // Analyze the email content
      const analysisResult = await phishingService.analyzeEmail(content, sender, subject);
      
      if (!analysisResult.success) {
        return res.status(400).json({ message: analysisResult.error || 'Failed to analyze email' });
      }
      
      // Save the email to storage
      const newEmail = await storage.createPhishingEmail({
        userId: 1, // Use the default user (in a real app, this would be the authenticated user)
        subject,
        sender,
        recipient,
        content,
        receivedAt: new Date().toISOString(),
        phishingScore: analysisResult.phishingScore,
        status: analysisResult.phishingScore > 70 ? 'Quarantined' : 'Analyzed'
      });
      
      // Save the indicators
      for (const indicator of analysisResult.indicators) {
        await storage.createPhishingIndicator({
          emailId: newEmail.id,
          type: indicator.type,
          description: indicator.description,
          severity: indicator.severity,
          confidence: indicator.confidence
        });
      }
      
      // Log the activity
      await storage.createActivityLog({
        userId: 1,
        activityType: 'Phishing Detection',
        details: `Email analyzed: ${subject} (Score: ${analysisResult.phishingScore})`,
        status: analysisResult.phishingScore > 70 ? 'Flagged' : 'Successful'
      });
      
      // Get the complete email with indicators
      const completeEmail = await storage.getPhishingEmailById(newEmail.id);
      
      res.json(completeEmail);
    } catch (error) {
      console.error('Phishing analysis error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'An error occurred during email analysis' });
    }
  });
  
  app.patch('/api/phishing/emails/:id/status', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid email ID' });
      }
      
      if (!status || !['Analyzed', 'Pending', 'Quarantined'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      
      const updatedEmail = await storage.updatePhishingEmailStatus(id, status);
      if (!updatedEmail) {
        return res.status(404).json({ message: 'Email not found' });
      }
      
      res.json(updatedEmail);
    } catch (error) {
      console.error('Update phishing email status error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to update email status' });
    }
  });
  
  const httpServer = createServer(app);
  
  return httpServer;
}
