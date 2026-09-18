import React, { useState, useEffect } from 'react';
import { getGamificationProfile } from '../services/api';
import { Trophy, Zap, Star, Award, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const GamificationOverview = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getGamificationProfile();
                setProfile(data);
            } catch (error) {
                console.error("Failed to fetch gamification profile:", error);
                // Optionally handle error state
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return null; // Or a smaller loader if preferred, but null prevents layout shifts/white screens on dashboard if it fails fast
    if (!profile) return null; // Gracefully fallback if no profile data

    if (!profile) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Points Card */}
            <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-[1.5rem] text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group"
            >
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                            <Zap className="h-6 w-6 text-yellow-300" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Learning Level</span>
                    </div>
                    <h3 className="text-[10px] font-bold opacity-60 mb-1 uppercase tracking-wider">Knowledge Points</h3>
                    <div className="text-3xl font-black tracking-tighter mb-3">{profile.points} XP</div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(profile.points % 100)}%` }}
                            className="h-full bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.5)]"
                        />
                    </div>
                    <p className="text-[10px] font-bold mt-2 opacity-60 uppercase">{100 - (profile.points % 100)} XP to Next Level</p>
                </div>
                <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Zap className="h-48 w-48" />
                </div>
            </motion.div>

            {/* Streak Card */}
            <motion.div
                whileHover={{ y: -5 }}
                className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col justify-between relative group overflow-hidden"
            >
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-50 rounded-2xl">
                            <Star className="h-6 w-6 text-orange-500 fill-current" />
                        </div>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`h-1.5 w-4 rounded-full ${i <= profile.currentStreak ? 'bg-orange-500' : 'bg-gray-100'}`} />
                            ))}
                        </div>
                    </div>
                    <h3 className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Current Streak</h3>
                    <div className="text-3xl font-black text-gray-900 tracking-tighter flex items-center gap-2">
                        {profile.currentStreak} Days
                        <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-2xl"
                        >🔥</motion.span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-wider">Keep learning to maintain your fire!</p>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                    <Star className="h-32 w-32 text-orange-500 fill-current" />
                </div>
            </motion.div>

            {/* Recent Badges */}
            <motion.div
                whileHover={{ y: -5 }}
                className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 group"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-purple-50 rounded-2xl">
                        <Trophy className="h-6 w-6 text-purple-600" />
                    </div>
                    <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                        All Badges <ChevronRight className="h-3 w-3" />
                    </button>
                </div>
                <h3 className="text-sm font-bold text-gray-400 mb-4">Recent Achievements</h3>
                <div className="flex gap-3">
                    {profile.badges && profile.badges.length > 0 ? (
                        profile.badges.slice(0, 3).map((badge, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-50 to-indigo-50 border border-purple-100 flex items-center justify-center relative group/badge"
                                title={badge.name}
                            >
                                <Award className="h-7 w-7 text-purple-600" />
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-2 px-3 rounded-lg opacity-0 group-hover/badge:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                                    <p className="font-bold">{badge.name}</p>
                                    <p className="opacity-70">{badge.description}</p>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="w-full flex flex-col items-center justify-center py-2 opacity-40">
                            <p className="text-[10px] font-black uppercase text-gray-400">No badges yet</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default GamificationOverview;
