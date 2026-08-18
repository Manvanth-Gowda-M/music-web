'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Search,
} from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useWorldStore } from '@/store/worldStore';
import { AudioEngine } from '@/services/audio/AudioEngine';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const UniversalDeck: React.FC<{ onOpenSearch?: () => void }> = ({ onOpenSearch }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
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
    playTrack,
  } = usePlayerStore();

  const { currentWorld } = useWorldStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeEqPreset, setActiveEqPreset] = useState<'CYBER' | 'LOFI' | 'BASS' | 'VOCAL'>('CYBER');

  // Real-time OLED Neon Cyber Spectrum Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Deep OLED dark background
      ctx.fillStyle = '#06060c';
      ctx.fillRect(0, 0, w, h);

      // CRT scanline grid
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let y = 0; y < h; y += 3) {
        ctx.fillRect(0, y, w, 1);
      }

      const freqData = isPlaying ? AudioEngine.getFrequencyData() : new Uint8Array(32);
      const barCount = 26;
      const barWidth = 6;
      const gap = 3;
      const totalWidth = barCount * (barWidth + gap) - gap;
      const startX = (w - totalWidth) / 2;

      for (let i = 0; i < barCount; i++) {
        let level = 0;
        if (isPlaying) {
          const rawIdx = Math.floor((i / barCount) * (freqData.length / 2));
          const rawVal = freqData[rawIdx] || 0;
          const sim = Math.sin(phase * 2.2 + i * 0.45) * 0.25 + 0.55;
          level = Math.max(0.12, (rawVal / 255) * 0.75 + sim * 0.25);
        } else {
          level = 0.08 + Math.sin(phase * 0.8 + i * 0.3) * 0.04;
        }

        const barH = Math.max(3, level * (h - 8));
        const x = startX + i * (barWidth + gap);
        const y = h - 4 - barH;

        // Dynamic Neon Cyber Gradient (Cyan to Pink to Violet)
        const grad = ctx.createLinearGradient(0, y, 0, h - 4);
        grad.addColorStop(0, '#38bdf8'); // Cyan peak
        grad.addColorStop(0.5, '#ec4899'); // Magenta mid
        grad.addColorStop(1, '#8b5cf6'); // Violet base

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, [2, 2, 0, 0]);
        ctx.fill();

        // Glowing Peak Dot
        if (level > 0.4) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, Math.max(2, y - 2), barWidth, 1.5);
        }
      }

      phase += 0.04;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying]);

  const handlePlayToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await AudioEngine.resumeContext();
    if (!isPlaying && !currentTrack) {
      const allTracks = currentWorld.recommendedPlaylists.flatMap((p) => p.tracks);
      if (allTracks.length > 0) {
        const shuffled = [...allTracks].sort(() => Math.random() - 0.5);
        await playTrack(shuffled[0], shuffled);
        return;
      }
    }
    togglePlay();
  };

  const handleProgressSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seek(ratio * duration);
  };

  const handleVolumeSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    setVolume(ratio);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  return (
    <div className="w-full max-w-lg mx-auto select-none pointer-events-auto">
      {/* ========================================================================= */}
      {/* CHASSIS: BRUSHED TITANIUM & NEON CYBER GLASS */}
      {/* ========================================================================= */}
      <div
        className="relative rounded-[26px] sm:rounded-[32px] p-2.5 sm:p-3.5 transition-all duration-500 overflow-hidden"
        style={{
          background: 'linear-gradient(165deg, #1e1b2e 0%, #0d0b14 60%, #08070c 100%)',
          boxShadow: `
            0 25px 50px -10px rgba(0, 0, 0, 0.85),
            inset 0 1px 2px rgba(236, 72, 153, 0.4),
            inset 0 -2px 4px rgba(0, 0, 0, 0.6),
            0 0 35px rgba(236, 72, 153, 0.2)
          `,
          border: '1.5px solid rgba(236, 72, 153, 0.35)',
        }}
      >
        {/* Top Hardware Accent Screws & Cyber Header */}
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_6px_#ec4899]" />
            <span className="text-[9px] font-mono tracking-widest text-pink-400 font-bold uppercase">
              UNIVERSAL MP5 PRO
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
              320 KBPS AAC
            </span>
            <span className="text-[8px] font-mono text-cyan-400">
              {activeEqPreset} EQ
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* OLED SCREEN DISPLAY */}
        {/* ========================================================================= */}
        <div
          className="relative rounded-2xl p-2.5 sm:p-3 mb-2.5 overflow-hidden border border-pink-500/20"
          style={{
            background: 'radial-gradient(circle at 50% 30%, #151226 0%, #06050a 100%)',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.8), 0 0 15px rgba(236, 72, 153, 0.1)',
          }}
        >
          {/* OLED Status Header */}
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-white/80 font-bold">{isPlaying ? 'STREAMING' : 'READY'}</span>
            </div>

            <div className="flex items-center gap-1 text-[8px]">
              <span className="text-cyan-300 font-semibold px-1 rounded bg-cyan-950/60 border border-cyan-500/30">
                {currentTrack?.language?.toUpperCase() || 'ALL LANG'}
              </span>
              <span className="text-pink-300 font-semibold px-1 rounded bg-pink-950/60 border border-pink-500/30">
                {currentTrack?.genre || 'UNIVERSAL'}
              </span>
            </div>
          </div>

          {/* Track Info & Visualizer Row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                {currentTrack?.localizedTitle || currentTrack?.title || 'Universal Hits Stream'}
              </h3>
              <p className="text-[10px] text-pink-300/80 truncate font-medium mt-0.5">
                {currentTrack?.artist || 'Kannada • Hindi • Tamil • Telugu • English'}
              </p>
            </div>

            {/* Live OLED Equalizer Display */}
            <div className="w-24 sm:w-32 h-8 sm:h-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 bg-black/80">
              <canvas
                ref={canvasRef}
                width={130}
                height={40}
                className="w-full h-full block"
              />
            </div>
          </div>

          {/* Timeline Bar */}
          <div>
            <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 mb-1">
              <span className="text-cyan-300">{formatTime(currentTime)}</span>
              <span className="text-slate-400">{formatTime(duration)}</span>
            </div>
            <div
              onClick={handleProgressSeek}
              className="relative w-full h-1.5 bg-white/10 rounded-full cursor-pointer overflow-hidden group"
            >
              <div
                className="h-full rounded-full transition-all duration-150"
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #38bdf8 0%, #ec4899 50%, #8b5cf6 100%)',
                  boxShadow: '0 0 10px rgba(236, 72, 153, 0.8)',
                }}
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CYBER HARDWARE CONTROLS BAR */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 px-1">
          {/* Left: Shuffle & Quick Hub Search Trigger */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleShuffle}
              title={shuffle ? 'Shuffle Active' : 'Enable Shuffle'}
              className={`min-w-[34px] min-h-[34px] p-2 rounded-xl border flex items-center justify-center transition-all active:scale-90 touch-manipulation ${
                shuffle
                  ? 'bg-pink-500/25 border-pink-400 text-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.4)]'
                  : 'bg-white/5 border-white/10 hover:border-white/25 text-slate-300 hover:text-white'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                const searchBtn = document.querySelector('button[aria-label="Search"]') as HTMLButtonElement;
                if (searchBtn) searchBtn.click();
              }}
              title="Open Universal Music Hub & Filters"
              className="px-2.5 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 hover:text-white text-[10px] font-semibold flex items-center gap-1 transition-all active:scale-95 touch-manipulation"
            >
              <Search className="w-3 h-3" />
              <span>HUB</span>
            </button>
          </div>

          {/* Center Playback Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={previous}
              title="Previous Track"
              className="min-w-[34px] min-h-[34px] p-2 rounded-xl border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90 flex items-center justify-center touch-manipulation"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            {/* Raised Center Neon Play Button */}
            <button
              type="button"
              onClick={handlePlayToggle}
              title={isPlaying ? 'Pause' : 'Play Universal Stream'}
              className="min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-90 touch-manipulation shadow-lg border"
              style={{
                background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                boxShadow: isPlaying
                  ? '0 0 25px rgba(236, 72, 153, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.6)'
                  : '0 4px 15px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
              }}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white fill-current" />
              ) : (
                <Play className="w-5 h-5 text-white fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={next}
              title="Next Track"
              className="min-w-[34px] min-h-[34px] p-2 rounded-xl border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90 flex items-center justify-center touch-manipulation"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Repeat & Volume Control */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={cycleRepeat}
              title={`Repeat: ${repeat}`}
              className={`min-w-[34px] min-h-[34px] p-2 rounded-xl border flex items-center justify-center transition-all active:scale-90 touch-manipulation ${
                repeat !== 'off'
                  ? 'bg-purple-500/25 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'bg-white/5 border-white/10 hover:border-white/25 text-slate-300 hover:text-white'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>

            {/* Compact Volume Seek */}
            <div className="flex items-center gap-1 pl-1">
              <button
                type="button"
                onClick={toggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
              <div
                onClick={handleVolumeSeek}
                className="w-12 sm:w-16 h-1 bg-white/15 rounded-full cursor-pointer overflow-hidden hidden xs:block"
              >
                <div
                  className="h-full bg-pink-400 rounded-full"
                  style={{ width: `${volumePercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
