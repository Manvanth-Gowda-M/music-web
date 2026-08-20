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

export const VintageCassetteDeck: React.FC = () => {
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

  const { currentWorld, settings } = useWorldStore();
  const vfdCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeBand, setActiveBand] = useState<'FM' | 'AM' | 'SW'>('FM');
  const [isPowerOn, setIsPowerOn] = useState(true);

  // Dedicated Button Handlers with Guaranteed Audio Context Unlock
  const handlePlayClick = async () => {
    await AudioEngine.resumeContext();
    if (!isPlaying) {
      const { selectedLanguage, selectedTheme, playStation } = usePlayerStore.getState();
      if (selectedLanguage && selectedLanguage !== 'Kannada' && currentTrack?.language !== selectedLanguage) {
        await playStation(selectedLanguage, selectedTheme || currentWorld.defaultMood || 'Retro');
        return;
      }
      if (currentTrack) {
        await play();
      } else {
        if (selectedLanguage && selectedLanguage !== 'Kannada') {
          await playStation(selectedLanguage, selectedTheme || currentWorld.defaultMood || 'Retro');
          return;
        }
        const allTracks = currentWorld.recommendedPlaylists.flatMap((p) => p.tracks);
        if (allTracks.length > 0) {
          const shuffled = [...allTracks].sort(() => Math.random() - 0.5);
          await playTrack(shuffled[0], shuffled);
        } else {
          await playStation('Kannada', 'Retro');
        }
      }
    }
  };

  const handlePauseClick = () => {
    if (isPlaying) {
      pause();
    }
  };

  const handleRewClick = async () => {
    await AudioEngine.resumeContext();
    await previous();
  };

  const handleFFClick = async () => {
    await AudioEngine.resumeContext();
    await next();
  };

  const handleStopClick = () => {
    pause();
    seek(0);
  };

  const handleVfdSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seek(ratio * duration);
  };

  // Animate the Amber VFD Audio Spectrum Display in the top center window
  useEffect(() => {
    const canvas = vfdCanvasRef.current;
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
      const hasAudio = isPlaying && isPowerOn;

      const barWidth = 4;
      const spacing = (canvas.width - barCount * barWidth) / (barCount - 1);
      const h = canvas.height;

      // Draw horizontal baseline grid dots
      ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + spacing);
        ctx.fillRect(x, h - 3, barWidth, 1.5);
      }

      // Draw glowing amber spectrum equalizer columns
      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + spacing);
        
        // Bell-curve distribution centered in the display
        const distFromCenter = Math.abs(i - barCount / 2) / (barCount / 2);
        const centerWeight = Math.cos(distFromCenter * Math.PI * 0.45);

        let level = 0;
        if (hasAudio) {
          const freqIdx = Math.floor((i / barCount) * 32);
          const raw = (freqData[freqIdx] || 0) / 255;
          const beatBoost = i > 12 && i < 26 ? metrics.bass * 0.4 : metrics.treble * 0.3;
          level = Math.min(1, (raw * 0.75 + beatBoost) * centerWeight);
        } else {
          level = 0.08 + Math.sin(phase + i * 0.3) * 0.05;
        }

        const barHeight = Math.max(2, level * (h - 6));
        const y = h - barHeight - 3;

        // Glowing Amber LED Gradient
        const grad = ctx.createLinearGradient(x, y, x, h);
        grad.addColorStop(0, '#fef08a'); // Warm yellow-white tip
        grad.addColorStop(0.3, '#f59e0b'); // Amber mid
        grad.addColorStop(1, '#b45309'); // Deep amber base

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Peak Dot Indicator (Amber dot floating above highest bars)
        if (level > 0.4) {
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(x, Math.max(1, y - 3), barWidth, 1.5);
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

  const handleVolumeKnobClick = () => {
    // Cycle volume between 0.3, 0.7, 1.0, 0
    if (volume === 0 || isMuted) {
      setVolume(0.5);
    } else if (volume < 0.5) {
      setVolume(0.8);
    } else if (volume < 0.9) {
      setVolume(1.0);
    } else {
      setVolume(0.3);
    }
  };

  const handleTuningClick = () => {
    // Advance track on tuning knob click
    next();
  };

  const handlePowerClick = () => {
    setIsPowerOn(!isPowerOn);
    if (isPlaying) {
      togglePlay();
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-0.5 select-none pointer-events-auto">
      {/* ========================================================================= */}
      {/* MAIN CAR/BUS CASSETTE DECK CHASSIS (Sleek Compact Matte Charcoal Metallic) */}
      {/* ========================================================================= */}
      <div
        className="relative rounded-2xl p-2.5 sm:p-3.5 border-2 shadow-2xl transition-all duration-300 overflow-hidden"
        style={{
          background: 'linear-gradient(170deg, #22201e 0%, #141312 50%, #0b0a09 100%)',
          borderColor: '#383431',
          boxShadow: `
            inset 0 1px 2px rgba(255, 255, 255, 0.1),
            inset 0 -2px 4px rgba(0, 0, 0, 0.8),
            0 15px 40px rgba(0, 0, 0, 0.9),
            0 0 20px rgba(0, 0, 0, 0.6)
          `,
        }}
      >
        {/* Realistic Corner Bevel Screws */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#1b1918] border border-white/10 shadow-inner flex items-center justify-center">
          <div className="w-1 h-0.5 bg-[#403c39] rotate-45" />
        </div>
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#1b1918] border border-white/10 shadow-inner flex items-center justify-center">
          <div className="w-1 h-0.5 bg-[#403c39] -rotate-45" />
        </div>
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-[#1b1918] border border-white/10 shadow-inner flex items-center justify-center">
          <div className="w-1 h-0.5 bg-[#403c39] -rotate-12" />
        </div>
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-[#1b1918] border border-white/10 shadow-inner flex items-center justify-center">
          <div className="w-1 h-0.5 bg-[#403c39] rotate-75" />
        </div>

        {/* ========================================================================= */}
        {/* TOP ROW: VOLUME KNOB | AMBER VFD EQUALIZER SCREEN | TUNING KNOB */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2.5 mb-2 sm:mb-2.5">
          {/* 1. LEFT: VOLUME KNOB */}
          <div className="flex flex-col items-center flex-shrink-0">
            <span className="text-[8px] sm:text-[9px] font-mono tracking-widest text-[#a89f91] uppercase font-bold mb-0.5">
              VOL
            </span>
            <button
              onClick={handleVolumeKnobClick}
              title={`Volume: ${Math.round(volume * 100)}% (Click to adjust)`}
              aria-label="Volume Dial"
              className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-[#121110] flex items-center justify-center cursor-pointer transition-transform active:scale-95 shadow-lg group touch-manipulation"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #383431 0%, #181615 60%, #0d0c0b 100%)',
                boxShadow: 'inset 0 1px 1.5px rgba(255,255,255,0.15), 0 4px 8px rgba(0,0,0,0.8)',
              }}
            >
              {/* Knurled Outer Ridges */}
              <div className="absolute inset-0.5 rounded-full border border-dashed border-[#57524d]/30" />
              {/* Center Cap & Notch Pointer */}
              <div className="relative w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#161413] border border-white/10 flex items-center justify-center shadow-inner">
                <div
                  className="w-0.5 sm:w-1 h-2 sm:h-3 bg-[#e2d9cc] rounded-full shadow-sm transition-transform duration-300"
                  style={{
                    transform: `rotate(${-135 + volume * 270}deg) translateY(-5px)`,
                  }}
                />
              </div>
            </button>
            <div className="flex items-center justify-between w-9 sm:w-11 text-[7px] font-mono text-[#827a6f] mt-0.5 font-semibold">
              <span>MIN</span>
              <span>MAX</span>
            </div>
          </div>

          {/* 2. CENTER: RECESSED AMBER VFD DIGITAL SCREEN (Click/drag to seek) */}
          <div
            onClick={handleVfdSeek}
            title="Click or drag to seek in track"
            className="flex-1 mx-1 sm:mx-2 h-11 sm:h-13 rounded-lg sm:rounded-xl border border-[#141210] p-1 sm:p-1.5 flex flex-col justify-between relative shadow-inner overflow-hidden cursor-pointer group"
            style={{
              background: 'radial-gradient(ellipse at center, #241403 0%, #100801 75%, #060301 100%)',
              boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.95), inset 0 0 10px rgba(245, 158, 11, 0.1)',
            }}
          >
            {/* Top LCD Header: Current Time | KSRTC FM Stereo | Total Duration */}
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono font-bold text-[#fbbf24] px-1 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]">
              <span>{formatTime(currentTime)}</span>
              <span className="text-[8px] tracking-wider text-[#d97706] hidden xs:inline">
                {currentTrack?.genre || 'STEREO'}
              </span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Amber Audio Spectrum Equalizer Canvas */}
            <div className="w-full h-5 sm:h-6 relative">
              <canvas
                ref={vfdCanvasRef}
                width={320}
                height={24}
                className="w-full h-full block"
              />
            </div>

            {/* Subtle Screen Reflection Glare */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent pointer-events-none" />
          </div>

          {/* 3. RIGHT: TUNING KNOB */}
          <div className="flex flex-col items-center flex-shrink-0">
            <span className="text-[8px] sm:text-[9px] font-mono tracking-widest text-[#a89f91] uppercase font-bold mb-0.5">
              TUNE
            </span>
            <button
              onClick={handleTuningClick}
              title="Tuning (Click for next song)"
              aria-label="Tuning Dial"
              className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-[#121110] flex items-center justify-center cursor-pointer transition-transform active:scale-95 shadow-lg group touch-manipulation"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #383431 0%, #181615 60%, #0d0c0b 100%)',
                boxShadow: 'inset 0 1px 1.5px rgba(255,255,255,0.15), 0 4px 8px rgba(0,0,0,0.8)',
              }}
            >
              {/* Knurled Outer Ridges */}
              <div className="absolute inset-0.5 rounded-full border border-dashed border-[#57524d]/30" />
              {/* Center Cap & Red Tuning Notch Line */}
              <div className="relative w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#161413] border border-white/10 flex items-center justify-center shadow-inner">
                <div className="w-0.5 h-2 sm:h-3 bg-[#ef4444] rounded-full shadow-[0_0_5px_#ef4444] -translate-y-1.5 sm:-translate-y-2" />
              </div>
            </button>
            <div className="text-[7px] font-mono text-[#827a6f] mt-0.5 font-semibold">
              <span>SEEK</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MIDDLE ROW: POWER BUTTON | CASSETTE WELL WITH SPINNING GEARS | FM BAND & EJECT */}
        {/* ========================================================================= */}
        <div className="flex items-stretch justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-2.5">
          {/* Left: POWER Button with illuminated orange neon bar */}
          <div className="flex flex-col justify-between w-10 sm:w-14 py-0.5 flex-shrink-0">
            <button
              onClick={handlePowerClick}
              className="flex-1 rounded-lg bg-gradient-to-b from-[#282523] to-[#151413] border border-[#383431] p-1 flex flex-col items-center justify-center shadow-sm active:scale-95 transition-all touch-manipulation"
            >
              {/* Glowing Neon Power Bar */}
              <div
                className={`w-5 sm:w-8 h-1 rounded-full mb-1 transition-all duration-300 ${
                  isPowerOn
                    ? 'bg-[#f97316] shadow-[0_0_8px_#f97316]'
                    : 'bg-[#3b3632] shadow-none'
                }`}
              />
              <span className="text-[7px] sm:text-[8px] font-mono font-bold tracking-wider text-[#b8afa0]">
                POWER
              </span>
            </button>

            {/* Secondary direction button */}
            <div className="h-4 sm:h-5 mt-1 rounded bg-[#161514] border border-white/5 flex items-center justify-center shadow-inner">
              <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[4px] border-b-[#827a6f]" />
            </div>
          </div>

          {/* CENTER: RECESSED 3D CASSETTE TAPE WELL */}
          <div
            className="flex-1 rounded-lg sm:rounded-xl border border-[#12100f] p-1.5 sm:p-2 relative shadow-xl flex flex-col justify-between overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #1c1917 0%, #100f0e 60%, #080706 100%)',
              boxShadow: 'inset 0 3px 8px rgba(0, 0, 0, 0.95)',
            }}
          >
            {/* Top Screws & Tape Header */}
            <div className="flex items-center justify-between text-[7px] sm:text-[8px] font-mono text-[#8a8174] px-0.5 pb-0.5">
              <span>● AUTO REVERSE</span>
              <span className="text-orange-400 font-bold font-kannada truncate max-w-[130px] sm:max-w-none">
                ಕರ್ನಾಟಕ ಸಾರಿಗೆ • KSRTC
              </span>
              <span>C-90 ●</span>
            </div>

            {/* Cassette Shell Window & Dual Rotating White Gear Spools */}
            <div
              className="relative h-11 sm:h-14 rounded-md sm:rounded-lg border border-[#302c29] bg-[#12100f]/90 p-1 sm:p-1.5 flex items-center justify-between shadow-inner overflow-hidden"
            >
              {/* Left Rotating 6-Spoke White Gear Reel */}
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#f8fafc] border border-[#cbd5e1] flex items-center justify-center shadow-sm flex-shrink-0">
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center ${isPlaying && isPowerOn ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '3.5s' }}
                >
                  <div className="w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full bg-[#0f172a] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#f97316]" />
                  </div>
                  {/* Gear teeth notches */}
                  <div className="absolute inset-0 rounded-full border border-dashed border-[#64748b]/40" />
                </div>
              </div>

              {/* Center Cassette Tape Sticker Label */}
              <div className="flex-1 mx-1.5 sm:mx-2.5 h-full rounded bg-[#e8decb] border border-[#3e3831] p-0.5 sm:p-1 flex flex-col justify-between relative shadow-sm overflow-hidden text-slate-950">
                {/* Vintage Tape Red Accent Stripe */}
                <div className="w-full h-0.5 sm:h-1 bg-[#b91c1c] rounded-full" />

                {/* Track Metadata (Kannada & English) */}
                <div className="text-center px-0.5">
                  <span className="font-kannada font-bold text-[9px] sm:text-[10px] text-slate-900 block truncate leading-tight">
                    {currentTrack?.localizedTitle || currentTrack?.title || 'ಕನ್ನಡ ಗಾನ'}
                  </span>
                  <span className="font-mono text-[7px] sm:text-[8px] text-slate-700 block truncate">
                    {currentTrack?.artist || 'KSRTC CLASSICS'}
                  </span>
                </div>

                {/* Side A & 90 Min Stamp */}
                <div className="flex items-center justify-between text-[7px] sm:text-[8px] font-mono font-extrabold text-slate-900 px-0.5 border-t border-slate-400/30 pt-0.5">
                  <span>A</span>
                  <span className="text-[6px] tracking-wider text-slate-600 uppercase font-sans hidden xs:inline">
                    STEREO
                  </span>
                  <span>90</span>
                </div>
              </div>

              {/* Right Rotating 6-Spoke White Gear Reel */}
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#f8fafc] border border-[#cbd5e1] flex items-center justify-center shadow-sm flex-shrink-0">
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center ${isPlaying && isPowerOn ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '3.5s' }}
                >
                  <div className="w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full bg-[#0f172a] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#f97316]" />
                  </div>
                  {/* Gear teeth notches */}
                  <div className="absolute inset-0 rounded-full border border-dashed border-[#64748b]/40" />
                </div>
              </div>

              {/* Moving Magnetic Tape Ribbon across bottom */}
              <div className="absolute bottom-0.5 inset-x-5 sm:inset-x-9 h-0.5 bg-[#3a2010] rounded-full shadow-inner opacity-90" />
            </div>

            {/* Cassette Well Guide Tape Head */}
            <div className="flex items-center justify-center gap-3 text-[6px] font-mono text-[#6e665b] pt-0.5">
              <span>● HEAD 1</span>
              <span>CAPSTAN</span>
              <span>HEAD 2 ●</span>
            </div>
          </div>

          {/* Right: FM/AM/SW Radio Band LEDs & EJECT Button */}
          <div className="flex flex-col justify-between w-10 sm:w-14 py-0.5 flex-shrink-0">
            {/* Radio Band Selection LEDs */}
            <div className="rounded-lg bg-gradient-to-b from-[#201d1c] to-[#141211] border border-[#383431] p-1 flex flex-col gap-1 shadow-inner">
              {(['FM', 'AM', 'SW'] as const).map((band) => {
                const isActive = activeBand === band && isPowerOn;
                return (
                  <button
                    key={band}
                    onClick={() => setActiveBand(band)}
                    className="flex items-center justify-between gap-0.5 text-[7px] sm:text-[8px] font-mono font-bold text-[#a89f91] hover:text-white transition-colors"
                  >
                    <div
                      className={`w-2 h-1 rounded-full transition-all duration-300 ${
                        isActive
                          ? 'bg-[#f97316] shadow-[0_0_6px_#f97316]'
                          : 'bg-[#3b3632]'
                      }`}
                    />
                    <span>{band}</span>
                  </button>
                );
              })}
            </div>

            {/* EJECT Button (Opens Queue / Playlists) */}
            <button
              onClick={() => setQueueOpen(!isQueueOpen)}
              title="Eject / Open Queue"
              className={`h-5 sm:h-7 mt-1 rounded-lg border flex flex-col items-center justify-center transition-all active:scale-95 shadow-sm touch-manipulation ${
                isQueueOpen
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-gradient-to-b from-[#282523] to-[#151413] border-[#383431] text-[#b8afa0] hover:text-white'
              }`}
            >
              <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[4px] border-b-current mb-0.5" />
              <span className="text-[6px] sm:text-[7px] font-mono font-bold tracking-wider">
                EJECT
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM ROW: TACTILE MECHANICAL PIANO KEYS (REW, PLAY, PAUSE, FF, STOP) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-5 gap-1 sm:gap-1.5 pt-0.5">
          {/* 1. REW (Rewind / Previous Track) */}
          <button
            onClick={handleRewClick}
            title="Rewind / Previous Track"
            className="group py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl border border-[#302c29] bg-gradient-to-b from-[#2a2724] via-[#1c1a18] to-[#100f0e] flex flex-col items-center justify-center shadow-md active:translate-y-0.5 transition-all touch-manipulation hover:border-amber-500/30"
          >
            <div className="text-[#a89f91] group-hover:text-white text-[10px] sm:text-xs font-bold font-mono">
              ◄◄
            </div>
            <span className="text-[7px] sm:text-[8px] font-mono font-bold text-[#827a6f] group-hover:text-white mt-0.5">
              REW
            </span>
          </button>

          {/* 2. PLAY */}
          <button
            onClick={handlePlayClick}
            title="Play"
            className={`group py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl border transition-all active:translate-y-0.5 shadow-md flex flex-col items-center justify-center touch-manipulation ${
              isPlaying
                ? 'border-amber-500/60 bg-gradient-to-b from-[#3a2614] via-[#201407] to-[#100903] text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                : 'border-[#302c29] bg-gradient-to-b from-[#2a2724] via-[#1c1a18] to-[#100f0e] text-[#a89f91] hover:text-white'
            }`}
          >
            <div className="text-[10px] sm:text-xs font-bold font-mono">
              ►
            </div>
            <span className="text-[7px] sm:text-[8px] font-mono font-bold mt-0.5">
              PLAY
            </span>
          </button>

          {/* 3. PAUSE (Glowing Amber Neon Text & Icon when Paused) */}
          <button
            onClick={handlePauseClick}
            title="Pause Playback"
            className={`py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl border transition-all active:translate-y-0.5 shadow-lg flex flex-col items-center justify-center touch-manipulation ${
              !isPlaying && currentTrack
                ? 'border-[#f59e0b] bg-gradient-to-b from-[#422509] via-[#241303] to-[#100701] text-[#fbbf24] shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'border-[#302c29] bg-gradient-to-b from-[#2a2724] via-[#1c1a18] to-[#100f0e] text-[#a89f91] hover:text-white'
            }`}
          >
            <div className="text-[10px] sm:text-xs font-bold font-mono">
              ❚❚
            </div>
            <span className={`text-[7px] sm:text-[8px] font-mono font-bold mt-0.5 ${!isPlaying && currentTrack ? 'drop-shadow-[0_0_5px_#fbbf24]' : ''}`}>
              PAUSE
            </span>
          </button>

          {/* 4. FF (Fast Forward / Next Track) */}
          <button
            onClick={handleFFClick}
            title="Fast Forward / Next Track"
            className="group py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl border border-[#302c29] bg-gradient-to-b from-[#2a2724] via-[#1c1a18] to-[#100f0e] flex flex-col items-center justify-center shadow-md active:translate-y-0.5 transition-all touch-manipulation hover:border-amber-500/30"
          >
            <div className="text-[#a89f91] group-hover:text-white text-[10px] sm:text-xs font-bold font-mono">
              ►►
            </div>
            <span className="text-[7px] sm:text-[8px] font-mono font-bold text-[#827a6f] group-hover:text-white mt-0.5">
              FF
            </span>
          </button>

          {/* 5. STOP */}
          <button
            onClick={handleStopClick}
            title="Stop Playback"
            className="group py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl border border-[#302c29] bg-gradient-to-b from-[#2a2724] via-[#1c1a18] to-[#100f0e] flex flex-col items-center justify-center shadow-md active:translate-y-0.5 transition-all touch-manipulation hover:border-amber-500/30"
          >
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#a89f91] group-hover:bg-white rounded-sm my-0.5" />
            <span className="text-[7px] sm:text-[8px] font-mono font-bold text-[#827a6f] group-hover:text-white mt-0.5">
              STOP
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
