import { useState } from 'react';
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Menu, X, User, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              <NavLink href="/dashboard" text="Dashboard" isActive={location === "/dashboard"} />
              <NavLink href="/photo-recognition" text="Identity" isActive={location === "/photo-recognition"} />
              <NavLink href="/fraud-detection" text="Fraud" isActive={location === "/fraud-detection"} />
              <NavLink href="/phishing-detection" text="Phishing" isActive={location === "/phishing-detection"} />
              <NavLink href="/reports" text="Analytics" isActive={location === "/reports"} />
              <NavLink href="/settings" text="Settings" isActive={location === "/settings"} />
            </div>
          </div>
          
          {/* User profile and logout section */}
          <div className="flex items-center">
            {/* User profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center cursor-pointer rounded-full px-3 py-1 hover:bg-blue-700">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.username} />
                    <AvatarFallback className="bg-blue-800">
                      {user?.firstName?.charAt(0) || user?.username?.charAt(0) || <User size={16} />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-block text-sm font-medium mr-1">
                    {user?.firstName ? `${user.firstName}` : user?.username || "User"}
                  </span>
                  <ChevronDown size={16} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <i className="fas fa-cog mr-2 h-4 w-4"></i>
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Sign out button - always visible */}
            <Button 
              variant="outline" 
              className="ml-3 text-white border-white hover:bg-blue-700"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
              <LogOut className="ml-2 h-4 w-4" />
            </Button>
            
            {/* Mobile menu button - only visible on mobile */}
            <div className="md:hidden ml-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="bg-blue-700 p-2 rounded-md focus:outline-none"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu - only visible when opened and on mobile screens */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-blue-700">
            <MobileNavLink href="/dashboard" text="Dashboard" isActive={location === "/dashboard"} />
            <MobileNavLink href="/photo-recognition" text="Identity Verification" isActive={location === "/photo-recognition"} />
            <MobileNavLink href="/fraud-detection" text="Fraud Detection" isActive={location === "/fraud-detection"} />
            <MobileNavLink href="/phishing-detection" text="Phishing Detection" isActive={location === "/phishing-detection"} />
            <MobileNavLink href="/reports" text="Analytics" isActive={location === "/reports"} />
            <MobileNavLink href="/settings" text="Settings" isActive={location === "/settings"} />
            <MobileNavLink href="/profile" text="Profile" isActive={location === "/profile"} />
          </div>
        </div>
      )}
    </nav>
  );
};

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

export default Navbar;