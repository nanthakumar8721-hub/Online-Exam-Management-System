import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, ScanFace } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

const CameraProctor = ({ onViolation, socket, userEmail, examName, examId }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [error, setError] = useState(null);
    const [model, setModel] = useState(null);
    const [isDetecting, setIsDetecting] = useState(false);
    
    // Tracking logic refs
    const suspiciousFrames = useRef(0);
    const frameCount = useRef(0);
    const violationCooldown = useRef(false);
    const analyzeInterval = useRef(null);

    // Initialize Camera and Model
    useEffect(() => {
        let stream = null;

        const init = async () => {
            try {
                // Request Camera
                stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setHasPermission(true);

                // Load TensorFlow Model
                await tf.ready();
                const loadedModel = await blazeface.load();
                setModel(loadedModel);
            } catch (err) {
                setError('Camera permission denied or model failed to load.');
                setHasPermission(false);
            }
        };

        init();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (analyzeInterval.current) {
                clearInterval(analyzeInterval.current);
            }
        };
    }, []);

    const triggerViolation = (reason) => {
        if (!onViolation || violationCooldown.current) return;
        
        onViolation(reason);
        violationCooldown.current = true;
        
        // 10 second cooldown before issuing another face tracking violation
        setTimeout(() => {
            violationCooldown.current = false;
        }, 10000);
    };

    const detectFace = async () => {
        if (!videoRef.current || !model || !hasPermission) return;
        if (videoRef.current.readyState !== 4) return;

        // Broadcast video frame to monitoring staff
        frameCount.current += 1;
        if (socket && frameCount.current % 4 === 0) { // Every ~2 seconds
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 320; // Lower resolution for bandwidth
                canvas.height = 240;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const frameData = canvas.toDataURL('image/jpeg', 0.4); // 40% quality

                socket.emit('video-frame', {
                    examId,
                    studentId: userEmail,
                    studentEmail: userEmail,
                    examName,
                    frame: frameData,
                    timestamp: Date.now()
                });
            } catch (err) {
                // Ignore canvas errors
            }
        }

        try {
            const predictions = await model.estimateFaces(videoRef.current, false);

            if (predictions.length === 0) {
                suspiciousFrames.current += 1;
                if (suspiciousFrames.current > 4) {
                    triggerViolation('Face Not Detected');
                    suspiciousFrames.current = 0;
                }
            } else if (predictions.length > 1) {
                suspiciousFrames.current += 1;
                if (suspiciousFrames.current > 3) {
                    if (onViolation) onViolation('Multiple Faces Detected', { immediateKick: true });
                    suspiciousFrames.current = 0;
                }
            } else {
                // One face detected, check orientation
                const face = predictions[0];
                const rightEye = face.landmarks[0];
                const leftEye = face.landmarks[1];
                const nose = face.landmarks[2];

                // Calculate distances
                const eyeDist = Math.abs(leftEye[0] - rightEye[0]);
                const distRight = Math.abs(nose[0] - rightEye[0]);
                const distLeft = Math.abs(leftEye[0] - nose[0]);

                // Check if nose is too close to one eye (indicating face is turned)
                // Threshold 0.2 means the nose is 80% towards one eye
                if (eyeDist > 0) {
                    const ratioRight = distRight / eyeDist;
                    const ratioLeft = distLeft / eyeDist;

                    if (ratioRight < 0.20 || ratioLeft < 0.20) {
                        suspiciousFrames.current += 1;
                        if (suspiciousFrames.current > 3) {
                            triggerViolation('Suspicious Head Movement (Turned Away)');
                            suspiciousFrames.current = 0;
                        }
                    } else {
                        // Reset if face is looking forward
                        suspiciousFrames.current = Math.max(0, suspiciousFrames.current - 1);
                    }
                }
            }
        } catch (err) {
            console.error("Face tracking error:", err);
        }
    };

    // Start detection loop when video plays
    useEffect(() => {
        if (hasPermission && model && !isDetecting) {
            setIsDetecting(true);
            analyzeInterval.current = setInterval(detectFace, 500); // Check every 500ms
        }
    }, [hasPermission, model, isDetecting]);

    return (
        <div className="bg-white/5 rounded-3xl p-6 border border-white/10 relative overflow-hidden">
            <h4 className="font-bold mb-4 flex items-center gap-2">
                <Camera size={16} className="text-brand-500" />
                Live Monitoring
            </h4>

            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/5">
                {!hasPermission && !error && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 animate-pulse">
                        <ScanFace size={24} className="mr-2 opacity-50" />
                        Initializing AI Proctor...
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-rose-500 p-4 text-center">
                        <CameraOff size={32} className="mb-2 opacity-50" />
                        <p className="text-xs">{error}</p>
                    </div>
                )}

                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full object-cover transition-opacity duration-500 ${hasPermission ? 'opacity-100' : 'opacity-0'}`}
                />

                <div className="absolute top-3 right-3 flex items-center gap-2 px-2 py-1 bg-rose-500/80 backdrop-blur-md rounded-lg scale-75 origin-right">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live</span>
                </div>
                
                {model && hasPermission && (
                    <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-emerald-500/80 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1 scale-75 origin-left">
                        <ScanFace size={12} /> AI Active
                    </div>
                )}
            </div>

            <p className="text-[10px] text-slate-500 mt-4 italic leading-relaxed">
                * Your video feed is analyzed locally by an AI model to detect suspicious head movements. Face data is not stored.
            </p>
        </div>
    );
};

export default CameraProctor;
