import { WorldId } from '@/types';

export interface VisualizerThemeConfig {
  id: WorldId;
  name: string;
  palette: {
    primary: string;       // Main edge reactive line color
    secondary: string;     // Secondary harmonic wave color
    glow: string;          // Soft ambient edge haze
    particles: string;     // Micro-particle / droplet tint
  };
  intensityMultipliers: {
    subtle: number;
    balanced: number;
    immersive: number;
  };
  edgeBehavior: {
    bottomWaveAmplitude: number;
    bottomWaveFrequency: number;
    sideWaveAmplitude: number;
    topShimmerIntensity: number;
    maxEdgeDepth: number;     // px depth from edge
    glowRadius: number;
  };
  particles: {
    count: number;
    maxSize: number;
    speed: number;
    style: 'rain-slide' | 'temple-mist' | 'ocean-shimmer' | 'streetlight-drift' | 'cosmic-spark';
  };
}

export const THEME_VISUALIZERS: Record<WorldId, VisualizerThemeConfig> = {
  'ksrtc-bus': {
    id: 'ksrtc-bus',
    name: 'KSRTC Highway Night',
    palette: {
      primary: 'rgba(249, 115, 22, 0.55)',      // Warm amber streetlight
      secondary: 'rgba(226, 232, 240, 0.35)',   // Classic highway reflection
      glow: 'rgba(249, 115, 22, 0.08)',         // Warm atmospheric amber haze
      particles: 'rgba(253, 186, 116, 0.45)',
    },
    intensityMultipliers: {
      subtle: 0.85,
      balanced: 1.35,
      immersive: 1.9,
    },
    edgeBehavior: {
      bottomWaveAmplitude: 14,
      bottomWaveFrequency: 1.8,
      sideWaveAmplitude: 8,
      topShimmerIntensity: 0.6,
      maxEdgeDepth: 26,
      glowRadius: 36,
    },
    particles: {
      count: 18,
      maxSize: 2.2,
      speed: 0.4,
      style: 'streetlight-drift',
    },
  },

  'temple-morning': {
    id: 'temple-morning',
    name: 'Sacred Temple Dawn',
    palette: {
      primary: 'rgba(217, 119, 6, 0.50)',       // Antique brass / sandalwood
      secondary: 'rgba(251, 191, 36, 0.30)',    // Morning sacred diya light
      glow: 'rgba(217, 119, 6, 0.06)',          // Meditative warm stone glow
      particles: 'rgba(254, 240, 138, 0.40)',
    },
    intensityMultipliers: {
      subtle: 0.4,
      balanced: 0.75,
      immersive: 1.05,
    },
    edgeBehavior: {
      bottomWaveAmplitude: 10,
      bottomWaveFrequency: 1.2,
      sideWaveAmplitude: 5,
      topShimmerIntensity: 0.45,
      maxEdgeDepth: 22,
      glowRadius: 32,
    },
    particles: {
      count: 14,
      maxSize: 1.8,
      speed: 0.25,
      style: 'temple-mist',
    },
  },

  'coastal-morning': {
    id: 'coastal-morning',
    name: 'Coastal Arabian Sea',
    palette: {
      primary: 'rgba(56, 189, 248, 0.50)',      // Muted sea cyan / morning sky
      secondary: 'rgba(148, 163, 184, 0.35)',   // Wet sea slate gray
      glow: 'rgba(56, 189, 248, 0.07)',         // Soft shoreline marine haze
      particles: 'rgba(186, 230, 253, 0.40)',
    },
    intensityMultipliers: {
      subtle: 0.5,
      balanced: 0.85,
      immersive: 1.15,
    },
    edgeBehavior: {
      bottomWaveAmplitude: 18,
      bottomWaveFrequency: 2.2,
      sideWaveAmplitude: 9,
      topShimmerIntensity: 0.7,
      maxEdgeDepth: 28,
      glowRadius: 40,
    },
    particles: {
      count: 22,
      maxSize: 2.5,
      speed: 0.5,
      style: 'ocean-shimmer',
    },
  },

  'malnad-bus': {
    id: 'malnad-bus',
    name: 'Malnad Monsoon Bus',
    palette: {
      primary: 'rgba(96, 165, 250, 0.55)',      // Monsoon rain blue
      secondary: 'rgba(251, 191, 36, 0.30)',    // Warm interior bus bulb reflection
      glow: 'rgba(96, 165, 250, 0.08)',         // Wet window atmospheric haze
      particles: 'rgba(191, 219, 254, 0.55)',
    },
    intensityMultipliers: {
      subtle: 0.85,
      balanced: 1.35,
      immersive: 1.9,
    },
    edgeBehavior: {
      bottomWaveAmplitude: 15,
      bottomWaveFrequency: 1.9,
      sideWaveAmplitude: 10,
      topShimmerIntensity: 0.75,
      maxEdgeDepth: 26,
      glowRadius: 38,
    },
    particles: {
      count: 24,
      maxSize: 2.4,
      speed: 0.6,
      style: 'rain-slide',
    },
  },

  'universal-mode': {
    id: 'universal-mode',
    name: 'Universal Cyber Lounge',
    palette: {
      primary: 'rgba(236, 72, 153, 0.55)',      // Cosmic magenta
      secondary: 'rgba(168, 85, 247, 0.40)',    // Violet harmonic
      glow: 'rgba(236, 72, 153, 0.09)',         // Deep lounge ambient aura
      particles: 'rgba(244, 114, 182, 0.50)',
    },
    intensityMultipliers: {
      subtle: 0.55,
      balanced: 0.90,
      immersive: 1.25,
    },
    edgeBehavior: {
      bottomWaveAmplitude: 16,
      bottomWaveFrequency: 2.0,
      sideWaveAmplitude: 10,
      topShimmerIntensity: 0.8,
      maxEdgeDepth: 28,
      glowRadius: 42,
    },
    particles: {
      count: 26,
      maxSize: 2.2,
      speed: 0.45,
      style: 'cosmic-spark',
    },
  },
};
