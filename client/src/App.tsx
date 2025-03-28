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
import ProfilePage from "@/pages/ProfilePage";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/layout/Navbar";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  const [location] = useLocation();
  const isLandingPage = location === "/landing" || location === "/";
  const isAuthPage = location === "/auth";

  // Render the landing page without navbar
  if (isLandingPage) {
    return (
      <Switch>
        <Route path="/landing" component={LandingPage} />
        <Route path="/" component={LandingPage} />
      </Switch>
    );
  }

  // Render auth page without navbar
  if (isAuthPage) {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
      </Switch>
    );
  }

  // For all other routes, render with navbar and protection
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <main className="flex-1 p-4 md:p-6 overflow-auto">
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
            <ProtectedRoute path="/profile" component={ProfilePage} />
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
