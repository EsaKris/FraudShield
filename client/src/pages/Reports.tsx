import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { DashboardStats, FraudAlert, ActivityLog } from "@/lib/types";

const Reports = () => {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['/api/stats']
  });

  const { data: fraudAlerts } = useQuery<FraudAlert[]>({
    queryKey: ['/api/fraud/alerts']
  });

  const { data: activities } = useQuery<ActivityLog[]>({
    queryKey: ['/api/activities']
  });

  // Sample data for time-series chart
  const timeSeriesData = [
    { name: 'Jan', verifications: 65, fraud: 4 },
    { name: 'Feb', verifications: 78, fraud: 5 },
    { name: 'Mar', verifications: 85, fraud: 7 },
    { name: 'Apr', verifications: 91, fraud: 6 },
    { name: 'May', verifications: 112, fraud: 9 },
    { name: 'Jun', verifications: 120, fraud: 10 },
    { name: 'Jul', verifications: 130, fraud: 12 },
  ];

  // Data for fraud type distribution
  const getFraudTypeDistribution = () => {
    if (!fraudAlerts || fraudAlerts.length === 0) return [];
    
    const types: Record<string, number> = {};
    fraudAlerts.forEach(alert => {
      types[alert.alertType] = (types[alert.alertType] || 0) + 1;
    });
    
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  };

  // Data for activity status distribution
  const getActivityStatusDistribution = () => {
    if (!activities || activities.length === 0) return [];
    
    const statuses: Record<string, number> = {};
    activities.forEach(activity => {
      statuses[activity.status] = (statuses[activity.status] || 0) + 1;
    });
    
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  };

  // Colors for the pie charts
  const COLORS = ['#0f62fe', '#42be65', '#f1c21b', '#da1e28', '#8d8d8d'];

  return (
    <>
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Analytics & Reports</h1>
          <div className="flex items-center space-x-3">
            <button className="px-3 py-1.5 bg-[#0f62fe] text-white rounded hover:bg-blue-700 flex items-center">
              <i className="fas fa-download mr-2"></i> Export
            </button>
          </div>
        </div>
        <p className="mt-2 text-[#525252]">Detailed analytics and reports on system activities and fraud detection.</p>
      </header>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Analysis</TabsTrigger>
          <TabsTrigger value="verification">Verification Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>System Activity Over Time</CardTitle>
              <CardDescription>Verifications and fraud detections over the past months</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timeSeriesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="verifications" stroke="#0f62fe" name="Identity Verifications" />
                  <Line type="monotone" dataKey="fraud" stroke="#da1e28" name="Fraud Detections" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Fraud Type Distribution</CardTitle>
                <CardDescription>Breakdown of different fraud types detected</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getFraudTypeDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getFraudTypeDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Activity Status</CardTitle>
                <CardDescription>Distribution of activity outcomes</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getActivityStatusDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getActivityStatusDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>Summary of system performance and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#f4f4f4] p-4 rounded-lg">
                  <div className="text-[#0f62fe] mb-1"><i className="fas fa-user-shield mr-2"></i> Identities Verified</div>
                  <div className="text-2xl font-bold">{stats?.identitiesVerified || 0}</div>
                </div>
                <div className="bg-[#f4f4f4] p-4 rounded-lg">
                  <div className="text-[#da1e28] mb-1"><i className="fas fa-exclamation-circle mr-2"></i> Fraud Detected</div>
                  <div className="text-2xl font-bold">{stats?.fraudDetected || 0}</div>
                </div>
                <div className="bg-[#f4f4f4] p-4 rounded-lg">
                  <div className="text-[#f1c21b] mb-1"><i className="fas fa-flag mr-2"></i> Suspicious Cases</div>
                  <div className="text-2xl font-bold">{stats?.suspiciousCases || 0}</div>
                </div>
                <div className="bg-[#f4f4f4] p-4 rounded-lg">
                  <div className="text-[#42be65] mb-1"><i className="fas fa-check-circle mr-2"></i> System Uptime</div>
                  <div className="text-2xl font-bold">{stats?.systemUptime || "99.8%"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fraud">
          <div className="text-center py-12">
            <div className="mx-auto flex justify-center text-[#8d8d8d] mb-4">
              <i className="fas fa-chart-bar text-5xl"></i>
            </div>
            <h3 className="text-lg font-medium text-[#525252] mb-2">Detailed Fraud Analytics</h3>
            <p className="text-[#8d8d8d] text-sm max-w-md mx-auto">This section will contain advanced fraud analytics and trend detection.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="verification">
          <div className="text-center py-12">
            <div className="mx-auto flex justify-center text-[#8d8d8d] mb-4">
              <i className="fas fa-fingerprint text-5xl"></i>
            </div>
            <h3 className="text-lg font-medium text-[#525252] mb-2">Verification Metrics</h3>
            <p className="text-[#8d8d8d] text-sm max-w-md mx-auto">This section will contain detailed metrics on identity verification processes.</p>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Reports;
