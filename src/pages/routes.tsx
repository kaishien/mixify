import { CallbackPage } from "./auth/callback-page";
import { HomePage } from "./home";
import { LoginPage } from "./login";

export const routes = [
	{
		path: "/",
		element: <HomePage />,
	},
	{
		path: "/callback",
		element: <CallbackPage />,
	},
	{
		path: "/login",
		element: <LoginPage />,
	},
];
