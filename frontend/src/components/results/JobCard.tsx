
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, Eye, Download, RefreshCw } from 'lucide-react';
import { Job } from '../../types/api';
import { useJobStatus } from '../../hooks/useJobStatus';

interface JobCardProps {
  job: Job;
  onUpdate: (jobId: string, updates: Partial<Job>) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onUpdate }) => {
  const { startPolling, stopPolling } = useJobStatus();

  useEffect(() => {
    if (job.status === 'processing' || job.status === 'queued') {
      startPolling(job.job_id, (status) => {
        onUpdate(job.job_id, status);
      });
    }

    return () => {
      stopPolling();
    };
  }, [job.job_id, job.status, startPolling, stopPolling, onUpdate]);

  const getStatusIcon = () => {
    switch (job.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-yellow-400 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-blue-400" />;
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'processing':
        return 'text-yellow-400';
      default:
        return 'text-blue-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {getStatusIcon()}
            <span className={`font-semibold capitalize ${getStatusColor()}`}>
              {job.status}
            </span>
          </div>
          <p className="text-gray-300 text-sm font-mono mb-2">
            ID: {job.job_id}
          </p>
          <p className="text-gray-400 text-sm">
            {job.message || 'Processing lunar surface data...'}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {job.status === 'completed' && (
            <>
              <Link
                to={`/results/${job.job_id}`}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>View</span>
              </Link>
              <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {(job.status === 'processing' || job.status === 'queued') && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress</span>
            <span>{job.progress}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
              style={{ width: `${job.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {job.status === 'failed' && job.error_message && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-200 text-sm">{job.error_message}</p>
        </div>
      )}

      {/* Timestamps */}
      <div className="flex justify-between text-xs text-gray-500 border-t border-white/10 pt-4">
        <span>Created: {formatDate(job.created_at)}</span>
        <span>Updated: {formatDate(job.updated_at)}</span>
      </div>
    </div>
  );
};

export default JobCard;
