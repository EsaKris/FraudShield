import { ActivityLog } from "@/lib/types";

interface ActivityTableProps {
  activities: ActivityLog[];
}

const ActivityTable = ({ activities }: ActivityTableProps) => {
  // Helper function to get icon and color based on activity type
  const getActivityTypeInfo = (activityType: string) => {
    switch (activityType) {
      case 'Photo Recognition':
        return { 
          icon: 'fas fa-camera', 
          bgColor: 'bg-blue-100', 
          textColor: 'text-[#0f62fe]' 
        };
      case 'Fraud Alert':
        return { 
          icon: 'fas fa-exclamation-triangle', 
          bgColor: 'bg-red-100', 
          textColor: 'text-[#da1e28]' 
        };
      case 'Suspicious Activity':
        return { 
          icon: 'fas fa-flag', 
          bgColor: 'bg-yellow-100', 
          textColor: 'text-[#f1c21b]' 
        };
      default:
        return { 
          icon: 'fas fa-info-circle', 
          bgColor: 'bg-gray-100', 
          textColor: 'text-gray-500' 
        };
    }
  };

  // Helper function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Successful':
        return 'bg-green-100 text-[#42be65]';
      case 'Flagged':
        return 'bg-red-100 text-[#da1e28]';
      case 'Under Review':
        return 'bg-yellow-100 text-[#f1c21b]';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Desktop view - Table (hidden on small screens) */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#8d8d8d] uppercase tracking-wider">
                  Timestamp
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#8d8d8d] uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#8d8d8d] uppercase tracking-wider">
                  Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#8d8d8d] uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#8d8d8d] uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#8d8d8d]">
                    No activities to display
                  </td>
                </tr>
              ) : (
                activities.map((activity) => {
                  const typeInfo = getActivityTypeInfo(activity.activityType);
                  const statusBadge = getStatusBadge(activity.status);
                  
                  return (
                    <tr key={activity.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#525252]">
                        {activity.timestamp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`p-1.5 rounded-full ${typeInfo.bgColor} ${typeInfo.textColor} mr-2`}>
                            <i className={`${typeInfo.icon} text-xs`}></i>
                          </div>
                          <span className="text-sm font-medium">{activity.activityType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#525252]">
                        <div className="max-w-md truncate">
                          {activity.details}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge}`}>
                          {activity.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#525252]">
                        <button className="text-[#0f62fe] hover:text-blue-700 font-medium">
                          {activity.status === 'Flagged' ? 'Investigate' : 
                           activity.status === 'Under Review' ? 'Review' : 'View Details'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile view - Card layout (visible only on small screens) */}
      <div className="md:hidden">
        {activities.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-[#8d8d8d]">
            No activities to display
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {activities.map((activity) => {
              const typeInfo = getActivityTypeInfo(activity.activityType);
              const statusBadge = getStatusBadge(activity.status);
              
              return (
                <div key={activity.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className={`p-1.5 rounded-full ${typeInfo.bgColor} ${typeInfo.textColor} mr-2`}>
                        <i className={`${typeInfo.icon} text-xs`}></i>
                      </div>
                      <span className="text-sm font-medium">{activity.activityType}</span>
                    </div>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge}`}>
                      {activity.status}
                    </span>
                  </div>
                  <p className="text-sm text-[#525252] mb-2 line-clamp-2">
                    {activity.details}
                  </p>
                  <div className="flex items-center justify-between text-xs text-[#8d8d8d]">
                    <span>{activity.timestamp}</span>
                    <button className="text-[#0f62fe] hover:text-blue-700 font-medium">
                      {activity.status === 'Flagged' ? 'Investigate' : 
                       activity.status === 'Under Review' ? 'Review' : 'View Details'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTable;
