'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Sparkles, Disc, Compass } from 'lucide-react';
import { useWorldStore } from '@/store/worldStore';
import { usePlayerStore } from '@/store/playerStore';
import { getLocalizedWorld } from '@/data/translations';

interface WorldHeroProps {
  onToggleWorldSelector: () => void;
}

export const WorldHero: React.FC<WorldHeroProps> = ({ onToggleWorldSelector }) => {
  const { currentWorld, isTransitioning } = useWorldStore();
  const { playTrack, isPlaying, currentTrack, togglePlay, selectedLanguage } = usePlayerStore();

  const [isVisible, setIsVisible] = useState(true);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isCurrentWorldPlaying = isPlaying && currentTrack?.worldId === currentWorld.id;
  const activeLang = selectedLanguage || 'Kannada';
  const localized = getLocalizedWorld(currentWorld.id, activeLang);

  // Fade-in on world or language change, stay visible for 3 seconds, then gracefully fade away
  const triggerAutoFade = useCallback(() => {
    setIsVisible(true);
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
    }
    fadeTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 3500);
  }, []);

  // Whenever world ID or language changes, show title for 3.5 seconds then fade out
  useEffect(() => {
    triggerAutoFade();
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [currentWorld.id, activeLang, triggerAutoFade]);

  const handlePlayWorld = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentWorldPlaying) {
      togglePlay();
      return;
    }

    const player = usePlayerStore.getState();
    const defaultMood = currentWorld.defaultMood || 'Lofi';

    if (currentWorld.id === 'universal-mode' || (player.selectedLanguage && player.selectedLanguage !== 'Kannada')) {
      await player.playStation(player.selectedLanguage || 'Kannada', defaultMood);
      return;
    }

    const allTracks = currentWorld.recommendedPlaylists.flatMap((p) => p.tracks);
    if (allTracks.length > 0) {
      const shuffled = [...allTracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    } else {
      await player.playStation('Kannada', defaultMood);
    }
  };

  return (
    <div
      onClick={triggerAutoFade}
      className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-2xl mx-auto w-full pointer-events-auto select-none pt-2 pb-44 sm:pb-56"
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
          className="inline-flex items-center gap-2 px-3 py-0.5 sm:py-1 rounded-full border mb-2 backdrop-blur-2xl transition-colors duration-500 shadow-xl"
          style={{
            borderColor: currentWorld.palette.border,
            backgroundColor: currentWorld.palette.glassBg,
            boxShadow: `0 0 20px ${currentWorld.palette.glow}`,
          }}
        >
          <Sparkles className="w-3 h-3" style={{ color: currentWorld.palette.accent }} />
          <span className="text-[10px] sm:text-xs font-medium text-slate-200 tracking-wide">
            {currentWorld.ambientCategory}
          </span>
        </div>

        {/* Primary Localized Title */}
        <h1 className="font-extrabold text-2xl sm:text-4xl md:text-5xl text-white tracking-tight drop-shadow-2xl mb-1 leading-tight">
          {localized.name}
        </h1>

        {/* English Secondary Title */}
        {activeLang !== 'English' && (
          <h2 className="text-sm sm:text-lg md:text-xl font-serif italic text-slate-100/90 font-light tracking-wide mb-1.5 drop-shadow-md">
            {currentWorld.name}
          </h2>
        )}

        {/* Localized Tagline */}
        <p className="text-xs sm:text-sm text-slate-200/80 max-w-md font-sans font-light leading-relaxed mb-3 sm:mb-4 drop-shadow-sm px-2">
          "{localized.tagline}"
        </p>

        {/* Subtle Action Buttons */}
        <div className="flex items-center justify-center gap-2.5">
          <button
            onClick={handlePlayWorld}
            className="group flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-medium text-xs sm:text-sm text-slate-950 transition-all duration-300 active:scale-95 shadow-xl touch-manipulation"
            style={{
              backgroundColor: currentWorld.palette.accent,
              boxShadow: `0 4px 20px ${currentWorld.palette.glow}`,
            }}
          >
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-950/15 flex items-center justify-center">
              {isCurrentWorldPlaying ? (
                <Disc className="w-3 h-3 text-slate-950 animate-spin" />
              ) : (
                <Play className="w-3 h-3 text-slate-950 fill-current ml-0.5" />
              )}
            </div>
            <span className="font-semibold">
              {isCurrentWorldPlaying ? 'Pause' : 'Listen Now'}
            </span>
            <span className="text-xs opacity-75">• {localized.listenAction}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWorldSelector();
            }}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full font-medium text-xs sm:text-sm text-white/90 border border-white/15 hover:border-white/30 hover:bg-white/10 active:scale-95 backdrop-blur-xl transition-all duration-300 touch-manipulation"
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
