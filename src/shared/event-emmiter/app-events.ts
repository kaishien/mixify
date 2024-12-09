export const Events = {
	TOKEN_EXPIRED: "token:expired",
	AUTH_SUCCESS: "auth:success",
	AUTH_ERROR: "auth:error",
} as const;

export type EventType = (typeof Events)[keyof typeof Events];