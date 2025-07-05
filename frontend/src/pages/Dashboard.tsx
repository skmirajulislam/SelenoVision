
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Moon, ArrowLeft, RefreshCw, Eye, Download } from 'lucide-react';
import { useJobStatus } from '../hooks/useJobStatus';
import JobCard from '../components/results/JobCard';
import { Job } from '../types/api';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const activeJobId = searchParams.get('job');
  const [jobs, setJobs] = useState<Job[]>([]);
  const { getJobStatus } = useJobStatus();

  // Load jobs from localStorage on mount
  useEffect(() => {
    const storedJobs = localStorage.getItem('luna-jobs');
    if (storedJobs) {
      setJobs(JSON.parse(storedJobs));
    }
  }, []);

  // Add active job if it's new
  useEffect(() => {
    if (activeJobId && !jobs.find(job => job.job_id === activeJobId)) {
      const newJob: Job = {
        job_id: activeJobId,
        status: 'queued',
        progress: 0,
        message: 'Job queued for processing',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const updatedJobs = [newJob, ...jobs];
      setJobs(updatedJobs);
      localStorage.setItem('luna-jobs', JSON.stringify(updatedJobs));
    }
  }, [activeJobId, jobs]);

  const handleRefreshAll = async () => {
    const updatedJobs = await Promise.all(
      jobs.map(async (job) => {
        if (job.status === 'processing' || job.status === 'queued') {
          try {
            const status = await getJobStatus(job.job_id);
            return { ...job, ...status };
          } catch (error) {
            return job;
          }
        }
        return job;
      })
    );
    setJobs(updatedJobs);
    localStorage.setItem('luna-jobs', JSON.stringify(updatedJobs));
  };

  const updateJob = (jobId: string, updates: Partial<Job>) => {
    const updatedJobs = jobs.map(job => 
      job.job_id === jobId ? { ...job, ...updates } : job
    );
    setJobs(updatedJobs);
    localStorage.setItem('luna-jobs', JSON.stringify(updatedJobs));
  };

  const activeJobs = jobs.filter(job => job.status === 'processing' || job.status === 'queued');
  const completedJobs = jobs.filter(job => job.status === 'completed');
  const failedJobs = jobs.filter(job => job.status === 'failed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Moon className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">Luna</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link to="/upload" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
              Upload
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Processing Dashboard</h1>
              <p className="text-xl text-gray-300">
                Monitor your lunar surface analysis jobs and download results
              </p>
            </div>
            <button
              onClick={handleRefreshAll}
              className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh All</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="text-3xl font-bold text-white mb-2">{jobs.length}</div>
              <div className="text-gray-400">Total Jobs</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="text-3xl font-bold text-yellow-400 mb-2">{activeJobs.length}</div>
              <div className="text-gray-400">Processing</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">{completedJobs.length}</div>
              <div className="text-gray-400">Completed</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="text-3xl font-bold text-red-400 mb-2">{failedJobs.length}</div>
              <div className="text-gray-400">Failed</div>
            </div>
          </div>

          {/* No Jobs Message */}
          {jobs.length === 0 && (
            <div className="text-center py-12">
              <Moon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">No jobs yet</h3>
              <p className="text-gray-400 mb-6">Upload your first lunar image to get started</p>
              <Link 
                to="/upload"
                className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <span>Upload Image</span>
              </Link>
            </div>
          )}

          {/* Active Jobs */}
          {activeJobs.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">Active Jobs</h2>
              <div className="grid gap-6">
                {activeJobs.map((job) => (
                  <JobCard key={job.job_id} job={job} onUpdate={updateJob} />
                ))}
              </div>
            </div>
          )}

          {/* Completed Jobs */}
          {completedJobs.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">Completed Jobs</h2>
              <div className="grid gap-6">
                {completedJobs.map((job) => (
                  <JobCard key={job.job_id} job={job} onUpdate={updateJob} />
                ))}
              </div>
            </div>
          )}

          {/* Failed Jobs */}
          {failedJobs.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">Failed Jobs</h2>
              <div className="grid gap-6">
                {failedJobs.map((job) => (
                  <JobCard key={job.job_id} job={job} onUpdate={updateJob} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
