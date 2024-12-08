import { Container } from "inversify";
import { HttpClient, HttpClientToken, config } from "~/config";
import { RouterService } from "~/config/router/router-service";
import { AuthContainerToken, AuthService } from "~/pages/home/auth-service";
import { AuthApi } from "~/shared/api";
import { UserApi } from "~/shared/api/modules/user";

const container = new Container();

container.bind(RouterService).to(RouterService).inSingletonScope();

container
	.bind<HttpClient>(HttpClientToken.Base)
	.toDynamicValue(() => new HttpClient(config.baseApiUrl))
	.inSingletonScope();

container
	.bind<HttpClient>(HttpClientToken.Account)
	.toDynamicValue(() => new HttpClient(config.accountApiUrl))
	.inSingletonScope();

container.bind(AuthApi).to(AuthApi).inSingletonScope();
container.bind(UserApi).to(UserApi).inSingletonScope();
container.bind(AuthContainerToken.AuthService).to(AuthService).inSingletonScope();

export { container };
