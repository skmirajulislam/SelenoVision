
import React from 'react';
import { Upload, CheckCircle } from 'lucide-react';

interface UploadProgressProps {
  progress: number;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ progress }) => {
  const isComplete = progress >= 100;

  return (
    <div className="text-center space-y-6">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto transition-all duration-300 ${
        isComplete 
          ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
          : 'bg-gradient-to-br from-purple-500 to-pink-500'
      }`}>
        {isComplete ? (
          <CheckCircle className="h-8 w-8 text-white" />
        ) : (
          <Upload className="h-8 w-8 text-white" />
        )}
      </div>

      <div>
        <h3 className="text-2xl font-semibold text-white mb-2">
          {isComplete ? 'Upload Complete!' : 'Uploading...'}
        </h3>
        <p className="text-gray-300 mb-6">
          {isComplete 
            ? 'Your image has been uploaded and queued for processing'
            : 'Please wait while we upload your lunar image'
          }
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              isComplete 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {isComplete && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 max-w-md mx-auto">
          <p className="text-green-200 text-sm">
            Redirecting to dashboard to monitor processing...
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadProgress;
