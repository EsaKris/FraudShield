import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Check, Cloud, CloudOff, Loader2, Save } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Module settings
  const [settings, setSettings] = useState({
    enablePhotoRecognition: true,
    enableFraudDetection: true,
    enablePhishingDetection: true,
    notificationsEnabled: true,
    darkMode: false,
    autoLogout: false,
    autoLogoutTime: "30"
  });

  // Model settings
  const [modelSettings, setModelSettings] = useState({
    useHighAccuracyModel: false,
    preloadModels: true
  });
  
  // Model status
  const [modelStatus, setModelStatus] = useState({
    isDownloaded: false,
    status: 'not_checked'
  });

  const handleToggle = (setting: string) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting as keyof typeof settings]
    });
  };
  
  // Load model settings and status from server and local storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load from local storage first for immediate UI rendering
        const savedModelSettings = localStorage.getItem('modelSettings');
        if (savedModelSettings) {
          setModelSettings(JSON.parse(savedModelSettings));
        }
        
        const savedSecuritySettings = localStorage.getItem('securitySettings');
        if (savedSecuritySettings) {
          setSettings(JSON.parse(savedSecuritySettings));
        }
        
        // Then check model status from the server
        const response = await fetch('/api/face-api-models');
        if (response.ok) {
          const data = await response.json();
          console.log("Model status from server:", data);
          
          // Update model status state
          setModelStatus({
            isDownloaded: data.status === 'complete',
            status: data.status
          });
          
          if (data.status === 'complete') {
            // Models are already downloaded
            localStorage.setItem('modelsDownloaded', 'true');
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    
    loadSettings();
  }, []);
  
  // Function to download Face-API.js models
  const downloadModels = async () => {
    toast({
      title: "Downloading Models...",
      description: "Please wait while we download the face recognition models.",
    });
    
    try {
      // Call API to download face-api.js models
      const response = await fetch('/api/face-api-models/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download models: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update model status
      setModelStatus({
        isDownloaded: true,
        status: 'complete'
      });
      
      toast({
        title: "Models Downloaded",
        description: "Face recognition models have been successfully downloaded and are ready to use.",
      });
      
      return true;
    } catch (error) {
      console.error("Error downloading models:", error);
      toast({
        title: "Download Failed",
        description: "There was a problem downloading the face recognition models. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const saveSettings = async () => {
    // Check if photo recognition is enabled and models need to be downloaded
    const needsDownload = settings.enablePhotoRecognition && 
                         modelSettings.preloadModels && 
                         !localStorage.getItem('modelsDownloaded');
    
    if (needsDownload) {
      const confirmDownload = window.confirm(
        "You've enabled Photo Recognition with model preloading.\n\n" +
        "Would you like to download the face recognition models now?"
      );
      
      if (confirmDownload) {
        await downloadModels();
        localStorage.setItem('modelsDownloaded', 'true');
      }
    }
    
    setSaving(true);
    
    try {
      // Save model settings to local storage for persistence
      localStorage.setItem('modelSettings', JSON.stringify(modelSettings));
      localStorage.setItem('securitySettings', JSON.stringify(settings));
      
      console.log("Saving settings:", settings);
      console.log("Saving model settings:", modelSettings);
      
      // Send model settings to the server API
      const response = await fetch('/api/face-api-models/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          useHighAccuracyModel: modelSettings.useHighAccuracyModel,
          preloadModels: modelSettings.preloadModels
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Settings saved to server:", data);
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
      
      setSaving(false);
      setSaved(true);
      
      setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your preferences.",
        variant: "destructive"
      });
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 bg-gradient-to-b from-slate-950 to-slate-900 text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Settings</h1>
        <Button 
          onClick={saveSettings} 
          disabled={saving || saved}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column - User and Account */}
        <div className="md:col-span-4">
          <Card className="bg-gray-800 border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">User Information</CardTitle>
              <CardDescription className="text-gray-400">Manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={user?.username || ""} disabled />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" value="Administrator" disabled />
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6 bg-gray-800 border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">AI Model Settings</CardTitle>
              <CardDescription className="text-gray-400">Configure face-api.js model preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">High Accuracy Model</h4>
                    <p className="text-sm text-gray-400">Uses more precise but slower models for detection</p>
                  </div>
                  <Switch 
                    checked={modelSettings.useHighAccuracyModel} 
                    onCheckedChange={() => setModelSettings({
                      ...modelSettings,
                      useHighAccuracyModel: !modelSettings.useHighAccuracyModel
                    })} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Preload Models</h4>
                    <p className="text-sm text-gray-400">Download models on startup for faster analysis</p>
                  </div>
                  <Switch 
                    checked={modelSettings.preloadModels} 
                    onCheckedChange={() => setModelSettings({
                      ...modelSettings,
                      preloadModels: !modelSettings.preloadModels
                    })} 
                  />
                </div>
                
                <div className="mt-2">
                  {/* Model Status Indicator */}
                  <div className="mb-3 p-2 rounded-md flex items-center justify-between bg-gray-900 border border-gray-700">
                    <div className="flex items-center">
                      {modelStatus.isDownloaded ? (
                        <Cloud className="h-4 w-4 text-blue-500 mr-2" />
                      ) : (
                        <CloudOff className="h-4 w-4 text-purple-500 mr-2" />
                      )}
                      <span className="text-sm font-medium text-white">
                        Models: {modelStatus.isDownloaded ? 'Downloaded' : 'Not Downloaded'}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      modelStatus.status === 'complete' 
                        ? 'bg-blue-900/50 text-blue-300' 
                        : modelStatus.status === 'downloading' 
                          ? 'bg-purple-900/50 text-purple-300'
                          : 'bg-gray-700 text-gray-300'
                    }`}>
                      {modelStatus.status === 'complete' 
                        ? 'Ready' 
                        : modelStatus.status === 'downloading' 
                          ? 'Downloading...'
                          : 'Not Available'}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={modelStatus.status === 'downloading'}
                    onClick={async () => {
                      // Update status to downloading
                      setModelStatus(prev => ({ ...prev, status: 'downloading' }));
                      
                      const success = await downloadModels();
                      if (success) {
                        localStorage.setItem('modelsDownloaded', 'true');
                      } else {
                        // Reset status if download failed
                        setModelStatus(prev => ({ ...prev, status: 'not_downloaded' }));
                      }
                    }}
                  >
                    {modelStatus.status === 'downloading' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Downloading...
                      </>
                    ) : modelStatus.isDownloaded ? (
                      'Update Models'
                    ) : (
                      'Download Models Now'
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Using face-api.js (open source) - No API key required
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Modules and Preferences */}
        <div className="md:col-span-8">
          <Card className="bg-gray-800 border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Security Module Settings</CardTitle>
              <CardDescription className="text-gray-400">Enable or disable specific security features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Photo Recognition</h4>
                    <p className="text-sm text-gray-400">Identity verification through images</p>
                  </div>
                  <Switch 
                    checked={settings.enablePhotoRecognition} 
                    onCheckedChange={() => handleToggle("enablePhotoRecognition")} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Fraud Detection</h4>
                    <p className="text-sm text-gray-400">Detect suspicious activities and transactions</p>
                  </div>
                  <Switch 
                    checked={settings.enableFraudDetection} 
                    onCheckedChange={() => handleToggle("enableFraudDetection")} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Phishing Detection</h4>
                    <p className="text-sm text-gray-400">Analyze emails for phishing attempts</p>
                  </div>
                  <Switch 
                    checked={settings.enablePhishingDetection} 
                    onCheckedChange={() => handleToggle("enablePhishingDetection")} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6 bg-gray-800 border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Application Preferences</CardTitle>
              <CardDescription className="text-gray-400">Customize your SecureCheck experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Notifications</h4>
                    <p className="text-sm text-gray-400">Enable alerts for security events</p>
                  </div>
                  <Switch 
                    checked={settings.notificationsEnabled} 
                    onCheckedChange={() => handleToggle("notificationsEnabled")} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Dark Mode</h4>
                    <p className="text-sm text-gray-400">Switch between light and dark themes</p>
                  </div>
                  <Switch 
                    checked={settings.darkMode} 
                    onCheckedChange={() => handleToggle("darkMode")} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Auto Logout</h4>
                    <p className="text-sm text-gray-400">Automatically sign out after inactivity</p>
                  </div>
                  <Switch 
                    checked={settings.autoLogout} 
                    onCheckedChange={() => handleToggle("autoLogout")} 
                  />
                </div>
                
                {settings.autoLogout && (
                  <div className="pl-7 mt-2">
                    <div className="flex items-center gap-3">
                      <Label htmlFor="logout-time" className="flex-shrink-0 text-white">Logout after</Label>
                      <Input 
                        id="logout-time" 
                        type="number" 
                        className="w-20 bg-gray-700 border-gray-600 text-white" 
                        value={settings.autoLogoutTime}
                        onChange={(e) => setSettings({...settings, autoLogoutTime: e.target.value})}
                      />
                      <span className="text-gray-400">minutes of inactivity</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}