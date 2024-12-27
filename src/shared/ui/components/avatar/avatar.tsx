import clsx from "clsx";
import styles from "./avatar.module.css";

type AvatarProps = {
	src: string;
	alt: string;
	size?: "small" | "medium" | "large";
	letter?: string;
};

export const Avatar = ({ src, alt, size = "medium", letter }: AvatarProps) => {
	if (src) {
		return <img src={src} alt={alt} className={clsx(styles.avatar, styles[`avatar--${size}`])} />;
	}

	return <div className={clsx(styles.avatarLetter, styles[`avatar--${size}`])}>{letter}</div>;
};
