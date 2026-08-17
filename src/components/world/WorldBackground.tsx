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

  // Ensure active video is playing
  useEffect(() => {
    if (activeVideoRef.current && !settings.reducedMotion) {
      activeVideoRef.current.play().catch(() => {});
    }
  }, [currentWorld.id, settings.reducedMotion]);

  const handleVideoError = (worldId: string) => {
    setVideoError((prev) => ({ ...prev, [worldId]: true }));
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 select-none bg-black">
      {/* Previous World Video during smooth crossfade */}
      {isTransitioning && previousWorld && (
        <div className="absolute inset-0 w-full h-full animate-fade-out pointer-events-none z-0">
          {!videoError[previousWorld.id] && !settings.reducedMotion ? (
            <video
              src={previousWorld.video}
              poster={previousWorld.poster}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          ) : (
            <img
              src={previousWorld.poster}
              alt={previousWorld.name}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          )}
        </div>
      )}

      {/* Current Active World Video (Full 100% Viewport Coverage) */}
      <div
        key={currentWorld.id}
        className="absolute inset-0 w-full h-full animate-fade-in z-0"
      >
        {!videoError[currentWorld.id] && !settings.reducedMotion ? (
          <video
            ref={(el) => {
              activeVideoRef.current = el;
              if (el) {
                el.muted = !settings.isAmbientEnabled;
                el.volume = Math.max(0, Math.min(1, settings.ambientVolume));
              }
            }}
            src={currentWorld.video}
            poster={currentWorld.poster}
            autoPlay
            muted={!settings.isAmbientEnabled}
            loop
            playsInline
            onError={() => handleVideoError(currentWorld.id)}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <img
            src={currentWorld.poster}
            alt={currentWorld.name}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        )}
      </div>

      {/* Subtle Readability Vignette: Soft gradient preserving maximum video visibility */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: `
            radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 40%, rgba(5, 8, 15, 0.40) 100%),
            linear-gradient(to top, rgba(5, 8, 15, 0.70) 0%, transparent 25%, transparent 75%, rgba(5, 8, 15, 0.55) 100%)
          `,
        }}
      />
    </div>
  );
};
