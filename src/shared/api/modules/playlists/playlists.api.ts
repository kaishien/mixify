import type { HttpClient } from "~/config";

import { HttpClientToken } from "~/config";

import { inject, injectable } from "inversify";
import type { Playlist } from "spotify-types";

@injectable()
export class PlaylistsApi {
	constructor(@inject(HttpClientToken.Base) private baseClient: HttpClient) {}

	async getPlaylists(): Promise<Playlist[]> {
		return this.baseClient.get("/v1/me/playlists");
	} 
}
  