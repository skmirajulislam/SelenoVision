
import { useState, useCallback, useEffect, useRef } from 'react';
import { api, JobStatus } from '../services/api';

interface UseJobStatusReturn {
  status: JobStatus | null;
  loading: boolean;
  error: string | null;
  getJobStatus: (jobId: string) => Promise<JobStatus | null>;
  startPolling: (jobId: string, onUpdate?: (status: JobStatus) => void) => void;
  stopPolling: () => void;
}

export const useJobStatus = (): UseJobStatusReturn => {
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getJobStatus = useCallback(async (jobId: string): Promise<JobStatus | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.getJobStatus(jobId);
      
      if (result.success && result.data) {
        setStatus(result.data);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to get status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get status';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const startPolling = useCallback((jobId: string, onUpdate?: (status: JobStatus) => void) => {
    // Stop any existing polling
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const poll = async () => {
      try {
        const result = await api.getJobStatus(jobId);
        
        if (result.success && result.data) {
          setStatus(result.data);
          onUpdate?.(result.data);
          
          // Stop polling if job is completed or failed
          if (result.data.status === 'completed' || result.data.status === 'failed') {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    // Initial poll
    poll();
    
    // Set up polling interval (every 2 seconds)
    intervalRef.current = setInterval(poll, 2000);
  }, []);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    status,
    loading,
    error,
    getJobStatus,
    startPolling,
    stopPolling
  };
};
