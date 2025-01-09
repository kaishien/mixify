import { AnimatePresence, motion } from "framer-motion";

import styles from "./audio-vizualizer.module.css";

const bars = [0, 1, 2, 3, 4];

const getRandomHeight = () => 30 + Math.random() * 70;

type AudioVisualizerProps = {
	isPlaying: boolean;
}

export const AudioVisualizer = ({ isPlaying }: AudioVisualizerProps) => {
	return (
		<AnimatePresence>
			{isPlaying && (
				<motion.div 
					className={styles.playingAnimation}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
				>
					{bars.map((index) => (
						<motion.span
							key={index}
							animate={{
								height: [
									`${getRandomHeight()}%`,
									`${getRandomHeight()}%`,
									`${getRandomHeight()}%`,
								],
							}}
							transition={{
								duration: 0.8,
								repeat: Number.POSITIVE_INFINITY,
								ease: "linear",
								times: [0, 0.5, 1],
								delay: index * 0.1,
							}}
						/>
					))}
				</motion.div>
			)}
		</AnimatePresence>
	);
};
