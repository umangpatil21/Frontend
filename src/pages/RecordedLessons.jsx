import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, Star, ChevronLeft, Search, Filter } from 'lucide-react';
import api from '../api';

const RecordedLessons = () => {
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    const getYoutubeEmbedUrl = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            return `https://www.youtube.com/embed/${match[2]}`;
        }
        return null;
    };

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const res = await api.get('/api/skills/lessons/all');
                setLessons(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching lessons", err);
                setLoading(false);
            }
        };
        fetchLessons();
    }, []);

    const filteredLessons = lessons.filter(l =>
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="pt-24 min-h-screen bg-white px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Recorded Lessons</h1>
                    <p className="mt-2 text-lg text-gray-500 font-medium">Learn at your own pace from industry experts.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium"
                    />
                </div>
            </div>

            {/* Video Grid */}
            {loading ? (
                <div className="text-center py-20 text-gray-400 font-medium">Loading lessons...</div>
            ) : filteredLessons.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredLessons.map((lesson, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -8 }}
                            className="group cursor-pointer"
                            onClick={() => setSelectedVideo(lesson)}
                        >
                            <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-sm group-hover:shadow-2xl transition-all border border-gray-100 mb-6">
                                <img
                                    src={lesson.thumbnail || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop"}
                                    alt={lesson.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                    <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center scale-90 group-hover:scale-100 transition-transform">
                                        <Play className="text-white fill-current translate-x-0.5" size={24} />
                                    </div>
                                </div>
                                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-white text-xs font-bold">
                                    {lesson.duration || "Self-paced"}
                                </div>
                            </div>
                            <div className="px-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                                        {lesson.category}
                                    </span>
                                    <div className="flex items-center text-xs text-gray-400 font-bold ml-auto">
                                        <Star size={12} className="text-yellow-400 fill-current mr-1" />
                                        {lesson.skillRating || "New"}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{lesson.title}</h3>
                                <p className="text-gray-500 font-medium mt-1">By {lesson.teacher?.name || "Expert Trainer"}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-400 font-medium">No recorded lessons found.</div>
            )}

            {/* Video Player Modal */}
            <AnimatePresence>
                {selectedVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-10"
                    >
                        <button
                            onClick={() => setSelectedVideo(null)}
                            className="absolute top-6 left-6 text-white/70 hover:text-white flex items-center gap-2 font-bold px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-all"
                        >
                            <ChevronLeft size={20} /> Close
                        </button>

                        <div className="w-full max-w-6xl aspect-video relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                            {getYoutubeEmbedUrl(selectedVideo.videoUrl) ? (
                                <iframe
                                    src={getYoutubeEmbedUrl(selectedVideo.videoUrl)}
                                    title={selectedVideo.title}
                                    className="w-full h-full border-none"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <video
                                    src={selectedVideo.videoUrl}
                                    autoPlay
                                    controls
                                    className="w-full h-full"
                                />
                            )}
                        </div>

                        <div className="absolute bottom-10 left-10 right-10 flex flex-col items-center text-center">
                            <h2 className="text-white text-2xl font-bold mb-2">{selectedVideo.title}</h2>
                            <p className="text-white/50 font-medium">Lesson by {selectedVideo.teacher?.name || "Expert"} • Course: {selectedVideo.skillTitle}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RecordedLessons;
