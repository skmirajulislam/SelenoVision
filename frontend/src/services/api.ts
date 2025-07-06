const API_BASE_URL = 'http://localhost:5000';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface JobStatus {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  created_at: string;
  updated_at: string;
  error_message?: string;
}

export interface JobResult {
  job_id: string;
  analysis_results: {
    quality_metrics: Record<string, any>;
    surface_statistics: Record<string, any>;
    terrain_assessment: Record<string, any>;
  };
  processing_info: {
    iterations: number;
    converged: boolean;
    processing_time: string;
  };
  output_files: {
    geotiff: string;
    obj_model: string;
    visualizations: string[];
    analysis: string[];
  };
}

export const api = {
  // Upload file for processing
  uploadFile: async (file: File): Promise<ApiResponse<{ job_id: string }>> => {
    try {
      const formData = new FormData();
      formData.append('image', file); // <-- use 'image' not 'file'

      const response = await fetch(`${API_BASE_URL}/api/upload/process`, { // <-- correct endpoint
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  },

  // Get job status
  getJobStatus: async (jobId: string): Promise<ApiResponse<JobStatus>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/status/${jobId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Status check error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get status'
      };
    }
  },

  // Get job results
  getJobResults: async (jobId: string): Promise<ApiResponse<JobResult>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/results/${jobId}/summary`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Results fetch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get results'
      };
    }
  },

  // Download ZIP file
  downloadZip: async (jobId: string): Promise<Blob | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/results/${jobId}/download`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Download error:', error);
      return null;
    }
  },

  // Download specific file
  downloadFile: async (jobId: string, filename: string): Promise<Blob | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/results/${jobId}/files/${filename}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('File download error:', error);
      return null;
    }
  },

  // Health check
  healthCheck: async (): Promise<ApiResponse<{ status: string }>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Health check error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed'
      };
    }
  }
};

