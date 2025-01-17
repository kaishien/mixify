import clsx from "clsx";
import { type ReactNode, createElement } from "react";
import styles from "./typography.module.css";

type TypographyProps = {
	children: ReactNode;
	weight?: "normal" | "bold";
	color?: "dark" | "light" | "gray";
	tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
	className?: string;
};

const validTag = (tag: string) => {
	return ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span"].includes(tag);
};

export const Typography = ({
	children,
	weight = "normal",
	color = "dark",
	tag,
	className,
}: TypographyProps) => {

	if (!validTag(tag)) {
		throw new Error("Invalid tag");
	}

	return createElement(
		tag,
		{
			className: clsx(
				styles.typography,
				styles[`typography--weight-${weight}`],
				styles[`typography--color-${color}`],
				styles[`typography--tag-${tag}`],
				className,
			),
		},
		children,
	);
};
