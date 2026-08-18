'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useWorldStore } from '@/store/worldStore';
import { AudioEngine } from '@/services/audio/AudioEngine';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const BeachDeck: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    play,
    pause,
    playTrack,
    seek,
    next,
    previous,
    setVolume,
    setQueueOpen,
    isQueueOpen,
  } = usePlayerStore();

  const { currentWorld } = useWorldStore();
  const vfdCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeBand, setActiveBand] = useState<'FM' | 'AM' | 'SW'>('FM');
  const [isPowerOn, setIsPowerOn] = useState(true);

  // Animate the Cyan Beach Ocean Wave VFD Visualizer
  useEffect(() => {
    const canvas = vfdCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;
    const barCount = 42;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const freqData = AudioEngine.getFrequencyData();
      const metrics = AudioEngine.getEnergyMetrics();
      const hasAudio = isPlaying && isPowerOn;

      const w = canvas.width;
      const h = canvas.height;
      const barWidth = 3;
      const spacing = (w - barCount * barWidth) / (barCount - 1);

      // 1. Draw subtle palm tree silhouette on left
      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.beginPath();
      ctx.moveTo(12, h);
      ctx.quadraticCurveTo(18, h * 0.5, 22, h * 0.2);
      ctx.lineTo(24, h * 0.2);
      ctx.quadraticCurveTo(20, h * 0.5, 14, h);
      ctx.fill();

      // Palm fronds
      ctx.beginPath();
      ctx.arc(23, h * 0.2, 10, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw glowing sun over ocean horizon on right
      const sunGrad = ctx.createRadialGradient(w - 28, h * 0.45, 1, w - 28, h * 0.45, 12);
      sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      sunGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.2)');
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(w - 28, h * 0.45, 12, 0, Math.PI * 2);
      ctx.fill();

      // Horizon line
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.fillRect(0, h - 3, w, 1);

      // 3. Draw Cyan Coastal Equalizer Bars with Ocean Wave Modulation
      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + spacing);
        const normX = i / barCount;
        // Wave curvature envelope (higher in center-left, gentler towards sunrise)
        const waveEnvelope = Math.sin(normX * Math.PI) * 0.85 + 0.15;

        let level = 0;
        if (hasAudio) {
          const freqIdx = Math.floor((i / barCount) * 36);
          const raw = (freqData[freqIdx] || 0) / 255;
          const boost = i > 12 && i < 28 ? metrics.mid * 0.4 : metrics.bass * 0.3;
          level = Math.min(1, (raw * 0.7 + boost + Math.sin(phase + i * 0.3) * 0.08) * waveEnvelope);
        } else if (isPowerOn) {
          level = (0.08 + Math.sin(phase + i * 0.35) * 0.05) * waveEnvelope;
        }

        const barH = Math.max(2, level * (h - 6));
        const y = h - barH - 3;

        // Bright Cyan & Turquoise Ocean Gradient
        const grad = ctx.createLinearGradient(x, y, x, h);
        grad.addColorStop(0, '#a5f3fc'); // Sparkling seafoam tip
        grad.addColorStop(0.4, '#22d3ee'); // Bright cyan
        grad.addColorStop(1, '#0284c7'); // Deep ocean blue base

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barH);

        // Peak Spark Dot
        if (level > 0.4) {
          ctx.fillStyle = '#e0f2fe';
          ctx.fillRect(x, Math.max(1, y - 2), barWidth, 1);
        }
      }

      phase += 0.04;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, isPowerOn]);

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

  const handleStopClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    pause();
    seek(0);
  };

  const handleVolumeDial = () => {
    if (volume === 0 || isMuted) setVolume(0.5);
    else if (volume < 0.5) setVolume(0.8);
    else if (volume < 0.9) setVolume(1.0);
    else setVolume(0.3);
  };

  const handleTuningDial = async () => {
    await AudioEngine.resumeContext();
    await next();
  };

  const handleVfdSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seek(ratio * duration);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-0.5 select-none pointer-events-auto">
      {/* ========================================================================= */}
      {/* MAIN BEACH CASSETTE CHASSIS (Sun-bleached Sand Resin with Weathered Patina) */}
      {/* ========================================================================= */}
      <div
        className="relative rounded-2xl p-2.5 sm:p-3.5 border-2 shadow-2xl transition-all duration-300 overflow-hidden"
        style={{
          background: 'linear-gradient(175deg, #ded8c8 0%, #cdc6b3 45%, #b8b09b 100%)',
          borderColor: '#9e9581',
          boxShadow: `
            inset 0 2px 3px rgba(255, 255, 255, 0.6),
            inset 0 -2px 5px rgba(60, 50, 40, 0.4),
            0 18px 45px rgba(0, 0, 0, 0.85),
            0 0 20px rgba(56, 189, 248, 0.15)
          `,
        }}
      >
        {/* Subtle Weathered Salt & Sand Grain Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

        {/* ========================================================================= */}
        {/* TOP ROW: VOLUME DIAL | CYAN LIVE WAVE VISUALIZER | TUNING DIAL */}
        {/* ========================================================================= */}
        <div className="flex items-stretch justify-between gap-2 mb-2 relative z-10">
          {/* 1. LEFT: WEATHERED STEEL VOLUME KNOB */}
          <div className="flex flex-col items-center justify-between flex-shrink-0 w-12 sm:w-14 py-0.5">
            <span className="text-[7px] sm:text-[8px] font-mono tracking-wider text-[#5c5446] font-bold">
              VOLUME
            </span>
            <button
              type="button"
              onClick={handleVolumeDial}
              title={`Volume: ${Math.round(volume * 100)}% (Click to adjust)`}
              aria-label="Volume Dial"
              className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#8c8370] flex items-center justify-center cursor-pointer transition-transform active:scale-95 shadow-lg group touch-manipulation"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #d5cfbf 0%, #a9a08c 70%, #766d5b 100%)',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.7), 0 3px 6px rgba(0,0,0,0.3)',
              }}
            >
              {/* Inner knurled center cap */}
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#9a917e] border border-white/40 flex items-center justify-center shadow-inner">
                {/* Pointer notch */}
                <div
                  className="w-0.5 sm:w-1 h-2 sm:h-2.5 bg-[#2d281f] rounded-full shadow-sm"
                  style={{
                    transform: `rotate(${-135 + volume * 270}deg) translateY(-4px)`,
                  }}
                />
              </div>
            </button>
            <div className="flex items-center justify-between w-10 sm:w-12 text-[6px] sm:text-[7px] font-mono text-[#6d6453] font-bold">
              <span>MIN</span>
              <span>MAX</span>
            </div>
          </div>

          {/* 2. CENTER: CYAN LIVE BEACH SCREEN (Palm Trees, Sun & Wave Spectrum) */}
          <div
            onClick={handleVfdSeek}
            title="Click or drag to seek in track"
            className="flex-1 rounded-xl border-2 border-[#524a3c] p-1.5 flex flex-col justify-between relative shadow-inner overflow-hidden cursor-pointer group"
            style={{
              background: 'radial-gradient(ellipse at 70% 30%, #153243 0%, #0c202d 50%, #051017 100%)',
              boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.95), inset 0 0 15px rgba(34, 211, 238, 0.15)',
            }}
          >
            {/* Screen Header: Time | Track Info | Duration */}
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono font-bold text-[#38bdf8] px-1 drop-shadow-[0_0_6px_rgba(56,189,248,0.7)]">
              <span>{formatTime(currentTime)}</span>
              <div className="text-center truncate px-1 flex-1 min-w-0">
                <span className="font-kannada font-bold text-white block truncate text-[10px] sm:text-xs">
                  {currentTrack?.localizedTitle || currentTrack?.title || 'ಕರಾವಳಿ ಅಲೆಗಳು'}
                </span>
                <span className="font-mono text-[7px] sm:text-[8px] text-[#7dd3fc]/80 block truncate">
                  {currentTrack?.artist || 'COASTAL SUNRISE'}
                </span>
              </div>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Cyan Wave Spectrum Canvas */}
            <div className="w-full h-7 sm:h-8 relative my-0.5">
              <canvas
                ref={vfdCanvasRef}
                width={340}
                height={32}
                className="w-full h-full block"
              />
            </div>

            {/* Wave Badge & LIVE VISUALIZER Text */}
            <div className="flex items-center justify-center gap-1.5 -mb-0.5">
              <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#38bdf8]/40" />
              <span className="text-[#38bdf8] text-[8px]">🌊</span>
              <span className="text-[7px] sm:text-[8px] font-mono tracking-widest text-[#7dd3fc] uppercase font-bold drop-shadow-[0_0_4px_rgba(56,189,248,0.5)]">
                LIVE VISUALIZER
              </span>
              <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#38bdf8]/40" />
            </div>
          </div>

          {/* 3. RIGHT: TUNING KNOB & FM/AM/SW LEDs */}
          <div className="flex flex-col items-center justify-between flex-shrink-0 w-12 sm:w-14 py-0.5">
            <span className="text-[7px] sm:text-[8px] font-mono tracking-wider text-[#5c5446] font-bold">
              TUNING
            </span>
            <button
              type="button"
              onClick={handleTuningDial}
              title="Tuning Dial (Next Track)"
              aria-label="Tuning Dial"
              className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#8c8370] flex items-center justify-center cursor-pointer transition-transform active:scale-95 shadow-lg group touch-manipulation"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #d5cfbf 0%, #a9a08c 70%, #766d5b 100%)',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.7), 0 3px 6px rgba(0,0,0,0.3)',
              }}
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#9a917e] border border-white/40 flex items-center justify-center shadow-inner">
                {/* Glowing Amber Tuning Pointer */}
                <div className="w-1 h-2 bg-[#f59e0b] rounded-full shadow-[0_0_5px_#f59e0b] -translate-y-2" />
              </div>
            </button>
            <div className="flex items-center justify-center gap-1 text-[6px] sm:text-[7px] font-mono text-[#6d6453] font-bold">
              <span className="text-[#d97706]">●</span>
              <span>FM 93.5</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MIDDLE ROW: SURFBOARD ENGRAVING | CASSETTE WELL | SUNSET ENGRAVING */}
        {/* ========================================================================= */}
        <div className="flex items-stretch justify-between gap-1.5 sm:gap-2 mb-2">
          {/* Left Panel: Palm Tree & Surfboard Line Art + Speaker Grille */}
          <div className="w-14 sm:w-18 flex flex-col justify-between items-center py-1 px-0.5 border border-[#aba28e] rounded-xl bg-[#d5cebc]/60 shadow-inner flex-shrink-0">
            {/* Engraved Palm Tree & Surfboard */}
            <div className="flex flex-col items-center opacity-75 my-auto">
              <div className="text-base sm:text-lg leading-none">🌴🏄</div>
              <div className="flex gap-1 text-[8px] text-[#6d6453] mt-0.5">
                <span>〰</span>
                <span>〰</span>
              </div>
            </div>
            {/* Slotted Speaker Grille Lines */}
            <div className="w-full flex flex-col gap-1 px-1.5 mt-1">
              <div className="h-1 bg-[#8c826e] rounded-full opacity-60 shadow-inner" />
              <div className="h-1 bg-[#8c826e] rounded-full opacity-60 shadow-inner" />
              <div className="h-1 bg-[#8c826e] rounded-full opacity-60 shadow-inner" />
            </div>
          </div>

          {/* Center: Transparent Coastal Cassette Well with EJECT & CASSETTE DECK */}
          <div className="flex-1 rounded-xl border-2 border-[#5c5344] bg-[#221f1b] p-1.5 flex items-center justify-between gap-1.5 shadow-xl relative overflow-hidden">
            {/* Left EJECT Button */}
            <button
              type="button"
              onClick={() => setQueueOpen(!isQueueOpen)}
              title="Eject / Open Playlist Queue"
              className={`w-7 sm:w-9 h-full rounded-lg border flex flex-col items-center justify-center transition-all active:scale-95 shadow-sm touch-manipulation ${
                isQueueOpen
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-[#beb6a3] border-[#8a816e] text-[#423b2e] hover:text-black'
              }`}
            >
              <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[4px] border-b-current mb-0.5" />
              <span className="text-[5.5px] sm:text-[6.5px] font-mono font-bold tracking-tighter">
                EJECT
              </span>
            </button>

            {/* Clear Transparent Cassette Well (Tap to play/pause) */}
            <div
              onClick={handlePlayClick}
              title={isPlaying ? 'Click to Pause' : 'Click to Play'}
              className="flex-1 h-12 sm:h-14 rounded-lg border border-[#3d372e] bg-[#12100e]/90 p-1 flex items-center justify-between relative shadow-inner cursor-pointer group"
            >
              {/* Corner Screws */}
              <div className="absolute top-1 left-1 text-[7px] text-[#554e41] font-mono leading-none">＋</div>
              <div className="absolute top-1 right-1 text-[7px] text-[#554e41] font-mono leading-none">＋</div>
              <div className="absolute bottom-1 left-1 text-[7px] text-[#554e41] font-mono leading-none">＋</div>
              <div className="absolute bottom-1 right-1 text-[7px] text-[#554e41] font-mono leading-none">＋</div>

              {/* Left White Spool */}
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[#9ca3af] flex items-center justify-center shadow-md flex-shrink-0">
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '3s' }}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-[#1e293b] flex items-center justify-center border border-[#64748b]">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div className="absolute inset-0 rounded-full border border-dashed border-[#64748b]/60" />
                </div>
              </div>

              {/* Center Cassette Sticker with Wave Illustration & 'A' */}
              <div className="flex-1 mx-1.5 flex flex-col items-center justify-center bg-[#283548]/70 border border-[#475569] rounded px-1 py-0.5 text-center">
                <div className="flex items-center justify-between w-full text-[6.5px] sm:text-[7.5px] font-mono text-[#93c5fd] font-bold px-0.5">
                  <span>A</span>
                  <span className="text-[#38bdf8]">🌊 COASTAL</span>
                  <span>60</span>
                </div>
                <span className="text-[7px] sm:text-[8px] font-kannada font-bold text-white truncate max-w-full">
                  {currentTrack?.localizedTitle || currentTrack?.title || 'ಸಾಗರ ಗಾನ'}
                </span>
              </div>

              {/* Right White Spool */}
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[#9ca3af] flex items-center justify-center shadow-md flex-shrink-0">
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '3s' }}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-[#1e293b] flex items-center justify-center border border-[#64748b]">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div className="absolute inset-0 rounded-full border border-dashed border-[#64748b]/60" />
                </div>
              </div>
            </div>

            {/* Right CASSETTE DECK Button */}
            <div className="w-7 sm:w-9 h-full rounded-lg border border-[#8a816e] bg-[#beb6a3] flex flex-col items-center justify-center shadow-sm text-[#423b2e] flex-shrink-0">
              <span className="text-[5.5px] sm:text-[6px] font-mono font-bold leading-tight text-center">
                CASSETTE<br />DECK
              </span>
              <span className="text-[9px] mt-0.5">🌊</span>
            </div>
          </div>

          {/* Right Panel: Sunset Over Ocean Line Art + Speaker Grille */}
          <div className="w-14 sm:w-18 flex flex-col justify-between items-center py-1 px-0.5 border border-[#aba28e] rounded-xl bg-[#d5cebc]/60 shadow-inner flex-shrink-0">
            {/* Engraved Sunset Over Waves */}
            <div className="flex flex-col items-center opacity-75 my-auto">
              <div className="text-base sm:text-lg leading-none">🌅</div>
              <div className="flex gap-1 text-[8px] text-[#6d6453] mt-0.5">
                <span>〰</span>
                <span>〰</span>
              </div>
            </div>
            {/* Slotted Speaker Grille Lines */}
            <div className="w-full flex flex-col gap-1 px-1.5 mt-1">
              <div className="h-1 bg-[#8c826e] rounded-full opacity-60 shadow-inner" />
              <div className="h-1 bg-[#8c826e] rounded-full opacity-60 shadow-inner" />
              <div className="h-1 bg-[#8c826e] rounded-full opacity-60 shadow-inner" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM ROW: WEATHERED OCEAN PIANO KEYS (POWER, REW, PLAY, PAUSE, FF, STOP) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-6 gap-1 sm:gap-1.5 pt-0.5">
          {/* 1. POWER with Dual Glowing Amber LEDs */}
          <button
            type="button"
            onClick={() => setIsPowerOn(!isPowerOn)}
            title="Power On / Off"
            className="py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl border border-[#6b6251] bg-gradient-to-b from-[#6c7b88] to-[#45525d] text-white flex flex-col items-center justify-center shadow-md active:translate-y-0.5 transition-all touch-manipulation"
          >
            <div className="flex gap-1 mb-0.5">
              <div
                className={`w-1.5 h-1 rounded-full ${
                  isPowerOn ? 'bg-[#f59e0b] shadow-[0_0_5px_#f59e0b]' : 'bg-[#282f36]'
                }`}
              />
              <div
                className={`w-1.5 h-1 rounded-full ${
                  isPowerOn ? 'bg-[#f59e0b] shadow-[0_0_5px_#f59e0b]' : 'bg-[#282f36]'
                }`}
              />
            </div>
            <span className="text-[6.5px] sm:text-[7.5px] font-mono font-bold text-[#e2e8f0]">
              POWER
            </span>
          </button>

          {/* 2. REW */}
          <button
            type="button"
            onClick={handleRewClick}
            title="Rewind / Previous Track"
            className="py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl border border-[#6b6251] bg-gradient-to-b from-[#6c7b88] to-[#45525d] text-white flex flex-col items-center justify-center shadow-md active:translate-y-0.5 transition-all touch-manipulation hover:border-cyan-400/40"
          >
            <div className="text-[10px] sm:text-xs font-bold font-mono">◄◄</div>
            <span className="text-[6.5px] sm:text-[7.5px] font-mono font-bold text-[#cbd5e1] mt-0.5">
              REW
            </span>
          </button>

          {/* 3. PLAY */}
          <button
            type="button"
            onClick={handlePlayClick}
            title="Play"
            className={`py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl border transition-all active:translate-y-0.5 shadow-md flex flex-col items-center justify-center touch-manipulation ${
              isPlaying
                ? 'border-cyan-400 bg-gradient-to-b from-[#4d7c9e] to-[#254660] text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.4)]'
                : 'border-[#6b6251] bg-gradient-to-b from-[#6c7b88] to-[#45525d] text-white'
            }`}
          >
            <div className="text-[10px] sm:text-xs font-bold font-mono">►</div>
            <span className="text-[6.5px] sm:text-[7.5px] font-mono font-bold mt-0.5">
              PLAY
            </span>
          </button>

          {/* 4. PAUSE (Glowing Amber Neon Text & Underglow when Paused) */}
          <button
            type="button"
            onClick={handlePauseClick}
            title="Pause Playback"
            className={`py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl border transition-all active:translate-y-0.5 shadow-lg flex flex-col items-center justify-center touch-manipulation ${
              !isPlaying && currentTrack
                ? 'border-[#f59e0b] bg-gradient-to-b from-[#5c4a30] to-[#2b2112] text-[#fbbf24] shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                : 'border-[#6b6251] bg-gradient-to-b from-[#6c7b88] to-[#45525d] text-white'
            }`}
          >
            <div className="text-[10px] sm:text-xs font-bold font-mono">❚❚</div>
            <span className={`text-[6.5px] sm:text-[7.5px] font-mono font-bold mt-0.5 ${!isPlaying && currentTrack ? 'drop-shadow-[0_0_5px_#fbbf24]' : ''}`}>
              PAUSE
            </span>
          </button>

          {/* 5. FF */}
          <button
            type="button"
            onClick={handleFFClick}
            title="Fast Forward / Next Track"
            className="py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl border border-[#6b6251] bg-gradient-to-b from-[#6c7b88] to-[#45525d] text-white flex flex-col items-center justify-center shadow-md active:translate-y-0.5 transition-all touch-manipulation hover:border-cyan-400/40"
          >
            <div className="text-[10px] sm:text-xs font-bold font-mono">►►</div>
            <span className="text-[6.5px] sm:text-[7.5px] font-mono font-bold text-[#cbd5e1] mt-0.5">
              FF
            </span>
          </button>

          {/* 6. STOP */}
          <button
            type="button"
            onClick={handleStopClick}
            title="Stop Playback"
            className="py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl border border-[#6b6251] bg-gradient-to-b from-[#6c7b88] to-[#45525d] text-white flex flex-col items-center justify-center shadow-md active:translate-y-0.5 transition-all touch-manipulation hover:border-cyan-400/40"
          >
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#cbd5e1] rounded-sm my-0.5" />
            <span className="text-[6.5px] sm:text-[7.5px] font-mono font-bold text-[#cbd5e1] mt-0.5">
              STOP
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
