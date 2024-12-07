import { useContext } from "react";
import { IocContext } from "./ioc-context";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type AbstractConstructor<T> = abstract new (...args: any[]) => T;

export const useInjection = <T>(key: AbstractConstructor<T> | symbol | string): T => {
	const container = useContext(IocContext);

	if (!container) {
		throw new Error("IocContext is not available. Make sure you are using IocProvider.");
	}

	return container.get<T>(key);
};
