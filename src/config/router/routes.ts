import { TodoPage } from "../../pages/todo/todo-page";
import { TodoDetailsPage } from "../../pages/todo/todo-details-page";

export const routes = [
  {
    path: "/",
    element: TodoPage
  },
  {
    path: "/todo/:id",
    element: TodoDetailsPage
  }
]; 