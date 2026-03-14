import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';

const CameraProctor = () => {
    const videoRef = useRef(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let stream = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setHasPermission(true);
            } catch (err) {
                setError('Camera permission denied or not found.');
                setHasPermission(false);
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="bg-white/5 rounded-3xl p-6 border border-white/10 relative overflow-hidden">
            <h4 className="font-bold mb-4 flex items-center gap-2">
                <Camera size={16} className="text-primary-500" />
                Live Monitoring
            </h4>

            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/5">
                {!hasPermission && !error && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 animate-pulse">
                        Starting camera...
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 p-4 text-center">
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

                <div className="absolute top-3 right-3 flex items-center gap-2 px-2 py-1 bg-red-500/80 backdrop-blur-md rounded-lg scale-75 origin-right">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live</span>
                </div>
            </div>

            <p className="text-[10px] text-slate-500 mt-3 italic">
                * Your video feed is visible only to the staff.
            </p>
        </div>
    );
};

export default CameraProctor;
