import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";

export default function LandingPage() {
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900/50 backdrop-blur-sm fixed w-full z-50 border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="fas fa-shield-alt text-xl"></i>
              <span className="text-xl font-bold">SecureCheck</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
              </Button>
            </div>
          </div>

          {/* Mobile Menu Panel */}
          {mobileMenuOpen && (
            <div className="md:hidden pt-4 pb-3 border-t border-gray-700 mt-3">
              <Button 
                variant="ghost"
                className="w-full text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Secure Your Digital Identity
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Advanced AI-powered security suite for fraud prevention, identity verification, and phishing detection.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/auth")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Get Started
          </Button>
        </motion.div>
      </section>
    </div>
  );
}