import { 
  users, type User, type InsertUser,
  photoResults, type PhotoResult, type InsertPhotoResult,
  fraudAlerts, type FraudAlert, type InsertFraudAlert,
  activityLogs, type ActivityLog, type InsertActivityLog,
  phishingEmails, type PhishingEmail, type InsertPhishingEmail,
  phishingIndicators, type PhishingIndicator, type InsertPhishingIndicator
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  
  // Photo recognition operations
  createPhotoResult(result: InsertPhotoResult): Promise<PhotoResult>;
  getPhotoResults(): Promise<PhotoResult[]>;
  getPhotoResultById(id: number): Promise<PhotoResult | undefined>;
  
  // Fraud alert operations
  createFraudAlert(alert: InsertFraudAlert): Promise<FraudAlert>;
  getFraudAlerts(): Promise<FraudAlert[]>;
  getFraudAlertById(id: number): Promise<FraudAlert | undefined>;
  updateFraudAlertStatus(id: number, status: string): Promise<FraudAlert | undefined>;
  
  // Activity log operations
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(): Promise<ActivityLog[]>;
  getActivityLogsByType(type: string): Promise<ActivityLog[]>;
  
  // Phishing email operations
  createPhishingEmail(email: InsertPhishingEmail): Promise<PhishingEmail>;
  getPhishingEmails(): Promise<PhishingEmail[]>;
  getPhishingEmailById(id: number): Promise<PhishingEmail | undefined>;
  updatePhishingEmailStatus(id: number, status: string): Promise<PhishingEmail | undefined>;
  
  // Phishing indicator operations
  createPhishingIndicator(indicator: InsertPhishingIndicator): Promise<PhishingIndicator>;
  getPhishingIndicatorsByEmailId(emailId: number): Promise<PhishingIndicator[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private photoResults: Map<number, PhotoResult>;
  private fraudAlerts: Map<number, FraudAlert>;
  private activityLogs: Map<number, ActivityLog>;
  private phishingEmails: Map<number, PhishingEmail>;
  private phishingIndicators: Map<number, PhishingIndicator>;
  
  private userIdCounter: number;
  private photoResultIdCounter: number;
  private fraudAlertIdCounter: number;
  private activityLogIdCounter: number;
  private phishingEmailIdCounter: number;
  private phishingIndicatorIdCounter: number;

  constructor() {
    this.users = new Map();
    this.photoResults = new Map();
    this.fraudAlerts = new Map();
    this.activityLogs = new Map();
    this.phishingEmails = new Map();
    this.phishingIndicators = new Map();
    
    this.userIdCounter = 1;
    this.photoResultIdCounter = 1;
    this.fraudAlertIdCounter = 1;
    this.activityLogIdCounter = 1;
    this.phishingEmailIdCounter = 1;
    this.phishingIndicatorIdCounter = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Initialize with a sample user
    this.createUser({ username: "admin", password: "admin123" });
    
    // Add some sample fraud alerts
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
    
    // Add some sample activity logs
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
    
    // Add sample phishing emails
    this.addSamplePhishingEmails();
  }
  
  private async addSamplePhishingEmails() {
    // Sample phishing email 1
    const email1 = await this.createPhishingEmail({
      userId: 1,
      subject: "Urgent: Your Account Has Been Compromised",
      sender: "security-team@bankofamerica-secure.com",
      recipient: "user@example.com",
      content: "Dear valued customer, We have detected suspicious activity on your account. Please verify your account immediately by clicking on the link below to avoid account suspension. [LINK: https://bank0famerica-secure.com/verify]",
      receivedAt: new Date().toISOString(),
      phishingScore: 92,
      status: "Analyzed"
    });

    // Add indicators for email 1
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

    // Sample phishing email 2
    const email2 = await this.createPhishingEmail({
      userId: 1,
      subject: "Your Amazon Order #8752941 Has Shipped",
      sender: "orders@amazon-shipments.net",
      recipient: "user@example.com",
      content: "Your Amazon order has shipped. There was a problem with your payment method. To ensure delivery, please update your payment information by clicking here: [LINK: https://amaz0n-account-verify.net/update]",
      receivedAt: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
      phishingScore: 87,
      status: "Quarantined"
    });

    // Add indicators for email 2
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
    
    // Sample phishing email 3
    const email3 = await this.createPhishingEmail({
      userId: 1,
      subject: "Your Microsoft 365 subscription will expire soon",
      sender: "renewal@microsoft365-subscription.com",
      recipient: "user@example.com",
      content: "Your Microsoft 365 subscription is about to expire. To avoid service interruption, please download the attached document and follow the renewal instructions. [ATTACHMENT: RenewalInstructions.doc]",
      receivedAt: new Date(Date.now() - 12 * 3600000).toISOString(), // 12 hours ago
      phishingScore: 78,
      status: "Analyzed"
    });

    // Add indicators for email 3
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
    
    // Log phishing activities
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
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Photo result operations
  async createPhotoResult(result: InsertPhotoResult): Promise<PhotoResult> {
    const id = this.photoResultIdCounter++;
    const timestamp = new Date();
    const photoResult: PhotoResult = { ...result, id, timestamp };
    this.photoResults.set(id, photoResult);
    return photoResult;
  }
  
  async getPhotoResults(): Promise<PhotoResult[]> {
    return Array.from(this.photoResults.values());
  }
  
  async getPhotoResultById(id: number): Promise<PhotoResult | undefined> {
    return this.photoResults.get(id);
  }
  
  // Fraud alert operations
  async createFraudAlert(alert: InsertFraudAlert): Promise<FraudAlert> {
    const id = this.fraudAlertIdCounter++;
    const timestamp = new Date();
    const fraudAlert: FraudAlert = { 
      ...alert, 
      id, 
      timestamp: timestamp.toISOString()
    };
    this.fraudAlerts.set(id, fraudAlert);
    return fraudAlert;
  }
  
  async getFraudAlerts(): Promise<FraudAlert[]> {
    return Array.from(this.fraudAlerts.values());
  }
  
  async getFraudAlertById(id: number): Promise<FraudAlert | undefined> {
    return this.fraudAlerts.get(id);
  }
  
  async updateFraudAlertStatus(id: number, status: string): Promise<FraudAlert | undefined> {
    const alert = this.fraudAlerts.get(id);
    if (alert) {
      const updatedAlert: FraudAlert = { ...alert, status };
      this.fraudAlerts.set(id, updatedAlert);
      return updatedAlert;
    }
    return undefined;
  }
  
  // Activity log operations
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const id = this.activityLogIdCounter++;
    const timestamp = new Date();
    const activityLog: ActivityLog = { 
      ...log, 
      id, 
      timestamp: timestamp.toISOString()
    };
    this.activityLogs.set(id, activityLog);
    return activityLog;
  }
  
  async getActivityLogs(): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
  
  async getActivityLogsByType(type: string): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter(log => log.activityType === type)
      .sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }

  // Phishing email operations
  async createPhishingEmail(email: InsertPhishingEmail): Promise<PhishingEmail> {
    const id = this.phishingEmailIdCounter++;
    const phishingEmail: PhishingEmail = {
      ...email,
      id,
      analyzedAt: email.receivedAt, // For demo, we'll set analyzedAt same as receivedAt
      indicators: [] // This will be populated from the related indicators
    };
    this.phishingEmails.set(id, phishingEmail);
    return phishingEmail;
  }

  async getPhishingEmails(): Promise<PhishingEmail[]> {
    const emails = Array.from(this.phishingEmails.values());
    
    // Add indicators to each email
    for (const email of emails) {
      email.indicators = await this.getPhishingIndicatorsByEmailId(email.id);
    }
    
    return emails.sort((a, b) => 
      new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
    );
  }

  async getPhishingEmailById(id: number): Promise<PhishingEmail | undefined> {
    const email = this.phishingEmails.get(id);
    if (email) {
      // Add indicators to the email
      email.indicators = await this.getPhishingIndicatorsByEmailId(id);
      return email;
    }
    return undefined;
  }

  async updatePhishingEmailStatus(id: number, status: string): Promise<PhishingEmail | undefined> {
    const email = this.phishingEmails.get(id);
    if (email) {
      const updatedEmail: PhishingEmail = { ...email, status: status as any };
      this.phishingEmails.set(id, updatedEmail);
      return this.getPhishingEmailById(id);
    }
    return undefined;
  }

  // Phishing indicator operations
  async createPhishingIndicator(indicator: InsertPhishingIndicator): Promise<PhishingIndicator> {
    const id = this.phishingIndicatorIdCounter++;
    const phishingIndicator: PhishingIndicator = { ...indicator, id };
    this.phishingIndicators.set(id, phishingIndicator);
    return phishingIndicator;
  }

  async getPhishingIndicatorsByEmailId(emailId: number): Promise<PhishingIndicator[]> {
    return Array.from(this.phishingIndicators.values())
      .filter(indicator => indicator.emailId === emailId);
  }
}

export const storage = new MemStorage();
