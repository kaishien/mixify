import { observer } from "mobx-react-lite";
import { withContainer } from "~/config";
import { UserServiceContainerToken } from "~/services/user";
import { Container, Panel } from "~/shared/ui/components";
import { UserProfile } from "./ui/user-profile";

import { AuthServiceContainerToken } from "~/services/auth";
import styles from "./home-page.module.css";

const Home = observer(() => {
	return (
		<Container className={styles.homePage}>
			<Panel className={styles.userProfile}>
				<UserProfile />
			</Panel>
		</Container>
	);
});

export const HomePage = withContainer(Home, {
	userService: UserServiceContainerToken.UserService,
	authService: AuthServiceContainerToken.AuthService,
});
