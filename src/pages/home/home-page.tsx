import { observer } from "mobx-react-lite";
import { useInjection, withContainer } from "~/config";
import { UserServiceContainerToken } from "~/services/user";
import { Container, Panel, VinylLoader } from "~/shared/ui/components";
import { UserProfile } from "./ui/user-profile";

import { AuthServiceContainerToken } from "~/services/auth";
import { type LoaderProcessor, LoaderProcessorDIToken } from "~/shared/lib/loader-processor";
import styles from "./home-page.module.css";
import { MixGenresServiceContainerToken } from "./service/mix-genres.service";
import { GeneratePlaylist } from "./ui/generate-playlist/generate-playlist";
import { UserFavoriteArtists } from "./ui/user-favorite-artists/user-favorite-artists";
import { UserGenres } from "./ui/user-genres/user-genres";

const PageLoader = observer(() => {
	const loaderProcessor = useInjection<LoaderProcessor>(LoaderProcessorDIToken);
	const text = loaderProcessor.loadingStatus;

	return (
		<div className={styles.loaderContainer}>
			<div className={styles.loaderContainer__text}>
				{text.split('').map((char, index) => (
					<span
						key={index}
						style={{
							animationDelay: `${index * 50}ms`
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
	const loaderProcessor = useInjection<LoaderProcessor>(LoaderProcessorDIToken);

	if (loaderProcessor.isLoading) {
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
					<Panel className={styles.generatePlaylist} padding="lg">
						<GeneratePlaylist />
					</Panel>
				</div>
			</Container>
		</div>
	);
});

export const HomePage = withContainer(Home, {
	userService: UserServiceContainerToken.UserService,
	authService: AuthServiceContainerToken.AuthService,
	mixGenresService: MixGenresServiceContainerToken.MixGenresService,
	loaderProcessor: LoaderProcessorDIToken,
});
