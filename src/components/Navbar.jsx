import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import { Menu, X, Search, MessageCircle, Video, PlayCircle, Bell, User, LogOut } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const res = await api.get('/api/chat/unread-count');
                    setUnreadCount(res.data.count);
                }
            } catch (err) {
                console.error("Error fetching unread count", err);
            }
        };
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 10000);
        return () => clearInterval(interval);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Explore', path: '/explore' },
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Chat', path: '/chat', icon: <MessageCircle size={18} /> },
        { name: 'Certificates', path: '/certificates', icon: <PlayCircle size={18} /> },
    ];

    const token = localStorage.getItem('token');

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-12">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                            <Video className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 tracking-tighter">SkillSwap</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-1.5 text-sm font-bold transition-all hover:text-blue-600 ${location.pathname === link.path ? 'text-blue-600 scale-105' : 'text-gray-600'}`}
                            >
                                {link.name === 'Chat' && unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{unreadCount}</span>
                                )}
                                {link.name}
                            </Link>
                        ))}

                        {token ? (
                            <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                                <Link
                                    to="/notifications"
                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all relative"
                                >
                                    <Bell size={20} />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                </Link>
                                <Link
                                    to="/profile"
                                    className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-violet-100 flex items-center justify-center text-blue-600 hover:shadow-lg transition-all border-2 border-white overflow-hidden"
                                >
                                    <User size={24} />
                                </Link>
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('token');
                                        window.location.href = '/login';
                                    }}
                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">Log in</Link>
                                <Link to="/signup" className="px-6 py-2.5 rounded-full bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95">Join SkillSwap</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all focus:outline-none"
                        >
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-2xl"
                >
                    <div className="px-4 pt-4 pb-6 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`block px-4 py-3 rounded-xl text-base font-bold ${location.pathname === link.path ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <div className="flex items-center justify-between">
                                    {link.name}
                                    {link.name === 'Chat' && unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                            {token ? (
                                <>
                                    <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-base font-bold text-gray-600 hover:bg-gray-50 rounded-xl">My Profile</Link>
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem('token');
                                            window.location.href = '/login';
                                        }}
                                        className="w-full text-left px-4 py-3 text-base font-bold text-red-600 hover:bg-red-50 rounded-xl"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-base font-bold text-gray-600">Log in</Link>
                                    <Link to="/signup" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-base font-bold text-blue-600">Sign up</Link>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </nav>
    );
};

export default Navbar;
