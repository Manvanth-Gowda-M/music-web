'use client';

import React, { useEffect, useRef } from 'react';
import { VisualizerStyle, WorldPalette } from '@/types';
import { AudioEngine } from '@/services/audio/AudioEngine';
import { useWorldStore } from '@/store/worldStore';
import { usePlayerStore } from '@/store/playerStore';

interface AudioVisualizerProps {
  style?: VisualizerStyle;
  palette?: WorldPalette;
  height?: number;
  className?: string;
  isCompact?: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  style,
  palette,
  height = 48,
  className = '',
  isCompact = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const { currentWorld, settings } = useWorldStore();
  const { isPlaying } = usePlayerStore();

  const activeStyle = style || currentWorld.visualizerStyle;
  const activePalette = palette || currentWorld.palette;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (settings.reducedMotion || settings.visualizerIntensity === 'off') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let phase = 0;
    // Particles for temple embers and rain streaks
    const particles: { x: number; y: number; speed: number; size: number; alpha: number }[] = [];
    const maxParticles = isCompact ? 16 : 32;
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * (isCompact ? 180 : 420),
        y: Math.random() * height,
        speed: 0.5 + Math.random() * 1.5,
        size: 1 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.6,
      });
    }

    const render = () => {
      if (!canvas || !ctx) return;

      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      const freqData = AudioEngine.getFrequencyData();
      const timeData = AudioEngine.getTimeDomainData();
      const hasAudio = isPlaying && freqData && freqData.length > 0;
      const intensityScale = settings.visualizerIntensity === 'subtle' ? 0.45 : 0.85;

      // Calculate bass, mid, and treble energy
      let bass = 0;
      let mid = 0;
      let treble = 0;
      if (hasAudio) {
        for (let i = 0; i < 8; i++) bass += freqData[i] || 0;
        for (let i = 8; i < 24; i++) mid += freqData[i] || 0;
        for (let i = 24; i < 48; i++) treble += freqData[i] || 0;
        bass = (bass / 8) / 255;
        mid = (mid / 16) / 255;
        treble = (treble / 24) / 255;
      } else {
        bass = 0.15 + Math.sin(phase * 1.2) * 0.08;
        mid = 0.12 + Math.sin(phase * 1.5) * 0.05;
        treble = 0.08 + Math.sin(phase * 2) * 0.04;
      }

      // ==========================================
      // THEME 1: RAINY TRAIN (Rain Drops & Rivulets)
      // ==========================================
      if (activeStyle === 'rain') {
        const streamCount = isCompact ? 18 : 36;
        const spacing = width / streamCount;

        // Falling raindrops modulated by frequency
        for (let i = 0; i < streamCount; i++) {
          const index = Math.floor((i / streamCount) * 40);
          const raw = hasAudio ? ((freqData[index] || 0) / 255) : (0.1 + Math.sin(phase * 2 + i * 0.5) * 0.08);
          const dropHeight = Math.max(4, raw * h * 0.85 * intensityScale);
          const x = i * spacing + spacing / 2;
          const y = h - dropHeight;

          // Vertical rain streak gradient
          const grad = ctx.createLinearGradient(x, y, x, h);
          grad.addColorStop(0, '#93c5fd'); // Cool water blue tip
          grad.addColorStop(0.4, 'rgba(96, 165, 250, 0.4)');
          grad.addColorStop(1, 'rgba(96, 165, 250, 0.05)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x - 1.5, y, 3, dropHeight, [1.5, 1.5, 0, 0]);
          ctx.fill();

          // Warm amber droplet glow on high frequencies (train window reflection)
          if (raw > 0.45) {
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(x, y - 2, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Ambient mist line at bottom
        ctx.fillStyle = 'rgba(96, 165, 250, 0.12)';
        ctx.fillRect(0, h - 2, width, 2);
      }

      // ==========================================
      // THEME 2: TEMPLE MORNING (Sacred Harmonic Aura & Diya Embers)
      // ==========================================
      else if (activeStyle === 'temple') {
        const midY = h / 2;

        // Sacred floating embers (diya spark & dhoop smoke)
        particles.forEach((p) => {
          p.y -= p.speed * (0.4 + bass * 0.8);
          if (p.y < 0) {
            p.y = h;
            p.x = Math.random() * width;
          }
          ctx.fillStyle = `rgba(245, 158, 11, ${p.alpha * (0.3 + mid * 0.7)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (0.8 + bass * 0.5), 0, Math.PI * 2);
          ctx.fill();
        });

        // Harmonic dual resonance waves (Brass & Sandalwood)
        for (let wave = 0; wave < 2; wave++) {
          ctx.beginPath();
          ctx.lineWidth = wave === 0 ? 2.5 : 1.5;
          ctx.strokeStyle = wave === 0 ? '#f59e0b' : 'rgba(217, 119, 6, 0.5)';
          ctx.lineCap = 'round';

          const segments = isCompact ? 30 : 60;
          const step = width / segments;

          for (let i = 0; i <= segments; i++) {
            const norm = i / segments;
            const index = Math.floor(norm * 32);
            const audioAmp = hasAudio ? (timeData[index] - 128) / 128 : Math.sin(phase + i * 0.2) * 0.2;
            const breathing = Math.sin(phase * 0.8 + norm * Math.PI * 2 + wave * Math.PI) * (h * 0.22);
            const y = midY + breathing + audioAmp * (h * 0.35 * intensityScale);

            if (i === 0) ctx.moveTo(0, y);
            else {
              const prevX = (i - 1) * step;
              const curX = i * step;
              ctx.quadraticCurveTo(prevX, midY, (prevX + curX) / 2, y);
            }
          }
          ctx.stroke();
        }

        // Center sacred glow
        const glowGrad = ctx.createRadialGradient(width / 2, midY, 2, width / 2, midY, width * 0.4);
        glowGrad.addColorStop(0, `rgba(245, 158, 11, ${0.15 + bass * 0.25})`);
        glowGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, width, h);
      }

      // ==========================================
      // THEME 3: COASTAL MORNING (Arabian Sea Ocean Tides & Foam)
      // ==========================================
      else if (activeStyle === 'coast') {
        const layers = 3;
        const colors = [
          'rgba(56, 189, 248, 0.65)',  // Azure tide
          'rgba(14, 165, 233, 0.40)',  // Deep sea
          'rgba(241, 245, 249, 0.25)',  // Foam crest
        ];

        for (let l = 0; l < layers; l++) {
          ctx.beginPath();
          ctx.fillStyle = colors[l];
          const baseOffset = h * (0.45 + l * 0.15);

          ctx.moveTo(0, h);
          for (let x = 0; x <= width; x += 4) {
            const normX = x / width;
            const freqIdx = Math.floor(normX * 24);
            const audioFactor = hasAudio ? (freqData[freqIdx] / 255) : 0.2;
            
            // Layered oceanic wave sine equations
            const wave1 = Math.sin(phase * 0.9 + normX * 4 + l * 1.2) * (h * 0.18);
            const wave2 = Math.cos(phase * 0.5 + normX * 8 + l * 0.8) * (h * 0.08);
            const audioLift = audioFactor * (h * 0.25 * intensityScale);
            const y = Math.min(h, Math.max(4, baseOffset + wave1 + wave2 - audioLift));

            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, h);
          ctx.closePath();
          ctx.fill();
        }
      }

      // ==========================================
      // THEME 4: RAINY KSRTC (Night Highway Wiper Sweep & Amber Beams)
      // ==========================================
      else if (activeStyle === 'bus') {
        const midY = h / 2;
        const barCount = isCompact ? 16 : 30;
        const barWidth = (width / barCount) * 0.6;
        const gap = (width / barCount);

        // Windshield wiper sweep angle
        const wiperProgress = (Math.sin(phase * 0.8) + 1) / 2; // 0 to 1
        const wiperX = wiperProgress * width;

        // Rhythmic speedo / headlight bars
        for (let i = 0; i < barCount; i++) {
          const x = i * gap + gap * 0.2;
          const idx = Math.floor((i / barCount) * 32);
          const raw = hasAudio ? ((freqData[idx] || 0) / 255) : (0.15 + Math.sin(phase * 1.4 + i * 0.4) * 0.1);
          const barH = Math.max(3, raw * (h * 0.42) * intensityScale);

          // Wiper proximity highlight
          const distToWiper = Math.abs(x - wiperX);
          const isNearWiper = distToWiper < 40;

          ctx.fillStyle = isNearWiper
            ? '#fbbf24' // Bright amber beam
            : 'rgba(217, 119, 6, 0.45)'; // Amber dashboard

          ctx.beginPath();
          ctx.roundRect(x, midY - barH, barWidth, barH * 2, [2]);
          ctx.fill();
        }

        // Wiper arc line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(wiperX, 0);
        ctx.lineTo(wiperX, h);
        ctx.stroke();
      }

      phase += 0.032;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, activeStyle, activePalette, settings, isCompact, height]);

  return (
    <div className={`relative overflow-hidden pointer-events-none ${className}`} style={{ height }}>
      <canvas
        ref={canvasRef}
        width={isCompact ? 180 : 420}
        height={height}
        className="w-full h-full block"
        aria-hidden="true"
      />
    </div>
  );
};

