import { inject, injectable } from "inversify";
import type {
  Artist,
  SimplifiedAlbum,
  SimplifiedEpisode,
  SimplifiedPlaylist,
  SimplifiedShow,
  Track,
} from "spotify-types";
import { type HttpClient, HttpClientToken } from "~/config";

type SearchType = 'album' | 'artist' | 'playlist' | 'track' | 'show' | 'episode' | 'audiobook';

interface SearchResponse<T> {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: T[];
}

interface SearchResults {
  tracks?: SearchResponse<Track>;
  artists?: SearchResponse<Artist>;
  albums?: SearchResponse<SimplifiedAlbum>;
  playlists?: SearchResponse<SimplifiedPlaylist>;
  shows?: SearchResponse<SimplifiedShow>;
  episodes?: SearchResponse<SimplifiedEpisode>;
}

interface SearchOptions {
  type: SearchType[];
  market?: string;
  limit?: number;
  offset?: number;
  include_external?: 'audio';
}

@injectable()
export class SearchApi {
  constructor(
    @inject(HttpClientToken.SpotifyBase) private spotifyHttp: HttpClient,
  ) { }

  async search(query: string, options: SearchOptions): Promise<SearchResults> {
    const encodedQuery = encodeURIComponent(query);

    const queryParams = new URLSearchParams();
    queryParams.append('q', encodedQuery);
    queryParams.append('type', options.type.join(','));

    if (options.limit) {
      queryParams.append('limit', String(options.limit));
    }

    if (options.offset) {
      queryParams.append('offset', String(options.offset));
    }

    if (options.market) {
      queryParams.append('market', options.market);
    }

    if (options.include_external) {
      queryParams.append('include_external', options.include_external);
    }

    return this.spotifyHttp.get<SearchResults>(`/v1/search?${queryParams}`);
  }

  async searchTracks(query: string, options?: Omit<SearchOptions, 'type'>) {
    const response = await this.search(query, { ...options, type: ['track'] });
    return response.tracks;
  }

  async searchArtists(query: string, options?: Omit<SearchOptions, 'type'>) {
    const response = await this.search(query, { ...options, type: ['artist'] });
    return response.artists;
  }

  async searchAlbums(query: string, options?: Omit<SearchOptions, 'type'>) {
    const response = await this.search(query, { ...options, type: ['album'] });
    return response.albums;
  }

  async searchPlaylists(query: string, options?: Omit<SearchOptions, 'type'>) {
    const response = await this.search(query, { ...options, type: ['playlist'] });
    return response.playlists;
  }
}