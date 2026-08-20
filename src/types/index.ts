export type WorldId = 'ksrtc-bus' | 'temple-morning' | 'coastal-morning' | 'malnad-bus' | 'universal-mode';

export type VisualizerStyle = 'rain' | 'temple' | 'coast' | 'bus' | 'universal';

export type RepeatMode = 'off' | 'all' | 'one';

export interface WorldPalette {
  accent: string;
  accentMuted: string;
  secondary: string;
  glassBg: string;
  border: string;
  glow: string;
  progress: string;
}

export interface AmbientSound {
  id: string;
  url: string;
  label: string;
  localizedLabel: string;
  defaultVolume: number;
}

export interface Track {
  id: string;
  title: string;
  localizedTitle?: string;
  artist: string;
  localizedArtist?: string;
  album?: string;
  duration: number; // in seconds
  artwork: string;
  audioUrl: string;
  previewUrl?: string;
  language: string;
  genre: string;
  source: 'swany' | 'curated' | 'local';
  sourceId?: string;
  license?: string;
  playlistIds?: string[];
  worldId?: WorldId;
  year?: number;
}

export interface Playlist {
  id: string;
  title: string;
  localizedTitle: string;
  subtitle: string;
  description: string;
  localizedDescription?: string;
  cover: string;
  themeId: WorldId;
  genre: string;
  tracks: Track[];
}

export interface World {
  id: WorldId;
  name: string;
  localizedName: string;
  tagline: string;
  localizedTagline: string;
  description: string;
  localizedDescription: string;
  video: string;
  poster: string;
  ambientCategory: string;
  palette: WorldPalette;
  visualizerStyle: VisualizerStyle;
  defaultMood?: string;
  recommendedGenres: string[];
  recommendedPlaylists: Playlist[];
  ambientSound?: AmbientSound;
}

export type VisualizerDesign =
  | 'fluid-liquid'
  | 'minimal-pulse'
  | 'perimeter-bars'
  | 'aurora-ribbon'
  | 'particle-shimmer';

export interface AudioSettings {
  autoplay: boolean;
  crossfade: number; // 0 to 5 seconds
  volumeNormalization: boolean;
  videoQuality: '4k' | '1080p' | 'auto';
  videoFit?: 'cover' | 'contain';
  visualizerEnabled: boolean;
  visualizerIntensity: 'subtle' | 'balanced' | 'immersive';
  visualizerDesign: VisualizerDesign;
  reducedMotion: boolean;
  ambientVolume: number; // 0 to 1
  isAmbientEnabled: boolean;
  forceDesktopMode: boolean;
}
