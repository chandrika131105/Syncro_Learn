import React from 'react';
import { X, CheckCircle, Smartphone, Video, Clock, DollarSign, User, Minus, Crown, Zap, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ComparisonModal = ({ isOpen, onClose, selectedCourses }) => {
    const navigate = useNavigate();
    const [priority, setPriority] = React.useState('all');

    if (!isOpen || selectedCourses.length === 0) return null;

    // Determine Winners
    const sortedByPrice = [...selectedCourses].sort((a, b) => a.price - b.price);
    const sortedByRating = [...selectedCourses].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    const sortedByModules = [...selectedCourses].sort((a, b) => (b.modules?.length || 0) - (a.modules?.length || 0));

    const bestValueId = sortedByPrice[0]?.id;
    const topRatedId = sortedByRating[0]?.id;
    const mostComprehensiveId = sortedByModules[0]?.id;

    // Budget Fit
    const getBudgetFit = (price) => {
        if (price === 0) return 'Free';
        if (price < 20) return '$';
        if (price < 50) return '$$';
        return '$$$';
    };

    // Generate Pros & Cons
    const getProsCons = (course) => {
        const pros = [];
        const cons = [];
        if (course.price === 0) pros.push("Free Access");
        if (course.price < 20 && course.price > 0) pros.push("Very Affordable");
        if (course.averageRating >= 4.5) pros.push("Top Rated");
        if ((course.modules?.length || 0) > 10) pros.push("Deep Content");
        if (course.price > 50) pros.push("Live Support Included");

        if (course.price > 100) cons.push("Premium Price");

        const modCount = course.modules?.length || 0;
        if (modCount === 0) cons.push("No Content Yet");
        else if (modCount < 3) cons.push("Quick Overview");

        const rating = course.averageRating;
        if (!rating) pros.push("New Arrival");
        else if (rating < 4.0) cons.push("Mixed Reviews");

        // Fillers
        if (pros.length === 0) pros.push("Standard Course");

        return { pros, cons };
    };

    // Helper to determine badge
    const getBadge = (course) => {
        if (course.id === topRatedId) return { label: "🏆 Overall Winner", color: "bg-amber-100 text-amber-700 border-amber-200" };
        if (course.id === bestValueId && course.price < sortedByPrice[1]?.price) return { label: "💰 Best Value", color: "bg-green-100 text-green-700 border-green-200" };
        if (course.id === mostComprehensiveId && course.modules?.length > sortedByModules[1]?.modules?.length) return { label: "📚 Most Comprehensive", color: "bg-blue-100 text-blue-700 border-blue-200" };
        return { label: "🚀 Rising Star", color: "bg-purple-100 text-purple-700 border-purple-200" };
    };

    // Calculate Value Score
    const calculateValueScore = (course) => {
        const rating = course.averageRating || 4.2; // Mock avg if missing
        const modules = Math.max(course.modules?.length || 1, 5); // Assume at least 5 for algo balance
        const price = Math.max(course.price, 9.99); // Avoid divide by zero, floor price

        let score = (modules * rating * 2) / price;
        return Math.min(score, 10).toFixed(1); // Cap at 10
    };

    const renderFeatureRow = (icon, label, accessor, highlightType = 'neutral') => (
        <div className="grid" style={{ gridTemplateColumns: `200px repeat(${selectedCourses.length}, 1fr)` }}>
            <div className="p-4 flex items-center gap-3 font-semibold text-gray-600 border-b border-gray-50 bg-gray-50/30">
                <div className={`p-2 rounded-lg ${highlightType === 'price' ? 'bg-green-50 text-green-600' :
                    highlightType === 'rating' ? 'bg-amber-50 text-amber-500' :
                        'bg-blue-50 text-blue-500'
                    }`}>
                    {icon}
                </div>
                {label}
            </div>
            {selectedCourses.map(course => {
                const isWinner = (highlightType === 'price' && course.id === bestValueId) ||
                    (highlightType === 'rating' && course.id === topRatedId);

                // Priority Dimming logic
                const isDimmed = priority !== 'all' && (
                    (priority === 'budget' && course.id !== bestValueId) ||
                    (priority === 'quality' && course.id !== topRatedId) ||
                    (priority === 'content' && course.id !== mostComprehensiveId)
                );

                return (
                    <div key={course.id} className={`p-4 flex items-center justify-center border-b border-gray-50 text-center relative transition-all duration-300 ${isWinner ? 'bg-gradient-to-b from-yellow-50/50 to-transparent' : ''} ${isDimmed ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                        {isWinner && (priority === 'all' || !isDimmed) && (
                            <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="absolute top-2 right-2"
                            >
                                {highlightType === 'price' && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">Best Deal</span>}
                                {highlightType === 'rating' && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">Top Rated</span>}
                            </motion.div>
                        )}
                        <span className={`text-lg ${isWinner ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                            {typeof accessor === 'function' ? accessor(course) : course[accessor]}
                        </span>
                    </div>
                );
            })}
        </div>
    );

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-gray-100 flex flex-col gap-6 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                    <Zap className="h-8 w-8 text-blue-600 fill-current" />
                                    Course Showdown
                                </h2>
                                <p className="text-gray-500 mt-1">Comparing {selectedCourses.length} top-tier courses to help you decide.</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="h-6 w-6 text-gray-400" />
                            </button>
                        </div>

                        {/* Decision Helper Toggles */}
                        <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm w-fit self-center">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider px-2">Focus On:</span>
                            {[
                                { id: 'all', label: 'Overview', icon: null },
                                { id: 'budget', label: 'Budget', icon: DollarSign },
                                { id: 'quality', label: 'Quality', icon: Award },
                                { id: 'content', label: 'Content', icon: Video },
                            ].map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setPriority(p.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${priority === p.id
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                        }`}
                                >
                                    {p.icon && <p.icon className="h-4 w-4" />}
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="overflow-auto custom-scrollbar flex-1 bg-white">
                        {/* Course Headers */}
                        <div className="grid sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-gray-100 shadow-sm" style={{ gridTemplateColumns: `200px repeat(${selectedCourses.length}, 1fr)` }}>
                            <div className="p-6 flex items-end pb-4 text-gray-400 font-medium text-sm border-r border-gray-50">
                                Feature Breakdown
                            </div>
                            {selectedCourses.map((course, index) => {
                                const badge = getBadge(course);
                                return (
                                    <div key={course.id} className="p-6 flex flex-col items-center text-center border-r border-gray-50 last:border-r-0 relative">
                                        {/* Smart Badge */}
                                        <div className={`mb-3 px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 shadow-sm ${badge.color}`}>
                                            <Award className="h-3 w-3" /> {badge.label}
                                        </div>

                                        <div className={`h-16 w-16 mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br ${index === 0 ? 'from-blue-500 to-indigo-600' : index === 1 ? 'from-purple-500 to-pink-600' : 'from-emerald-500 to-teal-600'} text-white shadow-lg`}>
                                            <Award className="h-8 w-8" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 mb-1">{course.title}</h3>
                                        <p className="text-sm text-gray-500">{course.tutor?.firstName} {course.tutor?.lastName}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Features */}
                        <div className="divide-y divide-gray-50">
                            {renderFeatureRow(<Zap className="h-5 w-5" />, "Value Score", (c) => (
                                <div className="flex flex-col items-center">
                                    <span className="text-2xl font-black text-blue-600">{calculateValueScore(c)}/10</span>
                                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                                        <div className="h-full bg-blue-500" style={{ width: `${calculateValueScore(c) * 10}%` }}></div>
                                    </div>
                                </div>
                            ), 'value')}

                            {renderFeatureRow(<DollarSign className="h-5 w-5" />, "Price", (c) => (
                                <div className="flex flex-col items-center">
                                    <span className={`text-xl font-bold ${c.price === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                        {c.price === 0 ? 'Free' : `$${c.price}`}
                                    </span>
                                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded mt-1">
                                        {getBudgetFit(c.price)}
                                    </span>
                                </div>
                            ), 'price')}

                            {renderFeatureRow(<Video className="h-5 w-5" />, "Content", (c) => (
                                <div className="flex flex-col items-center">
                                    <span className="font-bold text-gray-900">{((c.modules?.length || 0) * 0.75).toFixed(1)} Hours</span>
                                    <span className="text-xs text-gray-400">{c.modules?.length || 0} Lessons</span>
                                </div>
                            ))}

                            {renderFeatureRow(<Award className="h-5 w-5" />, "Level", (c) => {
                                const level = c.price < 20 ? 'Beginner' : c.price > 50 ? 'Advanced' : 'Intermediate';
                                const colors = {
                                    'Beginner': 'bg-green-100 text-green-700 border-green-200',
                                    'Intermediate': 'bg-blue-100 text-blue-700 border-blue-200',
                                    'Advanced': 'bg-purple-100 text-purple-700 border-purple-200'
                                };
                                return (
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors[level]}`}>
                                        {level}
                                    </span>
                                );
                            })}

                            {renderFeatureRow(<Smartphone className="h-5 w-5" />, "Rating", (c) => (
                                <div className="flex items-center justify-center gap-1 text-amber-500 font-bold">
                                    <Smartphone className="h-4 w-4 fill-current" /> {c.averageRating?.toFixed(1) || 'N/A'}
                                </div>
                            ), 'rating')}

                            {renderFeatureRow(<User className="h-5 w-5" />, "Enrolled", (c) => `${Math.floor(Math.random() * 500) + 10} Students`)}

                            {/* Pros & Cons Row */}
                            {renderFeatureRow(<CheckCircle className="h-5 w-5" />, "Verdict", (c) => {
                                const { pros, cons } = getProsCons(c);
                                return (
                                    <div className="text-left text-xs space-y-2">
                                        <div className="space-y-1">
                                            {pros.map(p => (
                                                <div key={p} className="flex items-center gap-1 text-green-700 font-medium">
                                                    <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center shrink-0">✓</div>
                                                    {p}
                                                </div>
                                            ))}
                                        </div>
                                        {cons.length > 0 && (
                                            <div className="space-y-1 pt-1 border-t border-gray-100">
                                                {cons.map(c => (
                                                    <div key={c} className="flex items-center gap-1 text-red-600 font-medium opacity-80">
                                                        <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center shrink-0">×</div>
                                                        {c}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer / CTA */}
                        <div className="grid border-t border-gray-100 bg-gray-50/50" style={{ gridTemplateColumns: `200px repeat(${selectedCourses.length}, 1fr)` }}>
                            <div className="p-6"></div>
                            {selectedCourses.map(course => (
                                <div key={course.id} className="p-6">
                                    <button
                                        onClick={() => navigate(`/course/${course.id}`)}
                                        className={`w-full py-4 rounded-xl font-bold transition-all transform hover:-translate-y-1 hover:shadow-xl ${course.id === topRatedId
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20'
                                            : course.id === bestValueId
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20'
                                                : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600'
                                            }`}
                                    >
                                        Enroll Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ComparisonModal;
