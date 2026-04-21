import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HLSPlayerProps {
  url: string;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
  poster?: string;
}

const HLSPlayer: React.FC<HLSPlayerProps> = ({ 
  url, 
  autoPlay = true, 
  muted = true, 
  className,
  poster 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let hls: Hls | null = null;
    const video = videoRef.current;

    if (!video) return;

    const initPlayer = () => {
      setIsLoading(true);
      setError(null);

      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60,
        });

        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          if (autoPlay) {
            video.play().catch(e => console.error("Autoplay failed:", e));
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("Network error encountered, trying to recover...");
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("Media error encountered, trying to recover...");
                hls?.recoverMediaError();
                break;
              default:
                setError("Stream tidak dapat dimuat.");
                hls?.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          if (autoPlay) {
            video.play().catch(e => console.error("Autoplay failed:", e));
          }
        });
        video.addEventListener('error', () => {
          setError("Stream tidak didukung di browser ini.");
        });
      } else {
        setError("Browser tidak mendukung streaming HLS.");
      }
    };

    initPlayer();

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [url, autoPlay]);

  return (
    <div className={cn("relative w-full h-full bg-black flex items-center justify-center overflow-hidden group", className)}>
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay={autoPlay}
        muted={muted}
        playsInline
        poster={poster}
      />

      {/* Loading Overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10 transition-opacity duration-500">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
          <p className="text-primary font-mono text-xs uppercase tracking-widest animate-pulse">Establishing Secure Connection...</p>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 p-6 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-white font-bold mb-2">Signal Lost</h3>
          <p className="text-gray-400 text-xs mb-6 max-w-xs">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary/20 text-primary border border-primary/50 rounded-lg text-xs font-bold hover:bg-primary/30 transition-all uppercase tracking-wider"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Fake UI Overlays (CCTV Aesthetic) */}
      {!error && !isLoading && (
        <>
          <div className="absolute top-4 left-4 z-10">
            <div className="flex items-center gap-2 px-2 py-1 bg-black/40 backdrop-blur rounded border border-white/10">
              <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <span className="text-[10px] text-white font-mono font-bold tracking-tighter">REC • LIVE</span>
            </div>
          </div>
          
          <div className="absolute top-4 right-4 z-10">
            <span className="text-[10px] text-white/70 font-mono tracking-tighter bg-black/40 px-2 py-1 rounded border border-white/10">
              ENC: H.264 / 640x480
            </span>
          </div>

          <div className="absolute bottom-4 left-4 z-10 text-left">
            <p className="text-[10px] text-white font-mono opacity-80 mb-1">YOLOv8 DETECTOR ACTIVE</p>
            <div className="flex gap-2">
              <span className="w-1 h-1 bg-primary rounded-full animate-ping" />
              <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-progress-fast" />
              </div>
            </div>
          </div>

          {/* Grid/Scanline effects */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[size:20px_20px] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]" />
          <div className="absolute inset-0 scanline opacity-30 pointer-events-none" />
        </>
      )}
    </div>
  );
};

export default HLSPlayer;
