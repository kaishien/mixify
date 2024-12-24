import type { HttpClient } from "~/config";

import { HttpClientToken } from "~/config";

import { inject, injectable } from "inversify";
import type { Playlist } from "spotify-types";

@injectable()
export class PlaylistsApi {
	constructor(@inject(HttpClientToken.SpotifyBase) private baseClient: HttpClient) { }

	async getPlaylists(): Promise<Playlist[]> {
		return this.baseClient.get("/v1/me/playlists");
	}

	async createPlaylist(userId: string, name: string, description: string, isPublic = false): Promise<Playlist> {
		return this.baseClient.post<Playlist>(`/v1/users/${userId}/playlists`, {
			name,
			description,
			public: isPublic,
		});
	}

	async addTracksToPlaylist(playlistId: string, trackUris: string[]): Promise<void> {
		return this.baseClient.post(`/v1/playlists/${playlistId}/tracks`, {
			uris: trackUris,
		});
	}
}
