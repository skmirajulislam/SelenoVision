import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Upload as UploadIcon, Moon, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import axios from 'axios';
import Cookies from 'js-cookie';
import { API_CONFIG, STORAGE_KEYS } from '../config/constants';

interface UploadStatus {
    uploading: boolean;
    processing: boolean;
    completed: boolean;
    error: string | null;
    progress: number;
    jobId: string | null;
}

const Upload = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
        uploading: false,
        processing: false,
        completed: false,
        error: null,
        progress: 0,
        jobId: null,
    });

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            console.log('🔒 User not authenticated, redirecting to login');
            navigate('/login');
            return;
        }
    }, [authLoading, isAuthenticated, navigate]);

    const pollProcessingStatus = useCallback(async (jobId: string) => {
        const maxAttempts = 120; // 10 minutes with 5-second intervals
        let attempts = 0;

        const poll = async () => {
            try {
                const response = await axios.get(
                    `${API_CONFIG.BASE_URL}/api/status/${jobId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${Cookies.get(STORAGE_KEYS.TOKEN)}`
                        }
                    }
                );

                const { status, progress, error } = response.data;

                if (status === 'completed') {
                    setUploadStatus(prev => ({
                        ...prev,
                        processing: false,
                        completed: true,
                        progress: 100,
                    }));
                    toast.success('Processing completed successfully!');
                    setTimeout(() => navigate('/dashboard'), 2000);
                } else if (status === 'failed') {
                    setUploadStatus(prev => ({
                        ...prev,
                        processing: false,
                        error: error || 'Processing failed',
                        progress: 0,
                    }));
                    toast.error('Processing failed. Please try again.');
                } else if (status === 'processing') {
                    setUploadStatus(prev => ({
                        ...prev,
                        progress: progress || 50,
                    }));
                    attempts++;
                    if (attempts < maxAttempts) {
                        setTimeout(poll, 5000);
                    } else {
                        throw new Error('Processing timeout');
                    }
                }
            } catch (error) {
                console.error('Status polling error:', error);
                setUploadStatus(prev => ({
                    ...prev,
                    processing: false,
                    error: 'Failed to check processing status',
                    progress: 0,
                }));
                toast.error('Failed to check processing status');
            }
        };

        poll();
    }, [navigate]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
            toast.error('File size must be less than 50MB');
            return;
        }

        try {
            setUploadStatus({
                uploading: true,
                processing: false,
                completed: false,
                error: null,
                progress: 0,
                jobId: null,
            });

            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(
                `${API_CONFIG.BASE_URL}/api/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${Cookies.get(STORAGE_KEYS.TOKEN)}`
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
                        setUploadStatus(prev => ({ ...prev, progress }));
                    }
                }
            );

            if (response.data.success) {
                setUploadStatus(prev => ({
                    ...prev,
                    uploading: false,
                    processing: true,
                    jobId: response.data.job_id,
                    progress: 100,
                }));

                toast.success('Upload successful! Processing started...');

                // Poll for processing status
                pollProcessingStatus(response.data.job_id);
            }
        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus(prev => ({
                ...prev,
                uploading: false,
                processing: false,
                error: axios.isAxiosError(error) ? error.response?.data?.error || 'Upload failed' : 'Upload failed',
                progress: 0,
            }));
            toast.error('Upload failed. Please try again.');
        }
    }, [pollProcessingStatus]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpg', '.jpeg', '.png', '.tiff', '.tif']
        },
        maxFiles: 1,
        disabled: uploadStatus.uploading || uploadStatus.processing
    });

    const resetUpload = () => {
        setUploadStatus({
            uploading: false,
            processing: false,
            completed: false,
            error: null,
            progress: 0,
            jobId: null,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="px-6 py-4 border-b border-white/10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
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
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-white mb-4">
                            Upload Lunar Image
                        </h1>
                        <p className="text-gray-300 text-lg">
                            Upload a high-resolution lunar image to generate a Digital Elevation Model
                        </p>
                    </div>

                    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center">
                                <UploadIcon className="h-5 w-5 mr-2" />
                                Image Upload
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!uploadStatus.uploading && !uploadStatus.processing && !uploadStatus.completed && !uploadStatus.error && (
                                <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${isDragActive
                                        ? 'border-purple-400 bg-purple-500/10'
                                        : 'border-gray-600 hover:border-purple-400 hover:bg-purple-500/5'
                                        }`}
                                >
                                    <input {...getInputProps()} />
                                    <UploadIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        {isDragActive ? 'Drop your image here' : 'Upload lunar image'}
                                    </h3>
                                    <p className="text-gray-400 mb-4">
                                        Drag and drop or click to select a file
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Supported formats: JPG, PNG, TIFF (max 50MB)
                                    </p>
                                </div>
                            )}

                            {(uploadStatus.uploading || uploadStatus.processing) && (
                                <div className="text-center py-8">
                                    <div className="mb-6">
                                        <Loader2 className="h-16 w-16 text-purple-400 mx-auto animate-spin" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        {uploadStatus.uploading ? 'Uploading...' : 'Processing...'}
                                    </h3>
                                    <p className="text-gray-400 mb-6">
                                        {uploadStatus.uploading
                                            ? 'Your image is being uploaded to the server'
                                            : 'Generating Digital Elevation Model using Shape-from-Shading algorithms'
                                        }
                                    </p>
                                    <div className="max-w-md mx-auto">
                                        <Progress value={uploadStatus.progress} className="mb-2" />
                                        <p className="text-sm text-gray-500">
                                            {uploadStatus.progress}% complete
                                        </p>
                                    </div>
                                    {uploadStatus.processing && (
                                        <p className="text-sm text-gray-500 mt-4">
                                            This may take several minutes for large images
                                        </p>
                                    )}
                                </div>
                            )}

                            {uploadStatus.completed && (
                                <div className="text-center py-8">
                                    <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        Processing Complete!
                                    </h3>
                                    <p className="text-gray-400 mb-6">
                                        Your lunar DEM has been generated successfully
                                    </p>
                                    <Button
                                        onClick={() => navigate('/dashboard')}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                    >
                                        View Results
                                    </Button>
                                </div>
                            )}

                            {uploadStatus.error && (
                                <div className="text-center py-8">
                                    <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        Processing Failed
                                    </h3>
                                    <p className="text-gray-400 mb-6">
                                        {uploadStatus.error}
                                    </p>
                                    <Button
                                        onClick={resetUpload}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                    >
                                        Try Again
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upload Guidelines */}
                    <Card className="bg-white/5 backdrop-blur-sm border-white/10 mt-8">
                        <CardHeader>
                            <CardTitle className="text-white">Upload Guidelines</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-white font-semibold mb-3">Image Requirements</h4>
                                    <ul className="text-gray-400 space-y-2">
                                        <li>• High-resolution lunar surface images</li>
                                        <li>• Clear surface features and shadows</li>
                                        <li>• Minimal atmospheric distortion</li>
                                        <li>• Single-band or RGB images supported</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold mb-3">Technical Specifications</h4>
                                    <ul className="text-gray-400 space-y-2">
                                        <li>• Maximum file size: 50MB</li>
                                        <li>• Supported formats: JPG, PNG, TIFF</li>
                                        <li>• Processing time: 2-10 minutes</li>
                                        <li>• Output: GeoTIFF DEM + analysis</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default Upload;
