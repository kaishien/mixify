import { observer } from "mobx-react-lite";
import { useInjection } from "~/config";
import { withContainer } from "~/config/ioc/with-container";
import { type AuthService, AuthServiceContainerToken } from "~/services/auth";
import { Button } from "~/shared/ui/components";
import styles from "./login-page.module.css";

type LoginButtonProps = {
	onClick: () => void;
};

const LoginButton = ({ onClick }: LoginButtonProps) => {
	return (
		<Button onClick={onClick}>
			Login with Spotify
		</Button>
	);
};

const SiteName = () => {
	return <h1 className={styles.loginPage__siteName}>Mixify</h1>;
};

const LoginPageContent = observer(() => {
	const authService = useInjection<AuthService>(AuthServiceContainerToken.AuthService);

	return (
		<main className={styles.loginPage}>
			<div className={styles.loginPage__content}>
				<div className={styles.loginPage__leftContainer}>
					<SiteName />
					<LoginButton onClick={() => authService.authorize()} />
				</div>
			</div>
		</main>
	);
});

export const LoginPage = withContainer(LoginPageContent, [
	AuthServiceContainerToken.AuthService,
]);
