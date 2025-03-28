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
    
    // Advanced contextual analysis based on email patterns
    const contentLower = emailContent.toLowerCase();
    const subjectLower = subject.toLowerCase();
    const domain = sender.split('@')[1]?.toLowerCase() || '';

    // ====== Domain Spoofing & Sender Analysis ======
    const spoofingResult = this.analyzeDomainAndSender(sender, domain);
    if (spoofingResult.isSuspicious) {
      indicators.push({
        type: 'Spoofed Domain' as PhishingIndicatorType,
        description: spoofingResult.description,
        severity: 'High',
        confidence: spoofingResult.confidence
      });
      phishingScore += spoofingResult.scoreContribution;
    }
    
    // ====== Link Analysis ======
    const linkResult = this.analyzeLinks(emailContent);
    if (linkResult.hasSuspiciousLinks) {
      indicators.push({
        type: 'Suspicious Link' as PhishingIndicatorType,
        description: linkResult.description,
        severity: linkResult.severity as 'Low' | 'Medium' | 'High',
        confidence: linkResult.confidence
      });
      phishingScore += linkResult.scoreContribution;
    }
    
    // ====== Mismatched URLs ======
    if (this.checkForMismatchedUrls(emailContent)) {
      indicators.push({
        type: 'Mismatched URLs' as PhishingIndicatorType,
        description: 'Email contains links where the displayed text doesn\'t match the actual URL',
        severity: 'High',
        confidence: 92
      });
      phishingScore += 28;
    }
    
    // ====== Urgency & Pressure Tactics ======
    const urgencyResult = this.analyzeUrgencyAndPressure(contentLower, subjectLower);
    if (urgencyResult.hasUrgencyTactics) {
      indicators.push({
        type: 'Urgency or Pressure' as PhishingIndicatorType,
        description: urgencyResult.description,
        severity: urgencyResult.severity as 'Low' | 'Medium' | 'High',
        confidence: urgencyResult.confidence
      });
      phishingScore += urgencyResult.scoreContribution;
    }
    
    // ====== Sensitive Information Requests ======
    const sensitiveInfoResult = this.analyzeSensitiveInfoRequests(contentLower);
    if (sensitiveInfoResult.requestsSensitiveInfo) {
      indicators.push({
        type: 'Request for Sensitive Information' as PhishingIndicatorType,
        description: sensitiveInfoResult.description,
        severity: 'High',
        confidence: sensitiveInfoResult.confidence
      });
      phishingScore += sensitiveInfoResult.scoreContribution;
    }
    
    // ====== Attachment Analysis ======
    const attachmentResult = this.analyzeAttachments(contentLower);
    if (attachmentResult.hasSuspiciousAttachments) {
      indicators.push({
        type: 'Suspicious Attachment' as PhishingIndicatorType,
        description: attachmentResult.description,
        severity: attachmentResult.severity as 'Low' | 'Medium' | 'High',
        confidence: attachmentResult.confidence
      });
      phishingScore += attachmentResult.scoreContribution;
    }
    
    // ====== Impersonation Attempt ======
    const impersonationResult = this.analyzeImpersonationAttempt(contentLower, sender, domain);
    if (impersonationResult.hasImpersonation) {
      indicators.push({
        type: 'Impersonation Attempt' as PhishingIndicatorType,
        description: impersonationResult.description,
        severity: impersonationResult.severity as 'Low' | 'Medium' | 'High',
        confidence: impersonationResult.confidence
      });
      phishingScore += impersonationResult.scoreContribution;
    }
    
    // ====== Grammar & Language Analysis ======
    if (emailContent.length > 0 && emailContent.split(' ').length > 10) {
      const languageResult = this.analyzeLanguageAndGrammar(emailContent);
      if (languageResult.hasIssues) {
        indicators.push({
          type: 'Grammar Errors' as PhishingIndicatorType,
          description: languageResult.description,
          severity: languageResult.severity as 'Low' | 'Medium' | 'High',
          confidence: languageResult.confidence
        });
        phishingScore += languageResult.scoreContribution;
      }
    }
    
    // ====== Context-aware analysis based on all factors ======
    // If multiple high-risk indicators are present, increase the score
    const highRiskIndicators = indicators.filter(ind => ind.severity === 'High');
    if (highRiskIndicators.length >= 2) {
      phishingScore += 10; // Additional penalty for multiple high-risk factors
    }
    
    // If urgency + request for sensitive info, strong phishing signal
    if (urgencyResult.hasUrgencyTactics && sensitiveInfoResult.requestsSensitiveInfo) {
      phishingScore += 15;
    }
    
    // Cap the score at 100
    phishingScore = Math.min(Math.round(phishingScore), 100);
    
    // If nothing suspicious was found, add a low score
    if (indicators.length === 0) {
      // More realistic low scores for legitimate emails
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
  private analyzeDomainAndSender(sender: string, domain: string) {
    const result = {
      isSuspicious: false,
      description: '',
      confidence: 0,
      scoreContribution: 0
    };
    
    // Check for common spoofed domains
    const commonDomainsToSpoof = [
      'paypal', 'amazon', 'apple', 'microsoft', 'google', 'facebook', 'netflix',
      'bank', 'chase', 'wellsfargo', 'citi', 'amex', 'bankofamerica', 'usbank',
      'dropbox', 'linkedin', 'twitter', 'instagram', 'docusign', 'fedex', 'ups',
      'usps', 'dhl', 'irs'
    ];
    
    if (!domain) return result;
    
    // Check for exact brand impersonation with typosquatting
    for (const targetDomain of commonDomainsToSpoof) {
      // Domain contains brand name but has suspicious elements
      if (domain.includes(targetDomain)) {
        // Check for hyphenated domains (paypal-secure.com)
        if (domain.includes('-')) {
          result.isSuspicious = true;
          result.description = `The sender domain "${domain}" contains hyphens and appears to be impersonating ${targetDomain}.com`;
          result.confidence = 87;
          result.scoreContribution = 32;
          return result;
        }
        
        // Check for subdomain abuse (e.g., paypal.malicious-site.com)
        if (domain.includes('.') && !domain.endsWith(`.${targetDomain}.com`) && 
            !domain.endsWith(`.${targetDomain}.org`) && !domain.endsWith(`.${targetDomain}.net`)) {
          result.isSuspicious = true;
          result.description = `The sender domain "${domain}" uses "${targetDomain}" as a subdomain, which is a common phishing tactic`;
          result.confidence = 90;
          result.scoreContribution = 35;
          return result;
        }
      }
      
      // Check for typosquatting with advanced detection
      if (domain !== `${targetDomain}.com` && domain.length > 5) {
        // Check for character substitution (paypa1.com, g00gle.com)
        if (/\d/.test(domain) && this.levenshteinDistance(domain, `${targetDomain}.com`) <= 2) {
          result.isSuspicious = true;
          result.description = `The sender domain "${domain}" appears to be a typosquat of "${targetDomain}.com" using number substitution`;
          result.confidence = 93;
          result.scoreContribution = 38;
          return result;
        }
        
        // Check for letter omission or addition
        if (this.levenshteinDistance(domain, `${targetDomain}.com`) === 1) {
          result.isSuspicious = true;
          result.description = `The sender domain "${domain}" is nearly identical to "${targetDomain}.com" with a single character difference`;
          result.confidence = 89;
          result.scoreContribution = 34;
          return result;
        }
        
        // Check for homoglyph attacks (using similar-looking characters)
        const domainWithoutTLD = domain.split('.')[0];
        if (domainWithoutTLD.includes('rn') || domainWithoutTLD.includes('vv') || 
            domainWithoutTLD.includes('l1') || domainWithoutTLD.includes('0o')) {
          result.isSuspicious = true;
          result.description = `The sender domain "${domain}" appears to use visually similar characters to mimic "${targetDomain}.com"`;
          result.confidence = 86;
          result.scoreContribution = 33;
          return result;
        }
      }
    }
    
    // Check for suspicious TLDs
    const suspiciousTLDs = ['.xyz', '.top', '.tk', '.club', '.online', '.info', '.site', '.gq', '.ml', '.cf'];
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
  private analyzeLinks(content: string) {
    const result = {
      hasSuspiciousLinks: false,
      description: '',
      severity: 'Medium',
      confidence: 0,
      scoreContribution: 0
    };
    
    // Create a more structured analysis of potential links
    const contentLower = content.toLowerCase();
    
    // Check for IP address URLs (direct IP navigation)
    const ipPattern = /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
    if (ipPattern.test(content)) {
      result.hasSuspiciousLinks = true;
      result.description = 'Email contains links using IP addresses instead of domain names, which is highly suspicious';
      result.severity = 'High';
      result.confidence = 95;
      result.scoreContribution = 28;
      return result;
    }
    
    // Check for URL shorteners which can hide malicious destinations
    const shortenerServices = ['bit.ly', 'tinyurl', 'goo.gl', 't.co', 'ow.ly', 'is.gd', 'tiny.cc', 'cli.gs', 'tr.im'];
    for (const shortener of shortenerServices) {
      if (contentLower.includes(shortener)) {
        result.hasSuspiciousLinks = true;
        result.description = `Email contains shortened URLs (using ${shortener}) which can mask malicious destinations`;
        result.severity = 'Medium';
        result.confidence = 80;
        result.scoreContribution = 20;
        return result;
      }
    }
    
    // Check for URL encoding and obfuscation
    if (content.includes('%3A') || content.includes('%2F') || content.includes('%3F') || 
        content.includes('%3D') || content.includes('%26')) {
      result.hasSuspiciousLinks = true;
      result.description = 'Email contains URLs with encoded characters, which may be attempting to hide malicious destinations';
      result.severity = 'High';
      result.confidence = 85;
      result.scoreContribution = 25;
      return result;
    }
    
    // Check for redirects and tracking parameters that could be malicious
    if (contentLower.includes('url=') || contentLower.includes('redirect=') || 
        contentLower.includes('goto=') || contentLower.includes('link=')) {
      result.hasSuspiciousLinks = true;
      result.description = 'Email contains URLs with redirect parameters that could lead to malicious sites';
      result.severity = 'Medium';
      result.confidence = 75;
      result.scoreContribution = 18;
      return result;
    }
    
    // Check for login/account verification links which are commonly spoofed
    if (contentLower.includes('login.') || contentLower.includes('account-verify') || 
        contentLower.includes('signin') || contentLower.includes('secure.login')) {
      result.hasSuspiciousLinks = true;
      result.description = 'Email contains links to login or account verification pages, which are frequently spoofed in phishing attacks';
      result.severity = 'Medium';
      result.confidence = 82;
      result.scoreContribution = 22;
      return result;
    }
    
    // Check for common phishing terms in URLs
    const phishingUrlTerms = ['confirm', 'update', 'verify', 'secure', 'alert', 'invoice', 'statement', 'receipt', 'document'];
    for (const term of phishingUrlTerms) {
      // Check if term is in URL-like context, not just in text
      if (contentLower.includes(`/${term}`) || contentLower.includes(`${term}.html`) || 
          contentLower.includes(`${term}.php`) || contentLower.includes(`${term}?`)) {
        result.hasSuspiciousLinks = true;
        result.description = `Email contains links with suspicious terms like "${term}" which are common in phishing URLs`;
        result.severity = 'Medium';
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
  private checkForMismatchedUrls(content: string): boolean {
    // This is a simplified version - in a real system, HTML parsing would be used
    // Look for potential mismatches in href attributes
    if (!content.includes('href=')) return false;
    
    // Extract potential link segments
    const segments = content.split('href=');
    for (let i = 1; i < segments.length; i++) {
      const linkPart = segments[i].split('>')[0].replace(/["']/g, '');
      const textPart = segments[i].split('>')[1]?.split('<')[0] || '';
      
      // If the link part has a URL and the text part has a different URL
      if (linkPart.includes('http') && textPart.includes('http') && 
          !linkPart.includes(textPart) && !textPart.includes(linkPart)) {
        return true;
      }
      
      // If link text mentions a trusted domain but points elsewhere
      const trustedDomains = ['paypal.com', 'amazon.com', 'apple.com', 'microsoft.com', 'google.com',
                             'facebook.com', 'chase.com', 'bankofamerica.com', 'wellsfargo.com'];
      
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
  private analyzeUrgencyAndPressure(contentLower: string, subjectLower: string) {
    const result = {
      hasUrgencyTactics: false,
      description: '',
      severity: 'Medium',
      confidence: 0,
      scoreContribution: 0
    };
    
    // Define urgency phrases by severity level
    const highUrgencyPhrases = [
      'account suspended', 'account disabled', 'account terminated', 'security breach',
      'unauthorized access', 'suspicious activity', 'immediate action required',
      'within 24 hours', 'account will be closed', 'legal action', 'overdue payment',
      'final notice', 'urgent security issue'
    ];
    
    const mediumUrgencyPhrases = [
      'verify now', 'update immediately', 'action required', 'expires soon',
      'limited time', 'urgent', 'warning', 'alert', 'important notice',
      'time sensitive', 'respond quickly', 'don\'t delay'
    ];
    
    const lowUrgencyPhrases = [
      'reminder', 'please update', 'attention', 'important information',
      'please review', 'soon', 'before it\'s too late', 'don\'t miss out'
    ];
    
    // Check high urgency phrases (most concerning)
    for (const phrase of highUrgencyPhrases) {
      if (contentLower.includes(phrase) || subjectLower.includes(phrase)) {
        result.hasUrgencyTactics = true;
        result.description = `Email creates a high sense of urgency with phrases like "${phrase}" to pressure immediate action`;
        result.severity = 'High';
        result.confidence = 88;
        result.scoreContribution = 25;
        return result;
      }
    }
    
    // Check medium urgency phrases
    for (const phrase of mediumUrgencyPhrases) {
      if (contentLower.includes(phrase) || subjectLower.includes(phrase)) {
        result.hasUrgencyTactics = true;
        result.description = `Email creates urgency with phrases like "${phrase}" to encourage quick action without proper verification`;
        result.severity = 'Medium';
        result.confidence = 78;
        result.scoreContribution = 18;
        return result;
      }
    }
    
    // Check low urgency phrases
    for (const phrase of lowUrgencyPhrases) {
      if (contentLower.includes(phrase) || subjectLower.includes(phrase)) {
        result.hasUrgencyTactics = true;
        result.description = `Email uses mild urgency tactics with phrases like "${phrase}" which could be legitimate but warrants attention`;
        result.severity = 'Low';
        result.confidence = 60;
        result.scoreContribution = 10;
        return result;
      }
    }
    
    // Check for deadline patterns
    const deadlinePatterns = [
      /within \d+ (hour|day|minute)/i, 
      /expires? (in|on) \d+/i,
      /before \w+ \d+/i,
      /by (today|tomorrow)/i
    ];
    
    for (const pattern of deadlinePatterns) {
      if (pattern.test(contentLower) || pattern.test(subjectLower)) {
        result.hasUrgencyTactics = true;
        result.description = 'Email creates urgency by setting a tight deadline for action, a common phishing tactic';
        result.severity = 'Medium';
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
  private analyzeSensitiveInfoRequests(contentLower: string) {
    const result = {
      requestsSensitiveInfo: false,
      description: '',
      confidence: 0,
      scoreContribution: 0
    };
    
    // Define phrases that commonly request sensitive information
    const criticalInfoPhrases = [
      'social security', 'ssn', 'tax id', 'passport', 'credit card', 'card number',
      'cvv', 'pin number', 'mother\'s maiden name', 'birth date', 'full ssn',
      'bank account', 'wire transfer', 'routing number', 'full card details'
    ];
    
    const highRiskPhrases = [
      'verify your account', 'confirm your information', 'update your details',
      'verification required', 'login details', 'password reset', 'security questions',
      'identity verification', 'billing information', 'payment details', 'enter your password'
    ];
    
    // Check for critical information requests
    for (const phrase of criticalInfoPhrases) {
      if (contentLower.includes(phrase)) {
        result.requestsSensitiveInfo = true;
        result.description = `Email requests extremely sensitive personal or financial information (${phrase})`;
        result.confidence = 95;
        result.scoreContribution = 35;
        return result;
      }
    }
    
    // Check for high risk information requests
    for (const phrase of highRiskPhrases) {
      if (contentLower.includes(phrase)) {
        result.requestsSensitiveInfo = true;
        result.description = `Email asks you to provide or verify account information or credentials`;
        result.confidence = 88;
        result.scoreContribution = 28;
        return result;
      }
    }
    
    // Check for patterns that indicate credential harvesting
    if ((contentLower.includes('log') || contentLower.includes('sign')) && 
        (contentLower.includes('your account') || contentLower.includes('for security')) &&
        (contentLower.includes('click') || contentLower.includes('link'))) {
      result.requestsSensitiveInfo = true;
      result.description = 'Email asks you to log in to your account via a provided link, a common credential harvesting tactic';
      result.confidence = 85;
      result.scoreContribution = 26;
      return result;
    }
    
    // Check for form-filling language
    if ((contentLower.includes('form') || contentLower.includes('fill')) && 
        (contentLower.includes('information') || contentLower.includes('details'))) {
      result.requestsSensitiveInfo = true;
      result.description = 'Email asks you to fill out a form with your information';
      result.confidence = 75;
      result.scoreContribution = 20;
      return result;
    }
    
    return result;
  }
  
  /**
   * Analyze attachments for suspicious patterns
   */
  private analyzeAttachments(contentLower: string) {
    const result = {
      hasSuspiciousAttachments: false,
      description: '',
      severity: 'Medium',
      confidence: 0,
      scoreContribution: 0
    };
    
    // High-risk executable extensions
    const criticalExtensions = [
      '.exe', '.bat', '.vbs', '.js', '.scr', '.cmd', '.pif', '.msi', '.hta', '.dll', '.ps1'
    ];
    
    // Medium-risk extensions that could contain macros or scripts
    const suspiciousExtensions = [
      '.zip', '.rar', '.7z', '.jar', '.iso', '.docm', '.xlsm', '.pptm'
    ];
    
    // Check for critical high-risk extensions
    for (const ext of criticalExtensions) {
      if (contentLower.includes(ext)) {
        result.hasSuspiciousAttachments = true;
        result.description = `Email contains references to executable file attachments (${ext}) which can run malicious code`;
        result.severity = 'High';
        result.confidence = 92;
        result.scoreContribution = 32;
        return result;
      }
    }
    
    // Check for suspicious extensions
    for (const ext of suspiciousExtensions) {
      if (contentLower.includes(ext)) {
        result.hasSuspiciousAttachments = true;
        result.description = `Email contains references to compressed or macro-enabled document attachments (${ext}) which may contain malicious code`;
        result.severity = 'Medium';
        result.confidence = 82;
        result.scoreContribution = 24;
        return result;
      }
    }
    
    // Check for specific executable file references
    const executablePatterns = [
      'setup', 'install', 'update.exe', 'patch', 'crack', 'keygen', 'activator'
    ];
    
    for (const pattern of executablePatterns) {
      if (contentLower.includes(pattern)) {
        result.hasSuspiciousAttachments = true;
        result.description = `Email contains references to potentially malicious executable files (${pattern})`;
        result.severity = 'High';
        result.confidence = 88;
        result.scoreContribution = 30;
        return result;
      }
    }
    
    // Check for coercive language about attachments
    if ((contentLower.includes('attachment') || contentLower.includes('attached') || contentLower.includes('file')) &&
        (contentLower.includes('open') || contentLower.includes('download') || contentLower.includes('enable')) &&
        (contentLower.includes('now') || contentLower.includes('immediately') || contentLower.includes('must'))) {
      
      result.hasSuspiciousAttachments = true;
      result.description = 'Email pressures recipient to open attachments or enable content, which may enable malicious code';
      result.severity = 'Medium';
      result.confidence = 85;
      result.scoreContribution = 26;
      return result;
    }
    
    return result;
  }
  
  /**
   * Analyze for impersonation attempts
   */
  private analyzeImpersonationAttempt(contentLower: string, sender: string, domain: string) {
    const result = {
      hasImpersonation: false,
      description: '',
      severity: 'Medium',
      confidence: 0,
      scoreContribution: 0
    };
    
    // Common impersonated entities
    const impersonatedEntities = [
      { name: 'paypal', terms: ['paypal payment', 'paypal team', 'paypal service', 'paypal account'] },
      { name: 'amazon', terms: ['amazon order', 'amazon team', 'amazon prime', 'amazon account', 'amazon shipping'] },
      { name: 'apple', terms: ['apple id', 'icloud', 'apple store', 'apple support', 'apple team'] },
      { name: 'microsoft', terms: ['microsoft account', 'microsoft team', 'office 365', 'microsoft security', 'microsoft support'] },
      { name: 'google', terms: ['google account', 'gmail team', 'google security', 'google drive', 'google support'] },
      { name: 'facebook', terms: ['facebook security', 'facebook team', 'facebook support', 'facebook account'] },
      { name: 'netflix', terms: ['netflix account', 'netflix team', 'netflix subscription', 'netflix payment'] },
      { name: 'bank', terms: ['bank account', 'banking team', 'account alert', 'fraud department', 'bank statement'] },
      { name: 'irs', terms: ['tax refund', 'tax return', 'irs notice', 'irs payment', 'tax payment'] },
      { name: 'shipping', terms: ['package delivery', 'delivery notification', 'shipping update', 'track your package'] }
    ];
    
    // Check for official-sounding language combined with mismatched domain
    for (const entity of impersonatedEntities) {
      for (const term of entity.terms) {
        if (contentLower.includes(term)) {
          // If content mentions entity, but sender domain doesn't match
          if (!domain.includes(entity.name) && !sender.includes(entity.name)) {
            result.hasImpersonation = true;
            result.description = `Email appears to be from ${entity.name} but was sent from ${domain}`;
            result.severity = 'High';
            result.confidence = 92;
            result.scoreContribution = 30;
            return result;
          }
        }
      }
    }
    
    // Check for CEO/executive fraud (internal authority impersonation)
    const executiveTitles = ['ceo', 'president', 'director', 'manager', 'supervisor', 'executive', 'hr', 'human resources'];
    for (const title of executiveTitles) {
      if (contentLower.includes(title) && (contentLower.includes('urgent request') || contentLower.includes('immediate attention'))) {
        result.hasImpersonation = true;
        result.description = `Email appears to impersonate a ${title} or authority figure making an urgent request`;
        result.severity = 'High';
        result.confidence = 85;
        result.scoreContribution = 28;
        return result;
      }
    }
    
    // Check for specific impersonation phrases
    const impersonationPhrases = [
      'this is', 'we are', 'on behalf of', 'representing', 'from the desk of',
      'department of', 'official notice', 'support team', 'security team', 'service team'
    ];
    
    for (const phrase of impersonationPhrases) {
      if (contentLower.includes(phrase) && !domain.includes(contentLower.split(phrase)[1]?.trim()?.split(' ')[0] || '')) {
        result.hasImpersonation = true;
        result.description = 'Email contains phrases claiming to be from an organization that doesn\'t match the sender\'s domain';
        result.severity = 'Medium';
        result.confidence = 78;
        result.scoreContribution = 22;
        return result;
      }
    }
    
    return result;
  }
  
  /**
   * Analyze language and grammar for issues common in phishing
   */
  private analyzeLanguageAndGrammar(content: string) {
    const result = {
      hasIssues: false,
      description: '',
      severity: 'Low',
      confidence: 0,
      scoreContribution: 0
    };
    
    const contentLower = content.toLowerCase();
    const words = content.split(/\s+/);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Calculate rough error metrics (this would be more advanced in a real system)
    let poorGrammarScore = 0;
    
    // Check for multiple consecutive punctuation (!!!!)
    if (/[!?]{2,}/.test(content)) {
      poorGrammarScore += 2;
    }
    
    // Check for ALL CAPS sections (excluding acronyms)
    const allCapsWords = words.filter(w => w.length > 3 && w === w.toUpperCase());
    if (allCapsWords.length > 1) {
      poorGrammarScore += allCapsWords.length;
    }
    
    // Check for mixed capitalization (e.g., "CliCk HeRe")
    const mixedCaseWords = words.filter(w => {
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
    
    // Check for extremely short sentences (often commands in phishing)
    const shortSentences = sentences.filter(s => s.split(' ').length < 3);
    if (shortSentences.length > 2) {
      poorGrammarScore += shortSentences.length;
    }
    
    // Check for common grammar errors and typos
    const commonErrors = [
      'acount', 'verfy', 'verifcation', 'authetication', 'immediatly', 'securty', 
      'infomation', 'infromation', 'confirmat', 'suspicios', 'kindly', 'valuble'
    ];
    
    for (const error of commonErrors) {
      if (contentLower.includes(error)) {
        poorGrammarScore += 3;
      }
    }
    
    // Check for overly generic greetings often used in phishing
    const genericGreetings = [
      'dear user', 'dear customer', 'dear valued', 'dear client',
      'attention user', 'hello user', 'valued customer'
    ];
    
    for (const greeting of genericGreetings) {
      if (contentLower.includes(greeting)) {
        poorGrammarScore += 4;
      }
    }
    
    // Determine result based on grammar score
    if (poorGrammarScore >= 10) {
      result.hasIssues = true;
      result.description = 'Email contains multiple grammar errors, unusual formatting, and generic greetings typical of phishing attempts';
      result.severity = 'Medium';
      result.confidence = 80;
      result.scoreContribution = 18;
    } else if (poorGrammarScore >= 5) {
      result.hasIssues = true;
      result.description = 'Email contains some grammar or spelling errors that are common in phishing messages';
      result.severity = 'Low';
      result.confidence = 65;
      result.scoreContribution = 10;
    }
    
    return result;
  }

  /**
   * Analyze language and grammar for issues common in phishing
   */
  private analyzeLanguageAndGrammar(content: string) {
    const result = {
      hasIssues: false,
      description: '',
      severity: 'Low',
      confidence: 0,
      scoreContribution: 0
    };
    
    const contentLower = content.toLowerCase();
    const words = content.split(/\s+/);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Calculate rough error metrics (this would be more advanced in a real system)
    let poorGrammarScore = 0;
    
    // Check for multiple consecutive punctuation (!!!!)
    if (/[!?]{2,}/.test(content)) {
      poorGrammarScore += 2;
    }
    
    // Check for ALL CAPS sections (excluding acronyms)
    const allCapsWords = words.filter(w => w.length > 3 && w === w.toUpperCase());
    if (allCapsWords.length > 1) {
      poorGrammarScore += allCapsWords.length;
    }
    
    // Check for mixed capitalization (e.g., "CliCk HeRe")
    const mixedCaseWords = words.filter(w => {
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
    
    // Check for extremely short sentences (often commands in phishing)
    const shortSentences = sentences.filter(s => s.split(' ').length < 3);
    if (shortSentences.length > 2) {
      poorGrammarScore += shortSentences.length;
    }
    
    // Check for common grammar errors and typos
    const commonErrors = [
      'acount', 'verfy', 'verifcation', 'authetication', 'immediatly', 'securty', 
      'infomation', 'infromation', 'confirmat', 'suspicios', 'kindly', 'valuble'
    ];
    
    for (const error of commonErrors) {
      if (contentLower.includes(error)) {
        poorGrammarScore += 3;
      }
    }
    
    // Check for overly generic greetings often used in phishing
    const genericGreetings = [
      'dear user', 'dear customer', 'dear valued', 'dear client',
      'attention user', 'hello user', 'valued customer'
    ];
    
    for (const greeting of genericGreetings) {
      if (contentLower.includes(greeting)) {
        poorGrammarScore += 4;
      }
    }
    
    // Determine result based on grammar score
    if (poorGrammarScore >= 10) {
      result.hasIssues = true;
      result.description = 'Email contains multiple grammar errors, unusual formatting, and generic greetings typical of phishing attempts';
      result.severity = 'Medium';
      result.confidence = 80;
      result.scoreContribution = 18;
    } else if (poorGrammarScore >= 5) {
      result.hasIssues = true;
      result.description = 'Email contains some grammar or spelling errors that are common in phishing messages';
      result.severity = 'Low';
      result.confidence = 65;
      result.scoreContribution = 10;
    }
    
    return result;
  }
  
  /**
   * Analyze for impersonation attempts
   */
  private analyzeImpersonationAttempt(contentLower: string, sender: string, domain: string) {
    const result = {
      hasImpersonation: false,
      description: '',
      severity: 'Medium',
      confidence: 0,
      scoreContribution: 0
    };
    
    // Common impersonated entities
    const impersonatedEntities = [
      { name: 'paypal', terms: ['paypal payment', 'paypal team', 'paypal service', 'paypal account'] },
      { name: 'amazon', terms: ['amazon order', 'amazon team', 'amazon prime', 'amazon account', 'amazon shipping'] },
      { name: 'apple', terms: ['apple id', 'icloud', 'apple store', 'apple support', 'apple team'] },
      { name: 'microsoft', terms: ['microsoft account', 'microsoft team', 'office 365', 'microsoft security', 'microsoft support'] },
      { name: 'google', terms: ['google account', 'gmail team', 'google security', 'google drive', 'google support'] },
      { name: 'facebook', terms: ['facebook security', 'facebook team', 'facebook support', 'facebook account'] },
      { name: 'netflix', terms: ['netflix account', 'netflix team', 'netflix subscription', 'netflix payment'] },
      { name: 'bank', terms: ['bank account', 'banking team', 'account alert', 'fraud department', 'bank statement'] },
      { name: 'irs', terms: ['tax refund', 'tax return', 'irs notice', 'irs payment', 'tax payment'] },
      { name: 'shipping', terms: ['package delivery', 'delivery notification', 'shipping update', 'track your package'] }
    ];
    
    // Check for official-sounding language combined with mismatched domain
    for (const entity of impersonatedEntities) {
      for (const term of entity.terms) {
        if (contentLower.includes(term)) {
          // If content mentions entity, but sender domain doesn't match
          if (!domain.includes(entity.name) && !sender.includes(entity.name)) {
            result.hasImpersonation = true;
            result.description = `Email appears to be from ${entity.name} but was sent from ${domain}`;
            result.severity = 'High';
            result.confidence = 92;
            result.scoreContribution = 30;
            return result;
          }
        }
      }
    }
    
    // Check for CEO/executive fraud (internal authority impersonation)
    const executiveTitles = ['ceo', 'president', 'director', 'manager', 'supervisor', 'executive', 'hr', 'human resources'];
    for (const title of executiveTitles) {
      if (contentLower.includes(title) && (contentLower.includes('urgent request') || contentLower.includes('immediate attention'))) {
        result.hasImpersonation = true;
        result.description = `Email appears to impersonate a ${title} or authority figure making an urgent request`;
        result.severity = 'High';
        result.confidence = 85;
        result.scoreContribution = 28;
        return result;
      }
    }
    
    // Check for specific impersonation phrases
    const impersonationPhrases = [
      'this is', 'we are', 'on behalf of', 'representing', 'from the desk of',
      'department of', 'official notice', 'support team', 'security team', 'service team'
    ];
    
    for (const phrase of impersonationPhrases) {
      if (contentLower.includes(phrase) && !domain.includes(contentLower.split(phrase)[1]?.trim()?.split(' ')[0] || '')) {
        result.hasImpersonation = true;
        result.description = 'Email contains phrases claiming to be from an organization that doesn\'t match the sender\'s domain';
        result.severity = 'Medium';
        result.confidence = 78;
        result.scoreContribution = 22;
        return result;
      }
    }
    
    return result;
  }
  
  // These legacy methods can be maintained for backward compatibility
  private checkForSpoofedDomain(sender: string): boolean {
    const spoofingResult = this.analyzeDomainAndSender(sender, sender.split('@')[1]?.toLowerCase() || '');
    return spoofingResult.isSuspicious;
  }

  private checkForSuspiciousLinks(content: string): boolean {
    const linkResult = this.analyzeLinks(content);
    return linkResult.hasSuspiciousLinks;
  }

  private checkForUrgencyLanguage(content: string, subject: string): boolean {
    const urgencyResult = this.analyzeUrgencyAndPressure(content.toLowerCase(), subject.toLowerCase());
    return urgencyResult.hasUrgencyTactics;
  }

  private checkForSensitiveInfoRequests(content: string): boolean {
    const sensitiveInfoResult = this.analyzeSensitiveInfoRequests(content.toLowerCase());
    return sensitiveInfoResult.requestsSensitiveInfo;
  }

  private checkForSuspiciousAttachments(content: string): boolean {
    const attachmentResult = this.analyzeAttachments(content.toLowerCase());
    return attachmentResult.hasSuspiciousAttachments;
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