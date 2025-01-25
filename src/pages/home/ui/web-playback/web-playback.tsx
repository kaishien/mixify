import { useEffect, useRef, useState } from "react";

import clsx from "clsx";
import Heart from "~/shared/ui/assets/player-icons/heart.svg?react";
import Next from "~/shared/ui/assets/player-icons/next-track.svg?react";
import Pause from "~/shared/ui/assets/player-icons/pause.svg?react";
import Play from "~/shared/ui/assets/player-icons/play.svg?react";
import Prev from "~/shared/ui/assets/player-icons/prev-track.svg?react";
import Volume from "~/shared/ui/assets/player-icons/volume.svg?react";

import { observer } from "mobx-react-lite";
import { useInjection } from "~/config";
import { type AuthService, AuthServiceContainerToken } from "~/services/auth";
import type { MixedPlaylistService } from "../../service/mixed-playlist.service";
import { MixedPlaylistServiceContainerToken } from "../../service/mixed-playlist.service";
import styles from "./web-playback.module.scss";

const SPOTIFY_PLAYER_SCRIPT_URL = "https://sdk.scdn.co/spotify-player.js";

export const WebPlayback = observer(() => {
	const authService = useInjection<AuthService>(AuthServiceContainerToken.AuthService);
	const mixedPlaylistService = useInjection<MixedPlaylistService>(
		MixedPlaylistServiceContainerToken,
	);

	const playerService = mixedPlaylistService.playerService;

	const token = authService.getToken();

	const [progress, setProgress] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(50);
	const [isFavorite, setIsFavorite] = useState(false);

	const progressBarRef = useRef<HTMLInputElement>(null);
	const volumeRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const script = document.createElement("script");
		script.src = SPOTIFY_PLAYER_SCRIPT_URL;
		script.async = true;

		document.body.appendChild(script);

		window.onSpotifyWebPlaybackSDKReady = () => {
			const player = new window.Spotify.Player({
				name: "Mixify Web Player",
				getOAuthToken: (cb) => {
					cb(token);
				},
				volume: volume / 100,
			});

			playerService.setPlayerInstance(player);

			player.addListener("ready", ({ device_id }) => {
				mixedPlaylistService.updateDeviceId(device_id);
				playerService.playerReady.set(true);
				if (volumeRef.current) {
					volumeRef.current.style.setProperty('--volume-width', `${volume}%`);
				}
			});

			player.addListener("player_state_changed", (state) => {
				if (state) {
					playerService.setCurrentTrack(state.track_window.current_track);
					playerService.setIsPaused(state.paused);
					setProgress(state.position);
					setDuration(state.duration);
				}
			});

			// Обновление прогресса каждую секунду
			setInterval(() => {
				player.getCurrentState().then((state) => {
					if (state) {
						setProgress(state.position);
					}
				});
			}, 1000);

			player.connect();
		};

		return () => {
			playerService.playerInstance?.disconnect();
			script.remove();
		};
	}, [token]);

	useEffect(() => {
		if (progressBarRef.current) {
			const progressPercent = (progress / duration) * 100;
			progressBarRef.current.style.setProperty('--progress-width', `${progressPercent}%`);
		}
	}, [progress, duration]);

	useEffect(() => {
		if (volumeRef.current) {
			volumeRef.current.style.setProperty('--volume-width', `${volume}%`);
		}
	}, [volume]);

	const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newVolume = Number(e.target.value);
		setVolume(newVolume);
		if (volumeRef.current) {
			volumeRef.current.style.setProperty('--volume-width', `${newVolume}%`);
		}
		playerService.playerInstance?.setVolume(newVolume / 100);
	};

	const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newPosition = Number(e.target.value);
		setProgress(newPosition);
		if (progressBarRef.current) {
			const progressPercent = (newPosition / duration) * 100;
			progressBarRef.current.style.setProperty('--progress-width', `${progressPercent}%`);
		}
		playerService.playerInstance?.seek(newPosition);
	};

	const handleFavoriteToggle = async () => {
		if (!playerService.currentTrack) return;
		
		try {
			if (isFavorite) {
				await mixedPlaylistService.removeFromFavorites(playerService.currentTrack.id);
			} else {
				await mixedPlaylistService.addToFavorites(playerService.currentTrack.id);
			}
			setIsFavorite(!isFavorite);
		} catch (error) {
			console.error('Failed to toggle favorite status');
		}
	};

	const formatTime = (ms: number) => {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	};

	if (!playerService.playerReady.state)
		return <div className={styles.connecting}>Connecting to Spotify...</div>;

	return (
		<div className={styles.player}>
			{playerService.currentTrack && (
				<>
					<div className={styles.mainInfo}>
						<div className={styles.leftSection}>
							<img
								className={styles.cover}
								src={playerService.currentTrack.album.images[0]?.url}
								alt={playerService.currentTrack.name}
							/>
							<div className={styles.info}>
								<div className={styles.trackName}>{playerService.currentTrack.name}</div>
								<div className={styles.artistName}>{playerService.currentTrack.artists[0].name}</div>
							</div>
						</div>

						<div className={styles.controls}>
							<button
								type="button"
								className={styles.controlButton}
								onClick={playerService.handlePrevTrack}
								aria-label="Previous track"
							>
								<Prev />
							</button>
							<button
								type="button"
								className={styles.playPauseButton}
								onClick={playerService.handlePlayPause}
								aria-label="Play or pause"
							>
								{playerService.isPaused ? <Play /> : <Pause />}
							</button>
							<button
								type="button"
								className={styles.controlButton}
								onClick={playerService.handleNextTrack}
								aria-label="Next track"
							>
								<Next />
							</button>
						</div>

						<div className={styles.rightSection}>
							<button
								type="button"
								className={clsx(styles.favoriteButton, { [styles.active]: isFavorite })}
								onClick={handleFavoriteToggle}
								aria-label="Add to favorites"
							>
								<Heart />
							</button>
							<div className={styles.volumeContainer}>
								<Volume />
								<input
									ref={volumeRef}
									type="range"
									min="0"
									max="100"
									value={volume}
									className={styles.volume}
									onChange={handleVolumeChange}
								/>
							</div>
						</div>
					</div>

					<div className={styles.progressContainer}>
						<input
							ref={progressBarRef}
							type="range"
							min="0"
							max={duration}
							value={progress}
							className={styles.progress}
							onChange={handleProgressChange}
						/>
						<div className={styles.timeContainer}>
							<span className={styles.time}>{formatTime(progress)}</span>
							<span className={styles.time}>{formatTime(duration)}</span>
						</div>
					</div>
				</>
			)}
		</div>
	);
});
