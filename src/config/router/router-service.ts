import { history } from './history'
import { injectable } from "inversify";
import type { To } from "history";

export interface IRouterService {
  push(to: To, state?: any): void;
  replace(to: To, state?: any): void;
  goBack(): void;
  goForward(): void;
}

@injectable()
export class RouterService implements IRouterService {
  get location() {
    return history.location;
  }

  push(to: To, state?: any) {
    history.push(to, state);
  }

  replace(to: To, state?: any) {
    history.replace(to, state);
  }

  goBack() {
    history.back();
  }

  goForward() {
    history.forward();
  }
}
