import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { verifyCertificate } from '../services/api';
import { Search, CheckCircle, XCircle, Award, Calendar, User, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VerifyCertificate = () => {
    const { code: urlCode } = useParams();
    const [code, setCode] = useState(urlCode || '');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (urlCode) {
            verify(urlCode);
        }
    }, [urlCode]);

    const verify = async (certificateCode) => {
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await verifyCertificate(certificateCode.trim());
            setResult(data);
        } catch (err) {
            setError('Certificate not found. Please check the ID and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        verify(code);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center">
                    <Award className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
                    <h1 className="text-2xl font-bold mb-2">Verify Certificate</h1>
                    <p className="text-blue-100 text-sm">Enter the certificate ID to verify authenticity.</p>
                </div>

                <div className="p-6">
                    <form onSubmit={handleVerify} className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="e.g. 550e8400-e29b..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !code}
                            className={`mt-4 w-full py-3 rounded-xl font-bold text-white transition-all shadow-md ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                                }`}
                        >
                            {loading ? 'Verifying...' : 'Verify Now'}
                        </button>
                    </form>

                    <AnimatePresence mode="wait">
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-green-50 border border-green-100 rounded-xl p-6 text-center"
                            >
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-lg font-bold text-green-800 mb-1">Valid Certificate</h3>
                                <p className="text-xs text-green-600 mb-4 uppercase tracking-wider font-semibold">Official Record Found</p>

                                <div className="space-y-3 text-left bg-white p-4 rounded-lg border border-green-100 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500">Student Name</p>
                                            <p className="font-semibold text-gray-800">{result.user?.firstName} {result.user?.lastName}</p>
                                        </div>
                                    </div>
                                    <div className="h-px bg-gray-100" />
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500">Course Completed</p>
                                            <p className="font-semibold text-gray-800">{result.course?.title}</p>
                                        </div>
                                    </div>
                                    <div className="h-px bg-gray-100" />
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500">Issue Date</p>
                                            <p className="font-semibold text-gray-800">
                                                {new Date(result.issueDate).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-red-50 border border-red-100 rounded-xl p-6 text-center"
                            >
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <XCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-bold text-red-800 mb-1">Invalid ID</h3>
                                <p className="text-red-600 text-sm">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                    <p className="text-xs text-gray-400">SyncroLearn Credential Verification System</p>
                </div>
            </div>
        </div>
    );
};

export default VerifyCertificate;
