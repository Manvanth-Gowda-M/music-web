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

    if (settings.reducedMotion || !settings.visualizerEnabled) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let phase = 0;
    let reelAngle = 0;
    let needleL = 0;
    let needleR = 0;

    // Themed particles (Embers for Temple, Rain droplets for Train, Seafoam for Coast)
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; life: number }[] = [];
    const maxParticles = isCompact ? 18 : 36;
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * (isCompact ? 220 : 480),
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: 0.5 + Math.random() * 1.5,
        size: 1 + Math.random() * 2.5,
        alpha: 0.2 + Math.random() * 0.7,
        life: Math.random(),
      });
    }

    const render = () => {
      if (!canvas || !ctx) return;

      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      // Fetch live audio energy metrics
      const metrics = AudioEngine.getEnergyMetrics();
      const freqData = AudioEngine.getFrequencyData();
      const intensity = settings.visualizerIntensity === 'subtle' ? 0.5 : 0.95;

      const bass = metrics.bass * intensity;
      const mid = metrics.mid * intensity;
      const treble = metrics.treble * intensity;
      const hasAudio = metrics.hasAudio && isPlaying;

      // Update cassette reel spin when playing
      if (hasAudio) {
        reelAngle += 0.08 + bass * 0.06;
      }

      // Smooth VU meter needles with realistic spring physics
      const targetNeedleL = hasAudio ? Math.min(1, bass * 1.1 + mid * 0.3) : 0.05;
      const targetNeedleR = hasAudio ? Math.min(1, mid * 0.9 + treble * 0.5) : 0.05;
      needleL += (targetNeedleL - needleL) * 0.25;
      needleR += (targetNeedleR - needleR) * 0.25;

      // =========================================================================
      // THEME 1: VINTAGE KSRTC BUS (3D Cassette Deck & Bouncing Analog VU Meters)
      // =========================================================================
      if (activeStyle === 'bus' && currentWorld.id === 'ksrtc-bus') {
        const midY = h / 2;

        if (isCompact) {
          // Compact MiniPlayer Version: Dual Spinning Cassette Spools + VU level bars
          const spoolRadius = Math.min(16, h * 0.34);
          const leftSpoolX = width * 0.28;
          const rightSpoolX = width * 0.72;

          // Connecting magnetic tape line
          ctx.strokeStyle = 'rgba(75, 45, 25, 0.85)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(leftSpoolX, midY + spoolRadius * 0.5);
          ctx.lineTo(rightSpoolX, midY + spoolRadius * 0.5);
          ctx.stroke();

          // Draw dual cassette spools (6-spoke gear reels)
          [leftSpoolX, rightSpoolX].forEach((cx, idx) => {
            const rot = idx === 0 ? reelAngle : reelAngle * 1.05;
            
            // Outer white gear ring
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.arc(cx, midY, spoolRadius, 0, Math.PI * 2);
            ctx.fill();

            // Inner dark center
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(cx, midY, spoolRadius * 0.55, 0, Math.PI * 2);
            ctx.fill();

            // 6 Gear spokes
            ctx.strokeStyle = '#f8fafc';
            ctx.lineWidth = 1.5;
            for (let s = 0; s < 6; s++) {
              const ang = rot + (s * Math.PI) / 3;
              ctx.beginPath();
              ctx.moveTo(cx, midY);
              ctx.lineTo(cx + Math.cos(ang) * (spoolRadius * 0.9), midY + Math.sin(ang) * (spoolRadius * 0.9));
              ctx.stroke();
            }

            // Center red bus axle hub
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.arc(cx, midY, 2.5, 0, Math.PI * 2);
            ctx.fill();
          });

          // Center VU Meter LED display
          const ledCount = 8;
          const ledStartX = width * 0.42;
          const ledEndX = width * 0.58;
          const ledSpacing = (ledEndX - ledStartX) / ledCount;
          const activeLeds = Math.round(needleL * ledCount);

          for (let i = 0; i < ledCount; i++) {
            const lx = ledStartX + i * ledSpacing;
            const isLit = i < activeLeds;
            ctx.fillStyle = isLit
              ? i > 6 ? '#ef4444' : i > 4 ? '#f59e0b' : '#22c55e'
              : 'rgba(255, 255, 255, 0.08)';
            ctx.fillRect(lx, midY - 6, ledSpacing * 0.7, 12);
          }
        } else {
          // Full Size Deck: Dual Analog Vintage VU Meters with Bouncing Needles + Cassette Window
          const vuWidth = width * 0.36;
          const vuHeight = h * 0.85;
          const vuY = (h - vuHeight) / 2;

          // Left & Right Analog VU Meters
          [
            { x: width * 0.06, needle: needleL, label: 'L' },
            { x: width * 0.58, needle: needleR, label: 'R' },
          ].forEach(({ x, needle, label }) => {
            // Vintage warm amber backlight meter face
            const grad = ctx.createLinearGradient(x, vuY, x, vuY + vuHeight);
            grad.addColorStop(0, '#2b1e10');
            grad.addColorStop(1, '#150f08');
            ctx.fillStyle = grad;
            ctx.strokeStyle = 'rgba(249, 115, 22, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(x, vuY, vuWidth, vuHeight, [6]);
            ctx.fill();
            ctx.stroke();

            // VU Scale Arc
            const pivotX = x + vuWidth / 2;
            const pivotY = vuY + vuHeight * 1.15;
            const arcRadius = vuHeight * 0.85;

            ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(pivotX, pivotY, arcRadius, -Math.PI * 0.78, -Math.PI * 0.22);
            ctx.stroke();

            // Red Overload Zone
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(pivotX, pivotY, arcRadius, -Math.PI * 0.35, -Math.PI * 0.22);
            ctx.stroke();

            // Label & dB ticks
            ctx.fillStyle = '#fbbf24';
            ctx.font = '8px monospace';
            ctx.fillText(`VU ${label}`, x + 6, vuY + 12);
            ctx.fillStyle = '#ef4444';
            ctx.fillText('+3dB', x + vuWidth - 24, vuY + 12);

            // Bouncing needle
            const needleAngle = -Math.PI * 0.72 + needle * (Math.PI * 0.48);
            const tipX = pivotX + Math.cos(needleAngle) * arcRadius;
            const tipY = pivotY + Math.sin(needleAngle) * arcRadius;

            ctx.strokeStyle = needle > 0.85 ? '#ef4444' : '#f8fafc';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(pivotX, pivotY - 8);
            ctx.lineTo(tipX, tipY);
            ctx.stroke();

            // Needle pivot cap
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(pivotX, pivotY - 8, 3, 0, Math.PI * 2);
            ctx.fill();
          });

          // Center Spinning Tape Spool Preview
          const centerSpoolX = width * 0.50;
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(centerSpoolX, midY, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(centerSpoolX, midY, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // =========================================================================
      // THEME 2: TEMPLE MORNING (Sacred 3D Diya Flame & Resonant Sound Mandala)
      // =========================================================================
      else if (activeStyle === 'temple') {
        const midY = h / 2;
        const centerX = width / 2;

        // 1. Floating Temple Incense Embers
        particles.forEach((p) => {
          p.y -= p.vy * (0.6 + bass * 0.8);
          p.x += p.vx + Math.sin(phase + p.y * 0.05) * 0.5;
          if (p.y < 0) {
            p.y = h;
            p.x = Math.random() * width;
          }
          ctx.fillStyle = `rgba(245, 158, 11, ${p.alpha * (0.4 + mid * 0.6)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (0.8 + bass * 0.6), 0, Math.PI * 2);
          ctx.fill();
        });

        // 2. Concentric Sacred Sound Mandala Rings (Golden Brass)
        const ringCount = isCompact ? 3 : 5;
        for (let r = 1; r <= ringCount; r++) {
          const baseRadius = (r * (h * 0.42)) / ringCount;
          const pulseRadius = baseRadius + Math.sin(phase * 2 + r) * (bass * 8);
          
          ctx.strokeStyle = `rgba(217, 119, 6, ${0.15 + (bass * 0.25) / r})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(centerX, midY, pulseRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Sacred geometric acoustic petals
          const petals = 8 + r * 4;
          for (let p = 0; p < petals; p++) {
            const ang = (p * Math.PI * 2) / petals + phase * (r % 2 === 0 ? 0.3 : -0.3);
            const px = centerX + Math.cos(ang) * pulseRadius;
            const py = midY + Math.sin(ang) * pulseRadius;
            ctx.fillStyle = `rgba(245, 158, 11, ${0.2 + treble * 0.4})`;
            ctx.beginPath();
            ctx.arc(px, py, 1 + bass * 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // 3. Center 3D Sacred Brass Diya Flame (Flickers & Dances with Audio Amplitude)
        const flameHeight = (h * 0.45) * (0.7 + bass * 0.8);
        const flameWidth = flameHeight * 0.55;
        const flameBaseY = midY + flameHeight * 0.35;

        // Brass Diya Base Bowl
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(centerX, flameBaseY + 2, flameWidth * 1.1, 4, 0, 0, Math.PI);
        ctx.fill();

        // Outer Golden Flame Aura
        const flameGlow = ctx.createRadialGradient(centerX, flameBaseY - flameHeight * 0.5, 2, centerX, flameBaseY - flameHeight * 0.5, flameHeight * 1.4);
        flameGlow.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
        flameGlow.addColorStop(0.5, 'rgba(217, 119, 6, 0.2)');
        flameGlow.addColorStop(1, 'rgba(217, 119, 6, 0)');
        ctx.fillStyle = flameGlow;
        ctx.beginPath();
        ctx.arc(centerX, flameBaseY - flameHeight * 0.5, flameHeight * 1.4, 0, Math.PI * 2);
        ctx.fill();

        // Core Dynamic Flame Shape
        const flameTipX = centerX + Math.sin(phase * 4) * (2 + treble * 4);
        const flameTipY = flameBaseY - flameHeight;

        const flameGrad = ctx.createLinearGradient(centerX, flameBaseY, centerX, flameTipY);
        flameGrad.addColorStop(0, '#3b82f6'); // Sacred blue base
        flameGrad.addColorStop(0.2, '#f97316'); // Orange core
        flameGrad.addColorStop(0.7, '#fbbf24'); // Yellow glow
        flameGrad.addColorStop(1, '#ffffff'); // White hot tip

        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(centerX - flameWidth * 0.6, flameBaseY);
        ctx.quadraticCurveTo(centerX - flameWidth * 0.8, flameBaseY - flameHeight * 0.5, flameTipX, flameTipY);
        ctx.quadraticCurveTo(centerX + flameWidth * 0.8, flameBaseY - flameHeight * 0.5, centerX + flameWidth * 0.6, flameBaseY);
        ctx.closePath();
        ctx.fill();
      }

      // =========================================================================
      // THEME 3: RAINY TRAIN (Steam Pressure Gauge & Running Rain Streaks)
      // =========================================================================
      else if (activeStyle === 'rain') {
        const midY = h / 2;

        // 1. Dynamic Raindrop Streaks on Glass (Run down faster on beats)
        particles.forEach((p) => {
          p.y += p.vy * (1.2 + bass * 1.5);
          if (p.y > h) {
            p.y = 0;
            p.x = Math.random() * width;
          }

          // Rain streak with droplet head
          const streakLen = 6 + p.vy * 4 + treble * 8;
          ctx.strokeStyle = 'rgba(147, 197, 253, 0.45)';
          ctx.lineWidth = p.size * 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y + streakLen);
          ctx.stroke();

          // Droplet tip
          ctx.fillStyle = '#bfdbfe';
          ctx.beginPath();
          ctx.arc(p.x, p.y + streakLen, p.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
        });

        // 2. Vintage Steam Train Pressure Gauge Dial (Center/Right)
        const gaugeX = width * 0.5;
        const gaugeRadius = Math.min(22, h * 0.42);

        // Brass Gauge Outer Bezel
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2.5;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.beginPath();
        ctx.arc(gaugeX, midY, gaugeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pressure ticks
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        for (let t = 0; t < 8; t++) {
          const ang = -Math.PI * 0.75 + (t * Math.PI * 1.5) / 7;
          const x1 = gaugeX + Math.cos(ang) * (gaugeRadius - 4);
          const y1 = midY + Math.sin(ang) * (gaugeRadius - 4);
          const x2 = gaugeX + Math.cos(ang) * (gaugeRadius - 1.5);
          const y2 = midY + Math.sin(ang) * (gaugeRadius - 1.5);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        // Bouncing Steam Pressure Needle
        const needleAngle = -Math.PI * 0.75 + (needleL * 0.85 + bass * 0.25) * (Math.PI * 1.5);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(gaugeX, midY);
        ctx.lineTo(gaugeX + Math.cos(needleAngle) * (gaugeRadius - 3), midY + Math.sin(needleAngle) * (gaugeRadius - 3));
        ctx.stroke();

        // Gauge Hub
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(gaugeX, midY, 3, 0, Math.PI * 2);
        ctx.fill();

        // 3. Railway Track Rhythm Bars (Left and Right)
        const barCount = isCompact ? 10 : 20;
        for (let i = 0; i < barCount; i++) {
          if (Math.abs((i * (width / barCount)) - gaugeX) < gaugeRadius + 6) continue;
          const bx = i * (width / barCount) + 2;
          const barH = Math.max(3, (freqData[i * 2] || 15) * (h * 0.35) * intensity / 255);
          ctx.fillStyle = 'rgba(96, 165, 250, 0.45)';
          ctx.roundRect(bx, h - barH - 2, 3, barH, [1.5]);
          ctx.fill();
        }
      }

      // =========================================================================
      // THEME 4: COASTAL MORNING (Arabian Sea Multi-Depth Waves & Bioluminescent Foam)
      // =========================================================================
      else if (activeStyle === 'coast') {
        // 1. Bioluminescent Floating Seafoam Particles
        particles.forEach((p) => {
          p.x += Math.sin(phase + p.y * 0.1) * (0.8 + treble * 1.2);
          p.y -= 0.3 + mid * 0.5;
          if (p.y < 0) p.y = h;
          ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha * (0.5 + treble * 0.5)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (0.7 + treble * 0.8), 0, Math.PI * 2);
          ctx.fill();
        });

        // 2. Multi-Layer Rolling Ocean Swell Curves
        const waveLayers = [
          { color: 'rgba(14, 165, 233, 0.35)', speed: 1.0, amp: h * 0.16, offset: 0.55 },
          { color: 'rgba(56, 189, 248, 0.55)', speed: 1.4, amp: h * 0.22, offset: 0.45 },
          { color: 'rgba(224, 242, 254, 0.75)', speed: 2.0, amp: h * 0.10, offset: 0.35 },
        ];

        waveLayers.forEach(({ color, speed, amp, offset }, lIdx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(0, h);

          for (let x = 0; x <= width; x += 6) {
            const normX = x / width;
            const freqIdx = Math.floor(normX * 16) + lIdx * 4;
            const audioLift = hasAudio ? ((freqData[freqIdx] || 0) / 255) * (h * 0.28) * intensity : (bass * 8);
            const waveY = h * offset + Math.sin(phase * speed + normX * 6 + lIdx * 1.5) * amp - audioLift;
            ctx.lineTo(x, Math.max(4, waveY));
          }

          ctx.lineTo(width, h);
          ctx.closePath();
          ctx.fill();
        });
      }

      phase += 0.035;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, activeStyle, activePalette, settings, isCompact, height, currentWorld.id]);

  return (
    <div className={`relative overflow-hidden pointer-events-none select-none ${className}`} style={{ height }}>
      <canvas
        ref={canvasRef}
        width={isCompact ? 220 : 480}
        height={height}
        className="w-full h-full block"
        aria-hidden="true"
      />
    </div>
  );
};

