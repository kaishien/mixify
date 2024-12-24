import { HttpClientToken } from "~/config";

import { inject } from "inversify";
import type { Artist } from "spotify-types";
import type { HttpClient } from "~/config";

export class ArtistApi {
	constructor(
		@inject(HttpClientToken.SpotifyBase) private httpClient: HttpClient,
	) {}

  async getArtist(id: string): Promise<Artist> {
    const response = await this.httpClient.get<Artist>(`/v1/artists/${id}`);
		return response;
	}

  async getSeveralArtists(ids: string[]): Promise<Artist[]> {
    const response = await this.httpClient.get<{artists: Artist[]}>(`/v1/artists?ids=${ids.join(",")}`);
		return response.artists;
  }
}
