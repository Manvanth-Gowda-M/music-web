'use client';

import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ListMusic,
  Heart,
  Loader2,
  Shuffle,
  Repeat,
  ChevronUp,
} from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useWorldStore } from '@/store/worldStore';
import { useLibraryStore } from '@/store/libraryStore';
import { AudioVisualizer } from './AudioVisualizer';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const MiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoading,
    shuffle,
    repeat,
    togglePlay,
    seek,
    next,
    previous,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    setFullPlayerOpen,
    setQueueOpen,
    isQueueOpen,
  } = usePlayerStore();

  const { currentWorld, settings } = useWorldStore();
  const { isFavoriteTrack, toggleFavoriteTrack } = useLibraryStore();

  const isFav = currentTrack ? isFavoriteTrack(currentTrack.id) : false;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    seek(val);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
  };

  if (!currentTrack) {
    return (
      <div className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 w-[92%] sm:w-auto max-w-lg pointer-events-auto">
        <button
          onClick={() => {
            const first = currentWorld.recommendedPlaylists[0]?.tracks[0];
            if (first) {
              usePlayerStore.getState().playTrack(first, currentWorld.recommendedPlaylists[0]?.tracks);
            }
          }}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-full border backdrop-blur-2xl transition-all duration-300 active:scale-95 shadow-2xl touch-manipulation min-h-[52px]"
          style={{
            borderColor: currentWorld.palette.border,
            backgroundColor: currentWorld.palette.glassBg,
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: currentWorld.palette.accent }}
            >
              <Play className="w-4 h-4 text-black fill-current ml-0.5" />
            </div>
            <div className="text-left min-w-0">
              <span className="text-xs font-semibold text-white block truncate">
                Listen in {currentWorld.name}
              </span>
              <span className="text-[10px] font-kannada text-slate-300 block truncate">
                {currentWorld.localizedName} • {currentWorld.ambientCategory}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-300 border border-white/15 px-2.5 py-1 rounded-full bg-white/5 flex-shrink-0 font-medium">
            PLAY
          </span>
        </button>
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isDesktop = settings.forceDesktopMode;

  return (
    <div className="fixed bottom-2 sm:bottom-6 inset-x-2 sm:inset-x-6 z-30 max-w-5xl mx-auto pointer-events-auto select-none safe-bottom">
      <div
        className="relative rounded-2xl sm:rounded-3xl border backdrop-blur-2xl shadow-2xl p-2.5 sm:p-4 flex flex-col gap-1.5 sm:gap-2 transition-all duration-500 overflow-hidden"
        style={{
          borderColor: currentWorld.palette.border,
          backgroundColor: currentWorld.palette.glassBg,
          boxShadow: `0 20px 50px rgba(0, 0, 0, 0.75), 0 0 30px ${currentWorld.palette.glow}`,
        }}
      >
        {/* Ambient Audio Progress Glow Line */}
        <div
          className="absolute top-0 inset-x-0 h-[1.5px] opacity-75 transition-all duration-300"
          style={{
            background: `linear-gradient(90deg, transparent, ${currentWorld.palette.accent} ${progressPercent}%, rgba(255,255,255,0.1) ${progressPercent}%, transparent)`,
          }}
        />

        {/* Pull-up indicator */}
        <div
          onClick={() => setFullPlayerOpen(true)}
          className="w-10 h-0.5 rounded-full bg-white/20 mx-auto -mt-1 mb-0.5 cursor-pointer hover:bg-white/40 transition-colors sm:hidden flex items-center justify-center"
        />

        {/* Main Control Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Artwork & Metadata */}
          <div
            onClick={() => setFullPlayerOpen(true)}
            className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 cursor-pointer group touch-manipulation"
          >
            <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 shadow-md">
              <img
                src={currentTrack.artwork}
                alt={currentTrack.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ChevronUp className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="min-w-0 pr-1 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:underline">
                  {currentTrack.title}
                </h4>
                {currentTrack.localizedTitle && (
                  <span className="text-[11px] font-kannada text-slate-300 hidden md:inline truncate">
                    • {currentTrack.localizedTitle}
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-slate-300/80 truncate font-light mt-0.5">
                {currentTrack.artist}
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavoriteTrack(currentTrack.id);
              }}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
              className="p-2 rounded-full hover:bg-white/10 active:scale-90 transition-all flex-shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center touch-manipulation"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFav ? 'fill-red-500 text-red-500' : 'text-slate-400 hover:text-white'
                }`}
              />
            </button>
          </div>

          {/* Center: Live Waveform Visualizer (Shown in Desktop Mode or Desktop Viewports) */}
          <div className={`${isDesktop ? 'flex' : 'hidden md:flex'} flex-col items-center justify-center flex-1 max-w-xs mx-auto`}>
            <AudioVisualizer
              style={currentWorld.visualizerStyle}
              palette={currentWorld.palette}
              height={isDesktop ? 24 : 28}
              isCompact={true}
              className="w-full"
            />
          </div>

          {/* Right: Audio Playback Controls */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              title={`Shuffle ${shuffle ? 'On' : 'Off'}`}
              className={`p-2 rounded-full ${isDesktop ? 'inline-flex' : 'hidden lg:inline-flex'} transition-colors ${
                shuffle ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Previous Track */}
            <button
              onClick={previous}
              title="Previous Track"
              className="min-w-[38px] min-h-[38px] p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 transition-all flex items-center justify-center touch-manipulation"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              disabled={isLoading}
              title={isPlaying ? 'Pause' : 'Play'}
              className="min-w-[44px] min-h-[44px] w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 shadow-lg touch-manipulation relative"
              style={{
                backgroundColor: currentWorld.palette.accent,
                boxShadow: `0 0 20px ${currentWorld.palette.glow}`,
              }}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-black animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 text-black fill-current" />
              ) : (
                <Play className="w-5 h-5 text-black fill-current ml-0.5" />
              )}
            </button>

            {/* Next Track */}
            <button
              onClick={next}
              title="Next Track"
              className="min-w-[38px] min-h-[38px] p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 transition-all flex items-center justify-center touch-manipulation"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </button>

            {/* Repeat Mode */}
            <button
              onClick={cycleRepeat}
              title={`Repeat: ${repeat}`}
              className={`p-2 rounded-full ${isDesktop ? 'inline-flex' : 'hidden lg:inline-flex'} transition-colors relative ${
                repeat !== 'off' ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Repeat className="w-4 h-4" />
              {repeat === 'one' && (
                <span className="text-[9px] font-bold absolute top-1 right-1">1</span>
              )}
            </button>

            {/* Volume & Queue */}
            <div className={`${isDesktop ? 'flex' : 'hidden sm:flex'} items-center gap-2 ml-1`}>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute' : 'Mute'}
                  className="text-slate-400 hover:text-white p-1"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolume}
                  aria-label="Volume"
                  className="w-14 lg:w-20 h-1 rounded-lg appearance-none cursor-pointer bg-white/20 accent-white"
                />
              </div>

              <button
                onClick={() => setQueueOpen(!isQueueOpen)}
                title="Play Queue"
                className={`p-2 rounded-full border transition-colors ${
                  isQueueOpen ? 'bg-white/20 border-white/40 text-white' : 'border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <ListMusic className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Line */}
        <div className="flex items-center gap-2 px-1 pt-0.5">
          <span className="text-[10px] font-mono text-slate-400 w-7 text-right">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-1 flex items-center group cursor-pointer py-1">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              aria-label="Seek track position"
              className="w-full h-1 sm:h-1.5 rounded-lg appearance-none cursor-pointer bg-white/15 focus:outline-none transition-all"
              style={{
                accentColor: currentWorld.palette.progress,
              }}
            />
          </div>

          <span className="text-[10px] font-mono text-slate-400 w-7">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};
