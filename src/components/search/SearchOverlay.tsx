'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Play,
  Pause,
  Plus,
  Music,
  Loader2,
  Sparkles,
  Radio,
  Globe2,
  Check,
} from 'lucide-react';
import { useWorldStore } from '@/store/worldStore';
import { usePlayerStore } from '@/store/playerStore';
import { MusicService } from '@/services/audio/MusicService';
import { AudioEngine } from '@/services/audio/AudioEngine';
import { Track } from '@/types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const LANGUAGES = [
  { id: 'Kannada', label: 'ಕನ್ನಡ', sub: 'Kannada', color: '#f59e0b' },
  { id: 'Hindi', label: 'हिंदी', sub: 'Hindi', color: '#ef4444' },
  { id: 'Tamil', label: 'தமிழ்', sub: 'Tamil', color: '#3b82f6' },
  { id: 'Telugu', label: 'తెలుగు', sub: 'Telugu', color: '#10b981' },
  { id: 'Malayalam', label: 'മലയാളം', sub: 'Malayalam', color: '#8b5cf6' },
  { id: 'English', label: 'English', sub: 'Global Pop', color: '#06b6d4' },
  { id: 'All', label: '🌐 All', sub: 'Universal', color: '#e2e8f0' },
];

const MOODS = [
  { id: 'Lofi', label: '🌧️ Lofi & Rain', knLabel: 'ಲೋಫೈ & ಮಳೆ', query: 'lofi chill' },
  { id: 'Party', label: '🎉 Party & Dance', knLabel: 'ಪಾರ್ಟಿ ಡ್ಯಾನ್ಸ್', query: 'party dance fast' },
  { id: 'Acoustic', label: '☕ Acoustic & Chill', knLabel: 'ಅಕೌಸ್ಟಿಕ್ ಮೆಲೋಡಿ', query: 'acoustic unplugged calm' },
  { id: 'Devotional', label: '🛕 Devotional & Ragas', knLabel: 'ಭಕ್ತಿ & ಶಾಂತಿ', query: 'devotional classical raga bhakti' },
  { id: 'Romantic', label: '❤️ Romance & Love', knLabel: 'ಪ್ರೇಮ ಗೀತೆಗಳು', query: 'love romantic melody' },
  { id: 'Drive', label: '🚗 Night Highway Drive', knLabel: 'ರಾತ್ರಿ ಪಯಣ', query: 'night drive highway travel' },
  { id: 'Retro', label: '📻 Golden 80s & 90s', knLabel: 'ಹಳೆಯ ಕ್ಲಾಸಿಕ್ಸ್', query: 'retro 80s 90s classic evergreen' },
  { id: 'Bass', label: '⚡ Bass Boosted & EDM', knLabel: 'ಹೈ ಎನರ್ಜಿ', query: 'edm bass boosted remix' },
  { id: 'Sad', label: '🌙 Soulful & Sad', knLabel: 'ಭಾವಪೂರ್ಣ', query: 'sad emotional heart touching' },
];

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '3:45';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState('Kannada');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [results, setResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedQueueId, setAddedQueueId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { currentWorld } = useWorldStore();
  const { playTrack, addToQueue, currentTrack, isPlaying, togglePlay } = usePlayerStore();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      executeSearch(query, selectedLang, selectedMood);
    }
  }, [isOpen]);

  const executeSearch = async (qText: string, lang: string, moodId: string | null) => {
    setIsSearching(true);
    try {
      const moodObj = MOODS.find((m) => m.id === moodId);
      const moodQuery = moodObj ? moodObj.query : '';
      const finalQuery = qText || moodQuery;

      const tracks = await MusicService.search(finalQuery, lang, moodId || '');
      setResults(tracks);
    } catch (e) {
      console.warn('Universal Search error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      executeSearch(val, selectedLang, selectedMood);
    }, 350);
  };

  const handleLanguageSelect = (langId: string) => {
    setSelectedLang(langId);
    executeSearch(query, langId, selectedMood);
  };

  const handleMoodSelect = (moodId: string) => {
    const nextMood = selectedMood === moodId ? null : moodId;
    setSelectedMood(nextMood);
    executeSearch(query, selectedLang, nextMood);
  };

  const handlePlaySong = async (track: Track) => {
    await AudioEngine.resumeContext();
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, results);
      onClose();
    }
  };

  const handleAddToQueue = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    addToQueue(track);
    setAddedQueueId(track.id);
    setTimeout(() => setAddedQueueId(null), 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-2xl animate-fade-in pointer-events-auto select-none safe-bottom">
      {/* Backdrop overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Universal Music Hub Modal */}
      <div
        className="relative z-10 w-full max-w-3xl h-[92dvh] sm:h-[85vh] rounded-t-[32px] sm:rounded-[36px] border flex flex-col backdrop-blur-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden transition-all"
        style={{
          borderColor: currentWorld.palette.border,
          backgroundColor: 'rgba(14, 16, 22, 0.88)',
          boxShadow: `0 25px 70px rgba(0, 0, 0, 0.9), 0 0 40px ${currentWorld.palette.glow}`,
        }}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mt-2.5 sm:hidden flex-shrink-0" />

        {/* ========================================================================= */}
        {/* TOP SEARCH HEADER BAR */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 pb-3 border-b border-white/10 flex-shrink-0 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                <Globe2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Universal Music Hub
                </h2>
                <p className="text-[10px] font-kannada text-slate-400">
                  ಯಾವುದೇ ಹಾಡು, ಭಾಷೆ, ಮೂಡ್ ಹುಡುಕಿ & ಆಲಿಸಿ
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="min-w-[36px] min-h-[36px] p-2 rounded-full border border-white/15 hover:border-white/40 hover:bg-white/10 text-slate-300 transition-all flex items-center justify-center touch-manipulation active:scale-90"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Input Box */}
          <div
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border transition-all"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              borderColor: query ? currentWorld.palette.accent : 'rgba(255, 255, 255, 0.15)',
              boxShadow: query ? `0 0 15px ${currentWorld.palette.glow}` : 'none',
            }}
          >
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search any song, artist, movie, actor (e.g. Sanju Weds Geetha, Arijit, SPB, AR Rahman)..."
              className="flex-1 bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none font-sans font-light"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  executeSearch('', selectedLang, selectedMood);
                }}
                className="p-1 text-slate-400 hover:text-white transition-colors rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 1. LANGUAGE SELECTOR PILLS */}
          {/* ========================================================================= */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
                Language / ಭಾಷೆ:
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar touch-pan-x">
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => handleLanguageSelect(lang.id)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border flex items-center gap-1.5 active:scale-95 touch-manipulation ${
                      isSelected
                        ? 'bg-white text-black font-bold shadow-lg'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                    style={{
                      borderColor: isSelected ? lang.color : 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <span>{lang.label}</span>
                    <span className={`text-[9px] opacity-70 ${isSelected ? 'text-black/70' : 'text-slate-400'}`}>
                      {lang.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. MOOD & VIBE CHIPS */}
          {/* ========================================================================= */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
                Mood & Vibe / ಮನಸ್ಥಿತಿ:
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar touch-pan-x">
              {MOODS.map((m) => {
                const isSelected = selectedMood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleMoodSelect(m.id)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all duration-200 border flex items-center gap-1 active:scale-95 touch-manipulation ${
                      isSelected
                        ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RESULTS SCROLLABLE LIST */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2.5 pr-1.5 smooth-scroll">
          {isSearching ? (
            <div className="text-center py-16 text-slate-400">
              <Loader2 className="w-8 h-8 mx-auto animate-spin mb-3 text-amber-400" />
              <p className="text-sm font-medium text-white">ಹಾಡುಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...</p>
              <p className="text-xs text-slate-400 mt-0.5">Fetching high-quality stream tracks...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Music className="w-10 h-10 mx-auto mb-3 text-slate-500 opacity-60" />
              <p className="text-sm font-semibold text-white">ಯಾವುದೇ ಹಾಡುಗಳು ಕಂಡುಬಂದಿಲ್ಲ</p>
              <p className="text-xs text-slate-400 mt-1">
                No songs matched your filter. Try another song title or clear filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {results.map((track) => {
                const isCurrent = track.id === currentTrack?.id;
                const isNowPlaying = isCurrent && isPlaying;
                const wasAdded = addedQueueId === track.id;

                return (
                  <div
                    key={track.id}
                    onClick={() => handlePlaySong(track)}
                    className={`group relative flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 cursor-pointer touch-manipulation active:scale-[0.98] ${
                      isCurrent
                        ? 'border-amber-400/60 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Track Artwork with Play Indicator */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/15 bg-black/40 shadow-md">
                      <img
                        src={track.artwork}
                        alt={track.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div
                        className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                          isNowPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {isNowPlaying ? (
                          <Pause className="w-5 h-5 text-amber-400 fill-current drop-shadow-md" />
                        ) : (
                          <Play className="w-5 h-5 text-white fill-current drop-shadow-md ml-0.5" />
                        )}
                      </div>
                    </div>

                    {/* Track Metadata */}
                    <div className="min-w-0 flex-1 pr-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs sm:text-sm font-bold truncate block ${
                          isCurrent ? 'text-amber-300' : 'text-white'
                        }`}>
                          {track.localizedTitle || track.title}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-300 truncate mt-0.5 font-medium">
                        {track.artist}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-semibold">
                          {track.language || 'Kannada'}
                        </span>
                        {track.genre && (
                          <span className="text-[9px] text-slate-400 truncate max-w-[100px]">
                            {track.genre}
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-slate-400 ml-auto">
                          {formatDuration(track.duration)}
                        </span>
                      </div>
                    </div>

                    {/* Quick Action: Add to Queue */}
                    <button
                      type="button"
                      onClick={(e) => handleAddToQueue(e, track)}
                      title={wasAdded ? 'Added to Queue' : 'Add to Queue'}
                      className={`min-w-[36px] min-h-[36px] p-2 rounded-full border transition-all duration-200 flex items-center justify-center flex-shrink-0 active:scale-90 touch-manipulation ${
                        wasAdded
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'border-white/10 hover:border-white/30 text-slate-300 hover:text-white bg-white/5'
                      }`}
                    >
                      {wasAdded ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* FOOTER BAR */}
        {/* ========================================================================= */}
        <div className="p-3 sm:p-4 border-t border-white/10 flex items-center justify-between text-[10px] sm:text-xs text-slate-400 flex-shrink-0 bg-black/40">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Live Stream Mode: Unlimited Universal MP3 Audio</span>
          </div>
          <span className="font-kannada text-amber-400/80">ಸ್ವರ ಲೋಕ • ಸಂಗೀತ ಪಯಣ</span>
        </div>
      </div>
    </div>
  );
};
