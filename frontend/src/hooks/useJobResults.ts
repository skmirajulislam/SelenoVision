
import { useState, useCallback } from 'react';
import { api, JobResult } from '../services/api';

interface UseJobResultsReturn {
  results: JobResult | null;
  loading: boolean;
  error: string | null;
  fetchResults: (jobId: string) => Promise<void>;
}

export const useJobResults = (): UseJobResultsReturn => {
  const [results, setResults] = useState<JobResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async (jobId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.getJobResults(jobId);
      
      if (result.success && result.data) {
        setResults(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch results');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    fetchResults
  };
};
