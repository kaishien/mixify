import { observer } from "mobx-react-lite";
import { memo, useCallback } from "react";
import type { Track as SpotifyTrack } from "spotify-types";
import { useInjection } from "~/config/ioc/use-injection";
import PauseIcon from "~/shared/ui/assets/player-icons/pause.svg?react";
import PlayIcon from "~/shared/ui/assets/player-icons/play.svg?react";
import { AudioVisualizer } from "~/shared/ui/components";
import { Typography } from "~/shared/ui/components/typography/typography";
import type { MixedPlaylistService } from "../../service/mixed-playlist.service";
import { $MixedPlaylistService } from "../../service/mixed-playlist.service";
import type { WebPlayerService } from "../../service/web-player.service";
import { $WebPlayerService } from "../../service/web-player.service";
import styles from "./generate-playlist.module.scss";

const formatDuration = (ms: number) => {
	const minutes = Math.floor(ms / 60000);
	const seconds = Math.floor((ms % 60000) / 1000);
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

type TrackProps = {
	track: SpotifyTrack;
	trackPosition: number;
	isPlaying: boolean;
	currentActiveTrackId: string;
	handleClickTrack: (trackId: string, trackUri: string) => void;
	playTrack: (trackId: string) => void;
};

const Track = memo(
	({
		track,
		trackPosition,
		isPlaying,
		currentActiveTrackId,
		handleClickTrack,
		playTrack,
	}: TrackProps) => {
		return (
			<button
				type="button"
				className={styles.track__button}
				data-active={currentActiveTrackId === track.id}
				data-playing={currentActiveTrackId === track.id && isPlaying}
				onClick={() => handleClickTrack(track.id, track.uri)}
				onKeyDown={(e) => e.key === "Enter" && playTrack(track.uri)}
			>
				<div className={styles.track__index}>
					<>
						<Typography tag="span" color="gray" className={styles.track__number}>
							{trackPosition}
						</Typography>
						{currentActiveTrackId === track.id && isPlaying ? (
							<>
								<PlayIcon className={styles.track__hoverIcon} />
								<PauseIcon />
							</>
						) : (
							<PlayIcon className={styles.track__hoverIcon} />
						)}
					</>
				</div>
				<div className={styles.track__coverWrapper}>
					<img className={styles.track__cover} src={track.album.images[2]?.url} alt={track.name} />
					{currentActiveTrackId === track.id && <AudioVisualizer isPlaying={isPlaying} />}
				</div>
				<div className={styles.track__info}>
					<Typography tag="span" weight="bold" className={styles.track__name}>
						{track.name}
					</Typography>
					<Typography tag="h5" weight="bold" className={styles.track__artist}>
						{track.artists.map((artist) => artist.name).join(", ")}
					</Typography>
				</div>
				<div className={styles.track__duration}>{formatDuration(track.duration_ms)}</div>
			</button>
		);
	},
);

export const Playlist = observer(() => {
	const mixedPlaylistService = useInjection<MixedPlaylistService>($MixedPlaylistService);
	const playerService = useInjection<WebPlayerService>($WebPlayerService);

	const { mixedPlaylist } = mixedPlaylistService;
	const { currentActiveTrackId } = playerService;
	const isPlaying = !playerService.isPaused;

	const handleClickTrack = useCallback(
		(trackId: string, trackUri: string) => {
			if (currentActiveTrackId === trackId && isPlaying) {
				playerService.handlePlayPause();
			} else {
				mixedPlaylistService.playTrack(trackUri);
			}
		},
		[currentActiveTrackId, isPlaying, mixedPlaylistService, playerService],
	);

	return (
		<div className={styles.generatedPlaylist__listContainer}>
			<ul className={styles.generatedPlaylist__tracks}>
				{mixedPlaylist.map((track, index) => (
					<li key={track.id} className={styles.track}>
						<Track
							track={track}
							trackPosition={index + 1}
							isPlaying={isPlaying}
							currentActiveTrackId={currentActiveTrackId ?? ""}
							handleClickTrack={handleClickTrack}
							playTrack={() => mixedPlaylistService.playTrack(track.uri)}
						/>
					</li>
				))}
			</ul>
		</div>
	);
});
