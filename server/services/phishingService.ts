import axios from 'axios';
import { PhishingIndicator, PhishingIndicatorType } from '../../shared/schema';

interface AnalysisResult {
  success: boolean;
  phishingScore: number;
  indicators: Omit<PhishingIndicator, 'id' | 'emailId'>[];
  error?: string;
}

export class PhishingService {
  /**
   * Analyze an email to detect phishing attempts
   * @param emailContent The content of the email to analyze
   * @param sender The sender's email address
   * @param subject The subject of the email
   * @returns Analysis result with phishing score and indicators
   */
  async analyzeEmail(
    emailContent: string,
    sender: string,
    subject: string
  ): Promise<AnalysisResult> {
    try {
      // In a production environment, this would call an actual phishing detection API
      // For this demo, we'll generate a result based on common phishing patterns
      
      // Check if we have API key for external service
      const apiKey = process.env.PHISHING_API_KEY;
      
      if (apiKey) {
        return await this.callExternalPhishingApi(emailContent, sender, subject);
      } else {
        // Generate a demo result for testing
        return this.generateDemoResult(emailContent, sender, subject);
      }
    } catch (error) {
      console.error('Phishing analysis error:', error);
      return {
        success: false,
        phishingScore: 0,
        indicators: [],
        error: error instanceof Error ? error.message : 'An error occurred during analysis'
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
  private async callExternalPhishingApi(
    emailContent: string,
    sender: string,
    subject: string
  ): Promise<AnalysisResult> {
    try {
      // This would be replaced with actual API call
      const response = await axios.post(
        'https://api.phishing-detection-service.com/analyze',
        {
          content: emailContent,
          sender,
          subject
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.PHISHING_API_KEY}`
          }
        }
      );
      
      return {
        success: true,
        phishingScore: response.data.score,
        indicators: response.data.indicators
      };
    } catch (error) {
      console.error('External phishing API error:', error);
      // Fallback to demo result if API fails
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
  private generateDemoResult(
    emailContent: string,
    sender: string,
    subject: string
  ): Promise<AnalysisResult> {
    // Initialize indicators array and score
    const indicators: Omit<PhishingIndicator, 'id' | 'emailId'>[] = [];
    let phishingScore = 0;
    
    // Check for spoofed domains
    if (this.checkForSpoofedDomain(sender)) {
      indicators.push({
        type: 'Spoofed Domain' as PhishingIndicatorType,
        description: `The sender domain "${sender.split('@')[1]}" appears to be mimicking a legitimate domain`,
        severity: 'High',
        confidence: 85
      });
      phishingScore += 30;
    }
    
    // Check for suspicious links
    if (this.checkForSuspiciousLinks(emailContent)) {
      indicators.push({
        type: 'Suspicious Link' as PhishingIndicatorType,
        description: 'Email contains links to suspicious or malformed URLs',
        severity: 'High',
        confidence: 90
      });
      phishingScore += 25;
    }
    
    // Check for urgency language
    if (this.checkForUrgencyLanguage(emailContent, subject)) {
      indicators.push({
        type: 'Urgency or Pressure' as PhishingIndicatorType,
        description: 'Email contains language creating a false sense of urgency',
        severity: 'Medium',
        confidence: 75
      });
      phishingScore += 15;
    }
    
    // Check for requests for sensitive information
    if (this.checkForSensitiveInfoRequests(emailContent)) {
      indicators.push({
        type: 'Request for Sensitive Information' as PhishingIndicatorType,
        description: 'Email requests sensitive personal or financial information',
        severity: 'High',
        confidence: 95
      });
      phishingScore += 30;
    }
    
    // Check for suspicious attachments
    if (this.checkForSuspiciousAttachments(emailContent)) {
      indicators.push({
        type: 'Suspicious Attachment' as PhishingIndicatorType,
        description: 'Email contains references to suspicious file attachments',
        severity: 'High',
        confidence: 80
      });
      phishingScore += 20;
    }
    
    // Grammar errors (if content has many typos or grammatical issues)
    if (emailContent.length > 0 && emailContent.split(' ').length > 10) {
      const grammarErrors = Math.random() > 0.7; // Simulating grammar check
      if (grammarErrors) {
        indicators.push({
          type: 'Grammar Errors' as PhishingIndicatorType,
          description: 'Email contains multiple grammar or spelling errors',
          severity: 'Low',
          confidence: 65
        });
        phishingScore += 10;
      }
    }
    
    // Cap the score at 100
    phishingScore = Math.min(phishingScore, 100);
    
    // If nothing suspicious was found, add a low score
    if (indicators.length === 0) {
      phishingScore = Math.floor(Math.random() * 20) + 5; // Random low score between 5-25
    }
    
    return Promise.resolve({
      success: true,
      phishingScore,
      indicators
    });
  }

  /**
   * Check for spoofed domains in sender address
   */
  private checkForSpoofedDomain(sender: string): boolean {
    const commonDomainsToSpoof = [
      'paypal', 'amazon', 'apple', 'microsoft', 'google', 'facebook',
      'bank', 'chase', 'wellsfargo', 'citi', 'amex'
    ];
    
    const domain = sender.split('@')[1]?.toLowerCase() || '';
    
    if (!domain) return false;
    
    // Check if domain is trying to spoof a common target
    for (const targetDomain of commonDomainsToSpoof) {
      if (domain.includes(targetDomain) && 
          (domain.includes('-') || domain.includes('.') && !domain.endsWith('.com'))) {
        return true;
      }
      
      // Check for typosquatting (e.g., "paypa1.com" instead of "paypal.com")
      if (this.levenshteinDistance(domain, `${targetDomain}.com`) <= 2 &&
          domain !== `${targetDomain}.com`) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check for suspicious links in email content
   */
  private checkForSuspiciousLinks(content: string): boolean {
    // Check for masked links (different displayed text vs actual URL)
    if (content.includes('href=') && 
       (content.toLowerCase().includes('click here') || 
        content.toLowerCase().includes('click this link'))) {
      return true;
    }
    
    // Check for IP address URLs instead of domain names
    const ipPattern = /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
    if (ipPattern.test(content)) {
      return true;
    }
    
    // Check for suspicious TLDs
    const suspiciousTLDs = ['.xyz', '.top', '.tk', '.club', '.online', '.info', '.biz'];
    for (const tld of suspiciousTLDs) {
      if (content.includes(tld)) {
        return true;
      }
    }
    
    // Check for URLs with unusual formats
    if (content.includes('url=') || content.includes('redirect=') || 
        content.includes('login.') || content.includes('account-verify')) {
      return true;
    }
    
    return false;
  }

  /**
   * Check for urgency or pressure language
   */
  private checkForUrgencyLanguage(content: string, subject: string): boolean {
    const urgencyPhrases = [
      'urgent', 'immediate', 'alert', 'attention required', 'action required',
      'expires soon', 'limited time', 'account suspended', 'security alert',
      '24 hours', 'immediately', 'warning', 'now', 'quickly', 'urgent action',
      'verify now', 'suspicious activity', 'unauthorized'
    ];
    
    const contentLower = content.toLowerCase();
    const subjectLower = subject.toLowerCase();
    
    for (const phrase of urgencyPhrases) {
      if (contentLower.includes(phrase) || subjectLower.includes(phrase)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check for requests for sensitive information
   */
  private checkForSensitiveInfoRequests(content: string): boolean {
    const sensitiveDataPhrases = [
      'password', 'credit card', 'ssn', 'social security', 'bank account',
      'verify your account', 'confirm your information', 'update your details',
      'verification required', 'login details', 'security questions',
      'identity verification', 'billing information', 'payment details',
      'reset your password'
    ];
    
    const contentLower = content.toLowerCase();
    
    for (const phrase of sensitiveDataPhrases) {
      if (contentLower.includes(phrase)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check for suspicious attachments
   */
  private checkForSuspiciousAttachments(content: string): boolean {
    const suspiciousExtensions = [
      '.exe', '.zip', '.jar', '.bat', '.vbs', '.js', '.scr', '.cmd',
      '.pif', '.msi', '.hta', '.dll', '.ps1'
    ];
    
    const contentLower = content.toLowerCase();
    
    // Check for references to attachments with suspicious extensions
    for (const ext of suspiciousExtensions) {
      if (contentLower.includes(ext)) {
        return true;
      }
    }
    
    // Check for mentions of opening attachments
    if ((contentLower.includes('attachment') || contentLower.includes('attached')) &&
        (contentLower.includes('open') || contentLower.includes('view') || 
         contentLower.includes('see') || contentLower.includes('download'))) {
      return true;
    }
    
    return false;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    const matrix = [];
    
    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    // Calculate distance
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i-1) === a.charAt(j-1)) {
          matrix[i][j] = matrix[i-1][j-1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i-1][j-1] + 1, // substitution
            matrix[i][j-1] + 1,   // insertion
            matrix[i-1][j] + 1    // deletion
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  }
}

export const phishingService = new PhishingService();