
import React from 'react';
import { BarChart3, MapPin, Mountain } from 'lucide-react';
import { JobResult } from '../../types/api';

interface ResultsViewerProps {
  results: JobResult;
}

const ResultsViewer: React.FC<ResultsViewerProps> = ({ results }) => {
  return (
    <div className="space-y-8">
      {/* Quality Metrics */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <BarChart3 className="h-6 w-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">Quality Metrics</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(results.analysis_results.quality_metrics).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {typeof value === 'number' ? value.toFixed(2) : value}
              </div>
              <div className="text-gray-400 text-sm capitalize">
                {key.replace(/_/g, ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Surface Statistics */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Mountain className="h-6 w-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Surface Statistics</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(results.analysis_results.surface_statistics).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0">
              <span className="text-gray-300 capitalize">{key.replace(/_/g, ' ')}</span>
              <span className="text-white font-semibold">
                {typeof value === 'number' ? value.toFixed(3) : value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Terrain Assessment */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <MapPin className="h-6 w-6 text-green-400" />
          <h3 className="text-xl font-semibold text-white">Terrain Assessment</h3>
        </div>
        
        <div className="space-y-4">
          {Object.entries(results.analysis_results.terrain_assessment).map(([key, value]) => (
            <div key={key} className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2 capitalize">
                {key.replace(/_/g, ' ')}
              </h4>
              <p className="text-gray-300 text-sm">
                {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultsViewer;
