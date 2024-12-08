import { inject, injectable } from "inversify";
import { RouterService } from "~/config";
import type { IService } from "~/config/service.interface";
import { AuthApi } from "~/shared/api";
import type { AuthorizationResponse } from "~/shared/api/modules/auth/types";
import { UserApi } from "~/shared/api/modules/user/user.api";
import { AUTH_STORAGE_KEY } from "~/shared/constants";
import {
	AsyncOperation,
	type CacheStrategy,
	LocalStorageCacheStrategy,
} from "~/shared/factories/async-operation";

export const AuthContainerToken = {
	AuthService: Symbol.for("AuthService"),
};

@injectable()
export class AuthService implements IService {
	private readonly asyncOperation: AsyncOperation;
	private readonly storage: CacheStrategy;

	constructor(
		@inject(AuthApi) private readonly authApi: AuthApi,
		@inject(RouterService) private readonly routerService: RouterService,
		@inject(UserApi) private readonly userApi: UserApi,
	) {
		this.asyncOperation = new AsyncOperation();
		this.storage = new LocalStorageCacheStrategy();
	}

	async initialize(): Promise<void> {
		const authData = this.storage.get<AuthorizationResponse>(AUTH_STORAGE_KEY);

		if (authData?.access_token) {
			await this.refreshTokenIfNeeded(authData);
			// TODO refactoring to other service
			await this.userApi.getUser();
		}
	}

	private async refreshTokenIfNeeded(authData: AuthorizationResponse): Promise<void> {
		if (!authData.refresh_token) return;

		const result = await this.asyncOperation.execute(
			() => this.authApi.refreshToken(authData.refresh_token),
			{
				cache: {
					strategy: this.storage,
					key: AUTH_STORAGE_KEY,
					ttl: 3600 * 1000,
				},
			},
		);

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
					ttl: 3600 * 1000,
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
