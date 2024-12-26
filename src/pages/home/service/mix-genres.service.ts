import { inject, injectable } from "inversify";
import { makeAutoObservable, reaction } from "mobx";
import type { Artist, Track } from "spotify-types";
import type { IService } from "~/config/service.interface";
import { type UserService, UserServiceContainerToken } from "~/services/user";
import type { lastFmTypes } from "~/shared/api";
import { ArtistApi, PlaylistsApi, TracksApi } from "~/shared/api";
import { RecommendationsApi } from "~/shared/api/modules/recommendations/recommendations.api";
import { SearchApi } from "~/shared/api/modules/search";
import { AsyncOperation, LocalStorageCacheStrategy } from "~/shared/factories/async-operation";

export const MixGenresServiceContainerToken = {
  MixGenresService: Symbol("MixGenresService"),
};

interface TrackWithArtist {
  track: string;
  artist: string;
  genres?: string[];
}

interface SimilarTrackInfo {
  name: string;
  artist: string;
}

@injectable()
export class MixGenresService implements IService {
  favoritesTracks: Track[] = [];
  uniqueArtistsFromFavoritesTracks: Map<Artist["id"], Artist> = new Map();
  listenGenres: string[] = [];
  countListenGenres: Record<string, number> = {};
  genresArtists: Map<Artist["name"], Artist["genres"]> = new Map();

  private asyncOperation: AsyncOperation;
  private localStorageStorage: LocalStorageCacheStrategy;

  private readonly CONFIG = {
    RANDOM_TRACKS_COUNT: 20,
    SIMILAR_TRACKS_PER_ITEM: 3,
    MAX_TRACKS_PER_ARTIST: 2,
    MAX_PLAYLIST_SIZE: 100,
  } as const;

  private readonly CACHE_KEYS = {
    ARTIST_GENRES: 'artist-genres',
    FAVORITE_TRACKS: 'favorite-tracks',
  } as const;

  constructor(
    @inject(ArtistApi) private artistApi: ArtistApi,
    @inject(TracksApi) private tracksApi: TracksApi,
    @inject(RecommendationsApi) private recommendationsApi: RecommendationsApi,
    @inject(SearchApi) private searchApi: SearchApi,
    @inject(PlaylistsApi) private playlistsApi: PlaylistsApi,
    @inject(UserServiceContainerToken.UserService) private userService: UserService,
  ) {
    makeAutoObservable(this);
    this.asyncOperation = new AsyncOperation();
    this.localStorageStorage = new LocalStorageCacheStrategy();

    reaction(
      () => this.listenGenres,
      () => {
        this.calculateCountListenGenres();
      },
    );
  }

  private updateListenGenres(listenGenres: string[]) {
    this.listenGenres = listenGenres;
  }

  private updateCountListenGenres(countListenGenres: Record<string, number>) {
    this.countListenGenres = countListenGenres;
  }

  private updateGenresArtists(artist: Artist) {
    const map = new Map(this.genresArtists);
    map.set(artist.name, artist.genres);
    this.genresArtists = map;
  }

  private updateFavoritesTracks(tracks: Track[]) {
    this.favoritesTracks = tracks;
  }

  private updateUniqueArtistsFromFavoritesTracks(artists: Map<Artist["id"], Artist>) {
    this.uniqueArtistsFromFavoritesTracks = artists;
  }

  get mapFavoriteTracksWithArtist(): TrackWithArtist[] {
    return this.favoritesTracks.map((track) => ({
      track: track.name,
      artist: track.artists[0].name,
      genres: this.genresArtists.get(track.artists[0].name),
    }));
  }

  async initialize() {
    await this.fetchFavoritesTracks();
    this.saveUniqueArtistsFromFavoritesTracks();
    await this.fetchArtistGenres();
  }

  async createMixPlaylist(playlistConfig: {
    name: string;
    description: string;
  }) {
    try {
      const lastAddedTracks = this.getRandomTracksFromFavorites(this.CONFIG.RANDOM_TRACKS_COUNT);
      if (!lastAddedTracks.length) {
        console.error('No tracks found in favorites');
        return;
      }

      const similarTracks = await this.getSimilarTracksForSelection(lastAddedTracks);
      if (!similarTracks.length) {
        console.error('No similar tracks found');
        return;
      }

      const trackUris = await this.searchAndFilterTracks(similarTracks);
      if (!trackUris.length) {
        console.error('No track URIs found after search');
        return;
      }

      await this.createAndFillPlaylist(trackUris, playlistConfig);
    } catch (error) {
      console.error('Error creating mix playlist:', error);
      throw error;
    }
  }

  private getRandomTracksFromFavorites(count: number): TrackWithArtist[] {
    const shuffledTracks = this.mapFavoriteTracksWithArtist.sort(() => 0.5 - Math.random());
    return shuffledTracks.slice(0, count);
  }

  private async getSimilarTracksForSelection(tracks: TrackWithArtist[]): Promise<SimilarTrackInfo[]> {
    const result: lastFmTypes.LastFMTrackGetSimilarResponse[] = [];

    for (const track of tracks) {
      await this.asyncOperation.execute(
        async () => await this.recommendationsApi.getSimilarTracks(track.artist, track.track),
        {
          onSuccess: (data) => {
            if (data.similartracks.track.length > 0) {
              result.push(data);
            }
          },
        },
      );
    }

    return result.flatMap((item) =>
      item.similartracks.track
        .slice(0, this.CONFIG.SIMILAR_TRACKS_PER_ITEM)
        .map((track) => ({
          name: track.name,
          artist: track.artist.name,
        }))
    );
  }

  private async searchAndFilterTracks(tracksInfo: Array<{ name: string; artist: string }>) {
    const trackUrls: string[] = [];
    const artistCount: Record<string, number> = {};

    for (const track of tracksInfo) {
      const query = `track:${track.name} artist:${track.artist}`;

      await this.asyncOperation.execute(
        async () => await this.searchApi.search(query, { type: ["track"] }),
        {
          onSuccess: (data) => {
            if (data.tracks?.items) {
              const filteredTracks = data.tracks.items.filter(track => {
                const artistId = track.artists[0].id;
                const currentCount = artistCount[artistId] || 0;

                if (currentCount < 2) {
                  artistCount[artistId] = currentCount + 1;
                  return true;
                }
                return false;
              });

              trackUrls.push(...filteredTracks.map(track => track.uri));
            }
          },
        }
      );
    }

    return this.shuffleArray(trackUrls).slice(0, 100);
  }

  private async createAndFillPlaylist(trackUris: string[], playlistConfig: {
    name: string;
    description: string;
  }) {
    const userId = this.userService.user?.id;
    if (!userId) return;

    const createdPlaylist = await this.playlistsApi.createPlaylist(
      userId,
      playlistConfig.name,
      playlistConfig.description,
      true,
    );

    await this.playlistsApi.addTracksToPlaylist(
      createdPlaylist.id,
      trackUris,
    );
  }

  private calculateCountListenGenres() {
    const unsortedGenres: Record<string, number> = {};

    for (const genre of this.listenGenres) {
      unsortedGenres[genre] = (unsortedGenres[genre] || 0) + 1;
    }

    const sortedEntries = Object.entries(unsortedGenres).sort(
      ([, countA], [, countB]) => countB - countA,
    );

    this.updateCountListenGenres(Object.fromEntries(sortedEntries));
  }

  private saveUniqueArtistsFromFavoritesTracks() {
    if (this.favoritesTracks.length === 0) return;
    for (const track of this.favoritesTracks) {
      for (const artist of track.artists) {
        const uniqueArtistsFromFavoritesTracks = new Map(this.uniqueArtistsFromFavoritesTracks);
        uniqueArtistsFromFavoritesTracks.set(artist.id, artist);
        this.updateUniqueArtistsFromFavoritesTracks(uniqueArtistsFromFavoritesTracks);
      }
    }
  }

  private async fetchFavoritesTracks() {
    const result = await this.asyncOperation.execute(
      async () => await this.tracksApi.getAllSavedTracks(),
      {
        onSuccess: (data) => {
          this.updateFavoritesTracks(data);
        },
      },
    );

    return result;
  }

  private async fetchArtistGenres() {
    const artistIds = Array.from(this.uniqueArtistsFromFavoritesTracks.keys());
    const chunks = this.chunkArray(artistIds, 50);

    for (const chunk of chunks) {
      await this.asyncOperation.execute(async () => await this.artistApi.getSeveralArtists(chunk), {
        onSuccess: (artists) => {
          if (artists) {
            const genres = this.listenGenres.concat(
              artists.flatMap((artist) => artist.genres),
            );

            this.updateListenGenres(genres);

            for (const artist of artists) {
              this.updateGenresArtists(artist);
            }
          }
        },
      });
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private shuffleArray<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
