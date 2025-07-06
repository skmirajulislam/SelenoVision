import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Moon,
  Download,
  Trash2,
  Eye,
  BarChart3,
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ProcessingResult {
  _id: string;
  job_id: string;
  user_id: string;
  filename: string;
  status: 'completed' | 'processing' | 'failed';
  created_at: string;
  completed_at?: string;
  cloudinary_urls: {
    original_image?: string;
    dem_geotiff?: string;
    visualization?: string;
    obj_model?: string;
    aspect_analysis?: string;
    slope_analysis?: string;
    contour_lines?: string;
    quality_report?: string;
    processing_log?: string;
  };
  analysis?: {
    quality_score?: number;
    surface_statistics?: any;
    crater_analysis?: any;
  };
  gemini_analysis?: any;
}

interface DashboardData {
  total_results: number;
  completed_results: number;
  processing_results: number;
  failed_results: number;
  recent_results: ProcessingResult[];
}

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDelete = async (resultId: string) => {
    if (!token) return;

    setDeletingId(resultId);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/results/${resultId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Result deleted successfully');
        fetchDashboardData();
      } else {
        toast.error('Failed to delete result');
      }
    } catch (error) {
      console.error('Error deleting result:', error);
      toast.error('Failed to delete result');
    } finally {
      setDeletingId(null);
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
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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

  if (!user) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Moon className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-xl">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Moon className="w-10 h-10 text-blue-400" />
            Dashboard
          </h1>
          <p className="text-gray-300">Welcome back, {user.username}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium">Total Results</p>
                  <p className="text-3xl font-bold text-white">{dashboardData?.total_results || 0}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm font-medium">Completed</p>
                  <p className="text-3xl font-bold text-white">{dashboardData?.completed_results || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 border-orange-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-200 text-sm font-medium">Processing</p>
                  <p className="text-3xl font-bold text-white">{dashboardData?.processing_results || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/50 to-red-800/50 border-red-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-200 text-sm font-medium">Failed</p>
                  <p className="text-3xl font-bold text-white">{dashboardData?.failed_results || 0}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-400/20">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => navigate('/processing')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Process New Image
                </Button>
                <Button
                  onClick={() => navigate('/profile')}
                  variant="outline"
                  className="border-purple-400/20 text-white hover:bg-purple-800/30"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Results */}
        <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-400/20">
          <CardHeader>
            <CardTitle className="text-white">Recent Processing Results</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.recent_results && dashboardData.recent_results.length > 0 ? (
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {dashboardData.recent_results.map((result) => (
                    <div
                      key={result._id}
                      className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-600/20"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-8 h-8 text-blue-400" />
                          <div>
                            <p className="text-white font-medium">{result.filename}</p>
                            <p className="text-gray-400 text-sm">
                              {formatDate(result.created_at)}
                            </p>
                          </div>
                        </div>

                        <Badge className={`${getStatusColor(result.status)} text-white`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(result.status)}
                            {result.status}
                          </div>
                        </Badge>

                        {/* Quality Score - Fixed the error here */}
                        {result.analysis?.quality_score && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm">Quality:</span>
                            <Progress
                              value={Math.round((result.analysis.quality_score || 0) * 100)}
                              className="w-20 h-2"
                            />
                            <span className="text-white text-sm">
                              {Math.round((result.analysis.quality_score || 0) * 100)}%
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {result.status === 'completed' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/results/${result.job_id}`)}
                              className="border-blue-400/20 text-blue-400 hover:bg-blue-800/30"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {result.cloudinary_urls?.dem_geotiff && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(result.cloudinary_urls.dem_geotiff, '_blank')}
                                className="border-green-400/20 text-green-400 hover:bg-green-800/30"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(result._id)}
                          disabled={deletingId === result._id}
                          className="border-red-400/20 text-red-400 hover:bg-red-800/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12">
                <Moon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-400 text-lg">No processing results yet</p>
                <p className="text-gray-500 mb-6">Start by uploading a lunar image for analysis</p>
                <Button
                  onClick={() => navigate('/processing')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Process Your First Image
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
