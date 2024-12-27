import { inject, injectable } from "inversify";
import { makeAutoObservable, reaction } from "mobx";
import type { Artist, Track } from "spotify-types";
import type { IService } from "~/config/service.interface";
import { type UserService, UserServiceContainerToken } from "~/services/user";
import type { lastFmTypes } from "~/shared/api";
import { ArtistApi, PlaylistsApi, RecommendationsApi, TracksApi } from "~/shared/api";
import { SearchApi } from "~/shared/api/modules/search";
import { AsyncOperation, LocalStorageCacheStrategy } from "~/shared/factories/async-operation";
import { chunkArray, shuffleArray } from "~/shared/lib/collection";
import type { LoaderProcessor } from "~/shared/lib/loader-processor";
import { LoaderProcessorDIToken } from "~/shared/lib/loader-processor";

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
	private localStorageStorage: LocalStorageCacheStrategy;

	private readonly CONFIG = {
		RANDOM_TRACKS_COUNT: 20,
		SIMILAR_TRACKS_PER_ITEM: 3,
		MAX_TRACKS_PER_ARTIST: 2,
		MAX_PLAYLIST_SIZE: 100,
	} as const;

	private readonly CACHE_KEYS = {
		ARTIST_GENRES: "artist-genres",
		FAVORITE_TRACKS: "favorite-tracks",
	} as const;

	constructor(
		@inject(ArtistApi) private artistApi: ArtistApi,
		@inject(TracksApi) private tracksApi: TracksApi,
		@inject(RecommendationsApi) private recommendationsApi: RecommendationsApi,
		@inject(SearchApi) private searchApi: SearchApi,
		@inject(PlaylistsApi) private playlistsApi: PlaylistsApi,
		@inject(UserServiceContainerToken.UserService) private userService: UserService,
		@inject(LoaderProcessorDIToken) private loaderProcessor: LoaderProcessor,
	) {
		makeAutoObservable(this);
		this.asyncOperation = new AsyncOperation();
		this.localStorageStorage = new LocalStorageCacheStrategy();

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
		this.loaderProcessor.setIsLoading(true);
		this.loaderProcessor.setLoadingStatus("Discovering your musical universe...");
		try {
			await this.fetchFavoritesTracks();
			this.saveUniqueArtistsFromFavoritesTracks();
			this.loaderProcessor.setLoadingStatus("Exploring the genres you love...");
			await this.fetchArtistGenres();
		} catch (error) {
			console.error("Error initializing mix genres service:", error);
			this.loaderProcessor.setLoadingStatus("Oops! Something went wrong while exploring your music...");
			throw error;
		} finally {
			this.loaderProcessor.setLoadingStatus("");
			this.loaderProcessor.setIsLoading(false);
		}
	}

	async createMixPlaylist(playlistConfig: {
		name: string;
		description: string;
	}) {
		try {
			const lastAddedTracks = this.getRandomTracksFromFavorites(this.CONFIG.RANDOM_TRACKS_COUNT);
			if (!lastAddedTracks.length) {
				console.error("No tracks found in favorites");
				return;
			}

			const similarTracks = await this.getSimilarTracksForSelection(lastAddedTracks);
			if (!similarTracks.length) {
				console.error("No similar tracks found");
				return;
			}

			const trackUris = await this.searchAndFilterTracks(similarTracks);
			if (!trackUris.length) {
				console.error("No track URIs found after search");
				return;
			}

			await this.createAndFillPlaylist(trackUris, playlistConfig);
		} catch (error) {
			console.error("Error creating mix playlist:", error);
			throw error;
		}
	}

	private getRandomTracksFromFavorites(count: number): TrackWithArtist[] {
		const shuffledTracks = this.mapFavoriteTracksWithArtist.sort(() => 0.5 - Math.random());
		return shuffledTracks.slice(0, count);
	}

	private async getSimilarTracksForSelection(
		tracks: TrackWithArtist[],
	): Promise<SimilarTrackInfo[]> {
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
			item.similartracks.track.slice(0, this.CONFIG.SIMILAR_TRACKS_PER_ITEM).map((track) => ({
				name: track.name,
				artist: track.artist.name,
			})),
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
							const filteredTracks = data.tracks.items.filter((track) => {
								const artistId = track.artists[0].id;
								const currentCount = artistCount[artistId] || 0;

								if (currentCount < 2) {
									artistCount[artistId] = currentCount + 1;
									return true;
								}
								return false;
							});

							trackUrls.push(...filteredTracks.map((track) => track.uri));
						}
					},
				},
			);
		}

		return shuffleArray(trackUrls).slice(0, 100);
	}

	private async createAndFillPlaylist(
		trackUris: string[],
		playlistConfig: {
			name: string;
			description: string;
		},
	) {
		const userId = this.userService.user?.id;
		if (!userId) return;

		const createdPlaylist = await this.playlistsApi.createPlaylist(
			userId,
			playlistConfig.name,
			playlistConfig.description,
			true,
		);

		await this.playlistsApi.addTracksToPlaylist(createdPlaylist.id, trackUris);
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
		const chunks = chunkArray(artistIds, 50);

		for (const chunk of chunks) {
			await this.asyncOperation.execute(async () => await this.artistApi.getSeveralArtists(chunk), {
				onSuccess: (artists) => {
					if (artists) {
						const genres = this.listenGenres.concat(artists.flatMap((artist) => artist.genres));

						this.updateListenGenres(genres);

						for (const artist of artists) {
							this.updateFavoriteArtists(artist);
						}
					}
				},
			});
		}
	}
}
