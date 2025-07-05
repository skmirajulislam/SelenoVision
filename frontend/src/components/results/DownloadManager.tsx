
import React from 'react';
import { Download, FileText, Image, Archive } from 'lucide-react';
import { JobResult } from '../../types/api';
import { api } from '../../services/api';

interface DownloadManagerProps {
  jobId: string;
  results: JobResult;
}

const DownloadManager: React.FC<DownloadManagerProps> = ({ jobId, results }) => {
  const handleDownload = async (filename?: string) => {
    try {
      let blob: Blob | null;
      let downloadFilename: string;

      if (filename) {
        blob = await api.downloadFile(jobId, filename);
        downloadFilename = filename;
      } else {
        blob = await api.downloadZip(jobId);
        downloadFilename = `lunar_analysis_${jobId}.zip`;
      }

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadFilename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.tif') || filename.endsWith('.tiff')) {
      return <Image className="h-5 w-5 text-blue-400" />;
    } else if (filename.endsWith('.obj')) {
      return <Archive className="h-5 w-5 text-purple-400" />;
    } else if (filename.endsWith('.png') || filename.endsWith('.jpg')) {
      return <Image className="h-5 w-5 text-green-400" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const allFiles = [
    ...Object.values(results.output_files).flat()
  ].filter(Boolean);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Download className="h-6 w-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">Download Results</h3>
        </div>
        
        <button
          onClick={() => handleDownload()}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Archive className="h-4 w-4" />
          <span>Download All (ZIP)</span>
        </button>
      </div>

      {/* File Categories */}
      <div className="space-y-6">
        {/* GeoTIFF DEM */}
        {results.output_files.geotiff && (
          <div>
            <h4 className="text-white font-medium mb-3">Digital Elevation Model</h4>
            <div className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getFileIcon(results.output_files.geotiff)}
                <div>
                  <div className="text-white font-medium">{results.output_files.geotiff}</div>
                  <div className="text-gray-400 text-sm">GeoTIFF format DEM</div>
                </div>
              </div>
              <button
                onClick={() => handleDownload(results.output_files.geotiff)}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        )}

        {/* 3D Model */}
        {results.output_files.obj_model && (
          <div>
            <h4 className="text-white font-medium mb-3">3D Surface Model</h4>
            <div className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getFileIcon(results.output_files.obj_model)}
                <div>
                  <div className="text-white font-medium">{results.output_files.obj_model}</div>
                  <div className="text-gray-400 text-sm">OBJ 3D model</div>
                </div>
              </div>
              <button
                onClick={() => handleDownload(results.output_files.obj_model)}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        )}

        {/* Visualizations */}
        {results.output_files.visualizations?.length > 0 && (
          <div>
            <h4 className="text-white font-medium mb-3">Visualizations</h4>
            <div className="space-y-2">
              {results.output_files.visualizations.map((filename, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(filename)}
                    <div>
                      <div className="text-white font-medium">{filename}</div>
                      <div className="text-gray-400 text-sm">Visualization image</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(filename)}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis Reports */}
        {results.output_files.analysis?.length > 0 && (
          <div>
            <h4 className="text-white font-medium mb-3">Analysis Reports</h4>
            <div className="space-y-2">
              {results.output_files.analysis.map((filename, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(filename)}
                    <div>
                      <div className="text-white font-medium">{filename}</div>
                      <div className="text-gray-400 text-sm">Analysis report</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(filename)}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadManager;
