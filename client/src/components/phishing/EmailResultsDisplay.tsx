import { PhishingEmail, PhishingIndicator } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface EmailResultsDisplayProps {
  email: PhishingEmail;
}

const EmailResultsDisplay = ({ email }: EmailResultsDisplayProps) => {
  const getScoreColor = (score: number) => {
    if (score < 40) return "bg-green-500";
    if (score < 70) return "bg-amber-500";
    return "bg-red-500";
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case "Low": return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Medium": return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "High": return "bg-red-100 text-red-800 hover:bg-red-100";
      default: return "bg-slate-100";
    }
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case "Analyzed": return "bg-green-100 text-green-800";
      case "Pending": return "bg-blue-100 text-blue-800";
      case "Quarantined": return "bg-red-100 text-red-800";
      default: return "bg-slate-100";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium">Analysis Results</h3>
          <Badge className={getStatusColor(email.status)}>{email.status}</Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Phishing Score:</span>
          <span className="text-xl font-bold">{email.phishingScore}%</span>
          <Progress 
            value={email.phishingScore} 
            className={`h-2 ${getScoreColor(email.phishingScore)}`} 
          />
        </div>
        
        <div className="text-sm text-slate-500">
          {email.analyzedAt ? `Analyzed on ${new Date(email.analyzedAt).toLocaleString()}` : ""}
        </div>
      </div>
      
      <div className="p-4 border rounded-md space-y-2 bg-slate-50">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <span className="text-sm font-medium text-slate-500">From:</span>
            <div>{email.sender}</div>
          </div>
          <div>
            <span className="text-sm font-medium text-slate-500">To:</span>
            <div>{email.recipient}</div>
          </div>
        </div>
        <div>
          <span className="text-sm font-medium text-slate-500">Subject:</span>
          <div className="font-medium">{email.subject}</div>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Email Content:</h4>
        <div className="p-4 border rounded-md whitespace-pre-wrap bg-white text-sm max-h-52 overflow-y-auto">
          {email.content}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Detected Indicators:</h4>
        {email.indicators && email.indicators.length > 0 ? (
          <div className="space-y-3">
            {email.indicators.map((indicator: PhishingIndicator) => (
              <Card key={indicator.id} className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{indicator.type}</span>
                    <p className="text-sm text-slate-500 mt-1">{indicator.description}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge className={getSeverityColor(indicator.severity)}>
                      {indicator.severity}
                    </Badge>
                    <span className="text-xs text-slate-500 mt-1">
                      {indicator.confidence}% confidence
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No suspicious indicators detected in this email.</p>
        )}
      </div>
      
      {email.phishingScore >= 70 && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-md">
          <h4 className="font-medium text-red-800 mb-1">High Risk Email</h4>
          <p className="text-sm text-red-700">
            This email has been flagged as highly suspicious and may be a phishing attempt. Do not click any links or download attachments from this email.
          </p>
        </div>
      )}
      
      {email.phishingScore >= 40 && email.phishingScore < 70 && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-md">
          <h4 className="font-medium text-amber-800 mb-1">Moderate Risk Email</h4>
          <p className="text-sm text-amber-700">
            This email contains some suspicious elements. Exercise caution with any links or attachments.
          </p>
        </div>
      )}
      
      {email.phishingScore < 40 && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-md">
          <h4 className="font-medium text-green-800 mb-1">Low Risk Email</h4>
          <p className="text-sm text-green-700">
            This email appears to be legitimate, but still exercise normal caution.
          </p>
        </div>
      )}

      <Separator />
      
      <div className="text-sm text-slate-500">
        <p>Note: This analysis is based on automated scanning and may not be 100% accurate. Always exercise caution with suspicious emails.</p>
      </div>
    </div>
  );
};

export default EmailResultsDisplay;