import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, ArrowRight, Star, Users, Globe } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-blue-100">
            {/* Navbar */}
            <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                SyncroLearn
                            </span>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="text-gray-600 hover:text-blue-600 font-medium px-4 py-2 transition-colors"
                            >
                                Log in
                            </button>
                            <button
                                onClick={() => navigate('/signup')}
                                className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-blue-700 font-medium text-sm mb-6 border border-blue-100">
                            <Star className="h-4 w-4 fill-blue-700" />
                            <span>Voted #1 Platform for Peer Learning</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
                            Master any subject <br />
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                with expert tutors.
                            </span>
                        </h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                            SyncroLearn connects ambitious students with world-class educators.
                            Start your journey today and unlock unlimited potential.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                onClick={() => navigate('/signup')}
                                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                            >
                                Start Learning Now <ArrowRight className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition flex items-center justify-center"
                            >
                                Browse Courses
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-3xl opacity-30"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-3xl opacity-30"></div>
                    <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-30"></div>
                </div>
            </div>

            {/* Features Preview */}
            <div className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Users, title: "Expert Tutors", desc: "Learn from industry professionals and experienced mentors." },
                            { icon: Globe, title: "Learn Anywhere", desc: "Access your courses from any device, anytime, anywhere." },
                            { icon: CheckCircle, title: "Certified Learning", desc: "Earn certificates upon completion to showcase your skills." }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                            >
                                <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                                    <feature.icon className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
