import { observer } from "mobx-react-lite";
import { withContainer } from "~/config";
import { UserServiceContainerToken } from "~/services/user";
import { Container, Panel } from "~/shared/ui/components";
import { UserProfile } from "./ui/user-profile";

import { AuthServiceContainerToken } from "~/services/auth";
import styles from "./home-page.module.css";
import { MixGenresServiceContainerToken } from "./service/mix-genres.service";
import { GeneratePlaylist } from "./ui/generate-playlist";
import { UserGenres } from "./ui/user-genres/user-genres";
import { UserSavedTracks } from "./ui/user-saved-tracks/user-saved-tracks";

const Home = observer(() => {
	return (
		<Container className={styles.homePage}>
			<Panel className={styles.userProfile}>
				<UserProfile />
			</Panel>
			<GeneratePlaylist />
      <Panel>
        <UserGenres />
      </Panel>
      <Panel>
        <UserSavedTracks />
      </Panel>
		</Container>
	);
});

export const HomePage = withContainer(Home, {
	userService: UserServiceContainerToken.UserService,
	authService: AuthServiceContainerToken.AuthService,
  mixGenresService: MixGenresServiceContainerToken.MixGenresService,
});
