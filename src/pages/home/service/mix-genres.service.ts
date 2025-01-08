import { inject, injectable } from "inversify";
import { makeAutoObservable, reaction } from "mobx";
import type { Artist, Track } from "spotify-types";
import type { IService } from "~/config/service.interface";
import type { lastFmTypes } from "~/shared/api";
import { Api } from "~/shared/api";
import { AsyncOperation } from "~/shared/factories/async-operation";
import { chunkArray, shuffleArray } from "~/shared/lib/collection";
import { LoaderProcessor } from "~/shared/lib/loader-processor";
import type { MixedPlaylistService } from "./mixed-playlist.service";
import { MixedPlaylistServiceContainerToken } from "./mixed-playlist.service";

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

interface FavoritesArtists {
  name: string;
  image: string;
  id: string;
}

@injectable()
export class MixGenresService implements IService {
  favoritesTracks: Track[] = [];
  uniqueArtistsFromFavoritesTracks: Map<Artist["id"], Artist> = new Map();
  listenGenres: string[] = [];
  favoriteListenedGenres: Record<string, number> = {};
  favoritesListenedArtists: FavoritesArtists[] = [];
  favoriteArtists: Map<Artist["name"], Artist> = new Map();

  private asyncOperation: AsyncOperation;

  initialLoadingData = new LoaderProcessor();
  mixifyLoadingData = new LoaderProcessor();

  private readonly CONFIG = {
    RANDOM_TRACKS_COUNT: 20,
    SIMILAR_TRACKS_PER_ITEM: 3,
    MAX_TRACKS_PER_ARTIST: 2,
    MAX_PLAYLIST_SIZE: 100,
  } as const;

  constructor(
    @inject(Api) private api: Api,
    @inject(MixedPlaylistServiceContainerToken) private mixedPlaylistService: MixedPlaylistService,
  ) {
    makeAutoObservable(this);
    this.asyncOperation = new AsyncOperation();

    reaction(
      () => this.listenGenres,
      () => {
        this.calculateCountListenGenres();
        this.calculateFavoritesListenedArtists();
      },
    );
  }

  private updateListenGenres(listenGenres: string[]) {
    this.listenGenres = listenGenres;
  }

  private updateFavoriteListenedGenres(favoriteListenedGenres: Record<string, number>) {
    this.favoriteListenedGenres = favoriteListenedGenres;
  }

  private updateFavoriteArtists(artist: Artist) {
    const map = new Map(this.favoriteArtists);
    map.set(artist.name, artist);
    this.favoriteArtists = map;
  }

  private updateFavoritesTracks(tracks: Track[]) {
    this.favoritesTracks = tracks;
  }

  private updateUniqueArtistsFromFavoritesTracks(artists: Map<Artist["id"], Artist>) {
    this.uniqueArtistsFromFavoritesTracks = artists;
  }

  private updateFavoritesListenedArtists(artists: FavoritesArtists[]) {
    this.favoritesListenedArtists = artists;
  }

  get mapFavoriteTracksWithArtist(): TrackWithArtist[] {
    return this.favoritesTracks.map((track) => ({
      track: track.name,
      artist: track.artists[0].name,
      genres: this.favoriteArtists.get(track.artists[0].name)?.genres,
    }));
  }

  async initialize() {
    this.initialLoadingData.setIsLoading(true);
    this.initialLoadingData.setLoadingStatus("Discovering your musical universe...");
    try {
      await this.fetchFavoritesTracks();
      this.saveUniqueArtistsFromFavoritesTracks();
      this.initialLoadingData.setLoadingStatus("Exploring the genres you love...");
      await this.fetchArtistGenres();
    } catch (error) {
      console.error("Error initializing mix genres service:", error);
      this.initialLoadingData.setLoadingStatus("Oops! Something went wrong while exploring your music...");
      throw error;
    } finally {
      this.initialLoadingData.setLoadingStatus("");
      this.initialLoadingData.setIsLoading(false);
    }
  }

  async createMixPlaylist() {
    this.mixifyLoadingData.setIsLoading(true);
    this.mixedPlaylistService.updateMixedPlaylist([]);

    try {
      const lastAddedTracks = this.getRandomTracksFromFavorites(this.CONFIG.RANDOM_TRACKS_COUNT);
      if (!lastAddedTracks.length) {
        console.error("No tracks found in favorites");
        return;
      }

      const similarTracks = await this.getSimilarArtistsForSelection(lastAddedTracks);
      if (!similarTracks.length) {
        console.error("No similar tracks found");
        return;
      }

      const mixedTracks = await this.searchAndFilterTracks(similarTracks);
      if (!mixedTracks.length) {
        console.error("No track URIs found after search");
        return;
      }

      this.mixedPlaylistService.updateMixedPlaylist(mixedTracks);

    } catch (error) {
      console.error("Error creating mix playlist:", error);
      throw error;
    } finally {
      this.mixifyLoadingData.setIsLoading(false);
    }
  }

  private getRandomTracksFromFavorites(count: number): TrackWithArtist[] {
    const shuffledTracks = this.mapFavoriteTracksWithArtist.sort(() => 0.5 - Math.random());
    return shuffledTracks.slice(0, count);
  }

  private async getSimilarArtistsForSelection(tracks: TrackWithArtist[]): Promise<SimilarTrackInfo[]> {
    const promises = tracks.map(track =>
      this.api.recommendations.getSimilarArtists(track.artist)
    );

    const results = await Promise.all(promises);

    const uniqueArtists = new Set<string>();
    const selectedArtists = [];

    for (const result of results) {
      if (!result.similarartists?.artist) continue;

      const randomArtists = shuffleArray(result.similarartists.artist)
        .sort(() => 0.5 - Math.random()).slice(0, 3)
        .filter(artist => {
          if (uniqueArtists.has(artist.name)) {
            return false;
          }
          uniqueArtists.add(artist.name);
          return true;
        });

      selectedArtists.push(...randomArtists);
    }


    const topTracksPromises = selectedArtists.map(artist =>
      this.api.recommendations.getTopArtistsTracks(artist.name)
    );

    const topTracksResults = await Promise.all(topTracksPromises);

    return topTracksResults.flatMap(result => {
      if (!result.toptracks?.track) return [];
      return result.toptracks.track
        .slice(0, 1)
        .map(track => ({
          name: track.name,
          artist: track.artist.name,
        }));
    });
  }

  private async getSimilarTracksForSelection(tracks: TrackWithArtist[]): Promise<SimilarTrackInfo[]> {
    const promises = tracks.map(track =>
      this.asyncOperation.execute<lastFmTypes.LastFMTrackGetSimilarResponse>(
        async () => await this.api.recommendations.getSimilarTracks(track.artist, track.track)
      )
    );

    const results = await Promise.all(promises);

    return results.filter(({ data }) => data && data.similartracks.track.length > 0)
      .flatMap(item => {
        if (!item.data) return [];
        return shuffleArray(item.data.similartracks.track)
          .slice(0, this.CONFIG.SIMILAR_TRACKS_PER_ITEM)
          .map(track => ({
            name: track.name,
            artist: track.artist.name,
          }))
      });
  }

  private async getSimilarTracksByGenre() {
    const promises = shuffleArray(this.listenGenres.slice(0, 20)).map(genre =>
      this.asyncOperation.execute(
        async () => await this.api.recommendations.getSimilarTracksByGenre(genre)
      )
    );

    const results = await Promise.all(promises.slice(0, 20));

    return results.filter(({ data }) => data && data.tracks.track.length > 0)
      .flatMap(item => {
        if (!item.data) return [];
        return shuffleArray(item.data.tracks.track)
          .slice(0, 10)
          .map(track => ({
            name: track.name,
            artist: track.artist.name,
          }))
      });
  }

  private async searchAndFilterTracks(tracksInfo: Array<{ name: string; artist: string }>) {
    const searchPromises = tracksInfo.map(track => {
      const query = `track:${track.name} artist:${track.artist}`;
      return this.asyncOperation.execute(
        async () => await this.api.search.search(query, { type: ["track"] })
      );
    });

    const searchResults = await Promise.all(searchPromises);
    const mixedTracks: Track[] = [];
    const artistCount: Record<string, number> = {};

    for (const data of searchResults) {
      const result = data.data;
      if (result?.tracks?.items) {
        const filteredTracks = result.tracks.items.filter(track => {
          const artistId = track.artists[0].id;
          const currentCount = artistCount[artistId] || 0;
          if (currentCount < 2) {
            artistCount[artistId] = currentCount + 1;
            return true;
          }
          return false;
        });
        mixedTracks.push(...filteredTracks);
      }
    }

    return shuffleArray(mixedTracks).slice(0, 100);
  }

  private calculateCountListenGenres() {
    const unsortedGenres: Record<string, number> = {};

    for (const genre of this.listenGenres) {
      unsortedGenres[genre] = (unsortedGenres[genre] || 0) + 1;
    }

    const sortedEntries = Object.entries(unsortedGenres).sort(
      ([, countA], [, countB]) => countB - countA,
    );

    this.updateFavoriteListenedGenres(Object.fromEntries(sortedEntries));
  }

  private calculateFavoritesListenedArtists() {
    const favoritesListenedArtists = this.favoritesTracks.reduce((acc, track) => {
      for (const artist of track.artists) {
        acc.set(artist.id, {
          count: (acc.get(artist.id)?.count || 0) + 1,
          name: artist.name,
          image: this.favoriteArtists.get(artist.name)?.images?.[2]?.url || "",
          id: artist.id,
        });
      }
      return acc;
    }, new Map<string, { count: number; name: string; image: string; id: string }>());

    const sortedEntries = Array.from(favoritesListenedArtists.entries()).sort(
      ([, a], [, b]) => b.count - a.count,
    );

    this.updateFavoritesListenedArtists(
      sortedEntries.map(([, data]) => ({
        name: data.name,
        image: data.image,
        id: data.id,
      })),
    );
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
      async () => await this.api.tracks.getAllSavedTracks(),
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
    const chunks = chunkArray(artistIds, 50);

    const promises = chunks.map(chunk =>
      this.asyncOperation.execute(
        async () => await this.api.artist.getSeveralArtists(chunk)
      )
    );

    const results = await Promise.all(promises);

    for (const { data: artists } of results) {
      if (artists) {
        const genres = this.listenGenres.concat(artists.flatMap(artist => artist.genres));
        this.updateListenGenres(genres);

        for (const artist of artists) {
          this.updateFavoriteArtists(artist);
        }
      }
    }
  }
}
