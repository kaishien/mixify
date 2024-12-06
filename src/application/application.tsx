import { IocProvider, container } from '../config'
import {
  Link, useRoutes,
} from "react-router-dom";
import { BrowserRouter } from '../config/router/browser-router.tsx'
import { history } from '../config/router/history.ts'
import { routes } from "../pages";

const Navigation = () => (
  <nav>
    <ul>
      <li>
        <Link to="/public">Home</Link>
      </li>
      <li>
        <Link to="/todo">Todo</Link>
      </li>
    </ul>
  </nav>
);

export const AppRoutes = () => useRoutes(routes);

export function Application() {
  return (
    <IocProvider container={container}>
      <BrowserRouter window={window} history={history} basename="/">
        <Navigation/>
        <AppRoutes/>
      </BrowserRouter>
    </IocProvider>
  )
}
