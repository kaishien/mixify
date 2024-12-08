import { CallbackPage } from "./auth/callback-page";
import { HomePage } from './home';

export const routes = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/callback',
    element: <CallbackPage />,
  },
];
