import { useLocation } from "wouter";

const Sidebar = () => {
  const [location, navigate] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const NavItem = ({ href, icon, text }: { href: string; icon: string; text: string }) => {
    return (
      <div 
        className={`block py-2.5 px-4 rounded cursor-pointer ${isActive(href) ? 'bg-[#0f62fe] text-white' : 'hover:bg-gray-700'} flex items-center`}
        onClick={() => navigate(href)}
      >
        <i className={`fas ${icon} w-5`}></i>
        <span className="ml-2">{text}</span>
      </div>
    );
  };

  return (
    <aside className="w-full md:w-64 bg-[#393939] text-white">
      <div className="p-4 flex flex-col h-full">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center">
            <i className="fas fa-shield-alt mr-2"></i>
            SecureCheck
          </h1>
          <div 
            className="cursor-pointer rounded-full p-1 hover:bg-gray-700"
            onClick={() => navigate("/")}
            title="Go to home page"
          >
            <i className="fas fa-home"></i>
          </div>
        </div>
        
        <nav className="space-y-1 flex-grow">
          <NavItem href="/dashboard" icon="fa-tachometer-alt" text="Dashboard" />
          <NavItem href="/photo-recognition" icon="fa-camera" text="Identity Verification" />
          <NavItem href="/fraud-detection" icon="fa-exclamation-triangle" text="Fraud Detection" />
          <NavItem href="/phishing-detection" icon="fa-envelope-open-text" text="Phishing Detection" />
          <NavItem href="/reports" icon="fa-chart-line" text="Analytics" />
          <div className="block py-2.5 px-4 rounded hover:bg-gray-700 flex items-center cursor-pointer">
            <i className="fas fa-cog w-5"></i>
            <span className="ml-2">Settings</span>
          </div>
        </nav>
        
        <div className="mt-auto">
          <div className="py-2.5 px-4">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-[#42be65] mr-2"></div>
              <span className="text-sm">System Online</span>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-4 mt-2">
            <div className="flex items-center p-2">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <i className="fas fa-user text-sm"></i>
              </div>
              <div className="ml-2">
                <div className="text-sm font-medium">Admin User</div>
                <div className="text-xs text-gray-400">Administrator</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
