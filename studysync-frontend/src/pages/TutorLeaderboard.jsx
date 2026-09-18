import React, { useState, useEffect } from 'react';
import { getTutorLeaderboard } from '../services/api';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Users, Crown } from 'lucide-react';

const TutorLeaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const fetchLeaderboard = async () => {
            try {
                const data = await getTutorLeaderboard();
                setLeaderboard(data);
            } catch (error) {
                console.error("Failed to load tutor leaderboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return <Crown className="h-6 w-6 text-yellow-500 fill-current" />;
            case 2: return <Medal className="h-6 w-6 text-gray-400 fill-current" />;
            case 3: return <Medal className="h-6 w-6 text-amber-700 fill-current" />;
            default: return <span className="font-bold text-gray-400 w-6 text-center">{rank}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex font-sans">
            <Sidebar activeTab="tutor-leaderboard" userRole="TUTOR" user={user} setActiveTab={() => { }} />

            <div className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-gray-100 px-8 py-5 sticky top-0 z-10 backdrop-blur-md bg-white/80">
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-yellow-500" /> Top Instructors
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Celebrating our most impactful educators based on student enrollments.</p>
                </header>

                <main className="max-w-5xl mx-auto px-8 py-8">

                    {/* Top 3 Metric Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {leaderboard.slice(0, 3).map((tutor, idx) => (
                            <motion.div
                                key={tutor.tutorId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`bg-white p-6 rounded-2xl border flex flex-col items-center text-center shadow-lg ${idx === 0 ? 'border-yellow-400 shadow-yellow-100 transform scale-105 z-10' :
                                        idx === 1 ? 'border-gray-200' : 'border-orange-200'
                                    }`}
                            >
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mb-4 border-4 ${idx === 0 ? 'bg-yellow-50 border-yellow-200 text-yellow-600' :
                                        idx === 1 ? 'bg-gray-50 border-gray-200 text-gray-500' :
                                            'bg-orange-50 border-orange-200 text-orange-600'
                                    }`}>
                                    {tutor.firstName.charAt(0)}
                                    <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                                        {idx === 0 ? <Crown className="h-6 w-6 text-yellow-500 fill-current" /> :
                                            idx === 1 ? <Medal className="h-6 w-6 text-gray-400 fill-current" /> :
                                                <Medal className="h-6 w-6 text-amber-700 fill-current" />}
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg mb-1">{tutor.firstName} {tutor.lastName}</h3>
                                <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold mb-2">
                                    <Users className="h-3 w-3" /> {tutor.totalStudents} Students
                                </div>
                                <div className="text-xs text-gray-400 font-medium">Top Rated Instructor</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Full List */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700">Instructor Rankings</h3>
                            <span className="text-xs text-gray-500 font-medium uppercase">By Total Reach</span>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full mx-auto"></div></div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {leaderboard.map((tutor) => (
                                    <div key={tutor.tutorId} className={`p-4 hover:bg-gray-50 transition-colors flex items-center justify-between ${user?.id === tutor.tutorId ? 'bg-blue-50/50' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 flex justify-center">
                                                {getRankIcon(tutor.rank)}
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-sm">
                                                {tutor.firstName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                                    {tutor.firstName} {tutor.lastName}
                                                    {user?.id === tutor.tutorId && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded uppercase tracking-wide">You</span>}
                                                </p>
                                                <p className="text-xs text-gray-400">Instructor</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-black text-gray-900">{tutor.totalStudents}</span>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Students</span>
                                        </div>
                                    </div>
                                ))}
                                {leaderboard.length === 0 && (
                                    <div className="p-8 text-center text-gray-400">No data available yet.</div>
                                )}
                            </div>
                        )}
                    </div>

                </main>
            </div>
        </div>
    );
};

export default TutorLeaderboard;
