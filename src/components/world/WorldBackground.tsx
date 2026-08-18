'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useWorldStore } from '@/store/worldStore';

export const WorldBackground: React.FC = () => {
  const { currentWorld, previousWorld, isTransitioning, settings } = useWorldStore();
  const [videoError, setVideoError] = useState<Record<string, boolean>>({});

  const activeVideoRef = useRef<HTMLVideoElement | null>(null);

  // Manage video playback & tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        activeVideoRef.current?.pause();
      } else {
        activeVideoRef.current?.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Ensure active video is playing and attributes are properly set for mobile
  useEffect(() => {
    const video = activeVideoRef.current;
    if (video && !settings.reducedMotion) {
      video.defaultMuted = true;
      video.muted = !settings.isAmbientEnabled;
      video.playsInline = true;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.setAttribute('x5-playsinline', 'true');
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Retry with muted state if mobile policy requires it
          if (!video.muted) {
            video.muted = true;
            video.play().catch(() => {});
          }
        });
      }
    }
  }, [currentWorld.id, settings.reducedMotion, settings.isAmbientEnabled]);

  const handleVideoError = (worldId: string) => {
    setVideoError((prev) => ({ ...prev, [worldId]: true }));
  };

  const isCover = settings.videoFit !== 'contain';

  return (
    <div className="fixed inset-0 w-screen h-screen h-[100dvh] overflow-hidden pointer-events-none z-0 bg-black">
      {/* Background Ambient Glow / Backdrop when in contain mode */}
      {!isCover && (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          {!videoError[currentWorld.id] && !settings.reducedMotion ? (
            <video
              src={currentWorld.video}
              poster={currentWorld.poster}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="w-full h-full object-cover filter blur-3xl scale-125 opacity-50"
            />
          ) : (
            <img
              src={currentWorld.poster}
              alt={currentWorld.name}
              className="w-full h-full object-cover filter blur-3xl scale-125 opacity-50"
            />
          )}
        </div>
      )}

      {/* Previous World Video during smooth crossfade */}
      {isTransitioning && previousWorld && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center animate-fade-out pointer-events-none z-[1]">
          {!videoError[previousWorld.id] && !settings.reducedMotion ? (
            <video
              src={previousWorld.video}
              poster={previousWorld.poster}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <img
              src={previousWorld.poster}
              alt={previousWorld.name}
              className="w-full h-full object-cover object-center"
            />
          )}
        </div>
      )}

      {/* Current Active World Video Layer (Always fills full viewport) */}
      <div
        key={currentWorld.id}
        className="absolute inset-0 w-full h-full flex items-center justify-center animate-fade-in z-[2]"
      >
        {!videoError[currentWorld.id] && !settings.reducedMotion ? (
          <video
            ref={(el) => {
              activeVideoRef.current = el;
              if (el) {
                el.defaultMuted = true;
                el.muted = !settings.isAmbientEnabled;
                el.volume = Math.max(0, Math.min(1, settings.ambientVolume));
                el.playsInline = true;
                el.setAttribute('playsinline', 'true');
                el.setAttribute('webkit-playsinline', 'true');
                el.setAttribute('x5-playsinline', 'true');
              }
            }}
            src={currentWorld.video}
            poster={currentWorld.poster}
            autoPlay
            muted={!settings.isAmbientEnabled}
            loop
            playsInline
            preload="auto"
            onError={() => handleVideoError(currentWorld.id)}
            className={`w-full h-full transition-all duration-700 ${
              isCover ? 'object-cover object-center' : 'object-contain object-center'
            }`}
          />
        ) : (
          <img
            src={currentWorld.poster}
            alt={currentWorld.name}
            className={`w-full h-full transition-all duration-700 ${
              isCover ? 'object-cover object-center' : 'object-contain object-center'
            }`}
          />
        )}
      </div>

      {/* Subtle Readability Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-[3]"
        style={{
          background: `
            radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 40%, rgba(5, 8, 15, 0.4) 100%),
            linear-gradient(to top, rgba(5, 8, 15, 0.7) 0%, transparent 35%, transparent 65%, rgba(5, 8, 15, 0.5) 100%)
          `,
        }}
      />
    </div>
  );
};
