import { useEffect, useRef, useState } from "react";


import { observer } from "mobx-react-lite";
import { useInjection } from "~/config";
import { type AuthService, AuthServiceContainerToken } from "~/services/auth";
import type { MixedPlaylistService } from "../../service/mixed-playlist.service";
import { MixedPlaylistServiceContainerToken } from "../../service/mixed-playlist.service";
import { AdditionalControls } from "./additional-controls";
import { PlaybackControls } from "./playback-controls";
import { ProgressBar } from "./progress-bar";
import { TrackInfo } from "./track-info";
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
	const [isMuted, setIsMuted] = useState(false);
	const [previousVolume, setPreviousVolume] = useState(50);

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

	const handleVolumeToggle = () => {
		if (isMuted) {
			setVolume(previousVolume);
			playerService.playerInstance?.setVolume(previousVolume / 100);
		} else {
			setPreviousVolume(volume);
			setVolume(0);
			playerService.playerInstance?.setVolume(0);
		}
		setIsMuted(!isMuted);
	};

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

						<AdditionalControls
							volume={volume}
							isMuted={isMuted}
							isFavorite={true}
							onVolumeChange={handleVolumeChange}
							onVolumeToggle={handleVolumeToggle}
							onFavoriteToggle={() => null}
							volumeRef={volumeRef}
						/>
					</div>

					<ProgressBar
						progress={progress}
						duration={duration}
						onProgressChange={handleProgressChange}
						progressBarRef={progressBarRef}
					/>
				</>
			)}
		</div>
	);
});
