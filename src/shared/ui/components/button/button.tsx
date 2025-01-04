import clsx from "clsx";
import type { ReactNode } from "react";

import { VinylLoader } from "../loader/vinyl-loader";
import styles from "./button.module.css";

type ButtonProps = {
	onClick: () => void;
	children: ReactNode;
	className?: string;
	variant?: "primary" | "secondary" | "dark";
	isLoading?: boolean;
	icon?: ReactNode;
	size?: "small" | "medium";
};

const renderButtonContent = (isLoading: boolean, icon: ReactNode, children: ReactNode, size: "small" | "medium" = "medium") => {
	if (isLoading) return <VinylLoader size={size} />;
	if (icon) return <>{icon} {children}</>;
	return children;
};

export const Button = ({
	onClick,
	children,
	className,
	variant = "primary",
	isLoading = false,
	icon,
	size = "medium",
}: ButtonProps) => {
	return (
		<button
			type="button"
			className={clsx(
				styles.button,
				className,
				styles[`button--${variant}`],
				styles[`button--${size}`],
			)}
			onClick={onClick}
			disabled={isLoading}
		>
			{renderButtonContent(isLoading, icon, children, size)}
		</button>
	);
};
