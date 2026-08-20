'use client';

import { create } from 'zustand';
import { Track, RepeatMode } from '@/types';
import { AudioEngine } from '@/services/audio/AudioEngine';
import { CURATED_TRACKS } from '@/data/curatedTracks';
import { MusicService } from '@/services/audio/MusicService';

interface PlayerStore {
  currentTrack: Track | null;
  queue: Track[];
  history: Track[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  isLoading: boolean;
  error: string | null;
  isFullPlayerOpen: boolean;
  isQueueOpen: boolean;
  selectedLanguage: string;
  selectedTheme: string | null;
  isStationModalOpen: boolean;

  // Actions
  playTrack: (track: Track, newQueue?: Track[]) => Promise<void>;
  togglePlay: () => Promise<void>;
  pause: () => void;
  play: () => Promise<void>;
  seek: (time: number) => void;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (track: Track) => void;
  addNext: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  setFullPlayerOpen: (open: boolean) => void;
  setQueueOpen: (open: boolean) => void;
  setError: (error: string | null) => void;
  setStationModalOpen: (open: boolean) => void;
  setSelectedLanguage: (lang: string) => void;
  setSelectedTheme: (theme: string | null) => void;
  playStation: (language: string, theme: string | null, customQuery?: string) => Promise<void>;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  queue: [],
  history: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.85,
  isMuted: false,
  shuffle: false,
  repeat: 'off',
  isLoading: false,
  error: null,
  isFullPlayerOpen: false,
  isQueueOpen: false,
  selectedLanguage: 'Kannada',
  selectedTheme: null,
  isStationModalOpen: false,

  playTrack: async (track: Track, newQueue?: Track[]) => {
    try {
      set({ isLoading: true, error: null });
      await AudioEngine.resumeContext();

      const audio = AudioEngine.getAudioElement();
      if (!audio) throw new Error('Audio element unavailable');

      audio.src = track.audioUrl;
      audio.load();

      const { currentTrack, queue } = get();
      const updatedQueue = newQueue ? newQueue : (queue.some(t => t.id === track.id) ? queue : [track, ...queue]);
      const history = currentTrack ? [currentTrack, ...get().history.slice(0, 20)] : get().history;

      set({
        currentTrack: track,
        queue: updatedQueue,
        history,
        currentTime: 0,
        duration: track.duration || 0,
      });

      await audio.play();
      set({ isPlaying: true, isLoading: false });
    } catch (err: any) {
      console.warn('Playback error:', err);
      set({
        isLoading: false,
        error: 'ಈ ಹಾಡು ಪ್ಲೇ ಮಾಡಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ (Unable to play track)',
      });
    }
  },

  togglePlay: async () => {
    const { isPlaying, currentTrack, queue } = get();
    await AudioEngine.resumeContext();
    const audio = AudioEngine.getAudioElement();

    if (!audio) return;

    if (!currentTrack) {
      if (queue.length > 0) {
        await get().playTrack(queue[0], queue);
      }
      return;
    }

    if (isPlaying) {
      audio.pause();
      set({ isPlaying: false });
    } else {
      if (!audio.src || audio.src === '' || (!audio.src.endsWith(currentTrack.audioUrl) && !currentTrack.audioUrl.startsWith('http'))) {
        audio.src = currentTrack.audioUrl;
        audio.load();
      }
      try {
        await audio.play();
        set({ isPlaying: true, isLoading: false });
      } catch (err) {
        console.warn('Play failed:', err);
      }
    }
  },

  pause: () => {
    const audio = AudioEngine.getAudioElement();
    if (audio) audio.pause();
    set({ isPlaying: false });
  },

  play: async () => {
    await AudioEngine.resumeContext();
    const audio = AudioEngine.getAudioElement();
    const { currentTrack } = get();
    if (audio && currentTrack) {
      if (!audio.src || audio.src === '') {
        audio.src = currentTrack.audioUrl;
        audio.load();
      }
      try {
        await audio.play();
        set({ isPlaying: true, isLoading: false });
      } catch (e) {
        console.warn('Audio play failed:', e);
      }
    }
  },

  seek: (time: number) => {
    const audio = AudioEngine.getAudioElement();
    if (audio) {
      audio.currentTime = time;
      set({ currentTime: time });
    }
  },

  next: async () => {
    const { queue, currentTrack, shuffle, repeat, selectedLanguage, selectedTheme } = get();
    let activeQueue = queue;

    if (activeQueue.length <= 1) {
      try {
        const liveTracks = await MusicService.search('', selectedLanguage || 'Kannada', selectedTheme || '');
        if (liveTracks.length > 0) {
          activeQueue = liveTracks;
          set({ queue: liveTracks });
        }
      } catch (e) {
        const worldTracks = CURATED_TRACKS.filter((t) => t.worldId === currentTrack?.worldId);
        activeQueue = worldTracks.length > 0 ? worldTracks : CURATED_TRACKS;
        set({ queue: activeQueue });
      }
    }

    if (repeat === 'one' && currentTrack) {
      get().seek(0);
      await get().play();
      return;
    }

    const currentIndex = activeQueue.findIndex((t) => t.id === currentTrack?.id);
    let nextIndex = 0;

    if (shuffle && activeQueue.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * activeQueue.length);
      } while (nextIndex === currentIndex && activeQueue.length > 1);
    } else if (currentIndex >= 0 && currentIndex < activeQueue.length - 1) {
      nextIndex = currentIndex + 1;
    } else {
      // Loop seamlessly to beginning of active queue
      nextIndex = 0;
    }

    const nextTrack = activeQueue[nextIndex];
    if (nextTrack) {
      await get().playTrack(nextTrack, activeQueue);
    }
  },

  previous: async () => {
    const { queue, currentTrack, selectedLanguage, selectedTheme } = get();
    let activeQueue = queue;

    if (activeQueue.length <= 1) {
      try {
        const liveTracks = await MusicService.search('', selectedLanguage || 'Kannada', selectedTheme || '');
        if (liveTracks.length > 0) {
          activeQueue = liveTracks;
          set({ queue: liveTracks });
        }
      } catch (e) {
        const worldTracks = CURATED_TRACKS.filter((t) => t.worldId === currentTrack?.worldId);
        activeQueue = worldTracks.length > 0 ? worldTracks : CURATED_TRACKS;
        set({ queue: activeQueue });
      }
    }

    if (activeQueue.length === 0) return;

    const currentIndex = activeQueue.findIndex((t) => t.id === currentTrack?.id);
    let prevIndex = 0;

    if (currentIndex > 0) {
      prevIndex = currentIndex - 1;
    } else {
      prevIndex = activeQueue.length - 1;
    }

    const prevTrack = activeQueue[prevIndex];
    if (prevTrack) {
      await get().playTrack(prevTrack, activeQueue);
    }
  },

  setVolume: (volume: number) => {
    AudioEngine.setVolume(volume);
    set({ volume, isMuted: volume === 0 });
  },

  toggleMute: () => {
    const { isMuted, volume } = get();
    if (isMuted) {
      AudioEngine.setVolume(volume || 0.85);
      set({ isMuted: false });
    } else {
      AudioEngine.setVolume(0);
      set({ isMuted: true });
    }
  },

  toggleShuffle: () => {
    set((state) => ({ shuffle: !state.shuffle }));
  },

  cycleRepeat: () => {
    set((state) => {
      const modes: RepeatMode[] = ['off', 'all', 'one'];
      const nextIdx = (modes.indexOf(state.repeat) + 1) % modes.length;
      return { repeat: modes[nextIdx] };
    });
  },

  addToQueue: (track: Track) => {
    set((state) => ({
      queue: [...state.queue, track],
    }));
  },

  addNext: (track: Track) => {
    set((state) => {
      const currentIdx = state.queue.findIndex((t) => t.id === state.currentTrack?.id);
      const newQueue = [...state.queue];
      newQueue.splice(currentIdx + 1, 0, track);
      return { queue: newQueue };
    });
  },

  removeFromQueue: (index: number) => {
    set((state) => {
      const newQueue = [...state.queue];
      newQueue.splice(index, 1);
      return { queue: newQueue };
    });
  },

  reorderQueue: (fromIndex: number, toIndex: number) => {
    set((state) => {
      const newQueue = [...state.queue];
      const [moved] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, moved);
      return { queue: newQueue };
    });
  },

  clearQueue: () => {
    set({ queue: [] });
  },

  setFullPlayerOpen: (open: boolean) => {
    set({ isFullPlayerOpen: open });
  },

  setQueueOpen: (open: boolean) => {
    set({ isQueueOpen: open });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setStationModalOpen: (open: boolean) => {
    set({ isStationModalOpen: open });
  },

  setSelectedLanguage: async (selectedLanguage: string) => {
    set({ selectedLanguage });
    const { selectedTheme } = get();
    await get().playStation(selectedLanguage, selectedTheme);
  },

  setSelectedTheme: (selectedTheme: string | null) => {
    set({ selectedTheme });
  },

  playStation: async (language: string, theme: string | null, customQuery?: string) => {
    try {
      set({ selectedLanguage: language, selectedTheme: theme, isLoading: true, error: null });
      let tracks = await MusicService.search(customQuery || '', language, theme || '');
      if (!tracks || tracks.length === 0) {
        // Seamless fallback to top hits for this language
        tracks = await MusicService.search('', language, '');
      }
      if (tracks && tracks.length > 0) {
        // Dynamic shuffle so every session and station tune-in starts with a fresh, different song
        const shuffled = [...tracks].sort(() => Math.random() - 0.5);
        await get().playTrack(shuffled[0], shuffled);
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      console.warn('Station play error:', e);
      try {
        const fallbackTracks = await MusicService.search('', language, '');
        if (fallbackTracks && fallbackTracks.length > 0) {
          const shuffledFallback = [...fallbackTracks].sort(() => Math.random() - 0.5);
          await get().playTrack(shuffledFallback[0], shuffledFallback);
          return;
        }
      } catch (err2) {}
      set({ isLoading: false });
    }
  },
}));
