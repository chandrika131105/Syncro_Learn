import React from 'react';
import { Home, BookOpen, Heart, Settings, LogOut, GraduationCap, BarChart2, Trophy, Sparkles, Shield, MessageSquare, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../services/api';

const Sidebar = ({ activeTab, setActiveTab, userRole, user }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        ...(userRole !== 'ADMIN' ? [{ id: 'overview', label: userRole === 'TUTOR' ? 'Overview' : 'Home', icon: Home }] : []),
        // Student Items
        ...(userRole === 'STUDENT' ? [
            { id: 'explore', label: 'Explore Courses', icon: BookOpen },
            { id: 'leaderboard', label: 'Hall of Fame', icon: Trophy, isExternal: true, path: '/leaderboard' },
            { id: 'analytics', label: 'Analytics', icon: BarChart2 },
            { id: 'my-courses', label: 'My Learning', icon: GraduationCap },
            { id: 'wishlist', label: 'Wishlist', icon: Heart }
        ] : []),
        // Tutor Items
        ...(userRole === 'TUTOR' ? [
            { id: 'tutor-studio', label: 'Tutor Studio', icon: Sparkles, role: 'TUTOR', isExternal: true, path: '/tutor-studio' },
            { id: 'tutor-leaderboard', label: 'Top Instructors', icon: Trophy, isExternal: true, path: '/tutor-leaderboard' }
        ] : []),
        // Admin Items
        ...(userRole === 'ADMIN' ? [
            { id: 'overview', label: 'Dashboard', icon: BarChart2 },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'courses', label: 'Course Approvals', icon: Shield },
            { id: 'community', label: 'Community', icon: MessageSquare },
            { id: 'financials', label: 'Financials', icon: Trophy },
            { id: 'settings', label: 'System Settings', icon: Settings }
        ] : [])
    ];

    return (
        <div className="w-44 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col h-screen sticky top-0 left-0 shadow-lg shadow-gray-100/50 z-20 overflow-x-hidden">
            {/* Logo Area */}
            <div className="h-14 flex items-center px-4 border-b border-gray-50">
                <div className="h-6 w-6 bg-blue-600 rounded-lg flex items-center justify-center mr-2 shadow-lg shadow-blue-500/30">
                    <BookOpen className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-base font-black bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                    SyncroLearn
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    // Skip if role doesn't match
                    if (item.role && item.role !== userRole) return null;

                    const isActive = activeTab === item.id || location.pathname === item.path;

                    const handleClick = () => {
                        if (item.isExternal) {
                            navigate(item.path);
                        } else {
                            // Determine the correct dashboard path based on role
                            const dashboardPath = userRole === 'ADMIN' ? '/admin-dashboard' : '/dashboard';

                            // If we are not on the correct dashboard, navigate there
                            if (location.pathname !== dashboardPath) {
                                navigate(dashboardPath);
                                // Delay setting active tab to allow navigation to complete
                                setTimeout(() => setActiveTab(item.id), 50);
                            } else {
                                setActiveTab(item.id);
                            }
                        }
                    };

                    return (
                        <button
                            key={item.id}
                            onClick={handleClick}
                            className={`w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-blue-50 text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon
                                className={`h-4 w-4 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                                    }`}
                            />
                            <span className="font-bold text-[11px] tracking-tight">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1 h-1 rounded-full bg-blue-600" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* User Profile & Logout */}
            <div className="p-2 border-t border-gray-50">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full bg-gray-50 rounded-lg p-2 flex items-center space-x-2 mb-1.5 hover:bg-gray-100 transition-colors text-left ${activeTab === 'profile' ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                >
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-[10px] shadow-md uppercase">
                        {user?.firstName ? user.firstName[0] : (user?.username?.[0] || 'U')}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-gray-900 truncate">
                            {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : (user?.username || "Account")}
                        </p>
                        <p className="text-[9px] text-gray-500 truncate capitalize">{userRole?.toLowerCase()}</p>
                    </div>
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-start space-x-2 text-gray-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors text-[10px] font-bold"
                >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
