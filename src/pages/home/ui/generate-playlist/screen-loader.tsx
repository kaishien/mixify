import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Typography, VinylLoader } from "~/shared/ui/components";

import styles from "./screen-loader.module.css";

export const ScreenLoader = () => {
	const containerVariants = {
		hidden: {
			opacity: 0,
			scale: 0.95,
		},
		visible: {
			opacity: 1,
			scale: 1,
			transition: {
				duration: 0.5,
				ease: "easeOut",
				when: "beforeChildren",
				staggerChildren: 0.15,
			},
		},
	};

	const vinylPositions = [
		{ x: -200, y: -200, scale: 0.7 },
		{ x: 100, y: -250, scale: 0.8 },
		{ x: 200, y: -200, scale: 0.7 },
		{ x: -250, y: 0, scale: 0.8 },
		{ x: 250, y: 0, scale: 0.8 },
		{ x: 0, y: 250, scale: 0.7 },
	];

	const [disks, setDisks] = useState<Array<{ id: number; position: number }>>([]);
	const [diskCounter, setDiskCounter] = useState(0);
	const [text, setText] = useState("");
	const fullText = "Creating your unique playlist...";

	useEffect(() => {
		const sequence = [0, 3, 1, 4, 2, 5];
		const addDisk = () => {
			const position = sequence[diskCounter % sequence.length];
			const newDisk = { id: diskCounter, position };

			setDisks(prev => [...prev, newDisk]);
			setDiskCounter(prev => prev + 1);

			setTimeout(() => {
				setDisks(prev => prev.filter(disk => disk.id !== newDisk.id));
			}, 6000);
		};

		const interval = setInterval(addDisk, 1200);
		return () => clearInterval(interval);
	}, [diskCounter]);

	useEffect(() => {
		let currentIndex = 0;
		const textInterval = setInterval(() => {
			if (currentIndex <= fullText.length) {
				setText(fullText.slice(0, currentIndex));
				currentIndex++;
			} else {
				clearInterval(textInterval);
			}
		}, 50);

		return () => clearInterval(textInterval);
	}, []);

	const vinylVariants = {
		hidden: (i: number) => ({
			opacity: 0,
			scale: vinylPositions[i].scale,
			x: vinylPositions[i].x,
			y: vinylPositions[i].y,
			rotate: -180,
		}),
		visible: {
			opacity: 1,
			scale: 1,
			x: 0,
			y: 0,
			rotate: 0,
			transition: {
				duration: 3,
				ease: [0.34, 1.56, 0.64, 1],
			},
		},
		spin: {
			rotate: 360,
			transition: {
				duration: 4,
				ease: "linear",
				repeat: Number.POSITIVE_INFINITY,
			}
		},
		exit: {
			opacity: 0,
			scale: 0,
			transition: {
				duration: 0.5
			}
		}
	};

	const centerVinylVariants = {
		hidden: {
			opacity: 0,
			scale: 0,
			rotate: -180
		},
		visible: {
			opacity: 1,
			scale: 1,
			rotate: 0,
			transition: {
				delay: 2,
				duration: 1.5,
				ease: "easeOut"
			}
		},
		spin: {
			rotate: 360,
			transition: {
				duration: 3,
				ease: "linear",
				repeat: Number.POSITIVE_INFINITY,
				delay: 3.5
			}
		}
	};

	const textVariants = {
		hidden: {
			opacity: 1,
		},
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.05,
			},
		},
	};

	const gradientVariants = {
		hidden: {
			opacity: 0,
			scale: 1.1,
			rotate: -180,
			backgroundPosition: "0% 50%"
		},
		visible: {
			opacity: 0.08,
			scale: 1,
			rotate: 0,
			backgroundPosition: "100% 50%",
			transition: {
				duration: 1,
				ease: "easeOut",
				backgroundPosition: {
					duration: 0,
				}
			}
		}
	};

	return (
		<motion.div
			className={styles.screenLoader}
			variants={containerVariants}
			initial="hidden"
			animate="visible"
		>
			<motion.div
				className={styles.screenLoader__gradient}
				variants={gradientVariants}
				animate={{
					rotate: 360,
					backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
				}}
				transition={{
					rotate: {
						duration: 20,
						ease: "linear",
						repeat: Number.POSITIVE_INFINITY,
					},
					backgroundPosition: {
						duration: 8,
						ease: "linear",
						repeat: Number.POSITIVE_INFINITY,
					}
				}}
			/>
			<div className={styles.screenLoader__content}>
				<div className={styles.screenLoader__vinyls}>
					<AnimatePresence>
						{disks.map(({ id, position }) => (
							<motion.div
								key={id}
								custom={position}
								className={styles.screenLoader__vinyl}
								variants={vinylVariants}
								initial="hidden"
								animate={["visible", "spin"]}
								exit="exit"
							>
								<VinylLoader size="large" />
							</motion.div>
						))}
					</AnimatePresence>
					<motion.div
						className={styles.screenLoader__vinylCenter}
						variants={centerVinylVariants}
						initial="hidden"
						animate={["visible", "spin"]}
					>
						<VinylLoader size="large" />
					</motion.div>
				</div>
				<motion.div
					className={styles.screenLoader__text}
					variants={textVariants}
				>
					<Typography tag="h1" className={styles.screenLoader__title}>
						{text}
						<motion.span
							className={styles.screenLoader__cursor}
							animate={{
								opacity: [1, 0],
							}}
							transition={{
								duration: 0.8,
								repeat: Number.POSITIVE_INFINITY,
								repeatType: "reverse",
							}}
						>
							|
						</motion.span>
					</Typography>
				</motion.div>
			</div>
		</motion.div>
	);
};