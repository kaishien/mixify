import { observer } from "mobx-react-lite";
import { useInjection } from "~/config/ioc/use-injection";
import PlayIcon from "~/shared/ui/assets/player-icons/play.svg?react";
import PlaylistAddIcon from "~/shared/ui/assets/player-icons/playlist-add.svg?react";
import { Button, Typography } from "~/shared/ui/components";
import type { MixGenresService } from "../../service/mix-genres.service";
import { $MixGenresService } from "../../service/mix-genres.service";
import type { MixedPlaylistService } from "../../service/mixed-playlist.service";
import { $MixedPlaylistService } from "../../service/mixed-playlist.service";
import styles from "./generate-playlist.module.scss";

const PlaylistControls = observer(() => {
	const mixedPlaylistService = useInjection<MixedPlaylistService>($MixedPlaylistService);
	const mixGenresService = useInjection<MixGenresService>($MixGenresService);

	return (
		<div className={styles.generatedPlaylist__controls}>
			<div className={styles.generatedPlaylist__controlsPlaylist}>
				<Button
					size="small"
					icon={<PlayIcon />}
					variant="dark"
					onClick={() => mixedPlaylistService.playMixedPlaylist()}
				>
					Play All
				</Button>
				<Button
					className={styles.generatedPlaylist__addButton}
					isLoading={mixedPlaylistService.addingToLibraryLoader.isLoading}
					size="small"
					icon={<PlaylistAddIcon />}
					variant="dark"
					onClick={() =>
						mixedPlaylistService.addMixedPlaylistToUserLibrary({
							name: "Mixified Playlist",
							description: "Your mixed playlist",
						})
					}
				>
					Add to Library
				</Button>
			</div>
			<Button size="small" variant="secondary" onClick={() => mixGenresService.createMixPlaylist()}>
				Mixify
			</Button>
		</div>
	);
});

export const PlaylistHeader = observer(() => {
	const mixedPlaylistService = useInjection<MixedPlaylistService>($MixedPlaylistService);

	return (
		<>
			<div className={styles.generatedPlaylist__header}>
				<div className={styles.generatedPlaylist__info}>
					<Typography tag="h3">Mixified Playlist</Typography>
					<Typography tag="span" color="gray">
						{mixedPlaylistService.mixedPlaylist.length} tracks
					</Typography>
				</div>
				<PlaylistControls />
			</div>
		</>
	);
});
