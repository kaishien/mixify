import { observer } from "mobx-react-lite";

import type { MixGenresService } from "../../service/mix-genres.service";

import { useInjection } from "~/config/ioc/use-injection";
import { Button, Typography } from "~/shared/ui/components";
import { MixGenresServiceContainerToken } from "../../service/mix-genres.service";

import type { MixedPlaylistService } from "../../service/mixed-playlist.service";
import { MixedPlaylistServiceContainerToken } from "../../service/mixed-playlist.service";

import styles from "./generate-playlist.module.css";

const formatDuration = (ms: number) => {
	const minutes = Math.floor(ms / 60000);
	const seconds = Math.floor((ms % 60000) / 1000);
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const GeneratedPlaylist = observer(() => {
	const mixedPlaylistService = useInjection<MixedPlaylistService>(
		MixedPlaylistServiceContainerToken,
	);

	const mixedPlaylist = mixedPlaylistService.mixedPlaylist;

	if (!mixedPlaylist.length) return null;

	return (
		<div className={styles.generatedPlaylist}>
			<div className={styles.generatedPlaylist__header}>
				<div className={styles.generatedPlaylist__info}>
					<Typography tag="h3">Mixified Playlist</Typography>
					<Typography tag="span" color="gray">
						{mixedPlaylist.length} tracks
					</Typography>
				</div>
				<Button
					variant="primary"
					onClick={() => mixedPlaylistService.playMixedPlaylist()}
					className={styles.playButton}
				>
					Play All
				</Button>
			</div>

			<div className={styles.generatedPlaylist__listContainer}>
				<ul className={styles.generatedPlaylist__tracks}>
					{mixedPlaylist.map((track, index) => (
						<li key={track.id} className={styles.track}>
							<button
								type="button"
								className={styles.track__button}
								onClick={() => mixedPlaylistService.playTrack(track.uri)}
								onKeyDown={(e) => e.key === "Enter" && mixedPlaylistService.playTrack(track.uri)}
							>
								<Typography tag="span" color="gray">
									{index + 1}
								</Typography>
								<img
									className={styles.track__cover}
									src={track.album.images[2]?.url}
									alt={track.name}
								/>
								<div className={styles.track__info}>
									<div className={styles.track__name}>{track.name}</div>
									<div className={styles.track__artist}>
										{track.artists.map((artist) => artist.name).join(", ")}
									</div>
								</div>
								<div className={styles.track__duration}>{formatDuration(track.duration_ms)}</div>
							</button>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
});

export const GeneratePlaylist = observer(() => {
	const mixGenresService = useInjection<MixGenresService>(
		MixGenresServiceContainerToken.MixGenresService,
	);

	const mixedPlaylistService = useInjection<MixedPlaylistService>(
		MixedPlaylistServiceContainerToken,
	);

	const hasMixedTracks = mixedPlaylistService.mixedPlaylist.length > 0;

	return (
		<div className={styles.generatePlaylistContainer}>
			{hasMixedTracks ? (
				<GeneratedPlaylist />
			) : (
				<Button
					className={styles.generatePlaylistContainer__button}
					variant="secondary"
					isLoading={mixGenresService.mixifyLoadingData.isLoading}
					onClick={() =>
						mixGenresService.createMixPlaylist({
							name: "Mix Genres",
							description: "Mix Genres",
						})
					}
				>
					Mixify
				</Button>
			)}
		</div>
	);
});
