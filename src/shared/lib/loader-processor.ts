import { injectable } from "inversify";
import { makeAutoObservable } from "mobx";

export const LoaderProcessorDIToken = Symbol("LoaderProcessor");

@injectable()
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
