import { observer } from "mobx-react-lite";
import { container } from "~/application/register-dependencies";
import { Badge, Typography } from "~/shared/ui/components";
import { type MixGenresService, MixGenresServiceContainerToken } from "../../service/mix-genres.service";
import styles from "./user-genres.module.css";

export const UserGenres = observer(() => {
  const mixGenresService = container.get<MixGenresService>(MixGenresServiceContainerToken.MixGenresService);

	return (
		<div className={styles.userFavoriteGenres}>
			<Typography tag="h2">Your favorite genres</Typography>
			<ul className={styles.userFavoriteGenres__list}>
				{Object.entries(mixGenresService.favoriteListenedGenres).map(([genre, count], i) => (
					<li key={i} className={styles.userFavoriteGenres__item}>
						<Badge color="dark">
							<span>{genre}</span>
							<span className={styles.counter}>{count}</span>
						</Badge>
					</li>
				))}
			</ul>
		</div>
	);
});
