'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Sparkles, Disc, Compass } from 'lucide-react';
import { useWorldStore } from '@/store/worldStore';
import { usePlayerStore } from '@/store/playerStore';

interface WorldHeroProps {
  onToggleWorldSelector: () => void;
}

export const WorldHero: React.FC<WorldHeroProps> = ({ onToggleWorldSelector }) => {
  const { currentWorld, isTransitioning } = useWorldStore();
  const { playTrack, isPlaying, currentTrack, togglePlay } = usePlayerStore();

  const [isVisible, setIsVisible] = useState(true);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isCurrentWorldPlaying = isPlaying && currentTrack?.worldId === currentWorld.id;

  // Fade-in on world change, stay visible for 3 seconds, then gracefully fade away
  const triggerAutoFade = useCallback(() => {
    setIsVisible(true);
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
    }
    fadeTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  }, []);

  // Whenever world ID changes, show title for 3 seconds then fade out
  useEffect(() => {
    triggerAutoFade();
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [currentWorld.id, triggerAutoFade]);

  const handlePlayWorld = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentWorldPlaying) {
      togglePlay();
      return;
    }

    const allTracks = currentWorld.recommendedPlaylists.flatMap((p) => p.tracks);
    if (allTracks.length > 0) {
      const shuffled = [...allTracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  };

  return (
    <div
      onClick={triggerAutoFade}
      className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-3xl mx-auto w-full pointer-events-auto select-none my-auto"
    >
      {/* Cinematic Ambient Title: Smooth 3-second Auto-fade */}
      <div
        className={`flex flex-col items-center justify-center transition-all duration-1000 ease-in-out transform ${
          isVisible && !isTransitioning
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
        }`}
      >
        {/* Ambient Mood Badge */}
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border mb-2.5 sm:mb-4 backdrop-blur-2xl transition-colors duration-500 shadow-xl"
          style={{
            borderColor: currentWorld.palette.border,
            backgroundColor: currentWorld.palette.glassBg,
            boxShadow: `0 0 20px ${currentWorld.palette.glow}`,
          }}
        >
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: currentWorld.palette.accent }} />
          <span className="text-[10px] sm:text-xs font-medium text-slate-200 tracking-wide">
            {currentWorld.ambientCategory}
          </span>
        </div>

        {/* Kannada Primary Title */}
        <h1 className="font-kannada font-extrabold text-3xl sm:text-5xl md:text-6xl text-white tracking-tight drop-shadow-2xl mb-1 leading-tight">
          {currentWorld.localizedName}
        </h1>

        {/* English Secondary Title */}
        <h2 className="text-base sm:text-xl md:text-2xl font-serif italic text-slate-100/90 font-light tracking-wide mb-2 drop-shadow-md">
          {currentWorld.name}
        </h2>

        {/* Tagline */}
        <p className="text-xs sm:text-sm text-slate-200/80 max-w-md font-sans font-light leading-relaxed mb-5 drop-shadow-sm px-2">
          "{currentWorld.tagline}"
        </p>

        {/* Subtle Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handlePlayWorld}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-xs sm:text-sm text-slate-950 transition-all duration-300 active:scale-95 shadow-xl touch-manipulation"
            style={{
              backgroundColor: currentWorld.palette.accent,
              boxShadow: `0 4px 20px ${currentWorld.palette.glow}`,
            }}
          >
            <div className="w-5 h-5 rounded-full bg-slate-950/15 flex items-center justify-center">
              {isCurrentWorldPlaying ? (
                <Disc className="w-3 h-3 text-slate-950 animate-spin" />
              ) : (
                <Play className="w-3 h-3 text-slate-950 fill-current ml-0.5" />
              )}
            </div>
            <span className="font-semibold">
              {isCurrentWorldPlaying ? 'Pause' : 'Listen Now'}
            </span>
            <span className="font-kannada text-xs opacity-75">• ಕೇಳಿ</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWorldSelector();
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full font-medium text-xs sm:text-sm text-white/90 border border-white/15 hover:border-white/30 hover:bg-white/10 active:scale-95 backdrop-blur-xl transition-all duration-300 touch-manipulation"
            style={{ backgroundColor: currentWorld.palette.glassBg }}
          >
            <Compass className="w-3.5 h-3.5 text-slate-300" />
            <span>Switch World</span>
          </button>
        </div>
      </div>
    </div>
  );
};
