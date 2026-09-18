import React, { useState, useEffect } from 'react';
import { getLeaderboard, getGamificationProfile } from '../services/api';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, User, Shield, Target, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LeaderboardPage = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [personalStats, setPersonalStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await getLeaderboard();
                setLeaderboard(data);

                // Also fetch personal stats for context
                const profile = await getGamificationProfile();
                setPersonalStats(profile);
            } catch (error) {
                console.error("Failed to load leaderboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return <Trophy className="h-8 w-8 text-yellow-500 fill-current animate-pulse" />;
            case 2: return <Medal className="h-7 w-7 text-gray-400 fill-current" />;
            case 3: return <Medal className="h-6 w-6 text-amber-700 fill-current" />;
            default: return <span className="text-gray-500 font-bold text-lg w-8 text-center">{rank}</span>;
        }
    };

    const getRankStyle = (rank) => {
        switch (rank) {
            case 1: return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 shadow-yellow-100 scale-105 z-10";
            case 2: return "bg-gray-50 border-gray-200";
            case 3: return "bg-orange-50 border-orange-200";
            default: return "bg-white border-gray-100";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Split top 3
    const top3 = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <div className="bg-indigo-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-800 opacity-90"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Hall of Fame</h1>
                        <p className="text-indigo-100 text-lg max-w-2xl mx-auto font-medium">
                            Compete with top learners worldwide. Earn XP by completing quizzes and courses to climb the ranks!
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">

                {/* Podium View (Top 3) */}
                {top3.length > 0 && (
                    <div className="flex justify-center items-end gap-4 mb-12 h-64">
                        {/* 2nd Place */}
                        {top3[1] && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="w-1/3 max-w-[180px] bg-white rounded-t-2xl shadow-lg border-t-4 border-gray-300 flex flex-col items-center p-4 relative h-48 justify-end pb-6"
                            >
                                <div className="absolute -top-6">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-white shadow flex items-center justify-center font-bold text-gray-600 text-xl">
                                        {top3[1].avatarUrl ? <img src={top3[1].avatarUrl} className="w-full h-full rounded-full" /> : top3[1].firstName.charAt(0)}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <Medal className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="font-bold text-gray-800 truncate w-full px-2">{top3[1].firstName}</p>
                                    <p className="text-sm text-gray-500 font-mono">{top3[1].points} XP</p>
                                </div>
                            </motion.div>
                        )}

                        {/* 1st Place */}
                        {top3[0] && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-1/3 max-w-[200px] bg-white rounded-t-2xl shadow-xl border-t-4 border-yellow-400 flex flex-col items-center p-4 relative h-64 justify-end pb-8 z-10"
                            >
                                <div className="absolute -top-10">
                                    <div className="w-20 h-20 rounded-full bg-yellow-100 border-4 border-white shadow-lg flex items-center justify-center font-bold text-yellow-700 text-3xl relative">
                                        {top3[0].avatarUrl ? <img src={top3[0].avatarUrl} className="w-full h-full rounded-full" /> : top3[0].firstName.charAt(0)}
                                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-white p-1 rounded-full"><Trophy className="h-4 w-4" /></div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-yellow-600 font-bold mb-1 text-xs tracking-wider uppercase">Champion</p>
                                    <p className="font-extrabold text-xl text-gray-900 truncate w-full px-2">{top3[0].firstName} {top3[0].lastName}</p>
                                    <p className="text-lg text-indigo-600 font-black font-mono mt-1">{top3[0].points} XP</p>
                                    <div className="mt-2 flex items-center justify-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                                        <Award className="h-3 w-3" /> {top3[0].badgesCount} Badges
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 3rd Place */}
                        {top3[2] && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="w-1/3 max-w-[180px] bg-white rounded-t-2xl shadow-lg border-t-4 border-orange-300 flex flex-col items-center p-4 relative h-40 justify-end pb-6"
                            >
                                <div className="absolute -top-6">
                                    <div className="w-12 h-12 rounded-full bg-orange-100 border-2 border-white shadow flex items-center justify-center font-bold text-orange-700 text-xl">
                                        {top3[2].avatarUrl ? <img src={top3[2].avatarUrl} className="w-full h-full rounded-full" /> : top3[2].firstName.charAt(0)}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <Medal className="h-8 w-8 text-orange-700 mx-auto mb-2" />
                                    <p className="font-bold text-gray-800 truncate w-full px-2">{top3[2].firstName}</p>
                                    <p className="text-sm text-gray-500 font-mono">{top3[2].points} XP</p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* List View (Rest) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">Top Challengers</h3>
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Weekly Standings</span>
                    </div>

                    {rest.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {rest.map((user, idx) => (
                                <motion.div
                                    key={user.userId}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-400 font-bold w-6 text-center">{user.rank}</span>
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                                            {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full rounded-full" /> : user.firstName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>Level {Math.floor(user.points / 1000) + 1}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> {user.badgesCount} Badges</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-mono font-bold text-indigo-600 block">{user.points} XP</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No other challengers yet. Be the first to climb the ranks!
                        </div>
                    )}
                </div>

                {/* User's Own Rank (Sticky or Highlight) - Only if stats loaded and not in list? */}
                {/* For simplicity we assume user is in the top 10 or sees themselves separately here later */}
                {personalStats && (
                    <div className="mt-8 bg-indigo-900 rounded-2xl p-6 text-white flex items-center justify-between shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-xl">
                                <User />
                            </div>
                            <div>
                                <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider">Your Stats</p>
                                <p className="font-bold text-lg">Current XP: {personalStats.points}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <button onClick={() => navigate('/dashboard')} className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                                Back to Learning
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardPage;
