
import { useState } from 'react';
import { useLocation } from '@/hooks/use-location';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const NavLink = ({ href, text, isActive }: { href: string; text: string; isActive: boolean }) => (
  <a
    href={href}
    onClick={(e) => {
      e.preventDefault();
      window.history.pushState({}, "", href);
      const navEvent = new PopStateEvent('popstate');
      window.dispatchEvent(navEvent);
    }}
    className={`px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? 'bg-blue-700 text-white' : 'text-white hover:bg-blue-700'
    }`}
  >
    {text}
  </a>
);

const MobileNavLink = ({ href, text, isActive }: { href: string; text: string; isActive: boolean }) => (
  <a
    href={href}
    onClick={(e) => {
      e.preventDefault();
      window.history.pushState({}, "", href);
      const navEvent = new PopStateEvent('popstate');
      window.dispatchEvent(navEvent);
    }}
    className={`block px-3 py-2 rounded-md text-base font-medium ${
      isActive ? 'bg-blue-700 text-white' : 'text-white hover:bg-blue-700'
    }`}
  >
    {text}
  </a>
);

const Navbar = () => {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if on landing page
  const isLandingPage = location === "/" || location === "/landing";

  return (
    <nav className="bg-[#0f62fe] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <i className="fas fa-shield-alt mr-2 text-2xl"></i>
              <span className="font-bold text-xl">SecureCheck</span>
            </div>
            
            {/* Desktop navigation links - hidden on mobile */}
            {!isLandingPage && (
              <div className="hidden md:ml-6 md:flex md:space-x-4">
                <NavLink href="/dashboard" text="Dashboard" isActive={location === "/dashboard"} />
                <NavLink href="/photo-recognition" text="Identity" isActive={location === "/photo-recognition"} />
                <NavLink href="/fraud-detection" text="Fraud" isActive={location === "/fraud-detection"} />
                <NavLink href="/phishing-detection" text="Phishing" isActive={location === "/phishing-detection"} />
                <NavLink href="/reports" text="Analytics" isActive={location === "/reports"} />
                <NavLink href="/settings" text="Settings" isActive={location === "/settings"} />
              </div>
            )}
            
            {/* Landing page navigation - desktop */}
            {isLandingPage && (
              <div className="hidden md:ml-6 md:flex md:space-x-4">
                <NavLink href="#features" text="Features" isActive={false} />
                <NavLink href="#pricing" text="Pricing" isActive={false} />
                <NavLink href="#about" text="About" isActive={false} />
                <NavLink href="#contact" text="Contact" isActive={false} />
              </div>
            )}
          </div>
          
          {/* Right side buttons */}
          <div className="flex items-center">
            {isLandingPage ? (
              <div className="hidden md:flex items-center space-x-4">
                <NavLink href="/auth" text="Sign In" isActive={false} />
                <Button 
                  onClick={() => navigate('/auth?signup=true')}
                  className="bg-white text-blue-700 hover:bg-gray-100"
                >
                  Get Started
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center">
                <Button
                  variant="ghost"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
                  <LogOut className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md hover:bg-blue-700 focus:outline-none"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-blue-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isLandingPage ? (
              <>
                <MobileNavLink href="#features" text="Features" isActive={false} />
                <MobileNavLink href="#pricing" text="Pricing" isActive={false} />
                <MobileNavLink href="#about" text="About" isActive={false} />
                <MobileNavLink href="#contact" text="Contact" isActive={false} />
                <MobileNavLink href="/auth" text="Sign In" isActive={false} />
                <Button 
                  onClick={() => {
                    navigate('/auth?signup=true');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full mt-2 bg-white text-blue-700 hover:bg-gray-100"
                >
                  Get Started
                </Button>
              </>
            ) : (
              <>
                <MobileNavLink href="/dashboard" text="Dashboard" isActive={location === "/dashboard"} />
                <MobileNavLink href="/photo-recognition" text="Identity" isActive={location === "/photo-recognition"} />
                <MobileNavLink href="/fraud-detection" text="Fraud" isActive={location === "/fraud-detection"} />
                <MobileNavLink href="/phishing-detection" text="Phishing" isActive={location === "/phishing-detection"} />
                <MobileNavLink href="/reports" text="Analytics" isActive={location === "/reports"} />
                <MobileNavLink href="/settings" text="Settings" isActive={location === "/settings"} />
                <Button
                  variant="ghost"
                  onClick={() => {
                    logoutMutation.mutate();
                    setMobileMenuOpen(false);
                  }}
                  disabled={logoutMutation.isPending}
                  className="w-full mt-2"
                >
                  {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
                  <LogOut className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
