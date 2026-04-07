import React, { useState, useEffect } from 'react';
import api, { API_BASE_URL } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Briefcase, MapPin, GraduationCap,
    Languages, Link as LinkIcon, Twitter, Github,
    Edit3, Save, X, Plus, Trash2, Camera, ExternalLink,
    CheckCircle, Globe, Linkedin
} from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/api/users/profile');
            setUser(res.data);
            setFormData(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleArrayChange = (index, field, value, arrayName) => {
        const updatedArray = [...formData[arrayName]];
        if (field) {
            updatedArray[index] = { ...updatedArray[index], [field]: value };
        } else {
            updatedArray[index] = value;
        }
        setFormData(prev => ({ ...prev, [arrayName]: updatedArray }));
    };

    const addArrayItem = (arrayName, defaultValue) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: [...(prev[arrayName] || []), defaultValue]
        }));
    };

    const removeArrayItem = (index, arrayName) => {
        const updatedArray = formData[arrayName].filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, [arrayName]: updatedArray }));
    };

    const saveProfile = async () => {
        setSaving(true);
        try {
            const res = await api.put('/api/users/profile', formData);
            setUser(res.data);
            setIsEditing(false);
            setMessage({ text: 'Profile updated successfully! ✨', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setMessage({ text: 'Failed to update profile. Please try again.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation for image file types
        if (!file.type.startsWith('image/')) {
            setMessage({ text: 'Please upload a valid image file.', type: 'error' });
            return;
        }

        const data = new FormData();
        data.append('profilePhoto', file);

        setUploadingPhoto(true);
        try {
            const res = await api.post('/api/users/upload-photo', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Update user state and local storage with new photo
            setUser(prev => ({ ...prev, profilePhoto: res.data.profilePhoto }));

            const localUser = JSON.parse(localStorage.getItem('user'));
            if (localUser) {
                localUser.profilePhoto = res.data.profilePhoto;
                localStorage.setItem('user', JSON.stringify(localUser));
            }

            setMessage({ text: 'Profile photo updated! ✨', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            console.error('Error uploading photo:', err);
            setMessage({ text: 'Failed to upload photo. Please try again.', type: 'error' });
        } finally {
            setUploadingPhoto(false);
        }
    };

    if (loading) {
        return (
            <div className="pt-24 min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const smoothEase = [0.22, 1, 0.36, 1];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: smoothEase }}
            className="pt-24 pb-16 min-h-screen bg-[#f5f5f7]"
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Notification */}
                <AnimatePresence>
                    {message.text && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                                }`}
                        >
                            {message.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hero Section / LinkedIn Header */}
                <div className="bg-white rounded-t-2xl border border-gray-200 overflow-hidden relative shadow-sm">
                    <div className="h-48 bg-gradient-to-r from-[#0a66c2] to-[#004182] relative">
                        <div className="absolute top-4 right-4 flex gap-2">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full hover:bg-white/30 transition-all flex items-center gap-2 border border-white/30"
                                >
                                    <Edit3 size={18} /> Edit Profile
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="bg-gray-800/50 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveProfile}
                                        className="bg-white text-[#0a66c2] px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition-all flex items-center gap-2 shadow-xl"
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : <><Save size={18} /> Save</>}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="px-8 pb-8 pt-28 relative">
                        {/* Profile Photo */}
                        <div className="absolute -top-16 left-8">
                            <div className="relative group">
                                <img
                                    src={`${API_BASE_URL}/uploads/${user.profilePhoto || 'default.jpg'}`}
                                    alt={user.name}
                                    className="w-40 h-40 rounded-full border-4 border-white object-cover shadow-lg bg-white"
                                />
                                {uploadingPhoto && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a66c2]"></div>
                                    </div>
                                )}
                                {isEditing && !uploadingPhoto && (
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                        <Camera className="text-white" size={32} />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Title Info */}
                        <div className="flex flex-col md:flex-row justify-between items-start">
                            <div className="flex-1">
                                {isEditing ? (
                                    <div className="space-y-4 max-w-2xl">
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="text-3xl font-bold text-gray-900 border-b-2 border-blue-400 outline-none w-full bg-transparent pb-1"
                                            placeholder="Your Full Name"
                                        />
                                        <input
                                            name="headline"
                                            value={formData.headline || ''}
                                            onChange={handleInputChange}
                                            className="text-lg text-gray-700 border-b border-gray-300 outline-none w-full bg-transparent"
                                            placeholder="Professional Headline (e.g. Senior Software Engineer)"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                                            {user.role === 'admin' && <CheckCircle className="text-blue-500" size={20} />}
                                        </div>
                                        <p className="text-lg text-gray-700 mt-1">{user.headline || 'Add a professional headline'}</p>
                                    </>
                                )}

                                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <MapPin size={16} />
                                        {isEditing ? (
                                            <input
                                                name="location"
                                                value={formData.location || ''}
                                                onChange={handleInputChange}
                                                className="border-b border-gray-200 outline-none focus:border-blue-500"
                                                placeholder="City, Country"
                                            />
                                        ) : (
                                            user.location || 'Location Not Set'
                                        )}
                                    </span>
                                    <span className="flex items-center gap-1 text-[#0a66c2] font-semibold">
                                        <LinkIcon size={16} /> Contact Info
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

                    {/* Left Column (About & Experience) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* About Section */}
                        <section className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">About</h2>
                                {!isEditing && <Edit3 size={18} className="text-gray-400 hover:text-blue-600 cursor-pointer" onClick={() => setIsEditing(true)} />}
                            </div>
                            {isEditing ? (
                                <textarea
                                    name="bio"
                                    value={formData.bio || ''}
                                    onChange={handleInputChange}
                                    className="w-full h-40 p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                    placeholder="Tell the community about your professional journey..."
                                />
                            ) : (
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {user.bio || 'Add a bio to share your story, expertise, and goals with the SkillSwap community.'}
                                </p>
                            )}
                        </section>

                        {/* Education Section */}
                        <section className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Education</h2>
                                {isEditing && (
                                    <button
                                        onClick={() => addArrayItem('education', { school: '', degree: '', year: '' })}
                                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-all"
                                    >
                                        <Plus size={20} />
                                    </button>
                                )}
                            </div>

                            <div className="space-y-8">
                                {(isEditing ? formData.education : user.education)?.map((edu, idx) => (
                                    <div key={idx} className="flex gap-4 group">
                                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <GraduationCap className="text-gray-500" size={24} />
                                        </div>
                                        <div className="flex-1">
                                            {isEditing ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl relative">
                                                    <button
                                                        onClick={() => removeArrayItem(idx, 'education')}
                                                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200 transition-all shadow-sm"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                    <input
                                                        value={edu.school}
                                                        onChange={(e) => handleArrayChange(idx, 'school', e.target.value, 'education')}
                                                        className="bg-transparent border-b border-gray-300 outline-none focus:border-blue-500 font-bold"
                                                        placeholder="School / University"
                                                    />
                                                    <input
                                                        value={edu.degree}
                                                        onChange={(e) => handleArrayChange(idx, 'degree', e.target.value, 'education')}
                                                        className="bg-transparent border-b border-gray-300 outline-none focus:border-blue-500"
                                                        placeholder="Degree / Field of Study"
                                                    />
                                                    <input
                                                        value={edu.year}
                                                        onChange={(e) => handleArrayChange(idx, 'year', e.target.value, 'education')}
                                                        className="bg-transparent border-b border-gray-300 outline-none focus:border-blue-500 text-sm"
                                                        placeholder="Year (e.g. 2018 - 2022)"
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <h3 className="font-bold text-gray-900">{edu.school}</h3>
                                                    <p className="text-gray-700 text-sm">{edu.degree}</p>
                                                    <p className="text-gray-500 text-xs mt-1">{edu.year}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {(!isEditing && (!user.education || user.education.length === 0)) && (
                                    <p className="text-gray-500 italic">No education history added yet.</p>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column (Skills & Socials) */}
                    <div className="space-y-6">

                        {/* Skills Sections */}
                        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Skills</h2>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Teaching</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(isEditing ? formData.skillsToTeach : user.skillsToTeach)?.map((skill, idx) => (
                                            <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 border border-blue-100">
                                                {skill}
                                                {isEditing && <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => removeArrayItem(idx, 'skillsToTeach')} />}
                                            </span>
                                        ))}
                                        {isEditing && (
                                            <input
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && e.target.value) {
                                                        addArrayItem('skillsToTeach', e.target.value);
                                                        e.target.value = '';
                                                    }
                                                }}
                                                className="text-xs border border-dashed border-gray-300 rounded-full px-3 py-1 outline-none focus:border-blue-400"
                                                placeholder="+ Add Skill"
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-apple-gray">Learning</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(isEditing ? formData.skillsToLearn : user.skillsToLearn)?.map((skill, idx) => (
                                            <span key={idx} className="bg-violet-50 text-violet-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 border border-violet-100">
                                                {skill}
                                                {isEditing && <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => removeArrayItem(idx, 'skillsToLearn')} />}
                                            </span>
                                        ))}
                                        {isEditing && (
                                            <input
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && e.target.value) {
                                                        addArrayItem('skillsToLearn', e.target.value);
                                                        e.target.value = '';
                                                    }
                                                }}
                                                className="text-xs border border-dashed border-gray-300 rounded-full px-3 py-1 outline-none focus:border-blue-400"
                                                placeholder="+ Add Skill"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Social Links */}
                        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Socials</h2>
                            <div className="space-y-4">
                                {[
                                    { id: 'linkedin', icon: <Linkedin size={20} className="text-[#0a66c2]" />, label: 'LinkedIn' },
                                    { id: 'twitter', icon: <Twitter size={20} className="text-[#1DA1F2]" />, label: 'Twitter' },
                                    { id: 'github', icon: <Github size={20} className="text-[#24292e]" />, label: 'GitHub' },
                                    { id: 'website', icon: <Globe size={20} className="text-[#057642]" />, label: 'Portfolio' }
                                ].map(social => (
                                    <div key={social.id} className="flex items-center gap-3">
                                        {social.icon}
                                        {isEditing ? (
                                            <input
                                                value={formData.socialLinks?.[social.id] || ''}
                                                onChange={(e) => handleInputChange({ target: { name: `socialLinks.${social.id}`, value: e.target.value } })}
                                                className="flex-1 text-sm border-b border-gray-100 outline-none focus:border-blue-400"
                                                placeholder={`${social.label} URL`}
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-600 truncate flex-1 font-medium">
                                                {user.socialLinks?.[social.id] ? (
                                                    <a href={user.socialLinks[social.id]} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
                                                        {social.label}
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-300 italic">Not connected</span>
                                                )}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Additional Info */}
                        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Additional Info</h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Languages</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(isEditing ? formData.languages : user.languages)?.map((lang, idx) => (
                                            <span key={idx} className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                                {lang}
                                                {isEditing && <X size={10} className="inline ml-1 cursor-pointer" onClick={() => removeArrayItem(idx, 'languages')} />}
                                            </span>
                                        ))}
                                        {isEditing && (
                                            <input
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && e.target.value) {
                                                        addArrayItem('languages', e.target.value);
                                                        e.target.value = '';
                                                    }
                                                }}
                                                className="text-[10px] border-b border-gray-200 outline-none w-16"
                                                placeholder="+ Add"
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Gender</p>
                                        {isEditing ? (
                                            <select
                                                name="gender"
                                                value={formData.gender || ''}
                                                onChange={handleInputChange}
                                                className="text-sm bg-gray-50 border border-gray-200 rounded p-1 w-full"
                                            >
                                                <option value="">Select</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                                <option value="Prefer not to say">Prefer not to say</option>
                                            </select>
                                        ) : (
                                            <p className="text-sm font-medium">{user.gender || 'Not specified'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Member Since</p>
                                        <p className="text-sm font-medium">{new Date(user.createdAt).getFullYear()}</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Profile;
