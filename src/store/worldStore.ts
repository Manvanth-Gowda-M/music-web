'use client';

import { create } from 'zustand';
import { World, WorldId, AudioSettings } from '@/types';
import { WORLDS, DEFAULT_WORLD, getWorldById } from '@/data/worlds';
import { AudioEngine } from '@/services/audio/AudioEngine';
import { usePlayerStore } from './playerStore';

interface WorldStore {
  currentWorld: World;
  previousWorld: World | null;
  isTransitioning: boolean;
  settings: AudioSettings;

  // Actions
  switchWorld: (worldId: WorldId, autoPlayMusic?: boolean) => Promise<void>;
  updateSettings: (settings: Partial<AudioSettings>) => void;
  toggleAmbient: () => void;
  setAmbientVolume: (volume: number) => void;
}

const DEFAULT_SETTINGS: AudioSettings = {
  autoplay: true,
  crossfade: 2,
  volumeNormalization: true,
  videoQuality: 'auto',
  videoFit: 'cover',
  visualizerEnabled: true,
  visualizerIntensity: 'subtle',
  visualizerDesign: 'fluid-liquid',
  reducedMotion: false,
  ambientVolume: 0.35,
  isAmbientEnabled: false,
  forceDesktopMode: false,
};

export const useWorldStore = create<WorldStore>((set, get) => ({
  currentWorld: DEFAULT_WORLD,
  previousWorld: null,
  isTransitioning: false,
  settings: DEFAULT_SETTINGS,

  switchWorld: async (worldId: WorldId, autoPlayMusic = true) => {
    const { currentWorld, isTransitioning, settings } = get();
    if (currentWorld.id === worldId && !isTransitioning) return;

    const nextWorld = getWorldById(worldId);
    set({
      previousWorld: currentWorld,
      currentWorld: nextWorld,
      isTransitioning: true,
    });

    // Update ambient environmental audio
    if (settings.isAmbientEnabled && nextWorld.ambientSound) {
      AudioEngine.setAmbientSound(nextWorld.ambientSound.url, settings.ambientVolume);
      AudioEngine.playAmbient(nextWorld.id);
    } else if (!settings.isAmbientEnabled) {
      AudioEngine.pauseAmbient();
    }

    // Immediately adapt the active song theme to the world's relative mood
    const player = usePlayerStore.getState();
    const defaultMood = nextWorld.defaultMood || 'Lofi';
    player.setSelectedTheme(defaultMood);

    if (autoPlayMusic) {
      const selectedLang = player.selectedLanguage || 'Kannada';
      try {
        await player.playStation(selectedLang, defaultMood);
      } catch (e) {
        console.warn('Live station switch error:', e);
      }
    }

    // Apply world CSS variables to root document
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--world-accent', nextWorld.palette.accent);
      root.style.setProperty('--world-accent-muted', nextWorld.palette.accentMuted);
      root.style.setProperty('--world-secondary', nextWorld.palette.secondary);
      root.style.setProperty('--world-glow', nextWorld.palette.glow);
      root.style.setProperty('--world-progress', nextWorld.palette.progress);
    }

    // Finish visual transition after crossfade duration (850ms)
    setTimeout(() => {
      set({ isTransitioning: false, previousWorld: null });
    }, 850);
  },

  updateSettings: (newSettings: Partial<AudioSettings>) => {
    set((state) => {
      const merged = { ...state.settings, ...newSettings };
      if (typeof window !== 'undefined') {
        localStorage.setItem('swara_loka_settings', JSON.stringify(merged));
      }
      return { settings: merged };
    });
  },

  toggleAmbient: () => {
    const { settings, currentWorld } = get();
    const isAmbientEnabled = !settings.isAmbientEnabled;

    get().updateSettings({ isAmbientEnabled });

    if (isAmbientEnabled && currentWorld.ambientSound) {
      AudioEngine.setAmbientSound(currentWorld.ambientSound.url, settings.ambientVolume);
      AudioEngine.playAmbient(currentWorld.id);
    } else {
      AudioEngine.pauseAmbient();
    }
  },

  setAmbientVolume: (volume: number) => {
    get().updateSettings({ ambientVolume: volume });
    AudioEngine.setAmbientVolume(volume);
  },
}));
