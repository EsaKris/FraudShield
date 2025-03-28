import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PhotoUpload from "@/components/photo/PhotoUpload";
import ResultsDisplay from "@/components/photo/ResultsDisplay";
import { PhotoRecognitionResult, ActivityLog } from "@/lib/types";

const PhotoRecognition = () => {
  const [result, setResult] = useState<PhotoRecognitionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: recentActivities } = useQuery<ActivityLog[]>({
    queryKey: ['/api/activities/photo']
  });

  const handleResultReceived = (photoResult: PhotoRecognitionResult) => {
    setResult(photoResult);
  };

  return (
    <>
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Photo Recognition</h1>
          <div className="flex items-center space-x-3">
            <button className="p-1.5 rounded-full bg-[#f4f4f4] hover:bg-[#e0e0e0]">
              <i className="fas fa-question-circle text-[#525252]"></i>
            </button>
          </div>
        </div>
        <p className="mt-2 text-[#525252]">Upload and analyze photos to identify individuals and extract information.</p>
      </header>

      <section id="photo-recognition" className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <PhotoUpload 
              onResultReceived={handleResultReceived} 
              setLoadingState={setLoading}
            />
          </div>
          
          <div className="lg:col-span-2">
            <ResultsDisplay 
              result={result} 
              loading={loading}
            />
          </div>
        </div>
      </section>

      {/* Recent Photo Activities */}
      {recentActivities && recentActivities.length > 0 && (
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Photo Verifications</h2>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden p-5">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="p-4 border border-gray-100 rounded-md">
                  <div className="flex items-start space-x-2">
                    <div className="p-1.5 rounded-full bg-blue-100 text-[#0f62fe]">
                      <i className="fas fa-camera"></i>
                    </div>
                    <div>
                      <div className="font-medium">{activity.details}</div>
                      <div className="text-sm text-[#8d8d8d]">{activity.timestamp}</div>
                      <div className="mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          activity.status === 'Successful' ? 'bg-green-100 text-[#42be65]' :
                          activity.status === 'Flagged' ? 'bg-red-100 text-[#da1e28]' :
                          'bg-yellow-100 text-[#f1c21b]'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default PhotoRecognition;
