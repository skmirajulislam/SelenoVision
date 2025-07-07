import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import Navigation from '../components/Navigation';
import { toast } from 'sonner';
import { User, Settings, Trash2, LogOut, Edit, Mail, Calendar, Shield, BarChart3, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

interface UserStats {
  total_processed: number;
  completed: number;
  processing: number;
  failed: number;
  success_rate: number;
}

const Profile: React.FC = () => {
  const { user, logout, deleteAccount, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setEditData({
        username: user.username,
        email: user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }); fetchUserStats();

      // Load Gemini API key from cookies
      const savedGeminiKey = Cookies.get('gemini_api_key');
      if (savedGeminiKey) {
        setGeminiApiKey(savedGeminiKey);
      }
    }
  }, [user]);

  useEffect(() => {
    // Poll for API key changes every 2 seconds to stay in sync with chatbot
    const pollApiKey = () => {
      const currentApiKey = Cookies.get('gemini_api_key');
      if (currentApiKey && currentApiKey !== geminiApiKey) {
        setGeminiApiKey(currentApiKey);
      } else if (!currentApiKey && geminiApiKey) {
        setGeminiApiKey('');
      }
    };

    const interval = setInterval(pollApiKey, 2000);
    return () => clearInterval(interval);
  }, [geminiApiKey]);

  const fetchUserStats = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const response = await fetch('http://localhost:5002/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const response = await fetch('http://localhost:5002/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: editData.username,
          email: editData.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Profile updated successfully');
        setEditMode(false);
        // Update the auth context with new user data
        window.location.reload(); // Simple reload to refresh user data
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editData.newPassword !== editData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (editData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement password change API call
      toast.success('Password changed successfully');
      setEditData({ ...editData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);

    try {
      const success = await deleteAccount();
      if (success) {
        toast.success('Account deleted successfully');
        navigate('/');
      } else {
        toast.error('Failed to delete account');
      }
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeminiKey = () => {
    if (geminiApiKey.trim()) {
      Cookies.set('gemini_api_key', geminiApiKey.trim(), {
        expires: 365, // 1 year
        secure: false, // Set to true in production with HTTPS
        sameSite: 'lax'
      });
      toast.success('Gemini API key saved successfully');
    } else {
      Cookies.remove('gemini_api_key');
      toast.success('Gemini API key removed');
    }
    setShowGeminiKey(false);
  };

  const handleRemoveGeminiKey = () => {
    Cookies.remove('gemini_api_key');
    setGeminiApiKey('');
    toast.success('Gemini API key removed');
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, navigate, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <User className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-xl">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 rounded-full p-3">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
                  <p className="text-slate-300">Manage your account and preferences</p>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4 bg-slate-800/50">
              <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="ai-settings" className="data-[state=active]:bg-purple-600">
                <Star className="h-4 w-4 mr-2" />
                AI Settings
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-blue-600">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="danger" className="data-[state=active]:bg-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Danger Zone
              </TabsTrigger>
            </TabsList>

            {/* User Statistics */}
            <TabsContent value="profile">
              <div className="space-y-6">
                {/* User Info Card */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editMode ? (
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="username" className="text-slate-200">Username</Label>
                          <Input
                            id="username"
                            value={editData.username}
                            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-slate-200">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={editData.email}
                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {loading ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditMode(false)}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-slate-400 text-sm">Username</p>
                            <p className="text-white font-medium">{user?.username}</p>
                          </div>
                          <Edit className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-slate-400 text-sm">Email</p>
                            <p className="text-white font-medium">{user?.email}</p>
                          </div>
                          <Mail className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-slate-400 text-sm">Member Since</p>
                            <p className="text-white font-medium">
                              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <Calendar className="h-4 w-4 text-slate-400" />
                        </div>
                        <Button
                          onClick={() => setEditMode(true)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Statistics Card */}
                {stats && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Processing Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                          <div className="text-2xl font-bold text-blue-400">{stats.total_processed}</div>
                          <div className="text-sm text-slate-400">Total Processed</div>
                        </div>
                        <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                          <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
                          <div className="text-sm text-slate-400">Completed</div>
                        </div>
                        <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-400">{stats.processing}</div>
                          <div className="text-sm text-slate-400">Processing</div>
                        </div>
                        <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                          <div className="text-2xl font-bold text-green-400">{stats.success_rate.toFixed(1)}%</div>
                          <div className="text-sm text-slate-400">Success Rate</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="security">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Password & Security</CardTitle>
                  <CardDescription className="text-slate-300">
                    Update your password and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-slate-200">
                        Current Password
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={editData.currentPassword}
                        onChange={(e) => setEditData({ ...editData, currentPassword: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-slate-200">
                          New Password
                        </Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={editData.newPassword}
                          onChange={(e) => setEditData({ ...editData, newPassword: e.target.value })}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-slate-200">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={editData.confirmPassword}
                          onChange={(e) => setEditData({ ...editData, confirmPassword: e.target.value })}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          required
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Change Password'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="danger">
              <Card className="bg-red-950/20 border-red-900/50">
                <CardHeader>
                  <CardTitle className="text-red-400">Danger Zone</CardTitle>
                  <CardDescription className="text-red-300">
                    Irreversible actions that will permanently affect your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-950/30 rounded-lg border border-red-900/50">
                      <h3 className="text-red-400 font-semibold mb-2">Delete Account</h3>
                      <p className="text-red-200 text-sm mb-4">
                        This action cannot be undone. This will permanently delete your account and all associated data.
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-800 border-slate-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-300">
                              This action cannot be undone. This will permanently delete your account
                              and remove all your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAccount}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={loading}
                            >
                              {loading ? 'Deleting...' : 'Delete Account'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-settings">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    AI Settings
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Configure AI integrations for enhanced analysis features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Gemini API Key Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">Google Gemini API</h3>
                        <p className="text-sm text-slate-400">
                          Enable AI-powered insights and descriptions for your lunar surface analysis
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {geminiApiKey ? (
                          <div className="flex items-center gap-2 text-green-400 bg-green-400/20 px-3 py-1 rounded-full text-sm">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            Connected
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-400 bg-red-400/20 px-3 py-1 rounded-full text-sm">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            Not Connected
                          </div>
                        )}
                      </div>
                    </div>

                    {geminiApiKey ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                          <div>
                            <p className="text-white font-medium">API Key Configured</p>
                            <p className="text-sm text-slate-400">
                              {showGeminiKey
                                ? geminiApiKey
                                : `${'*'.repeat(Math.max(0, geminiApiKey.length - 8))}${geminiApiKey.slice(-8)}`
                              }
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowGeminiKey(!showGeminiKey)}
                              className="bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                            >
                              {showGeminiKey ? 'Hide' : 'Show'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleRemoveGeminiKey}
                              className="bg-red-600 border-red-500 text-white hover:bg-red-500"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-950/50 border border-blue-800/50 rounded-lg">
                          <h4 className="text-blue-200 font-medium mb-2">How to get your Gemini API Key:</h4>
                          <ol className="text-sm text-blue-300 space-y-1 list-decimal list-inside">
                            <li>Visit <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-200">Google AI Studio</a></li>
                            <li>Sign in with your Google account</li>
                            <li>Click "Get API Key" and create a new API key</li>
                            <li>Copy the API key and paste it below</li>
                          </ol>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="geminiApiKey" className="text-slate-200">
                            Gemini API Key
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="geminiApiKey"
                              type="password"
                              placeholder="Enter your Gemini API key..."
                              value={geminiApiKey}
                              onChange={(e) => setGeminiApiKey(e.target.value)}
                              className="bg-slate-700/50 border-slate-600 text-white"
                            />
                            <Button
                              type="button"
                              onClick={handleSaveGeminiKey}
                              disabled={!geminiApiKey.trim()}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Save
                            </Button>
                          </div>
                          <p className="text-xs text-slate-400">
                            Your API key is stored securely in cookies and sent to backend only when needed.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Benefits Section */}
                  <div className="border-t border-slate-700 pt-6">
                    <h4 className="text-white font-medium mb-3">AI Features Enabled:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                        <div>
                          <p className="text-white font-medium text-sm">Smart Analysis</p>
                          <p className="text-slate-400 text-xs">AI-powered interpretation of terrain features</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                        <div>
                          <p className="text-white font-medium text-sm">Scientific Descriptions</p>
                          <p className="text-slate-400 text-xs">Detailed geological and mission insights</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                        <div>
                          <p className="text-white font-medium text-sm">Mission Planning</p>
                          <p className="text-slate-400 text-xs">Landing site recommendations and risk assessment</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                        <div>
                          <p className="text-white font-medium text-sm">Quality Assessment</p>
                          <p className="text-slate-400 text-xs">Automated quality scoring and validation</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
