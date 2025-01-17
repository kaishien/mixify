import type { To } from "history";
import { injectable } from "inversify";
import { history } from "./history";

export interface IRouterService {
  push(to: To, state?: unknown): void;
  replace(to: To, state?: unknown): void;
  goBack(): void;
  goForward(): void;
}

@injectable()
export class RouterService implements IRouterService {
  get location() {
    return history.location;
  }

  push(to: To, state?: unknown) {
    history.push(to, state);
  }

  replace(to: To, state?: unknown) {
    history.replace(to, state);
  }

  goBack() {
    history.back();
  }

  goForward() {
    history.forward();
  }
}
