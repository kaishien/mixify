import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./panel.module.css";

type PanelProps = {
	children: ReactNode;
	className?: string;
	padding?: "lg" | "md" | "sm";
};

export const Panel = ({ children, className, padding = "md" }: PanelProps) => {
	return <div className={clsx(styles.panel, className, styles[`panel--${padding}`])}>{children}</div>;
};
