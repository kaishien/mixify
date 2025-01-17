import { inject, injectable } from "inversify";
import { makeAutoObservable, reaction } from "mobx";
import type { Artist, Track } from "spotify-types";
import type { IService } from "~/config/service.interface";
import { Api } from "~/shared/api";
import { AsyncOperation } from "~/shared/factories/async-operation";
import { chunkArray, shuffleArray } from "~/shared/lib/collection";
import { LoaderProcessor } from "~/shared/lib/loader-processor";
import type { MixedPlaylistService } from "./mixed-playlist.service";
import { MixedPlaylistServiceContainerToken } from "./mixed-playlist.service";

export const MixGenresServiceContainerToken = Symbol("MixGenresService");

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

interface LastFMArtist {
  name: string;
  match: string | number;
  mbid?: string;
  url?: string;
  image?: Array<{ '#text': string; size: string }>;
  streamable?: string | number;
}

interface LastFMResponse {
  similarartists?: {
    artist: LastFMArtist[];
  };
  toptracks?: {
    track: Array<{
      name: string;
      "@attr": { rank: string };
    }>;
  };
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

  constructor(
    @inject(Api) private api: Api,
    @inject(MixedPlaylistServiceContainerToken) private mixedPlaylistService: MixedPlaylistService,
  ) {
    makeAutoObservable(this);

    this.asyncOperation = new AsyncOperation();

    reaction(
      () => this.listenGenres.slice(),
      (genres) => {
        if (genres.length > 0) {
          this.calculateCountListenGenres();
          this.calculateFavoritesListenedArtists();
        }
      },
      { fireImmediately: false }
    );
  }

  private updateListenGenres(listenGenres: string[]) {
    if (JSON.stringify(this.listenGenres) === JSON.stringify(listenGenres)) return;
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
    if (this.mixifyLoadingData.isLoading) return;
    this.mixifyLoadingData.setIsLoading(true);
    this.mixedPlaylistService.updateMixedPlaylist([]);

    try {
      const similarTracks = await this.findSimilarTracks();
      if (!similarTracks.length) {
        console.error("No similar tracks found");
        return;
      }

      const mixedTracks = await this.searchTracksInSpotify(similarTracks);
      if (!mixedTracks.length) {
        console.error("No track URIs found after search");
        return;
      }

      this.mixedPlaylistService.updateMixedPlaylist(mixedTracks);
    } catch (error) {
      console.error("Error creating mix playlist:", error);
    } finally {
      this.mixifyLoadingData.setIsLoading(false);
    }
  }

  private async findSimilarTracks(): Promise<SimilarTrackInfo[]> {
    const selectedGenres = this.selectGenresForMix();
    const genreResults = await this.processGenres(selectedGenres);
    return this.combineGenreResults(genreResults);
  }

  private selectGenresForMix() {
    const sortedGenres = Object.entries(this.favoriteListenedGenres)
      .sort(([, countA], [, countB]) => countB - countA);

    const topGenres = shuffleArray(sortedGenres.slice(0, 20)).slice(0, 12);
    const randomGenres = shuffleArray(sortedGenres.slice(20)).slice(0, 6);

    return [...topGenres, ...randomGenres];
  }

  private async processGenres(genreCounts: Array<[string, number]>) {
    const processedArtists = new Set<string>();
    const allRequests = genreCounts.map(([genre, count]) =>
      this.processGenre(genre, count, processedArtists)
    );

    return await Promise.all(allRequests);
  }

  private async processGenre(genre: string, count: number, processedArtists: Set<string>) {
    const genreArtists = this.selectArtistsForGenre(genre);
    if (!genreArtists.length) return { genre, tracks: [] };

    const similarArtists = await this.findSimilarArtists(genreArtists, processedArtists);
    const tracks = await this.getTopTracksForArtists(similarArtists);

    const tracksNeeded = Math.max(8, Math.round((count / this.getMaxGenreCount()) * 15));
    return { genre, tracks: shuffleArray(tracks).slice(0, tracksNeeded) };
  }

  private selectArtistsForGenre(genre: string) {
    return shuffleArray(
      Array.from(this.favoriteArtists.values())
        .filter(artist => artist.genres?.includes(genre))
    ).slice(0, 3);
  }

  private async findSimilarArtists(artists: Artist[], processedArtists: Set<string>) {
    const similarArtistsPromises = artists.map(artist =>
      this.api.recommendations.getSimilarArtists(artist.name)
    );

    const results = await Promise.all(similarArtistsPromises);
    return this.filterSimilarArtists(results, processedArtists);
  }

  private filterSimilarArtists(results: LastFMResponse[], processedArtists: Set<string>) {
    const highMatchArtists = new Set<string>();
    const MIN_MATCH_SCORE = 0.75;
    const MAX_ARTISTS_COUNT = 5;

    for (const result of results) {
      if (!result?.similarartists?.artist) continue;

      const matchingArtists = result.similarartists.artist
        .filter(artist => {
          const matchScore = Number(artist.match);
          return matchScore >= MIN_MATCH_SCORE && !processedArtists.has(artist.name);
        })


      for (const artist of shuffleArray(matchingArtists).slice(0, MAX_ARTISTS_COUNT)) {
        highMatchArtists.add(artist.name);
        processedArtists.add(artist.name);
      }
    }

    return highMatchArtists;
  }

  private async getTopTracksForArtists(artists: Set<string>) {
    const topTracksPromises = Array.from(artists).map(artist =>
      this.api.recommendations.getTopArtistsTracks(artist)
    );

    const results = await Promise.all(topTracksPromises);
    return this.processTopTracks(results, artists);
  }

  private processTopTracks(results: LastFMResponse[], artists: Set<string>) {
    const tracks: SimilarTrackInfo[] = [];

    results.forEach((topTracks, index) => {
      if (!topTracks?.toptracks?.track) return;

      const artistName = Array.from(artists)[index];
      const artistTracks = this.selectTopTracksForArtist(topTracks, artistName);
      tracks.push(...artistTracks);
    });

    return tracks;
  }

  private selectTopTracksForArtist(topTracks: LastFMResponse, artistName: string) {
    if (!topTracks.toptracks?.track) return [];

    return shuffleArray(
      topTracks.toptracks.track
        .filter(track => {
          const rank = Number(track["@attr"].rank);
          return rank >= 1 && rank <= 10;
        })
    )
      .slice(0, 2)
      .map(track => ({
        name: track.name,
        artist: artistName
      }));
  }

  private getMaxGenreCount() {
    return Math.max(...Object.values(this.favoriteListenedGenres));
  }

  private async searchTracksInSpotify(tracksInfo: Array<{ name: string; artist: string }>) {
    const allMixedTracks: Track[] = [];
    const artistCount: Record<string, number> = {};
    const trackSet = new Set<string>();

    const chunks = chunkArray(tracksInfo, 20);

    for (const chunk of chunks) {
      const searchPromises = chunk.map(track => {
        const cleanTrackName = track.name.replace(/[^\w\s]/g, '').trim();
        const cleanArtistName = track.artist.replace(/[^\w\s]/g, '').trim();
        const query = `${cleanTrackName} ${cleanArtistName}`;

        return this.asyncOperation.execute(
          async () => await this.api.search.search(query, {
            type: ["track"],
            limit: 20
          })
        );
      });

      const searchResults = await Promise.all(searchPromises);

      for (const [index, data] of searchResults.entries()) {
        const result = data.data;
        const originalTrack = chunk[index];

        if (!result?.tracks?.items?.length) continue;

        const matches = result.tracks.items
          .filter(track => {
            const trackKey = `${track.name}:${track.artists[0].name}`.toLowerCase();
            return !trackSet.has(trackKey) &&
              track.artists[0].name.toLowerCase().includes(originalTrack.artist.toLowerCase());
          })
          .slice(0, 2);

        for (const match of matches) {
          const artistId = match.artists[0].id;
          const currentCount = artistCount[artistId] || 0;

          if (currentCount < 5) {
            const trackKey = `${match.name}:${match.artists[0].name}`.toLowerCase();
            if (!trackSet.has(trackKey)) {
              trackSet.add(trackKey);
              artistCount[artistId] = currentCount + 1;
              allMixedTracks.push(match);
            }
          }
        }
      }
    }

    return shuffleArray(allMixedTracks).slice(0, 100);
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

  private combineGenreResults(results: Array<{ genre: string; tracks: SimilarTrackInfo[] }>): SimilarTrackInfo[] {
    const allTracks: SimilarTrackInfo[] = [];
    let continueAdding = true;

    while (continueAdding) {
      continueAdding = false;
      for (const { tracks } of results) {
        if (tracks.length > 0) {
          const track = tracks.pop();
          if (track) {
            allTracks.push(track);
            continueAdding = true;
          }
        }
      }
    }

    return shuffleArray(allTracks);
  }
}
