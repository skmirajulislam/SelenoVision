import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';
import {
    Upload,
    FileImage,
    Moon,
    Zap,
    CheckCircle,
    XCircle,
    Loader,
    AlertCircle,
    ArrowLeft,
    Download,
    Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProcessingJob {
    job_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    filename: string;
    progress: number;
    message: string;
    result_url?: string;
}

const Processing: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [currentJob, setCurrentJob] = useState<ProcessingJob | null>(null);
    const [processingHistory, setProcessingHistory] = useState<ProcessingJob[]>([]);

    useEffect(() => {
        // Poll for job status if there's an active job
        let interval: NodeJS.Timeout;
        if (currentJob && (currentJob.status === 'pending' || currentJob.status === 'processing')) {
            interval = setInterval(() => {
                checkJobStatus(currentJob.job_id);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [currentJob]);

    const checkJobStatus = async (jobId: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/status/${jobId}`);
            if (response.ok) {
                const data = await response.json();
                setCurrentJob(prev => prev ? { ...prev, ...data } : null);

                if (data.status === 'completed' || data.status === 'failed') {
                    setProcessingHistory(prev => [data, ...prev.filter(job => job.job_id !== jobId)]);
                    if (data.status === 'completed') {
                        toast.success('Processing completed successfully!');
                    } else {
                        toast.error('Processing failed. Please try again.');
                    }
                }
            }
        } catch (error) {
            console.error('Error checking job status:', error);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const validateAndSetFile = (file: File) => {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/tiff', 'image/tif'];
        const maxSize = 50 * 1024 * 1024; // 50MB

        if (!allowedTypes.includes(file.type)) {
            toast.error('Please select a valid image file (PNG, JPEG, or TIFF)');
            return;
        }

        if (file.size > maxSize) {
            toast.error('File size must be less than 50MB');
            return;
        }

        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file first');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('token='))
                ?.split('=')[1];

            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setCurrentJob({
                    job_id: data.job_id,
                    status: data.status,
                    filename: selectedFile.name,
                    progress: 0,
                    message: data.message
                });
                setSelectedFile(null);
                toast.success('Upload successful! Processing started.');
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Upload failed');
            }
        } catch (error) {
            toast.error('Network error during upload');
        } finally {
            setUploading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'failed':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'processing':
                return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
            default:
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'failed':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'processing':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={() => navigate('/dashboard')}
                                variant="outline"
                                size="sm"
                                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-600 rounded-full p-3">
                                <Moon className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Lunar Image Processing</h1>
                                <p className="text-slate-300">Upload lunar images for advanced photoclinometry analysis</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upload Section */}
                <Card className="bg-slate-800/50 border-slate-700 mb-8">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Upload className="h-5 w-5" />
                            Upload Lunar Image
                        </CardTitle>
                        <CardDescription className="text-slate-300">
                            Select a high-resolution lunar image for Digital Elevation Model generation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* File Upload Area */}
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragOver
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-slate-600 hover:border-slate-500'
                                    }`}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragOver(true);
                                }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleFileDrop}
                            >
                                <FileImage className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-white">
                                        {selectedFile ? selectedFile.name : 'Drop your image here or click to browse'}
                                    </h3>
                                    <p className="text-slate-400">
                                        Supports PNG, JPEG, and TIFF formats up to 50MB
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/tiff,.tif"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="file-input"
                                />
                                <label htmlFor="file-input">
                                    <Button
                                        variant="outline"
                                        className="mt-4 border-slate-600 text-slate-300 hover:bg-slate-700"
                                        asChild
                                    >
                                        <span>Browse Files</span>
                                    </Button>
                                </label>
                            </div>

                            {/* File Info */}
                            {selectedFile && (
                                <div className="bg-slate-700/30 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FileImage className="h-8 w-8 text-blue-400" />
                                            <div>
                                                <p className="text-white font-medium">{selectedFile.name}</p>
                                                <p className="text-slate-400 text-sm">
                                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => setSelectedFile(null)}
                                            variant="outline"
                                            size="sm"
                                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Processing Info */}
                            <Alert className="bg-blue-950/30 border-blue-900/50">
                                <Zap className="h-4 w-4 text-blue-400" />
                                <AlertDescription className="text-blue-200">
                                    <strong>Processing includes:</strong> Shape-from-Shading photoclinometry,
                                    DEM generation, surface analysis, slope/aspect mapping, and quality assessment.
                                    Processing typically takes 2-5 minutes depending on image complexity.
                                </AlertDescription>
                            </Alert>

                            {/* Upload Button */}
                            <Button
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                size="lg"
                            >
                                {uploading ? (
                                    <>
                                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Start Processing
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Current Processing Job */}
                {currentJob && (
                    <Card className="bg-slate-800/50 border-slate-700 mb-8">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                {getStatusIcon(currentJob.status)}
                                Current Processing
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-medium">{currentJob.filename}</p>
                                        <p className="text-slate-400 text-sm">{currentJob.message}</p>
                                    </div>
                                    <Badge className={getStatusColor(currentJob.status)}>
                                        {currentJob.status.charAt(0).toUpperCase() + currentJob.status.slice(1)}
                                    </Badge>
                                </div>

                                {currentJob.status === 'processing' && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Progress</span>
                                            <span className="text-white">{currentJob.progress}%</span>
                                        </div>
                                        <Progress value={currentJob.progress} className="h-2" />
                                    </div>
                                )}

                                {currentJob.status === 'completed' && currentJob.result_url && (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => window.open(currentJob.result_url, '_blank')}
                                            variant="outline"
                                            size="sm"
                                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Result
                                        </Button>
                                        <Button
                                            onClick={() => navigate('/dashboard')}
                                            variant="outline"
                                            size="sm"
                                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Go to Dashboard
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Processing Requirements */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Processing Requirements & Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-white font-semibold mb-3">Image Requirements</h3>
                                <ul className="space-y-2 text-slate-300 text-sm">
                                    <li>• High-resolution lunar surface images</li>
                                    <li>• Clear topographic features and shadows</li>
                                    <li>• Formats: PNG, JPEG, TIFF</li>
                                    <li>• Maximum file size: 50MB</li>
                                    <li>• Minimum resolution: 1024x1024px</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-3">Best Results</h3>
                                <ul className="space-y-2 text-slate-300 text-sm">
                                    <li>• Images with varied illumination</li>
                                    <li>• Clear crater and ridge features</li>
                                    <li>• Avoid heavily saturated images</li>
                                    <li>• Multiple viewing angles for same area</li>
                                    <li>• High contrast surface features</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Processing;
