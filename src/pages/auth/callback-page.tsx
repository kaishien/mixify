import { useEffect } from "react";
import { useInjection, withContainer } from "~/config";
import { $AuthService, type AuthService } from "~/services/auth";

export const CallbackAuth = () => {
	const authService = useInjection<AuthService>($AuthService);

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
};

export const CallbackPage = withContainer(CallbackAuth, [$AuthService]);
