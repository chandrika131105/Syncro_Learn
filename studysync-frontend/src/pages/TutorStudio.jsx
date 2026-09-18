import React, { useState, useEffect } from 'react';
import { getMyCreatedCourses, deleteCourse } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BarChart2, Users, DollarSign, Plus, Edit, Trash2, Video, Calendar, Clock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';

const TutorStudio = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalRevenue: 0,
        avgRating: 0
    });
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await getMyCreatedCourses();
            setCourses(data);

            // Calculate pseudo-stats (replace with real API later)
            const students = data.reduce((acc, c) => acc + (c.enrollmentCount || 0), 0);
            const revenue = data.reduce((acc, c) => acc + ((c.price || 0) * (c.enrollmentCount || 0)), 0);
            setStats({
                totalStudents: students,
                totalRevenue: revenue,
                avgRating: 4.8 // Mock for now
            });
        } catch (error) {
            console.error("Failed to load tutor data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this course?")) {
            await deleteCourse(id);
            fetchData();
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex font-sans">
            <Sidebar activeTab="tutor-studio" userRole="TUTOR" user={user} setActiveTab={() => { }} />

            <div className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-gray-100 px-8 py-5 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md bg-white/80">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-purple-600" /> Tutor Studio
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Manage your content and track your performance.</p>
                    </div>
                    <button
                        onClick={() => navigate('/create-course')}
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-gray-200"
                    >
                        <Plus className="h-5 w-5" /> Create New Course
                    </button>
                </header>

                <main className="max-w-7xl mx-auto px-8 py-8 space-y-8">

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm font-medium">Total Students</p>
                                    <h3 className="text-2xl font-black text-gray-900">{stats.totalStudents}</h3>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                                    <DollarSign className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                                    <h3 className="text-2xl font-black text-gray-900">${stats.totalRevenue.toLocaleString()}</h3>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                                    <BarChart2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm font-medium">Avg. Rating</p>
                                    <h3 className="text-2xl font-black text-gray-900">{stats.avgRating}/5.0</h3>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Courses List */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-800">Your Courses</h3>
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{courses.length} Active</span>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center"><div className="animate-spin h-8 w-8 border-b-2 border-gray-900 rounded-full mx-auto"></div></div>
                        ) : courses.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                                {courses.map((course) => (
                                    <div key={course.id} className="p-6 hover:bg-gray-50 transition-colors group flex flex-col md:flex-row gap-6 items-start md:items-center">
                                        <div className="h-24 w-40 bg-gray-200 rounded-lg flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${course.thumbnail || 'https://via.placeholder.com/300x200'})` }} />

                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-lg text-gray-900 mb-1">{course.title}</h4>
                                            <p className="text-gray-500 text-sm line-clamp-1 mb-2">{course.description}</p>
                                            <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                                                <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> ${course.price}</span>
                                                <span className="flex items-center gap-1"><Video className="h-3 w-3" /> {course.modules?.length || 0} Modules</span>
                                                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {course.enrollmentCount || 0} Students</span>
                                                <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700">Published</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                title="Schedule Live Session"
                                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                            >
                                                <Calendar className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/edit-course/${course.id}`)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(course.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <Video className="h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">No courses yet</h3>
                                <p className="text-gray-500 mb-6 max-w-sm mx-auto">Start sharing your knowledge. Create your first course today.</p>
                                <button
                                    onClick={() => navigate('/create-course')}
                                    className="text-blue-600 font-bold hover:underline"
                                >
                                    Create Course
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Upcoming Live Sessions (Placeholder for Phase 2) */}
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm p-6 relative overflow-hidden">
                        <div className="absolute top-4 right-4 z-10">
                            <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-wide border border-gray-200">Coming Soon</span>
                        </div>
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-gray-400" /> Upcoming Live Sessions
                        </h3>
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl">
                                    <div className="h-12 w-12 bg-gray-200 rounded-lg" />
                                    <div>
                                        <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                                        <div className="h-3 w-20 bg-gray-200 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
};

export default TutorStudio;
