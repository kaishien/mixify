import { config, HttpClientToken } from "~/config";
import { inject, injectable } from "inversify";
import type { HttpClient } from "~/config";
import type { LastFMTrackGetSimilarResponse } from "../../types/lastfm.types";

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
				format: 'json'
			}
		});

		return response;
	}
}