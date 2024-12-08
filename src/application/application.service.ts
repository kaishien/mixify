import { inject, injectable } from "inversify";
import type { IService } from "~/config/service.interface";
import type { UserService } from "~/services/user";
import { UserServiceContainerToken } from "~/services/user";
import { AUTH_STORAGE_KEY } from "~/shared/constants";
import type { AuthorizationResponse } from "~/shared/api/modules/auth/types";
import { LocalStorageCacheStrategy } from "~/shared/factories/async-operation";
import type { CacheStrategy } from "~/shared/factories/async-operation";

@injectable()
export class ApplicationService implements IService {
	private storage: CacheStrategy;

	constructor(
		@inject(UserServiceContainerToken.UserService) private readonly userService: UserService,
	) {
		this.storage = new LocalStorageCacheStrategy();
	}

	async initialize(): Promise<void> {
		const authData = this.storage.get<AuthorizationResponse>(AUTH_STORAGE_KEY);

		if (authData?.access_token) {
			await this.userService.loadUserData();
		}
	}
}
