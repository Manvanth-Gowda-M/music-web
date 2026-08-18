import { Track, Playlist, WorldId } from '@/types';

export interface MusicProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  search(query: string, language?: string, mood?: string): Promise<Track[]>;
  getTrack(id: string): Promise<Track | null>;
  getPlaylist(id: string): Promise<Playlist | null>;
  getPlaylistsForWorld(worldId: WorldId): Promise<Playlist[]>;
  getStreamUrl(track: Track): Promise<string>;
  getRecommendedTracks(worldId: WorldId, currentTrackId?: string): Promise<Track[]>;
}
