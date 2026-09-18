import React from 'react';
import { motion } from 'framer-motion';
import { Award, Clock, Flame, Target, BookOpen, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const StudentAnalytics = ({ enrollments, activityData = [] }) => {
    // Calculate stats
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.progress === 100).length;
    const inProgress = totalCourses - completedCourses;

    // Mock stats
    const hoursSpent = enrollments.reduce((acc, curr) => acc + (curr.progress * 0.5), 0).toFixed(1); // Rough estimate

    // Data for charts
    const pieData = [
        { name: 'Completed', value: completedCourses },
        { name: 'In Progress', value: inProgress },
    ];
    const COLORS = ['#10B981', '#3B82F6']; // Tailwind Green-500, Blue-500

    // Generate Heatmap Data (Real Dates)
    const heatmapData = React.useMemo(() => {
        const days = 35; // Show last 5 weeks
        const data = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

            const activity = activityData.find(a => a.activityDate === dateStr);
            const count = activity ? activity.count : 0;

            let level = 0;
            if (count > 0) level = 1;
            if (count >= 5) level = 2;
            if (count >= 10) level = 3;

            data.push({ date: dateStr, count, level });
        }
        return data;
    }, [activityData]);

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{totalCourses}</div>
                        <div className="text-sm text-gray-500">Enrolled Courses</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{completedCourses}</div>
                        <div className="text-sm text-gray-500">Completed</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{hoursSpent}h</div>
                        <div className="text-sm text-gray-500">Learning Time</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                        <Target className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">85%</div>
                        <div className="text-sm text-gray-500">Weekly Goal</div>
                    </div>
                </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Progress List */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-6">Course Progress</h3>
                    {enrollments.length > 0 ? (
                        <div className="space-y-8">
                            {enrollments.map(enrollment => (
                                <div key={enrollment.id}>
                                    <div className="flex justify-between mb-2 items-end">
                                        <div>
                                            <h4 className="font-bold text-gray-900">{enrollment.courseTitle}</h4>
                                            <p className="text-xs text-gray-400">Last accessed: {enrollment.lastAccessed ? new Date(enrollment.lastAccessed).toLocaleDateString() : 'Never'}</p>
                                        </div>
                                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-sm">{enrollment.progress}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${enrollment.progress}%` }}
                                        />
                                    </div>
                                    {enrollment.progress === 100 && (
                                        <button className="mt-2 text-xs font-bold text-green-600 flex items-center gap-1 hover:underline">
                                            <Award className="h-3 w-3" /> Download Certificate
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            No enrollments yet. Start learning to see analytics!
                        </div>
                    )}
                </div>

                {/* Activity Heatmap / Goals */}
                <div className="space-y-6">
                    {/* Progress Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-64">
                        <h3 className="font-bold text-lg mb-4 text-gray-800">Learning Distribution</h3>
                        <div className="h-48 w-full">
                            {totalCourses > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                    No chart data
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Flame className="h-5 w-5 text-orange-500" /> Learning Streak
                        </h3>
                        <div className="grid grid-cols-7 gap-2">
                            {heatmapData.map((day, i) => (
                                <div
                                    key={i}
                                    className="group relative"
                                >
                                    <div
                                        className={`aspect-square rounded-sm transition-colors hover:ring-2 ring-offset-1 ring-blue-200 cursor-pointer ${day.level === 0 ? 'bg-gray-100' :
                                            day.level === 1 ? 'bg-green-200' :
                                                day.level === 2 ? 'bg-green-400' : 'bg-green-600'
                                            }`}
                                    />
                                    {/* Custom Tooltip */}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                                        <div className="font-semibold">
                                            {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="text-gray-300 text-[10px] text-center">
                                            {day.count} activities
                                        </div>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-4 px-1">
                            <span>Less</span>
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-100 rounded-sm"></span>
                                <span className="w-2 h-2 bg-green-200 rounded-sm"></span>
                                <span className="w-2 h-2 bg-green-400 rounded-sm"></span>
                                <span className="w-2 h-2 bg-green-600 rounded-sm"></span>
                            </div>
                            <span>More</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
                        <h3 className="font-bold text-lg mb-2">Weekly Goal</h3>
                        <p className="text-white/80 text-sm mb-4">You've reached 85% of your weekly learning goal. Keep it up!</p>
                        <div className="w-full bg-white/20 rounded-full h-2">
                            <div className="bg-white h-full rounded-full w-[85%]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default StudentAnalytics;
