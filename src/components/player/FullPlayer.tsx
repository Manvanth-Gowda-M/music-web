'use client';

import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Heart,
  ChevronDown,
  ListMusic,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useWorldStore } from '@/store/worldStore';
import { useLibraryStore } from '@/store/libraryStore';
import { AudioVisualizer } from './AudioVisualizer';
import { VintageCassetteDeck } from './VintageCassetteDeck';
import { TempleDeck } from './TempleDeck';
import { BeachDeck } from './BeachDeck';
import { PassengerGlassDeck } from './PassengerGlassDeck';
import { UniversalDeck } from './UniversalDeck';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const FullPlayer: React.FC = () => {
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
    isFullPlayerOpen,
    setFullPlayerOpen,
    togglePlay,
    seek,
    next,
    previous,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    setQueueOpen,
    isQueueOpen,
  } = usePlayerStore();

  const { currentWorld, settings, toggleAmbient, setAmbientVolume } = useWorldStore();
  const { isFavoriteTrack, toggleFavoriteTrack } = useLibraryStore();

  if (!isFullPlayerOpen || !currentTrack) return null;

  const isFav = isFavoriteTrack(currentTrack.id);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-8 md:p-10 bg-black/80 backdrop-blur-3xl animate-fade-in pointer-events-auto select-none overflow-y-auto safe-top safe-bottom h-[100dvh] max-h-[100dvh]">
      {/* Top Header: Drag Handle / Collapse button, World Destination, Queue Toggle */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between pb-2">
        <button
          onClick={() => setFullPlayerOpen(false)}
          className="min-w-[44px] min-h-[44px] p-2.5 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/10 text-slate-300 transition-all active:scale-90 flex items-center justify-center touch-manipulation"
          aria-label="Collapse Player"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center px-2">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono uppercase tracking-widest">
            <span>NOW PLAYING IN</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-kannada font-bold text-xs sm:text-sm text-white">
              {currentWorld.localizedName}
            </span>
            <span className="text-xs text-slate-300 truncate max-w-[120px] sm:max-w-none">
              • {currentWorld.name}
            </span>
          </div>
        </div>

        <button
          onClick={() => setQueueOpen(!isQueueOpen)}
          className={`min-w-[44px] min-h-[44px] p-2.5 rounded-full border transition-all active:scale-90 flex items-center justify-center touch-manipulation ${
            isQueueOpen ? 'bg-white/20 border-white/40 text-white' : 'border-white/10 text-slate-300 hover:bg-white/10'
          }`}
          aria-label="Toggle Queue"
        >
          <ListMusic className="w-5 h-5" />
        </button>
      </div>

      {/* Center Body: Artwork, Kannada Metadata, Visualizer */}
      <div className="w-full max-w-md mx-auto my-auto flex flex-col items-center text-center py-2 sm:py-6">
        {/* Themed Relatable 3D Centerpiece Player (Vintage Cassette / Temple Brass / Beach Deck / Passenger Glass) */}
        {currentWorld.id === 'ksrtc-bus' ? (
          // =========================================================================
          // THEME 1: VINTAGE KSRTC CASSETTE DECK (Reference Accurate)
          // =========================================================================
          <div className="w-full mb-3 sm:mb-5">
            <VintageCassetteDeck />
          </div>
        ) : currentWorld.id === 'temple-morning' ? (
          // =========================================================================
          // THEME 2: SACRED TEMPLE BRASS AUDIO DECK (Reference Accurate)
          // =========================================================================
          <div className="w-full mb-3 sm:mb-5">
            <TempleDeck />
          </div>
        ) : currentWorld.id === 'coastal-morning' ? (
          // =========================================================================
          // THEME 3: VINTAGE COASTAL BEACH CASSETTE DECK (Reference Accurate)
          // =========================================================================
          <div className="w-full mb-3 sm:mb-5">
            <BeachDeck />
          </div>
        ) : currentWorld.id === 'universal-mode' ? (
          // =========================================================================
          // THEME 5: UNIVERSAL MP5 PRO CYBER DECK
          // =========================================================================
          <div className="w-full mb-3 sm:mb-5">
            <UniversalDeck />
          </div>
        ) : (
          // =========================================================================
          // THEME 4: MALNAD BUS PASSENGER GLASS DECK
          // =========================================================================
          <div className="w-full mb-3 sm:mb-5">
            <PassengerGlassDeck />
          </div>
        )}

        {/* Track Title & Kannada Info */}
        <div className="w-full flex items-center justify-between px-2 mb-2 sm:mb-3">
          <div className="text-left flex-1 min-w-0 pr-3">
            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight truncate">
              {currentTrack.title}
            </h2>
            {currentTrack.localizedTitle && (
              <h3 className="font-kannada font-semibold text-sm sm:text-base text-slate-200/90 mt-0.5 truncate">
                {currentTrack.localizedTitle}
              </h3>
            )}
            <p className="text-xs sm:text-sm text-slate-300/80 font-light mt-0.5 truncate">
              {currentTrack.artist}
            </p>
          </div>

          <button
            onClick={() => toggleFavoriteTrack(currentTrack.id)}
            className="min-w-[44px] min-h-[44px] p-2.5 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/10 active:scale-90 transition-all flex items-center justify-center flex-shrink-0 touch-manipulation"
            aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
          >
            <Heart
              className={`w-5 h-5 ${
                isFav ? 'fill-red-500 text-red-500' : 'text-slate-400 hover:text-white'
              }`}
            />
          </button>
        </div>

        {/* Real-time Themed Web Audio API Visualizer Canvas */}
        <div className="w-full my-2 sm:my-3 px-1">
          <AudioVisualizer
            style={currentWorld.visualizerStyle}
            palette={currentWorld.palette}
            height={52}
            className="w-full rounded-2xl bg-black/40 border border-white/10 p-1 backdrop-blur-md shadow-inner"
          />
        </div>

        {/* Progress Bar & Seek */}
        <div className="w-full px-1 mb-3 sm:mb-5">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={(e) => seek(parseFloat(e.target.value))}
            aria-label="Seek track"
            className="w-full h-1.5 sm:h-2 rounded-lg appearance-none cursor-pointer bg-white/15 focus:outline-none"
            style={{
              accentColor: currentWorld.palette.progress,
            }}
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls (Thumb-Friendly >= 48px Touch Targets) */}
        <div className="flex items-center justify-center gap-4 sm:gap-7 mb-4 sm:mb-6">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`min-w-[44px] min-h-[44px] p-2.5 rounded-full transition-all active:scale-90 flex items-center justify-center touch-manipulation ${
              shuffle ? 'text-white bg-white/15' : 'text-slate-400 hover:text-white'
            }`}
            aria-label="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Previous */}
          <button
            onClick={previous}
            className="min-w-[48px] min-h-[48px] p-2.5 rounded-full text-slate-200 hover:text-white active:scale-90 transition-all flex items-center justify-center touch-manipulation"
            aria-label="Previous Track"
          >
            <SkipBack className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
          </button>

          {/* Large Play/Pause */}
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="min-w-[58px] min-h-[58px] w-14 h-14 sm:w-18 sm:h-18 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 shadow-2xl touch-manipulation"
            style={{
              backgroundColor: currentWorld.palette.accent,
              boxShadow: `0 10px 40px ${currentWorld.palette.glow}`,
            }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <Loader2 className="w-7 h-7 text-black animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-7 h-7 text-black fill-current" />
            ) : (
              <Play className="w-7 h-7 text-black fill-current ml-1" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={next}
            className="min-w-[48px] min-h-[48px] p-2.5 rounded-full text-slate-200 hover:text-white active:scale-90 transition-all flex items-center justify-center touch-manipulation"
            aria-label="Next Track"
          >
            <SkipForward className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={cycleRepeat}
            className={`min-w-[44px] min-h-[44px] p-2.5 rounded-full transition-all active:scale-90 relative flex items-center justify-center touch-manipulation ${
              repeat !== 'off' ? 'text-white bg-white/15' : 'text-slate-400 hover:text-white'
            }`}
            aria-label={`Repeat: ${repeat}`}
          >
            <Repeat className="w-5 h-5" />
            {repeat === 'one' && (
              <span className="text-[9px] font-bold absolute top-1 right-1">1</span>
            )}
          </button>
        </div>

        {/* Ambient Environmental Audio Layer Bar */}
        {currentWorld.ambientSound && (
          <div
            className="w-full flex items-center justify-between gap-3 px-3.5 py-2 rounded-2xl border backdrop-blur-xl"
            style={{
              borderColor: currentWorld.palette.border,
              backgroundColor: 'rgba(10, 10, 10, 0.4)',
            }}
          >
            <button
              onClick={toggleAmbient}
              className="flex items-center gap-2 text-left min-w-0 flex-1 touch-manipulation"
            >
              <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: currentWorld.palette.accent }} />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-white block truncate">
                  {currentWorld.ambientSound.label}
                </span>
                <span className="text-[10px] font-kannada text-slate-400 block truncate">
                  {currentWorld.ambientSound.localizedLabel}
                </span>
              </div>
            </button>

            <div className="flex items-center gap-2 flex-shrink-0">
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.ambientVolume}
                onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                aria-label="Ambient volume"
                className="w-16 sm:w-20 h-1 rounded-lg appearance-none cursor-pointer bg-white/20 accent-white"
              />
              <span className="text-[10px] font-mono text-slate-400 w-6 text-right">
                {Math.round(settings.ambientVolume * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer: Volume slider (Responsive) */}
      <div className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 pt-2">
        <button
          onClick={toggleMute}
          className="text-slate-400 hover:text-white p-2 touch-manipulation"
          aria-label="Toggle mute"
        >
          {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          aria-label="Master volume"
          className="w-32 sm:w-40 h-1.5 rounded-lg appearance-none cursor-pointer bg-white/20 accent-white"
        />
      </div>
    </div>
  );
};
