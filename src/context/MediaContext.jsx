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
        try {
            const initialStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(initialStream);
            streamRef.current = initialStream;
            setIsCamOn(true);
            setIsMicOn(true);
        } catch (err) {
            console.error("Failed to enable devices", err);
            alert("Camera and Mic permissions are required.");
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
