'use client';

import { AudioEngine } from '@/services/audio/AudioEngine';

export interface AudioMetrics {
  bass: number;       // 0 to 1 (lower frequencies 20-150Hz)
  lowMid: number;     // 0 to 1 (150-500Hz)
  mid: number;        // 0 to 1 (500-2500Hz)
  high: number;       // 0 to 1 (2500-16000Hz)
  amplitude: number;  // 0 to 1 (overall RMS)
  isPlaying: boolean;
}

export class AudioAnalyzer {
  private smoothedBass = 0;
  private smoothedLowMid = 0;
  private smoothedMid = 0;
  private smoothedHigh = 0;
  private smoothedAmplitude = 0;

  // EMA smoothing factor: higher = smoother, lower = faster reaction
  private readonly smoothingAlpha = 0.84;
  private readonly decayAlpha = 0.92;

  private idlePhase = 0;

  public update(isPlaying: boolean): AudioMetrics {
    this.idlePhase += 0.02;

    if (!isPlaying) {
      // Natural, quiet atmospheric breathing when audio is paused/idle
      const breath = (Math.sin(this.idlePhase * 0.7) + 1) * 0.5;
      const targetBass = 0.08 + breath * 0.06;
      const targetMid = 0.05 + breath * 0.04;
      const targetHigh = 0.03 + breath * 0.03;
      const targetAmp = 0.06 + breath * 0.04;

      this.smoothedBass = this.smoothedBass * this.decayAlpha + targetBass * (1 - this.decayAlpha);
      this.smoothedLowMid = this.smoothedLowMid * this.decayAlpha + targetMid * (1 - this.decayAlpha);
      this.smoothedMid = this.smoothedMid * this.decayAlpha + targetMid * (1 - this.decayAlpha);
      this.smoothedHigh = this.smoothedHigh * this.decayAlpha + targetHigh * (1 - this.decayAlpha);
      this.smoothedAmplitude = this.smoothedAmplitude * this.decayAlpha + targetAmp * (1 - this.decayAlpha);

      return {
        bass: this.smoothedBass,
        lowMid: this.smoothedLowMid,
        mid: this.smoothedMid,
        high: this.smoothedHigh,
        amplitude: this.smoothedAmplitude,
        isPlaying: false,
      };
    }

    const freqData = AudioEngine.getFrequencyData();
    const len = freqData.length;

    let rawBass = 0;
    let rawLowMid = 0;
    let rawMid = 0;
    let rawHigh = 0;
    let totalSum = 0;

    if (len > 0) {
      // Bass: first ~6% of bins
      const bassEnd = Math.max(2, Math.floor(len * 0.08));
      for (let i = 0; i < bassEnd; i++) rawBass += freqData[i];
      rawBass /= (bassEnd * 255);

      // Low Mid: 8% to 22%
      const lowMidEnd = Math.max(bassEnd + 2, Math.floor(len * 0.22));
      for (let i = bassEnd; i < lowMidEnd; i++) rawLowMid += freqData[i];
      rawLowMid /= ((lowMidEnd - bassEnd) * 255);

      // Mid: 22% to 60%
      const midEnd = Math.max(lowMidEnd + 2, Math.floor(len * 0.60));
      for (let i = lowMidEnd; i < midEnd; i++) rawMid += freqData[i];
      rawMid /= ((midEnd - lowMidEnd) * 255);

      // High: 60% to 100%
      for (let i = midEnd; i < len; i++) rawHigh += freqData[i];
      rawHigh /= ((len - midEnd) * 255);

      for (let i = 0; i < len; i++) totalSum += freqData[i];
      totalSum /= (len * 255);
    } else {
      // Fallback synthetic organic rhythm if direct Web Audio stream is not yet active
      const t = this.idlePhase;
      rawBass = 0.25 + 0.3 * Math.sin(t * 1.8);
      rawLowMid = 0.2 + 0.25 * Math.sin(t * 2.4 + 1);
      rawMid = 0.15 + 0.2 * Math.cos(t * 3.1);
      rawHigh = 0.1 + 0.15 * Math.sin(t * 4.2);
      totalSum = (rawBass + rawMid + rawHigh) / 3;
    }

    // Exponential Moving Average (EMA) smoothing for fluid, cinematic motion
    const alpha = (rawBass > this.smoothedBass) ? this.smoothingAlpha : this.decayAlpha;
    this.smoothedBass = this.smoothedBass * alpha + rawBass * (1 - alpha);
    this.smoothedLowMid = this.smoothedLowMid * alpha + rawLowMid * (1 - alpha);
    this.smoothedMid = this.smoothedMid * alpha + rawMid * (1 - alpha);
    this.smoothedHigh = this.smoothedHigh * alpha + rawHigh * (1 - alpha);
    this.smoothedAmplitude = this.smoothedAmplitude * alpha + totalSum * (1 - alpha);

    return {
      bass: Math.min(1, Math.max(0, this.smoothedBass)),
      lowMid: Math.min(1, Math.max(0, this.smoothedLowMid)),
      mid: Math.min(1, Math.max(0, this.smoothedMid)),
      high: Math.min(1, Math.max(0, this.smoothedHigh)),
      amplitude: Math.min(1, Math.max(0, this.smoothedAmplitude)),
      isPlaying: true,
    };
  }

  public reset() {
    this.smoothedBass = 0;
    this.smoothedLowMid = 0;
    this.smoothedMid = 0;
    this.smoothedHigh = 0;
    this.smoothedAmplitude = 0;
  }
}
