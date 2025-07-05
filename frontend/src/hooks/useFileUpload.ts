
import { useState, useCallback } from 'react';
import { api } from '../services/api';

interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<{ job_id: string } | null>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  jobId: string | null;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setJobId(null);

    // Validate file
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/tiff'];

    if (file.size > maxSize) {
      setError('File size must be less than 50MB');
      setIsUploading(false);
      return null;
    }

    if (!allowedTypes.includes(file.type)) {
      setError('File must be PNG, JPEG, or TIFF format');
      setIsUploading(false);
      return null;
    }

    try {
      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await api.uploadFile(file);
      
      clearInterval(progressInterval);
      setProgress(100);

      if (result.success && result.data) {
        setJobId(result.data.job_id);
        return result.data;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    uploadFile,
    isUploading,
    progress,
    error,
    jobId
  };
};
