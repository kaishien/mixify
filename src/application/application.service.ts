import { inject, injectable } from "inversify";
import { RouterService } from "~/config";
import type { IService } from "~/config/service.interface";
import type { UserService } from "~/services/user";
import { UserServiceContainerToken } from "~/services/user";
import type { AuthorizationResponse } from "~/shared/api/modules/auth/types";
import { AUTH_STORAGE_KEY } from "~/shared/constants";
import { Events, eventEmitter } from "~/shared/event-emmiter";
import type { CacheStrategy } from "~/shared/factories/async-operation";
import { LocalStorageCacheStrategy } from "~/shared/factories/async-operation";

@injectable()
export class ApplicationService implements IService {
	private storage: CacheStrategy;

	constructor(
		@inject(UserServiceContainerToken.UserService) private readonly userService: UserService,
		@inject(RouterService) private readonly routerService: RouterService,
	) {
		this.storage = new LocalStorageCacheStrategy();
		eventEmitter.on(Events.AUTH_SUCCESS, () => {
			this.initialize();
		});
	}

	async initialize(): Promise<void> {
		const authData = this.storage.get<AuthorizationResponse>(AUTH_STORAGE_KEY);

		if (authData?.access_token) {
			this.loadInitialData();
			return;
		}

		this.routerService.push("/login");
	}

	async loadInitialData(): Promise<void> {
		await this.userService.loadUserData();
	}
}
