import { MusicProvider } from './types';
import { Track, Playlist, WorldId } from '@/types';
import { CURATED_TRACKS } from '@/data/curatedTracks';
import { WORLDS } from '@/data/worlds';

export class CuratedMusicProvider implements MusicProvider {
  name = 'Curated Karnataka Library';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async search(query: string): Promise<Track[]> {
    const q = query.toLowerCase().trim();
    if (!q) return CURATED_TRACKS;

    return CURATED_TRACKS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.localizedTitle && t.localizedTitle.includes(q)) ||
        t.artist.toLowerCase().includes(q) ||
        (t.localizedArtist && t.localizedArtist.includes(q)) ||
        (t.album && t.album.toLowerCase().includes(q)) ||
        t.genre.toLowerCase().includes(q)
    );
  }

  async getTrack(id: string): Promise<Track | null> {
    const track = CURATED_TRACKS.find((t) => t.id === id);
    return track || null;
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    for (const world of WORLDS) {
      const pl = world.recommendedPlaylists.find((p) => p.id === id);
      if (pl) return pl;
    }
    return null;
  }

  async getPlaylistsForWorld(worldId: WorldId): Promise<Playlist[]> {
    const world = WORLDS.find((w) => w.id === worldId);
    return world ? world.recommendedPlaylists : [];
  }

  async getStreamUrl(track: Track): Promise<string> {
    return track.audioUrl;
  }

  async getRecommendedTracks(worldId: WorldId, currentTrackId?: string): Promise<Track[]> {
    const worldTracks = CURATED_TRACKS.filter((t) => t.worldId === worldId);
    if (worldTracks.length === 0) return CURATED_TRACKS;
    return worldTracks.filter((t) => t.id !== currentTrackId);
  }
}
