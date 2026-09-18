import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import { motion } from 'framer-motion';
import { Lock, Mail, User, Loader2, ArrowRight, GraduationCap } from 'lucide-react';

const Signup = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'STUDENT'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-white">
            {/* Left Side - Visuals */}
            <div className="hidden lg:flex w-1/2 bg-indigo-900 relative overflow-hidden items-center justify-center p-12">
                {/* Abstract Background Shapes */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900"></div>
                <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 text-white max-w-lg"
                >
                    <div className="mb-8 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                        <GraduationCap className="h-5 w-5 text-purple-300" />
                        <span className="font-medium text-purple-50">Join SyncroLearn Today</span>
                    </div>
                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        Start Your Learning Journey
                    </h1>
                    <p className="text-xl text-indigo-100 leading-relaxed">
                        Create an account to access premium courses, mentor support, and a community that helps you grow.
                    </p>

                    {/* Floating Abstract Shapes */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ delay: 0.5, duration: 2 }}
                        className="absolute -z-10 -bottom-20 -right-20 w-96 h-96 bg-purple-500 rounded-full blur-[100px]"
                    />
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ delay: 0.8, duration: 2 }}
                        className="absolute -z-10 top-20 -left-20 w-72 h-72 bg-blue-500 rounded-full blur-[80px]"
                    />
                </motion.div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full max-w-md py-8"
                >
                    <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                            <p className="text-gray-500">Sign up to get started</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center">
                                <span className="mr-2">⚠️</span> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="Min 8 characters"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="text-sm font-semibold text-gray-700 block mb-3">I want to join as a:</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center transition-all ${formData.role === 'STUDENT' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="STUDENT"
                                            checked={formData.role === 'STUDENT'}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <User className={`h-6 w-6 mb-2 ${formData.role === 'STUDENT' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                        <span className="font-semibold">Student</span>
                                    </label>

                                    <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center transition-all ${formData.role === 'TUTOR' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="TUTOR"
                                            checked={formData.role === 'TUTOR'}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <GraduationCap className={`h-6 w-6 mb-2 ${formData.role === 'TUTOR' ? 'text-purple-600' : 'text-gray-400'}`} />
                                        <span className="font-semibold">Tutor</span>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5 mt-6 flex items-center justify-center"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <span className="flex items-center">
                                        Create Account <ArrowRight className="ml-2 h-5 w-5" />
                                    </span>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-500">
                                Already have an account?{' '}
                                <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Signup;
