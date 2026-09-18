
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getAdminUsers, updateUserRole, updateUserStatus, getAdminCourses, approveCourse, rejectCourse, getCurrentUser, getAllDiscussions, toggleHideDiscussion, getSystemSettings, updateSystemSettings, deleteCourseAdmin, getFinancialStats } from '../services/api';
import { Users, BookOpen, Check, X, Shield, AlertTriangle, UserX, UserCheck, MessageSquare, Eye, EyeOff, Settings as SettingsIcon, Save, Trash2, Filter, ExternalLink, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);

    const [courses, setCourses] = useState([]);
    const [courseFilter, setCourseFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED, ALL
    const [discussions, setDiscussions] = useState([]);
    const [systemSettings, setSystemSettings] = useState(null);
    const [financialStats, setFinancialStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [savingSettings, setSavingSettings] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCourses: 0,
        pendingApprovals: 0,
        totalRevenue: 0,
        platformFees: 0,
        payouts: 0
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser();
                setUser(userData);
            } catch (err) {
                console.error(err);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'users') await fetchUsers();
                if (activeTab === 'courses') await fetchCourses();
                if (activeTab === 'community') await fetchDiscussions();
                if (activeTab === 'settings') await fetchSettings();
                if (activeTab === 'financials') await fetchFinancials();

                // Mock stats loading for overview if needed, or real stats
                if (activeTab === 'overview') {
                    const financeData = await getFinancialStats();
                    setFinancialStats(financeData);
                    setStats(prev => ({
                        ...prev,
                        totalRevenue: financeData?.totalRevenue || 0,
                        platformFees: financeData?.platformFees || 0,
                        payouts: financeData?.payouts || 0
                    }));
                    setTimeout(() => setLoading(false), 500);
                } else {
                    setLoading(false);
                }
            } catch (e) {
                setError('Failed to load data');
                setLoading(false);
            }
        };
        loadData();
    }, [activeTab, courseFilter]);

    const fetchSettings = async () => {
        try {
            const data = await getSystemSettings();
            setSystemSettings(data);
        } catch (e) { console.error("Failed to load settings", e); }
    };

    const fetchFinancials = async () => {
        try {
            const data = await getFinancialStats();
            setFinancialStats(data);
        } catch (e) { console.error("Failed to load financials", e); }
    };

    const fetchUsers = async () => {
        const data = await getAdminUsers();
        setUsers(data.content || []);
    };

    const fetchCourses = async () => {
        const params = courseFilter === 'ALL' ? {} : { status: courseFilter };
        const data = await getAdminCourses(params);
        setCourses(data.content || []);
        // Update pending count in stats if we are fetching pending
        if (courseFilter === 'PENDING') {
            setStats(prev => ({ ...prev, pendingApprovals: data.totalElements || 0 }));
        }
    };

    const fetchDiscussions = async () => {
        const data = await getAllDiscussions();
        setDiscussions(data || []);
    };

    const handleToggleHide = async (id, currentStatus) => {
        try {
            await toggleHideDiscussion(id, !currentStatus);
            setDiscussions(discussions.map(d => d.id === id ? { ...d, hidden: !currentStatus } : d));
        } catch (err) { alert('Failed to update discussion'); }
    };

    // ... (Handlers for role update, approve, reject remain same)
    const handleRoleUpdate = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) { alert('Failed to update role'); }
    };

    const handleBan = async (userId, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'unban' : 'ban'} this user?`)) return;
        try {
            await updateUserStatus(userId, !currentStatus);
            setUsers(users.map(u => u.id === userId ? { ...u, isBanned: !currentStatus } : u));
        } catch (err) {
            alert('Failed to update user status');
        }
    };

    const handleApprove = async (courseId) => {
        try {
            await approveCourse(courseId);
            setCourses(courses.filter(c => c.id !== courseId));
        } catch (err) { alert('Failed to approve'); }
    };

    const handleReject = async (courseId) => {
        try {
            await rejectCourse(courseId);
            fetchCourses(); // proper refresh
        } catch (err) { alert('Failed to reject'); }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to PERMANENTLY delete this course? This cannot be undone.')) return;
        try {
            await deleteCourseAdmin(courseId);
            setCourses(courses.filter(c => c.id !== courseId));
        } catch (err) { alert('Failed to delete course'); }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            await updateSystemSettings(systemSettings);
            alert('Settings updated successfully');
        } catch (err) {
            console.error('Failed to update settings', err);
            alert('Failed to update settings');
        } finally {
            setSavingSettings(false);
        }
    };

    return (
        <div className="flex bg-gray-50 min-h-screen font-sans">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={user?.role} user={user} />

            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-xl shadow-lg shadow-blue-500/30">
                            {activeTab === 'community' ? <MessageSquare className="w-8 h-8 text-white" /> : activeTab === 'settings' ? <SettingsIcon className="w-8 h-8 text-white" /> : <Shield className="w-8 h-8 text-white" />}
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Control Center</h1>
                            <p className="text-gray-500 font-medium">System Overview & Management</p>
                        </div>
                    </div>
                </header>

                {/* Tab Navigation - Hidden since Sidebar controls it, but we can keep for mobile or quick switch if needed. 
                    Actually Sidebar sets activeTab directly. We just render content based on it. 
                */}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center p-6">
                                        <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
                                            <Users className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Total Users</p>
                                            <p className="text-2xl font-bold text-gray-900">{users.length || '1,240'}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center p-6">
                                        <div className="p-3 rounded-full bg-indigo-50 text-indigo-600 mr-4">
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Active Courses</p>
                                            <p className="text-2xl font-bold text-gray-900">85</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center p-6">
                                        <div className="p-3 rounded-full bg-yellow-50 text-yellow-600 mr-4">
                                            <AlertTriangle className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Pending Review</p>
                                            <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center p-6">
                                        <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
                                            <Trophy className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                                            <p className="text-2xl font-bold text-gray-900">${(stats.totalRevenue || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                                        <div className="flex gap-4">
                                            <button onClick={() => setActiveTab('users')} className="flex-1 py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-xl font-semibold text-gray-700 transition-colors text-sm">
                                                Manage Users
                                            </button>
                                            <button onClick={() => setActiveTab('courses')} className="flex-1 py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-xl font-semibold text-gray-700 transition-colors text-sm">
                                                Review Courses
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {users.map(u => (
                                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0">
                                                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                                                                    {u.firstName?.[0]}
                                                                </div>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-bold text-gray-900">{u.firstName} {u.lastName}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                                                        {u.email}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : u.role === 'TUTOR' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${u.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                            {u.isBanned ? 'Banned' : 'Active'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex gap-2 items-center">
                                                        <select
                                                            value={u.role}
                                                            onChange={(e) => handleRoleUpdate(u.id, e.target.value)}
                                                            className="block w-28 py-1 px-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs font-semibold"
                                                        >
                                                            <option value="STUDENT">Student</option>
                                                            <option value="TUTOR">Tutor</option>
                                                            <option value="ADMIN">Admin</option>
                                                        </select>
                                                        <button
                                                            onClick={() => handleBan(u.id, u.isBanned)}
                                                            className={`p-1.5 rounded-md transition-colors ${u.isBanned ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                                                            title={u.isBanned ? "Unban User" : "Ban User"}
                                                        >
                                                            {u.isBanned ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'courses' && (
                            <div className="space-y-6">
                                <div className="flex justify-end items-center space-x-2">
                                    <Filter className="w-4 h-4 text-gray-400" />
                                    <select
                                        value={courseFilter}
                                        onChange={(e) => { setCourseFilter(e.target.value); setLoading(true); }} // Effect will trigger fetch
                                        className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                                    >
                                        <option value="PENDING">Pending Review</option>
                                        <option value="APPROVED">Live Courses</option>
                                        <option value="REJECTED">Rejected</option>
                                        <option value="ALL">All Courses</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {courses.length === 0 && (
                                        <div className="col-span-full flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-dashed border-gray-300 p-12">
                                            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                                <Check className="h-8 w-8 text-green-600" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">All caught up!</h3>
                                            <p className="text-gray-500 mt-2">No pending courses to review.</p>
                                        </div>
                                    )}
                                    {courses.map(course => (
                                        <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300">
                                            <div className="h-48 bg-gray-200 relative overflow-hidden">
                                                <img src={course.thumbnail || 'https://via.placeholder.com/300'} alt={course.title} className="w-full h-full object-cover" />
                                                <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                                    Pending Review
                                                </div>
                                            </div>
                                            <div className="p-6 flex-1 flex flex-col">
                                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                                                <p className="text-sm text-gray-500 mb-4 flex items-center">
                                                    <Users className="w-4 h-4 mr-1.5" />
                                                    {course.tutor?.firstName} {course.tutor?.lastName}
                                                </p>
                                                <div className="flex-1"></div>
                                                <div className="grid grid-cols-2 gap-3 mt-4">
                                                    {course.approvalStatus === 'PENDING' ? (
                                                        <>
                                                            <button onClick={() => handleApprove(course.id)} className="flex items-center justify-center px-4 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-500/30">
                                                                <Check className="w-4 h-4 mr-2" /> Approve
                                                            </button>
                                                            <button onClick={() => handleReject(course.id)} className="flex items-center justify-center px-4 py-2.5 bg-white text-red-600 border-2 border-red-100 text-sm font-bold rounded-xl hover:bg-red-50 hover:border-red-200 transition-colors">
                                                                <X className="w-4 h-4 mr-2" /> Reject
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="col-span-2 grid grid-cols-2 gap-3">
                                                            <a href={`/course/${course.id}`} target="_blank" rel="noreferrer" className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors">
                                                                <ExternalLink className="w-4 h-4 mr-2" /> View
                                                            </a>
                                                            <button onClick={() => handleDeleteCourse(course.id)} className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-xl hover:bg-red-100 transition-colors">
                                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'community' && (
                            <div className="space-y-4">
                                {discussions.map(d => (
                                    <div key={d.id} className={`bg-white p-6 rounded-2xl shadow-sm border ${d.hidden ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center mb-3">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-gray-500 to-gray-600 flex items-center justify-center text-white font-bold text-xs shadow-sm mr-3">
                                                    {d.user?.firstName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{d.user?.firstName} {d.user?.lastName}</p>
                                                    <p className="text-xs text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleToggleHide(d.id, d.hidden)}
                                                className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${d.hidden ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            >
                                                {d.hidden ? <><Eye className="w-3 h-3 mr-1.5" /> Unhide</> : <><EyeOff className="w-3 h-3 mr-1.5" /> Hide</>}
                                            </button>
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed mb-2">{d.content}</p>
                                        <div className="flex items-center text-xs text-gray-400">
                                            <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-500">Module ID: {d.moduleId}</span>
                                            {d.hidden && <span className="ml-2 font-bold text-red-500 uppercase tracking-wider">Hidden from users</span>}
                                        </div>
                                    </div>
                                ))}
                                {discussions.length === 0 && <p className="text-center text-gray-500">No discussions found.</p>}
                            </div>
                        )}

                        {activeTab === 'financials' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-xl shadow-blue-200">
                                        <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                            <Trophy className="h-6 w-6 text-white" />
                                        </div>
                                        <p className="text-blue-100 font-medium mb-1">Total Platform Revenue</p>
                                        <h3 className="text-4xl font-bold tracking-tight mb-6">
                                            ${financialStats?.totalRevenue?.toLocaleString() || '0'}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-6">
                                            <div>
                                                <p className="text-blue-200 text-sm font-medium">Platform Fees (20%)</p>
                                                <p className="text-xl font-bold">${financialStats?.platformFees?.toLocaleString() || '0'}</p>
                                            </div>
                                            <div>
                                                <p className="text-blue-200 text-sm font-medium">Tutor Payouts (80%)</p>
                                                <p className="text-xl font-bold">${financialStats?.payouts?.toLocaleString() || '0'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                                        <h3 className="text-xl font-bold text-gray-900 mb-6">Top Performing Tutors</h3>
                                        <div className="space-y-4">
                                            {financialStats?.topTutors?.map((tutor, idx) => (
                                                <div key={tutor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">
                                                            #{idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">{tutor.name}</p>
                                                            <p className="text-xs text-gray-500">{tutor.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-green-600">${tutor.revenue?.toLocaleString()}</p>
                                                        <p className="text-xs text-gray-400">Revenue</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!financialStats?.topTutors || financialStats.topTutors.length === 0) && (
                                                <p className="text-center text-gray-400 py-4">No data available.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'settings' && systemSettings && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                    <SettingsIcon className="w-5 h-5 mr-2 text-gray-500" />
                                    Global System Configuration
                                </h3>
                                <form onSubmit={handleUpdateSettings} className="space-y-6">
                                    <div>
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={systemSettings.maintenanceMode}
                                                    onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })}
                                                />
                                                <div className={`block w-14 h-8 rounded-full transition-colors ${systemSettings.maintenanceMode ? 'bg-red-500' : 'bg-gray-200'}`}></div>
                                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${systemSettings.maintenanceMode ? 'transform translate-x-6' : ''}`}></div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">Maintenance Mode</span>
                                                <span className="text-xs text-gray-500">Prevent non-admin users from accessing the platform.</span>
                                            </div>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={systemSettings.allowRegistrations}
                                                    onChange={(e) => setSystemSettings({ ...systemSettings, allowRegistrations: e.target.checked })}
                                                />
                                                <div className={`block w-14 h-8 rounded-full transition-colors ${systemSettings.allowRegistrations ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${systemSettings.allowRegistrations ? 'transform translate-x-6' : ''}`}></div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">Allow Registrations</span>
                                                <span className="text-xs text-gray-500">Enable or disable new user signups.</span>
                                            </div>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Global Announcement Banner</label>
                                        <textarea
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                                            rows="3"
                                            placeholder="Enter a message to display to all users..."
                                            value={systemSettings.globalAnnouncement || ''}
                                            onChange={(e) => setSystemSettings({ ...systemSettings, globalAnnouncement: e.target.value })}
                                        ></textarea>
                                        <p className="mt-1 text-xs text-gray-500">Leave empty to disable the banner.</p>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={savingSettings}
                                            className="flex items-center px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
                                        >
                                            {savingSettings ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
