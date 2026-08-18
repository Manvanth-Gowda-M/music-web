'use client';

import { VisualizerThemeConfig, THEME_VISUALIZERS } from './visualizerTokens';
import { AudioMetrics } from './AudioAnalyzer';
import { WorldId, VisualizerDesign } from '@/types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
}

function withAlpha(rgbaStr: string, alpha: number): string {
  return rgbaStr.replace(/[\d.]+\s*\)$/, `${Math.max(0, Math.min(1, alpha)).toFixed(3)})`);
}

export class VisualizerRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private currentTheme: VisualizerThemeConfig;
  private targetTheme: VisualizerThemeConfig;
  private themeTransition = 1; // 1 = fully transitioned

  private particles: Particle[] = [];
  private phase = 0;
  private width = 0;
  private height = 0;
  private dpr = 1;

  constructor(canvas: HTMLCanvasElement, initialWorldId: WorldId = 'ksrtc-bus') {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) throw new Error('Could not create Canvas 2D context');
    this.ctx = context;

    this.currentTheme = THEME_VISUALIZERS[initialWorldId] || THEME_VISUALIZERS['ksrtc-bus'];
    this.targetTheme = this.currentTheme;

    this.initParticles();
    this.resize();
  }

  public setWorld(worldId: WorldId) {
    const nextTheme = THEME_VISUALIZERS[worldId] || THEME_VISUALIZERS['ksrtc-bus'];
    if (nextTheme.id !== this.targetTheme.id) {
      this.targetTheme = nextTheme;
      this.themeTransition = 0;
    }
  }

  public resize() {
    if (typeof window === 'undefined') return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap DPR at 2 for performance
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(this.dpr, this.dpr);
  }

  private initParticles() {
    this.particles = [];
    const count = 35;
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  private createParticle(initial = false): Particle {
    const isMobile = this.width < 768;
    const edge = Math.random(); // 0 = bottom, 1 = left, 2 = right, 3 = top
    let x = 0;
    let y = 0;

    if (edge < 0.45) {
      // Bottom edge
      x = Math.random() * this.width;
      y = this.height - (Math.random() * (isMobile ? 22 : 44));
    } else if (edge < 0.7) {
      // Left edge
      x = Math.random() * (isMobile ? 18 : 36);
      y = Math.random() * this.height;
    } else if (edge < 0.9) {
      // Right edge
      x = this.width - (Math.random() * (isMobile ? 18 : 36));
      y = Math.random() * this.height;
    } else {
      // Top edge
      x = Math.random() * this.width;
      y = Math.random() * (isMobile ? 14 : 28);
    }

    const maxLife = 120 + Math.random() * 180;
    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.2 - Math.random() * 0.4,
      size: 1.0 + Math.random() * 2.2,
      alpha: initial ? Math.random() * 0.5 : 0,
      maxAlpha: 0.35 + Math.random() * 0.45,
      life: initial ? Math.random() * maxLife : 0,
      maxLife,
    };
  }

  public render(
    metrics: AudioMetrics,
    intensityMode: 'subtle' | 'balanced' | 'immersive' = 'subtle',
    design: VisualizerDesign = 'fluid-liquid',
    reducedMotion = false
  ) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    if (w === 0 || h === 0) return;

    ctx.clearRect(0, 0, w, h);

    // Smooth theme transition step
    if (this.themeTransition < 1) {
      this.themeTransition = Math.min(1, this.themeTransition + 0.035);
      if (this.themeTransition === 1) {
        this.currentTheme = this.targetTheme;
      }
    }

    const theme = this.targetTheme;
    const multiplier = theme.intensityMultipliers[intensityMode] || 0.85;
    const isMobile = w < 768;
    const isTablet = w >= 768 && w < 1024;

    this.phase += reducedMotion ? 0.005 : (0.022 + metrics.bass * 0.035);

    // =========================================================================
    // 1. SOFT PERIMETER AMBIENT LIGHT FIELD (BASE GLOW)
    // =========================================================================
    const ambientOpacity = Math.min(0.40, (0.06 + metrics.amplitude * 0.16 + metrics.bass * 0.12) * multiplier);

    // Bottom Ambient Light Field
    const bottomGlowHeight = isMobile ? 44 : isTablet ? 68 : 96;
    const bottomGrad = ctx.createLinearGradient(0, h, 0, h - bottomGlowHeight);
    bottomGrad.addColorStop(0, withAlpha(theme.palette.glow, ambientOpacity));
    bottomGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(0, h - bottomGlowHeight, w, bottomGlowHeight);

    // Left & Right Ambient Light Field
    const sideGlowWidth = isMobile ? 26 : 52;
    const leftGrad = ctx.createLinearGradient(0, 0, sideGlowWidth, 0);
    leftGrad.addColorStop(0, withAlpha(theme.palette.glow, ambientOpacity * 0.8));
    leftGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = leftGrad;
    ctx.fillRect(0, 0, sideGlowWidth, h);

    const rightGrad = ctx.createLinearGradient(w, 0, w - sideGlowWidth, 0);
    rightGrad.addColorStop(0, withAlpha(theme.palette.glow, ambientOpacity * 0.8));
    rightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = rightGrad;
    ctx.fillRect(w - sideGlowWidth, 0, sideGlowWidth, h);

    // Top Ambient Light Field
    const topGlowHeight = isMobile ? 20 : 40;
    const topGrad = ctx.createLinearGradient(0, 0, 0, topGlowHeight);
    topGrad.addColorStop(0, withAlpha(theme.palette.glow, ambientOpacity * 0.65));
    topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, w, topGlowHeight);

    if (reducedMotion) return;

    // =========================================================================
    // 2. DESIGN DISPATCHER
    // =========================================================================
    switch (design) {
      case 'fluid-liquid':
        this.renderFluidLiquid(metrics, multiplier, isMobile, theme);
        break;
      case 'minimal-pulse':
        this.renderMinimalPulse(metrics, multiplier, isMobile, theme);
        break;
      case 'perimeter-bars':
        this.renderPerimeterBars(metrics, multiplier, isMobile, theme);
        break;
      case 'aurora-ribbon':
        this.renderAuroraRibbon(metrics, multiplier, isMobile, theme);
        break;
      case 'particle-shimmer':
        this.renderParticleShimmer(metrics, multiplier, isMobile, theme);
        break;
      default:
        this.renderFluidLiquid(metrics, multiplier, isMobile, theme);
    }
  }

  // ===========================================================================
  // DESIGN 1: FLUID LIQUID EDGE (Reference Image #2 - Muviz Edge Multi-layer Wave)
  // Continuous flowing liquid wave wrapping around the 4 borders of the screen
  // ===========================================================================
  private renderFluidLiquid(metrics: AudioMetrics, multiplier: number, isMobile: boolean, theme: VisualizerThemeConfig) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Layer A: Bottom Fluid Liquid Wave
    const baseBottomDepth = isMobile ? 8 : 18;
    const bassSwell = metrics.bass * theme.edgeBehavior.bottomWaveAmplitude * multiplier * 1.3;
    const waveFreq = theme.edgeBehavior.bottomWaveFrequency;
    const segments = isMobile ? 12 : 24;
    const stepX = w / segments;

    // Outer Liquid Body
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h - baseBottomDepth);

    for (let i = 0; i <= segments; i++) {
      const x = i * stepX;
      const harmonic1 = Math.sin(this.phase * waveFreq + (i / segments) * Math.PI * 2.5);
      const harmonic2 = Math.cos(this.phase * 1.4 + (i / segments) * Math.PI * 4) * 0.4;
      const waveY = h - baseBottomDepth - (harmonic1 + harmonic2) * bassSwell;

      if (i === 0) ctx.lineTo(x, waveY);
      else {
        const prevX = (i - 1) * stepX;
        ctx.quadraticCurveTo((prevX + x) / 2, waveY, x, waveY);
      }
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = withAlpha(theme.palette.primary, 0.12 + metrics.bass * 0.22 * multiplier);
    ctx.fill();

    // Primary Crest Liquid Line
    ctx.strokeStyle = withAlpha(theme.palette.primary, 0.55 + metrics.bass * 0.40 * multiplier);
    ctx.lineWidth = isMobile ? 1.5 : 2.2;
    ctx.stroke();

    // Secondary Harmonic Liquid Wave Layer
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let i = 0; i <= segments; i++) {
      const x = i * stepX;
      const harmonic = Math.sin(this.phase * 1.8 + (i / segments) * Math.PI * 3.5 + 1.2);
      const waveY = h - (baseBottomDepth * 0.7) - harmonic * (bassSwell * 0.65);
      if (i === 0) ctx.lineTo(x, waveY);
      else ctx.lineTo(x, waveY);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = withAlpha(theme.palette.secondary, 0.08 + metrics.bass * 0.15 * multiplier);
    ctx.fill();
    ctx.strokeStyle = withAlpha(theme.palette.secondary, 0.40 + metrics.bass * 0.35 * multiplier);
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // Layer B: Left & Right Flowing Fluid Wave Borders
    const sideDepth = isMobile ? 6 : 14;
    const midWave = metrics.mid * theme.edgeBehavior.sideWaveAmplitude * multiplier * 1.2;
    const sideSegments = isMobile ? 10 : 20;
    const stepY = h / sideSegments;

    // Left Fluid Edge
    ctx.beginPath();
    for (let i = 0; i <= sideSegments; i++) {
      const y = i * stepY;
      const osc = Math.sin(this.phase * 2.0 + (i / sideSegments) * Math.PI * 3.5);
      const osc2 = Math.cos(this.phase * 1.2 + (i / sideSegments) * Math.PI * 6.0) * 0.3;
      const waveX = sideDepth + (osc + osc2) * midWave;
      if (i === 0) ctx.moveTo(waveX, y);
      else ctx.lineTo(waveX, y);
    }
    ctx.strokeStyle = withAlpha(theme.palette.primary, 0.45 + metrics.mid * 0.45 * multiplier);
    ctx.lineWidth = isMobile ? 1.2 : 1.8;
    ctx.stroke();

    // Right Fluid Edge
    ctx.beginPath();
    for (let i = 0; i <= sideSegments; i++) {
      const y = i * stepY;
      const osc = Math.cos(this.phase * 1.9 + (i / sideSegments) * Math.PI * 3.5);
      const osc2 = Math.sin(this.phase * 1.3 + (i / sideSegments) * Math.PI * 6.0) * 0.3;
      const waveX = w - sideDepth - (osc + osc2) * midWave;
      if (i === 0) ctx.moveTo(waveX, y);
      else ctx.lineTo(waveX, y);
    }
    ctx.strokeStyle = withAlpha(theme.palette.primary, 0.45 + metrics.mid * 0.45 * multiplier);
    ctx.lineWidth = isMobile ? 1.2 : 1.8;
    ctx.stroke();

    // Layer C: Top Fluid Wave Line
    const topDepth = isMobile ? 4 : 9;
    const highShimmer = metrics.high * 6 * multiplier;
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) {
      const x = (i / 16) * w;
      const shimmerY = topDepth + Math.sin(this.phase * 3.0 + i * 0.8) * highShimmer;
      if (i === 0) ctx.moveTo(x, shimmerY);
      else ctx.lineTo(x, shimmerY);
    }
    ctx.strokeStyle = withAlpha(theme.palette.secondary, 0.35 + metrics.high * 0.40 * multiplier);
    ctx.lineWidth = isMobile ? 0.9 : 1.3;
    ctx.stroke();

    this.renderFloatingParticles(metrics, multiplier, isMobile, theme);
  }

  // ===========================================================================
  // DESIGN 2: MINIMALIST PULSE (Reference Image #1 - Always-on Display Minimal Wave)
  // Clean, razor-sharp glowing edge boundary that expands/contracts softly
  // ===========================================================================
  private renderMinimalPulse(metrics: AudioMetrics, multiplier: number, isMobile: boolean, theme: VisualizerThemeConfig) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Center-Side Minimalist Acoustic Curved Nodes (Exact Match to Image 1)
    const midHeight = h * 0.5;
    const nodeLength = h * 0.4;
    const leftExpansion = metrics.mid * 24 * multiplier;
    const rightExpansion = metrics.mid * 24 * multiplier;

    // Left Acoustic Swell
    ctx.beginPath();
    ctx.moveTo(2, midHeight - nodeLength / 2);
    ctx.quadraticCurveTo(2 + leftExpansion, midHeight, 2, midHeight + nodeLength / 2);
    ctx.strokeStyle = withAlpha(theme.palette.primary, 0.65 + metrics.mid * 0.35 * multiplier);
    ctx.lineWidth = isMobile ? 1.8 : 2.5;
    ctx.shadowBlur = 12;
    ctx.shadowColor = theme.palette.primary;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Right Acoustic Swell
    ctx.beginPath();
    ctx.moveTo(w - 2, midHeight - nodeLength / 2);
    ctx.quadraticCurveTo(w - 2 - rightExpansion, midHeight, w - 2, midHeight + nodeLength / 2);
    ctx.strokeStyle = withAlpha(theme.palette.primary, 0.65 + metrics.mid * 0.35 * multiplier);
    ctx.lineWidth = isMobile ? 1.8 : 2.5;
    ctx.shadowBlur = 12;
    ctx.shadowColor = theme.palette.primary;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Bottom Razor Horizon Line
    const bottomRise = metrics.bass * 14 * multiplier;
    ctx.beginPath();
    ctx.moveTo(w * 0.15, h - 3 - bottomRise);
    ctx.lineTo(w * 0.85, h - 3 - bottomRise);
    ctx.strokeStyle = withAlpha(theme.palette.secondary, 0.55 + metrics.bass * 0.45 * multiplier);
    ctx.lineWidth = isMobile ? 1.2 : 1.8;
    ctx.stroke();
  }

  // ===========================================================================
  // DESIGN 3: PERIMETER SPECTRUM BARS
  // Discrete glowing equalizer bars protruding inward along screen edges
  // ===========================================================================
  private renderPerimeterBars(metrics: AudioMetrics, multiplier: number, isMobile: boolean, theme: VisualizerThemeConfig) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Bottom Spectrum Bar Array
    const barCount = isMobile ? 24 : 48;
    const barWidth = (w / barCount) * 0.65;
    const spacing = w / barCount;
    const maxBarHeight = isMobile ? 22 : 42;

    for (let i = 0; i < barCount; i++) {
      const x = i * spacing + (spacing - barWidth) / 2;
      const normalizedFreq = Math.sin((i / barCount) * Math.PI);
      const dynamicHeight = Math.max(3, (normalizedFreq * metrics.bass + Math.sin(this.phase * 2.5 + i * 0.5) * 0.3 * metrics.mid) * maxBarHeight * multiplier);

      // Bar Body
      ctx.fillStyle = withAlpha(theme.palette.primary, 0.45 + (dynamicHeight / maxBarHeight) * 0.45 * multiplier);
      ctx.fillRect(x, h - dynamicHeight, barWidth, dynamicHeight);

      // Glowing Peak Cap
      ctx.fillStyle = withAlpha(theme.palette.secondary, 0.85);
      ctx.fillRect(x, h - dynamicHeight - 2, barWidth, 1.5);
    }
  }

  // ===========================================================================
  // DESIGN 4: AURORA GLOW RIBBON
  // Dual intersecting luminous chromatic ribbons tracing the perimeter
  // ===========================================================================
  private renderAuroraRibbon(metrics: AudioMetrics, multiplier: number, isMobile: boolean, theme: VisualizerThemeConfig) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    const bottomDepth = isMobile ? 10 : 20;
    const waveAmp = metrics.bass * 20 * multiplier;
    const segments = 20;

    // Ribbon A (Primary Color)
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * w;
      const y = h - bottomDepth - Math.sin(this.phase * 2.2 + (i / segments) * Math.PI * 3) * waveAmp;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = withAlpha(theme.palette.primary, 0.65 + metrics.bass * 0.35 * multiplier);
    ctx.lineWidth = isMobile ? 2.0 : 3.0;
    ctx.stroke();

    // Ribbon B (Secondary Harmonic Intersecting Color)
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * w;
      const y = h - bottomDepth - Math.cos(this.phase * 1.7 + (i / segments) * Math.PI * 3 + 0.8) * (waveAmp * 0.85);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = withAlpha(theme.palette.secondary, 0.55 + metrics.mid * 0.40 * multiplier);
    ctx.lineWidth = isMobile ? 1.5 : 2.2;
    ctx.stroke();
  }

  // ===========================================================================
  // DESIGN 5: PARTICLE SHIMMER CONSTELLATION
  // Dense luminous floating particles along perimeter border with laser filaments
  // ===========================================================================
  private renderParticleShimmer(metrics: AudioMetrics, multiplier: number, isMobile: boolean, theme: VisualizerThemeConfig) {
    const ctx = this.ctx;
    const w = this.width;
    const count = this.particles.length;

    // Draw connecting laser filaments between nearby edge particles
    ctx.lineWidth = 0.5;
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (dist < (isMobile ? 55 : 90)) {
          const lineAlpha = (1 - dist / (isMobile ? 55 : 90)) * 0.35 * multiplier * (0.3 + metrics.mid * 0.7);
          ctx.strokeStyle = withAlpha(theme.palette.primary, lineAlpha);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    this.renderFloatingParticles(metrics, multiplier * 1.4, isMobile, theme);
  }

  private renderFloatingParticles(metrics: AudioMetrics, multiplier: number, isMobile: boolean, theme: VisualizerThemeConfig) {
    const ctx = this.ctx;
    const activeParticleCount = isMobile ? Math.floor(theme.particles.count * 0.6) : theme.particles.count;
    ctx.fillStyle = theme.palette.particles;

    for (let i = 0; i < activeParticleCount; i++) {
      let p = this.particles[i];
      if (!p) {
        p = this.createParticle();
        this.particles[i] = p;
      }

      p.life++;
      if (p.life >= p.maxLife) {
        this.particles[i] = this.createParticle();
        continue;
      }

      const progress = p.life / p.maxLife;
      const alphaFactor = progress < 0.3 ? progress / 0.3 : (1 - progress) / 0.7;
      const currentAlpha = p.maxAlpha * alphaFactor * multiplier * (0.5 + metrics.amplitude * 0.5);

      if (theme.particles.style === 'rain-slide') {
        p.y += 0.8 + metrics.high * 0.8;
        p.x += Math.sin(p.life * 0.05) * 0.15;
      } else {
        p.x += p.vx * (1 + metrics.mid * 0.5);
        p.y += p.vy * (1 + metrics.bass * 0.6);
      }

      ctx.globalAlpha = Math.max(0, Math.min(1, currentAlpha));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }
}
