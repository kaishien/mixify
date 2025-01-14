import { observer } from "mobx-react-lite";
import { container } from "~/application/register-dependencies";
import { Badge, Typography, useScrollOverlay } from "~/shared/ui/components";
import {
  type MixGenresService,
  MixGenresServiceContainerToken,
} from "../../service/mix-genres.service";

import styles from "./user-genres.module.css";

export const UserGenres = observer(() => {
	const { showTopOverlay, showBottomOverlay, listRef, handleScroll } = useScrollOverlay();

	const mixGenresService = container.get<MixGenresService>(
		MixGenresServiceContainerToken
	);

	return (
		<div className={styles.userFavoriteGenres}>
			<Typography weight="bold" tag="h2">
				Your favorite genres
			</Typography>
			<div className={styles.userFavoriteGenres__container}>
				<div className={`overlay_top ${showTopOverlay ? "visible" : ""}`} />
				<ul className={styles.userFavoriteGenres__list} ref={listRef} onScroll={handleScroll}>
					{Object.entries(mixGenresService.favoriteListenedGenres).map(([genre, count], i) => (
						<li key={i} className={styles.userFavoriteGenres__item}>
							<Badge color="dark">
								<span>{genre}</span>
								<span className={styles.counter}>{count}</span>
							</Badge>
						</li>
					))}
				</ul>
				<div className={`overlay_bottom ${showBottomOverlay ? "visible" : ""}`} />
			</div>
		</div>
	);
});
