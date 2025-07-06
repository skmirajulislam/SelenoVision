
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Moon, ArrowLeft, Download, Eye, FileText, Image } from 'lucide-react';
import Navigation from '../components/Navigation';
import { useJobResults } from '../hooks/useJobResults';
import { JobResult } from '../types/api';
import ResultsViewer from '../components/results/ResultsViewer';
import DownloadManager from '../components/results/DownloadManager';

const Results = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { results, loading, error, fetchResults } = useJobResults();

  useEffect(() => {
    if (jobId) {
      fetchResults(jobId);
    }
  }, [jobId, fetchResults]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <header className="relative z-10 px-6 py-4">
          <nav className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Moon className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">Luna</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </nav>
        </header>

        <div className="px-6 py-12 text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-red-300 mb-2">Error Loading Results</h2>
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-12">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-6">
              <Eye className="h-5 w-5 text-green-400" />
              <span className="text-green-200">Analysis Complete</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Analysis Results</h1>
            <p className="text-xl text-gray-300">
              Job ID: <span className="font-mono text-purple-300">{jobId}</span>
            </p>
          </div>

          {results && (
            <>
              {/* Processing Info */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Processing Time</h3>
                  <p className="text-2xl font-bold text-purple-400">
                    {results.processing_info?.processing_time || 'N/A'}
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Iterations</h3>
                  <p className="text-2xl font-bold text-blue-400">
                    {results.processing_info?.iterations || 'N/A'}
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Convergence</h3>
                  <p className="text-2xl font-bold text-green-400">
                    {results.processing_info?.converged ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              {/* Results Viewer */}
              <div className="mb-12">
                <ResultsViewer results={results} />
              </div>

              {/* Download Manager */}
              <div>
                <DownloadManager jobId={jobId!} results={results} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
