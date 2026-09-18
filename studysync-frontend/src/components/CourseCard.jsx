import React from 'react';
import { BookOpen, Star, User, ArrowRight, Heart, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';

const CourseCard = ({ course, onToggleCompare, isSelectedForCompare, isWishlisted: propIsWishlisted, onWishlistChange }) => {
    const { isWishlisted, toggleWishlist } = useWishlist(course.id, propIsWishlisted, onWishlistChange);
    const navigate = useNavigate();

    return (
        <motion.div
            whileHover={{ y: -4 }}
            onClick={() => navigate(`/course/${course.id}`)}
            className={`group bg-white rounded-2xl shadow-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden border ${isSelectedForCompare ? 'border-blue-600 ring-2 ring-blue-500/10' : 'border-gray-50/50'} flex flex-col h-full relative cursor-pointer`}
        >
            {/* Thumbnail Area - Ultra Compact */}
            <div className={`h-32 relative overflow-hidden ${course.thumbnail ? '' : 'bg-gradient-to-br from-indigo-700 via-blue-600 to-purple-800'}`}>
                {course.thumbnail ? (
                    <div className="w-full h-full group-hover:scale-105 transition-transform duration-500">
                        <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.parentElement.style.display = 'none';
                                e.target.parentElement.parentElement.classList.add('bg-gradient-to-br', 'from-indigo-700', 'via-blue-600', 'to-purple-800');
                            }}
                        />
                    </div>
                ) : (
                    <>
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-white/10 group-hover:scale-110 transition-all duration-500">
                            <BookOpen className="h-12 w-12" />
                        </div>
                    </>
                )}

                {/* Price Tag - Minimal */}
                <div className="absolute top-2.5 right-2.5 backdrop-blur-md bg-black/50 border border-white/20 px-2.5 py-0.5 rounded-lg text-[10px] font-black text-white shadow-lg">
                    {course.price === 0 ? 'FREE' : `$${course.price}`}
                </div>

                {/* Wishlist Button - Minimal */}
                <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(); }}
                    className={`absolute top-2.5 left-2.5 p-1.5 rounded-lg shadow-lg backdrop-blur-md transition-all duration-300 ${isWishlisted ? 'bg-pink-500 text-white' : 'bg-white/20 text-white hover:bg-white hover:text-pink-500 border border-white/20'}`}
                >
                    <Heart className={`h-3 w-3 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>

                {/* Compare Tag - Minimal */}
                {onToggleCompare && (
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleCompare(course);
                        }}
                        className={`absolute bottom-2.5 right-2.5 px-2 py-1 rounded-md shadow-xl backdrop-blur-md border transition-all duration-300 flex items-center gap-1 group/compare ${isSelectedForCompare ? 'bg-blue-600 text-white border-blue-400' : 'bg-black/40 text-white border-white/10 hover:bg-black/60'}`}
                    >
                        <div className={`h-2.5 w-2.5 rounded border flex items-center justify-center transition-colors ${isSelectedForCompare ? 'bg-white border-white' : 'border-white/40 bg-transparent'}`}>
                            {isSelectedForCompare && <CheckCircle className="h-2 w-2 text-blue-600" />}
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest">Compare</span>
                    </div>
                )}
            </div>

            {/* Course Details - Tightened */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[7px] uppercase tracking-[0.1em] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100/50">
                        {course.category || 'SKILL'}
                    </span>
                    <div className="flex items-center text-amber-500 text-[9px] font-black">
                        <Star className="h-2.5 w-2.5 fill-current mr-0.5" />
                        <span>{course.averageRating?.toFixed(1) || 'NEW'}</span>
                    </div>
                </div>

                <h3 className="text-xs font-black text-gray-900 mb-1.5 line-clamp-2 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                    {course.title}
                </h3>

                <p className="text-gray-500 text-[10px] mb-4 line-clamp-2 leading-snug">
                    {course.description || "Comprehensive learning experience designed for absolute mastery."}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
                    <div className="flex items-center">
                        <div className="h-6 w-6 rounded bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-[8px]">
                            {(course.tutor?.firstName?.[0] || 'T')}
                        </div>
                        <div className="ml-2 flex flex-col">
                            <span className="text-[10px] text-gray-900 font-bold truncate max-w-[80px]">
                                {course.tutor?.firstName || "Tutor"}
                            </span>
                        </div>
                    </div>

                    <div className="p-1 rounded text-gray-400 group-hover:text-blue-600 transition-all">
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CourseCard;
