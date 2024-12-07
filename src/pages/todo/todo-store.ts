import { injectable } from "inversify";
import { makeAutoObservable } from "mobx";
import type { IService } from "../../config/service.interface.ts";
import { AsyncOperation } from "../../shared/factories/async-operation.factory.ts";


export interface ITodoStore {
  todos: string[];
  todoList: string[];
  currentTodo: Todo | null;
  addTodo(todo: string): void;
  removeTodo(index: number): void;
  updateTodo(index: number, newText: string): void;
  deleteTodo(index: number): void;
  fetchTodoById(id: number): void;
  clearCurrentTodo(): void;
  cleanup(): void;
}

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

@injectable()
export class TodoStore implements ITodoStore, IService {
  todos: string[] = [];
  todoList: string[] = [];
  currentTodo: Todo | null = null;
  
  private asyncOperation: AsyncOperation;

  constructor() {
    makeAutoObservable(this);
    this.asyncOperation = new AsyncOperation();
  }

  addTodo = (todo: string) => {
    this.todos.push(todo);
  };

  removeTodo = (index: number) => {
    this.todos.splice(index, 1);
  };

  updateTodo = (index: number, todo: string) => {
    this.todos[index] = todo;
  };

  deleteTodo = (index: number) => {
    this.todos.splice(index, 1);
  };

  async initialize(): Promise<void> {
    const result = await this.asyncOperation.execute<Todo[]>(
      async () => {
        const response = await fetch("https://jsonplaceholder.typicode.com/todos");
        return response.json();
      },
      {
        cache: {
          cacheKey: 'todo-list',
          ttl: 5 * 60 * 1000,
        }
      }
    );
    if (result.data) {
      this.todoList = result.data.map(todo => todo.title);
    }
  }

  async fetchTodoById(id: number) {
    const result = await this.asyncOperation.execute<Todo>(
      async () => {
        const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`);
        return response.json();
      },
      {
        cache: {
          cacheKey: `todo-${id}`,
          ttl: 5 * 60 * 1000,
        }
      }
    );

    this.currentTodo = result.data;
  }

  clearCurrentTodo(): void {
    this.currentTodo = null;
  }

  async cleanup(): Promise<void> {
    this.clearCurrentTodo();
    this.todoList = [];
    this.todos = [];
  }
}
