'use client';

import { create } from 'zustand';
import { WorldId } from '@/types';

interface LibraryStore {
  favoriteTrackIds: string[];
  favoritePlaylistIds: string[];
  favoriteWorldIds: WorldId[];
  isLibraryOpen: boolean;

  // Actions
  toggleFavoriteTrack: (trackId: string) => void;
  isFavoriteTrack: (trackId: string) => boolean;
  toggleFavoritePlaylist: (playlistId: string) => void;
  isFavoritePlaylist: (playlistId: string) => boolean;
  toggleFavoriteWorld: (worldId: WorldId) => void;
  isFavoriteWorld: (worldId: WorldId) => boolean;
  setLibraryOpen: (open: boolean) => void;
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  favoriteTrackIds: ['rain-track-1', 'temple-track-2'],
  favoritePlaylistIds: ['rain-pl-1'],
  favoriteWorldIds: ['ksrtc-bus', 'temple-morning'],
  isLibraryOpen: false,

  toggleFavoriteTrack: (trackId: string) => {
    set((state) => {
      const exists = state.favoriteTrackIds.includes(trackId);
      const updated = exists
        ? state.favoriteTrackIds.filter((id) => id !== trackId)
        : [...state.favoriteTrackIds, trackId];
      if (typeof window !== 'undefined') {
        localStorage.setItem('swara_fav_tracks', JSON.stringify(updated));
      }
      return { favoriteTrackIds: updated };
    });
  },

  isFavoriteTrack: (trackId: string) => {
    return get().favoriteTrackIds.includes(trackId);
  },

  toggleFavoritePlaylist: (playlistId: string) => {
    set((state) => {
      const exists = state.favoritePlaylistIds.includes(playlistId);
      const updated = exists
        ? state.favoritePlaylistIds.filter((id) => id !== playlistId)
        : [...state.favoritePlaylistIds, playlistId];
      return { favoritePlaylistIds: updated };
    });
  },

  isFavoritePlaylist: (playlistId: string) => {
    return get().favoritePlaylistIds.includes(playlistId);
  },

  toggleFavoriteWorld: (worldId: WorldId) => {
    set((state) => {
      const exists = state.favoriteWorldIds.includes(worldId);
      const updated = exists
        ? state.favoriteWorldIds.filter((id) => id !== worldId)
        : [...state.favoriteWorldIds, worldId];
      return { favoriteWorldIds: updated };
    });
  },

  isFavoriteWorld: (worldId: WorldId) => {
    return get().favoriteWorldIds.includes(worldId);
  },

  setLibraryOpen: (open: boolean) => {
    set({ isLibraryOpen: open });
  },
}));
