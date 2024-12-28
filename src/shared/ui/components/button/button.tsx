import clsx from "clsx";
import type { ReactNode } from "react";

import { VinylLoader } from "../loader/vinyl-loader";
import styles from "./button.module.css";

type ButtonProps = {
	onClick: () => void;
	children: ReactNode;
	className?: string;
	variant?: "primary" | "secondary";
	isLoading?: boolean;
};

export const Button = ({ onClick, children, className, variant = "primary", isLoading = false }: ButtonProps) => {
	return (
		<button
			type="button"
			className={clsx(styles.button, className, styles[`button--${variant}`])}
			onClick={onClick}
			disabled={isLoading}
		>
			{isLoading ? <VinylLoader size="small" /> : children}
		</button>
	);
};
