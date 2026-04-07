import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import { BookOpen, Video, Calendar, Settings, Award, X, Star, Clock } from 'lucide-react'; // Added Clock
import { Link } from 'react-router-dom';
import { isSessionRealTime } from '../utils/dateUtils';

import SkillForm from '../components/SkillForm';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [mySkills, setMySkills] = useState([]);
    const [recommendedSkills, setRecommendedSkills] = useState([]);
    const [certificateCount, setCertificateCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showSkillForm, setShowSkillForm] = useState(false);

    const smoothEase = [0.22, 1, 0.36, 1]; // Added smoothEase

    const containerVariants = { // Added containerVariants
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = { // Added itemVariants
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        show: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: 0.8, ease: smoothEase }
        }
    };

    // Helper for robust ID comparison
    const compareIds = (id1, id2) => {
        if (!id1 || !id2) return false;
        const s1 = id1._id ? id1._id.toString() : id1.toString();
        const s2 = id2._id ? id2._id.toString() : id2.toString();
        return s1 === s2;
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const fetchProfile = async () => {
                try {
                    const res = await api.get('/api/users/profile');
                    setUser(res.data);
                    console.log("✅ Profile Loaded:", res.data.name);
                } catch (e) { console.error("❌ Profile Fetch Failed", e); }
            };

            const fetchBookings = async () => {
                try {
                    const res = await api.get('/api/bookings');
                    setSessions(res.data);
                    console.log("✅ Bookings Loaded:", res.data.length);
                } catch (e) { console.error("❌ Bookings Fetch Failed", e); }
            };

            const fetchSkills = async () => {
                try {
                    const res = await api.get('/api/skills/mine/all');
                    setMySkills(res.data || []);
                    console.log("✅ Owned Skills Loaded:", res.data?.length);
                } catch (e) { console.error("❌ Skills Fetch Failed", e); }
            };

            const fetchCerts = async () => {
                try {
                    const res = await api.get('/api/certificate');
                    setCertificateCount(res.data.length || 0);
                } catch (e) { console.error("❌ Certificates Fetch Failed", e); }
            };

            await Promise.all([fetchProfile(), fetchBookings(), fetchSkills(), fetchCerts()]);
            setLoading(false);
        } catch (err) {
            console.error("Dashboard Global Error:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) return <div className="pt-24 text-center text-gray-500 font-medium">Loading your dashboard...</div>;

    return (
        <div className="pt-24 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name || 'User'}</h1>
                    <p className="text-gray-500">Track your learning progress and upcoming sessions.</p>
                </div>
                {user && (
                    <div className="bg-gray-100 px-4 py-2 rounded-xl text-[10px] text-gray-400 font-mono">
                        UID: {user._id || user.id} | {user.email}
                    </div>
                )}
            </header>

            {/* Live Now Banner - Only shows for sessions happening RIGHT NOW */}
            {sessions.some(s => isSessionRealTime(s)) && (
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-10 p-6 bg-gradient-to-r from-red-600 to-rose-500 rounded-3xl text-white flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl shadow-red-200"
                >
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-4 h-4 bg-white rounded-full animate-ping absolute inset-0"></div>
                            <div className="w-4 h-4 bg-white rounded-full relative"></div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">You have live sessions today!</h2>
                            <p className="text-red-100 opacity-90">Join your mentors and start learning in real-time.</p>
                        </div>
                    </div>
                    {/* Prioritize teaching session in the banner if user is the teacher */}
                    <Link
                        to={`/video?bookingId=${sessions.find(s => isSessionRealTime(s) && compareIds(s.teacher, user?._id || user?.id))?._id ||
                            sessions.find(s => isSessionRealTime(s))?._id
                            }`}
                        className="px-8 py-3 bg-white text-red-600 rounded-2xl font-bold hover:bg-red-50 transition-all flex items-center gap-2"
                    >
                        <Video size={20} />
                        Join Live Now
                    </Link>
                </motion.div>
            )}

            {/* Stats Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
                <motion.div variants={itemVariants} whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.4, ease: smoothEase }}>
                    <StatCard
                        icon={<BookOpen className="text-blue-500" />}
                        title="Sessions Booked"
                        value={sessions.filter(s => compareIds(s.student, user?._id || user?.id)).length}
                    />
                </motion.div>
                <motion.div variants={itemVariants} whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.4, ease: smoothEase }}>
                    <StatCard
                        icon={<Video className="text-violet-500" />}
                        title="Live Classes"
                        value={sessions.filter(s =>
                            ['confirmed', 'accepted'].includes(s.status) &&
                            (compareIds(s.student, user?._id || user?.id) || compareIds(s.teacher, user?._id || user?.id)) &&
                            (new Date(s.date).toDateString() === new Date().toDateString() || new Date(s.date) > new Date()) // Only today or future
                        ).length}
                    />
                </motion.div>
                <motion.div variants={itemVariants} whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.4, ease: smoothEase }}>
                    <StatCard
                        icon={<Settings className="text-green-500" />}
                        title="Completed Skills"
                        value={sessions.filter(s => s.status === 'completed' && compareIds(s.student, user?._id || user?.id)).length}
                    />
                </motion.div>
                <motion.div variants={itemVariants} whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.4, ease: smoothEase }}>
                    <StatCard
                        icon={<Clock className="text-orange-500" />}
                        title="Pending Requests"
                        value={sessions.filter(s => s.status === 'pending').length}
                    />
                </motion.div>
            </motion.div>

            {/* Recommended Skills Section */}
            {recommendedSkills.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-violet-50 rounded-3xl p-8 shadow-sm border border-blue-100 mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Skills You Want to Learn</h2>
                            <p className="text-sm text-gray-500">Available teachers matching your interests.</p>
                        </div>
                        <Link to="/explore" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                            Browse all →
                        </Link>
                    </div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {recommendedSkills.map(skill => (
                            <motion.div key={skill._id} variants={itemVariants} whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.4, ease: smoothEase }}>
                                <Link
                                    to={`/skill/${skill._id}`}
                                    className="bg-white p-5 rounded-2xl hover:shadow-lg transition-all border border-gray-100 group"
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                                            {(skill.teacher?.name || 'T').charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                                {skill.title}
                                            </h3>
                                            <p className="text-xs text-gray-500">by {skill.teacher?.name || 'Unknown'}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{skill.description}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-lg font-medium">
                                            {skill.category}
                                        </span>
                                        <span className="text-xs text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                                            View Details →
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            )}

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Skills You Teach</h2>
                        <p className="text-sm text-gray-500">Your expertise available to others.</p>
                    </div>
                    <button
                        onClick={() => setShowSkillForm(true)}
                        className="px-4 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all"
                    >
                        + Add Skill
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mySkills.length > 0 ? mySkills.map((skill, i) => (
                        <div key={skill._id || i} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between group">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-600 rounded-lg font-bold uppercase tracking-wider">
                                        {skill.category}
                                    </span>
                                    <button
                                        onClick={async () => {
                                            if (window.confirm(`Are you sure you want to remove "${skill.title}"?`)) {
                                                try {
                                                    await api.delete(`/api/skills/${skill._id}`);
                                                    fetchDashboardData();
                                                } catch (err) { alert("Failed to delete skill"); }
                                            }
                                        }}
                                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                        title="Remove Skill"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">{skill.title}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2">{skill.description}</p>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <Link to={`/skill/${skill._id}`} className="text-xs font-bold text-blue-600 hover:underline">Edit Details</Link>
                                <div className="flex items-center text-yellow-500">
                                    <Star size={10} className="fill-current mr-1" />
                                    <span className="text-[10px] font-bold">{skill.rating || 0}</span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <p className="col-span-full text-gray-400 italic py-4">You haven't added any teaching skills yet.</p>
                    )}
                </div>
            </div>

            {/* Upcoming & Past Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Learning Sessions */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Your Learning</h2>
                        <Link to="/explore" className="text-blue-600 hover:text-blue-700 font-medium text-sm">Find more skills</Link>
                    </div>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="space-y-4" // Changed to space-y-4 for vertical stacking
                    >
                        {sessions.filter(s => compareIds(s.student, user?._id || user?.id)).map(session => (
                            <motion.div key={session._id} variants={itemVariants} whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.4, ease: smoothEase }}>
                                <SessionItem
                                    session={session}
                                    isTeacher={false}
                                    onUpdate={fetchDashboardData}
                                    isLive={isSessionRealTime(session)}
                                />
                            </motion.div>
                        ))}
                        {sessions.filter(s => compareIds(s.student, user?._id || user?.id)).length === 0 && (
                            <p className="text-gray-400 italic text-center py-10 text-sm">No learning sessions found.</p>
                        )}
                    </motion.div>
                </div>

                {/* Teaching Sessions */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Your Teaching</h2>
                        <p className="text-sm text-gray-500">Manage sessions with your students.</p>
                    </div>
                    <div className="space-y-4">
                        {sessions.filter(s => compareIds(s.teacher, user?._id || user?.id)).map(session => (
                             <SessionItem
                                 key={session._id}
                                 session={session}
                                 isTeacher={true}
                                 onUpdate={fetchDashboardData}
                                 isLive={isSessionRealTime(session)}
                             />
                        ))}
                        {sessions.filter(s => compareIds(s.teacher, user?._id || user?.id)).length === 0 && (
                            <p className="text-gray-400 italic text-center py-10 text-sm">No teaching sessions found.</p>
                        )}
                    </div>
                </div>
            </div>

            {showSkillForm && (
                <SkillForm
                    onClose={() => setShowSkillForm(false)}
                    onSkillAdded={fetchDashboardData}
                />
            )}
        </div>
    );
};

const SessionItem = ({ session, isTeacher, onUpdate, isLive }) => {
    const handleUpdateStatus = async (status) => {
        try {
            await api.put(`/api/bookings/${session._id}`, { status });
            onUpdate(); // Refresh data
        } catch (err) {
            console.error("Error updating booking status", err);
            alert("Failed to update status. Please try again.");
        }
    };

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center p-5 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${isTeacher ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'}`}>
                    {(isTeacher ? session.student?.name || 'S' : session.teacher?.name || 'T').charAt(0)}
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{session.skill?.title || 'Skill Session'}</h3>
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500">
                            {isTeacher ? `Student: ${session.student?.name || 'Unknown'}` : `Mentor: ${session.teacher?.name || 'Unknown'}`}
                        </p>
                        {isLive && (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full animate-pulse">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                LIVE
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center text-gray-500 text-xs font-medium">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    {new Date(session.date).toLocaleDateString()} at {session.time}
                </div>

                <div className="flex items-center gap-2">
                    {session.status === 'pending' && isTeacher && (
                        <>
                            <button
                                onClick={() => handleUpdateStatus('confirmed')}
                                className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-all shadow-sm"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => handleUpdateStatus('rejected')}
                                className="px-4 py-2 bg-white text-red-600 border border-red-100 rounded-xl text-xs font-bold hover:bg-red-50 transition-all"
                            >
                                Reject
                            </button>
                        </>
                    )}

                    {['pending', 'confirmed', 'accepted'].includes(session.status) && (
                        <div className="flex gap-2">
                            {isTeacher ? (
                                <Link 
                                    to={`/video?bookingId=${session._id}`} 
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${isLive ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-200 pointer-events-none'}`}
                                >
                                    <Video size={14} /> {isLive ? 'Start session' : 'Not Live'}
                                </Link>
                            ) : (
                                <Link 
                                    to={`/video?bookingId=${session._id}`} 
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${isLive ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-200 pointer-events-none'}`}
                                >
                                    <Video size={14} /> {isLive ? 'Join Class' : 'Not Live'}
                                </Link>
                            )}
                            {isTeacher && (
                                <button
                                    onClick={() => handleUpdateStatus('completed')}
                                    className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
                                >
                                    <Award size={14} />
                                    Complete
                                </button>
                            )}
                        </div>
                    )}

                    {session.status === 'completed' && !isTeacher && (
                        <Link
                            to="/certificates"
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-xl text-xs font-bold hover:bg-yellow-600 transition-all shadow-md active:scale-95"
                        >
                            <Award size={14} />
                            View Cert
                        </Link>
                    )}

                    {session.status !== 'confirmed' && session.status !== 'pending' && (session.status !== 'completed' || isTeacher) && (
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider ${session.status === 'completed' ? 'bg-green-50 text-green-600 border border-green-100' :
                            session.status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-100' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                            {session.status}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, clickable }) => (
    <div
        className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 ${clickable ? 'cursor-pointer hover:border-yellow-300 hover:shadow-md transition-all' : ''}`}
    >
        <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
        <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

export default Dashboard;
