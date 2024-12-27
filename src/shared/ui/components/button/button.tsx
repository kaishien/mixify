import type { ReactNode } from "react";
import clsx from "clsx";

import styles from "./button.module.css";

type ButtonProps = {
	onClick: () => void;
	children: ReactNode;
	className?: string;
	variant?: "primary" | "secondary";
};

export const Button = ({ onClick, children, className, variant = "primary" }: ButtonProps) => {
	return (
		<button
			type="button"
			className={clsx(styles.button, className, styles[`button--${variant}`])}
			onClick={onClick}
		>
			{children}
		</button>
	);
};
