import { Container } from "inversify";
import { HttpClient, HttpClientToken, config } from "~/config";
import { RouterService } from "~/config/router/router-service";
import { AuthService, AuthServiceContainerToken } from "~/services/auth";
import { UserService, UserServiceContainerToken } from "~/services/user";
import { AuthApi, PlaylistsApi, TracksApi, UserApi } from "~/shared/api";
import { ApplicationService } from "./application.service";

const container = new Container();

container.bind(ApplicationService).to(ApplicationService).inSingletonScope();
container.bind(RouterService).to(RouterService).inSingletonScope();

container
	.bind<HttpClient>(HttpClientToken.Base)
	.toDynamicValue(() => new HttpClient(config.baseApiUrl))
	.inSingletonScope();

container
	.bind<HttpClient>(HttpClientToken.Account)
	.toDynamicValue(() => new HttpClient(config.accountApiUrl))
	.inSingletonScope();

const registryServices = () => {
	container.bind(AuthServiceContainerToken.AuthService).to(AuthService).inSingletonScope();
	container.bind(UserServiceContainerToken.UserService).to(UserService).inSingletonScope();
};

const registyApi = () => {
	container.bind(AuthApi).to(AuthApi).inSingletonScope();
	container.bind(UserApi).to(UserApi).inSingletonScope();
	container.bind(PlaylistsApi).to(PlaylistsApi).inSingletonScope();
	container.bind(TracksApi).to(TracksApi).inSingletonScope();
};

registyApi();
registryServices();

export { container };
