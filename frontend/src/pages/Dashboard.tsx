import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Moon,
  ArrowLeft,
  Download,
  Trash2,
  Eye,
  Calendar,
  FileImage,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';
import axios from 'axios';

interface ProcessingResult {
  _id: string;
  user_id: string;
  job_id: string;
  original_filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  cloudinary_urls: {
    original_image: string;
    dem_geotiff: string;
    visualization: string;
    analysis_plot: string;
    slope_analysis: string;
    aspect_analysis: string;
    hillshade: string;
    contour_lines: string;
    quality_report: string;
    processing_log: string;
  };
  analysis_results: {
    dem_stats: {
      min_elevation: number;
      max_elevation: number;
      mean_elevation: number;
      std_elevation: number;
      elevation_range: number;
    };
    quality_metrics: {
      quality_score: number;
      shadow_coverage: number;
      contrast_metric: number;
      detail_preservation: number;
      edge_sharpness: number;
      noise_level: number;
      convergence_score: number;
    };
    processing_info: {
      processing_time_seconds: number;
      grid_size: [number, number];
      convergence_iterations: number;
      sfs_algorithm: string;
    };
  };
  error_message?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<ProcessingResult | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Check if there's a specific job ID to highlight
  const highlightJobId = searchParams.get('job');

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/results`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setResults(response.data.results || []);

      // If there's a highlight job, select it
      if (highlightJobId) {
        const highlightResult = response.data.results.find(
          (r: ProcessingResult) => r.job_id === highlightJobId
        );
        if (highlightResult) {
          setSelectedResult(highlightResult);
        }
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      setError('Failed to load results');
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  }, [highlightJobId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleDelete = async (resultId: string) => {
    if (!confirm('Are you sure you want to delete this result? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(resultId);
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/results/${resultId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setResults(prev => prev.filter(r => r._id !== resultId));
      if (selectedResult?._id === resultId) {
        setSelectedResult(null);
      }
      toast.success('Result deleted successfully');
    } catch (error) {
      console.error('Error deleting result:', error);
      toast.error('Failed to delete result');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-purple-400 mx-auto animate-spin mb-4" />
          <p className="text-white text-lg">Loading your results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center space-x-2">
            <Moon className="h-6 w-6 text-purple-400" />
            <span className="text-white font-semibold">Luna Photoclinometry</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Processing Results
            </h1>
            <p className="text-gray-300 text-lg">
              View and manage your lunar DEM processing results
            </p>
          </div>

          {error && (
            <Alert className="mb-6 bg-red-500/10 border-red-500/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {results.length === 0 ? (
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="py-12 text-center">
                <FileImage className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No results yet
                </h3>
                <p className="text-gray-400 mb-6">
                  Upload your first lunar image to get started
                </p>
                <Button
                  onClick={() => navigate('/upload')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Upload Image
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Results List */}
              <div className="lg:col-span-1">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Your Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results.map((result) => (
                        <div
                          key={result._id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedResult?._id === result._id
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                            } ${highlightJobId === result.job_id
                              ? 'ring-2 ring-purple-400 ring-opacity-50'
                              : ''
                            }`}
                          onClick={() => setSelectedResult(result)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(result.status)}
                              <Badge
                                variant="secondary"
                                className={`${getStatusColor(result.status)} text-white`}
                              >
                                {result.status}
                              </Badge>
                            </div>
                            {deleting === result._id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(result._id);
                                }}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <h4 className="text-white font-medium mb-1 truncate">
                            {result.original_filename}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {formatDate(result.created_at)}
                          </p>
                          {result.analysis_results && (
                            <div className="mt-2 text-xs text-gray-500">
                              Quality: {(result.analysis_results.quality_metrics.quality_score * 100).toFixed(1)}%
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Result Details */}
              <div className="lg:col-span-2">
                {selectedResult ? (
                  <div className="space-y-6">
                    {/* Result Overview */}
                    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                          <span>{selectedResult.original_filename}</span>
                          <Badge
                            variant="secondary"
                            className={`${getStatusColor(selectedResult.status)} text-white`}
                          >
                            {selectedResult.status}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-white font-semibold mb-3">Processing Info</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Job ID:</span>
                                <span className="text-white font-mono">{selectedResult.job_id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Created:</span>
                                <span className="text-white">{formatDate(selectedResult.created_at)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Updated:</span>
                                <span className="text-white">{formatDate(selectedResult.updated_at)}</span>
                              </div>
                              {selectedResult.analysis_results && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Processing Time:</span>
                                  <span className="text-white">
                                    {selectedResult.analysis_results.processing_info.processing_time_seconds.toFixed(1)}s
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {selectedResult.analysis_results && (
                            <div>
                              <h4 className="text-white font-semibold mb-3">DEM Statistics</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Elevation Range:</span>
                                  <span className="text-white">
                                    {selectedResult.analysis_results.dem_stats.elevation_range.toFixed(2)}m
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Mean Elevation:</span>
                                  <span className="text-white">
                                    {selectedResult.analysis_results.dem_stats.mean_elevation.toFixed(2)}m
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Grid Size:</span>
                                  <span className="text-white">
                                    {selectedResult.analysis_results.processing_info.grid_size[0]} × {selectedResult.analysis_results.processing_info.grid_size[1]}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Quality Score:</span>
                                  <span className="text-white">
                                    {(selectedResult.analysis_results.quality_metrics.quality_score * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Generated Outputs */}
                    {selectedResult.status === 'completed' && selectedResult.cloudinary_urls && (
                      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                        <CardHeader>
                          <CardTitle className="text-white">Generated Outputs</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-4">
                            {Object.entries(selectedResult.cloudinary_urls).map(([key, url]) => (
                              <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <FileImage className="h-5 w-5 text-purple-400" />
                                  <span className="text-white text-sm capitalize">
                                    {key.replace(/_/g, ' ')}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(url, '_blank')}
                                    className="text-blue-400 hover:text-blue-300"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = `${selectedResult.original_filename}_${key}`;
                                      link.click();
                                    }}
                                    className="text-green-400 hover:text-green-300"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Error Message */}
                    {selectedResult.status === 'failed' && selectedResult.error_message && (
                      <Alert className="bg-red-500/10 border-red-500/20">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-300">
                          {selectedResult.error_message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                    <CardContent className="py-12 text-center">
                      <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Select a result
                      </h3>
                      <p className="text-gray-400">
                        Choose a processing result from the list to view details
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
