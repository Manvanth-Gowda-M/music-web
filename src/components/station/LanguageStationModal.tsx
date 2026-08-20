'use client';

import React, { useState } from 'react';
import {
  Globe2,
  Sparkles,
  Radio,
  Play,
  Pause,
  X,
  Search,
  Check,
  Disc,
  Volume2,
  ChevronRight,
  Music,
  Flame,
} from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useWorldStore } from '@/store/worldStore';
import { LANGUAGES, SONG_THEMES, LanguageOption, SongThemeOption } from '@/data/languagesAndThemes';
import { AudioEngine } from '@/services/audio/AudioEngine';

export const LanguageStationModal: React.FC = () => {
  const {
    isStationModalOpen,
    setStationModalOpen,
    selectedLanguage,
    selectedTheme,
    playStation,
    isLoading,
    isPlaying,
    currentTrack,
    togglePlay,
  } = usePlayerStore();

  const { currentWorld } = useWorldStore();
  const [localQuery, setLocalQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'stations' | 'languages'>('stations');

  if (!isStationModalOpen) return null;

  const currentLangObj = LANGUAGES.find((l) => l.id === selectedLanguage) || LANGUAGES[0];
  const currentThemeObj = SONG_THEMES.find((t) => t.id === selectedTheme);

  const handleSelectLanguage = async (langId: string) => {
    await AudioEngine.resumeContext();
    await playStation(langId, selectedTheme, localQuery);
  };

  const handleSelectTheme = async (themeId: string) => {
    await AudioEngine.resumeContext();
    const nextTheme = selectedTheme === themeId ? null : themeId;
    await playStation(selectedLanguage, nextTheme, localQuery);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localQuery.trim()) return;
    await AudioEngine.resumeContext();
    await playStation(selectedLanguage, selectedTheme, localQuery.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in pointer-events-auto select-none safe-bottom">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={() => setStationModalOpen(false)}
      />

      {/* Modal Container */}
      <div
        className="relative z-10 w-full max-w-4xl max-h-[90dvh] sm:max-h-[85vh] rounded-t-[32px] sm:rounded-3xl border p-4 sm:p-7 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          borderColor: currentWorld.palette.border,
          backgroundColor: currentWorld.palette.glassBg,
          boxShadow: `0 25px 60px rgba(0,0,0,0.85), 0 0 40px ${currentWorld.palette.glow}`,
        }}
      >
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center border shadow-lg"
              style={{
                borderColor: currentWorld.palette.accent,
                backgroundColor: currentWorld.palette.accentMuted,
              }}
            >
              <Radio
                className="w-5 h-5 animate-pulse"
                style={{ color: currentWorld.palette.accent }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-kannada font-bold text-base sm:text-xl text-white">
                  ಭಾಷೆ & ಸಂಗೀತ ಶೈಲಿ (Station Hub)
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/10 text-slate-300 hidden xs:inline">
                  320 KBPS LIVE
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 font-light mt-0.5">
                Pick your language and song vibe • Instant live streaming
              </p>
            </div>
          </div>

          <button
            onClick={() => setStationModalOpen(false)}
            aria-label="Close Station Selector"
            className="min-w-[38px] min-h-[38px] p-2 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/10 active:scale-90 text-slate-300 transition-all flex items-center justify-center touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Station Banner */}
        <div
          className="mt-3 p-3 rounded-2xl border flex items-center justify-between gap-2 flex-shrink-0"
          style={{
            background: 'linear-gradient(90deg, rgba(236,72,153,0.15) 0%, rgba(56,189,248,0.15) 100%)',
            borderColor: 'rgba(255, 255, 255, 0.15)',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="text-xl sm:text-2xl flex-shrink-0">{currentLangObj.flag}</div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>ACTIVE LIVE STATION</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                {currentLangObj.name} ({currentLangObj.nativeName}) •{' '}
                {currentThemeObj ? currentThemeObj.title : 'All Melodies & Hits'}
              </h4>
            </div>
          </div>

          {isPlaying && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] text-pink-300 font-medium flex-shrink-0">
              <Disc className="w-3 h-3 animate-spin text-pink-400" />
              <span className="hidden sm:inline">Streaming Now</span>
            </div>
          )}
        </div>

        {/* Search Bar for specific song in language */}
        <form
          onSubmit={handleSearchSubmit}
          className="mt-3 relative flex items-center flex-shrink-0"
        >
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder={`Search song or singer in ${currentLangObj.name}... (e.g. Sanjith Hegde, Arijit, Anirudh)`}
            className="w-full pl-10 pr-24 py-2 sm:py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 active:scale-95 text-white text-[11px] font-semibold flex items-center gap-1 transition-all touch-manipulation"
          >
            {isLoading ? <Disc className="w-3 h-3 animate-spin" /> : <span>TUNE IN</span>}
          </button>
        </form>

        {/* Scrollable Main Content */}
        <div className="mt-3.5 overflow-y-auto space-y-4 pr-1 smooth-scroll flex-1">
          {/* SECTION 1: LANGUAGE SELECTION */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                1. Select Language (ಭಾಷೆ ಆಯ್ಕೆ)
              </span>
              <span className="text-[10px] text-slate-400 font-light">
                {LANGUAGES.length} Languages available
              </span>
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => handleSelectLanguage(lang.id)}
                    disabled={isLoading}
                    className={`relative p-2.5 rounded-2xl border text-left transition-all duration-200 active:scale-95 touch-manipulation flex flex-col justify-between group ${
                      isSelected
                        ? 'ring-2 ring-offset-1 ring-offset-black scale-[1.02] shadow-lg'
                        : 'hover:border-white/30 opacity-85 hover:opacity-100 bg-black/30'
                    }`}
                    style={{
                      borderColor: isSelected ? lang.color : 'rgba(255,255,255,0.1)',
                      backgroundColor: isSelected ? `${lang.color}22` : 'rgba(10, 10, 15, 0.45)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-lg">{lang.flag}</span>
                      {isSelected && (
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: lang.color }}
                        >
                          <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-white leading-tight">
                        {lang.name}
                      </h5>
                      <p className="text-[10px] text-slate-300 font-kannada mt-0.5 truncate">
                        {lang.nativeName}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: SONG THEMES / KINDS OF SONGS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                2. Select Music Vibe / Song Kind (ಸಂಗೀತ ಶೈಲಿ)
              </span>
              <span className="text-[10px] text-slate-400 font-light">
                {SONG_THEMES.length} Curated Station Modes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {SONG_THEMES.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme.id)}
                    disabled={isLoading}
                    className={`relative p-3 rounded-2xl border text-left transition-all duration-200 active:scale-98 touch-manipulation flex items-center gap-3 group ${
                      isSelected
                        ? 'ring-2 ring-offset-1 ring-offset-black scale-[1.01] shadow-xl'
                        : 'hover:border-white/30 opacity-85 hover:opacity-100 bg-black/30'
                    }`}
                    style={{
                      borderColor: isSelected ? theme.color : 'rgba(255,255,255,0.1)',
                      backgroundColor: isSelected ? `${theme.color}25` : 'rgba(12, 12, 18, 0.5)',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border"
                      style={{
                        borderColor: isSelected ? theme.color : 'rgba(255,255,255,0.15)',
                        backgroundColor: `${theme.color}20`,
                      }}
                    >
                      {theme.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="font-bold text-xs sm:text-sm text-white truncate">
                          {theme.title}
                        </h5>
                        {isSelected && (
                          <span
                            className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded text-black"
                            style={{ backgroundColor: theme.color }}
                          >
                            PLAYING
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 font-kannada truncate">
                        {theme.nativeTitle}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5 font-light">
                        {theme.tagline}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 flex-shrink-0">
          <span className="flex items-center gap-1.5 font-sans">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            Seamless 320 kbps continuous playback with auto-next
          </span>
          <button
            onClick={() => setStationModalOpen(false)}
            className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
