import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import { useInjection, withContainer } from "~/config";
import { type AuthService, AuthServiceContainerToken } from "~/services/auth";
import { type UserService, UserServiceContainerToken } from "~/services/user";

const Home = observer(() => {
	const authService = useInjection<AuthService>(AuthServiceContainerToken.AuthService);
	const userService = useInjection<UserService>(UserServiceContainerToken.UserService);

	return (
		<div
			className="home-container"
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				padding: "2rem",
				gap: "1.5rem",
				maxWidth: "800px",
				margin: "0 auto",
			}}
		>
			<h1
				style={{
					fontSize: "3rem",
					fontWeight: "bold",
					color: "#646cff",
					marginBottom: "1rem",
				}}
			>
				Добро пожаловать {userService.user?.display_name}
			</h1>

			<p
				style={{
					fontSize: "1.2rem",
					textAlign: "center",
					lineHeight: "1.6",
					color: "rgba(255, 255, 255, 0.87)",
					marginBottom: "2rem",
				}}
			>
				Это главная страница нашего приложения. Здесь вы можете перейти к списку задач или вернуться
				назад.
			</p>

			<div
				style={{
					display: "flex",
					gap: "1rem",
					alignItems: "center",
				}}
			>
				<button
					type="button"
					onClick={() => authService.authorize()}
					style={{
						backgroundColor: "#646cff",
						color: "white",
						transition: "all 0.3s ease",
					}}
				>
					Login
				</button>

				<Link
					to="/todo"
					style={{
						padding: "0.6em 1.2em",
						borderRadius: "8px",
						border: "1px solid #646cff",
						transition: "all 0.3s ease",
					}}
				>
					Список задач
				</Link>
			</div>
		</div>
	);
});

export const HomePage = withContainer(Home, {
	authService: AuthServiceContainerToken.AuthService,
	userService: UserServiceContainerToken.UserService,
});
