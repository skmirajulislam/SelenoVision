
export interface Job {
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
