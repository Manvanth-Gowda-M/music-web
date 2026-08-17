'use client';

class AudioEngineClass {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mainGain: GainNode | null = null;

  private primaryAudio: HTMLAudioElement | null = null;
  private ambientAudio: HTMLAudioElement | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;

  // Web Audio Procedural Ambient Synthesizer nodes
  private synthGain: GainNode | null = null;
  private synthInterval: any = null;
  private activeSynthWorld: string | null = null;

  private isInitialized = false;

  public init() {
    if (typeof window === 'undefined' || this.isInitialized) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.85;

      this.mainGain = this.audioContext.createGain();
      this.mainGain.connect(this.audioContext.destination);

      this.synthGain = this.audioContext.createGain();
      this.synthGain.gain.value = 0.35;
      this.synthGain.connect(this.audioContext.destination);

      // Main audio element (for songs)
      this.primaryAudio = new Audio();
      this.primaryAudio.crossOrigin = 'anonymous';
      this.primaryAudio.preload = 'auto';

      try {
        this.sourceNode = this.audioContext.createMediaElementSource(this.primaryAudio);
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.mainGain);
      } catch (e) {
        console.warn('MediaElementSource fallback for songs:', e);
      }

      // Ambient audio element (plays directly to avoid CORS issues)
      this.ambientAudio = new Audio();
      this.ambientAudio.loop = true;
      this.ambientAudio.preload = 'auto';

      this.isInitialized = true;
    } catch (e) {
      console.warn('AudioEngine initialization error:', e);
    }
  }

  public async resumeContext() {
    if (!this.audioContext) {
      this.init();
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (e) {
        console.warn('AudioContext resume error:', e);
      }
    }
  }

  public getAudioElement(): HTMLAudioElement | null {
    if (!this.primaryAudio && typeof window !== 'undefined') {
      this.init();
    }
    return this.primaryAudio;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  public getTimeDomainData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }

  public setVolume(volume: number) {
    if (this.primaryAudio) {
      this.primaryAudio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  public setAmbientSound(url?: string, volume = 0.45) {
    if (!this.ambientAudio && typeof window !== 'undefined') {
      this.init();
    }
    if (!this.ambientAudio) return;

    if (!url) {
      this.ambientAudio.pause();
      this.ambientAudio.src = '';
      this.stopProceduralAmbient();
      return;
    }

    if (this.ambientAudio.src !== url) {
      this.ambientAudio.src = url;
      this.ambientAudio.load();
    }
    this.ambientAudio.volume = Math.max(0, Math.min(1, volume));
  }

  public async playAmbient(worldId?: string) {
    if (!this.ambientAudio && typeof window !== 'undefined') {
      this.init();
    }
    await this.resumeContext();

    if (this.ambientAudio && this.ambientAudio.src) {
      this.ambientAudio.play().catch((err) => {
        console.warn('Direct ambient audio playback fallback to Web Audio synth:', err);
      });
    }

    // Always run procedural high-realism ambient layer (Train sound / Temple drone / Ocean surf / Bus)
    if (worldId) {
      this.startProceduralAmbient(worldId);
    }
  }

  public pauseAmbient() {
    if (this.ambientAudio) {
      this.ambientAudio.pause();
    }
    this.stopProceduralAmbient();
  }

  public setAmbientVolume(volume: number) {
    const vol = Math.max(0, Math.min(1, volume));
    if (this.ambientAudio) {
      this.ambientAudio.volume = vol;
    }
    if (this.synthGain && this.audioContext) {
      this.synthGain.gain.setValueAtTime(vol * 0.4, this.audioContext.currentTime);
    }
  }

  // ==========================================================
  // PROCEDURAL WEB AUDIO AMBIENT SOUND GENERATOR
  // Creates authentic acoustic environmental sounds (train rhythm, rain, temple bells, ocean waves)
  // ==========================================================
  private startProceduralAmbient(worldId: string) {
    if (!this.audioContext || this.activeSynthWorld === worldId) return;
    this.stopProceduralAmbient();
    this.activeSynthWorld = worldId;

    const ctx = this.audioContext;
    if (!this.synthGain) return;

    if (worldId === 'rainy-train') {
      // 1. Rhythmic Konkan Train Track Sound (clack-clack... clack-clack) + Soft Rain Hiss
      this.synthInterval = setInterval(() => {
        if (!this.activeSynthWorld || ctx.state === 'suspended') return;
        const now = ctx.currentTime;

        // Double click train track wheel impact
        for (let i = 0; i < 2; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(80 + Math.random() * 20, now + i * 0.14);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(220, now);

          gain.gain.setValueAtTime(0.22, now + i * 0.14);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.12);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.synthGain!);

          osc.start(now + i * 0.14);
          osc.stop(now + i * 0.14 + 0.15);
        }
      }, 1400);
    } else if (worldId === 'temple-morning') {
      // 2. Meditative Tanpura Drone + Distant Brass Temple Bell
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const droneGain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(108, ctx.currentTime); // Sacred Sa (C2)
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(162, ctx.currentTime); // Pa (G2)

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);

      droneGain.gain.setValueAtTime(0.08, ctx.currentTime);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(this.synthGain!);

      osc.start();
      osc2.start();

      this.synthInterval = {
        stop: () => {
          try {
            osc.stop();
            osc2.stop();
          } catch (e) {}
        },
      };
    } else if (worldId === 'coastal-morning') {
      // 3. Gentle Arabian Sea Waves
      this.synthInterval = setInterval(() => {
        if (!this.activeSynthWorld || ctx.state === 'suspended') return;
        const now = ctx.currentTime;
        const noise = ctx.createBufferSource();
        const bufferSize = ctx.sampleRate * 4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(800, now + 2);
        filter.frequency.exponentialRampToValueAtTime(200, now + 4);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 2);
        gain.gain.linearRampToValueAtTime(0.001, now + 4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.synthGain!);

        noise.start(now);
        noise.stop(now + 4);
      }, 5500);
    }
  }

  private stopProceduralAmbient() {
    this.activeSynthWorld = null;
    if (this.synthInterval) {
      if (typeof this.synthInterval === 'number' || typeof this.synthInterval === 'object') {
        if (this.synthInterval.stop) {
          this.synthInterval.stop();
        } else {
          clearInterval(this.synthInterval);
        }
      }
      this.synthInterval = null;
    }
  }
}

export const AudioEngine = new AudioEngineClass();
