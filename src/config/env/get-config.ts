export const getConfig = () => {
	return {
		spotifyClientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
		spotifyClientSecret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET,
		spotifyBaseApiUrl: import.meta.env.VITE_SPOTIFY_BASE_API_URL,
		spotifyAccountApiUrl: import.meta.env.VITE_SPOTIFY_ACCOUNT_API_URL,
		spotifyAuthRedirectUri: import.meta.env.VITE_AUTH_REDIRECT_URI,
		lastFmApiKey: import.meta.env.VITE_LAST_FM_API_KEY,
		lastFmBaseApiUrl: import.meta.env.VITE_LAST_FM_BASE_API_URL,
	};
};

export const config = getConfig();