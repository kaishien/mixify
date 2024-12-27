import type { MixGenresService } from "../../service/mix-genres.service";

import { container } from "~/application/register-dependencies";
import { Button } from "~/shared/ui/components";
import { MixGenresServiceContainerToken } from "../../service/mix-genres.service";

import styles from "./generate-playlist.module.css";

export const GeneratePlaylist = () => {
	const mixGenresService = container.get<MixGenresService>(
		MixGenresServiceContainerToken.MixGenresService,
	);

	return (
		<div className={styles.generatePlaylistContainer}>
			<Button
				className={styles.generatePlaylistContainer__button}
				variant="secondary"
				onClick={() =>
					mixGenresService.createMixPlaylist({
						name: "Mix Genres",
						description: "Mix Genres",
					})
				}
			>
				Mixify
			</Button>
		</div>
	);
};
