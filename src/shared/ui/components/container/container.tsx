import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./container.module.css";

type ContainerProps = {
	children: ReactNode;
	className?: string;
};

export const Container = ({ children, className }: ContainerProps) => {
	return <div className={clsx(styles.container, className)}>{children}</div>;
};

