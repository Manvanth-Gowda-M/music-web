'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useWorldStore } from '@/store/worldStore';
import { AudioEngine } from '@/services/audio/AudioEngine';

export function useAudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    volume,
    next,
    previous,
    togglePlay,
    seek,
  } = usePlayerStore();

  const { settings, currentWorld } = useWorldStore();
  const isSetupRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize Audio Engine
    AudioEngine.init();
    const audio = AudioEngine.getAudioElement();
    if (!audio) return;

    // Dynamic initial track selection on website open
    const current = usePlayerStore.getState().currentTrack;
    if (!current) {
      const allTracks = currentWorld.recommendedPlaylists.flatMap((p) => p.tracks);
      if (allTracks.length > 0) {
        const shuffled = [...allTracks].sort(() => Math.random() - 0.5);
        const randomInitialTrack = shuffled[0];
        usePlayerStore.setState({
          currentTrack: randomInitialTrack,
          queue: shuffled,
          duration: randomInitialTrack.duration || 0,
        });
        audio.src = randomInitialTrack.audioUrl;
        audio.load();
      }
    }

    const onTimeUpdate = () => {
      usePlayerStore.setState({
        currentTime: audio.currentTime,
        duration: audio.duration || currentTrack?.duration || 0,
      });

      // Update MediaSession position state for background/lockscreen scrubber
      if ('mediaSession' in navigator && audio.duration && !isNaN(audio.duration)) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate,
            position: audio.currentTime,
          });
        } catch (e) {}
      }
    };

    // ENDLESS CONTINUOUS AUTO-PLAY: Seamlessly advances to next track
    const onEnded = async () => {
      console.log('🎵 Track finished, automatically advancing to next song...');
      await usePlayerStore.getState().next();
    };

    const onError = (e: Event) => {
      console.warn('Audio tag playback error, attempting automatic recovery:', e);
      // Auto-skip to next track after 800ms if stream fails
      setTimeout(() => {
        const state = usePlayerStore.getState();
        if (state.isPlaying) {
          state.next();
        }
      }, 800);
    };

    const onWaiting = () => {
      usePlayerStore.setState({ isLoading: true });
    };

    const onPlaying = () => {
      usePlayerStore.setState({ isLoading: false, isPlaying: true });
    };

    const onPause = () => {
      usePlayerStore.setState({ isPlaying: false });
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  // Sync System Media Session (Lockscreen, Notification & Background Playback Support)
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || !currentTrack) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.localizedTitle || currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album || currentWorld.name,
        artwork: [
          {
            src: currentTrack.artwork,
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ],
      });

      navigator.mediaSession.setActionHandler('play', async () => {
        await usePlayerStore.getState().play();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        usePlayerStore.getState().pause();
      });

      navigator.mediaSession.setActionHandler('nexttrack', async () => {
        await usePlayerStore.getState().next();
      });

      navigator.mediaSession.setActionHandler('previoustrack', async () => {
        await usePlayerStore.getState().previous();
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          usePlayerStore.getState().seek(details.seekTime);
        }
      });
    } catch (e) {
      console.warn('MediaSession handler registration error:', e);
    }
  }, [currentTrack, currentWorld]);

  // Sync volume
  useEffect(() => {
    AudioEngine.setVolume(volume);
  }, [volume]);

  return {
    currentTrack,
    isPlaying,
    volume,
  };
}
