import { PhotoRecognitionResult } from "@/lib/types";

interface ResultsDisplayProps {
  result: PhotoRecognitionResult | null;
  loading: boolean;
}

const ResultsDisplay = ({ result, loading }: ResultsDisplayProps) => {
  const getRiskClassName = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-[#42be65]';
      case 'medium':
        return 'bg-yellow-100 text-[#f1c21b]';
      case 'high':
        return 'bg-red-100 text-[#da1e28]';
      default:
        return 'bg-green-100 text-[#42be65]';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Identity Verification Results</h3>
      </div>
      <div className="p-5">
        {/* Empty State */}
        {!loading && !result && (
          <div className="text-center py-12">
            <div className="mx-auto flex justify-center text-[#8d8d8d] mb-4">
              <i className="fas fa-camera text-5xl"></i>
            </div>
            <h3 className="text-lg font-medium text-[#525252] mb-2">No photo processed yet</h3>
            <p className="text-[#8d8d8d] text-sm max-w-md mx-auto">Upload a photo using the form to see identity verification results.</p>
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="mx-auto flex justify-center text-[#0f62fe] mb-4">
              <i className="fas fa-spinner fa-spin text-4xl"></i>
            </div>
            <h3 className="text-lg font-medium text-[#525252] mb-2">Processing Image</h3>
            <p className="text-[#8d8d8d] text-sm max-w-md mx-auto">This may take a few moments. We're analyzing the image and retrieving information.</p>
          </div>
        )}
        
        {/* Results State */}
        {!loading && result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              {result.imageUrl ? (
                <div className="bg-[#f4f4f4] rounded-lg h-48 flex items-center justify-center overflow-hidden">
                  <img 
                    src={result.imageUrl} 
                    alt="Identity photo" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ) : (
                <div className="bg-[#f4f4f4] rounded-lg h-48 flex items-center justify-center">
                  <i className="fas fa-user text-5xl text-[#8d8d8d]"></i>
                </div>
              )}
              
              <div className="mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="px-2 py-1 rounded-full bg-[#42be65] bg-opacity-20 text-[#42be65] text-xs font-medium">
                    Match Found
                  </div>
                  <div className="px-2 py-1 rounded-full bg-blue-100 text-[#0f62fe] text-xs font-medium">
                    {result.confidence}% Confidence
                  </div>
                </div>
                <div className="text-sm text-[#8d8d8d]">
                  Processed at: <span>{result.timestamp || new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-[#393939]">{result.name}</h4>
                  <p className="text-[#8d8d8d]">{result.location}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-[#525252] mb-1">Personal Details</div>
                    <table className="w-full text-sm">
                      <tbody>
                        <tr>
                          <td className="py-1 text-[#8d8d8d]">Age:</td>
                          <td className="py-1 font-medium">{result.age}</td>
                        </tr>
                        <tr>
                          <td className="py-1 text-[#8d8d8d]">Gender:</td>
                          <td className="py-1 font-medium">{result.gender}</td>
                        </tr>
                        <tr>
                          <td className="py-1 text-[#8d8d8d]">Nationality:</td>
                          <td className="py-1 font-medium">{result.nationality}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-[#525252] mb-1">Social Profiles</div>
                    <div className="space-y-2">
                      {result.socials.linkedin && (
                        <a href={`https://${result.socials.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm py-1 text-[#525252] hover:text-[#0f62fe]">
                          <i className="fab fa-linkedin text-[#8d8d8d] w-6"></i>
                          <span>{result.socials.linkedin}</span>
                        </a>
                      )}
                      {result.socials.twitter && (
                        <a href={`https://twitter.com/${result.socials.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm py-1 text-[#525252] hover:text-[#0f62fe]">
                          <i className="fab fa-twitter text-[#8d8d8d] w-6"></i>
                          <span>{result.socials.twitter}</span>
                        </a>
                      )}
                      {result.socials.facebook && (
                        <a href={`https://${result.socials.facebook}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm py-1 text-[#525252] hover:text-[#0f62fe]">
                          <i className="fab fa-facebook text-[#8d8d8d] w-6"></i>
                          <span>{result.socials.facebook}</span>
                        </a>
                      )}
                      {!result.socials.linkedin && !result.socials.twitter && !result.socials.facebook && (
                        <div className="text-sm py-1 text-[#8d8d8d]">No social profiles found</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-[#525252] mb-1">Fraud Risk Assessment</div>
                  <div className={`${getRiskClassName(result.fraudRisk)} p-3 rounded-md flex items-center text-sm`}>
                    <i className="fas fa-shield-alt mr-2"></i>
                    <span>
                      {result.fraudRisk === 'Low' && 'Low Risk - No suspicious patterns detected'}
                      {result.fraudRisk === 'Medium' && 'Medium Risk - Some suspicious patterns detected'}
                      {result.fraudRisk === 'High' && 'High Risk - Multiple suspicious patterns detected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;
