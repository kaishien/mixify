import { inject } from "inversify";

import { AuthApi } from "~/shared/api";

import { injectable } from "inversify";
import type { IService } from "~/config/service.interface";

export const AuthContainerToken = {
  AuthService: Symbol.for("AuthService"),
};

@injectable()
export class AuthService implements IService {
	constructor(@inject(AuthApi) private readonly authApi: AuthApi) {}

	async initialize(): Promise<void> {
		try {
			await this.authApi.getAccessToken();
		} catch (error) {
			console.error('Failed to initialize AuthService:', error);
		}
	}

	async cleanup(): Promise<void> {
		// TODO: Implement cleanup
	}
}
