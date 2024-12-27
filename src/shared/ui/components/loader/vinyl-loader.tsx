import styles from './vinyl-loader.module.css';

export const VinylLoader = () => {
	return (
		<div className={styles.container}>
			<div className={styles.vinyl}>
				<div className={styles.grooves} />
				<div className={styles.label} />
			</div>
		</div>
	);
};
