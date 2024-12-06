import { lazy, Suspense } from "react";

import { HomePage } from './home'
import { TodoDetailsPage } from "./todo/todo-details-page";

const TodoPage = lazy(() => import("./todo").then((module) => ({ default: module.default })));

export const routes = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/todo',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <TodoPage />
      </Suspense>
    ),
  },
  {
    path: '/todo/:id',
    element: <TodoDetailsPage />,
  },
];
