import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { PhishingEmail } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import EmailResultsDisplay from "./EmailResultsDisplay";

interface EmailAnalyzerProps {
  preselectedEmail: PhishingEmail | null;
  onAnalysisComplete: (result: PhishingEmail) => void;
}

const EmailAnalyzer = ({ preselectedEmail, onAnalysisComplete }: EmailAnalyzerProps) => {
  const [email, setEmail] = useState({
    subject: "",
    sender: "",
    recipient: "",
    content: ""
  });
  const [result, setResult] = useState<PhishingEmail | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (preselectedEmail) {
      setResult(preselectedEmail);
    }
  }, [preselectedEmail]);

  const analyzeEmailMutation = useMutation({
    mutationFn: async (emailData: typeof email) => {
      const response = await apiRequest("POST", "/api/phishing/analyze", emailData);
      const data = await response.json();
      return data as PhishingEmail;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/phishing/emails'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      setResult(data);
      onAnalysisComplete(data);
      toast({
        title: "Analysis Complete",
        description: `Email analyzed with phishing score: ${data.phishingScore}%`,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze email",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.content || !email.sender || !email.subject || !email.recipient) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields before analyzing",
        variant: "destructive",
      });
      return;
    }
    analyzeEmailMutation.mutate(email);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmail(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setEmail({
      subject: "",
      sender: "",
      recipient: "",
      content: ""
    });
    setResult(null);
  };

  // If we're viewing a preselected email result
  if (result) {
    return (
      <div>
        <EmailResultsDisplay email={result} />
        <div className="mt-4 flex justify-end">
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="mr-2"
          >
            Analyze New Email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              name="subject"
              placeholder="Enter the email subject"
              value={email.subject}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sender">Sender Email</Label>
            <Input
              id="sender"
              name="sender"
              placeholder="example@domain.com"
              value={email.sender}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="recipient">Your Email (Recipient)</Label>
            <Input
              id="recipient"
              name="recipient"
              placeholder="your@email.com"
              value={email.recipient}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="content">Email Content</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Paste the full email content here"
              rows={10}
              value={email.content}
              onChange={handleInputChange}
              className="resize-none"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button 
            variant="outline" 
            type="button" 
            onClick={handleReset}
            className="mr-2"
          >
            Clear
          </Button>
          <Button 
            type="submit"
            disabled={analyzeEmailMutation.isPending}
            className="bg-[#0f62fe] text-white hover:bg-blue-700"
          >
            {analyzeEmailMutation.isPending ? (
              <span className="flex items-center">
                <i className="fas fa-spinner fa-spin mr-2"></i> Analyzing...
              </span>
            ) : (
              "Analyze Email"
            )}
          </Button>
        </div>
      </form>
      
      <div className="border border-[#f4f4f4] p-4 rounded-md bg-slate-50">
        <h3 className="font-medium text-[#525252] mb-2">Test Examples:</h3>
        <div className="text-sm text-[#8d8d8d] space-y-1">
          <p className="flex items-center">
            <i className="fas fa-info-circle text-[#0f62fe] mr-2"></i>
            Try pasting suspicious emails to see if they're detected as phishing attempts
          </p>
          <p>For testing, use suspicious words like "urgent", "account verification", "click here", "password reset", etc.</p>
          <p>Try using suspicious sender domains like "bank-secure.com" instead of legitimate ones.</p>
        </div>
      </div>
    </div>
  );
};

export default EmailAnalyzer;