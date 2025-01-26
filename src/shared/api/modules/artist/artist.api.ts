import { inject, injectable } from "inversify";
import type { Artist } from "spotify-types";
import type { HttpClient } from "~/config";
import { $HttpClient } from "~/config";

@injectable()
export class ArtistApi {
	constructor(
		@inject($HttpClient.SpotifyBase) private httpClient: HttpClient,
	) { }

	async getArtist(id: string): Promise<Artist> {
		const response = await this.httpClient.get<Artist>(`/v1/artists/${id}`);
		return response;
	}

	async getSeveralArtists(ids: string[]): Promise<Artist[]> {
		const response = await this.httpClient.get<{ artists: Artist[] }>(`/v1/artists?ids=${ids.join(",")}`);
		return response.artists;
	}
}
