import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, Save, Upload, Camera, User } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("personal");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    avatarUrl: user?.avatarUrl || "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Form processing states
  const [saved, setSaved] = useState(false);
  
  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileForm) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      
      // Invalidate the user query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "There was a problem updating your profile.",
        variant: "destructive",
      });
    },
  });

  // Password update mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: Omit<typeof passwordForm, "confirmPassword">) => {
      const res = await apiRequest("POST", "/api/user/change-password", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      
      // Reset password form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Password change failed",
        description: error.message || "There was a problem changing your password.",
        variant: "destructive",
      });
    },
  });

  // Avatar upload mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await apiRequest("POST", "/api/user/avatar", formData);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
      
      // Update the form with the new avatar URL
      setProfileForm(prev => ({
        ...prev,
        avatarUrl: data.avatarUrl
      }));
      
      // Invalidate the user query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message || "There was a problem uploading your avatar.",
        variant: "destructive",
      });
    },
  });
  
  // Handle file selection for avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Avatar image must be less than 2MB",
          variant: "destructive",
        });
        return;
      }
      
      uploadAvatarMutation.mutate(file);
    }
  };
  
  // Handle click on avatar to trigger file input
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  
  // Handle profile update
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  // Handle password update
  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Your new password and confirmation don't match.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate password length
    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Your new password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    // Submit password change
    updatePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
  };

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileUpdate}>
              <CardContent className="space-y-4">
                {/* Avatar section */}
                <div className="flex flex-col items-center mb-6">
                  <div 
                    className="relative cursor-pointer group" 
                    onClick={handleAvatarClick}
                  >
                    <Avatar className="h-24 w-24 border-2 border-gray-200">
                      <AvatarImage src={profileForm.avatarUrl || undefined} alt={profileForm.username} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {profileForm.firstName?.charAt(0) || profileForm.username?.charAt(0) || <User />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleAvatarChange}
                  />
                  <p className="text-sm text-gray-500 mt-2">Click to change profile picture</p>
                  {uploadAvatarMutation.isPending && (
                    <div className="mt-2 flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm">Uploading...</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      name="username"
                      value={profileForm.username}
                      onChange={handleProfileChange}
                      disabled
                    />
                    <p className="text-xs text-gray-500">Username cannot be changed</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      name="firstName"
                      value={profileForm.firstName}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      name="lastName"
                      value={profileForm.lastName}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-end gap-3">
                <Button 
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={updateProfileMutation.isPending || saved}
                >
                  {updateProfileMutation.isPending ? (
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
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your account password to maintain security.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordUpdate}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword" 
                    name="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your current password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your new password"
                  />
                  <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm your new password"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-end gap-3">
                <Button 
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={updatePasswordMutation.isPending || saved}
                >
                  {updatePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : saved ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Updated!
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}