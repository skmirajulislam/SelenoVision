
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Rocket, Moon, Zap, BarChart3, FolderOpen, Upload, Eye, Settings, LogOut, User, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';

const Index = () => {
  const { user, logout, deleteAccount, isAuthenticated } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone and will remove all your processing results.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const success = await deleteAccount();
      if (success) {
        toast.success('Account deleted successfully');
      } else {
        toast.error('Failed to delete account. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Rocket className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">Luna Photoclinometry</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white"
                    >
                      <User className="h-4 w-4 mr-2" />
                      {user?.username}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-white hover:bg-slate-700 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting ? 'Deleting...' : 'Delete Account'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-8">
            <Rocket className="h-5 w-5 text-purple-400" />
            <span className="text-purple-200">Advanced Lunar Analysis Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Luna <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Photoclinometry</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto">
            High-Resolution Lunar DEM Generation System using advanced Shape-from-Shading algorithms
            for precise terrain analysis and mission-critical surface mapping
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            {isAuthenticated ? (
              <Link
                to="/processing"
                className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
              >
                <Upload className="inline h-5 w-5 mr-2" />
                Upload Lunar Image
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
                >
                  <Rocket className="inline h-5 w-5 mr-2" />
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  Sign In
                </Link>
              </>
            )}
            <a
              href="http://localhost:5002/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
            >
              <Eye className="inline h-5 w-5 mr-2" />
              View API Docs
            </a>
          </div>

          {/* Status Indicator */}
          <div className="inline-flex items-center space-x-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300 text-sm">Server Online & Ready</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Powerful Lunar Surface Analysis</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Transform single lunar images into high-resolution Digital Elevation Models with our advanced processing pipeline
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Moon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Lunar Surface Analysis</h3>
              <p className="text-gray-400 leading-relaxed">
                Generate high-resolution DEMs from single lunar images using advanced Shape-from-Shading algorithms
              </p>
            </div>

            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Asynchronous Processing</h3>
              <p className="text-gray-400 leading-relaxed">
                Background processing with real-time status updates and progress tracking for large datasets
              </p>
            </div>

            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Comprehensive Analysis</h3>
              <p className="text-gray-400 leading-relaxed">
                Quality metrics and mission-critical terrain assessment with detailed surface statistics
              </p>
            </div>

            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FolderOpen className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Multi-Format Output</h3>
              <p className="text-gray-400 leading-relaxed">
                GeoTIFF DEMs, 3D models, visualizations, and comprehensive analysis reports
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Missions */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-4">Supported Lunar Missions</h3>
              <p className="text-gray-400 text-lg">
                Compatible with images from major lunar exploration missions
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <h4 className="text-white font-semibold mb-2">Chandrayaan</h4>
                <p className="text-gray-400 text-sm">TMC, TMC-2, OHRC</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">L</span>
                </div>
                <h4 className="text-white font-semibold mb-2">NASA LRO</h4>
                <p className="text-gray-400 text-sm">Lunar Reconnaissance Orbiter</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <h4 className="text-white font-semibold mb-2">JAXA Selene</h4>
                <p className="text-gray-400 text-sm">Terrain Camera</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Moon className="h-6 w-6 text-purple-400" />
            <span className="text-xl font-semibold text-white">Luna Photoclinometry</span>
          </div>
          <p className="text-gray-400">
            Advanced lunar surface analysis for space exploration and research
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
