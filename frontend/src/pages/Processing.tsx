import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import {
    Upload,
    FileImage,
    CheckCircle,
    AlertCircle,
    Moon,
    Rocket,
    Sparkles,
    Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface ProcessingStatus {
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress?: number;
    step?: string;
    result_id?: string;
    error_message?: string;
}

const Processing: React.FC = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
    const [showCompletion, setShowCompletion] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            validateAndSetFile(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.tif']
        },
        maxFiles: 1,
        maxSize: 50 * 1024 * 1024 // 50MB
    });

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
        toast.success('File selected successfully!');
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !token) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setJobId(data.job_id);
                setProcessingStatus({ status: 'queued' });
                toast.success('Upload successful! Processing started...');

                // Start polling for status
                pollProcessingStatus(data.job_id);
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const pollProcessingStatus = async (jobId: string) => {
        const poll = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/processing-status/${jobId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const status: ProcessingStatus = await response.json();
                    setProcessingStatus(status);

                    if (status.status === 'completed') {
                        setShowCompletion(true);
                        toast.success('Processing completed successfully!');
                        return; // Stop polling
                    } else if (status.status === 'failed') {
                        toast.error(status.error_message || 'Processing failed');
                        return; // Stop polling
                    }
                }
            } catch (error) {
                console.error('Error polling status:', error);
            }

            // Continue polling if still processing
            if (processingStatus?.status === 'processing' || processingStatus?.status === 'queued') {
                setTimeout(poll, 2000); // Poll every 2 seconds
            }
        };

        poll();
    };

    const getProgressValue = () => {
        if (!processingStatus) return 0;

        switch (processingStatus.status) {
            case 'queued': return 10;
            case 'processing': return processingStatus.progress || 50;
            case 'completed': return 100;
            case 'failed': return 0;
            default: return 0;
        }
    };

    const getStatusColor = () => {
        if (!processingStatus) return 'bg-gray-500';

        switch (processingStatus.status) {
            case 'queued': return 'bg-yellow-500';
            case 'processing': return 'bg-blue-500';
            case 'completed': return 'bg-green-500';
            case 'failed': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusIcon = () => {
        if (!processingStatus) return <Upload className="w-4 h-4" />;

        switch (processingStatus.status) {
            case 'queued': return <Moon className="w-4 h-4 animate-pulse" />;
            case 'processing': return <Rocket className="w-4 h-4 animate-bounce" />;
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'failed': return <AlertCircle className="w-4 h-4" />;
            default: return <Upload className="w-4 h-4" />;
        }
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
            <Navigation />
            <div className="p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                            <Rocket className="w-10 h-10 text-blue-400" />
                            Lunar Image Processing
                        </h1>
                        <p className="text-gray-300">Upload a lunar surface image to generate high-resolution DEMs</p>
                    </div>

                    {/* Upload Section */}
                    {!jobId && (
                        <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-400/20 mb-8">
                            <CardHeader>
                                <CardTitle className="text-white">Upload Lunar Image</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                                        ? 'border-blue-400 bg-blue-900/20'
                                        : 'border-gray-400 hover:border-blue-400 hover:bg-blue-900/10'
                                        }`}
                                >
                                    <input {...getInputProps()} />
                                    <div className="flex flex-col items-center gap-4">
                                        <FileImage className="w-16 h-16 text-gray-400" />
                                        {isDragActive ? (
                                            <p className="text-blue-400 text-lg">Drop the lunar image here...</p>
                                        ) : (
                                            <div>
                                                <p className="text-white text-lg mb-2">
                                                    Drag & drop a lunar image here, or click to select
                                                </p>
                                                <p className="text-gray-400 text-sm">
                                                    Supports PNG, JPEG, TIFF (max 50MB)
                                                </p>
                                                <p className="text-gray-500 text-xs mt-2">
                                                    Compatible with Chandrayaan, LRO, and Selene mission data
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedFile && (
                                    <div className="mt-6 p-4 bg-slate-800/30 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <FileImage className="w-8 h-8 text-blue-400" />
                                                <div>
                                                    <p className="text-white font-medium">{selectedFile.name}</p>
                                                    <p className="text-gray-400 text-sm">
                                                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={handleUpload}
                                                disabled={isUploading}
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <Moon className="w-4 h-4 mr-2 animate-spin" />
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        Start Processing
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Processing Status */}
                    {processingStatus && (
                        <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-400/20 mb-8">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Moon className="w-6 h-6 text-blue-400" />
                                    Processing Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Badge className={`${getStatusColor()} text-white`}>
                                            <div className="flex items-center gap-1">
                                                {getStatusIcon()}
                                                {processingStatus.status}
                                            </div>
                                        </Badge>
                                        <span className="text-white text-sm">
                                            {getProgressValue()}%
                                        </span>
                                    </div>

                                    <Progress value={getProgressValue()} className="w-full" />

                                    {processingStatus.step && (
                                        <p className="text-gray-300 text-sm">
                                            Current step: {processingStatus.step}
                                        </p>
                                    )}

                                    {processingStatus.status === 'processing' && (
                                        <div className="flex items-center gap-2 text-blue-400">
                                            <Sparkles className="w-4 h-4 animate-pulse" />
                                            <span className="text-sm">Analyzing lunar surface features...</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Completion Animation */}
                    <AnimatePresence>
                        {showCompletion && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
                            >
                                <Card className="bg-gradient-to-br from-green-900/90 to-emerald-900/90 border-green-400/20 p-8 max-w-md mx-4">
                                    <CardContent className="text-center">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                                        </motion.div>
                                        <h3 className="text-2xl font-bold text-white mb-2">
                                            Processing Complete!
                                        </h3>
                                        <p className="text-green-200 mb-6">
                                            Your lunar DEM has been successfully generated
                                        </p>
                                        <div className="flex gap-3 justify-center">
                                            <Button
                                                onClick={() => navigate('/dashboard')}
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                View Results
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setShowCompletion(false);
                                                    setJobId(null);
                                                    setProcessingStatus(null);
                                                    setSelectedFile(null);
                                                }}
                                                variant="outline"
                                                className="border-green-400/20 text-green-400 hover:bg-green-800/30"
                                            >
                                                Process Another
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Processing;
