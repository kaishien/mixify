import { inject, injectable } from "inversify";
import { RouterService } from "~/config";
import type { IService } from "~/config/service.interface";
import { AuthApi, PlaylistsApi, TracksApi, UserApi } from "~/shared/api";
import type { AuthorizationResponse } from "~/shared/api/modules/auth/types";
import { AUTH_STORAGE_KEY } from "~/shared/constants";
import {
	AsyncOperation,
	type CacheStrategy,
	LocalStorageCacheStrategy,
} from "~/shared/factories/async-operation";

export const AuthServiceContainerToken = {
	AuthService: Symbol.for("AuthService"),
};

@injectable()
export class AuthService implements IService {
	private readonly asyncOperation: AsyncOperation;
	private readonly storage: CacheStrategy;

	constructor(
		@inject(AuthApi) private readonly authApi: AuthApi,
		@inject(RouterService) private readonly routerService: RouterService,
	) {
		this.asyncOperation = new AsyncOperation();
		this.storage = new LocalStorageCacheStrategy();
	}

	async initialize(): Promise<void> {}

	private async refreshTokenIfNeeded(authData: AuthorizationResponse): Promise<void> {
		if (!authData.refresh_token) return;
		const refreshToken = authData.refresh_token;

		const result = await this.asyncOperation.execute(
			async () => await this.authApi.refreshToken(refreshToken),
		);

		this.storage.set(AUTH_STORAGE_KEY, result.data, authData.expires_in * 1000);

		if (result.data?.refresh_token) {
			this.storage.set(AUTH_STORAGE_KEY, result.data, authData.expires_in * 1000);
		}

		if (!result.isSuccess) {
			this.storage.remove(AUTH_STORAGE_KEY);
			await this.authorize();
		}
	}

	async handleCallback(code: string): Promise<void> {
		const result = await this.asyncOperation.execute(
			() => this.authApi.getAccessTokenFromCode(code),
			{
				cache: {
					strategy: this.storage,
					key: AUTH_STORAGE_KEY,
					ttl: 24 * 60 * 60 * 1000,
				},
			},
		);

		if (result.isSuccess) {
			this.routerService.push("/");
		}
	}

	async authorize(): Promise<void> {
		await this.authApi.authorize();
	}

	logout(): void {
		this.storage.remove(AUTH_STORAGE_KEY);
		this.routerService.push("/login");
	}
}
