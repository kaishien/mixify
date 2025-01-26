import { inject, injectable } from "inversify";
import { makeAutoObservable, runInAction } from "mobx";
import type { PrivateUser } from "spotify-types";
import type { IService } from "~/config/service.interface";
import { Api } from "~/shared/api";
import { AsyncOperation } from "~/shared/factories/async-operation";

export const $UserService = Symbol.for("UserService");

@injectable()
export class UserService implements IService {
	user: PrivateUser | null = null;
	private asyncOperation: AsyncOperation;

	constructor(@inject(Api) private readonly api: Api) {
		makeAutoObservable(this, {}, { autoBind: true });
		this.asyncOperation = new AsyncOperation();
	}

	async loadUserData(): Promise<void> {
		const result = await this.asyncOperation.execute(async () => await this.api.user.getUser());

		if (result.isSuccess) {
			runInAction(() => {
				this.user = result.data;
			});
		}
	}

	async initialize(): Promise<void> { }
}
