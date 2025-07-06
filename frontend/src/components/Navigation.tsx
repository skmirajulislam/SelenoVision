import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import {
    Moon,
    LayoutDashboard,
    Upload,
    User,
    BarChart3,
    FolderOpen,
    LogOut,
    Settings
} from 'lucide-react';
import { toast } from 'sonner';

const Navigation: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/');
    };

    const navItems = [
        {
            label: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
        },
        {
            label: 'Upload',
            href: '/processing',
            icon: Upload,
        },
        {
            label: 'Results',
            href: '/results',
            icon: FolderOpen,
        },
        {
            label: 'Profile',
            href: '/profile',
            icon: User,
        },
    ];

    return (
        <nav className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="flex items-center gap-2">
                            <div className="bg-blue-600 rounded-full p-2">
                                <Moon className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">Luna</span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.href ||
                                (item.href === '/results' && location.pathname.startsWith('/results'));

                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                            ? 'bg-blue-600 text-white'
                                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                        }`}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 text-slate-300">
                            <User className="h-4 w-4" />
                            <span className="text-sm">{user?.username || 'User'}</span>
                        </div>

                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                        >
                            <LogOut className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Logout</span>
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden border-t border-slate-700 pt-2 pb-2">
                    <div className="flex items-center justify-around">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.href ||
                                (item.href === '/results' && location.pathname.startsWith('/results'));

                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-md text-xs transition-colors ${isActive
                                            ? 'text-blue-400'
                                            : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
