import { Link, useLocation } from "wouter";

const Sidebar = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <aside className="w-full md:w-64 bg-[#393939] text-white">
      <div className="p-4 flex flex-col h-full">
        <div className="mb-8">
          <h1 className="text-xl font-bold flex items-center">
            <i className="fas fa-shield-alt mr-2"></i>
            SecureCheck
          </h1>
        </div>
        
        <nav className="space-y-1 flex-grow">
          <Link href="/">
            <a className={`block py-2.5 px-4 rounded ${isActive('/') ? 'bg-[#0f62fe] text-white' : 'hover:bg-gray-700'} flex items-center`}>
              <i className="fas fa-tachometer-alt w-5"></i>
              <span className="ml-2">Dashboard</span>
            </a>
          </Link>
          <Link href="/photo-recognition">
            <a className={`block py-2.5 px-4 rounded ${isActive('/photo-recognition') ? 'bg-[#0f62fe] text-white' : 'hover:bg-gray-700'} flex items-center`}>
              <i className="fas fa-camera w-5"></i>
              <span className="ml-2">Identity Verification</span>
            </a>
          </Link>
          <Link href="/fraud-detection">
            <a className={`block py-2.5 px-4 rounded ${isActive('/fraud-detection') ? 'bg-[#0f62fe] text-white' : 'hover:bg-gray-700'} flex items-center`}>
              <i className="fas fa-exclamation-triangle w-5"></i>
              <span className="ml-2">Fraud Detection</span>
            </a>
          </Link>
          <Link href="/phishing-detection">
            <a className={`block py-2.5 px-4 rounded ${isActive('/phishing-detection') ? 'bg-[#0f62fe] text-white' : 'hover:bg-gray-700'} flex items-center`}>
              <i className="fas fa-envelope-open-text w-5"></i>
              <span className="ml-2">Phishing Detection</span>
            </a>
          </Link>
          <Link href="/reports">
            <a className={`block py-2.5 px-4 rounded ${isActive('/reports') ? 'bg-[#0f62fe] text-white' : 'hover:bg-gray-700'} flex items-center`}>
              <i className="fas fa-chart-line w-5"></i>
              <span className="ml-2">Analytics</span>
            </a>
          </Link>
          <a href="#" className="block py-2.5 px-4 rounded hover:bg-gray-700 flex items-center">
            <i className="fas fa-cog w-5"></i>
            <span className="ml-2">Settings</span>
          </a>
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
