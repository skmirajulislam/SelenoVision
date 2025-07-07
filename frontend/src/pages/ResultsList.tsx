import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Search, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ResultCard from '@/components/ResultCard';
import { api } from '@/services/api';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { STORAGE_KEYS } from '@/config/constants';

interface ProcessingResult {
    _id: string;
    job_id: string;
    filename: string;
    original_filename: string;
    status: 'completed' | 'processing' | 'failed' | 'queued';
    created_at: string;
    completed_at?: string;
    progress?: number;
    cloudinary_urls: {
        original_image?: string;
        dem_geotiff?: string;
        visualization?: string;
        analysis_plot?: string;
        slope_analysis?: string;
        aspect_analysis?: string;
        hillshade?: string;
        contour_lines?: string;
        quality_report?: string;
    };
    analysis_results?: {
        quality_score?: number;
        basic_stats?: any;
        terrain_assessment?: any;
        surface_statistics?: any;
    };
    gemini_description?: string;
}

const ResultsList: React.FC = () => {
    const [results, setResults] = useState<ProcessingResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [error, setError] = useState<string | null>(null);

    const fetchResults = async (showRefreshToast = false) => {
        try {
            if (showRefreshToast) {
                setRefreshing(true);
            }

            const response = await api.getUserResults();

            if (response.success && response.data) {
                setResults(response.data);
                setError(null);
                if (showRefreshToast) {
                    toast.success('Results refreshed successfully');
                }
            } else {
                throw new Error(response.error || 'Failed to fetch results');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch results';
            setError(errorMessage);
            toast.error(errorMessage);
            console.error('Results fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleResultDeleted = (deletedId: string) => {
        setResults(prev => prev.filter(result => result._id !== deletedId));
        toast.success('Result deleted successfully');
    };

    const handleRefresh = () => {
        fetchResults(true);
    };

    useEffect(() => {
        fetchResults();
    }, []);

    // Filter results based on search term and status
    const filteredResults = Array.isArray(results) ? results.filter(result => {
        const matchesSearch = result.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.job_id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || result.status === statusFilter;
        return matchesSearch && matchesStatus;
    }) : [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500';
            case 'processing': return 'bg-blue-500';
            case 'failed': return 'bg-red-500';
            case 'queued': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    const statusCounts = Array.isArray(results) ? results.reduce((acc, result) => {
        acc[result.status] = (acc[result.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>) : {};

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
                        <p className="text-white mt-4">Loading your results...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Link to="/dashboard">
                            <Button variant="ghost" size="sm" className="text-white hover:text-purple-200">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-white">Processing Results</h1>
                    </div>
                    <Button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    <Card className="bg-black/20 border-purple-500/30">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{Array.isArray(results) ? results.length : 0}</div>
                                <div className="text-purple-200 text-sm">Total Results</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-black/20 border-green-500/30">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{statusCounts.completed || 0}</div>
                                <div className="text-green-200 text-sm">Completed</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-black/20 border-blue-500/30">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{statusCounts.processing || 0}</div>
                                <div className="text-blue-200 text-sm">Processing</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-black/20 border-yellow-500/30">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{statusCounts.queued || 0}</div>
                                <div className="text-yellow-200 text-sm">Queued</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-black/20 border-red-500/30">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{statusCounts.failed || 0}</div>
                                <div className="text-red-200 text-sm">Failed</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by filename or job ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-black/20 border-purple-500/30 text-white placeholder-gray-400"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={statusFilter === 'all' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('all')}
                            className="text-sm"
                        >
                            All
                        </Button>
                        <Button
                            variant={statusFilter === 'completed' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('completed')}
                            className="text-sm"
                        >
                            Completed
                        </Button>
                        <Button
                            variant={statusFilter === 'processing' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('processing')}
                            className="text-sm"
                        >
                            Processing
                        </Button>
                        <Button
                            variant={statusFilter === 'queued' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('queued')}
                            className="text-sm"
                        >
                            Queued
                        </Button>
                        <Button
                            variant={statusFilter === 'failed' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('failed')}
                            className="text-sm"
                        >
                            Failed
                        </Button>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <Card className="bg-red-900/20 border-red-500/50 mb-6">
                        <CardContent className="p-4">
                            <p className="text-red-200">Error: {error}</p>
                            <Button
                                onClick={handleRefresh}
                                className="mt-2 bg-red-600 hover:bg-red-700"
                                size="sm"
                            >
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Results Grid */}
                {filteredResults.length === 0 ? (
                    <Card className="bg-black/20 border-purple-500/30">
                        <CardContent className="p-8 text-center">
                            <p className="text-purple-200 text-lg">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'No results match your search criteria.'
                                    : 'No processing results found. Upload some lunar images to get started!'
                                }
                            </p>
                            {!searchTerm && statusFilter === 'all' && (
                                <Link to="/processing">
                                    <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                                        Start Processing
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredResults.map((result) => (
                            <ResultCard
                                key={result._id}
                                result={result}
                                onDelete={handleResultDeleted}
                                token={Cookies.get(STORAGE_KEYS.TOKEN) || ''}
                            />
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-12 text-center text-purple-200 text-sm">
                    <p>Showing {filteredResults.length} of {Array.isArray(results) ? results.length : 0} results</p>
                </div>
            </div>
        </div>
    );
};

export default ResultsList;
