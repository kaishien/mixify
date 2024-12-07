import { inject, injectable } from "inversify";
import { config, type HttpClient, HttpClientToken } from "~/config";
import type { AccessToken } from "spotify-types";

@injectable()
export class AuthApi {
	constructor(@inject(HttpClientToken.Account) private httpClient: HttpClient) {}

	getAccessToken = async (): Promise<AccessToken> => {
		const formData = new URLSearchParams();
		formData.append('grant_type', 'client_credentials');
		formData.append('client_id', config.clientId);
		formData.append('client_secret', config.clientSecret);

		return this.httpClient.post(
			"/api/token",
			formData,
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			},
		);
	};
}
