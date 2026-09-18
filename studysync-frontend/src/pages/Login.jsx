import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { login } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Sparkles, User, GraduationCap, ArrowLeft, CheckCircle2, Clock, Shield } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [role, setRole] = useState(null); // 'STUDENT' or 'TUTOR'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const isExpired = searchParams.get('expired') === 'true';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userData = await login(formData.email, formData.password);

            // Check if the user's role matches the selected role
            if (role && userData.role !== role) {
                localStorage.removeItem('token'); // Clear the invalid session
                localStorage.removeItem('user');
                setError(`Access denied. You are not registered as a ${role.toLowerCase()}.`);
                setLoading(false);
                return;
            }

            // Force reload to update global App state (user role, maintenance check)
            if (userData.role === 'ADMIN') {
                window.location.href = '/admin-dashboard';
            } else {
                window.location.href = '/dashboard';
            }
        } catch (err) {
            console.error(err);
            setError('Invalid email or password. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-white font-sans">
            {/* Left Side - Visuals */}
            <div className="hidden lg:flex w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center p-12">
                {/* Abstract Background Shapes */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-800"></div>
                <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 text-white max-w-lg"
                >
                    <div className="mb-8 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                        <Sparkles className="h-5 w-5 text-yellow-300" />
                        <span className="font-medium text-blue-50">Welcome Back to SyncroLearn</span>
                    </div>
                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        Unlock Your Potential with Expert Tutors
                    </h1>
                    <p className="text-xl text-blue-100 leading-relaxed">
                        Join our community of learners and educators. Access world-class courses and take your skills to the next level.
                    </p>

                    {/* Floating Cards Animation */}
                    <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-30">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                            className="w-full h-full rounded-full border-[2px] border-dashed border-white/30"
                        />
                    </div>
                </motion.div>

                {/* Decorative Circles */}
                <div className="absolute top-10 right-10 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-10 left-10 w-48 h-48 bg-blue-400 rounded-full blur-3xl opacity-50"></div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md min-h-[500px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {!role ? (
                            /* Step 1: Role Selection */
                            <motion.div
                                key="role-selection"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100"
                            >
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Hello! 👋</h2>
                                    <p className="text-gray-500">Please choose how you want to log in</p>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => setRole('STUDENT')}
                                        className="w-full group relative p-6 border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 flex items-center text-left"
                                    >
                                        <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                            <User className="h-7 w-7 text-blue-600" />
                                        </div>
                                        <div className="ml-5">
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700">I am a Student</h3>
                                            <p className="text-sm text-gray-500">Looking to learn and explore courses</p>
                                        </div>
                                        <div className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight className="h-5 w-5 text-blue-600" />
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setRole('TUTOR')}
                                        className="w-full group relative p-6 border-2 border-gray-100 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-200 flex items-center text-left"
                                    >
                                        <div className="h-14 w-14 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                                            <GraduationCap className="h-7 w-7 text-indigo-600" />
                                        </div>
                                        <div className="ml-5">
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-700">I am a Tutor</h3>
                                            <p className="text-sm text-gray-500">Want to create courses and teach</p>
                                        </div>
                                        <div className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight className="h-5 w-5 text-indigo-600" />
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setRole('ADMIN')}
                                        className="w-full group relative p-6 border-2 border-gray-100 rounded-2xl hover:border-rose-500 hover:bg-rose-50/50 transition-all duration-200 flex items-center text-left"
                                    >
                                        <div className="h-14 w-14 bg-rose-100 rounded-full flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                                            <Shield className="h-7 w-7 text-rose-600" />
                                        </div>
                                        <div className="ml-5">
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-rose-700">I am an Admin</h3>
                                            <p className="text-sm text-gray-500">Manage users and content</p>
                                        </div>
                                        <div className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight className="h-5 w-5 text-rose-600" />
                                        </div>
                                    </button>
                                </div>

                                <p className="mt-8 text-center text-sm text-gray-400">
                                    Step 1 of 2
                                </p>
                            </motion.div>
                        ) : (
                            /* Step 2: Login Form */
                            <motion.div
                                key="login-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100"
                            >
                                <button
                                    onClick={() => setRole(null)}
                                    className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Role Selection
                                </button>

                                <div className="mb-8 text-center">
                                    <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 ${role === 'STUDENT' ? 'bg-blue-100 text-blue-600' : role === 'TUTOR' ? 'bg-indigo-100 text-indigo-600' : 'bg-rose-100 text-rose-600'}`}>
                                        {role === 'STUDENT' ? <User className="h-8 w-8" /> : role === 'TUTOR' ? <GraduationCap className="h-8 w-8" /> : <Shield className="h-8 w-8" />}
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {role === 'STUDENT' ? 'Student Login' : role === 'TUTOR' ? 'Instructor Login' : 'Admin Login'}
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-1">Enter your credentials to continue</p>
                                </div>

                                {isExpired && !error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-700"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                            <Clock className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Session Expired</p>
                                            <p className="text-xs opacity-80">For your security, please log in again to continue.</p>
                                        </div>
                                    </motion.div>
                                )}

                                {error && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-lg flex items-center border border-red-100"
                                    >
                                        <span className="mr-2">⚠️</span> {error}
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full text-white font-semibold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center ${role === 'STUDENT'
                                            ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                                            : role === 'TUTOR'
                                                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'
                                                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30'
                                            }`}
                                    >
                                        {loading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <span className="flex items-center">
                                                Sign In <ArrowRight className="ml-2 h-5 w-5" />
                                            </span>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-8 text-center text-sm">
                                    <p className="text-gray-500">
                                        Don't have an account?{' '}
                                        <span
                                            onClick={() => navigate('/signup')}
                                            className="text-blue-600 font-semibold cursor-pointer hover:underline"
                                        >
                                            Create Account
                                        </span>
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Login;
