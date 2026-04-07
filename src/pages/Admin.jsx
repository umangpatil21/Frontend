import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import { Users, BookOpen, TrendingUp, ShieldAlert, Trash2, CheckCircle } from 'lucide-react';

const Admin = () => {
    const [analytics, setAnalytics] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [analyticsRes, usersRes] = await Promise.all([
                    api.get('/api/admin/analytics'),
                    api.get('/api/admin/users')
                ]);

                setAnalytics(analyticsRes.data);
                setUsers(usersRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching admin data", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const deleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/api/admin/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
        } catch (err) {
            console.error("Error deleting user", err);
        }
    };

    if (loading) return <div className="pt-24 text-center">Loading Dashboard...</div>;

    const stats = [
        { title: 'Total Users', value: analytics?.totalUsers || 0, icon: <Users className="text-blue-500" />, trend: 'Live Data' },
        { title: 'Active Skills', value: analytics?.totalSkills || 0, icon: <BookOpen className="text-violet-500" />, trend: 'Live Data' },
        { title: 'Sessions Completed', value: analytics?.totalBookings || 0, icon: <TrendingUp className="text-green-500" />, trend: 'Live Data' },
    ];

    return (
        <div className="pt-24 min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
            <header className="mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
                <p className="mt-2 text-lg text-gray-600 font-medium">Platform overview and management.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -5 }}
                        className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-4 bg-gray-50 rounded-2xl">{stat.icon}</div>
                            <span className="text-xs font-bold text-green-500 px-3 py-1 bg-green-50 rounded-full">
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 mb-1">{stat.title}</p>
                            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Management Section */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                    <button className="text-sm text-blue-600 font-semibold hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Name</th>
                                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-gray-900">{user.name}</div>
                                        <div className="text-xs text-gray-500 font-medium">{user.email}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${user.role === 'Teacher' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            {user.status === 'Active' ? (
                                                <CheckCircle size={14} className="text-green-500" />
                                            ) : (
                                                <ShieldAlert size={14} className="text-red-500" />
                                            )}
                                            <span className={`text-sm font-bold ${user.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                                                {user.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => deleteUser(user._id)}
                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-xl hover:bg-red-50"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Admin;
