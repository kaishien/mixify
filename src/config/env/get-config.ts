export const getConfig = () => {
    return {
        clientId: import.meta.env.CLIENT_ID,
        clientSecret: import.meta.env.CLIENT_SECRET,
        baseApiUrl: import.meta.env.BASE_API_URL,
        accountApiUrl: import.meta.env.ACCOUNT_API_URL,
    }
}