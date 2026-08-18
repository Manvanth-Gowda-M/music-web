'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useWorldStore } from '@/store/worldStore';
import { AudioEngine } from '@/services/audio/AudioEngine';
import { Heart, MoreHorizontal, Volume1, Volume2, Shuffle, Repeat } from 'lucide-react';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const PassengerGlassDeck: React.FC = () => {
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
    play,
    pause,
    playTrack,
    seek,
    next,
    previous,
    toggleShuffle,
    cycleRepeat,
    setVolume,
  } = usePlayerStore();

  const { currentWorld, settings, toggleAmbient } = useWorldStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  // Live Floating 3D Glowing Waveform Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;
    const barCount = 38;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const freqData = AudioEngine.getFrequencyData();
      const metrics = AudioEngine.getEnergyMetrics();
      const hasAudio = isPlaying;

      const w = canvas.width;
      const h = canvas.height;
      const barWidth = 3.5;
      const spacing = (w - barCount * barWidth) / (barCount - 1);

      // Draw each 3D rounded bar with floor reflection
      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + spacing);
        const normX = i / barCount;
        // Natural mountain-shaped envelope (higher in center-right like reference)
        const envelope = Math.sin(normX * Math.PI) * 0.75 + Math.exp(-Math.pow(normX - 0.65, 2) / 0.05) * 0.45;

        let level = 0;
        if (hasAudio) {
          const freqIdx = Math.floor((i / barCount) * 32);
          const raw = (freqData[freqIdx] || 0) / 255;
          const boost = i > 15 && i < 28 ? metrics.mid * 0.4 : metrics.bass * 0.25;
          level = Math.min(1, (raw * 0.75 + boost + Math.sin(phase + i * 0.25) * 0.06) * envelope);
        } else {
          level = (0.1 + Math.sin(phase + i * 0.3) * 0.05) * envelope;
        }

        const maxH = h * 0.72;
        const barH = Math.max(3, level * maxH);
        const baseY = h * 0.78;
        const topY = baseY - barH;

        // 1. Draw Glass Floor Soft Reflection
        const reflH = barH * 0.35;
        const reflGrad = ctx.createLinearGradient(x, baseY, x, baseY + reflH);
        reflGrad.addColorStop(0, 'rgba(254, 240, 138, 0.25)');
        reflGrad.addColorStop(1, 'rgba(254, 240, 138, 0.0)');
        ctx.fillStyle = reflGrad;
        ctx.beginPath();
        ctx.roundRect(x, baseY + 1, barWidth, reflH, [1]);
        ctx.fill();

        // 2. Main Glowing Rounded Pillar Bar
        const grad = ctx.createLinearGradient(x, topY, x, baseY);
        grad.addColorStop(0, '#ffffff'); // Pure luminous white top
        grad.addColorStop(0.3, '#fef08a'); // Warm golden amber glow
        grad.addColorStop(0.8, '#f59e0b'); // Amber mid
        grad.addColorStop(1, '#b45309'); // Deep sunset amber base

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, topY, barWidth, barH, [barWidth / 2]);
        ctx.fill();

        // Subtle Glow Halo around peaks
        if (level > 0.45) {
          ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
          ctx.beginPath();
          ctx.arc(x + barWidth / 2, topY, barWidth * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      phase += 0.038;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying]);

  const handlePlayClick = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await AudioEngine.resumeContext();
    if (!isPlaying) {
      if (currentTrack) {
        await play();
      } else {
        const allTracks = currentWorld.recommendedPlaylists.flatMap((p) => p.tracks);
        if (allTracks.length > 0) {
          const shuffled = [...allTracks].sort(() => Math.random() - 0.5);
          await playTrack(shuffled[0], shuffled);
        }
      }
    }
  };

  const handlePauseClick = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await AudioEngine.resumeContext();
    if (isPlaying) {
      pause();
    } else {
      if (currentTrack) {
        await play();
      }
    }
  };

  const handleRewClick = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await AudioEngine.resumeContext();
    await previous();
  };

  const handleFFClick = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await AudioEngine.resumeContext();
    await next();
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
    <div className="w-full max-w-lg mx-auto p-0.5 select-none pointer-events-auto">
      {/* ========================================================================= */}
      {/* OUTER REFRACTIVE GLASS LIP & BASE CONTAINER */}
      {/* ========================================================================= */}
      <div
        className="relative rounded-[28px] sm:rounded-[36px] p-1.5 sm:p-2.5 transition-all duration-500 overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.12)',
          boxShadow: `
            0 25px 50px -12px rgba(0, 0, 0, 0.75),
            inset 0 1px 2px rgba(255, 255, 255, 0.6),
            inset 0 -2px 4px rgba(0, 0, 0, 0.25),
            0 0 35px rgba(251, 191, 36, 0.15)
          `,
          backdropFilter: 'blur(30px) saturate(190%)',
          border: '1.5px solid rgba(255, 255, 255, 0.35)',
        }}
      >
        {/* ========================================================================= */}
        {/* INNER FROSTED GLASS PANE */}
        {/* ========================================================================= */}
        <div
          className="relative rounded-[22px] sm:rounded-[30px] p-3 sm:p-4 transition-all duration-300"
          style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.18) 0%, rgba(20, 16, 14, 0.45) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Top Row: Track Metadata & 3D Glowing Waveform & Ambient Sound Capsule */}
          <div className="flex items-start justify-between gap-2.5 sm:gap-3 mb-2">
            {/* Center Metadata & Full-Width 3D Floating Waveform Canvas */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 pr-1">
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate drop-shadow-md">
                    {currentTrack?.localizedTitle || currentTrack?.title || 'ಹಾಡಿನ ಹೆಸರು'}
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-white/70 truncate mt-0.5 font-medium">
                    {currentTrack?.artist || 'ಕನ್ನಡ ಸಂಗೀತ'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setIsLiked(!isLiked)}
                    title={isLiked ? 'Liked' : 'Like Track'}
                    className="p-1 text-white/70 hover:text-rose-400 transition-colors active:scale-90"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                        isLiked ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]' : ''
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    title="Options"
                    className="p-1 text-white/70 hover:text-white transition-colors"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>

              {/* 3D Floating Glowing Golden Waveform Canvas */}
              <div className="w-full h-11 sm:h-14 relative mt-1.5">
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={56}
                  className="w-full h-full block"
                />
              </div>
            </div>

            {/* Right Ambient Waveform Capsule Button */}
            <button
              type="button"
              onClick={toggleAmbient}
              title={settings.isAmbientEnabled ? 'Disable Ambient Audio' : 'Enable Road Sound'}
              className={`w-7 sm:w-8 h-18 sm:h-22 rounded-full border flex flex-col items-center justify-center transition-all active:scale-95 shadow-md flex-shrink-0 touch-manipulation my-auto ${
                settings.isAmbientEnabled
                  ? 'bg-amber-500/25 border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                  : 'bg-white/10 border-white/20 hover:bg-white/15 text-white/60'
              }`}
            >
              <div className="flex flex-col items-center gap-0.5 py-1">
                <div
                  className={`w-0.5 rounded-full transition-all duration-300 ${
                    settings.isAmbientEnabled
                      ? 'h-3 bg-[#fbbf24] shadow-[0_0_4px_#fbbf24]'
                      : 'h-2 bg-white/50'
                  }`}
                />
                <div
                  className={`w-0.5 rounded-full transition-all duration-300 ${
                    settings.isAmbientEnabled
                      ? 'h-5 bg-[#f59e0b] shadow-[0_0_6px_#f59e0b]'
                      : 'h-3 bg-white/70'
                  }`}
                />
                <div
                  className={`w-0.5 rounded-full transition-all duration-300 ${
                    settings.isAmbientEnabled
                      ? 'h-4 bg-[#f97316] shadow-[0_0_4px_#f97316]'
                      : 'h-2.5 bg-white/50'
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Track Progress Timeline Bar */}
          <div className="mb-2.5 px-0.5">
            <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-white/70 mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div
              onClick={handleProgressSeek}
              title="Seek in track"
              className="relative w-full h-1.5 bg-white/15 rounded-full cursor-pointer overflow-hidden border border-white/10 group"
            >
              <div
                className="h-full rounded-full transition-all duration-150"
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #f59e0b 0%, #fde047 100%)',
                  boxShadow: '0 0 10px rgba(253, 224, 71, 0.7)',
                }}
              />
              {/* Golden circular thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white border border-amber-400 shadow-md -translate-x-1/2 pointer-events-none transition-all duration-150 group-hover:scale-125"
                style={{ left: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Controls Row: Shuffle | Prev | Play/Pause | Next | Repeat */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-2 px-1">
            {/* Left: Shuffle Capsule Button */}
            <button
              type="button"
              onClick={toggleShuffle}
              title={`Shuffle: ${shuffle ? 'On' : 'Off'}`}
              className={`h-8 sm:h-9 px-3 rounded-full border flex items-center justify-center transition-all active:scale-95 shadow-md ${
                shuffle
                  ? 'bg-amber-500/25 border-amber-400/60 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-white/10 border-white/20 text-white/70 hover:text-white hover:bg-white/15'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Center Controls Group: Prev, Large Raised Play/Pause, Next */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Previous Track */}
              <button
                type="button"
                onClick={handleRewClick}
                title="Previous Track"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/25 bg-white/10 text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition-all active:scale-90 shadow-md"
              >
                <div className="text-xs sm:text-sm font-bold font-mono">⏮</div>
              </button>

              {/* Large Concentric Frosted Glass Play / Pause Key */}
              <button
                type="button"
                onClick={isPlaying ? handlePauseClick : handlePlayClick}
                title={isPlaying ? 'Pause' : 'Play'}
                className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white/40 flex items-center justify-center transition-all active:scale-95 shadow-2xl group touch-manipulation"
                style={{
                  background: isPlaying
                    ? 'radial-gradient(circle at 35% 35%, rgba(254, 240, 138, 0.4) 0%, rgba(217, 119, 6, 0.6) 70%, rgba(120, 53, 15, 0.8) 100%)'
                    : 'radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.12) 70%, rgba(0, 0, 0, 0.3) 100%)',
                  boxShadow: `
                    0 10px 25px rgba(0, 0, 0, 0.5),
                    inset 0 2px 3px rgba(255, 255, 255, 0.7),
                    inset 0 -2px 3px rgba(0, 0, 0, 0.3),
                    ${isPlaying ? '0 0 20px rgba(251, 191, 36, 0.5)' : ''}
                  `,
                }}
              >
                {/* Inner Bevel Ring */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 border border-white/40 flex items-center justify-center shadow-inner">
                  {isPlaying ? (
                    <div className="text-white font-bold text-sm sm:text-base drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]">
                      ❚❚
                    </div>
                  ) : (
                    <div className="text-white font-bold text-sm sm:text-base ml-0.5 drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]">
                      ►
                    </div>
                  )}
                </div>
              </button>

              {/* Next Track */}
              <button
                type="button"
                onClick={handleFFClick}
                title="Next Track"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/25 bg-white/10 text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition-all active:scale-90 shadow-md"
              >
                <div className="text-xs sm:text-sm font-bold font-mono">⏭</div>
              </button>
            </div>

            {/* Right: Repeat Capsule Button with Indicator Dot */}
            <button
              type="button"
              onClick={cycleRepeat}
              title={`Repeat: ${repeat}`}
              className={`h-8 sm:h-9 px-3 rounded-full border flex items-center justify-center gap-1 transition-all active:scale-95 shadow-md ${
                repeat !== 'off'
                  ? 'bg-amber-500/25 border-amber-400/60 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-white/10 border-white/20 text-white/70 hover:text-white hover:bg-white/15'
              }`}
            >
              <Repeat className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {repeat !== 'off' && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#fbbf24] shadow-[0_0_5px_#fbbf24]" />
              )}
            </button>
          </div>

          {/* Bottom Volume Slider Row */}
          <div className="flex items-center justify-between gap-2 px-1 pt-1 border-t border-white/10">
            <Volume1 className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
            <div
              onClick={handleVolumeSeek}
              title={`Volume: ${Math.round(volumePercent)}%`}
              className="relative flex-1 h-1.5 bg-white/15 rounded-full cursor-pointer overflow-hidden border border-white/10 group"
            >
              <div
                className="h-full rounded-full transition-all duration-150"
                style={{
                  width: `${volumePercent}%`,
                  background: 'linear-gradient(90deg, #f59e0b 0%, #fde047 100%)',
                  boxShadow: '0 0 8px rgba(253, 224, 71, 0.6)',
                }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border border-amber-400 shadow-sm -translate-x-1/2 pointer-events-none"
                style={{ left: `${volumePercent}%` }}
              />
            </div>
            <Volume2 className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};
