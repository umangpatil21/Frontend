import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Video, Users, Zap, BookOpen, Star, TrendingUp, Sparkles, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    const [stats, setStats] = useState({ users: 0, skills: 0, sessions: 0 });

    const smoothEase = [0.22, 1, 0.36, 1]; // Premium "gliding" fluid curve

    // Staggered container for hero elements
    const heroContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    };

    const fluidItem = {
        hidden: { opacity: 0, y: 30 },
        show: { 
            opacity: 1, 
            y: 0, 
            transition: { duration: 1.2, ease: smoothEase } 
        }
    };

    // Animated counter effect
    useEffect(() => {
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            setStats({
                users: Math.floor((500 / steps) * currentStep),
                skills: Math.floor((150 / steps) * currentStep),
                sessions: Math.floor((1200 / steps) * currentStep)
            });
            if (currentStep >= steps) clearInterval(timer);
        }, interval);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="pt-16 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        y: [0, -30, 0],
                        x: [0, 20, 0],
                        rotate: [0, 5, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
                />
                <motion.div
                    animate={{
                        y: [0, 40, 0],
                        x: [0, -30, 0],
                        rotate: [0, -5, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-40 right-20 w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
                />
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        x: [0, 15, 0],
                        rotate: [0, 3, 0]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
                />
            </div>

            {/* Hero Section */}
            <section className="relative py-20 sm:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    {/* Floating Icons */}
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-10 left-10 opacity-20"
                    >
                        <BookOpen size={40} className="text-blue-600" />
                    </motion.div>
                    <motion.div
                        animate={{ y: [0, 15, 0], rotate: [0, 10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-20 right-20 opacity-20"
                    >
                        <Star size={35} className="text-violet-600" />
                    </motion.div>
                    <motion.div
                        animate={{ y: [0, -10, 0], x: [0, 10, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-40 left-1/4 opacity-20"
                    >
                        <Sparkles size={30} className="text-pink-600" />
                    </motion.div>

                    <motion.div
                        variants={heroContainer}
                        initial="hidden"
                        animate="show"
                    >
                        <motion.div
                            variants={fluidItem}
                            className="inline-block mb-6 px-4 py-2 bg-gradient-to-r from-blue-100 to-violet-100 rounded-full"
                        >
                            <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                                🚀 Join 500+ Learners Today
                            </span>
                        </motion.div>

                        <motion.h1
                            variants={fluidItem}
                            className="text-5xl sm:text-7xl font-extrabold tracking-tight text-gray-900 mb-6"
                        >
                            Master any skill.
                            <br />
                            <motion.span
                                animate={{
                                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                                }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600 bg-[length:200%_auto]"
                            >
                                Live & Interactive.
                            </motion.span>
                        </motion.h1>

                        <motion.p
                            variants={fluidItem}
                            className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto"
                        >
                            SkillSwap is an affordable, community-driven alternative to expensive learning platforms.
                            Connect for live 1-on-1 sessions and learn for free or at a fraction of the cost.
                        </motion.p>

                        <motion.div
                            variants={fluidItem}
                            className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
                        >
                            {localStorage.getItem('token') ? (
                                <>
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.4, ease: smoothEase }}>
                                        <Link to="/explore" className="group px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all flex items-center gap-2 justify-center">
                                            Search Skills
                                            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                        </Link>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.4, ease: smoothEase }}>
                                        <Link to="/dashboard" className="px-8 py-4 rounded-full bg-white text-blue-600 border-2 border-gray-200 font-semibold text-lg hover:bg-gray-50 hover:border-blue-300 transition-all flex items-center gap-2 justify-center">
                                            Teach & Earn
                                            <TrendingUp size={20} />
                                        </Link>
                                    </motion.div>
                                </>
                            ) : (
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.4, ease: smoothEase }}>
                                    <Link to="/signup" className="group px-10 py-4 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all flex items-center gap-2 justify-center">
                                        Get Started
                                        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                    </Link>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>

                    {/* Animated Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
                    >
                        <StatCard number={stats.users} label="Active Users" />
                        <StatCard number={stats.skills} label="Skills Available" />
                        <StatCard number={stats.sessions} label="Sessions Completed" />
                    </motion.div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose SkillSwap?</h2>
                        <p className="text-xl text-gray-500">Everything you need to learn and teach effectively</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Video className="w-10 h-10 text-blue-500" />}
                            title="Live 1-on-1 Video"
                            desc="High-quality video calls with screen sharing and interactive whiteboard."
                            delay={0.1}
                            gradient="from-blue-500 to-cyan-500"
                        />
                        <FeatureCard
                            icon={<Users className="w-10 h-10 text-violet-500" />}
                            title="Community Driven"
                            desc="Learn from peers or seasoned pros. Swap skills and grow together."
                            delay={0.2}
                            gradient="from-violet-500 to-purple-500"
                        />
                        <FeatureCard
                            icon={<Zap className="w-10 h-10 text-yellow-500" />}
                            title="Instant Booking"
                            desc="Real-time scheduling and instant session confirmations."
                            delay={0.3}
                            gradient="from-yellow-500 to-orange-500"
                        />
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 bg-gray-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-xl text-gray-500">Mastering a new skill is just 3 steps away</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2" />

                        {[
                            { step: '01', title: 'Search & Discover', desc: 'Find the perfect mentor across hundreds of categories from design to development.', icon: <Search className="w-8 h-8 text-blue-600" /> },
                            { step: '02', title: 'Live Connect', desc: 'Book a session and hop into our built-in high-quality video call with collaborative tools.', icon: <Video className="w-8 h-8 text-violet-600" /> },
                            { step: '03', title: 'Get Certified', desc: 'Complete the session and receive an official Executive Honors certificate of achievement.', icon: <Star className="w-8 h-8 text-yellow-600" /> }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6, delay: idx * 0.2 }}
                                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center relative hover:shadow-xl transition-all duration-300"
                            >
                                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-1 rounded-full text-xs font-black tracking-widest">STEP {item.step}</span>
                                <div className="mb-6 bg-gray-50 p-5 rounded-2xl">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Mission / Made by Students */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="flex-1"
                        >
                            <div className="inline-block mb-4 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-wider">Our Mission</div>
                            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                                Built for students, <br />
                                <span className="text-blue-600">inspired by growth.</span>
                            </h2>
                            <p className="text-xl text-gray-600 leading-relaxed mb-8">
                                SkillSwap was born from a simple idea: that everyone has something to teach and something to learn. As diploma students, we wanted to build a platform that removes the barriers to expensive education.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                        <Users size={20} />
                                    </div>
                                    <span className="font-semibold text-gray-800">100% Peer-to-Peer</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-600">
                                        <Zap size={20} />
                                    </div>
                                    <span className="font-semibold text-gray-800">Instant Access</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            whileInView={{ opacity: 1, x: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="flex-1 relative"
                        >
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000"
                                    alt="Students Collaborating"
                                    className="w-full h-auto"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8">
                                    <div className="text-white">
                                        <p className="text-lg font-bold">Collaborative Excellence</p>
                                        <p className="text-sm opacity-80 underline">Join our growing community of 500+ active learners.</p>
                                    </div>
                                </div>
                            </div>
                            {/* Floating decorative elements */}
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl" />
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl" />
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const StatCard = ({ number, label }) => (
    <div className="text-center">
        <motion.div
            className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600"
        >
            {number}+
        </motion.div>
        <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
);

const FeatureCard = ({ icon, title, desc, delay, gradient }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
        whileHover={{ y: -10, scale: 1.02 }}
        className="group relative flex flex-col items-center p-8 rounded-3xl bg-white border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300"
    >
        {/* Gradient border on hover */}
        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

        <motion.div
            whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className={`mb-6 p-4 bg-gradient-to-br ${gradient} bg-opacity-10 rounded-2xl relative`}
        >
            {icon}
        </motion.div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-500 text-center">{desc}</p>
    </motion.div>
);

export default Home;
