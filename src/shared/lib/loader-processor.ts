import { makeAutoObservable } from "mobx";

export class LoaderProcessor {
  isLoading = false;
  loadingStatus = "";

  constructor() {
    makeAutoObservable(this);
  }

  setIsLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }

  setLoadingStatus<T extends string>(loadingStatus: T) {
    this.loadingStatus = loadingStatus;
  }
}
