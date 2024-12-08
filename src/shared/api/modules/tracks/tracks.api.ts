import type { HttpClient } from "~/config";

import { HttpClientToken } from "~/config";

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
	constructor(@inject(HttpClientToken.Base) private baseClient: HttpClient) {}

	async getSavedTracks(limit = 50, offset = 0) {
		const response = await this.baseClient.get<SpotifyTracksResponse>(
			`/v1/me/tracks?limit=${limit}&offset=${offset}`
		);
		return response.items.map(item => item.track);
	}

	async getAllSavedTracks(): Promise<Track[]> {
		const allTracks: Track[] = [];
    
		let offset = 0;
		const limit = 50;
		
		const response = await this.baseClient.get<SpotifyTracksResponse>(
			`/v1/me/tracks?limit=${limit}&offset=${offset}`
		);
		
		const totalTracks = response.total;
		
		while (offset < totalTracks) {
			const tracks = await this.getSavedTracks(limit, offset);
			allTracks.push(...tracks);
			offset += limit;
		}
  
		return allTracks;
	}
}
