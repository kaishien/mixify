import { Container } from "inversify";
import { config, HttpClient, HttpClientToken } from '~/config';
import { RouterService } from '~/config/router/router-service';
import { AuthContainerToken, AuthService } from "~/pages/home/auth-service";
import {
  type ITodoAnalyticsService,
  type ITodoStore,
  TodoAnalyticsService,
  TodoContainerToken,
  TodoStore
} from '~/pages/todo';
import { AuthApi } from "~/shared/api";

const container = new Container();

container.bind(RouterService).to(RouterService).inSingletonScope();

container.bind<HttpClient>(HttpClientToken.Base)
    .toDynamicValue(() => new HttpClient(config.baseApiUrl))
    .inSingletonScope();

container.bind<HttpClient>(HttpClientToken.Account)
    .toDynamicValue(() => new HttpClient(config.accountApiUrl))
    .inSingletonScope();

container.bind(AuthApi).to(AuthApi).inSingletonScope();
container.bind(AuthContainerToken.AuthService)
    .to(AuthService)
    .inSingletonScope();

container.bind<ITodoStore>(TodoContainerToken.TodoStore)
    .to(TodoStore)
    .inSingletonScope();

container.bind<ITodoAnalyticsService>(TodoContainerToken.AnalyticsTodoService)
    .toDynamicValue((context) => {
        const todoStore = context.container.get<ITodoStore>(TodoContainerToken.TodoStore);
        return new TodoAnalyticsService(todoStore);
    })
    .inTransientScope();

export { container };

