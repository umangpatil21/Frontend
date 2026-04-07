import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import { Bell, Calendar, Check, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/api/notifications');
            setNotifications(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching notifications", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [token]);

    const markAsRead = async (id) => {
        try {
            await api.put(`/api/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error("Error marking as read", err);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/api/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error("Error marking all as read", err);
        }
    };

    if (loading) return <div className="pt-24 text-center">Loading notifications...</div>;

    return (
        <div className="pt-24 min-h-screen max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-500">Stay updated with your sessions and classes.</p>
                </div>
                {notifications.some(n => !n.read) && (
                    <button
                        onClick={markAllRead}
                        className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                        <Check size={16} /> Mark all as read
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {notifications.length > 0 ? notifications.map((notification) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={notification._id}
                        className={`p-5 rounded-3xl border transition-all ${notification.read ? 'bg-white border-gray-100 opacity-75' : 'bg-blue-50/50 border-blue-100 shadow-sm shadow-blue-50'
                            }`}
                    >
                        <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${notification.type === 'session_reminder' ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'
                                }`}>
                                {notification.type === 'session_reminder' ? <Calendar size={24} /> : <Bell size={24} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </span>
                                    {!notification.read && (
                                        <button
                                            onClick={() => markAsRead(notification._id)}
                                            className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                                <h3 className={`text-lg leading-snug mb-2 ${notification.read ? 'text-gray-600' : 'text-gray-900 font-bold'}`}>
                                    {notification.message}
                                </h3>
                                {notification.link && (
                                    <Link
                                        to={notification.link}
                                        className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 inline-flex"
                                    >
                                        View Details <ExternalLink size={14} />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <Bell className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-400 font-medium">No notifications yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
