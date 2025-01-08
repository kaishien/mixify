import { useEffect } from "react";
import { useInjection, withContainer } from "~/config";
import { type AuthService, AuthServiceContainerToken } from "~/services/auth";

export const CallbackAuth = () => {
	const authService = useInjection<AuthService>(AuthServiceContainerToken.AuthService);

	useEffect(() => {
		console.log("CallbackAuth");
		const handleCallback = async () => {
			const url = new URL(window.location.href);
			const code = url.searchParams.get("code");

			if (code) {
				await authService.handleCallback(code);
			}
		};

		handleCallback();
	}, [authService]);

	return null;
};

export const CallbackPage = withContainer(CallbackAuth, [
	AuthServiceContainerToken.AuthService,
]);
