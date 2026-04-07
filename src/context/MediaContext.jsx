import React, { createContext, useState, useRef, useContext, useEffect } from 'react';

const MediaContext = createContext();

export const useMedia = () => useContext(MediaContext);

export const MediaProvider = ({ children }) => {
    const [stream, setStream] = useState(null);
    const [isCamOn, setIsCamOn] = useState(false);
    const [isMicOn, setIsMicOn] = useState(false);
    const streamRef = useRef();

    const stopTracks = (streamToStop) => {
        if (streamToStop && streamToStop.getTracks) {
            const tracks = streamToStop.getTracks();
            tracks.forEach(track => {
                track.enabled = false;
                track.stop();
            });
        }
    };

    const toggleCam = () => {
        if (stream) {
            const videoTracks = stream.getVideoTracks();
            const newStatus = !isCamOn;
            videoTracks.forEach(track => {
                track.enabled = newStatus;
            });
            setIsCamOn(newStatus);
        }
    };

    const toggleMic = () => {
        if (stream) {
            const audioTracks = stream.getAudioTracks();
            const newStatus = !isMicOn;
            audioTracks.forEach(track => {
                track.enabled = newStatus;
            });
            setIsMicOn(newStatus);
        }
    };

    const enableDevices = async () => {
        const tryGetMedia = async (constraints) => {
            try {
                const s = await navigator.mediaDevices.getUserMedia(constraints);
                return { stream: s };
            } catch (err) {
                return { error: err };
            }
        };

        // Try #1: Ideal Constraints (Optimized for Mobile & Modern PCs)
        let result = await tryGetMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: "user"
            },
            audio: true
        });

        // Try #2: Fallback to Basic (Fixed "Overconstrained" issues on older PC webcams)
        if (result.error && (result.error.name === 'OverconstrainedError' || result.error.name === 'ConstraintNotSatisfiedError')) {
            console.warn("⚠️ Ideal constraints failed, falling back to basic safe-mode...");
            result = await tryGetMedia({ video: true, audio: true });
        }

        if (result.error) {
            let userMessage = "Could not access Camera/Mic.";
            const errName = result.error.name;

            if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
                userMessage = "🚫 PERMISSION DENIED: Please click the 'Lock' icon in your browser address bar and allow Camera and Mic access.";
            } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
                userMessage = "🔌 HARDWARE NOT FOUND: I couldn't find a camera or microphone. Please check your USB connections.";
            } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
                userMessage = "📱 HARDWARE BUSY: Another app (like Zoom, Teams, or your Camera app) is already using your camera. Please close it and refresh this page.";
            } else {
                userMessage = `Hardware Error: ${result.error.message || 'Unknown Error'}. Please ensure you are on a secure (HTTPS) connection.`;
            }
            
            alert(userMessage);
            console.error("Detailed Media Error:", result.error);
        } else if (result.stream) {
            setStream(result.stream);
            streamRef.current = result.stream;
            setIsCamOn(true);
            setIsMicOn(true);
        }
    };

    // Global cleanup on window close/reload
    useEffect(() => {
        const cleanup = () => {
            if (streamRef.current) {
                stopTracks(streamRef.current);
            }
        };
        window.addEventListener('beforeunload', cleanup);
        return () => {
            window.removeEventListener('beforeunload', cleanup);
        };
    }, []);

    const clearStream = () => {
        // Try cleaning up via ref first (as it's the most recent reliable pointer)
        if (streamRef.current) {
            stopTracks(streamRef.current);
            streamRef.current = null;
        }

        // Secondary safeguard: check the state itself
        if (stream) {
            stopTracks(stream);
            setStream(null);
        }

        setIsCamOn(false);
        setIsMicOn(false);
    };

    return (
        <MediaContext.Provider value={{
            stream,
            setStream,
            isCamOn,
            isMicOn,
            toggleCam,
            toggleMic,
            enableDevices,
            clearStream
        }}>
            {children}
        </MediaContext.Provider>
    );
};
