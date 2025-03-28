import { FraudAlert } from '../../client/src/lib/types';

interface FraudRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  threshold?: number;
  check: (data: any) => boolean;
}

// Service for handling fraud detection
export class FraudService {
  private rules: FraudRule[];
  
  constructor() {
    // Initialize with default fraud detection rules
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
          // In a real implementation, this would check known IPs against current IP
          return data.ipAnomaly === true;
        }
      },
      {
        id: "unusual-timing",
        name: "Unusual Access Timing",
        description: "Detect access at unusual hours or patterns",
        enabled: true,
        check: (data) => {
          // In a real implementation, this would analyze time patterns
          return data.unusualTiming === true;
        }
      },
      {
        id: "identity-mismatch",
        name: "Identity Mismatch",
        description: "Detect when submitted identity information differs from records",
        enabled: true,
        check: (data) => {
          // In a real implementation, this would compare identity information
          return data.identityMismatch === true;
        }
      },
      {
        id: "rapid-changes",
        name: "Rapid Profile Changes",
        description: "Flag accounts with frequent or unusual profile changes",
        enabled: false,
        check: (data) => {
          // In a real implementation, this would analyze profile change frequency
          return data.rapidChanges === true;
        }
      }
    ];
  }
  
  /**
   * Get all fraud detection rules
   * @returns List of fraud rules
   */
  getRules(): Omit<FraudRule, 'check'>[] {
    return this.rules.map(({ check, ...rule }) => rule);
  }
  
  /**
   * Get a rule by its ID
   * @param id Rule ID
   * @returns Rule object if found
   */
  getRuleById(id: string): FraudRule | undefined {
    return this.rules.find(rule => rule.id === id);
  }
  
  /**
   * Update fraud detection rules
   * @param updatedRules New rule configurations
   * @returns Updated rules
   */
  updateRules(updatedRules: Omit<FraudRule, 'check'>[]): Omit<FraudRule, 'check'>[] {
    // Update only the properties of existing rules, preserving the check function
    updatedRules.forEach(updatedRule => {
      const existingRuleIndex = this.rules.findIndex(r => r.id === updatedRule.id);
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
  detectFraud(data: any): { 
    isFraudulent: boolean; 
    severity: 'Low' | 'Medium' | 'High';
    triggeredRules: string[];
  } {
    const triggeredRules: string[] = [];
    
    // Check each enabled rule
    this.rules.forEach(rule => {
      if (rule.enabled && rule.check(data)) {
        triggeredRules.push(rule.id);
      }
    });
    
    // Determine severity based on number and type of triggered rules
    let severity: 'Low' | 'Medium' | 'High' = 'Low';
    if (triggeredRules.length > 2) {
      severity = 'High';
    } else if (triggeredRules.length > 0) {
      severity = 'Medium';
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
  getSampleFraudAlerts(): FraudAlert[] {
    return [
      {
        id: 1,
        alertType: "Multiple Failed Attempts",
        details: "User account had 5 failed verification attempts in 10 minutes",
        severity: "High",
        status: "Flagged",
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString()
      },
      {
        id: 2,
        alertType: "IP Address Anomaly",
        details: "Access from unrecognized location (IP: 128.30.52.100)",
        severity: "Medium",
        status: "Under Review",
        timestamp: new Date(Date.now() - 5 * 3600000).toISOString()
      },
      {
        id: 3,
        alertType: "Identity Mismatch",
        details: "Submitted documents don't match existing records",
        severity: "High",
        status: "Flagged",
        timestamp: new Date(Date.now() - 8 * 3600000).toISOString()
      },
      {
        id: 4,
        alertType: "Unusual Access Timing",
        details: "Account accessed at unusual hours (3:45 AM local time)",
        severity: "Low",
        status: "Under Review",
        timestamp: new Date(Date.now() - 12 * 3600000).toISOString()
      },
      {
        id: 5,
        alertType: "Multiple Failed Attempts",
        details: "4 consecutive failed login attempts from mobile device",
        severity: "Medium",
        status: "Resolved",
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString()
      }
    ];
  }
}

export const fraudService = new FraudService();
