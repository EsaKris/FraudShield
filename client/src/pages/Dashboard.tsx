import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import StatCard from "@/components/dashboard/StatCard";
import ActivityTable from "@/components/dashboard/ActivityTable";
import { ActivityLog, DashboardStats } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ShieldAlert, UserSearch, AlertTriangle, FileText, ChevronRight, Settings, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const Dashboard = () => {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/stats']
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<ActivityLog[]>({
    queryKey: ['/api/activities']
  });

  return (
    <>
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.username || 'User'}</h1>
            <p className="text-gray-500 mt-1">Here's what's happening with your security.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/profile">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* System Summary */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
                <div className="h-20"></div>
              </div>
            ))
          ) : (
            <>
              <StatCard 
                icon="fas fa-user-shield"
                iconColor="text-[#0f62fe]"
                bgColor="bg-blue-100"
                title="Identities Verified"
                value={stats?.identitiesVerified || 0}
                trend={{ value: "12% from last month", positive: true }}
              />
              
              <StatCard 
                icon="fas fa-exclamation-circle"
                iconColor="text-[#da1e28]"
                bgColor="bg-red-100"
                title="Fraud Detected"
                value={stats?.fraudDetected || 0}
                trend={{ value: "5% from last month", positive: false }}
              />
              
              <StatCard 
                icon="fas fa-flag"
                iconColor="text-[#f1c21b]"
                bgColor="bg-yellow-100"
                title="Suspicious Cases"
                value={stats?.suspiciousCases || 0}
                trend={{ value: "3% from last month", positive: false }}
              />
              
              <StatCard 
                icon="fas fa-check-circle"
                iconColor="text-[#42be65]"
                bgColor="bg-green-100"
                title="System Uptime"
                value={stats?.systemUptime || "99.8%"}
                trend={{ value: "All services operational", positive: true }}
              />
            </>
          )}
        </div>
      </section>

      {/* Security Services */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Choose a Security Service</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Photo Recognition */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <UserSearch className="w-5 h-5 mr-2 text-blue-500" />
                Photo Recognition
              </CardTitle>
              <CardDescription>
                Verify identities and detect fraud through image analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-500">
              Upload photos to analyze faces, verify identities, and check for potential fraud.
            </CardContent>
            <CardFooter>
              <Link href="/photo-recognition">
                <Button className="w-full">
                  Go to Photo Recognition
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Fraud Detection */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Fraud Detection
              </CardTitle>
              <CardDescription>
                Detect suspicious transactions and activities
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-500">
              Monitor and analyze transactions for suspicious patterns and potential fraud.
            </CardContent>
            <CardFooter>
              <Link href="/fraud-detection">
                <Button className="w-full">
                  Go to Fraud Detection
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Phishing Detection */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <ShieldAlert className="w-5 h-5 mr-2 text-green-500" />
                Phishing Detection
              </CardTitle>
              <CardDescription>
                Analyze emails for phishing attempts
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-500">
              Scan and analyze emails to identify potential phishing attempts and threats.
            </CardContent>
            <CardFooter>
              <Link href="/phishing-detection">
                <Button className="w-full">
                  Go to Phishing Detection
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <Link href="/reports">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        
        {activitiesLoading ? (
          <div className="bg-white rounded-lg shadow overflow-hidden p-6 animate-pulse">
            <div className="h-40"></div>
          </div>
        ) : (
          <ActivityTable activities={activities || []} />
        )}
      </section>
    </>
  );
};

export default Dashboard;
