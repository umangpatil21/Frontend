import React, { useState } from 'react';
import api from '../api';
import { X, Sparkles } from 'lucide-react';

const SkillForm = ({ onClose, onSkillAdded }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Programming',
        level: 'Beginner',
        timeRequired: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAiGenerate = async () => {
        if (!formData.title) return alert("Please enter a title first");
        setLoading(true);
        try {
            const res = await api.post('/api/skills/generate-description', { title: formData.title });
            setFormData({
                ...formData,
                description: res.data.description,
                timeRequired: res.data.timeRequired,
                level: res.data.level
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/skills', formData);
            onSkillAdded();
            onClose();
        } catch (err) {
            alert(err.response?.data?.msg || "Failed to add skill");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="p-6 bg-gradient-to-r from-blue-600 to-violet-600 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold">Add New Skill</h2>
                    <button onClick={onClose} className="hover:rotate-90 transition-transform"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Skill Title</label>
                        <div className="flex gap-2">
                            <input
                                required
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Python for Beginners"
                                className="flex-1 px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleAiGenerate}
                                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm"
                                title="Generate description with AI"
                            >
                                <Sparkles size={20} />
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
                        >
                            <option>Programming</option>
                            <option>Design</option>
                            <option>Language</option>
                            <option>Business</option>
                            <option>Music</option>
                            <option>Cooking</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <textarea
                            required
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Level</label>
                            <select
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
                            >
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Time Required</label>
                            <input
                                name="timeRequired"
                                value={formData.timeRequired}
                                onChange={handleChange}
                                placeholder="e.g., 10 hours"
                                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-black/10 flex justify-center items-center gap-2"
                    >
                        {loading ? 'Processing...' : 'Add Skill to Catalog'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SkillForm;
