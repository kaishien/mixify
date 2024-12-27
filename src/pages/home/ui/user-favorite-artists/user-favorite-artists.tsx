import { observer } from "mobx-react-lite";
import { container } from "~/application/register-dependencies";
import { Typography } from "~/shared/ui/components";
import { type MixGenresService, MixGenresServiceContainerToken } from "../../service/mix-genres.service";

import styles from "./user-favorite-artists.module.css";

export const UserFavoriteArtists = observer(() => {
  const mixGenresService = container.get<MixGenresService>(MixGenresServiceContainerToken.MixGenresService);

  const top20Artists = mixGenresService.favoritesListenedArtists.slice(0, 20);

	return (
		<div className={styles.userFavoriteArtists}>
      <Typography tag="h2">Your favorite artists</Typography>
      <ul className={styles.userFavoriteArtists__list}>
        {top20Artists.map((artist, i) => (
          <li key={i} className={styles.userFavoriteArtists__item}>{i + 1}. {artist}</li>
        ))}
      </ul>
		</div>
	);  
});
