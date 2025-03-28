import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/dashboard/StatCard";
import ActivityTable from "@/components/dashboard/ActivityTable";
import { ActivityLog, DashboardStats } from "@/lib/types";

const Dashboard = () => {
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
          <h1 className="text-2xl font-bold">Fraud & Identity Detection Dashboard</h1>
          <div className="flex items-center space-x-3">
            <button className="p-1.5 rounded-full bg-[#f4f4f4] hover:bg-[#e0e0e0]">
              <i className="fas fa-bell text-[#525252]"></i>
            </button>
            <button className="p-1.5 rounded-full bg-[#f4f4f4] hover:bg-[#e0e0e0]">
              <i className="fas fa-question-circle text-[#525252]"></i>
            </button>
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

      {/* Recent Activity */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <button className="text-[#0f62fe] text-sm font-medium hover:underline">View All</button>
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
