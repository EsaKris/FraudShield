import { StatCardProps } from "@/lib/types";

const StatCard = ({ icon, iconColor, bgColor, title, value, trend }: StatCardProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${bgColor} ${iconColor}`}>
          <i className={`${icon} text-xl`}></i>
        </div>
        <div className="ml-4">
          <p className="text-sm text-[#8d8d8d] font-medium">{title}</p>
          <h2 className="text-2xl font-bold">{value}</h2>
        </div>
      </div>
      <div className={`mt-2 text-xs ${trend.positive ? 'text-[#42be65]' : 'text-[#da1e28]'} font-medium flex items-center`}>
        <i className={`fas fa-arrow-${trend.positive ? 'up' : 'down'} mr-1`}></i> {trend.value}
      </div>
    </div>
  );
};

export default StatCard;
