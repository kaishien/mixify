import { inject, injectable } from "inversify";
import { type HttpClient, HttpClientToken, config } from "~/config";
import { generateRandomString } from "../../../lib/generate-random-string";
import type { AuthorizationResponse, AuthorizeQueryParams } from "./types";

@injectable()
export class AuthApi {
	constructor(
		@inject(HttpClientToken.Account) private httpClient: HttpClient,
		@inject(HttpClientToken.Base) private baseClient: HttpClient,
	) {}

	async authorize(): Promise<void> {
		const state = generateRandomString(16);
		const scope = "user-read-private user-read-email";

		const params: AuthorizeQueryParams = {
			response_type: "code",
			client_id: config.clientId,
			scope,
			redirect_uri: config.authRedirectUri,
			state,
		};

		const queryString = new URLSearchParams(params).toString();
		window.location.href = `${config.accountApiUrl}/authorize?${queryString}`;
	}

	async getAccessTokenFromCode(code: string): Promise<AuthorizationResponse> {
		const formData = new URLSearchParams();
		formData.append("grant_type", "authorization_code");
		formData.append("code", code);
		formData.append("redirect_uri", config.authRedirectUri);

		const response = await this.httpClient.post<AuthorizationResponse>("/api/token", formData, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`,
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
				Authorization: `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`,
			},
		});
	}
}
