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
    seek,
  } = usePlayerStore();

  const { settings, currentWorld } = useWorldStore();
  const isSetupRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || isSetupRef.current) return;
    isSetupRef.current = true;

    // Initialize Audio Engine
    AudioEngine.init();
    const audio = AudioEngine.getAudioElement();
    if (!audio) return;

    const onTimeUpdate = () => {
      usePlayerStore.setState({
        currentTime: audio.currentTime,
        duration: audio.duration || currentTrack?.duration || 0,
      });
    };

    const onEnded = () => {
      usePlayerStore.getState().next();
    };

    const onError = (e: Event) => {
      console.warn('Audio tag playback error:', e);
      usePlayerStore.setState({
        isLoading: false,
        error: 'ಈ ಹಾಡು ಪ್ಲೇ ಮಾಡಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ (Track playback failed)',
      });
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
  }, [currentTrack]);

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
