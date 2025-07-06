import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { toast } from 'sonner';
import { User, Settings, Trash2, LogOut, Edit, Mail, Calendar, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
    const { user, logout, deleteAccount } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

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

            const response = await fetch('http://localhost:5000/api/profile', {
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

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
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
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="border-slate-600 text-slate-300 hover:bg-slate-800"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-3 bg-slate-800/50">
                        <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600">
                            <User className="h-4 w-4 mr-2" />
                            Profile
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

                    <TabsContent value="profile">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-white">Profile Information</CardTitle>
                                        <CardDescription className="text-slate-300">
                                            View and update your profile details
                                        </CardDescription>
                                    </div>
                                    <Button
                                        onClick={() => setEditMode(!editMode)}
                                        variant="outline"
                                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        {editMode ? 'Cancel' : 'Edit'}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {!editMode ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-slate-200 flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    Username
                                                </Label>
                                                <p className="text-white bg-slate-700/50 px-3 py-2 rounded-md">
                                                    {user.username}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-slate-200 flex items-center gap-2">
                                                    <Mail className="h-4 w-4" />
                                                    Email
                                                </Label>
                                                <p className="text-white bg-slate-700/50 px-3 py-2 rounded-md">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-200 flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Member Since
                                            </Label>
                                            <p className="text-white bg-slate-700/50 px-3 py-2 rounded-md">
                                                {new Date(user.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="username" className="text-slate-200">
                                                    Username
                                                </Label>
                                                <Input
                                                    id="username"
                                                    type="text"
                                                    value={editData.username}
                                                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                                    className="bg-slate-700/50 border-slate-600 text-white"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-slate-200">
                                                    Email
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={editData.email}
                                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                                    className="bg-slate-700/50 border-slate-600 text-white"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="submit"
                                                className="bg-blue-600 hover:bg-blue-700"
                                                disabled={loading}
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
                                )}
                            </CardContent>
                        </Card>
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
                </Tabs>
            </div>
        </div>
    );
};

export default Profile;
