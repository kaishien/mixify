import type { Container } from "inversify";
import React, { type ReactNode } from "react";

export const IocContext = React.createContext<Container | null>(null);

export const IocProvider: React.FC<{ container: Container; children: ReactNode }> = ({
	container,
	children,
}) => {
	return <IocContext.Provider value={container}>{children}</IocContext.Provider>;
};
