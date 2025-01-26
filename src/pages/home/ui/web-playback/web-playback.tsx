import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useRef } from "react";

import { useInjection } from "~/config";
import { type AuthService, AuthServiceContainerToken } from "~/services/auth";
import type { WebPlayerService } from "../../service/web-player.service";
import { WebPlayerServiceContainerToken } from "../../service/web-player.service";
import { AdditionalControls } from "./additional-controls";
import { PlaybackControls } from "./playback-controls";
import { ProgressBar } from "./progress-bar";
import { TrackInfo } from "./track-info";
import styles from "./web-playback.module.scss";

const SPOTIFY_PLAYER_SCRIPT_URL = "https://sdk.scdn.co/spotify-player.js";
const PLAYER_NAME = "Mixify Web Player";

export const WebPlayback = observer(() => {
	const authService = useInjection<AuthService>(AuthServiceContainerToken.AuthService);
	const playerService = useInjection<WebPlayerService>(WebPlayerServiceContainerToken);

	const token = authService.getToken();

	const progressBarRef = useRef<HTMLInputElement>(null);

	const handleVolumeChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = Number(e.target.value);
			playerService.volumeChange(value);
		},
		[playerService],
	);

	const handleProgressChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = Number(e.target.value);
			playerService.progressChange(value);
		},
		[playerService],
	);

	useEffect(() => {
		const script = document.createElement("script");
		script.src = SPOTIFY_PLAYER_SCRIPT_URL;
		script.async = true;

		document.body.appendChild(script);

		window.onSpotifyWebPlaybackSDKReady = () => {
			const player = new window.Spotify.Player({
				name: PLAYER_NAME,
				getOAuthToken: (cb) => {
					cb(token);
				},
				volume: playerService.volume / 100,
			});

			playerService.setPlayerInstance(player);

			player.addListener("ready", ({ device_id }) => {
				playerService.setDeviceId(device_id);
				playerService.playerReady.set(true);
			});

			player.addListener("player_state_changed", (state) => {
				if (state) {
					playerService.setCurrentTrack(state.track_window.current_track);
					playerService.setIsPaused(state.paused);
					playerService.setProgress(state.position);
					playerService.setDuration(state.duration);
				}
			});

			player.connect();
		};

		return () => {
			playerService.cleanup();
			script.remove();
		};
	}, [token]);

	useEffect(() => {
		if (progressBarRef.current) {
			const progressPercent = (playerService.progress / playerService.duration) * 100;
			progressBarRef.current.style.setProperty("--progress-width", `${progressPercent}%`);
		}
	}, [playerService.progress, playerService.duration]);

	if (!playerService.playerReady.state)
		return <div className={styles.connecting}>Connecting to Spotify...</div>;

	return (
		<div className={styles.player}>
			{playerService.currentTrack && (
				<>
					<div className={styles.mainInfo}>
						<TrackInfo track={playerService.currentTrack} />

						<PlaybackControls
							isPaused={playerService.isPaused}
							onPrevTrack={playerService.handlePrevTrack}
							onPlayPause={playerService.handlePlayPause}
							onNextTrack={playerService.handleNextTrack}
						/>

						<div className={styles.desktopViewControls}>
							<AdditionalControls
								volume={playerService.volume}
								isMuted={playerService.isMuted}
								isFavorite={playerService.currentTrackIsFavorite}
								onVolumeChange={handleVolumeChange}
								onVolumeToggle={playerService.volumeToggle}
								onFavoriteToggle={() => {
									if (playerService.currentActiveTrackId) {
										playerService.favoriteTrackToggle(playerService.currentActiveTrackId);
									}
								}}
							/>
						</div>
					</div>

					<ProgressBar
						progress={playerService.progress}
						duration={playerService.duration}
						onProgressChange={handleProgressChange}
						progressBarRef={progressBarRef}
					/>

					<div className={styles.mobileViewControls}>
						<AdditionalControls
							volume={playerService.volume}
							isMuted={playerService.isMuted}
							isFavorite={playerService.currentTrackIsFavorite}
							onVolumeChange={handleVolumeChange}
							onVolumeToggle={playerService.volumeToggle}
							onFavoriteToggle={() => {
								if (playerService.currentActiveTrackId) {
									playerService.favoriteTrackToggle(playerService.currentActiveTrackId);
								}
							}}
						/>
					</div>
				</>
			)}
		</div>
	);
});
