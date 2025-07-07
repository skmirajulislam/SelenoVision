import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Eye,
    Download,
    Trash2,
    Clock,
    CheckCircle,
    AlertCircle,
    Image as ImageIcon,
    BarChart3,
    Info,
    MapPin,
    Activity,
    Target,
    Layers
} from 'lucide-react';
import { API_CONFIG } from '@/config/constants';
import { toast } from 'sonner';

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
        comprehensive_analysis?: string;  // Add this new field
        slope_analysis?: string;
        aspect_analysis?: string;
        hillshade?: string;
        contour_lines?: string;
        quality_report?: string;
    };
    analysis_results?: {
        quality_score?: number;
        basic_stats?: {
            height_range?: number;
            mean_height?: number;
            max_height?: number;
            min_height?: number;
            std_height?: number;
        };
        mission_metrics?: {
            crater_candidates?: number;
            suitable_landing_sites?: number;
            flat_terrain_percent?: number;
            data_completeness?: number;
        };
        gradient_stats?: {
            max_slope?: number;
            mean_slope?: number;
            steep_areas_percent?: number;
        };
    };
    processing_info?: {
        iterations?: number;
        converged?: boolean;
        processed_at?: string;
    };
}

interface ResultCardProps {
    result: ProcessingResult;
    onDelete: (id: string) => void;
    token: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onDelete, token }) => {
    const [showDetails, setShowDetails] = useState(false);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'processing':
                return <Activity className="w-4 h-4 text-blue-500 animate-spin" />;
            case 'failed':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-yellow-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this result? This will also remove all associated files from cloud storage.')) {
            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}/api/results/${result._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    onDelete(result._id);
                    toast.success('Result deleted successfully');
                } else {
                    throw new Error('Failed to delete result');
                }
            } catch (error) {
                console.error('Error deleting result:', error);
                toast.error('Failed to delete result');
            }
        }
    };

    // Add comprehensive_analysis to the download function
    // ...existing code...

    const downloadAllImages = async () => {
        if (!result.cloudinary_urls) {
            toast.error('No images available for download');
            return;
        }

        const imageTypes = [
            { key: 'original_image', name: 'original_image.jpg' },
            { key: 'visualization', name: 'main_visualization.png' },
            { key: 'analysis_plot', name: 'analysis_plot.png' },
            { key: 'comprehensive_analysis', name: 'comprehensive_analysis.png' },
            { key: 'slope_analysis', name: 'slope_analysis.png' },
            { key: 'aspect_analysis', name: 'aspect_analysis.png' },
            { key: 'hillshade', name: 'hillshade.png' },
            { key: 'contour_lines', name: 'contour_lines.png' },
            { key: 'quality_report', name: 'quality_report.png' }
        ];

        // Filter only available images
        const availableImages = imageTypes.filter(imageType =>
            result.cloudinary_urls[imageType.key as keyof typeof result.cloudinary_urls]
        );

        if (availableImages.length === 0) {
            toast.error('No images available for download');
            return;
        }

        toast.info(`Starting download of ${availableImages.length} images...`);

        let successCount = 0;
        let failCount = 0;

        // Download images sequentially with delay to avoid browser blocking
        for (const imageType of availableImages) {
            try {
                const imageUrl = result.cloudinary_urls[imageType.key as keyof typeof result.cloudinary_urls];
                if (imageUrl) {
                    // Create a temporary link element
                    const link = document.createElement('a');
                    link.href = imageUrl;
                    link.download = imageType.name;
                    link.target = '_blank';

                    // Add to document, click, and remove
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    successCount++;

                    // Add delay between downloads to prevent browser blocking
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            } catch (error) {
                console.error(`Failed to download ${imageType.name}:`, error);
                failCount++;
            }
        }

        // Show final result
        if (successCount > 0) {
            toast.success(`Successfully initiated download of ${successCount} images${failCount > 0 ? ` (${failCount} failed)` : ''}`);
        } else {
            toast.error('Failed to download any images');
        }
    };

    // Individual image download function (improved)
    const downloadImage = async (imageUrl: string, filename: string) => {
        try {
            toast.info(`Downloading ${filename}...`);

            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = filename;
            link.target = '_blank';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`${filename} download started`);
        } catch (error) {
            console.error('Download failed:', error);
            toast.error(`Failed to download ${filename}`);
        }
    };

    // ...existing code...

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const qualityScore = result.analysis_results?.quality_score || 0;
    const getQualityColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <>
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" />
                            {result.original_filename}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(result.status)}>
                                {getStatusIcon(result.status)}
                                <span className="ml-1 capitalize">{result.status}</span>
                            </Badge>
                            {result.status === 'completed' && (
                                <Badge variant="outline" className={getQualityColor(qualityScore)}>
                                    Quality: {qualityScore}%
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Created:</span>
                                <p className="text-gray-600">{formatDate(result.created_at)}</p>
                            </div>
                            {result.completed_at && (
                                <div>
                                    <span className="font-medium">Completed:</span>
                                    <p className="text-gray-600">{formatDate(result.completed_at)}</p>
                                </div>
                            )}
                        </div>

                        {result.status === 'completed' && result.analysis_results && (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-blue-500" />
                                    <span>Landing Sites: {result.analysis_results.mission_metrics?.suitable_landing_sites || 0}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-green-500" />
                                    <span>Craters: {result.analysis_results.mission_metrics?.crater_candidates || 0}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 flex-wrap">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowDetails(true)}
                                disabled={result.status !== 'completed'}
                            >
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                            </Button>
                            {result.status === 'completed' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={downloadAllImages}
                                    className="text-green-600 hover:text-green-700"
                                >
                                    <Download className="w-4 h-4 mr-1" />
                                    Download All
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDelete}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showDetails} onOpenChange={setShowDetails}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="flex items-center gap-2">
                                <Layers className="w-5 h-5" />
                                Lunar Surface Analysis: {result.original_filename}
                            </DialogTitle>
                            <Button
                                onClick={downloadAllImages}
                                className="bg-green-600 hover:bg-green-700"
                                size="sm"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download All Images
                            </Button>
                        </div>
                    </DialogHeader>

                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
                            <TabsTrigger value="analysis">Analysis</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold">Processing Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Job ID:</span>
                                            <span className="font-mono text-xs">{result.job_id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Iterations:</span>
                                            <span>{result.processing_info?.iterations || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Converged:</span>
                                            <span>{result.processing_info?.converged ? '✅ Yes' : '❌ No'}</span>
                                        </div>
                                    </div>
                                </div>

                                {result.analysis_results && (
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-semibold">Key Metrics</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Quality Score:</span>
                                                <span className={getQualityColor(qualityScore)}>{qualityScore}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Height Range:</span>
                                                <span>{result.analysis_results.basic_stats?.height_range?.toFixed(2) || 'N/A'} m</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Mean Elevation:</span>
                                                <span>{result.analysis_results.basic_stats?.mean_height?.toFixed(2) || 'N/A'} m</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Data Completeness:</span>
                                                <span>{result.analysis_results.mission_metrics?.data_completeness?.toFixed(1) || 'N/A'}%</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="visualizations" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {result.cloudinary_urls.original_image && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Original Image</h4>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => downloadImage(result.cloudinary_urls.original_image!, 'original_image.png')}
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <img
                                            src={result.cloudinary_urls.original_image}
                                            alt="Original"
                                            className="w-full h-48 object-cover rounded border"
                                        />
                                    </div>
                                )}

                                {result.cloudinary_urls.visualization && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">DEM Visualization</h4>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => downloadImage(result.cloudinary_urls.visualization!, 'dem_visualization.png')}
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <img
                                            src={result.cloudinary_urls.visualization}
                                            alt="DEM Visualization"
                                            className="w-full h-48 object-cover rounded border"
                                        />
                                    </div>
                                )}

                                {result.cloudinary_urls.analysis_plot && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Comprehensive Analysis</h4>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => downloadImage(result.cloudinary_urls.analysis_plot!, 'comprehensive_analysis.png')}
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <img
                                            src={result.cloudinary_urls.analysis_plot}
                                            alt="Comprehensive Analysis"
                                            className="w-full h-48 object-cover rounded border"
                                        />
                                    </div>
                                )}

                                {result.cloudinary_urls.comprehensive_analysis && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Comprehensive Analysis</h4>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => downloadImage(result.cloudinary_urls.comprehensive_analysis!, 'comprehensive_analysis.png')}
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <img
                                            src={result.cloudinary_urls.comprehensive_analysis}
                                            alt="Comprehensive Analysis"
                                            className="w-full h-48 object-cover rounded border"
                                        />
                                    </div>
                                )}

                                {result.cloudinary_urls.slope_analysis && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Slope Analysis</h4>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => downloadImage(result.cloudinary_urls.slope_analysis!, 'slope_analysis.png')}
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <img
                                            src={result.cloudinary_urls.slope_analysis}
                                            alt="Slope Analysis"
                                            className="w-full h-48 object-cover rounded border"
                                        />
                                    </div>
                                )}

                                {result.cloudinary_urls.aspect_analysis && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Aspect Analysis</h4>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => downloadImage(result.cloudinary_urls.aspect_analysis!, 'aspect_analysis.png')}
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <img
                                            src={result.cloudinary_urls.aspect_analysis}
                                            alt="Aspect Analysis"
                                            className="w-full h-48 object-cover rounded border"
                                        />
                                    </div>
                                )}

                                {result.cloudinary_urls.hillshade && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Hillshade</h4>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => downloadImage(result.cloudinary_urls.hillshade!, 'hillshade.png')}
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <img
                                            src={result.cloudinary_urls.hillshade}
                                            alt="Hillshade"
                                            className="w-full h-48 object-cover rounded border"
                                        />
                                    </div>
                                )}

                                {result.cloudinary_urls.contour_lines && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Contour Lines</h4>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => downloadImage(result.cloudinary_urls.contour_lines!, 'contour_lines.png')}
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <img
                                            src={result.cloudinary_urls.contour_lines}
                                            alt="Contour Lines"
                                            className="w-full h-48 object-cover rounded border"
                                        />
                                    </div>
                                )}

                                {result.cloudinary_urls.quality_report && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Quality Report</h4>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => downloadImage(result.cloudinary_urls.quality_report!, 'quality_report.png')}
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <img
                                            src={result.cloudinary_urls.quality_report}
                                            alt="Quality Report"
                                            className="w-full h-48 object-cover rounded border"
                                        />
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="analysis" className="space-y-4">
                            {result.analysis_results && (
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Terrain Statistics</h3>
                                        <div className="space-y-3">
                                            <div className="p-3 bg-gray-50 rounded">
                                                <h4 className="font-medium text-sm">Basic Statistics</h4>
                                                <div className="mt-2 space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>Min Height:</span>
                                                        <span>{result.analysis_results.basic_stats?.min_height?.toFixed(2) || 'N/A'} m</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Max Height:</span>
                                                        <span>{result.analysis_results.basic_stats?.max_height?.toFixed(2) || 'N/A'} m</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Std Deviation:</span>
                                                        <span>{result.analysis_results.basic_stats?.std_height?.toFixed(2) || 'N/A'} m</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-3 bg-gray-50 rounded">
                                                <h4 className="font-medium text-sm">Gradient Analysis</h4>
                                                <div className="mt-2 space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>Max Slope:</span>
                                                        <span>{result.analysis_results.gradient_stats?.max_slope?.toFixed(2) || 'N/A'}°</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Mean Slope:</span>
                                                        <span>{result.analysis_results.gradient_stats?.mean_slope?.toFixed(2) || 'N/A'}°</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Steep Areas:</span>
                                                        <span>{result.analysis_results.gradient_stats?.steep_areas_percent?.toFixed(1) || 'N/A'}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Mission Metrics</h3>
                                        <div className="space-y-3">
                                            <div className="p-3 bg-blue-50 rounded">
                                                <h4 className="font-medium text-sm">Landing Assessment</h4>
                                                <div className="mt-2 space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>Suitable Sites:</span>
                                                        <span className="font-medium text-green-600">
                                                            {result.analysis_results.mission_metrics?.suitable_landing_sites || 0}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Flat Terrain:</span>
                                                        <span>{result.analysis_results.mission_metrics?.flat_terrain_percent?.toFixed(1) || 'N/A'}%</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Crater Features:</span>
                                                        <span>{result.analysis_results.mission_metrics?.crater_candidates || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ResultCard;
