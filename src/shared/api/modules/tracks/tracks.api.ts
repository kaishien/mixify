import type { HttpClient } from "~/config";

import { $HttpClient } from "~/config";

import { inject, injectable } from "inversify";
import type { Track } from "spotify-types";

interface SpotifyTracksResponse {
	items: Array<{
		track: Track;
	}>;
	total: number;
}

@injectable()
export class TracksApi {
	constructor(@inject($HttpClient.SpotifyBase) private baseClient: HttpClient) { }

	async getSavedTracks(limit = 50, offset = 0) {
		const response = await this.baseClient.get<SpotifyTracksResponse>(
			`/v1/me/tracks?limit=${limit}&offset=${offset}`
		);
		return response.items.map(item => item.track);
	}

	async getAllSavedTracks(): Promise<Track[]> {
		const limit = 50;

		const initialResponse = await this.baseClient.get<SpotifyTracksResponse>(
			`/v1/me/tracks?limit=${limit}&offset=0`
		);

		const totalTracks = initialResponse.total;
		const totalPages = Math.ceil(totalTracks / limit);

		const promises = Array.from({ length: totalPages }, (_, index) =>
			this.getSavedTracks(limit, index * limit)
		);

		const results = await Promise.all(promises);

		return results.flat();
	}

	async saveTrackToFavorites(trackId: string) {
		return this.baseClient.put("/v1/me/tracks", {
			ids: [trackId],
		});
	}

	async removeTrackFromFavorites(trackId: string) {
		return this.baseClient.delete("/v1/me/tracks", {
			ids: [trackId],
		});
	}

	async checkIsFavorite(trackId: string) {
		return this.baseClient.get<boolean[]>(`/v1/me/tracks/contains?ids=${trackId}`);
	}
}
