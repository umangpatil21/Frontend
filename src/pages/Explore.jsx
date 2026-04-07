import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Sparkles, CheckCircle } from 'lucide-react';
import api from '../api';
import { Link } from 'react-router-dom';

const Explore = () => {
    const [skills, setSkills] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [isAiMatching, setIsAiMatching] = useState(false);

    const smoothEase = [0.22, 1, 0.36, 1];

    const gridContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.15
            }
        }
    };

    useEffect(() => {
        const fetchSkillsAndBookings = async () => {
            try {
                const token = localStorage.getItem('token');
                const [skillsRes, bookingsRes] = await Promise.all([
                    api.get('/api/skills'),
                    token ? api.get('/api/bookings') : Promise.resolve({ data: [] })
                ]);

                // Mark booked skills
                const bookedSkillIds = new Set(bookingsRes.data.map(b => b.skill?._id));
                const skillsWithStatus = skillsRes.data.map(skill => ({
                    ...skill,
                    isBooked: bookedSkillIds.has(skill._id)
                }));

                setSkills(skillsWithStatus);
            } catch (err) {
                console.error("Error fetching data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSkillsAndBookings();
    }, []);

    const handleAiMatch = async () => {
        setIsAiMatching(true);
        try {
            const res = await api.get('/api/ai/match');
            setIsAiMatching(false);
            if (res.data.length > 0) {
                const bestMatch = res.data[0];
                alert(`AI Recommend: You should connect with someone who can help with your goals! \n\nReason: ${bestMatch.reason}`);
            } else {
                alert("AI Match: No specific recommendations found at this time. Keep exploring!");
            }
        } catch (err) {
            console.error("AI Match error", err);
            setIsAiMatching(false);
            alert("AI Matching failed. Please make sure you have set up your profile skills!");
        }
    };

    const displayedSkills = skills.filter(skill =>
        skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="pt-24 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Explore Skills</h1>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search for a skill..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    </div>
                    <button
                        onClick={handleAiMatch}
                        disabled={isAiMatching}
                        className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm ${isAiMatching
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:shadow-md active:scale-95'
                            }`}
                    >
                        <Sparkles size={16} className={isAiMatching ? 'animate-spin' : ''} />
                        <span className="hidden sm:inline">{isAiMatching ? 'Matching...' : 'AI Match'}</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : displayedSkills.length === 0 ? (
                <div className="text-center py-20 text-gray-500">No skills found matching your search.</div>
            ) : (
                <motion.div
                    variants={gridContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {displayedSkills.map((skill) => (
                        <SkillCard key={skill._id} skill={skill} />
                    ))}
                </motion.div>
            )}
        </div>
    );
};

const SkillCard = ({ skill }) => {
    const smoothEase = [0.22, 1, 0.36, 1];
    
    const cardItem = {
        hidden: { opacity: 0, y: 40 },
        show: { 
            opacity: 1, 
            y: 0, 
            transition: { duration: 0.8, ease: smoothEase } 
        }
    };

    return (
        <motion.div
            variants={cardItem}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.4, ease: smoothEase }}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-shadow border border-gray-100 cursor-pointer relative"
        >
        {skill.isBooked && (
            <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <CheckCircle size={12} /> Booked
            </div>
        )}
        <div className="flex items-center mb-4">
            <img src={skill.teacher.profilePhoto} alt={skill.teacher.name} className="w-10 h-10 rounded-full object-cover mr-3" />
            <div>
                <p className="text-sm font-semibold text-gray-900">{skill.teacher.name}</p>
                <p className="text-xs text-gray-500">Teacher</p>
            </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{skill.title}</h3>
        <span className="inline-block bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-md font-medium mb-3">{skill.category}</span>

        <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                <span className="font-medium">{skill.rating}</span>
                <span className="text-gray-400 ml-1">({skill.reviews || 0})</span>
            </div>
            <Link to={`/skill/${skill._id}`} className="text-blue-600 font-medium hover:underline">
                View Details
            </Link>
        </div>
    </motion.div>
    );
};

export default Explore;
