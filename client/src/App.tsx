import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/Dashboard";
import PhotoRecognition from "@/pages/PhotoRecognition";
import FraudDetection from "@/pages/FraudDetection";
import PhishingDetection from "@/pages/PhishingDetection";
import Reports from "@/pages/Reports";
import LandingPage from "@/pages/LandingPage";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/Sidebar";

function Router() {
  const [location] = useLocation();
  const isLandingPage = location === "/";

  // Only render the app layout (with sidebar) for non-landing page routes
  if (isLandingPage) {
    return (
      <Switch>
        <Route path="/" component={LandingPage} />
      </Switch>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 overflow-auto bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/photo-recognition" component={PhotoRecognition} />
            <Route path="/fraud-detection" component={FraudDetection} />
            <Route path="/phishing-detection" component={PhishingDetection} />
            <Route path="/reports" component={Reports} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
