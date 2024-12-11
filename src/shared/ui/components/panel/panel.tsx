import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./panel.module.css";

type PanelProps = {
	children: ReactNode;
	className?: string;
};

export const Panel = ({ children, className }: PanelProps) => {
	return <div className={clsx(styles.panel, className)}>{children}</div>;
};
