import { makeAutoObservable } from "mobx";

export class StateToggler {
  private isToggled = false;

  constructor(defaultState = false) {
    makeAutoObservable(this);
    this.set(defaultState);
  }

  toggle() {
    this.set(!this.isToggled);
  }

  get state() {
    return this.isToggled;
  }

  set(value: boolean) {
    this.isToggled = value;
  }
}
