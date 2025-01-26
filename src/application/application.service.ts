import { inject, injectable } from "inversify";
import { RouterService } from "~/config";
import type { IService } from "~/config/service.interface";
import type { AuthService } from "~/services/auth";
import { $AuthService } from "~/services/auth";
import type { UserService } from "~/services/user";
import { $UserService } from "~/services/user";
import { Events, eventEmitter } from "~/shared/event-emmiter";

@injectable()
export class ApplicationService implements IService {
	constructor(
		@inject($UserService) private readonly userService: UserService,
		@inject(RouterService) private readonly routerService: RouterService,
		@inject($AuthService) private readonly authService: AuthService,
	) {
		eventEmitter.on(Events.AUTH_SUCCESS, () => {
			this.initialize();
		});
	}

	async initialize(): Promise<void> {
		const accessToken = this.authService.getToken();

		if (accessToken) {
			this.loadInitialData();
			return;
		}

		this.routerService.push("/login");
	}

	async loadInitialData(): Promise<void> {
		await this.userService.loadUserData();
	}
}
