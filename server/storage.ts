import { 
  users, type User, type InsertUser,
  photoResults, type PhotoResult, type InsertPhotoResult,
  fraudAlerts, type FraudAlert, type InsertFraudAlert,
  activityLogs, type ActivityLog, type InsertActivityLog 
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private photoResults: Map<number, PhotoResult>;
  private fraudAlerts: Map<number, FraudAlert>;
  private activityLogs: Map<number, ActivityLog>;
  
  private userIdCounter: number;
  private photoResultIdCounter: number;
  private fraudAlertIdCounter: number;
  private activityLogIdCounter: number;

  constructor() {
    this.users = new Map();
    this.photoResults = new Map();
    this.fraudAlerts = new Map();
    this.activityLogs = new Map();
    
    this.userIdCounter = 1;
    this.photoResultIdCounter = 1;
    this.fraudAlertIdCounter = 1;
    this.activityLogIdCounter = 1;
    
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
}

export const storage = new MemStorage();
