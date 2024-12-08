import { inject, injectable } from "inversify";
import type { PrivateUser } from "spotify-types";
import type { HttpClient } from "~/config";
import { HttpClientToken } from "~/config";

@injectable()
export class UserApi {
	constructor(@inject(HttpClientToken.Base) private baseClient: HttpClient) {}

	async getUser(): Promise<PrivateUser> {
		return this.baseClient.get("/v1/me");
	}
}
