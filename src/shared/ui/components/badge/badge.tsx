import type { ReactNode } from "react";
import clsx from "clsx";

import styles from "./badge.module.css";

type BadgeProps = {
	children: ReactNode;
	color?: "primary" | "secondary" | "tertiary" | "dark";
};

export const Badge = ({ children, color = "primary", }: BadgeProps) => {
	return (
		<div className={clsx(styles.badge, styles[`badge--${color}`])}>
			{children}
		</div>
	);
};
