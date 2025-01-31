import { observer } from "mobx-react-lite";
import { Avatar, Typography } from "~/shared/ui/components";
import {
	type MixGenresService,
	$MixGenresService,
} from "../../service/mix-genres.service";

import styles from "./user-favorite-artists.module.css";
import { useInjection } from "~/config";

export const UserFavoriteArtists = observer(() => {
	const mixGenresService = useInjection<MixGenresService>($MixGenresService);

	const top20Artists = mixGenresService.favoritesListenedArtists.slice(0, 20);

	return (
		<div className={styles.userFavoriteArtists}>
			<Typography weight="bold" tag="h2">Your favorite artists</Typography>
			<ul className={styles.userFavoriteArtists__list}>
				{top20Artists.map((artist, i) => (
					<li key={i} className={styles.userFavoriteArtists__item}>
						<Avatar size="small" src={artist.image} alt={artist.name} />
						<Typography weight="normal" tag="h5">{artist.name}</Typography>
					</li>
				))}
			</ul>
		</div>
	);
});
