
import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Upload as UploadIcon, FileImage, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useFileUpload } from '../hooks/useFileUpload';
import FileUpload from '../components/upload/FileUpload';
import UploadProgress from '../components/upload/UploadProgress';

const Upload = () => {
  const navigate = useNavigate();
  const { uploadFile, isUploading, progress, error, jobId } = useFileUpload();

  const handleFileUpload = useCallback(async (file: File) => {
    const result = await uploadFile(file);
    if (result && result.job_id) {
      // Redirect to dashboard with the job ID
      navigate(`/dashboard?job=${result.job_id}`);
    }
  }, [uploadFile, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Moon className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">Luna</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-6">
              <UploadIcon className="h-5 w-5 text-purple-400" />
              <span className="text-purple-200">Lunar Surface Analysis</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Upload Lunar Image
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Upload your lunar surface image to generate high-resolution Digital Elevation Models using advanced photoclinometry
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-8">
            {!isUploading ? (
              <FileUpload onFileSelect={handleFileUpload} />
            ) : (
              <UploadProgress progress={progress} />
            )}
            
            {error && (
              <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-red-300 font-medium mb-1">Upload Failed</h4>
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Supported Formats */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FileImage className="h-6 w-6 text-purple-400" />
                <h3 className="text-xl font-semibold text-white">Supported Formats</h3>
              </div>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>PNG images (up to 50MB)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>JPEG images (up to 50MB)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>TIFF images (up to 50MB)</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Moon className="h-6 w-6 text-purple-400" />
                <h3 className="text-xl font-semibold text-white">Supported Missions</h3>
              </div>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Chandrayaan TMC/TMC-2/OHRC</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>NASA LRO</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>JAXA Selene</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upload;
