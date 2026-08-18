import { MusicProvider } from './types';
import { SwanyMusicProvider } from './SwanyMusicProvider';
import { Track, Playlist, WorldId } from '@/types';

class MusicServiceClass {
  private provider: MusicProvider;

  constructor() {
    this.provider = new SwanyMusicProvider();
  }

  setProvider(provider: MusicProvider) {
    this.provider = provider;
  }

  getProviderName(): string {
    return this.provider.name;
  }

  async search(query: string, language?: string, mood?: string): Promise<Track[]> {
    return this.provider.search(query, language, mood);
  }

  async getTrack(id: string): Promise<Track | null> {
    return this.provider.getTrack(id);
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    return this.provider.getPlaylist(id);
  }

  async getPlaylistsForWorld(worldId: WorldId): Promise<Playlist[]> {
    return this.provider.getPlaylistsForWorld(worldId);
  }

  async getStreamUrl(track: Track): Promise<string> {
    return this.provider.getStreamUrl(track);
  }

  async getRecommendedTracks(worldId: WorldId, currentTrackId?: string): Promise<Track[]> {
    return this.provider.getRecommendedTracks(worldId, currentTrackId);
  }
}

export const MusicService = new MusicServiceClass();
