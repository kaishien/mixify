import React, { type ReactNode } from "react";
import { Container } from "inversify";

export const IocContext = React.createContext<Container | null>(null);

export const IocProvider: React.FC<{ container: Container, children: ReactNode }> = ({ container, children }) => {
  return <IocContext.Provider value={container}>{children}</IocContext.Provider>;
};
