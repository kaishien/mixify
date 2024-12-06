import "reflect-metadata";
import { describe, it, expect, beforeEach } from "vitest";
import { Container } from "inversify";
import { TodoContainerToken } from './todo-container-token.ts'
import { ITodoStore, TodoStore } from "./todo-store.ts";
import { AbstractLogger } from "../../shared/services/LoggerService.ts";

class MockLogger implements AbstractLogger {
  log(message: string): void {
    console.log(`[MockLogger]: ${message}`);
  }
}

const createTestContainer = (): Container => {
  const container = new Container();
  container.bind(TodoContainerToken.TodoStore).to(TodoStore).inTransientScope();
  container.bind(AbstractLogger).to(MockLogger).inSingletonScope();
  return container;
};

const addTodos = (store: ITodoStore, ...tasks: string[]) => {
  tasks.forEach((task) => store.addTodo(task));
};

describe("TodoStore", () => {
  let container: Container;
  let todoStore: ITodoStore;

  beforeEach(() => {
    container = createTestContainer();
    todoStore = container.get<ITodoStore>(TodoContainerToken.TodoStore);
  });

  it("should add todos correctly", () => {
    addTodos(todoStore, "Task 1", "Task 2");
    expect(todoStore.todos).toEqual(["Task 1", "Task 2"]);
  });

  it("should remove todos correctly", () => {
    todoStore.addTodo("Task 1");
    todoStore.addTodo("Task 2");
    todoStore.addTodo("Task 3");

    todoStore.removeTodo(1);

    expect(todoStore.todos).toEqual(["Task 1", "Task 3"]);
  });

  it("should handle removing non-existent todos gracefully", () => {
    expect(() => todoStore.removeTodo(0)).not.toThrow("Removing non-existent todo should not throw an error");
  });
});
