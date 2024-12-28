import { useCallback, useEffect, useState } from "react";

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
	
	const token = authService.getToken();

	const [player, setPlayer] = useState<Spotify.Player | null>(null);
	const [isActive, setIsActive] = useState(false);
	const [currentTrack, setCurrentTrack] = useState<Spotify.Track | null>(null);
	const [isPaused, setIsPaused] = useState(false);
	const [deviceId, setDeviceId] = useState("");

	const handlePlayPause = useCallback(() => {
		player?.togglePlay();
	}, [player]);

	const handlePrevTrack = useCallback(() => {
		player?.previousTrack();
	}, [player]);

	const handleNextTrack = useCallback(() => {
		player?.nextTrack();
	}, [player]);

	useEffect(() => {
		const script = document.createElement("script");
		script.src = SPOTIFY_PLAYER_SCRIPT_URL;
		script.async = true;

		document.body.appendChild(script);

		window.onSpotifyWebPlaybackSDKReady = () => {
			const player = new window.Spotify.Player({
				name: "Web Playback SDK",
				getOAuthToken: (cb) => {
					cb(token);
				},
				volume: 0.5,
			});

			setPlayer(player);

			player.addListener("ready", ({ device_id }) => {
				setDeviceId(device_id);
				setIsActive(true);
			});

			player.addListener("not_ready", () => {
				setIsActive(false);
			});

			player.addListener("player_state_changed", (state) => {
				if (state) {
					setCurrentTrack(state.track_window.current_track);
					setIsPaused(state.paused);
				}
			});

			player.connect();
		};

		return () => {
			player?.disconnect();
			script.remove();
		};
	}, [token]);

	useEffect(() => {
		if (deviceId) {
			mixedPlaylistService.updateDeviceId(deviceId);
		}
	}, [isActive, deviceId]);

	if (!isActive) return <div className={styles.connecting}>Connecting to Spotify...</div>;

	return (
		<div className={styles.player}>
			{currentTrack && (
				<>
					<img
						className={styles.cover}
						src={currentTrack.album.images[0]?.url}
						alt={currentTrack.name}
					/>
					<div className={styles.info}>
						<div className={styles.trackName}>{currentTrack.name}</div>
						<div className={styles.artistName}>{currentTrack.artists[0].name}</div>
					</div>
					<div className={styles.controls}>
						<button
							type="button"
							className={styles.controlButton}
							onClick={handlePrevTrack}
							aria-label="Previous track"
						>
							<Prev />
						</button>
						<button
							type="button"
							className={styles.controlButton}
							onClick={handlePlayPause}
							aria-label="Play or pause"
						>
							{isPaused ? <Play /> : <Pause />}
						</button>
						<button
							type="button"
							className={styles.controlButton}
							onClick={handleNextTrack}
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
