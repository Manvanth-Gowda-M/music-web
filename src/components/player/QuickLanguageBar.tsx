'use client';

import React from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useWorldStore } from '@/store/worldStore';
import { LANGUAGES, SONG_THEMES } from '@/data/languagesAndThemes';
import { AudioEngine } from '@/services/audio/AudioEngine';
import { Sparkles, Radio, Globe2 } from 'lucide-react';

export const QuickLanguageBar: React.FC = () => {
  const {
    selectedLanguage,
    selectedTheme,
    playStation,
    setStationModalOpen,
    isLoading,
  } = usePlayerStore();

  const { currentWorld } = useWorldStore();

  const activeMoodId = selectedTheme || currentWorld.defaultMood || 'Lofi';
  const activeMoodObj = SONG_THEMES.find((m) => m.id === activeMoodId) || SONG_THEMES[0];

  const handleLanguageClick = async (langId: string) => {
    await AudioEngine.resumeContext();
    await playStation(langId, activeMoodId);
  };

  return (
    <div className="w-full max-w-lg mx-auto mb-1 px-1 sm:px-2 flex items-center justify-between gap-1 select-none pointer-events-auto">
      {/* Language Chips Scrollable Row */}
      <div className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar touch-pan-x flex-1 min-w-0">
        {LANGUAGES.map((lang) => {
          const isSelected = (selectedLanguage || 'Kannada') === lang.id;
          return (
            <button
              key={lang.id}
              onClick={() => handleLanguageClick(lang.id)}
              disabled={isLoading}
              title={`Switch to ${lang.name} (${lang.nativeName})`}
              className={`flex-shrink-0 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold transition-all duration-200 border flex items-center gap-1 active:scale-95 touch-manipulation backdrop-blur-xl ${
                isSelected
                  ? 'bg-white text-slate-950 font-bold shadow-md scale-105'
                  : 'bg-black/40 hover:bg-black/60 text-slate-200 border-white/10 hover:border-white/25'
              }`}
              style={{
                borderColor: isSelected ? lang.color : 'rgba(255, 255, 255, 0.12)',
              }}
            >
              <span>{lang.flag}</span>
              <span>{lang.nativeName.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Mood / Station Hub pill */}
      <button
        onClick={() => setStationModalOpen(true)}
        title="Change Song Theme / Vibe"
        className="flex-shrink-0 px-2 py-1 rounded-full border border-pink-500/30 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 touch-manipulation backdrop-blur-xl"
      >
        <span>{activeMoodObj.icon}</span>
        <span className="hidden xs:inline">{activeMoodObj.title.split('&')[0].trim()}</span>
      </button>
    </div>
  );
};
