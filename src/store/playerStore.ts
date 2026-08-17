'use client';

import { create } from 'zustand';
import { Track, RepeatMode } from '@/types';
import { AudioEngine } from '@/services/audio/AudioEngine';

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
        await get().playTrack(queue[0]);
      }
      return;
    }

    if (isPlaying) {
      audio.pause();
      set({ isPlaying: false });
    } else {
      try {
        await audio.play();
        set({ isPlaying: true });
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
    if (audio) {
      try {
        await audio.play();
        set({ isPlaying: true });
      } catch (e) {
        console.warn(e);
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
    const { queue, currentTrack, shuffle, repeat } = get();
    if (queue.length === 0 && !currentTrack) return;

    if (repeat === 'one' && currentTrack) {
      get().seek(0);
      await get().play();
      return;
    }

    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    let nextIndex = currentIndex + 1;

    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      if (repeat === 'all') {
        nextIndex = 0;
      } else {
        set({ isPlaying: false });
        return;
      }
    }

    const nextTrack = queue[nextIndex];
    if (nextTrack) {
      await get().playTrack(nextTrack);
    }
  },

  previous: async () => {
    const { queue, currentTrack, currentTime } = get();
    if (currentTime > 3) {
      get().seek(0);
      return;
    }

    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
    const prevTrack = queue[prevIndex];
    if (prevTrack) {
      await get().playTrack(prevTrack);
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
}));
