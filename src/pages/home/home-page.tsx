import { observer } from "mobx-react-lite";
import { useInjection, withContainer } from "~/config";
import { $UserService } from "~/services/user";
import { Container, Panel, VinylLoader } from "~/shared/ui/components";
import { UserProfile } from "./ui/user-profile";
import { WebPlayback } from "./ui/web-playback";

import clsx from "clsx";
import { useEffect } from "react";
import { $AuthService } from "~/services/auth";
import styles from "./home-page.module.scss";
import {
	type MixGenresService,
	$MixGenresService,
} from "./service/mix-genres.service";
import type { MixedPlaylistService } from "./service/mixed-playlist.service";
import { $MixedPlaylistService } from "./service/mixed-playlist.service";
import { type WebPlayerService, $WebPlayerService } from "./service/web-player.service";
import { GeneratePlaylist } from "./ui/generate-playlist/generate-playlist";
import { UserFavoriteArtists } from "./ui/user-favorite-artists/user-favorite-artists";
import { UserGenres } from "./ui/user-genres/user-genres";

const PageLoader = observer(() => {
	const mixGenresService = useInjection<MixGenresService>($MixGenresService);
	const text = mixGenresService.initialLoadingData.loadingStatus;

	return (
		<div className={styles.loaderContainer}>
			<div className={styles.loaderContainer__text}>
				{text.split("").map((char, index) => (
					<span
						key={index}
						style={{
							animationDelay: `${index * 50}ms`,
						}}
					>
						{char}
					</span>
				))}
			</div>
			<div className={styles.loaderContainer__vinylLoader}>
				<VinylLoader />
			</div>
		</div>
	);
});

const Home = observer(() => {
	const mixGenresService = useInjection<MixGenresService>($MixGenresService);
	const mixPlaylistService = useInjection<MixedPlaylistService>($MixedPlaylistService);
	const playerService = useInjection<WebPlayerService>($WebPlayerService);

	useEffect(() => {
		document.body.style.backgroundColor = "var(--background-color-dark)";
		return () => {
			document.body.style.backgroundColor = "var(--background-color-light)";
		};
	}, []);

	if (mixGenresService.initialLoadingData.isLoading) {
		return <PageLoader />;
	}

	return (
		<div className={styles.homePageContainer}>
			<Container className={styles.homePage}>
				<div className={styles.homePage__top}>
					<Panel className={styles.userProfile} padding="lg">
						<UserProfile />
					</Panel>
					<Panel className={styles.userGenres} padding="lg">
						<UserGenres />
					</Panel>
				</div>
				<div className={styles.homePage__bottom}>
					<Panel className={styles.userFavoriteArtists} padding="lg">
						<UserFavoriteArtists />
					</Panel>
					<Panel
						className={clsx(
							styles.generatePlaylist,
							mixPlaylistService.mixedPlaylist.length > 0
								? styles.generatePlaylistActive
								: styles.generatePlaylistInactive,
						)}
						padding="lg"
					>
						<GeneratePlaylist />
					</Panel>
				</div>
				<div
					className={clsx(
						playerService.currentActiveTrackId
							? styles.webPlayback
							: styles.webPlaybackHidden,
					)}
				>
					<Panel padding="lg">
						<WebPlayback />
					</Panel>
				</div>
			</Container>
		</div>
	);
});

export const HomePage = withContainer(Home, [
	$UserService,
	$AuthService,
	$MixGenresService,
	$MixedPlaylistService,
	$WebPlayerService,
]);
