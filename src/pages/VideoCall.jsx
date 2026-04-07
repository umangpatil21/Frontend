import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MessageSquare, Copy, Check, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// Peer is loaded via CDN in index.html
import { useLocation, useNavigate } from 'react-router-dom';
import Whiteboard from '../components/Whiteboard';
import { useMedia } from '../context/MediaContext';
import api, { API_BASE_URL } from '../api';
import io from 'socket.io-client';

const socket = io.connect(API_BASE_URL);

const VideoCall = () => {
    const navigate = useNavigate();
    const [me, setMe] = useState("");
    const [copied, setCopied] = useState(false);
    const {
        stream,
        isCamOn,
        isMicOn,
        toggleCam,
        toggleMic,
        enableDevices,
        clearStream
    } = useMedia();

    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState("");
    const [showWhiteboard, setShowWhiteboard] = useState(false);
    const [isJoined, setIsJoined] = useState(false);

    const [idToCall, setIdToCall] = useState("");
    const [remoteMicOn, setRemoteMicOn] = useState(true);
    const [remoteCamOn, setRemoteCamOn] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [meetingTime, setMeetingTime] = useState(0);
    const [partnerId, setPartnerId] = useState(null);

    const [bookingId, setBookingId] = useState(null);
    const [bookingInfo, setBookingInfo] = useState(null);
    const [isTeacher, setIsTeacher] = useState(false);
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    // Meeting Timer Effect
    useEffect(() => {
        let interval;
        if (isJoined) {
            interval = setInterval(() => {
                setMeetingTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isJoined]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Speaker Indicator (Audio Analyzer)
    useEffect(() => {
        if (!stream || !isMicOn) {
            setIsSpeaking(false);
            return;
        }

        let audioContext;
        let analyser;
        let source;
        let animationFrame;

        const startAnalysis = () => {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);

                analyser.fftSize = 256;
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                const checkVolume = () => {
                    analyser.getByteFrequencyData(dataArray);
                    let sum = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        sum += dataArray[i];
                    }
                    const average = sum / bufferLength;
                    setIsSpeaking(average > 30); // Threshold for speaking
                    animationFrame = requestAnimationFrame(checkVolume);
                };

                checkVolume();
            } catch (err) {
                console.error("Audio analysis error:", err);
            }
        };

        startAnalysis();

        return () => {
            if (animationFrame) cancelAnimationFrame(animationFrame);
            if (audioContext) audioContext.close();
        };
    }, [stream, isMicOn]);

    // Robust cleanup on unmount
    useEffect(() => {
        return () => {
            console.log("DEBUG: Component unmounting, forcing cleanup...");
            if (connectionRef.current) {
                connectionRef.current.destroy();
            }
            clearStream();
        };
    }, []);

    // Handle stream attachment to video elements
    useEffect(() => {
        if (stream && myVideo.current) {
            myVideo.current.srcObject = stream;
        }
    }, [stream, isJoined]); // Re-attach if we join and new video elements appear

    const location = useLocation();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const bId = query.get('bookingId');
        if (bId) {
            setBookingId(bId);
            fetchBookingDetails(bId);
        } else {
            // No ID in URL? Try to identify based on user's current bookings
            fetchBookingDetails(null);
        }
    }, [location]);

    const fetchBookingDetails = async (id) => {
        try {
            const res = await api.get('/api/bookings');

            // If ID is provided, find that specific one. Otherwise, find the "best" active booking.
            let booking;
            if (id) {
                booking = res.data.find(b => b._id === id);
            } else {
                // Find most recent confirmed booking
                booking = res.data.find(b => b.status === 'confirmed');
                if (booking) setBookingId(booking._id);
            }

            if (booking) {
                setBookingInfo(booking);
                // Robust teacher check
                const tId = booking.teacher?._id?.toString() || booking.teacher?.toString();
                const cId = currentUser?.id?.toString() || currentUser?._id?.toString();

                if (tId && cId && tId === cId) {
                    setIsTeacher(true);
                } else {
                    // Mark student as attended if they are joining the call
                    try {
                        await api.put(`/api/bookings/${booking._id}`,
                            { attended: true }
                        );
                        console.log("Student marked as attended");
                    } catch (err) {
                        console.error("Error marking attendance", err);
                    }
                }
            }
        } catch (err) {
            console.error("Error fetching booking details", err);
        }
    };

    useEffect(() => {
        // Handle socket ID capture reliably
        if (socket.id) {
            setMe(socket.id);
        } else {
            socket.on('connect', () => {
                setMe(socket.id);
            });
        }

        socket.on("callUser", (data) => {
            // console.log("Receiving call from:", data.from);
            setReceivingCall(true);
            setCaller(data.from);
            setPartnerId(data.from); // Track who is calling us
            setName(data.name);
            setCallerSignal(data.signal);
        });

        socket.on("toggle_mic", ({ isMuted }) => {
            setRemoteMicOn(!isMuted);
        });

        socket.on("toggle_video", ({ isVideoOff }) => {
            setRemoteCamOn(!isVideoOff);
        });

        return () => {
            socket.off("connect");
            socket.off("callUser");
            socket.off("callAccepted");
            socket.off("toggle_mic");
            socket.off("toggle_video");
        };
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(me);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const callUser = (id) => {
        if (!stream) {
            alert("Please enable your camera and microphone first!");
            return;
        }

        try {
            console.log("DEBUG: Initiating call to ID:", id);
            setPartnerId(id); // Track who we are calling
            // Use CDN version (SimplePeer is the name used by the unpkg bundle)
            const PeerConstructor = window.SimplePeer || window.Peer;
            if (!PeerConstructor) {
                throw new Error("SimplePeer library not loaded. Please refresh the page.");
            }
            const peer = new PeerConstructor({ initiator: true, trickle: false, stream: stream });

            peer.on("signal", (data) => {
                console.log("DEBUG: Signal generated, emitting callUser");
                socket.emit("callUser", {
                    userToCall: id,
                    signalData: data,
                    from: me,
                    name: "Participant"
                });
            });

            peer.on("stream", (currentStream) => {
                console.log("DEBUG: Received remote stream!");
                if (userVideo.current) {
                    userVideo.current.srcObject = currentStream;
                    userVideo.current.play().catch(e => console.error("Play error:", e));
                }
            });

            peer.on("error", (err) => {
                console.error("DEBUG: Peer error:", err);
                alert("Connection Error: " + (err.message || "Failed to connect to peer"));
            });

            socket.on("callAccepted", (signal) => {
                console.log("DEBUG: Call accepted, signaling peer");
                setCallAccepted(true);
                peer.signal(signal);
            });

            connectionRef.current = peer;
        } catch (err) {
            console.error("DEBUG: Failed to initialize Peer:", err);
            alert("Application Error: Could not start video connection. Check your internet or browser settings.");
        }
    }

    const answerCall = () => {
        if (!stream) {
            alert("Please enable your camera and microphone first!");
            return;
        }

        try {
            console.log("DEBUG: Answering call from:", caller);
            setCallAccepted(true);
            const PeerConstructor = window.SimplePeer || window.Peer;
            if (!PeerConstructor) {
                throw new Error("SimplePeer library not loaded. Please refresh the page.");
            }
            const peer = new PeerConstructor({ initiator: false, trickle: false, stream: stream });

            peer.on("signal", (data) => {
                console.log("DEBUG: Answer signal generated, emitting answerCall");
                socket.emit("answerCall", { signal: data, to: caller });
            });

            peer.on("stream", (currentStream) => {
                console.log("DEBUG: Stream from caller received");
                if (userVideo.current) {
                    userVideo.current.srcObject = currentStream;
                    userVideo.current.play().catch(e => console.error("Play error:", e));
                }
            });

            peer.on("error", (err) => {
                console.error("DEBUG: Peer error (answer):", err);
                alert("Connection Error while answering.");
            });

            console.log("DEBUG: Signaling peer with caller data");
            peer.signal(callerSignal);
            connectionRef.current = peer;
        } catch (err) {
            console.error("DEBUG: Failed to initialize Answer Peer:", err);
            alert("Application Error: Could not answer call.");
        }
    }

    const handleToggleMic = () => {
        const newStatus = !isMicOn;
        toggleMic();
        if (partnerId) {
            socket.emit("toggle_mic", { to: partnerId, isMuted: !newStatus });
        }
    };

    const handleToggleCam = () => {
        const newStatus = !isCamOn;
        toggleCam();
        if (partnerId) {
            socket.emit("toggle_video", { to: partnerId, isVideoOff: !newStatus });
        }
    };

    const leaveCall = async () => {
        console.log("DEBUG: Leaving call and cleaning up...");

        // Final completion prompt for teachers
        if (isTeacher && bookingId && bookingInfo?.status !== 'completed') {
            if (window.confirm("Wait! Do you want to mark this course/session as COMPLETED and issue the certificate before leaving?")) {
                try {
                    await api.put(`/api/bookings/${bookingId}`,
                        { status: 'completed' }
                    );
                    alert("Session marked as completed! 🎉");
                } catch (err) {
                    console.error("Error auto-completing session", err);
                    alert("Failed to update status, but ending call.");
                }
            }
        }

        setCallEnded(true);

        if (connectionRef.current) {
            try {
                connectionRef.current.destroy();
            } catch (err) {
                console.error("DEBUG: Error destroying connection:", err);
            }
        }

        if (myVideo.current) myVideo.current.srcObject = null;
        if (userVideo.current) userVideo.current.srcObject = null;

        clearStream();
        navigate('/dashboard');
    };

    const markSessionComplete = async () => {
        if (!bookingId) return;
        if (window.confirm("Mark this session as COMPLETED and issue certificate to student?")) {
            try {
                await api.put(`/api/bookings/${bookingId}`,
                    { status: 'completed' }
                );
                setBookingInfo(prev => ({ ...prev, status: 'completed' }));
                alert("Session marked as completed! 🎉");
            } catch (err) {
                console.error("Error completing session", err);
                alert("Failed to update session status.");
            }
        }
    };

    const shareScreen = () => {
        navigator.mediaDevices.getDisplayMedia({ cursor: true })
            .then(screenStream => {
                if (connectionRef.current) {
                    connectionRef.current.replaceTrack(
                        stream.getVideoTracks()[0],
                        screenStream.getVideoTracks()[0],
                        stream
                    );
                }
                if (myVideo.current) {
                    myVideo.current.srcObject = screenStream;
                }
                screenStream.getVideoTracks()[0].onended = () => {
                    if (connectionRef.current) {
                        connectionRef.current.replaceTrack(
                            screenStream.getVideoTracks()[0],
                            stream.getVideoTracks()[0],
                            stream
                        );
                    }
                    if (myVideo.current) {
                        myVideo.current.srcObject = stream;
                    }
                };
            });
    }

    return (
        <div className="h-screen pt-16 bg-neutral-900 flex flex-col overflow-hidden relative">
            {/* Global Incoming Call Notification (Top Center) */}
            <AnimatePresence>
                {receivingCall && !callAccepted && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
                    >
                        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-[32px] shadow-2xl flex flex-col items-center gap-4 text-white">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
                                <Video className="text-green-400" size={32} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold">Incoming Call</h3>
                                <p className="text-neutral-400 text-sm">Participant wants to join your session.</p>
                            </div>
                            <button
                                onClick={() => {
                                    if (!stream) {
                                        alert("Please enable your camera and microphone first!");
                                        return;
                                    }
                                    answerCall();
                                    setIsJoined(true);
                                }}
                                className="w-full py-4 bg-green-500 hover:bg-green-600 text-black font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-green-500/20"
                            >
                                Start Learning Now
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ID Display Overlay (Top Right) */}
            <div className="absolute top-20 right-6 z-[60] flex flex-col items-end gap-2">
                <div className="bg-black shadow-2xl px-6 py-3 rounded-2xl border border-white/20 text-white flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-neutral-400 tracking-[0.2em] uppercase">Your Meeting ID</span>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-black text-blue-400 select-all">
                            {me || 'Connecting...'}
                        </span>
                        {me && (
                            <button
                                onClick={copyToClipboard}
                                className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors text-white/50 hover:text-white"
                            >
                                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {!isJoined ? (
                /* Pre-Join / Waiting Room UI */
                <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-neutral-800 to-neutral-900 min-h-0">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-neutral-800 p-8 rounded-[40px] shadow-2xl border border-white/5 max-w-2xl w-full text-center"
                    >
                        <h1 className="text-3xl font-bold text-white mb-2">Ready to join?</h1>
                        <p className="text-neutral-400 mb-8">Check your audio and video before entering the meeting.</p>

                        <div className="relative w-full aspect-video bg-neutral-900 rounded-[32px] overflow-hidden mb-8 border-4 border-neutral-700 shadow-inner group">
                            {stream ? (
                                <>
                                    <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
                                    {!isCamOn && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 border-2 border-red-500/20">
                                            <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                                                <VideoOff className="text-red-500" size={32} />
                                            </div>
                                            <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">Camera is off</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 p-8">
                                    <button
                                        onClick={enableDevices}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 transition-all hover:scale-105"
                                    >
                                        <Video size={20} /> Enable Camera & Mic
                                    </button>
                                    <p className="text-neutral-600 text-[10px] mt-4 uppercase tracking-[0.2em] font-bold">Hardware is currently disabled for your privacy</p>
                                </div>
                            )}

                            {/* Pre-join Toggles Overlay */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={handleToggleMic} className={`p-4 rounded-full ${isMicOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500 hover:bg-red-600'} text-white backdrop-blur-md transition-all`}>
                                    {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                                </button>
                                <button onClick={handleToggleCam} className={`p-4 rounded-full ${isCamOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500 hover:bg-red-600'} text-white backdrop-blur-md transition-all`}>
                                    {isCamOn ? <Video size={20} /> : <VideoOff size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Enter Meeting ID to Join"
                                    value={idToCall}
                                    onChange={(e) => setIdToCall(e.target.value)}
                                    className="flex-1 px-6 py-4 bg-neutral-700 border-none rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                />
                                <button
                                    onClick={() => {
                                        if (!stream) {
                                            alert("Please enable hardware first!");
                                            return;
                                        }
                                        if (idToCall) {
                                            callUser(idToCall);
                                            setIsJoined(true);
                                        } else {
                                            // Entering room as Teacher/Host without ID
                                            setIsJoined(true);
                                        }
                                    }}
                                    className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                                >
                                    {idToCall ? "Start Meeting" : "Enter Room"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            ) : (
                /* Main Meeting UI */
                <>
                    {/* Meeting Duration Timer */}
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[60]">
                        <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-white flex items-center gap-3 shadow-xl">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="font-mono font-bold tracking-wider">{formatTime(meetingTime)}</span>
                        </div>
                    </div>

                    {/* Main Video Area */}
                    <div className="flex-1 relative flex items-center justify-center p-4 md:p-8 min-h-0">
                        {/* Remote User Video (Large) */}
                        <div className="relative w-full h-full max-w-6xl bg-neutral-800 rounded-[40px] overflow-hidden shadow-2xl border border-white/5 flex items-center justify-center">
                            {callAccepted && !callEnded ? (
                                <>
                                    <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                                    {/* Partner Status Overlay */}
                                    <div className="absolute top-6 left-6 flex items-center gap-3">
                                        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                            Partner
                                            {!remoteMicOn && <MicOff size={14} className="text-red-400" />}
                                            {/* Remote Speaker Indicator */}
                                            {remoteMicOn && (
                                                <div className="flex gap-0.5 items-center">
                                                    {[1, 2, 3].map((i) => (
                                                        <motion.div
                                                            key={i}
                                                            animate={{ height: [4, 12, 4] }}
                                                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                                            className="w-1 bg-blue-400 rounded-full"
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {!remoteCamOn && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 z-10">
                                            <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                                                <VideoOff className="text-neutral-500" size={40} />
                                            </div>
                                            <p className="text-neutral-500 font-bold uppercase tracking-widest text-sm">Partner's Camera is Off</p>
                                        </div>
                                    )}
                                    {!remoteMicOn && (
                                        <div className="absolute top-6 right-6 p-3 bg-red-500/20 backdrop-blur-md rounded-2xl border border-red-500/30 text-red-500">
                                            <MicOff size={20} />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                        <Monitor className="text-neutral-500" size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-neutral-400">Waiting for partner...</h3>
                                    <p className="text-neutral-600 text-sm mt-2">Share your ID <b>{me}</b> to start learning.</p>
                                </div>
                            )}

                            {/* Local User Video (Floating PiP) */}
                            <motion.div
                                drag
                                whileDrag={{ scale: 1.05 }}
                                className="absolute bottom-6 right-6 w-32 sm:w-64 aspect-video bg-neutral-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 cursor-grab active:cursor-grabbing z-50"
                            >
                                <video playsInline muted ref={myVideo} autoPlay className={`w-full h-full object-cover transition-all ${isSpeaking ? 'ring-4 ring-blue-500 ring-inset' : ''}`} />
                                {!isCamOn && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 border-2 border-red-500/20">
                                        <VideoOff className="text-red-400 w-8 h-8 opacity-50" />
                                    </div>
                                )}
                                <div className="absolute top-2 left-2 flex items-center gap-2">
                                    <div className="px-2 py-0.5 bg-black/50 text-white text-[10px] rounded uppercase tracking-widest font-bold flex items-center gap-1.5">
                                        You
                                        {isSpeaking && (
                                            <div className="flex gap-0.5 items-center">
                                                {[1, 2, 3].map((i) => (
                                                    <motion.div
                                                        key={i}
                                                        animate={{ height: [3, 8, 3] }}
                                                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                                        className="w-0.5 bg-blue-400 rounded-full"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {!isMicOn && <div className="p-1 bg-red-500 rounded-lg text-white"><MicOff size={10} /></div>}
                                </div>
                            </motion.div>
                        </div>
                    </div>


                    {/* Controls Bar */}
                    <div className="pb-6 pt-2 flex items-center justify-center gap-4 px-4">
                        <div className="bg-neutral-800/80 backdrop-blur-2xl p-4 rounded-[32px] border border-white/5 flex items-center gap-2 shadow-2xl">
                            <ControlBtn
                                onClick={handleToggleMic}
                                active={isMicOn}
                                icon={isMicOn ? <Mic size={22} /> : <MicOff size={22} />}
                                label={isMicOn ? "Mute" : "Unmute"}
                                danger={!isMicOn}
                            />
                            <ControlBtn
                                onClick={handleToggleCam}
                                active={isCamOn}
                                icon={isCamOn ? <Video size={22} /> : <VideoOff size={22} />}
                                label={isCamOn ? "Stop Cam" : "Start Cam"}
                                danger={!isCamOn}
                            />
                            <div className="w-px h-8 bg-white/10 mx-2" />
                            <ControlBtn
                                onClick={shareScreen}
                                active={false}
                                icon={<Monitor size={22} />}
                                label="Share"
                            />
                            <ControlBtn
                                onClick={() => setShowWhiteboard(true)}
                                active={showWhiteboard}
                                icon={<MessageSquare size={22} />}
                                label="Tools"
                            />
                            {isTeacher && bookingInfo?.status !== 'completed' && (
                                <ControlBtn
                                    onClick={markSessionComplete}
                                    active={false}
                                    icon={<Award size={22} className="text-yellow-400" />}
                                    label="Complete"
                                />
                            )}
                            <button
                                onClick={leaveCall}
                                className="ml-4 bg-red-500 hover:bg-red-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20 transition-all hover:scale-110 active:scale-95"
                            >
                                <PhoneOff size={24} />
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Whiteboard Overlay */}
            {showWhiteboard && (
                <Whiteboard onClose={() => setShowWhiteboard(false)} />
            )}
        </div>
    );
};

// Helper Sub-component for Controls
const ControlBtn = ({ onClick, active, icon, label, danger }) => (
    <div className="flex flex-col items-center gap-1 group">
        <button
            onClick={onClick}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${danger
                ? 'bg-red-500 text-white'
                : (active ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-neutral-700 hover:bg-neutral-600 text-white/70')
                } hover:scale-110 active:scale-95`}
        >
            {icon}
        </button>
        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">{label}</span>
    </div>
);

export default VideoCall;
