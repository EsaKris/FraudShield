import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { queryClient } from "@/lib/queryClient";
import { PhotoRecognitionResult } from "@/lib/types";

interface PhotoUploadProps {
  onResultReceived: (result: PhotoRecognitionResult) => void;
  setLoadingState: (loading: boolean) => void;
}

const PhotoUpload = ({ onResultReceived, setLoadingState }: PhotoUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [purpose, setPurpose] = useState("Identity Verification");
  const [consent, setConsent] = useState(false);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/photo-recognition", formData);
      const data = await response.json();
      return data as PhotoRecognitionResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      onResultReceived(data);
      toast({
        title: "Success",
        description: "Photo processed successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process photo",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setLoadingState(false);
    }
  });

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/')) {
        setFile(droppedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG, WebP)",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }
    
    if (!consent) {
      toast({
        title: "Consent required",
        description: "Please provide consent to process the image",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('purpose', purpose);
    
    setLoadingState(true);
    uploadMutation.mutate(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Upload Photo for Identity Verification</h3>
      </div>
      <div className="p-5">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#525252] mb-2">Upload Image</label>
            <div 
              className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer ${file ? 'bg-blue-50 border-blue-300' : ''}`}
              onClick={() => document.getElementById('photo-upload')?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="space-y-2">
                <div className="mx-auto flex justify-center">
                  {file ? (
                    <i className="fas fa-check-circle text-4xl text-[#0f62fe]"></i>
                  ) : (
                    <i className="fas fa-cloud-upload-alt text-4xl text-[#8d8d8d]"></i>
                  )}
                </div>
                <div className="text-sm font-medium text-[#525252]">
                  {file ? (
                    <span>File selected: {file.name}</span>
                  ) : (
                    <>
                      <span>Drag and drop or</span>
                      <span className="text-[#0f62fe]"> browse files</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-[#8d8d8d]">Supported formats: JPEG, PNG, WebP</p>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                id="photo-upload" 
                onChange={handleFileChange}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#525252] mb-2">Verification Purpose</label>
            <select 
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0f62fe] focus:border-[#0f62fe]"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            >
              <option>Identity Verification</option>
              <option>Account Registration</option>
              <option>Background Check</option>
              <option>Security Clearance</option>
            </select>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <Switch 
                id="consent" 
                checked={consent}
                onCheckedChange={setConsent}
              />
              <Label htmlFor="consent" className="text-sm text-[#525252]">
                I consent to the processing of this data in accordance with privacy policy
              </Label>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="px-4 py-2 bg-[#0f62fe] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0f62fe]"
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <span className="flex items-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i> Processing...
                </span>
              ) : (
                "Process Photo"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhotoUpload;
