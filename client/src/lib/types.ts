export interface StatCardProps {
  icon: string;
  iconColor: string;
  bgColor: string;
  title: string;
  value: string | number;
  trend: {
    value: string;
    positive: boolean;
  };
}

export interface SocialProfiles {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

export interface PhotoRecognitionResult {
  id?: number;
  imageUrl?: string;
  name: string;
  location: string;
  age: number;
  gender: string;
  nationality: string;
  socials: SocialProfiles;
  confidence: number;
  fraudRisk: string;
  timestamp?: string;
}

export interface FraudAlert {
  id: number;
  alertType: string;
  details: string;
  severity: string;
  status: string;
  timestamp: string;
}

export interface ActivityLog {
  id: number;
  activityType: string;
  details: string;
  status: string;
  timestamp: string;
}

export type ActivityStatus = 'Successful' | 'Flagged' | 'Under Review';
export type FraudRisk = 'Low' | 'Medium' | 'High';

export interface DashboardStats {
  identitiesVerified: number;
  fraudDetected: number;
  suspiciousCases: number;
  systemUptime: string;
}

export interface PhishingEmail {
  id: number;
  subject: string;
  sender: string;
  recipient: string;
  content: string;
  receivedAt: string;
  analyzedAt?: string;
  phishingScore: number;
  status: 'Analyzed' | 'Pending' | 'Quarantined';
  indicators: PhishingIndicator[];
}

export interface PhishingIndicator {
  id: number;
  emailId: number;
  type: PhishingIndicatorType;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
  confidence: number;
}

export type PhishingIndicatorType = 
  | 'Suspicious Link' 
  | 'Spoofed Domain' 
  | 'Request for Sensitive Information'
  | 'Suspicious Attachment'
  | 'Impersonation Attempt'
  | 'Urgency or Pressure'
  | 'Grammar Errors'
  | 'Mismatched URLs';
