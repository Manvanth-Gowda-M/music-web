import { MusicProvider } from './types';
import { Track, Playlist, WorldId } from '@/types';
import { CuratedMusicProvider } from './CuratedMusicProvider';

export class SwanyMusicProvider implements MusicProvider {
  name = 'Swany Live Stream (JioSaavn Core)';
  private fallbackProvider: CuratedMusicProvider;

  constructor() {
    this.fallbackProvider = new CuratedMusicProvider();
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async search(query: string, language = 'Kannada', mood = ''): Promise<Track[]> {
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (language) params.set('lang', language);
      if (mood) params.set('mood', mood);

      const endpoint = `/api/songs/search?${params.toString()}`;
      const res = await fetch(endpoint, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();

      if (Array.isArray(data?.results) && data.results.length > 0) {
        return data.results;
      }
      return this.fallbackProvider.search(query);
    } catch (err) {
      console.warn('Live API search error, falling back to curated library:', err);
      return this.fallbackProvider.search(query);
    }
  }

  async getTrack(id: string): Promise<Track | null> {
    return this.fallbackProvider.getTrack(id);
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    return this.fallbackProvider.getPlaylist(id);
  }

  async getPlaylistsForWorld(worldId: WorldId): Promise<Playlist[]> {
    return this.fallbackProvider.getPlaylistsForWorld(worldId);
  }

  async getStreamUrl(track: Track): Promise<string> {
    return track.audioUrl;
  }

  async getRecommendedTracks(worldId: WorldId, currentTrackId?: string): Promise<Track[]> {
    return this.fallbackProvider.getRecommendedTracks(worldId, currentTrackId);
  }
}
