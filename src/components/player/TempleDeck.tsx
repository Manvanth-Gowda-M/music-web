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

export const TempleDeck: React.FC = () => {
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
    setQueueOpen,
    isQueueOpen,
  } = usePlayerStore();

  const { currentWorld } = useWorldStore();
  const vfdCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeBand, setActiveBand] = useState<'FM' | 'AM' | 'SW'>('FM');
  const [isSideA, setIsSideA] = useState(true);

  // Animate the Golden Temple VFD Audio Spectrum Display & Gopuram Silhouette
  useEffect(() => {
    const canvas = vfdCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;
    const barCount = 36;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const freqData = AudioEngine.getFrequencyData();
      const metrics = AudioEngine.getEnergyMetrics();
      const hasAudio = isPlaying;

      const w = canvas.width;
      const h = canvas.height;
      const barWidth = 4;
      const spacing = (w - barCount * barWidth) / (barCount - 1);

      // 1. Draw subtle background temple gopuram silhouette
      ctx.fillStyle = 'rgba(217, 119, 6, 0.08)';
      ctx.beginPath();
      // Center temple gopuram peak
      ctx.moveTo(w * 0.5 - 24, h);
      ctx.lineTo(w * 0.5 - 16, h * 0.35);
      ctx.lineTo(w * 0.5 - 6, h * 0.15);
      ctx.lineTo(w * 0.5, h * 0.05); // Top kalasha
      ctx.lineTo(w * 0.5 + 6, h * 0.15);
      ctx.lineTo(w * 0.5 + 16, h * 0.35);
      ctx.lineTo(w * 0.5 + 24, h);
      ctx.fill();

      // 2. Draw glowing golden baseline dots
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + spacing);
        ctx.fillRect(x, h - 2, barWidth, 1);
      }

      // 3. Draw Golden Acoustic Mantra Spectrum Columns
      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + spacing);
        const distFromCenter = Math.abs(i - barCount / 2) / (barCount / 2);
        const centerWeight = Math.cos(distFromCenter * Math.PI * 0.42);

        let level = 0;
        if (hasAudio) {
          const freqIdx = Math.floor((i / barCount) * 32);
          const raw = (freqData[freqIdx] || 0) / 255;
          const boost = i > 10 && i < 24 ? metrics.bass * 0.45 : metrics.mid * 0.35;
          level = Math.min(1, (raw * 0.75 + boost) * centerWeight);
        } else {
          level = 0.06 + Math.sin(phase + i * 0.28) * 0.04;
        }

        const barH = Math.max(2, level * (h - 4));
        const y = h - barH - 2;

        // Sacred Golden Brass Gradient
        const grad = ctx.createLinearGradient(x, y, x, h);
        grad.addColorStop(0, '#fef08a'); // Radiant golden tip
        grad.addColorStop(0.35, '#f59e0b'); // Amber mid
        grad.addColorStop(1, '#92400e'); // Deep bronze base

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barH);

        // Floating Gold Spark / Peak Dot
        if (level > 0.35) {
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(x, Math.max(0.5, y - 2.5), barWidth, 1);
        }
      }

      phase += 0.035;
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
      const { selectedLanguage, selectedTheme, playStation } = usePlayerStore.getState();
      if (selectedLanguage && selectedLanguage !== 'Kannada' && currentTrack?.language !== selectedLanguage) {
        await playStation(selectedLanguage, selectedTheme || currentWorld.defaultMood || 'Devotional');
        return;
      }
      if (currentTrack) {
        await play();
      } else {
        if (selectedLanguage && selectedLanguage !== 'Kannada') {
          await playStation(selectedLanguage, selectedTheme || currentWorld.defaultMood || 'Devotional');
          return;
        }
        const allTracks = currentWorld.recommendedPlaylists.flatMap((p) => p.tracks);
        if (allTracks.length > 0) {
          const shuffled = [...allTracks].sort(() => Math.random() - 0.5);
          await playTrack(shuffled[0], shuffled);
        } else {
          await playStation('Kannada', 'Devotional');
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

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full max-w-lg mx-auto p-0.5 select-none pointer-events-auto">
      {/* ========================================================================= */}
      {/* MAIN TEMPLE DECK CHASSIS (Antique Dark Bronze Stone with Hoysala Carvings) */}
      {/* ========================================================================= */}
      <div
        className="relative rounded-2xl p-2 sm:p-3 border-2 shadow-2xl transition-all duration-300 overflow-hidden"
        style={{
          background: 'linear-gradient(170deg, #231c16 0%, #15110d 50%, #0c0907 100%)',
          borderColor: '#4d3b2c',
          boxShadow: `
            inset 0 1px 2px rgba(245, 158, 11, 0.15),
            inset 0 -2px 5px rgba(0, 0, 0, 0.9),
            0 18px 45px rgba(0, 0, 0, 0.95),
            0 0 25px rgba(180, 83, 9, 0.25)
          `,
        }}
      >
        {/* Top Header Ornate Floral Relief Crest */}
        <div className="flex items-center justify-center -mt-0.5 mb-1.5 opacity-80">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#b45309]/50 to-transparent" />
          <div className="mx-2 flex items-center gap-1 text-[#d97706] text-[10px]">
            <span>❀</span>
            <span className="font-kannada font-bold text-[9px] tracking-wider text-[#fbbf24]">
              ದೇವಾಲಯ ಮುಂಜಾನೆ • SACRED HARMONY
            </span>
            <span>❀</span>
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#b45309]/50 to-transparent" />
        </div>

        {/* ========================================================================= */}
        {/* TOP ROW: TEMPLE BELL NICHE | GOLDEN VFD SCREEN | BRASS ROSETTE VOLUME */}
        {/* ========================================================================= */}
        <div className="flex items-stretch justify-between gap-1.5 sm:gap-2 mb-2">
          {/* 1. LEFT: SACRED SANCTUM NICHE (Swinging Brass Bell, Om & Flickering Diya) */}
          <div
            className="w-14 sm:w-16 rounded-xl border border-[#4a3828] bg-gradient-to-b from-[#1c140d] to-[#0d0905] p-1 flex flex-col items-center justify-between relative shadow-inner flex-shrink-0"
            style={{
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.9), inset 0 0 10px rgba(217, 119, 6, 0.15)',
            }}
          >
            {/* Arched Temple Shrine Pillar Border */}
            <div className="absolute inset-0.5 rounded-lg border border-dashed border-[#d97706]/20 pointer-events-none" />

            {/* Hanging Brass Temple Bell (Ghanti) */}
            <div className="flex flex-col items-center pt-0.5">
              <div className="w-0.5 h-2 bg-[#b45309]" />
              <div
                className={`text-[#fbbf24] text-xs transition-transform duration-300 ${
                  isPlaying ? 'animate-bounce' : ''
                }`}
                style={{ animationDuration: '2s' }}
              >
                🔔
              </div>
            </div>

            {/* Sacred Om Symbol in Golden Brass */}
            <div className="font-kannada text-[#f59e0b] font-bold text-xs drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] my-0.5">
              ॐ
            </div>

            {/* Flickering Sacred Diya Oil Lamp at Base */}
            <div className="flex flex-col items-center pb-0.5">
              <div
                className={`w-1.5 h-2 rounded-full bg-gradient-to-t from-[#f97316] via-[#fbbf24] to-[#ffffff] ${
                  isPlaying ? 'animate-pulse' : ''
                }`}
                style={{
                  boxShadow: '0 0 8px #f59e0b, 0 0 12px #ea580c',
                }}
              />
              <div className="w-4 h-1.5 rounded-b-full bg-[#92400e] border-t border-[#f59e0b]/40 mt-0.5 shadow-sm" />
            </div>
          </div>

          {/* 2. CENTER: GOLDEN AMBER VFD SCREEN WITH TEMPLE GOPURAM SILHOUETTE */}
          <div
            onClick={handleVfdSeek}
            title="Click or drag to seek in raga"
            className="flex-1 rounded-xl border border-[#3b2b1d] p-1.5 flex flex-col justify-between relative shadow-inner overflow-hidden cursor-pointer group"
            style={{
              background: 'radial-gradient(ellipse at center, #261607 0%, #120b03 75%, #070401 100%)',
              boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.95), inset 0 0 12px rgba(245, 158, 11, 0.12)',
            }}
          >
            {/* Header: Time | Track Title & Artist | Duration */}
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono font-bold text-[#fbbf24] px-1 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]">
              <span>{formatTime(currentTime)}</span>
              <div className="text-center truncate px-1 flex-1 min-w-0">
                <span className="font-kannada font-bold text-white block truncate text-[10px] sm:text-xs">
                  {currentTrack?.localizedTitle || currentTrack?.title || 'ಶಾಂತಿ ಮಂತ್ರ'}
                </span>
                <span className="font-mono text-[7px] sm:text-[8px] text-[#f59e0b]/80 block truncate">
                  {currentTrack?.artist || 'TEMPLE CLASSICS'}
                </span>
              </div>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Golden Equalizer Spectrum with Gopuram Silhouette */}
            <div className="w-full h-6 sm:h-7 relative my-0.5">
              <canvas
                ref={vfdCanvasRef}
                width={320}
                height={28}
                className="w-full h-full block"
              />
            </div>

            {/* Sacred Seek Progress Line */}
            <div className="w-full h-1 bg-[#1a1109] rounded-full overflow-hidden border border-[#d97706]/20">
              <div
                className="h-full bg-gradient-to-r from-[#d97706] to-[#fbbf24] transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 3. RIGHT: EMBOSSED BRASS MANDALA ROSETTE VOLUME DIAL */}
          <div className="flex flex-col items-center justify-between flex-shrink-0 w-13 sm:w-16 py-0.5">
            <span className="text-[7px] sm:text-[8px] font-mono tracking-widest text-[#d97706] uppercase font-bold">
              VOLUME
            </span>
            <button
              onClick={handleVolumeDial}
              title={`Volume: ${Math.round(volume * 100)}% (Click to adjust)`}
              aria-label="Volume Dial"
              className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#b45309]/60 flex items-center justify-center cursor-pointer transition-transform active:scale-95 shadow-xl group touch-manipulation"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #92400e 0%, #451a03 60%, #1f0b02 100%)',
                boxShadow: 'inset 0 1px 2px rgba(251,191,36,0.4), 0 4px 10px rgba(0,0,0,0.85)',
              }}
            >
              {/* Carved Mandala Rosette Petals */}
              <div className="text-[#fbbf24] text-sm sm:text-base font-serif opacity-90 transition-transform duration-500 group-hover:rotate-45">
                ☸
              </div>
              {/* Pointer Indicator Dot */}
              <div
                className="absolute w-1 h-1 rounded-full bg-[#fef08a] shadow-[0_0_4px_#fef08a]"
                style={{
                  transform: `rotate(${-135 + volume * 270}deg) translateY(-14px)`,
                }}
              />
            </button>
            <div className="flex items-center justify-between w-10 sm:w-12 text-[7px] font-mono text-[#a16207] font-bold">
              <span>−</span>
              <span>+</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM ROW: MANDALA SPEAKER | CASSETTE WELL | EQ/LYRICS | TUNING GOPURAM */}
        {/* ========================================================================= */}
        <div className="flex items-stretch justify-between gap-1.5 sm:gap-2 pt-0.5">
          {/* Left 1: Rotating Brass Sound Mandala Wheel & Repeat/Shuffle Buttons */}
          <div className="flex flex-col justify-between w-11 sm:w-14 py-0.5 flex-shrink-0">
            {/* Carved Brass Audio Wheel */}
            <div
              className={`w-9 h-9 sm:w-11 sm:h-11 mx-auto rounded-full border border-[#d97706]/40 bg-gradient-to-tr from-[#381e09] to-[#170c04] flex items-center justify-center shadow-inner ${
                isPlaying ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '8s' }}
            >
              <div className="text-[#d97706] text-xs font-serif">🌸</div>
            </div>

            {/* Repeat & Shuffle Mini Buttons */}
            <div className="flex items-center justify-between gap-1 mt-1">
              <button
                onClick={cycleRepeat}
                title={`Repeat: ${repeat}`}
                className={`flex-1 py-0.5 rounded border text-[7px] font-mono flex items-center justify-center transition-all ${
                  repeat !== 'off'
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                    : 'border-[#4a3828] bg-[#1a130c] text-[#a89f91]'
                }`}
              >
                🔁
              </button>
              <button
                onClick={toggleShuffle}
                title={`Shuffle: ${shuffle ? 'On' : 'Off'}`}
                className={`flex-1 py-0.5 rounded border text-[7px] font-mono flex items-center justify-center transition-all ${
                  shuffle
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                    : 'border-[#4a3828] bg-[#1a130c] text-[#a89f91]'
                }`}
              >
                🔀
              </button>
            </div>
          </div>

          {/* Center: Sacred Lotus Brass Cassette Well with Rotating Reels */}
          <div
            className="flex-1 rounded-xl border border-[#3b2b1d] p-1.5 bg-gradient-to-b from-[#18110a] to-[#0c0805] relative shadow-xl flex flex-col justify-between overflow-hidden"
          >
            {/* Top Border Engraving */}
            <div className="flex items-center justify-between text-[7px] font-mono text-[#a16207] px-0.5 pb-0.5">
              <span>● ಮಂತ್ರ ಗಾನ</span>
              <span className="text-[#fbbf24] font-bold">SACRED TAPE 90</span>
              <span>DEVOTIONAL ●</span>
            </div>

            {/* Cassette Well with Dual Brass Reels & Lotus Center (Tap to toggle play/pause) */}
            <div
              onClick={handlePlayClick}
              title={isPlaying ? 'Click to Pause' : 'Click to Play'}
              className="relative h-11 sm:h-13 rounded-lg border border-[#4a3828] bg-[#0e0a06]/95 p-1 flex items-center justify-between shadow-inner cursor-pointer group"
            >
              {/* Left Brass Gear Reel */}
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#451a03] border border-[#fbbf24]/50 flex items-center justify-center shadow-md flex-shrink-0">
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '3.5s' }}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-[#1c0c03] flex items-center justify-center border border-[#d97706]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]" />
                  </div>
                  <div className="absolute inset-0 rounded-full border border-dashed border-[#f59e0b]/40" />
                </div>
              </div>

              {/* Center Carved Lotus Emblem */}
              <div className="flex-1 mx-2 flex flex-col items-center justify-center text-center">
                <div className="text-[#fbbf24] text-xs sm:text-sm drop-shadow-[0_0_6px_rgba(251,191,36,0.5)] transition-transform group-hover:scale-110">
                  🪷
                </div>
                <span className="text-[7px] sm:text-[8px] font-kannada font-bold text-amber-200 truncate max-w-full">
                  {currentTrack?.localizedTitle || currentTrack?.title || 'ಸಂಗೀತ'}
                </span>
              </div>

              {/* Right Brass Gear Reel */}
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#451a03] border border-[#fbbf24]/50 flex items-center justify-center shadow-md flex-shrink-0">
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '3.5s' }}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-[#1c0c03] flex items-center justify-center border border-[#d97706]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]" />
                  </div>
                  <div className="absolute inset-0 rounded-full border border-dashed border-[#f59e0b]/40" />
                </div>
              </div>

              {/* Gold Magnetic Ribbon Strip */}
              <div className="absolute bottom-0.5 inset-x-6 h-0.5 bg-[#78350f] rounded-full opacity-80" />
            </div>

            {/* Bottom Piano Keys Row inside the sacred frame */}
            <div className="grid grid-cols-5 gap-1 pt-1">
              <button
                type="button"
                onClick={handleRewClick}
                title="Previous Raga"
                className="py-1 rounded bg-[#20150c] border border-[#4a3828] text-[#a89f91] hover:text-[#fbbf24] hover:border-amber-500/40 text-[9px] font-mono font-bold active:scale-95 transition-all touch-manipulation"
              >
                ◄◄
              </button>
              <button
                type="button"
                onClick={handlePlayClick}
                title="Play"
                className={`py-1 rounded border text-[9px] font-mono font-bold active:scale-95 transition-all touch-manipulation ${
                  isPlaying
                    ? 'border-[#fbbf24] bg-gradient-to-b from-[#78350f] to-[#2e1305] text-[#fbbf24] shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                    : 'border-[#4a3828] bg-[#20150c] text-[#a89f91] hover:text-white'
                }`}
              >
                ►
              </button>
              <button
                type="button"
                onClick={handlePauseClick}
                title="Pause"
                className={`py-1 rounded border text-[9px] font-mono font-bold active:scale-95 transition-all touch-manipulation ${
                  !isPlaying && currentTrack
                    ? 'border-[#f59e0b] bg-gradient-to-b from-[#78350f] to-[#2e1305] text-[#fbbf24] shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                    : 'border-[#4a3828] bg-[#20150c] text-[#a89f91] hover:text-white'
                }`}
              >
                ❚❚
              </button>
              <button
                type="button"
                onClick={handleFFClick}
                title="Next Raga"
                className="py-1 rounded bg-[#20150c] border border-[#4a3828] text-[#a89f91] hover:text-[#fbbf24] hover:border-amber-500/40 text-[9px] font-mono font-bold active:scale-95 transition-all touch-manipulation"
              >
                ►►
              </button>
              <button
                type="button"
                onClick={handleStopClick}
                title="Stop Raga"
                className="py-1 rounded bg-[#20150c] border border-[#4a3828] text-[#a89f91] hover:text-white hover:border-amber-500/40 text-[9px] font-mono font-bold active:scale-95 transition-all touch-manipulation"
              >
                ■
              </button>
            </div>
          </div>

          {/* Right: FM/AM LEDs & Etched Gopuram Tuning Dial */}
          <div className="flex flex-col justify-between w-13 sm:w-16 py-0.5 flex-shrink-0">
            {/* Radio Band Selection LEDs */}
            <div className="rounded-lg bg-[#18110b] border border-[#4a3828] p-1 flex flex-col gap-0.5 shadow-inner">
              {(['FM', 'AM', 'SW'] as const).map((band) => {
                const isActive = activeBand === band;
                return (
                  <button
                    key={band}
                    onClick={() => setActiveBand(band)}
                    className="flex items-center justify-between gap-0.5 text-[7px] font-mono font-bold text-[#d97706] hover:text-white"
                  >
                    <div
                      className={`w-1.5 h-1 rounded-full transition-all duration-300 ${
                        isActive
                          ? 'bg-[#f59e0b] shadow-[0_0_6px_#f59e0b]'
                          : 'bg-[#3b2b1d]'
                      }`}
                    />
                    <span>{band}</span>
                  </button>
                );
              })}
            </div>

            {/* TUNING Gopuram Engraved Knob */}
            <div className="flex flex-col items-center mt-1">
              <span className="text-[7px] font-mono text-[#d97706] font-bold">TUNING</span>
              <button
                onClick={handleTuningDial}
                title="Tuning Dial (Next Raga)"
                aria-label="Tuning Dial"
                className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#b45309] bg-gradient-to-br from-[#451a03] to-[#1a0b03] flex items-center justify-center active:scale-95 transition-all shadow-md group"
              >
                <div className="text-[#fbbf24] text-[11px]">🛕</div>
                <div className="absolute w-0.5 h-2 bg-[#ef4444] rounded-full shadow-[0_0_4px_#ef4444] -translate-y-2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
