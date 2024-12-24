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

@injectable()
export class MixGenresService implements IService {
	favoritesTracks: Track[] = [];
	uniqueArtistsFromFavoritesTracks: Map<Artist["id"], Artist> = new Map();
	listenGenres: string[] = [];
	countListenGenres: Record<string, number> = {};
	genresArtists: Map<Artist["name"], Artist["genres"]> = new Map();

	private asyncOperation: AsyncOperation;
	private localStorageStorage: LocalStorageCacheStrategy;

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

	get mapFavoriteTracksWithArtist() {
		return this.favoritesTracks.map((track) => ({
			track: track.name,
			artist: track.artists.map((artist) => artist.name)[0],
			genres: this.genresArtists.get(track.artists.map((artist) => artist.name)[0]),
		}));
	}

	async initialize() {
		await this.fetchFavoritesTracks();
		this.saveUniqueArtistsFromFavoritesTracks();
		await this.fetchArtistGenres();
	}

	async createMixPlaylist() {
		const lastAddedTracks = this.mapFavoriteTracksWithArtist.slice(20, 30);
		const result: lastFmTypes.LastFMTrackGetSimilarResponse[] = [];

		for (const track of lastAddedTracks) {
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

		const tracksNames = result.flatMap((item) =>
			item.similartracks.track.slice(0, 3).map((track) => ({
				name: track.name,
				artist: track.artist.name,
			})),
		);

		if (!tracksNames.length) return;

		const trackUrls: string[] = [];

		for (const track of tracksNames) {
			const query = `track:${track.name} artist:${track.artist}`;

			await this.asyncOperation.execute(
				async () => await this.searchApi.search(query, { type: ["track"] }),
				{
					onSuccess: (data) => {
						if (data.tracks?.items) {
							trackUrls.push(...data.tracks.items.map((track) => track.uri));
						}
					},
				},
			);
		}

		const userId = this.userService.user?.id;
		if (!userId) return;

		const createdPlaylist = await this.playlistsApi.createPlaylist(
			userId,
			"Mix Genres",
			"Mix Genres",
			true,
		);

		await this.playlistsApi.addTracksToPlaylist(
			createdPlaylist.id,
			trackUrls,
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

		this.countListenGenres = Object.fromEntries(sortedEntries);
	}

	private saveUniqueArtistsFromFavoritesTracks() {
		if (this.favoritesTracks.length === 0) return;
		for (const track of this.favoritesTracks) {
			for (const artist of track.artists) {
				this.uniqueArtistsFromFavoritesTracks.set(artist.id, artist);
			}
		}
	}

	private async fetchFavoritesTracks() {
		const result = await this.asyncOperation.execute(
			async () => await this.tracksApi.getAllSavedTracks(),
			{
				onSuccess: (data) => {
					this.favoritesTracks = data;
				},
			},
		);

		return result;
	}

	private async fetchArtistGenres() {
		const cachedGenres = this.localStorageStorage.get<string[]>("artist-genres");

		// if (cachedGenres) {
		//   this.listenGenres = cachedGenres;
		//   return;
		// }

		const artistIds = Array.from(this.uniqueArtistsFromFavoritesTracks.keys());
		const chunks = [];

		for (let i = 0; i < artistIds.length; i += 50) {
			chunks.push(artistIds.slice(i, i + 50));
		}

		for (const chunk of chunks) {
			await this.asyncOperation.execute(async () => await this.artistApi.getSeveralArtists(chunk), {
				onSuccess: (artists) => {
					if (artists) {
						this.listenGenres = this.listenGenres.concat(
							artists.flatMap((artist) => artist.genres),
						);

						for (const artist of artists) {
							this.genresArtists.set(artist.name, artist.genres);
						}
					}
				},
			});
		}
	}
}
