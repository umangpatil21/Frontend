import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Award, Star, MessageSquare, CheckCircle, X, FileText, Link as LinkIcon, Download, Upload, Play, Edit2, Trash2, Video } from 'lucide-react';
import { isSessionRealTime } from '../utils/dateUtils';
import api from '../api';

const SkillDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [skill, setSkill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [isBooked, setIsBooked] = useState(false);
    const [booking, setBooking] = useState(null);
    const [showResourceForm, setShowResourceForm] = useState(false);
    const [newResource, setNewResource] = useState({ name: '', url: '', type: 'PDF' });
    const [showLessonForm, setShowLessonForm] = useState(false);
    const [newLesson, setNewLesson] = useState({ title: '', videoUrl: '', duration: '' });
    const [showEditLessonForm, setShowEditLessonForm] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);

    const getYoutubeEmbedUrl = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            return `https://www.youtube.com/embed/${match[2]}`;
        }
        return null;
    };

    const user = JSON.parse(localStorage.getItem('user'));
    const isTeacher = user && skill && skill.teacher._id === user.id;

    useEffect(() => {
        const fetchSkillAndBooking = async () => {
            try {
                const skillRes = await api.get(`/api/skills/${id}`);
                setSkill(skillRes.data);

                const token = localStorage.getItem('token');
                if (token) {
                    const bookingsRes = await api.get('/api/bookings');
                    const userBooking = bookingsRes.data.find(b => b.skill && (b.skill._id === id || b.skill === id));
                    if (userBooking) {
                        setIsBooked(true);
                        setBooking(userBooking);
                    }
                }

                if (skillRes.data.nextSessionDate) setSelectedDate(skillRes.data.nextSessionDate);
                if (skillRes.data.nextSessionTime) setSelectedTime(skillRes.data.nextSessionTime);

                setLoading(false);
            } catch (err) {
                console.error("Error fetching skill", err);
                setLoading(false);
            }
        };
        fetchSkillAndBooking();
    }, [id]);

    const handleBookNow = async () => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');
        if (!skill.nextSessionDate || !skill.nextSessionTime) return alert("This session has not been scheduled by the teacher yet.");

        try {
            await api.post('/api/bookings', {
                teacherId: skill.teacher._id,
                skillId: skill._id,
                date: skill.nextSessionDate,
                time: skill.nextSessionTime
            });

            setShowSuccessModal(true);
            setIsBooked(true);
        } catch (err) {
            alert("Booking failed. Please try again.");
        }
    };

    const handleUpdateSchedule = async () => {
        try {
            const res = await api.put(`/api/skills/${id}/schedule`, {
                date: selectedDate,
                time: selectedTime
            });
            setSkill(res.data);
            alert("Schedule updated successfully!");
        } catch (err) {
            alert("Failed to update schedule.");
        }
    };

    const handleAddResource = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post(`/api/skills/${id}/resources`, newResource);
            setSkill({ ...skill, resources: res.data });
            setNewResource({ name: '', url: '', type: 'PDF' });
            setShowResourceForm(false);
        } catch (err) {
            alert("Failed to add resource");
        }
    };

    const handleAddLesson = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post(`/api/skills/${id}/lessons`, newLesson);
            setSkill({ ...skill, recordedLessons: res.data });
            setNewLesson({ title: '', videoUrl: '', duration: '' });
            setShowLessonForm(false);
        } catch (err) {
            alert("Failed to add lesson");
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm("Are you sure you want to delete this lesson?")) return;
        try {
            const res = await api.delete(`/api/skills/${id}/lessons/${lessonId}`);
            setSkill({ ...skill, recordedLessons: res.data });
        } catch (err) {
            alert("Failed to delete lesson");
        }
    };

    const handleUpdateLesson = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/api/skills/${id}/lessons/${editingLesson._id}`, editingLesson);
            setSkill({ ...skill, recordedLessons: res.data });
            setShowEditLessonForm(false);
            setEditingLesson(null);
        } catch (err) {
            alert("Failed to update lesson");
        }
    };

    if (loading) return <div className="pt-24 text-center">Loading Skill Details...</div>;
    if (!skill) return <div className="pt-24 text-center">Skill not found</div>;

    return (
        <div className="pt-24 min-h-screen max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/explore" className="text-gray-500 hover:text-gray-900 mb-6 inline-block">← Back to Explore</Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
                    >
                        <div className="flex justify-between items-start">
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                                {skill.category}
                            </span>
                            <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                                <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                                <span className="font-bold text-gray-900">{skill.rating}</span>
                                <span className="text-gray-500 text-sm ml-1">({skill.reviews} reviews)</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-4xl font-extrabold text-gray-900">{skill.title}</h1>
                            {isTeacher && (
                                <button
                                    onClick={async () => {
                                        if (window.confirm("Are you sure you want to remove this course? This will delete it permanently.")) {
                                            try {
                                                await api.delete(`/api/skills/${id}`);
                                                navigate('/dashboard');
                                            } catch (err) { alert("Failed to delete skill"); }
                                        }
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Delete Course"
                                >
                                    <Trash2 size={24} />
                                </button>
                            )}
                        </div>
                        <p className="text-gray-600 text-lg leading-relaxed mb-8">{skill.description}</p>

                        <h3 className="text-xl font-bold mb-4">What you'll learn</h3>
                        <ul className="space-y-2 mb-8">
                            <li className="flex items-center text-gray-700">
                                <Award className="w-5 h-5 text-blue-500 mr-2" />
                                Advanced Hooks & Custom Logic
                            </li>
                            <li className="flex items-center text-gray-700">
                                <Award className="w-5 h-5 text-blue-500 mr-2" />
                                State Management w/ Context & Redux
                            </li>
                            <li className="flex items-center text-gray-700">
                                <Award className="w-5 h-5 text-blue-500 mr-2" />
                                Performance Optimization
                            </li>
                        </ul>

                        <div className="flex items-center space-x-4 border-t pt-6 mb-8">
                            <img src={skill.teacher.profilePhoto} alt={skill.teacher.name} className="w-14 h-14 rounded-full" />
                            <div>
                                <h4 className="font-bold text-gray-900">{skill.teacher.name}</h4>
                                <p className="text-gray-500 text-sm">{skill.teacher.bio}</p>
                            </div>
                        </div>

                        {/* Recorded Lessons Section */}
                        <div className="border-t pt-8 mb-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Play className="text-blue-600" />
                                    Recorded Lessons
                                </h3>
                                {isTeacher && (
                                    <button
                                        onClick={() => setShowLessonForm(true)}
                                        className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    >
                                        <Upload size={16} /> Add Lesson
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {skill.recordedLessons && skill.recordedLessons.length > 0 ? skill.recordedLessons.map((lesson, i) => (
                                    <div key={i} className="group cursor-pointer" onClick={() => setSelectedVideo(lesson)}>
                                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 mb-3">
                                            {lesson.thumbnail ? (
                                                <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                                    <Play className="text-white/20" size={32} />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <div className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center">
                                                    <Play className="text-white fill-current" size={16} />
                                                </div>
                                            </div>
                                            {lesson.duration && (
                                                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-white text-[10px] font-bold">
                                                    {lesson.duration}
                                                </div>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{lesson.title}</h4>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest hover:underline block">Watch Lesson</span>
                                            {isTeacher && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => { setEditingLesson(lesson); setShowEditLessonForm(true); }}
                                                        className="text-gray-400 hover:text-blue-600 transition-colors"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteLesson(lesson._id)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-gray-400 italic text-sm">No recorded lessons available yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Resources Section */}
                        <div className="border-t pt-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <FileText className="text-blue-600" />
                                    Course Materials & Resources
                                </h3>
                                {isTeacher && (
                                    <button
                                        onClick={() => setShowResourceForm(true)}
                                        className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    >
                                        <Upload size={16} /> Add Resource
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {skill.resources && skill.resources.length > 0 ? skill.resources.map((res, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-gray-50 flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-xl shadow-sm">
                                                {res.type === 'PDF' ? <FileText size={20} className="text-red-500" /> : <LinkIcon size={20} className="text-blue-500" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{res.name}</p>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{res.type}</p>
                                            </div>
                                        </div>
                                        <a href={res.url} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                            <Download size={16} className="text-gray-600" />
                                        </a>
                                    </div>
                                )) : (
                                    <p className="text-gray-400 italic text-sm">No resources shared yet.</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Booking Card */}
                <div className="lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        delay={0.2}
                        className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 sticky top-24"
                    >
                        <h3 className="text-xl font-bold mb-6">{isTeacher ? "Manage Schedule" : "Class Schedule"}</h3>

                        <div className="space-y-4 mb-6">
                            {isTeacher ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Set Date</label>
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 transition-all text-sm outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Set Time</label>
                                        <input
                                            type="time"
                                            value={selectedTime}
                                            onChange={(e) => setSelectedTime(e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 transition-all text-sm outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleUpdateSchedule}
                                        className="w-full py-3 bg-blue-100 text-blue-600 rounded-xl font-bold hover:bg-blue-200 transition-all text-sm"
                                    >
                                        Update Fixed Schedule
                                    </button>
                                </>
                            ) : (
                                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Calendar className="text-blue-600" size={20} />
                                        <div>
                                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Date</p>
                                            <p className="font-bold text-gray-900">{skill.nextSessionDate || "To be announced"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="text-blue-600" size={20} />
                                        <div>
                                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Time</p>
                                            <p className="font-bold text-gray-900">{skill.nextSessionTime || "To be announced"}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between text-gray-600 pt-2">
                                <span className="flex items-center"><Award className="w-4 h-4 mr-2" /> Level</span>
                                <span className="font-medium text-gray-900">{skill.level}</span>
                            </div>
                        </div>

                        {!isTeacher && (
                            <>
                                <button
                                    onClick={handleBookNow}
                                    disabled={isBooked || !skill.nextSessionDate}
                                    className={`w-full font-bold py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 mb-3 ${isBooked
                                        ? 'bg-green-50 text-green-600 cursor-default'
                                        : (!skill.nextSessionDate ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800 active:scale-95 shadow-black/10')
                                        }`}
                                >
                                    {isBooked ? (
                                        <><CheckCircle size={20} /> Already Booked</>
                                    ) : (
                                        skill.nextSessionDate ? "Book This Session" : "Awaiting Schedule"
                                    )}
                                </button>

                                {isBooked && booking && ['pending', 'confirmed', 'accepted', 'completed'].includes(booking.status) && (() => {
                                    const isLive = isSessionRealTime(booking);
                                    return (
                                        <Link
                                            to={`/video?bookingId=${booking._id}`}
                                            className={`w-full font-bold py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 mb-3 ${isLive ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-200 pointer-events-none'}`}
                                        >
                                            <Video size={20} /> {isLive ? 'Join Session Now' : 'Session Not Live'}
                                        </Link>
                                    );
                                })()}

                                {isBooked && booking && booking.status === 'completed' && (
                                    <Link
                                        to="/certificates"
                                        className={`w-full font-bold py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 mb-3 ${booking.attended
                                            ? 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-yellow-100 active:scale-95'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <Award size={20} /> Claim Certificate
                                        {!booking.attended && <span className="text-[8px] block ml-1">(Requires Attendance)</span>}
                                    </Link>
                                )}

                                <p className="text-center text-[10px] text-gray-400 mt-4 leading-tight uppercase font-bold tracking-widest">
                                    {isBooked ? "Click 'Join' when session is live!" : (skill.nextSessionDate ? "Instant confirmation after booking" : "Check back later for dates")}
                                </p>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Resource Upload Modal */}
            {showResourceForm && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-8 max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-6">Add Course Resource</h2>
                        <form onSubmit={handleAddResource} className="space-y-4">
                            <input
                                placeholder="Resource Name (e.g. React Cheatsheet)"
                                value={newResource.name}
                                onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                                required
                                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl outline-none"
                            />
                            <input
                                placeholder="URL (PDF or Website link)"
                                value={newResource.url}
                                onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                                required
                                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl outline-none"
                            />
                            <select
                                value={newResource.type}
                                onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl outline-none"
                            >
                                <option>PDF</option>
                                <option>Link</option>
                                <option>Note</option>
                            </select>
                            <div className="flex gap-2 pt-2">
                                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Upload</button>
                                <button type="button" onClick={() => setShowResourceForm(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Cancel</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
            {/* Lesson Upload Modal */}
            {showLessonForm && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-8 max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-6">Add Recorded Lesson</h2>
                        <form onSubmit={handleAddLesson} className="space-y-4">
                            <input
                                placeholder="Lesson Title (e.g. Intro to Hooks)"
                                value={newLesson.title}
                                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                                required
                                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl outline-none"
                            />
                            <input
                                placeholder="Video URL (mp4, YouTube, etc.)"
                                value={newLesson.videoUrl}
                                onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
                                required
                                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl outline-none"
                            />
                            <input
                                placeholder="Duration (e.g. 15 min)"
                                value={newLesson.duration}
                                onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl outline-none"
                            />
                            <input
                                placeholder="Thumbnail URL (optional)"
                                value={newLesson.thumbnail}
                                onChange={(e) => setNewLesson({ ...newLesson, thumbnail: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl outline-none"
                            />
                            <div className="flex gap-2 pt-2">
                                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Add Lesson</button>
                                <button type="button" onClick={() => setShowLessonForm(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Cancel</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
            {/* Edit Lesson Modal */}
            {showEditLessonForm && editingLesson && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-8 max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-6">Edit Recorded Lesson</h2>
                        <form onSubmit={handleUpdateLesson} className="space-y-4">
                            <input
                                placeholder="Lesson Title"
                                value={editingLesson.title}
                                onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                                required
                                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl outline-none"
                            />
                            <input
                                placeholder="Video URL"
                                value={editingLesson.videoUrl}
                                onChange={(e) => setEditingLesson({ ...editingLesson, videoUrl: e.target.value })}
                                required
                                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl outline-none"
                            />
                            <input
                                placeholder="Duration"
                                value={editingLesson.duration}
                                onChange={(e) => setEditingLesson({ ...editingLesson, duration: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl outline-none"
                            />
                            <input
                                placeholder="Thumbnail URL (optional)"
                                value={editingLesson.thumbnail}
                                onChange={(e) => setEditingLesson({ ...editingLesson, thumbnail: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl outline-none"
                            />
                            <div className="flex gap-2 pt-2">
                                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Update</button>
                                <button type="button" onClick={() => { setShowEditLessonForm(false); setEditingLesson(null); }} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Cancel</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl"
                    >
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} className="text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You for Booking!</h2>
                        <p className="text-gray-500 mb-8">
                            Your session for <strong>{skill.title}</strong> has been successfully requested.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/chat')}
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                            >
                                <MessageSquare size={20} />
                                Chat with {skill.teacher.name}
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                            >
                                Go to Dashboard
                            </button>
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            {/* Video Player Modal */}
            <AnimatePresence>
                {selectedVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 p-4 md:p-10"
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedVideo(null); }}
                            className="absolute top-6 left-6 text-white/70 hover:text-white flex items-center gap-2 font-bold px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-all"
                        >
                            <X size={20} /> Close
                        </button>

                        <div className="w-full max-w-5xl aspect-video relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black">
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
                            <p className="text-white/50 font-medium">Lesson by {skill.teacher.name} • {selectedVideo.duration || "Self-paced"}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SkillDetails;
