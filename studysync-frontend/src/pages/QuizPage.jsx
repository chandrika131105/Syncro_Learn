import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById } from '../services/api';
import QuizPlayer from '../components/QuizPlayer';
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const QuizPage = () => {
    const { courseId, moduleId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState(null);
    const [module, setModule] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const courseData = await getCourseById(courseId);
                setCourse(courseData);
                const activeModule = courseData.modules.find(m => m.id === Number(moduleId));
                setModule(activeModule);
            } catch (error) {
                console.error("Failed to load quiz content", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [courseId, moduleId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 uppercase tracking-tighter">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold">Loading your assessment...</p>
                </div>
            </div>
        );
    }

    if (!module || !module.quiz) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center max-w-md">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Not Found</h2>
                    <p className="text-gray-500 mb-6">We couldn't find the requested quiz for this module.</p>
                    <button
                        onClick={() => navigate(`/course/${courseId}`)}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                    >
                        Back to Course
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050816] relative overflow-hidden flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8 font-sans">
            {/* Animated Immersive Background Elements */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                    opacity: [0.2, 0.3, 0.2]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/30 rounded-full blur-[140px] pointer-events-none"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, -120, 0],
                    opacity: [0.15, 0.25, 0.15]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/30 rounded-full blur-[140px] pointer-events-none"
            />
            <motion.div
                animate={{
                    y: [-100, 100, -100],
                    opacity: [0.05, 0.1, 0.05]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-purple-600/20 rounded-full blur-[160px] pointer-events-none"
            />

            <div className="max-w-[1400px] w-full relative z-10 flex flex-col h-full max-h-[95vh]">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex items-center justify-between"
                >
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate(`/course/${courseId}`)}
                            className="group flex items-center text-blue-400/80 hover:text-blue-400 transition-all text-[10px] font-black bg-blue-500/10 p-2 rounded-xl border border-blue-500/20 active:scale-95"
                            title="Back to Lesson"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>

                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none mb-1">
                                {course.title}
                            </h1>
                            <div className="flex items-center gap-2 text-blue-400/50 text-[10px] uppercase font-black tracking-widest">
                                <BookOpen className="h-3 w-3" />
                                <span>{module.title}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="relative group flex-1 flex flex-col min-h-0">
                    <div className="absolute inset-0 bg-blue-600/5 blur-3xl group-hover:bg-blue-600/10 transition-colors duration-500 pointer-events-none" />
                    <QuizPlayer
                        quiz={module.quiz}
                        onComplete={() => navigate(`/course/${courseId}`)}
                    />
                </div>
            </div>
        </div>
    );
};

export default QuizPage;
