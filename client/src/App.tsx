import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/Dashboard";
import PhotoRecognition from "@/pages/PhotoRecognition";
import FraudDetection from "@/pages/FraudDetection";
import PhishingDetection from "@/pages/PhishingDetection";
import Reports from "@/pages/Reports";
import SettingsPage from "@/pages/SettingsPage";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/Sidebar";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  const [location] = useLocation();
  const isLandingPage = location === "/landing" || location === "/";
  const isAuthPage = location === "/auth";

  // Render the landing page without sidebar
  if (isLandingPage) {
    return (
      <Switch>
        <Route path="/landing" component={LandingPage} />
        <Route path="/" component={LandingPage} />
      </Switch>
    );
  }

  // Render auth page without sidebar
  if (isAuthPage) {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
      </Switch>
    );
  }

  // For all other routes, render with sidebar and protection
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 overflow-auto bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <Switch>
            <Route path="/">
              <Redirect to="/dashboard" />
            </Route>
            <ProtectedRoute path="/dashboard" component={Dashboard} />
            <ProtectedRoute path="/photo-recognition" component={PhotoRecognition} />
            <ProtectedRoute path="/fraud-detection" component={FraudDetection} />
            <ProtectedRoute path="/phishing-detection" component={PhishingDetection} />
            <ProtectedRoute path="/reports" component={Reports} />
            <ProtectedRoute path="/settings" component={SettingsPage} />
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
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
