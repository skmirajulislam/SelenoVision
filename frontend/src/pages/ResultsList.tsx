import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import {
    FolderOpen,
    Eye,
    Download,
    Trash2,
    Clock,
    CheckCircle,
    AlertCircle,
    Image as ImageIcon,
    BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { API_CONFIG } from '@/config/constants';
import { toast } from 'sonner';

interface ProcessingResult {
    _id: string;
    job_id: string;
    filename: string;
    status: 'completed' | 'processing' | 'failed';
    created_at: string;
    completed_at?: string;
    analysis?: {
        quality_score?: number;
    };
}

const ResultsList: React.FC = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [results, setResults] = useState<ProcessingResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;

            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}/api/results`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setResults(data.results || []);
                } else {
                    toast.error('Failed to load results');
                }
            } catch (error) {
                console.error('Error fetching results:', error);
                toast.error('Failed to connect to server');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const handleDelete = async (resultId: string) => {
        if (!token) return;

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/results/${resultId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                toast.success('Result deleted successfully');
                // Remove the deleted result from the state
                setResults(results.filter(result => result._id !== resultId));
            } else {
                toast.error('Failed to delete result');
            }
        } catch (error) {
            console.error('Error deleting result:', error);
            toast.error('Failed to delete result');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-400" />;
            case 'processing':
                return <Clock className="h-4 w-4 text-yellow-400" />;
            case 'failed':
                return <AlertCircle className="h-4 w-4 text-red-400" />;
            default:
                return <Clock className="h-4 w-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-600';
            case 'processing':
                return 'bg-yellow-600';
            case 'failed':
                return 'bg-red-600';
            default:
                return 'bg-gray-600';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
                <Navigation />
                <div className="p-6 flex items-center justify-center min-h-[50vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                        <p className="text-white">Loading results...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
            <Navigation />
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                            <FolderOpen className="w-10 h-10 text-blue-400" />
                            Processing Results
                        </h1>
                        <p className="text-gray-300">View and manage your lunar image processing results</p>
                    </div>

                    {/* Results Grid */}
                    {results.length === 0 ? (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="p-12 text-center">
                                <FolderOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">No Results Yet</h3>
                                <p className="text-slate-400 mb-6">
                                    You haven't processed any images yet. Upload a lunar image to get started.
                                </p>
                                <Button
                                    onClick={() => navigate('/processing')}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <ImageIcon className="h-4 w-4 mr-2" />
                                    Upload Image
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.map((result) => (
                                <Card key={result._id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-white text-lg truncate mr-2">
                                                {result.filename}
                                            </CardTitle>
                                            <Badge className={`${getStatusColor(result.status)} text-white`}>
                                                <div className="flex items-center gap-1">
                                                    {getStatusIcon(result.status)}
                                                    {result.status}
                                                </div>
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="text-sm text-slate-400">
                                                <p>Created: {new Date(result.created_at).toLocaleDateString()}</p>
                                                {result.completed_at && (
                                                    <p>Completed: {new Date(result.completed_at).toLocaleDateString()}</p>
                                                )}
                                            </div>

                                            {result.analysis?.quality_score && (
                                                <div className="flex items-center gap-2">
                                                    <BarChart3 className="h-4 w-4 text-blue-400" />
                                                    <span className="text-sm text-slate-300">
                                                        Quality: {result.analysis.quality_score.toFixed(1)}%
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                {result.status === 'completed' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => navigate(`/results/${result.job_id}`)}
                                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDelete(result._id)}
                                                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultsList;
