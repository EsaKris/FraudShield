import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmailAnalyzer from "@/components/phishing/EmailAnalyzer";
import EmailList from "@/components/phishing/EmailList";
import EmailStats from "@/components/phishing/EmailStats";
import { PhishingEmail } from "@/lib/types";

const PhishingDetection = () => {
  const [selectedTab, setSelectedTab] = useState<string>("emails");
  const [selectedEmail, setSelectedEmail] = useState<PhishingEmail | null>(null);

  const { data: phishingEmails, isLoading: emailsLoading } = useQuery<PhishingEmail[]>({
    queryKey: ['/api/phishing/emails']
  });

  const handleEmailSelected = (email: PhishingEmail) => {
    setSelectedEmail(email);
    setSelectedTab("analyze");
  };

  return (
    <>
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Email Phishing Detection</h1>
          <div className="flex items-center space-x-3">
            <button className="p-1.5 rounded-full bg-[#f4f4f4] hover:bg-[#e0e0e0]">
              <i className="fas fa-question-circle text-[#525252]"></i>
            </button>
          </div>
        </div>
        <p className="mt-2 text-[#525252]">
          Analyze and detect potential phishing attempts in emails. Upload suspicious emails for scanning or review previously analyzed emails.
        </p>
      </header>

      <Tabs defaultValue="emails" value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="emails">Email List</TabsTrigger>
          <TabsTrigger value="analyze">Analyze Email</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="emails">
          <Card>
            <CardHeader>
              <CardTitle>Phishing Email Detection History</CardTitle>
              <CardDescription>Review previously analyzed emails and their risk assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <EmailList 
                emails={phishingEmails || []}
                isLoading={emailsLoading}
                onEmailSelected={handleEmailSelected}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analyze">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedEmail ? "Email Analysis Results" : "Analyze Suspicious Email"}
              </CardTitle>
              <CardDescription>
                {selectedEmail 
                  ? `Viewing analysis for "${selectedEmail.subject}"`
                  : "Enter email details for phishing analysis"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailAnalyzer 
                preselectedEmail={selectedEmail}
                onAnalysisComplete={(result) => {
                  setSelectedEmail(result);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Phishing Detection Statistics</CardTitle>
              <CardDescription>Overview of detected phishing attempts and indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <EmailStats emails={phishingEmails || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default PhishingDetection;