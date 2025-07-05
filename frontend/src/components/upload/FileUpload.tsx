
import React, { useCallback, useState } from 'react';
import { Upload, FileImage, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  }, []);

  const handleFile = (file: File) => {
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    onFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
          dragActive
            ? 'border-purple-400 bg-purple-500/10'
            : 'border-white/20 hover:border-purple-400/50 hover:bg-white/5'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept="image/png,image/jpeg,image/tiff"
          onChange={handleInputChange}
        />
        
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
            <Upload className="h-8 w-8 text-white" />
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              Drop your lunar image here
            </h3>
            <p className="text-gray-300 mb-4">
              or <label htmlFor="file-upload" className="text-purple-400 cursor-pointer hover:text-purple-300">browse to choose a file</label>
            </p>
            <p className="text-sm text-gray-400">
              Supports PNG, JPEG, TIFF up to 50MB
            </p>
          </div>
        </div>
      </div>

      {preview && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileImage className="h-6 w-6 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">Preview</h3>
          </div>
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-w-md mx-auto rounded-xl border border-white/20"
              style={{ maxHeight: '300px', objectFit: 'contain' }}
            />
          </div>
        </div>
      )}

      {/* File Requirements */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-blue-300 font-medium mb-2">File Requirements</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Maximum file size: 50MB</li>
              <li>• Supported formats: PNG, JPEG, TIFF</li>
              <li>• Compatible with Chandrayaan, LRO, and Selene mission data</li>
              <li>• Higher resolution images produce better results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
