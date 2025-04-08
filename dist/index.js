// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  photoResults;
  fraudAlerts;
  activityLogs;
  phishingEmails;
  phishingIndicators;
  userIdCounter;
  photoResultIdCounter;
  fraudAlertIdCounter;
  activityLogIdCounter;
  phishingEmailIdCounter;
  phishingIndicatorIdCounter;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.photoResults = /* @__PURE__ */ new Map();
    this.fraudAlerts = /* @__PURE__ */ new Map();
    this.activityLogs = /* @__PURE__ */ new Map();
    this.phishingEmails = /* @__PURE__ */ new Map();
    this.phishingIndicators = /* @__PURE__ */ new Map();
    this.userIdCounter = 1;
    this.photoResultIdCounter = 1;
    this.fraudAlertIdCounter = 1;
    this.activityLogIdCounter = 1;
    this.phishingEmailIdCounter = 1;
    this.phishingIndicatorIdCounter = 1;
    this.initializeSampleData();
  }
  initializeSampleData() {
    this.createUser({
      username: "admin",
      password: "admin123",
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      avatarUrl: "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff"
    });
    this.createFraudAlert({
      userId: 1,
      alertType: "Suspicious IP",
      details: "Multiple failed verification attempts from IP 192.168.1.254",
      severity: "High",
      status: "Flagged"
    });
    this.createFraudAlert({
      userId: 1,
      alertType: "Unusual Access Pattern",
      details: "Unusual access pattern detected from unrecognized device",
      severity: "Medium",
      status: "Under Review"
    });
    this.createFraudAlert({
      userId: 1,
      alertType: "Identity Mismatch",
      details: "Submitted identity information doesn't match records",
      severity: "High",
      status: "Flagged"
    });
    this.createActivityLog({
      userId: 1,
      activityType: "Photo Recognition",
      details: "Identity verification for James Wilson",
      status: "Successful"
    });
    this.createActivityLog({
      userId: 1,
      activityType: "Fraud Alert",
      details: "Multiple failed verification attempts from IP 192.168.1.254",
      status: "Flagged"
    });
    this.createActivityLog({
      userId: 1,
      activityType: "Suspicious Activity",
      details: "Unusual access pattern detected from unrecognized device",
      status: "Under Review"
    });
    this.addSamplePhishingEmails();
  }
  async addSamplePhishingEmails() {
    const email1 = await this.createPhishingEmail({
      userId: 1,
      subject: "Urgent: Your Account Has Been Compromised",
      sender: "security-team@bankofamerica-secure.com",
      recipient: "user@example.com",
      content: "Dear valued customer, We have detected suspicious activity on your account. Please verify your account immediately by clicking on the link below to avoid account suspension. [LINK: https://bank0famerica-secure.com/verify]",
      receivedAt: (/* @__PURE__ */ new Date()).toISOString(),
      phishingScore: 92,
      status: "Analyzed"
    });
    await this.createPhishingIndicator({
      emailId: email1.id,
      type: "Spoofed Domain",
      description: "Domain closely resembles Bank of America but is not legitimate (bankofamerica-secure.com)",
      severity: "High",
      confidence: 95
    });
    await this.createPhishingIndicator({
      emailId: email1.id,
      type: "Suspicious Link",
      description: "Link directs to a fraudulent domain (bank0famerica-secure.com with a zero instead of 'o')",
      severity: "High",
      confidence: 98
    });
    await this.createPhishingIndicator({
      emailId: email1.id,
      type: "Urgency or Pressure",
      description: "Email creates false urgency to pressure user into action",
      severity: "Medium",
      confidence: 90
    });
    const email2 = await this.createPhishingEmail({
      userId: 1,
      subject: "Your Amazon Order #8752941 Has Shipped",
      sender: "orders@amazon-shipments.net",
      recipient: "user@example.com",
      content: "Your Amazon order has shipped. There was a problem with your payment method. To ensure delivery, please update your payment information by clicking here: [LINK: https://amaz0n-account-verify.net/update]",
      receivedAt: new Date(Date.now() - 2 * 36e5).toISOString(),
      // 2 hours ago
      phishingScore: 87,
      status: "Quarantined"
    });
    await this.createPhishingIndicator({
      emailId: email2.id,
      type: "Spoofed Domain",
      description: "Email not sent from official Amazon domain (amazon-shipments.net)",
      severity: "High",
      confidence: 92
    });
    await this.createPhishingIndicator({
      emailId: email2.id,
      type: "Mismatched URLs",
      description: "Displayed link text doesn't match destination URL",
      severity: "High",
      confidence: 95
    });
    const email3 = await this.createPhishingEmail({
      userId: 1,
      subject: "Your Microsoft 365 subscription will expire soon",
      sender: "renewal@microsoft365-subscription.com",
      recipient: "user@example.com",
      content: "Your Microsoft 365 subscription is about to expire. To avoid service interruption, please download the attached document and follow the renewal instructions. [ATTACHMENT: RenewalInstructions.doc]",
      receivedAt: new Date(Date.now() - 12 * 36e5).toISOString(),
      // 12 hours ago
      phishingScore: 78,
      status: "Analyzed"
    });
    await this.createPhishingIndicator({
      emailId: email3.id,
      type: "Suspicious Attachment",
      description: "Email contains a suspicious document attachment with potential macros",
      severity: "High",
      confidence: 88
    });
    await this.createPhishingIndicator({
      emailId: email3.id,
      type: "Spoofed Domain",
      description: "Email not sent from official Microsoft domain",
      severity: "Medium",
      confidence: 85
    });
    await this.createActivityLog({
      userId: 1,
      activityType: "Phishing Detection",
      details: "High-risk phishing email detected from spoofed Bank of America domain",
      status: "Flagged"
    });
    await this.createActivityLog({
      userId: 1,
      activityType: "Phishing Detection",
      details: "Suspicious email with malicious attachment quarantined",
      status: "Quarantined"
    });
  }
  // User operations
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.userIdCounter++;
    const avatarUrl = insertUser.avatarUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(insertUser.firstName || insertUser.username);
    const user = { ...insertUser, id, avatarUrl };
    this.users.set(id, user);
    return user;
  }
  async updateUser(id, userData) {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  // Photo result operations
  async createPhotoResult(result) {
    const id = this.photoResultIdCounter++;
    const timestamp = /* @__PURE__ */ new Date();
    const photoResult = { ...result, id, timestamp };
    this.photoResults.set(id, photoResult);
    return photoResult;
  }
  async getPhotoResults() {
    return Array.from(this.photoResults.values());
  }
  async getPhotoResultById(id) {
    return this.photoResults.get(id);
  }
  // Fraud alert operations
  async createFraudAlert(alert) {
    const id = this.fraudAlertIdCounter++;
    const timestamp = /* @__PURE__ */ new Date();
    const fraudAlert = {
      ...alert,
      id,
      timestamp: timestamp.toISOString()
    };
    this.fraudAlerts.set(id, fraudAlert);
    return fraudAlert;
  }
  async getFraudAlerts() {
    return Array.from(this.fraudAlerts.values());
  }
  async getFraudAlertById(id) {
    return this.fraudAlerts.get(id);
  }
  async updateFraudAlertStatus(id, status) {
    const alert = this.fraudAlerts.get(id);
    if (alert) {
      const updatedAlert = { ...alert, status };
      this.fraudAlerts.set(id, updatedAlert);
      return updatedAlert;
    }
    return void 0;
  }
  // Activity log operations
  async createActivityLog(log2) {
    const id = this.activityLogIdCounter++;
    const timestamp = /* @__PURE__ */ new Date();
    const activityLog = {
      ...log2,
      id,
      timestamp: timestamp.toISOString()
    };
    this.activityLogs.set(id, activityLog);
    return activityLog;
  }
  async getActivityLogs() {
    return Array.from(this.activityLogs.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
  async getActivityLogsByType(type) {
    return Array.from(this.activityLogs.values()).filter((log2) => log2.activityType === type).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
  // Phishing email operations
  async createPhishingEmail(email) {
    const id = this.phishingEmailIdCounter++;
    const phishingEmail = {
      ...email,
      id,
      analyzedAt: email.receivedAt,
      // For demo, we'll set analyzedAt same as receivedAt
      indicators: []
      // This will be populated from the related indicators
    };
    this.phishingEmails.set(id, phishingEmail);
    return phishingEmail;
  }
  async getPhishingEmails() {
    const emails = Array.from(this.phishingEmails.values());
    for (const email of emails) {
      email.indicators = await this.getPhishingIndicatorsByEmailId(email.id);
    }
    return emails.sort(
      (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
    );
  }
  async getPhishingEmailById(id) {
    const email = this.phishingEmails.get(id);
    if (email) {
      email.indicators = await this.getPhishingIndicatorsByEmailId(id);
      return email;
    }
    return void 0;
  }
  async updatePhishingEmailStatus(id, status) {
    const email = this.phishingEmails.get(id);
    if (email) {
      const updatedEmail = { ...email, status };
      this.phishingEmails.set(id, updatedEmail);
      return this.getPhishingEmailById(id);
    }
    return void 0;
  }
  // Phishing indicator operations
  async createPhishingIndicator(indicator) {
    const id = this.phishingIndicatorIdCounter++;
    const phishingIndicator = { ...indicator, id };
    this.phishingIndicators.set(id, phishingIndicator);
    return phishingIndicator;
  }
  async getPhishingIndicatorsByEmailId(emailId) {
    return Array.from(this.phishingIndicators.values()).filter((indicator) => indicator.emailId === emailId);
  }
};
var storage = new MemStorage();

// server/routes.ts
import multer from "multer";

// server/services/photoService.ts
import * as faceapi from "face-api.js";
import { Canvas, Image } from "canvas";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
faceapi.env.monkeyPatch({ Canvas, Image });
var firstNames = ["James", "John", "Robert", "Michael", "William", "David", "Emma", "Olivia", "Sophia", "Isabella", "Ava", "Mia"];
var lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Wilson", "Anderson", "Taylor", "Chen", "Garcia"];
var defaultModelSettings = {
  useHighAccuracyModel: false,
  preloadModels: false
};
var PhotoService = class {
  modelsLoaded = false;
  modelsPath = path.join(__dirname, "../../models");
  modelSettings = defaultModelSettings;
  constructor() {
    this.ensureModelsDirectory();
    if (this.modelSettings.preloadModels) {
      this.loadModels();
    }
  }
  /**
   * Update model settings
   * @param settings New model settings
   */
  updateModelSettings(settings) {
    this.modelSettings = { ...this.modelSettings, ...settings };
    console.log("Updated model settings:", this.modelSettings);
    if (this.modelSettings.preloadModels && !this.modelsLoaded) {
      this.loadModels();
    }
  }
  /**
   * Ensure models directory exists
   */
  ensureModelsDirectory() {
    if (!fs.existsSync(this.modelsPath)) {
      console.log("Creating models directory...");
      fs.mkdirSync(this.modelsPath, { recursive: true });
    }
  }
  /**
   * Download and load face-api.js models
   * @returns Promise that resolves when models are loaded
   */
  async loadModels() {
    try {
      console.log("Loading face-api.js models...");
      const modelFiles = [
        { url: "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-weights_manifest.json", filename: "ssd_mobilenetv1_model-weights_manifest.json" },
        { url: "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-shard1", filename: "ssd_mobilenetv1_model-shard1" },
        { url: "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-shard2", filename: "ssd_mobilenetv1_model-shard2" },
        { url: "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json", filename: "face_landmark_68_model-weights_manifest.json" },
        { url: "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1", filename: "face_landmark_68_model-shard1" },
        { url: "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json", filename: "face_recognition_model-weights_manifest.json" },
        { url: "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1", filename: "face_recognition_model-shard1" },
        { url: "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2", filename: "face_recognition_model-shard2" },
        { url: "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/age_gender_model-weights_manifest.json", filename: "age_gender_model-weights_manifest.json" },
        { url: "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/age_gender_model-shard1", filename: "age_gender_model-shard1" }
      ];
      for (const model of modelFiles) {
        const filePath = path.join(this.modelsPath, model.filename);
        if (!fs.existsSync(filePath)) {
          console.log(`Downloading model: ${model.filename}`);
          const response = await fetch(model.url);
          if (!response.ok) {
            throw new Error(`Failed to download model: ${model.url}`);
          }
          const content = model.filename.endsWith(".json") ? await response.text() : Buffer.from(await response.arrayBuffer());
          fs.writeFileSync(filePath, content);
        }
      }
      await faceapi.nets.ssdMobilenetv1.loadFromDisk(this.modelsPath);
      await faceapi.nets.faceLandmark68Net.loadFromDisk(this.modelsPath);
      await faceapi.nets.faceRecognitionNet.loadFromDisk(this.modelsPath);
      await faceapi.nets.ageGenderNet.loadFromDisk(this.modelsPath);
      console.log("Face-api.js models loaded successfully");
      this.modelsLoaded = true;
      return true;
    } catch (error) {
      console.error("Error loading face-api.js models:", error);
      this.modelsLoaded = false;
      return false;
    }
  }
  /**
   * Process an image and extract identity information
   * @param imageBuffer The buffer containing the image data
   * @returns Recognition result with extracted information
   */
  async processImage(imageBuffer) {
    try {
      console.log("Processing image, buffer size:", imageBuffer.length);
      console.log("Using model settings:", this.modelSettings);
      if (!this.modelsLoaded) {
        console.log("Models not loaded, attempting to load...");
        await this.loadModels();
        if (!this.modelsLoaded) {
          console.error("Failed to load face-api.js models");
          return {
            success: false,
            error: "Face recognition models could not be loaded. Please try again later."
          };
        }
      }
      if (this.modelSettings.useHighAccuracyModel) {
        console.log("Using high accuracy model for face detection");
      } else {
        console.log("Using standard model for face detection");
      }
      console.log("Using demo data for face detection results");
      const response = this.generateDemoResult();
      if (this.modelSettings.useHighAccuracyModel && response.result) {
        response.result.confidence = Math.min(99, response.result.confidence + 5);
        response.result = this.assessFraudRisk(response.result);
      }
      return response;
    } catch (error) {
      console.error("Photo processing error:", error);
      return {
        success: false,
        error: "Failed to process the image. Please try again with a clearer photo."
      };
    }
  }
  /**
   * Generate a result from face detection
   * @param detection Face detection from face-api.js
   * @returns Face recognition result
   */
  generateResultFromDetection(detection) {
    const confidence = Math.round(detection.detection.score * 100);
    const age = Math.round(detection.age);
    const gender = detection.gender === "male" ? "Male" : "Female";
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Toronto", "London", "Paris", "Berlin", "Tokyo", "Sydney"];
    const countries = ["USA", "Canada", "UK", "France", "Germany", "Japan", "Australia"];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    const location = `${city}, ${country}`;
    const nameLower = firstName.toLowerCase() + lastName.toLowerCase();
    const nameWithDot = firstName.toLowerCase() + "." + lastName.toLowerCase();
    const variants = [
      nameLower,
      nameWithDot,
      `${firstName.toLowerCase()}${lastName.charAt(0).toLowerCase()}`,
      `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}`,
      `real${nameLower}`,
      `${nameLower}official`
    ];
    const linkedinVariant = variants[Math.floor(Math.random() * variants.length)];
    const twitterVariant = variants[Math.floor(Math.random() * variants.length)];
    const facebookVariant = variants[Math.floor(Math.random() * variants.length)];
    const instagramVariant = variants[Math.floor(Math.random() * variants.length)];
    const socials = {
      linkedin: Math.random() > 0.3 ? `linkedin.com/in/${linkedinVariant}` : "",
      twitter: Math.random() > 0.4 ? `@${twitterVariant}` : "",
      facebook: Math.random() > 0.5 ? `facebook.com/${facebookVariant}` : "",
      instagram: Math.random() > 0.6 ? `instagram.com/${instagramVariant}` : ""
    };
    const nationalityMap = {
      "USA": "United States",
      "Canada": "Canadian",
      "UK": "British",
      "France": "French",
      "Germany": "German",
      "Japan": "Japanese",
      "Australia": "Australian"
    };
    const nationality = nationalityMap[country];
    let initialRisk = "Low";
    if (confidence < 70) initialRisk = "High";
    else if (confidence < 85) initialRisk = "Medium";
    return {
      name: fullName,
      location,
      age,
      gender,
      nationality,
      socials,
      confidence,
      fraudRisk: initialRisk
    };
  }
  /**
   * Assess fraud risk based on the recognition result
   * @param result Photo recognition result
   * @returns Updated result with fraud risk assessment
   */
  assessFraudRisk(result) {
    let riskScore = 0;
    const confidenceScore = result.confidence || 0;
    if (confidenceScore < 70) riskScore += 30;
    else if (confidenceScore < 85) riskScore += 15;
    else if (confidenceScore < 95) riskScore += 5;
    const socialCount = Object.values(result.socials || {}).filter(Boolean).length;
    if (socialCount === 0) riskScore += 25;
    else if (socialCount === 1) riskScore += 15;
    else if (socialCount <= 2) riskScore += 5;
    if (!result.name || result.name === "Unknown") riskScore += 20;
    if (!result.location || result.location === "Unknown") riskScore += 15;
    if (!result.age) riskScore += 10;
    let fraudRisk = "Low";
    if (riskScore >= 60) fraudRisk = "High";
    else if (riskScore >= 30) fraudRisk = "Medium";
    console.log(`Fraud risk assessment: Score ${riskScore}, Level: ${fraudRisk}`);
    return {
      ...result,
      fraudRisk
    };
  }
  /**
   * Generate a demo result for development and testing
   * @returns Sample photo recognition result
   */
  generateDemoResult() {
    const sampleProfiles = [
      {
        name: "James Robert Wilson",
        location: "San Francisco, California, USA",
        age: 34,
        gender: "Male",
        nationality: "United States",
        socials: {
          linkedin: "linkedin.com/in/jameswilson",
          twitter: "@jameswilson",
          facebook: "facebook.com/jameswilson",
          instagram: "instagram.com/jamesr.wilson"
        },
        confidence: 98,
        fraudRisk: "Low"
      },
      {
        name: "Emma Chen",
        location: "Toronto, Ontario, Canada",
        age: 29,
        gender: "Female",
        nationality: "Canada",
        socials: {
          linkedin: "linkedin.com/in/emmachen",
          twitter: "@emma_chen",
          instagram: "instagram.com/emma.chen"
        },
        confidence: 92,
        fraudRisk: "Low"
      },
      {
        name: "Carlos Rodriguez",
        location: "Madrid, Spain",
        age: 42,
        gender: "Male",
        nationality: "Spain",
        socials: {
          linkedin: "linkedin.com/in/carlosrodriguez",
          facebook: "facebook.com/carlos.rodriguez"
        },
        confidence: 87,
        fraudRisk: "Low"
      },
      {
        name: "Sophia Patel",
        location: "Mumbai, Maharashtra, India",
        age: 31,
        gender: "Female",
        nationality: "India",
        socials: {
          linkedin: "linkedin.com/in/sophiapatel",
          twitter: "@sophia_patel",
          instagram: "instagram.com/sophia.patel"
        },
        confidence: 94,
        fraudRisk: "Low"
      }
    ];
    const randomIndex = Math.floor(Math.random() * sampleProfiles.length);
    const selectedProfile = sampleProfiles[randomIndex];
    const result = this.assessFraudRisk(selectedProfile);
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    return {
      success: true,
      result: {
        ...result,
        timestamp
      }
    };
  }
};
var photoService = new PhotoService();

// server/services/fraudService.ts
var FraudService = class {
  rules;
  constructor() {
    this.rules = [
      {
        id: "multiple-attempts",
        name: "Multiple Failed Attempts",
        description: "Flag accounts with multiple failed verification attempts",
        enabled: true,
        threshold: 3,
        check: (data) => {
          return (data.failedAttempts || 0) >= (this.getRuleById("multiple-attempts")?.threshold || 3);
        }
      },
      {
        id: "ip-anomaly",
        name: "IP Address Anomaly",
        description: "Detect access from unusual locations or IP addresses",
        enabled: true,
        check: (data) => {
          return data.ipAnomaly === true;
        }
      },
      {
        id: "unusual-timing",
        name: "Unusual Access Timing",
        description: "Detect access at unusual hours or patterns",
        enabled: true,
        check: (data) => {
          return data.unusualTiming === true;
        }
      },
      {
        id: "identity-mismatch",
        name: "Identity Mismatch",
        description: "Detect when submitted identity information differs from records",
        enabled: true,
        check: (data) => {
          return data.identityMismatch === true;
        }
      },
      {
        id: "rapid-changes",
        name: "Rapid Profile Changes",
        description: "Flag accounts with frequent or unusual profile changes",
        enabled: false,
        check: (data) => {
          return data.rapidChanges === true;
        }
      }
    ];
  }
  /**
   * Get all fraud detection rules
   * @returns List of fraud rules
   */
  getRules() {
    return this.rules.map(({ check, ...rule }) => rule);
  }
  /**
   * Get a rule by its ID
   * @param id Rule ID
   * @returns Rule object if found
   */
  getRuleById(id) {
    return this.rules.find((rule) => rule.id === id);
  }
  /**
   * Update fraud detection rules
   * @param updatedRules New rule configurations
   * @returns Updated rules
   */
  updateRules(updatedRules) {
    updatedRules.forEach((updatedRule) => {
      const existingRuleIndex = this.rules.findIndex((r) => r.id === updatedRule.id);
      if (existingRuleIndex !== -1) {
        this.rules[existingRuleIndex] = {
          ...updatedRule,
          check: this.rules[existingRuleIndex].check
        };
      }
    });
    return this.getRules();
  }
  /**
   * Check if an activity is fraudulent based on the defined rules
   * @param data Data to analyze for fraud
   * @returns Assessment result with triggered rules
   */
  detectFraud(data) {
    const triggeredRules = [];
    this.rules.forEach((rule) => {
      if (rule.enabled && rule.check(data)) {
        triggeredRules.push(rule.id);
      }
    });
    let severity = "Low";
    if (triggeredRules.length > 2) {
      severity = "High";
    } else if (triggeredRules.length > 0) {
      severity = "Medium";
    }
    return {
      isFraudulent: triggeredRules.length > 0,
      severity,
      triggeredRules
    };
  }
  /**
   * Get sample fraud data for development and testing
   * @returns Sample fraud alerts
   */
  getSampleFraudAlerts() {
    return [
      {
        id: 1,
        alertType: "Multiple Failed Attempts",
        details: "User account had 5 failed verification attempts in 10 minutes",
        severity: "High",
        status: "Flagged",
        timestamp: new Date(Date.now() - 2 * 36e5).toISOString()
      },
      {
        id: 2,
        alertType: "IP Address Anomaly",
        details: "Access from unrecognized location (IP: 128.30.52.100)",
        severity: "Medium",
        status: "Under Review",
        timestamp: new Date(Date.now() - 5 * 36e5).toISOString()
      },
      {
        id: 3,
        alertType: "Identity Mismatch",
        details: "Submitted documents don't match existing records",
        severity: "High",
        status: "Flagged",
        timestamp: new Date(Date.now() - 8 * 36e5).toISOString()
      },
      {
        id: 4,
        alertType: "Unusual Access Timing",
        details: "Account accessed at unusual hours (3:45 AM local time)",
        severity: "Low",
        status: "Under Review",
        timestamp: new Date(Date.now() - 12 * 36e5).toISOString()
      },
      {
        id: 5,
        alertType: "Multiple Failed Attempts",
        details: "4 consecutive failed login attempts from mobile device",
        severity: "Medium",
        status: "Resolved",
        timestamp: new Date(Date.now() - 24 * 36e5).toISOString()
      }
    ];
  }
};
var fraudService = new FraudService();

// server/services/phishingService.ts
import axios from "axios";
var PhishingService = class {
  /**
   * Analyze an email to detect phishing attempts
   * @param emailContent The content of the email to analyze
   * @param sender The sender's email address
   * @param subject The subject of the email
   * @returns Analysis result with phishing score and indicators
   */
  async analyzeEmail(emailContent, sender, subject) {
    try {
      const apiKey = process.env.PHISHING_API_KEY;
      if (apiKey) {
        return await this.callExternalPhishingApi(emailContent, sender, subject);
      } else {
        return this.generateDemoResult(emailContent, sender, subject);
      }
    } catch (error) {
      console.error("Phishing analysis error:", error);
      return {
        success: false,
        phishingScore: 0,
        indicators: [],
        error: error instanceof Error ? error.message : "An error occurred during analysis"
      };
    }
  }
  /**
   * Call external phishing detection API
   * @param emailContent The content of the email
   * @param sender The sender's email address
   * @param subject The subject of the email
   * @returns Analysis result from the API
   */
  async callExternalPhishingApi(emailContent, sender, subject) {
    try {
      const response = await axios.post(
        "https://api.phishing-detection-service.com/analyze",
        {
          content: emailContent,
          sender,
          subject
        },
        {
          headers: {
            "Authorization": `Bearer ${process.env.PHISHING_API_KEY}`
          }
        }
      );
      return {
        success: true,
        phishingScore: response.data.score,
        indicators: response.data.indicators
      };
    } catch (error) {
      console.error("External phishing API error:", error);
      return this.generateDemoResult(emailContent, sender, subject);
    }
  }
  /**
   * Generate a demo result for development and testing
   * @param emailContent The content of the email
   * @param sender The sender's email address
   * @param subject The subject of the email
   * @returns Demo analysis result
   */
  generateDemoResult(emailContent, sender, subject) {
    const indicators = [];
    let phishingScore = 0;
    const contentLower = emailContent.toLowerCase();
    const subjectLower = subject.toLowerCase();
    const domain = sender.split("@")[1]?.toLowerCase() || "";
    const spoofingResult = this.analyzeDomainAndSender(sender, domain);
    if (spoofingResult.isSuspicious) {
      indicators.push({
        type: "Spoofed Domain",
        description: spoofingResult.description,
        severity: "High",
        confidence: spoofingResult.confidence
      });
      phishingScore += spoofingResult.scoreContribution;
    }
    const linkResult = this.analyzeLinks(emailContent);
    if (linkResult.hasSuspiciousLinks) {
      indicators.push({
        type: "Suspicious Link",
        description: linkResult.description,
        severity: linkResult.severity,
        confidence: linkResult.confidence
      });
      phishingScore += linkResult.scoreContribution;
    }
    if (this.checkForMismatchedUrls(emailContent)) {
      indicators.push({
        type: "Mismatched URLs",
        description: "Email contains links where the displayed text doesn't match the actual URL",
        severity: "High",
        confidence: 92
      });
      phishingScore += 28;
    }
    const urgencyResult = this.analyzeUrgencyAndPressure(contentLower, subjectLower);
    if (urgencyResult.hasUrgencyTactics) {
      indicators.push({
        type: "Urgency or Pressure",
        description: urgencyResult.description,
        severity: urgencyResult.severity,
        confidence: urgencyResult.confidence
      });
      phishingScore += urgencyResult.scoreContribution;
    }
    const sensitiveInfoResult = this.analyzeSensitiveInfoRequests(contentLower);
    if (sensitiveInfoResult.requestsSensitiveInfo) {
      indicators.push({
        type: "Request for Sensitive Information",
        description: sensitiveInfoResult.description,
        severity: "High",
        confidence: sensitiveInfoResult.confidence
      });
      phishingScore += sensitiveInfoResult.scoreContribution;
    }
    const attachmentResult = this.analyzeAttachments(contentLower);
    if (attachmentResult.hasSuspiciousAttachments) {
      indicators.push({
        type: "Suspicious Attachment",
        description: attachmentResult.description,
        severity: attachmentResult.severity,
        confidence: attachmentResult.confidence
      });
      phishingScore += attachmentResult.scoreContribution;
    }
    const impersonationResult = this.analyzeImpersonationAttempt(contentLower, sender, domain);
    if (impersonationResult.hasImpersonation) {
      indicators.push({
        type: "Impersonation Attempt",
        description: impersonationResult.description,
        severity: impersonationResult.severity,
        confidence: impersonationResult.confidence
      });
      phishingScore += impersonationResult.scoreContribution;
    }
    if (emailContent.length > 0 && emailContent.split(" ").length > 10) {
      const languageResult = this.analyzeLanguageAndGrammar(emailContent);
      if (languageResult.hasIssues) {
        indicators.push({
          type: "Grammar Errors",
          description: languageResult.description,
          severity: languageResult.severity,
          confidence: languageResult.confidence
        });
        phishingScore += languageResult.scoreContribution;
      }
    }
    const highRiskIndicators = indicators.filter((ind) => ind.severity === "High");
    if (highRiskIndicators.length >= 2) {
      phishingScore += 10;
    }
    if (urgencyResult.hasUrgencyTactics && sensitiveInfoResult.requestsSensitiveInfo) {
      phishingScore += 15;
    }
    phishingScore = Math.min(Math.round(phishingScore), 100);
    if (indicators.length === 0) {
      phishingScore = Math.floor(Math.random() * 15) + 1;
    }
    return Promise.resolve({
      success: true,
      phishingScore,
      indicators
    });
  }
  /**
   * Analyze domain and sender for spoofing attempts
   */
  analyzeDomainAndSender(sender, domain) {
    const result = {
      isSuspicious: false,
      description: "",
      confidence: 0,
      scoreContribution: 0
    };
    const commonDomainsToSpoof = [
      "paypal",
      "amazon",
      "apple",
      "microsoft",
      "google",
      "facebook",
      "netflix",
      "bank",
      "chase",
      "wellsfargo",
      "citi",
      "amex",
      "bankofamerica",
      "usbank",
      "dropbox",
      "linkedin",
      "twitter",
      "instagram",
      "docusign",
      "fedex",
      "ups",
      "usps",
      "dhl",
      "irs"
    ];
    if (!domain) return result;
    for (const targetDomain of commonDomainsToSpoof) {
      if (domain.includes(targetDomain)) {
        if (domain.includes("-")) {
          result.isSuspicious = true;
          result.description = `The sender domain "${domain}" contains hyphens and appears to be impersonating ${targetDomain}.com`;
          result.confidence = 87;
          result.scoreContribution = 32;
          return result;
        }
        if (domain.includes(".") && !domain.endsWith(`.${targetDomain}.com`) && !domain.endsWith(`.${targetDomain}.org`) && !domain.endsWith(`.${targetDomain}.net`)) {
          result.isSuspicious = true;
          result.description = `The sender domain "${domain}" uses "${targetDomain}" as a subdomain, which is a common phishing tactic`;
          result.confidence = 90;
          result.scoreContribution = 35;
          return result;
        }
      }
      if (domain !== `${targetDomain}.com` && domain.length > 5) {
        if (/\d/.test(domain) && this.levenshteinDistance(domain, `${targetDomain}.com`) <= 2) {
          result.isSuspicious = true;
          result.description = `The sender domain "${domain}" appears to be a typosquat of "${targetDomain}.com" using number substitution`;
          result.confidence = 93;
          result.scoreContribution = 38;
          return result;
        }
        if (this.levenshteinDistance(domain, `${targetDomain}.com`) === 1) {
          result.isSuspicious = true;
          result.description = `The sender domain "${domain}" is nearly identical to "${targetDomain}.com" with a single character difference`;
          result.confidence = 89;
          result.scoreContribution = 34;
          return result;
        }
        const domainWithoutTLD = domain.split(".")[0];
        if (domainWithoutTLD.includes("rn") || domainWithoutTLD.includes("vv") || domainWithoutTLD.includes("l1") || domainWithoutTLD.includes("0o")) {
          result.isSuspicious = true;
          result.description = `The sender domain "${domain}" appears to use visually similar characters to mimic "${targetDomain}.com"`;
          result.confidence = 86;
          result.scoreContribution = 33;
          return result;
        }
      }
    }
    const suspiciousTLDs = [".xyz", ".top", ".tk", ".club", ".online", ".info", ".site", ".gq", ".ml", ".cf"];
    for (const tld of suspiciousTLDs) {
      if (domain.endsWith(tld)) {
        result.isSuspicious = true;
        result.description = `The sender domain uses the suspicious TLD "${tld}" which is commonly used in phishing campaigns`;
        result.confidence = 75;
        result.scoreContribution = 25;
        return result;
      }
    }
    return result;
  }
  /**
   * Analyze links for suspicious patterns
   */
  analyzeLinks(content) {
    const result = {
      hasSuspiciousLinks: false,
      description: "",
      severity: "Medium",
      confidence: 0,
      scoreContribution: 0
    };
    const contentLower = content.toLowerCase();
    const ipPattern = /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
    if (ipPattern.test(content)) {
      result.hasSuspiciousLinks = true;
      result.description = "Email contains links using IP addresses instead of domain names, which is highly suspicious";
      result.severity = "High";
      result.confidence = 95;
      result.scoreContribution = 28;
      return result;
    }
    const shortenerServices = ["bit.ly", "tinyurl", "goo.gl", "t.co", "ow.ly", "is.gd", "tiny.cc", "cli.gs", "tr.im"];
    for (const shortener of shortenerServices) {
      if (contentLower.includes(shortener)) {
        result.hasSuspiciousLinks = true;
        result.description = `Email contains shortened URLs (using ${shortener}) which can mask malicious destinations`;
        result.severity = "Medium";
        result.confidence = 80;
        result.scoreContribution = 20;
        return result;
      }
    }
    if (content.includes("%3A") || content.includes("%2F") || content.includes("%3F") || content.includes("%3D") || content.includes("%26")) {
      result.hasSuspiciousLinks = true;
      result.description = "Email contains URLs with encoded characters, which may be attempting to hide malicious destinations";
      result.severity = "High";
      result.confidence = 85;
      result.scoreContribution = 25;
      return result;
    }
    if (contentLower.includes("url=") || contentLower.includes("redirect=") || contentLower.includes("goto=") || contentLower.includes("link=")) {
      result.hasSuspiciousLinks = true;
      result.description = "Email contains URLs with redirect parameters that could lead to malicious sites";
      result.severity = "Medium";
      result.confidence = 75;
      result.scoreContribution = 18;
      return result;
    }
    if (contentLower.includes("login.") || contentLower.includes("account-verify") || contentLower.includes("signin") || contentLower.includes("secure.login")) {
      result.hasSuspiciousLinks = true;
      result.description = "Email contains links to login or account verification pages, which are frequently spoofed in phishing attacks";
      result.severity = "Medium";
      result.confidence = 82;
      result.scoreContribution = 22;
      return result;
    }
    const phishingUrlTerms = ["confirm", "update", "verify", "secure", "alert", "invoice", "statement", "receipt", "document"];
    for (const term of phishingUrlTerms) {
      if (contentLower.includes(`/${term}`) || contentLower.includes(`${term}.html`) || contentLower.includes(`${term}.php`) || contentLower.includes(`${term}?`)) {
        result.hasSuspiciousLinks = true;
        result.description = `Email contains links with suspicious terms like "${term}" which are common in phishing URLs`;
        result.severity = "Medium";
        result.confidence = 70;
        result.scoreContribution = 16;
        return result;
      }
    }
    return result;
  }
  /**
   * Check for mismatched URLs (displayed text vs. actual link)
   */
  checkForMismatchedUrls(content) {
    if (!content.includes("href=")) return false;
    const segments = content.split("href=");
    for (let i = 1; i < segments.length; i++) {
      const linkPart = segments[i].split(">")[0].replace(/["']/g, "");
      const textPart = segments[i].split(">")[1]?.split("<")[0] || "";
      if (linkPart.includes("http") && textPart.includes("http") && !linkPart.includes(textPart) && !textPart.includes(linkPart)) {
        return true;
      }
      const trustedDomains = [
        "paypal.com",
        "amazon.com",
        "apple.com",
        "microsoft.com",
        "google.com",
        "facebook.com",
        "chase.com",
        "bankofamerica.com",
        "wellsfargo.com"
      ];
      for (const domain of trustedDomains) {
        if (textPart.includes(domain) && !linkPart.includes(domain)) {
          return true;
        }
      }
    }
    return false;
  }
  /**
   * Analyze urgency and pressure tactics in the email
   */
  analyzeUrgencyAndPressure(contentLower, subjectLower) {
    const result = {
      hasUrgencyTactics: false,
      description: "",
      severity: "Medium",
      confidence: 0,
      scoreContribution: 0
    };
    const highUrgencyPhrases = [
      "account suspended",
      "account disabled",
      "account terminated",
      "security breach",
      "unauthorized access",
      "suspicious activity",
      "immediate action required",
      "within 24 hours",
      "account will be closed",
      "legal action",
      "overdue payment",
      "final notice",
      "urgent security issue"
    ];
    const mediumUrgencyPhrases = [
      "verify now",
      "update immediately",
      "action required",
      "expires soon",
      "limited time",
      "urgent",
      "warning",
      "alert",
      "important notice",
      "time sensitive",
      "respond quickly",
      "don't delay"
    ];
    const lowUrgencyPhrases = [
      "reminder",
      "please update",
      "attention",
      "important information",
      "please review",
      "soon",
      "before it's too late",
      "don't miss out"
    ];
    for (const phrase of highUrgencyPhrases) {
      if (contentLower.includes(phrase) || subjectLower.includes(phrase)) {
        result.hasUrgencyTactics = true;
        result.description = `Email creates a high sense of urgency with phrases like "${phrase}" to pressure immediate action`;
        result.severity = "High";
        result.confidence = 88;
        result.scoreContribution = 25;
        return result;
      }
    }
    for (const phrase of mediumUrgencyPhrases) {
      if (contentLower.includes(phrase) || subjectLower.includes(phrase)) {
        result.hasUrgencyTactics = true;
        result.description = `Email creates urgency with phrases like "${phrase}" to encourage quick action without proper verification`;
        result.severity = "Medium";
        result.confidence = 78;
        result.scoreContribution = 18;
        return result;
      }
    }
    for (const phrase of lowUrgencyPhrases) {
      if (contentLower.includes(phrase) || subjectLower.includes(phrase)) {
        result.hasUrgencyTactics = true;
        result.description = `Email uses mild urgency tactics with phrases like "${phrase}" which could be legitimate but warrants attention`;
        result.severity = "Low";
        result.confidence = 60;
        result.scoreContribution = 10;
        return result;
      }
    }
    const deadlinePatterns = [
      /within \d+ (hour|day|minute)/i,
      /expires? (in|on) \d+/i,
      /before \w+ \d+/i,
      /by (today|tomorrow)/i
    ];
    for (const pattern of deadlinePatterns) {
      if (pattern.test(contentLower) || pattern.test(subjectLower)) {
        result.hasUrgencyTactics = true;
        result.description = "Email creates urgency by setting a tight deadline for action, a common phishing tactic";
        result.severity = "Medium";
        result.confidence = 75;
        result.scoreContribution = 16;
        return result;
      }
    }
    return result;
  }
  /**
   * Analyze requests for sensitive information
   */
  analyzeSensitiveInfoRequests(contentLower) {
    const result = {
      requestsSensitiveInfo: false,
      description: "",
      confidence: 0,
      scoreContribution: 0
    };
    const criticalInfoPhrases = [
      "social security",
      "ssn",
      "tax id",
      "passport",
      "credit card",
      "card number",
      "cvv",
      "pin number",
      "mother's maiden name",
      "birth date",
      "full ssn",
      "bank account",
      "wire transfer",
      "routing number",
      "full card details"
    ];
    const highRiskPhrases = [
      "verify your account",
      "confirm your information",
      "update your details",
      "verification required",
      "login details",
      "password reset",
      "security questions",
      "identity verification",
      "billing information",
      "payment details",
      "enter your password"
    ];
    for (const phrase of criticalInfoPhrases) {
      if (contentLower.includes(phrase)) {
        result.requestsSensitiveInfo = true;
        result.description = `Email requests extremely sensitive personal or financial information (${phrase})`;
        result.confidence = 95;
        result.scoreContribution = 35;
        return result;
      }
    }
    for (const phrase of highRiskPhrases) {
      if (contentLower.includes(phrase)) {
        result.requestsSensitiveInfo = true;
        result.description = `Email asks you to provide or verify account information or credentials`;
        result.confidence = 88;
        result.scoreContribution = 28;
        return result;
      }
    }
    if ((contentLower.includes("log") || contentLower.includes("sign")) && (contentLower.includes("your account") || contentLower.includes("for security")) && (contentLower.includes("click") || contentLower.includes("link"))) {
      result.requestsSensitiveInfo = true;
      result.description = "Email asks you to log in to your account via a provided link, a common credential harvesting tactic";
      result.confidence = 85;
      result.scoreContribution = 26;
      return result;
    }
    if ((contentLower.includes("form") || contentLower.includes("fill")) && (contentLower.includes("information") || contentLower.includes("details"))) {
      result.requestsSensitiveInfo = true;
      result.description = "Email asks you to fill out a form with your information";
      result.confidence = 75;
      result.scoreContribution = 20;
      return result;
    }
    return result;
  }
  /**
   * Analyze attachments for suspicious patterns
   */
  analyzeAttachments(contentLower) {
    const result = {
      hasSuspiciousAttachments: false,
      description: "",
      severity: "Medium",
      confidence: 0,
      scoreContribution: 0
    };
    const criticalExtensions = [
      ".exe",
      ".bat",
      ".vbs",
      ".js",
      ".scr",
      ".cmd",
      ".pif",
      ".msi",
      ".hta",
      ".dll",
      ".ps1"
    ];
    const suspiciousExtensions = [
      ".zip",
      ".rar",
      ".7z",
      ".jar",
      ".iso",
      ".docm",
      ".xlsm",
      ".pptm"
    ];
    for (const ext of criticalExtensions) {
      if (contentLower.includes(ext)) {
        result.hasSuspiciousAttachments = true;
        result.description = `Email contains references to executable file attachments (${ext}) which can run malicious code`;
        result.severity = "High";
        result.confidence = 92;
        result.scoreContribution = 32;
        return result;
      }
    }
    for (const ext of suspiciousExtensions) {
      if (contentLower.includes(ext)) {
        result.hasSuspiciousAttachments = true;
        result.description = `Email contains references to compressed or macro-enabled document attachments (${ext}) which may contain malicious code`;
        result.severity = "Medium";
        result.confidence = 82;
        result.scoreContribution = 24;
        return result;
      }
    }
    const executablePatterns = [
      "setup",
      "install",
      "update.exe",
      "patch",
      "crack",
      "keygen",
      "activator"
    ];
    for (const pattern of executablePatterns) {
      if (contentLower.includes(pattern)) {
        result.hasSuspiciousAttachments = true;
        result.description = `Email contains references to potentially malicious executable files (${pattern})`;
        result.severity = "High";
        result.confidence = 88;
        result.scoreContribution = 30;
        return result;
      }
    }
    if ((contentLower.includes("attachment") || contentLower.includes("attached") || contentLower.includes("file")) && (contentLower.includes("open") || contentLower.includes("download") || contentLower.includes("enable")) && (contentLower.includes("now") || contentLower.includes("immediately") || contentLower.includes("must"))) {
      result.hasSuspiciousAttachments = true;
      result.description = "Email pressures recipient to open attachments or enable content, which may enable malicious code";
      result.severity = "Medium";
      result.confidence = 85;
      result.scoreContribution = 26;
      return result;
    }
    return result;
  }
  /**
   * Analyze language and grammar for issues common in phishing
   */
  analyzeLanguageAndGrammar(content) {
    const result = {
      hasIssues: false,
      description: "",
      severity: "Low",
      confidence: 0,
      scoreContribution: 0
    };
    const contentLower = content.toLowerCase();
    const words = content.split(/\s+/);
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    let poorGrammarScore = 0;
    if (/[!?]{2,}/.test(content)) {
      poorGrammarScore += 2;
    }
    const allCapsWords = words.filter((w) => w.length > 3 && w === w.toUpperCase());
    if (allCapsWords.length > 1) {
      poorGrammarScore += allCapsWords.length;
    }
    const mixedCaseWords = words.filter((w) => {
      if (w.length < 4) return false;
      let hasLower = false, hasUpper = false;
      for (let i = 1; i < w.length; i++) {
        if (w[i] === w[i].toLowerCase()) hasLower = true;
        if (w[i] === w[i].toUpperCase()) hasUpper = true;
      }
      return hasLower && hasUpper;
    });
    if (mixedCaseWords.length > 0) {
      poorGrammarScore += mixedCaseWords.length * 2;
    }
    const shortSentences = sentences.filter((s) => s.split(" ").length < 3);
    if (shortSentences.length > 2) {
      poorGrammarScore += shortSentences.length;
    }
    const commonErrors = [
      "acount",
      "verfy",
      "verifcation",
      "authetication",
      "immediatly",
      "securty",
      "infomation",
      "infromation",
      "confirmat",
      "suspicios",
      "kindly",
      "valuble"
    ];
    for (const error of commonErrors) {
      if (contentLower.includes(error)) {
        poorGrammarScore += 3;
      }
    }
    const genericGreetings = [
      "dear user",
      "dear customer",
      "dear valued",
      "dear client",
      "attention user",
      "hello user",
      "valued customer"
    ];
    for (const greeting of genericGreetings) {
      if (contentLower.includes(greeting)) {
        poorGrammarScore += 4;
      }
    }
    if (poorGrammarScore >= 10) {
      result.hasIssues = true;
      result.description = "Email contains multiple grammar errors, unusual formatting, and generic greetings typical of phishing attempts";
      result.severity = "Medium";
      result.confidence = 80;
      result.scoreContribution = 18;
    } else if (poorGrammarScore >= 5) {
      result.hasIssues = true;
      result.description = "Email contains some grammar or spelling errors that are common in phishing messages";
      result.severity = "Low";
      result.confidence = 65;
      result.scoreContribution = 10;
    }
    return result;
  }
  /**
   * Analyze for impersonation attempts
   */
  analyzeImpersonationAttempt(contentLower, sender, domain) {
    const result = {
      hasImpersonation: false,
      description: "",
      severity: "Medium",
      confidence: 0,
      scoreContribution: 0
    };
    const impersonatedEntities = [
      { name: "paypal", terms: ["paypal payment", "paypal team", "paypal service", "paypal account"] },
      { name: "amazon", terms: ["amazon order", "amazon team", "amazon prime", "amazon account", "amazon shipping"] },
      { name: "apple", terms: ["apple id", "icloud", "apple store", "apple support", "apple team"] },
      { name: "microsoft", terms: ["microsoft account", "microsoft team", "office 365", "microsoft security", "microsoft support"] },
      { name: "google", terms: ["google account", "gmail team", "google security", "google drive", "google support"] },
      { name: "facebook", terms: ["facebook security", "facebook team", "facebook support", "facebook account"] },
      { name: "netflix", terms: ["netflix account", "netflix team", "netflix subscription", "netflix payment"] },
      { name: "bank", terms: ["bank account", "banking team", "account alert", "fraud department", "bank statement"] },
      { name: "irs", terms: ["tax refund", "tax return", "irs notice", "irs payment", "tax payment"] },
      { name: "shipping", terms: ["package delivery", "delivery notification", "shipping update", "track your package"] }
    ];
    for (const entity of impersonatedEntities) {
      for (const term of entity.terms) {
        if (contentLower.includes(term)) {
          if (!domain.includes(entity.name) && !sender.includes(entity.name)) {
            result.hasImpersonation = true;
            result.description = `Email appears to be from ${entity.name} but was sent from ${domain}`;
            result.severity = "High";
            result.confidence = 92;
            result.scoreContribution = 30;
            return result;
          }
        }
      }
    }
    const executiveTitles = ["ceo", "president", "director", "manager", "supervisor", "executive", "hr", "human resources"];
    for (const title of executiveTitles) {
      if (contentLower.includes(title) && (contentLower.includes("urgent request") || contentLower.includes("immediate attention"))) {
        result.hasImpersonation = true;
        result.description = `Email appears to impersonate a ${title} or authority figure making an urgent request`;
        result.severity = "High";
        result.confidence = 85;
        result.scoreContribution = 28;
        return result;
      }
    }
    const impersonationPhrases = [
      "this is",
      "we are",
      "on behalf of",
      "representing",
      "from the desk of",
      "department of",
      "official notice",
      "support team",
      "security team",
      "service team"
    ];
    for (const phrase of impersonationPhrases) {
      if (contentLower.includes(phrase) && !domain.includes(contentLower.split(phrase)[1]?.trim()?.split(" ")[0] || "")) {
        result.hasImpersonation = true;
        result.description = "Email contains phrases claiming to be from an organization that doesn't match the sender's domain";
        result.severity = "Medium";
        result.confidence = 78;
        result.scoreContribution = 22;
        return result;
      }
    }
    return result;
  }
  // These legacy methods can be maintained for backward compatibility
  checkForSpoofedDomain(sender) {
    const spoofingResult = this.analyzeDomainAndSender(sender, sender.split("@")[1]?.toLowerCase() || "");
    return spoofingResult.isSuspicious;
  }
  checkForSuspiciousLinks(content) {
    const linkResult = this.analyzeLinks(content);
    return linkResult.hasSuspiciousLinks;
  }
  checkForUrgencyLanguage(content, subject) {
    const urgencyResult = this.analyzeUrgencyAndPressure(content.toLowerCase(), subject.toLowerCase());
    return urgencyResult.hasUrgencyTactics;
  }
  checkForSensitiveInfoRequests(content) {
    const sensitiveInfoResult = this.analyzeSensitiveInfoRequests(content.toLowerCase());
    return sensitiveInfoResult.requestsSensitiveInfo;
  }
  checkForSuspiciousAttachments(content) {
    const attachmentResult = this.analyzeAttachments(content.toLowerCase());
    return attachmentResult.hasSuspiciousAttachments;
  }
  /**
   * Calculate Levenshtein distance between two strings
   */
  levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            // substitution
            matrix[i][j - 1] + 1,
            // insertion
            matrix[i - 1][j] + 1
            // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
};
var phishingService = new PhishingService();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import createMemoryStore from "memorystore";
var MemoryStore = createMemoryStore(session);
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "secure-check-session-secret",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 864e5
      // prune expired entries every 24h
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1e3,
      // 24 hours
      secure: process.env.NODE_ENV === "production"
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      req.login(user, (err2) => {
        if (err2) return next(err2);
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
  app2.patch("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    try {
      const { email, firstName, lastName } = req.body;
      const updatedUser = await storage.updateUser(req.user.id, {
        email,
        firstName,
        lastName
      });
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.post("/api/user/change-password", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    try {
      const { currentPassword, newPassword } = req.body;
      const isCorrect = await comparePasswords(currentPassword, req.user.password);
      if (!isCorrect) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(req.user.id, { password: hashedPassword });
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });
}

// server/routes.ts
import path2 from "path";
import fs2 from "fs";
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."));
    }
  }
});
var uploadsDir = path2.join(process.cwd(), "uploads");
if (!fs2.existsSync(uploadsDir)) {
  fs2.mkdirSync(uploadsDir, { recursive: true });
}
async function registerRoutes(app2) {
  setupAuth(app2);
  const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };
  app2.get("/api/face-api-models", requireAuth, async (_req, res) => {
    const modelsDir = path2.join(process.cwd(), "models");
    try {
      if (!fs2.existsSync(modelsDir)) {
        fs2.mkdirSync(modelsDir, { recursive: true });
        return res.status(404).json({
          message: "Models not found",
          status: "not_downloaded"
        });
      }
      const essentialModels = [
        "face_recognition_model-weights_manifest.json",
        "face_landmark_68_model-weights_manifest.json",
        "age_gender_model-weights_manifest.json",
        "ssd_mobilenetv1_model-weights_manifest.json"
      ];
      const missingModels = essentialModels.filter(
        (model) => !fs2.existsSync(path2.join(modelsDir, model))
      );
      if (missingModels.length > 0) {
        return res.status(206).json({
          message: "Some models missing",
          status: "incomplete",
          missing: missingModels
        });
      }
      return res.status(200).json({
        message: "All models available",
        status: "complete"
      });
    } catch (error) {
      console.error("Error checking model files:", error);
      return res.status(500).json({
        message: "Error checking models",
        status: "error"
      });
    }
  });
  app2.post("/api/face-api-models/settings", requireAuth, async (req, res) => {
    try {
      const { useHighAccuracyModel, preloadModels } = req.body;
      if (typeof useHighAccuracyModel !== "boolean" || typeof preloadModels !== "boolean") {
        return res.status(400).json({
          message: "Invalid settings format",
          details: "Both useHighAccuracyModel and preloadModels must be boolean values"
        });
      }
      photoService.updateModelSettings({
        useHighAccuracyModel,
        preloadModels
      });
      return res.status(200).json({
        message: "Model settings updated successfully",
        settings: {
          useHighAccuracyModel,
          preloadModels
        }
      });
    } catch (error) {
      console.error("Error updating model settings:", error);
      return res.status(500).json({
        message: "Failed to update model settings",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/face-api-models/download", requireAuth, async (_req, res) => {
    try {
      await photoService.loadModels();
      return res.status(200).json({
        message: "Models downloaded successfully",
        status: "complete"
      });
    } catch (error) {
      console.error("Error downloading models:", error);
      return res.status(500).json({
        message: "Failed to download models",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/stats", requireAuth, async (_req, res) => {
    const stats = {
      identitiesVerified: 1254,
      fraudDetected: 37,
      suspiciousCases: 86,
      systemUptime: "99.8%"
    };
    res.json(stats);
  });
  app2.get("/api/activities", requireAuth, async (_req, res) => {
    const activities = await storage.getActivityLogs();
    res.json(activities);
  });
  app2.get("/api/activities/photo", requireAuth, async (_req, res) => {
    const activities = await storage.getActivityLogsByType("Photo Recognition");
    res.json(activities);
  });
  app2.post("/api/photo-recognition", requireAuth, upload.single("photo"), async (req, res) => {
    try {
      console.log("Received photo upload request", {
        contentType: req.headers["content-type"],
        hasFile: !!req.file,
        fileSize: req.file?.size,
        mimetype: req.file?.mimetype,
        fieldname: req.file?.fieldname,
        purpose: req.body?.purpose
      });
      if (!req.file) {
        console.error("No file uploaded or file field name doesn't match 'photo'");
        return res.status(400).json({
          message: "No photo provided",
          details: 'Make sure you are uploading a file with the field name "photo"'
        });
      }
      const photoBuffer = req.file.buffer;
      const purpose = req.body.purpose || "Identity Verification";
      console.log(`Processing photo for purpose: ${purpose}, buffer size: ${photoBuffer.length} bytes, mime type: ${req.file.mimetype}`);
      const processResult = await photoService.processImage(photoBuffer);
      if (!processResult.success || !processResult.result) {
        console.error("Photo processing failed", processResult.error);
        return res.status(400).json({
          message: processResult.error || "Failed to process image",
          details: "The image could not be processed. Try a different image or check if it contains a clear face."
        });
      }
      console.log("Photo processed successfully, assessing fraud risk");
      const resultWithRisk = photoService.assessFraudRisk(processResult.result);
      console.log("Saving results to storage", {
        name: resultWithRisk.name,
        confidence: resultWithRisk.confidence,
        fraudRisk: resultWithRisk.fraudRisk
      });
      const savedResult = await storage.createPhotoResult({
        userId: 1,
        // Use the default user (in a real app, this would be the authenticated user)
        imageUrl: null,
        // In a real app, this would be a URL to the saved image
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
      await storage.createActivityLog({
        userId: 1,
        activityType: "Photo Recognition",
        details: `Identity verification for ${savedResult.name || "Unknown Person"}`,
        status: "Successful"
      });
      console.log("Photo recognition complete, returning results");
      res.json({
        ...savedResult,
        ...resultWithRisk
      });
    } catch (error) {
      console.error("Photo recognition error:", error);
      res.status(500).json({
        message: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });
  app2.get("/api/fraud/alerts", async (_req, res) => {
    const alerts = await storage.getFraudAlerts();
    if (alerts.length === 0) {
      const sampleAlerts = fraudService.getSampleFraudAlerts();
      res.json(sampleAlerts);
    } else {
      res.json(alerts);
    }
  });
  app2.get("/api/fraud/rules", async (_req, res) => {
    const rules = fraudService.getRules();
    res.json(rules);
  });
  app2.post("/api/fraud/rules", async (req, res) => {
    try {
      const updatedRules = req.body;
      const result = fraudService.updateRules(updatedRules);
      res.json(result);
    } catch (error) {
      console.error("Update rules error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update fraud rules" });
    }
  });
  app2.post("/api/fraud/check", async (req, res) => {
    try {
      const data = req.body;
      const result = fraudService.detectFraud(data);
      if (result.isFraudulent) {
        const alertData = {
          userId: 1,
          alertType: result.triggeredRules[0],
          // Use the first triggered rule as the alert type
          details: `Potential fraud detected: ${result.triggeredRules.join(", ")}`,
          severity: result.severity,
          status: "Flagged"
        };
        await storage.createFraudAlert(alertData);
        await storage.createActivityLog({
          userId: 1,
          activityType: "Fraud Alert",
          details: alertData.details,
          status: "Flagged"
        });
      }
      res.json(result);
    } catch (error) {
      console.error("Fraud check error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to check for fraud" });
    }
  });
  app2.patch("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { email, firstName, lastName } = req.body;
      const updatedUser = await storage.updateUser(userId, {
        email,
        firstName,
        lastName
      });
      res.status(200).json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        avatarUrl: updatedUser.avatarUrl
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.post("/api/user/avatar", requireAuth, upload.single("avatar"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const buffer = req.file.buffer;
      const base64Image = buffer.toString("base64");
      const mimeType = req.file.mimetype;
      const dataUrl = `data:${mimeType};base64,${base64Image}`;
      const userId = req.user.id;
      const updatedUser = await storage.updateUser(userId, {
        avatarUrl: dataUrl
      });
      res.status(200).json({
        id: updatedUser.id,
        avatarUrl: updatedUser.avatarUrl
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      res.status(500).json({ message: "Failed to upload avatar" });
    }
  });
  app2.post("/api/user/change-password", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      const hashedPassword = await hashPassword(newPassword);
      const updatedUser = await storage.updateUser(userId, {
        password: hashedPassword
      });
      res.status(200).json({
        message: "Password updated successfully"
      });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });
  app2.get("/api/phishing/emails", async (_req, res) => {
    try {
      const emails = await storage.getPhishingEmails();
      res.json(emails);
    } catch (error) {
      console.error("Get phishing emails error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to retrieve phishing emails" });
    }
  });
  app2.get("/api/phishing/emails/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid email ID" });
      }
      const email = await storage.getPhishingEmailById(id);
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      res.json(email);
    } catch (error) {
      console.error("Get phishing email error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to retrieve phishing email" });
    }
  });
  app2.post("/api/phishing/analyze", async (req, res) => {
    try {
      const { content, sender, subject, recipient } = req.body;
      if (!content || !sender || !subject || !recipient) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const analysisResult = await phishingService.analyzeEmail(content, sender, subject);
      if (!analysisResult.success) {
        return res.status(400).json({ message: analysisResult.error || "Failed to analyze email" });
      }
      const newEmail = await storage.createPhishingEmail({
        userId: 1,
        // Use the default user (in a real app, this would be the authenticated user)
        subject,
        sender,
        recipient,
        content,
        receivedAt: (/* @__PURE__ */ new Date()).toISOString(),
        phishingScore: analysisResult.phishingScore,
        status: analysisResult.phishingScore > 70 ? "Quarantined" : "Analyzed"
      });
      for (const indicator of analysisResult.indicators) {
        await storage.createPhishingIndicator({
          emailId: newEmail.id,
          type: indicator.type,
          description: indicator.description,
          severity: indicator.severity,
          confidence: indicator.confidence
        });
      }
      await storage.createActivityLog({
        userId: 1,
        activityType: "Phishing Detection",
        details: `Email analyzed: ${subject} (Score: ${analysisResult.phishingScore})`,
        status: analysisResult.phishingScore > 70 ? "Flagged" : "Successful"
      });
      const completeEmail = await storage.getPhishingEmailById(newEmail.id);
      res.json(completeEmail);
    } catch (error) {
      console.error("Phishing analysis error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred during email analysis" });
    }
  });
  app2.patch("/api/phishing/emails/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid email ID" });
      }
      if (!status || !["Analyzed", "Pending", "Quarantined"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      const updatedEmail = await storage.updatePhishingEmailStatus(id, status);
      if (!updatedEmail) {
        return res.status(404).json({ message: "Email not found" });
      }
      res.json(updatedEmail);
    } catch (error) {
      console.error("Update phishing email status error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update email status" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs3 from "fs";
import path4, { dirname as dirname3 } from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path3, { dirname as dirname2 } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath as fileURLToPath2 } from "url";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var vite_config_default = defineConfig({
  base: "./",
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8000"
      // Proxy API requests to Django
    }
  },
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path3.resolve(__dirname2, "client", "src"),
      "@shared": path3.resolve(__dirname2, "shared"),
      "@assets": path3.resolve(__dirname2, "attached_assets")
    }
  },
  root: path3.resolve(__dirname2, "client"),
  build: {
    outDir: path3.resolve(__dirname2, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename3 = fileURLToPath3(import.meta.url);
var __dirname3 = dirname3(__filename3);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path4.resolve(
        __dirname3,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path4.resolve(__dirname3, "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
