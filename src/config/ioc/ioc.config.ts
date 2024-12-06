import { Container } from "inversify";
import {
  TodoStore,
  TodoContainerToken,
  type ITodoStore,
  type ITodoAnalyticsService,
  TodoAnalyticsService
} from '../../pages/todo/index.ts'
import { AbstractLogger, ConsoleLogger } from "../../shared/services/LoggerService.ts";
import { RouterService } from "../router/router-service.ts";

const container = new Container();

container.bind<ITodoStore>(TodoContainerToken.TodoStore).to(TodoStore).inSingletonScope();
container.bind(AbstractLogger).to(ConsoleLogger).inSingletonScope();
container.bind(RouterService).to(RouterService).inSingletonScope();

container.bind<ITodoAnalyticsService>(TodoContainerToken.AnalyticsTodoService).toDynamicValue((context) => {
  const todoStore = context.container.get<ITodoStore>(TodoContainerToken.TodoStore);
  return new TodoAnalyticsService(todoStore);
}).inTransientScope();

export { container }
