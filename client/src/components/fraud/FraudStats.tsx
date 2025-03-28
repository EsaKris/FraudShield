import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FraudAlert } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

interface FraudStatsProps {
  fraudAlerts: FraudAlert[];
}

const FraudStats = ({ fraudAlerts }: FraudStatsProps) => {
  // Generate alert type data for the bar chart
  const getAlertTypeData = () => {
    const types: Record<string, number> = {};
    
    fraudAlerts.forEach(alert => {
      const type = alert.alertType;
      types[type] = (types[type] || 0) + 1;
    });
    
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  };
  
  // Generate severity data for the pie chart
  const getSeverityData = () => {
    const severityCount: Record<string, number> = {
      'Low': 0,
      'Medium': 0,
      'High': 0
    };
    
    fraudAlerts.forEach(alert => {
      severityCount[alert.severity] = (severityCount[alert.severity] || 0) + 1;
    });
    
    return Object.entries(severityCount).map(([name, value]) => ({ name, value }));
  };
  
  const alertTypeData = getAlertTypeData();
  const severityData = getSeverityData();
  
  // Colors for the severity pie chart
  const SEVERITY_COLORS = {
    'Low': '#42be65',
    'Medium': '#f1c21b',
    'High': '#da1e28'
  };
  
  // Function to get severity color
  const getSeverityColor = (severity: string) => {
    return SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || '#8d8d8d';
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fraud Alerts by Type</CardTitle>
          <CardDescription>Distribution of alert types in the system</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {alertTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertTypeData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={150} />
                <Tooltip 
                  formatter={(value) => [`${value} alerts`, 'Count']}
                  labelFormatter={(label) => `Alert Type: ${label}`}
                />
                <Bar dataKey="value" fill="#0f62fe" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[#8d8d8d]">
              <p>No fraud alert data available</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alerts by Severity</CardTitle>
          <CardDescription>Breakdown of alerts by risk level</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {severityData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getSeverityColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} alerts`, 'Count']}
                  labelFormatter={(label) => `Severity: ${label}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[#8d8d8d]">
              <p>No severity data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FraudStats;
