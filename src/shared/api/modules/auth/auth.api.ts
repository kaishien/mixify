import { inject, injectable } from "inversify";
import { type HttpClient, HttpClientToken, config } from "~/config";
import { generateRandomString } from "../../../lib/generate-random-string";
import type { AuthorizationResponse, AuthorizeQueryParams } from "./types";

const scopes = {
	user: "user-read-private user-read-email user-library-read user-library-modify",
	library: "user-library-read user-library-modify",
	playlist: "playlist-read-private playlist-modify-private playlist-modify-public playlist-read-collaborative",
	streaming: "streaming",
	listeningHistory: "user-library-read user-library-modify",
};

@injectable()
export class AuthApi {
	constructor(
		@inject(HttpClientToken.SpotifyAccount) private httpClient: HttpClient,
		@inject(HttpClientToken.SpotifyBase) private baseClient: HttpClient,
	) {}

	async authorize(): Promise<void> {
		const state = generateRandomString(16);
		const uniqueScopes = new Set(Object.values(scopes));
		const scope = Array.from(uniqueScopes).join(" ");

		const params: AuthorizeQueryParams = {
			response_type: "code",
			client_id: config.spotifyClientId,
			scope,
			redirect_uri: config.spotifyAuthRedirectUri,
			state,
		};

		const queryString = new URLSearchParams(params).toString();
		window.location.href = `${config.spotifyAccountApiUrl}/authorize?${queryString}`;
	}

	async getAccessTokenFromCode(code: string): Promise<AuthorizationResponse> {
		const formData = new URLSearchParams();
		formData.append("grant_type", "authorization_code");
		formData.append("code", code);
		formData.append("redirect_uri", config.spotifyAuthRedirectUri);

		const response = await this.httpClient.post<AuthorizationResponse>("/api/token", formData, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${btoa(`${config.spotifyClientId}:${config.spotifyClientSecret}`)}`,
			},
		});

		this.baseClient.setAccessToken(response.access_token);

		return response;
	}

	async refreshToken(refreshToken: string): Promise<AuthorizationResponse> {
		const formData = new URLSearchParams();
		formData.append("grant_type", "refresh_token");
		formData.append("refresh_token", refreshToken);

		return this.httpClient.post<AuthorizationResponse>("/api/token", formData, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${btoa(`${config.spotifyClientId}:${config.spotifyClientSecret}`)}`,
			},
		});
	}
}
