import { makeAutoObservable } from "mobx";

export class StateToggler {
  private isToggled = false;

  constructor() {
    makeAutoObservable(this);
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
