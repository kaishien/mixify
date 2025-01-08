import { inject, injectable } from "inversify";
import type { HttpClient } from "~/config";
import { HttpClientToken, config } from "~/config";
import type { LastFMArtistGetSimilarResponse, LastFMArtistGetTopTracksResponse, LastFMGeoGetTopTracksResponse, LastFMTrackGetSimilarResponse } from "../../types/lastfm.types";

@injectable()
export class RecommendationsApi {
	constructor(@inject(HttpClientToken.LastFmBase) private lastFmClient: HttpClient) {}

	async getSimilarTracks(artist: string, track: string) {
		const response = await this.lastFmClient.get<LastFMTrackGetSimilarResponse>('/', {
			params: {
				method: 'track.getsimilar',
				artist,
				track,
				api_key: config.lastFmApiKey,
				format: 'json',
				autocorrect: 1
			}
		});

		return response;
	}

	async getSimilarArtists(artist: string) {
		const response = await this.lastFmClient.get<LastFMArtistGetSimilarResponse>('/', {
			params: {
				method: 'artist.getsimilar',
				artist,
				api_key: config.lastFmApiKey,
				format: 'json',
				autocorrect: 1
			}
		});

		return response;
	}

	async getTopArtistsTracks(artist: string) {
		const response = await this.lastFmClient.get<LastFMArtistGetTopTracksResponse>('/', {
			params: {
				method: 'artist.gettoptracks',
				artist,
				api_key: config.lastFmApiKey,
				format: 'json'
			}
		});

		return response;
	}

	async getSimilarTracksByGenre(genre: string) {
		const response = await this.lastFmClient.get<LastFMGeoGetTopTracksResponse>('/', {
			params: {
				method: 'tag.gettoptracks',
				tag: genre,
				api_key: config.lastFmApiKey,
				format: 'json'
			}
		});

		return response;
	}
}
