export const getConfig = () => {
	return {
		clientId: import.meta.env.VITE_CLIENT_ID,
		clientSecret: import.meta.env.VITE_CLIENT_SECRET,
		baseApiUrl: import.meta.env.VITE_BASE_API_URL,
		accountApiUrl: import.meta.env.VITE_ACCOUNT_API_URL,
	};
};

export const config = getConfig();