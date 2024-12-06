import type { ITodoStore } from "./todo-store.ts";
import { injectable } from "inversify";
import { reaction } from "mobx";

export interface ITodoAnalyticsService {
  trackTodos(todos: string[]): void;
}

@injectable()
export class TodoAnalyticsService implements ITodoAnalyticsService {
  private readonly disposer: () => void;

  constructor(todoStore: ITodoStore) {
    console.log("[Analytics]: Initializing analytics service");
    console.log("[Analytics]: Initial todos", todoStore.todos);

    this.disposer = reaction(
      () => todoStore.todos.slice(),
      (todos) => {
        console.log("[Analytics]: todos changed", todos);
        this.trackTodos(todos);
      }
    );
  }

  trackTodos(todos: string[]): void {
    console.log("[Analytics]: Tracking todos", todos);
  }

  calledAddTodo() {
    console.log("[Analytics]: called addTodo");
  }

  cleanup() {
    if (this.disposer) {
      this.disposer();
    }
    console.log("[Analytics]: Cleanup resources");
  }
}
