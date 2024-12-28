import clsx from 'clsx';
import styles from './vinyl-loader.module.css';

type VinylLoaderProps = {
	size?: "small" | "large";
};

export const VinylLoader = ({ size = "large" }: VinylLoaderProps) => {
	return (
		<div className={clsx(styles.container, styles[`container--${size}`])}>
			<div className={styles.vinyl}>
				<div className={styles.grooves} />
				<div className={styles.label} />
			</div>
		</div>
	);
};
