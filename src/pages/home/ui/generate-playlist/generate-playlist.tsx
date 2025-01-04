import { observer } from "mobx-react-lite";
import { useInjection } from "~/config/ioc/use-injection";
import { Button } from "~/shared/ui/components";
import { type MixGenresService, MixGenresServiceContainerToken } from "../../service/mix-genres.service";
import type { MixedPlaylistService } from "../../service/mixed-playlist.service";
import { MixedPlaylistServiceContainerToken } from "../../service/mixed-playlist.service";
import { Playlist } from "./playlist";
import { PlaylistHeader } from "./playlist-header";

import styles from "./generate-playlist.module.css";

const GeneratedPlaylist = observer(() => {
	const mixedPlaylistService = useInjection<MixedPlaylistService>(
		MixedPlaylistServiceContainerToken,
	);

	const mixedPlaylist = mixedPlaylistService.mixedPlaylist;

	if (!mixedPlaylist.length) return null;

	return (
		<div className={styles.generatedPlaylist}>
			<PlaylistHeader />
			<Playlist />
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
						mixGenresService.createMixPlaylist()
					}
				>
					Mixify
				</Button>
			)}
		</div>
	);
});
