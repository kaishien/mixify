import type { ReactNode } from "react";

import styles from "./button.module.css";

type ButtonIconProps = {
	icon: ReactNode;
	onClick: () => void;
};

export const ButtonIcon = ({ icon, onClick }: ButtonIconProps) => {
	return (
		<button onClick={onClick} className={styles.buttonIcon} type="button">
			{icon}
		</button>
	);
};
