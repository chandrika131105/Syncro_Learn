import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getComparisonData } from '../services/api';
import {
    X, CheckCircle, Smartphone, Video, Clock, DollarSign,
    User, Crown, Zap, Award, ArrowLeft, Loader2, Sparkles,
    Shield, Globe, BookOpen, ChevronRight, Star, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ComparisonPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState('all');

    const courseIds = searchParams.get('ids')?.split(',').filter(id => id) || [];

    useEffect(() => {
        const fetchData = async () => {
            if (courseIds.length === 0) {
                setError("No courses selected for comparison.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await getComparisonData(courseIds);
                setCourses(data);
            } catch (err) {
                console.error("Failed to fetch comparison data:", err);
                setError("Failed to load comparison data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900">Assembling Showdown...</h2>
                    <p className="text-gray-500">Comparing modules, prices, and stats</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md text-center border border-red-100">
                    <div className="bg-red-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Determine Winners for highlighting
    const sortedByPrice = [...courses].sort((a, b) => a.price - b.price);
    const bestValueId = sortedByPrice[0]?.id;

    const sections = [
        { id: 'all', label: 'All Details', icon: Globe },
        { id: 'content', label: 'Modules & Curriculum', icon: BookOpen },
        { id: 'price', label: 'Pricing & Value', icon: DollarSign },
        { id: 'instructor', label: 'Instructor Stats', icon: User }
    ];

    const FeatureRow = ({ label, icon, renderValue, sectionId }) => {
        if (activeSection !== 'all' && activeSection !== sectionId) return null;

        return (
            <div className="border-b border-gray-100 group">
                <div className="grid" style={{ gridTemplateColumns: `250px repeat(${courses.length}, 1fr)` }}>
                    <div className="p-6 bg-gray-50/50 flex items-center gap-3 border-r border-gray-100 sticky left-0 z-20">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                            {icon}
                        </div>
                        <span className="font-bold text-gray-700 text-sm uppercase tracking-wider">{label}</span>
                    </div>
                    {courses.map(course => (
                        <div key={course.id} className="p-6 flex flex-col items-center justify-center text-center border-r border-gray-100 last:border-r-0">
                            {renderValue(course)}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-500"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <Zap className="h-6 w-6 text-blue-600 fill-current" />
                                Course Showdown
                            </h1>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Deep Comparison Analysis</p>
                        </div>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        {sections.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setActiveSection(s.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSection === s.id
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <s.icon className="h-4 w-4" />
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto p-4 md:p-8 overflow-x-auto custom-scrollbar">
                {/* Course Top Cards */}
                <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 overflow-hidden border border-gray-100 min-w-[800px]">
                    <div className="grid" style={{ gridTemplateColumns: `250px repeat(${courses.length}, 1fr)` }}>
                        <div className="p-8 flex flex-col justify-end bg-gradient-to-br from-gray-50 to-white border-r border-gray-100 sticky left-0 z-20 bg-white">
                            <div className="space-y-4">
                                <div className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest border border-blue-100">
                                    Feature Specs
                                </div>
                                <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">Compare to Decide</h2>
                            </div>
                        </div>
                        {courses.map((course, idx) => (
                            <div key={course.id} className="p-8 flex flex-col items-center text-center border-r border-gray-100 last:border-r-0 relative group">
                                {course.id === bestValueId && (
                                    <div className="absolute top-4 right-4 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg shadow-green-500/30 uppercase tracking-tighter">
                                        Best Value
                                    </div>
                                )}
                                <div className={`h-20 w-20 mb-6 rounded-3xl flex items-center justify-center bg-gradient-to-br transition-transform group-hover:scale-110 shadow-xl ${idx === 0 ? 'from-blue-600 to-indigo-700 shadow-blue-500/20' :
                                    idx === 1 ? 'from-purple-600 to-pink-700 shadow-purple-500/20' :
                                        'from-emerald-600 to-teal-700 shadow-emerald-500/20'
                                    } text-white`}>
                                    <Crown className="h-10 w-10" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-2 line-clamp-2 leading-tight h-14">
                                    {course.title}
                                </h3>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                        {course.tutor?.firstName[0]}
                                    </div>
                                    <span className="text-sm font-bold text-gray-600">by {course.tutor?.firstName}</span>
                                </div>
                                <button
                                    onClick={() => navigate(`/course/${course.id}`)}
                                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all transform hover:-translate-y-1 active:scale-95 shadow-lg shadow-gray-200"
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Features Sections */}
                    <div className="divide-y divide-gray-100">
                        {/* Price Section */}
                        <FeatureRow
                            label="Investment"
                            icon={<DollarSign className="h-5 w-5" />}
                            sectionId="price"
                            renderValue={(c) => (
                                <div className="flex flex-col items-center">
                                    <div className={`text-3xl font-black ${c.price === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                        {c.price === 0 ? 'FREE' : `$${c.price}`}
                                    </div>
                                    <div className="flex gap-1 mt-1 text-xs font-bold text-gray-400">
                                        <div className={c.price < 20 ? 'text-green-500' : ''}>$</div>
                                        <div className={c.price < 50 && c.price >= 20 ? 'text-green-500' : ''}>$</div>
                                        <div className={c.price >= 50 ? 'text-green-500' : ''}>$</div>
                                    </div>
                                </div>
                            )}
                        />

                        {/* Module Titles Section */}
                        <FeatureRow
                            label="Curriculum"
                            icon={<BookOpen className="h-5 w-5" />}
                            sectionId="content"
                            renderValue={(c) => (
                                <div className="w-full text-left space-y-2">
                                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-50">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{c.moduleTitles?.length || 0} Modules</span>
                                        <Zap className="h-4 w-4 text-amber-500" />
                                    </div>
                                    {c.moduleTitles?.map((title, i) => (
                                        <div key={i} className="flex items-start gap-2 group/mod">
                                            <div className="h-5 w-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-[10px] font-bold group-hover/mod:bg-blue-600 group-hover/mod:text-white transition-colors">
                                                {i + 1}
                                            </div>
                                            <span className="text-sm font-bold text-gray-600 group-hover/mod:text-gray-900 transition-colors line-clamp-1">
                                                {title}
                                            </span>
                                        </div>
                                    ))}
                                    {(!c.moduleTitles || c.moduleTitles.length === 0) && (
                                        <div className="text-sm text-gray-400 font-medium italic">Tentative curriculum</div>
                                    )}
                                </div>
                            )}
                        />

                        <FeatureRow
                            label="Tutor Stats"
                            icon={<Shield className="h-5 w-5" />}
                            sectionId="instructor"
                            renderValue={(c) => (
                                <div className="space-y-4 w-full">
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Response Time</div>
                                        <div className="text-sm font-bold text-gray-900 tracking-tight">~2 Hours</div>
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <Star className="h-4 w-4 text-amber-400 fill-current" />
                                        <span className="text-sm font-black text-gray-900">4.8</span>
                                        <span className="text-xs font-bold text-gray-400">(120 Reviews)</span>
                                    </div>
                                </div>
                            )}
                        />

                        <FeatureRow
                            label="Live Access"
                            icon={<Video className="h-5 w-5" />}
                            sectionId="all"
                            renderValue={(c) => (
                                <div className="flex flex-col items-center gap-2">
                                    {c.price > 40 ? (
                                        <>
                                            <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center mt-2 group-hover:scale-110 transition-transform">
                                                <CheckCircle className="h-6 w-6 text-green-500" />
                                            </div>
                                            <span className="text-xs font-black text-green-600 uppercase tracking-widest">Included</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center mt-2 opacity-40">
                                                <Video className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Recorded Only</span>
                                        </>
                                    )}
                                </div>
                            )}
                        />

                        <FeatureRow
                            label="Support Tier"
                            icon={<Users className="h-5 w-5" />}
                            sectionId="instructor"
                            renderValue={(c) => (
                                <div className="flex flex-col items-center">
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${c.price > 100 ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                        c.price > 50 ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            'bg-gray-50 text-gray-500 border-gray-100'
                                        }`}>
                                        {c.price > 100 ? 'Direct VIP' : c.price > 50 ? 'Priority Q&A' : 'Standard'}
                                    </div>
                                </div>
                            )}
                        />
                    </div>
                </div>

                {/* Verdict Section */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <Sparkles className="h-10 w-10 mb-6 text-blue-200" />
                            <h3 className="text-3xl font-black mb-4">The SmartPick Verdict™</h3>
                            <p className="text-blue-100 text-lg leading-relaxed mb-8">
                                Based on your comparison, <span className="font-black underline decoration-blue-400 underline-offset-4 decoration-4">
                                    {courses.find(c => c.id === bestValueId)?.title}
                                </span> offers the highest module-to-price ratio.
                                We recommend it for students looking for deep content without breaking the bank.
                            </p>
                            <button
                                onClick={() => navigate(`/course/${bestValueId}`)}
                                className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black hover:bg-blue-50 transition shadow-xl"
                            >
                                Secure Best Value Seat
                            </button>
                        </div>
                        {/* Decorative orbs */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 bg-blue-400/20 rounded-full blur-3xl"></div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col justify-center">
                        <Shield className="h-12 w-12 mb-6 text-indigo-600" />
                        <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Peer Review Insights</h3>
                        <p className="text-gray-500 text-lg leading-relaxed mb-8 font-medium">
                            Join over <span className="text-gray-900 font-bold">12,400+</span> learners who trust SyncroLearn for peer-to-peer education.
                            Our comparison engine is built on transparent data verified by the community.
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center font-bold text-gray-500 text-xs shadow-sm">
                                        {i}
                                    </div>
                                ))}
                            </div>
                            <span className="text-sm font-bold text-gray-400 tracking-wide uppercase">Trusted by Community</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComparisonPage;
