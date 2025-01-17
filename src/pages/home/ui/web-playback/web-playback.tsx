import { useEffect } from "react";

import Next from "~/shared/ui/assets/player-icons/next-track.svg?react";
import Pause from "~/shared/ui/assets/player-icons/pause.svg?react";
import Play from "~/shared/ui/assets/player-icons/play.svg?react";
import Prev from "~/shared/ui/assets/player-icons/prev-track.svg?react";

import { observer } from "mobx-react-lite";
import { useInjection } from "~/config";
import { type AuthService, AuthServiceContainerToken } from "~/services/auth";
import type { MixedPlaylistService } from "../../service/mixed-playlist.service";
import { MixedPlaylistServiceContainerToken } from "../../service/mixed-playlist.service";
import styles from "./web-playback.module.css";

const SPOTIFY_PLAYER_SCRIPT_URL = "https://sdk.scdn.co/spotify-player.js";

export const WebPlayback = observer(() => {
	const authService = useInjection<AuthService>(AuthServiceContainerToken.AuthService);
	const mixedPlaylistService = useInjection<MixedPlaylistService>(
		MixedPlaylistServiceContainerToken,
	);

	const playerService = mixedPlaylistService.playerService;

	const token = authService.getToken();

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
				volume: 0.5,
			});

			playerService.setPlayerInstance(player);

			player.addListener("ready", ({ device_id }) => {
				mixedPlaylistService.updateDeviceId(device_id);
				playerService.playerReady.set(true);
			});

			player.addListener("not_ready", () => {
				playerService.playerReady.set(false);
			});

			player.addListener("player_state_changed", (state) => {
				if (state) {
					playerService.setCurrentTrack(state.track_window.current_track);
					playerService.setIsPaused(state.paused);
				}
			});

			player.connect();
		};

		return () => {
			playerService.playerInstance?.disconnect();
			script.remove();
		};
	}, [token]);

	if (!playerService.playerReady.state)
		return <div className={styles.connecting}>Connecting to Spotify...</div>;

	return (
		<div className={styles.player}>
			{playerService.currentTrack && (
				<>
					<img
						className={styles.cover}
						src={playerService.currentTrack.album.images[0]?.url}
						alt={playerService.currentTrack.name}
					/>
					<div className={styles.info}>
						<div className={styles.trackName}>{playerService.currentTrack.name}</div>
						<div className={styles.artistName}>{playerService.currentTrack.artists[0].name}</div>
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
							className={styles.controlButton}
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
				</>
			)}
		</div>
	);
});
