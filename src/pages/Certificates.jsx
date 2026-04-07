import React, { useState, useEffect } from 'react';
import api, { API_BASE_URL } from '../api';
import { motion } from 'framer-motion';
import { Award, Download, Calendar, CheckCircle, ExternalLink } from 'lucide-react';

const Certificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const res = await api.get('/api/certificate');
            setCertificates(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching certificates:', err);
            setLoading(false);
        }
    };

    const downloadCertificate = (pdfUrl, skillTitle) => {
        const link = document.createElement('a');
        link.href = `${API_BASE_URL}${pdfUrl}`;
        link.download = `${skillTitle}-certificate.pdf`;
        link.click();
    };

    const handleUpdate = async (skillId) => {
        if (!skillId) return alert("Skill ID not found. Please refresh page.");
        try {
            await api.post('/api/certificate/generate', {
                skillId,
                forceRegenerate: true
            });
            alert("Certificate updated with new premium design! ✨");
            fetchCertificates(); // Refresh the list
        } catch (err) {
            console.error('Error updating certificate:', err);
            alert("Failed to update design. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="pt-24 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading your certificates...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-500 rounded-2xl mb-4">
                        <Award className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">My Certificates</h1>
                    <p className="text-xl text-gray-500">
                        {certificates.length > 0
                            ? `You've earned ${certificates.length} certificate${certificates.length > 1 ? 's' : ''}! 🎉`
                            : 'Complete courses to earn certificates'}
                    </p>
                </motion.div>

                {/* Certificates Grid */}
                {certificates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {certificates.map((cert, index) => (
                            <CertificateCard
                                key={cert._id}
                                certificate={cert}
                                index={index}
                                onDownload={downloadCertificate}
                                onUpdate={handleUpdate}
                            />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20"
                    >
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Award className="text-gray-400" size={48} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Certificates Yet</h3>
                        <p className="text-gray-500 mb-8">Complete your first course to earn a certificate!</p>
                        <a
                            href="/explore"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                        >
                            Explore Courses
                            <ExternalLink size={18} />
                        </a>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const CertificateCard = ({ certificate, index, onDownload }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 overflow-hidden"
        >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-violet-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Content */}
            <div className="relative p-6">
                {/* Badge */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                        <CheckCircle size={14} />
                        Verified
                    </div>
                    <Award className="text-blue-500 group-hover:text-violet-500 transition-colors" size={24} />
                </div>

                {/* Skill Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {certificate.skill?.title || 'Unknown Skill'}
                </h3>

                {/* Certificate ID */}
                <p className="text-xs text-gray-400 font-mono mb-4">
                    ID: {certificate.uniqueId}
                </p>

                {/* Issue Date */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Calendar size={16} />
                    <span>Issued on {new Date(certificate.issueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => onDownload(certificate.pdfUrl, certificate.skill?.title)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all group-hover:scale-[1.02]"
                    >
                        <Download size={18} />
                        Download Certificate
                    </button>

                    <button
                        onClick={() => onUpdate(certificate.skill?._id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-all"
                    >
                        <CheckCircle size={16} />
                        Update to New Design
                    </button>
                </div>
            </div>

            {/* Decorative Corner */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-violet-400 opacity-10 rounded-bl-full" />
        </motion.div>
    );
};

export default Certificates;
