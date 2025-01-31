import { observer } from "mobx-react-lite";
import { useInjection } from "~/config/ioc/use-injection";
import { Button } from "~/shared/ui/components";
import {
	type MixGenresService,
	$MixGenresService,
} from "../../service/mix-genres.service";
import type { MixedPlaylistService } from "../../service/mixed-playlist.service";
import { $MixedPlaylistService } from "../../service/mixed-playlist.service";
import { Playlist } from "./playlist";
import { PlaylistHeader } from "./playlist-header";

import styles from "./generate-playlist.module.scss";
import { ScreenLoader } from "./screen-loader";

const GeneratedPlaylist = observer(() => {
	const mixedPlaylistService = useInjection<MixedPlaylistService>($MixedPlaylistService);

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
	const mixGenresService = useInjection<MixGenresService>($MixGenresService);

	const mixedPlaylistService = useInjection<MixedPlaylistService>($MixedPlaylistService);

	const hasMixedTracks = mixedPlaylistService.mixedPlaylist.length > 0;

	return (
		<div className={styles.generatePlaylistContainer}>
			{hasMixedTracks && <GeneratedPlaylist />}

			{mixGenresService.mixifyLoadingData.isLoading && <ScreenLoader />}

			{!hasMixedTracks && !mixGenresService.mixifyLoadingData.isLoading && (
				<Button
					className={styles.generatePlaylistContainer__button}
					variant="secondary"
					isLoading={mixGenresService.mixifyLoadingData.isLoading}
					onClick={() => mixGenresService.createMixPlaylist()}
				>
					Mixify
				</Button>
			)}
		</div>
	);
});
