'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Play, Plus, Music, Loader2 } from 'lucide-react';
import { useWorldStore } from '@/store/worldStore';
import { usePlayerStore } from '@/store/playerStore';
import { MusicService } from '@/services/audio/MusicService';
import { Track } from '@/types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { currentWorld } = useWorldStore();
  const { playTrack, addToQueue, currentTrack } = usePlayerStore();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      handleSearch(query);
    }
  }, [isOpen]);

  const handleSearch = async (val: string) => {
    setIsSearching(true);
    try {
      const tracks = await MusicService.search(val);
      setResults(tracks);
    } catch (e) {
      console.warn('Search error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    handleSearch(val);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xl animate-fade-in pointer-events-auto select-none safe-bottom">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div
        className="relative z-10 w-full max-w-2xl h-[88dvh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl border p-4 sm:p-6 flex flex-col backdrop-blur-2xl shadow-2xl overflow-hidden"
        style={{
          borderColor: currentWorld.palette.border,
          backgroundColor: currentWorld.palette.glassBg,
        }}
      >
        {/* Drag handle pill on mobile */}
        <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mb-2 sm:hidden flex-shrink-0" />

        {/* Header Search Input */}
        <div className="flex items-center gap-2.5 pb-3 sm:pb-4 border-b border-white/10 flex-shrink-0">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="ಹುಡುಕಿ: ಹಾಡು, ಕಲಾವಿದರು, ಚಲನಚಿತ್ರ..."
            className="flex-1 bg-transparent text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none font-sans font-light min-h-[40px]"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                handleSearch('');
              }}
              className="min-w-[36px] min-h-[36px] p-1.5 rounded-full hover:bg-white/10 text-slate-400 flex items-center justify-center touch-manipulation"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] p-2 rounded-full border border-white/10 hover:border-white/30 text-slate-300 transition-colors flex items-center justify-center touch-manipulation active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-0.5 smooth-scroll">
          {isSearching ? (
            <div className="text-center py-12 text-slate-400">
              <Loader2 className="w-6 h-6 mx-auto animate-spin mb-2" />
              <p className="text-xs">ಹುಡುಕಲಾಗುತ್ತಿದೆ...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Music className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-light">ಯಾವುದೇ ಹಾಡುಗಳು ಕಂಡುಬಂದಿಲ್ಲ (No tracks found)</p>
              <p className="text-xs text-slate-300 mt-1 font-kannada">
                ಬೇರೆ ಕೀವರ್ಡ್ ಬಳಸಿ ಪ್ರಯತ್ನಿಸಿ
              </p>
            </div>
          ) : (
            results.map((track) => {
              const isCurrent = track.id === currentTrack?.id;

              return (
                <div
                  key={track.id}
                  className={`group flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-2xl border transition-all touch-manipulation ${
                    isCurrent
                      ? 'border-white/40 bg-white/15'
                      : 'border-white/5 bg-black/25 hover:border-white/20 active:scale-[0.98]'
                  }`}
                >
                  <button
                    onClick={() => {
                      playTrack(track, results);
                      onClose();
                    }}
                    className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 text-left"
                  >
                    <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                      <img
                        src={track.artwork}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 text-white fill-current" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 pr-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-semibold text-white truncate block">
                          {track.title}
                        </span>
                      </div>
                      <span className="text-[11px] sm:text-xs text-slate-300 truncate block mt-0.5">
                        {track.artist}
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => addToQueue(track)}
                      title="Add to queue"
                      className="min-w-[40px] min-h-[40px] p-2 rounded-full border border-white/10 hover:border-white/30 active:scale-90 text-slate-300 hover:text-white transition-all flex items-center justify-center touch-manipulation"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Search Footer */}
        <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 flex-shrink-0">
          <span>Source: {MusicService.getProviderName()}</span>
          <span className="font-kannada">ಕನ್ನಡ ಗಾನ ಲೋಕ</span>
        </div>
      </div>
    </div>
  );
};
