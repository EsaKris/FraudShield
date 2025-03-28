import { useMemo } from "react";
import { PhishingEmail, PhishingIndicatorType } from "@/lib/types";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmailStatsProps {
  emails: PhishingEmail[];
}

const EmailStats = ({ emails }: EmailStatsProps) => {
  const riskDistribution = useMemo(() => {
    const distribution = {
      low: 0,
      medium: 0,
      high: 0
    };
    
    emails.forEach(email => {
      if (email.phishingScore < 40) distribution.low++;
      else if (email.phishingScore < 70) distribution.medium++;
      else distribution.high++;
    });
    
    return [
      { name: "Low Risk", value: distribution.low, color: "#22c55e" },
      { name: "Medium Risk", value: distribution.medium, color: "#f59e0b" },
      { name: "High Risk", value: distribution.high, color: "#ef4444" },
    ];
  }, [emails]);
  
  const indicatorStats = useMemo(() => {
    const indicatorCounts: Record<PhishingIndicatorType, number> = {
      "Suspicious Link": 0,
      "Spoofed Domain": 0,
      "Request for Sensitive Information": 0,
      "Suspicious Attachment": 0,
      "Impersonation Attempt": 0,
      "Urgency or Pressure": 0,
      "Grammar Errors": 0,
      "Mismatched URLs": 0
    };
    
    emails.forEach(email => {
      if (email.indicators && email.indicators.length > 0) {
        email.indicators.forEach(indicator => {
          if (indicator.type in indicatorCounts) {
            indicatorCounts[indicator.type as PhishingIndicatorType]++;
          }
        });
      }
    });
    
    // Convert to array for chart
    return Object.entries(indicatorCounts)
      .map(([key, value]) => ({ 
        name: key, 
        count: value 
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 indicators
  }, [emails]);
  
  // Calculate average phishing score
  const averageScore = useMemo(() => {
    if (emails.length === 0) return 0;
    const sum = emails.reduce((acc, email) => acc + email.phishingScore, 0);
    return Math.round(sum / emails.length);
  }, [emails]);
  
  // Count emails by status
  const statusCounts = useMemo(() => {
    const counts = {
      Analyzed: 0,
      Pending: 0,
      Quarantined: 0
    };
    
    emails.forEach(email => {
      if (email.status in counts) {
        counts[email.status as keyof typeof counts]++;
      }
    });
    
    return counts;
  }, [emails]);

  if (emails.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-slate-700">No Data Available</h3>
        <p className="text-slate-500 mt-1">
          No emails have been analyzed yet. Use the "Analyze Email" tab to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Average Phishing Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}%</div>
            <div className="text-xs text-slate-500 mt-1">
              Based on {emails.length} analyzed emails
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Quarantined Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.Quarantined}</div>
            <div className="text-xs text-slate-500 mt-1">
              High-risk emails requiring attention
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Emails Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emails.length}</div>
            <div className="text-xs text-slate-500 mt-1">
              {statusCounts.Analyzed} safe, {statusCounts.Quarantined} quarantined
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Phishing Indicators</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={indicatorStats}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 100,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  width={120}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-sm text-slate-500 mt-8">
        <p>
          <strong>Note:</strong> Statistics are based on analyzed emails only. 
          The system identifies phishing attempts based on common indicators like suspicious links, 
          spoofed domains, urgent language, and requests for sensitive information.
        </p>
      </div>
    </div>
  );
};

export default EmailStats;