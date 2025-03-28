import { useQuery } from "@tanstack/react-query";
import FraudRules from "@/components/fraud/FraudRules";
import FraudStats from "@/components/fraud/FraudStats";
import { FraudAlert } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FraudDetection = () => {
  const { data: fraudAlerts, isLoading } = useQuery<FraudAlert[]>({
    queryKey: ['/api/fraud/alerts']
  });

  return (
    <>
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Fraud Detection</h1>
          <div className="flex items-center space-x-3">
            <button className="p-1.5 rounded-full bg-[#f4f4f4] hover:bg-[#e0e0e0]">
              <i className="fas fa-question-circle text-[#525252]"></i>
            </button>
          </div>
        </div>
        <p className="mt-2 text-[#525252]">Monitor and manage potential fraudulent activities in your system.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <div className="md:col-span-3 lg:col-span-2">
          <FraudRules />
        </div>
        
        <div className="md:col-span-3 lg:col-span-4">
          {isLoading ? (
            <div className="bg-white rounded-lg shadow p-6 animate-pulse h-[400px]"></div>
          ) : (
            <FraudStats fraudAlerts={fraudAlerts || []} />
          )}
        </div>
      </div>

      {/* Recent Fraud Alerts */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Fraud Alerts</CardTitle>
              <button className="text-[#0f62fe] text-sm font-medium hover:underline">View All</button>
            </div>
            <CardDescription>Recent suspicious activities detected by the system</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-100 h-20 rounded-md"></div>
                ))}
              </div>
            ) : fraudAlerts && fraudAlerts.length > 0 ? (
              <div className="space-y-4">
                {fraudAlerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="p-4 border border-gray-100 rounded-md">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-full mr-3 ${
                        alert.severity === 'High' ? 'bg-red-100 text-[#da1e28]' :
                        alert.severity === 'Medium' ? 'bg-yellow-100 text-[#f1c21b]' :
                        'bg-green-100 text-[#42be65]'
                      }`}>
                        <i className="fas fa-exclamation-triangle"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{alert.alertType}</h4>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            alert.status === 'Flagged' ? 'bg-red-100 text-[#da1e28]' :
                            alert.status === 'Under Review' ? 'bg-yellow-100 text-[#f1c21b]' :
                            'bg-green-100 text-[#42be65]'
                          }`}>
                            {alert.status}
                          </span>
                        </div>
                        <p className="text-sm text-[#525252] mt-1">{alert.details}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-[#8d8d8d]">{alert.timestamp}</span>
                          <button className="text-[#0f62fe] text-sm hover:underline">
                            {alert.status === 'Flagged' ? 'Investigate' : 'View Details'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-[#8d8d8d]">
                <i className="fas fa-shield-alt text-4xl mb-3"></i>
                <p>No fraud alerts detected</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default FraudDetection;
