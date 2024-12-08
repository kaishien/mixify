import { useEffect } from "react";
import { useInjection, withContainer } from "~/config";
import { AuthContainerToken, type AuthService } from "../home/auth-service";

export const CallbackAuth = () => {
	const authService = useInjection<AuthService>(AuthContainerToken.AuthService);

	useEffect(() => {
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
}

export const CallbackPage = withContainer(CallbackAuth, {
	authService: AuthContainerToken.AuthService,
});
