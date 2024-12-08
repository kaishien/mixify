import { inject, injectable } from "inversify";
import { makeAutoObservable } from "mobx";
import type { PrivateUser } from "spotify-types";
import type { IService } from "~/config/service.interface";
import { UserApi } from "~/shared/api";
import { AsyncOperation } from "~/shared/factories/async-operation";

export const UserServiceContainerToken = {
	UserService: Symbol.for("UserService"),
};

@injectable()
export class UserService implements IService {
	user: PrivateUser | null = null;
	private asyncOperation: AsyncOperation;

	constructor(@inject(UserApi) private readonly userApi: UserApi) {
		makeAutoObservable(this);
		this.asyncOperation = new AsyncOperation();
	}

	async loadUserData(): Promise<void> {
		const result = await this.asyncOperation.execute(async () => await this.userApi.getUser());

		if (result.isSuccess) {
			this.user = result.data;
		}
	}

	async initialize(): Promise<void> {}
}
