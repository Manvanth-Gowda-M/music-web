'use client';

import React, { useState } from 'react';
import { X, Heart, ListMusic, Compass, Play } from 'lucide-react';
import { useLibraryStore } from '@/store/libraryStore';
import { useWorldStore } from '@/store/worldStore';
import { usePlayerStore } from '@/store/playerStore';
import { CURATED_TRACKS } from '@/data/curatedTracks';
import { WORLDS } from '@/data/worlds';

export const LibraryModal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tracks' | 'playlists' | 'worlds'>('tracks');

  const {
    isLibraryOpen,
    setLibraryOpen,
    favoriteTrackIds,
    favoritePlaylistIds,
    favoriteWorldIds,
    toggleFavoriteTrack,
  } = useLibraryStore();

  const { currentWorld, switchWorld } = useWorldStore();
  const { playTrack, currentTrack } = usePlayerStore();

  if (!isLibraryOpen) return null;

  const favoriteTracks = CURATED_TRACKS.filter((t) => favoriteTrackIds.includes(t.id));
  const allPlaylists = WORLDS.flatMap((w) => w.recommendedPlaylists);
  const favoritePlaylists = allPlaylists.filter((p) => favoritePlaylistIds.includes(p.id));
  const favoriteWorlds = WORLDS.filter((w) => favoriteWorldIds.includes(w.id));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xl animate-fade-in pointer-events-auto select-none safe-bottom">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={() => setLibraryOpen(false)} />

      {/* Modal Container */}
      <div
        className="relative z-10 w-full max-w-2xl h-[88dvh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl border p-4 sm:p-6 flex flex-col backdrop-blur-2xl shadow-2xl overflow-hidden"
        style={{
          borderColor: currentWorld.palette.border,
          backgroundColor: currentWorld.palette.glassBg,
        }}
      >
        {/* Mobile Drag Pill */}
        <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mb-2 sm:hidden flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-kannada text-xl sm:text-2xl font-bold text-white">
              ನನ್ನ ಸಂಗ್ರಹ
            </h3>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-sans">
              • Library
            </span>
          </div>

          <button
            onClick={() => setLibraryOpen(false)}
            className="min-w-[40px] min-h-[40px] p-2 rounded-full border border-white/10 hover:border-white/30 text-slate-300 transition-colors flex items-center justify-center touch-manipulation active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-3 pb-2 overflow-x-auto smooth-scroll flex-shrink-0">
          <button
            onClick={() => setActiveTab('tracks')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border transition-all touch-manipulation flex-shrink-0 active:scale-95 ${
              activeTab === 'tracks'
                ? 'bg-white/20 border-white/40 text-white'
                : 'border-white/5 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>ಮೆಚ್ಚಿದ ಹಾಡುಗಳು ({favoriteTracks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('playlists')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border transition-all touch-manipulation flex-shrink-0 active:scale-95 ${
              activeTab === 'playlists'
                ? 'bg-white/20 border-white/40 text-white'
                : 'border-white/5 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>ಪ್ಲೇಲಿಸ್ಟ್‌ಗಳು ({favoritePlaylists.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('worlds')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border transition-all touch-manipulation flex-shrink-0 active:scale-95 ${
              activeTab === 'worlds'
                ? 'bg-white/20 border-white/40 text-white'
                : 'border-white/5 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>ಲೋಕಗಳು ({favoriteWorlds.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto py-2 space-y-2 pr-0.5 smooth-scroll">
          {activeTab === 'tracks' && (
            favoriteTracks.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Heart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-light">ಯಾವುದೇ ಮೆಚ್ಚಿದ ಹಾಡುಗಳಿಲ್ಲ (No favorite songs)</p>
                <p className="text-xs text-slate-300 mt-1 font-kannada">
                  ಹಾಡಿನ ಪಕ್ಕದ ಹೃದಯ ಚಿಹ್ನೆ ಒತ್ತಿ ಸೇರಿಸಿ
                </p>
              </div>
            ) : (
              favoriteTracks.map((track) => {
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
                        playTrack(track, favoriteTracks);
                        setLibraryOpen(false);
                      }}
                      className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                    >
                      <img
                        src={track.artwork}
                        alt={track.title}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-white/10 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1 pr-1">
                        <span className="text-xs sm:text-sm font-semibold text-white truncate block">
                          {track.title}
                        </span>
                        <span className="text-[11px] sm:text-xs text-slate-300 truncate block mt-0.5">
                          {track.artist}
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => toggleFavoriteTrack(track.id)}
                      className="min-w-[36px] min-h-[36px] p-2 rounded-full hover:bg-white/10 text-red-400 flex items-center justify-center touch-manipulation active:scale-90"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                );
              })
            )
          )}

          {activeTab === 'playlists' && (
            allPlaylists.map((pl) => (
              <div
                key={pl.id}
                className="group flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-2xl border border-white/5 bg-black/25 hover:border-white/20 active:scale-[0.98] transition-all touch-manipulation"
              >
                <button
                  onClick={() => {
                    if (pl.tracks.length > 0) {
                      playTrack(pl.tracks[0], pl.tracks);
                      setLibraryOpen(false);
                    }
                  }}
                  className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                >
                  <img
                    src={pl.cover}
                    alt={pl.title}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-white/10 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1 pr-1">
                    <span className="text-xs sm:text-sm font-semibold text-white truncate block">
                      {pl.title}
                    </span>
                    <span className="text-[11px] sm:text-xs text-slate-300 truncate block mt-0.5">
                      {pl.subtitle} • {pl.tracks.length} tracks
                    </span>
                  </div>
                </button>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 flex-shrink-0">
                  <Play className="w-3.5 h-3.5 text-white fill-current ml-0.5" />
                </div>
              </div>
            ))
          )}

          {activeTab === 'worlds' && (
            WORLDS.map((world) => (
              <button
                key={world.id}
                onClick={() => {
                  switchWorld(world.id);
                  setLibraryOpen(false);
                }}
                className="w-full flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl border border-white/5 bg-black/25 hover:border-white/20 active:scale-[0.98] text-left transition-all group touch-manipulation"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <img
                    src={world.poster}
                    alt={world.name}
                    className="w-14 h-10 sm:w-16 sm:h-11 rounded-xl object-cover border border-white/10 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-semibold text-white font-kannada block truncate">
                      {world.localizedName} ({world.name})
                    </span>
                    <span className="text-[11px] text-slate-300 block truncate">
                      {world.ambientCategory}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 group-hover:text-white transition-colors flex-shrink-0">
                  ENTER →
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
