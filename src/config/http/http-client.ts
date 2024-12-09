import { injectable } from "inversify";
import { AUTH_STORAGE_KEY } from "~/shared/constants";
import { Events } from "~/shared/event-emmiter";
import { eventEmitter } from "~/shared/event-emmiter";
import { type CacheStrategy, LocalStorageCacheStrategy } from "~/shared/factories/async-operation";
export interface AuthorizationResponse {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
	scope: string;
}

@injectable()
export class HttpClient {
	private baseURL: string;
	private accessToken = "";
	private storage: CacheStrategy;

	constructor(baseURL: string) {
		this.baseURL = baseURL;
		this.storage = new LocalStorageCacheStrategy();
		const accessTokenFromStorage = this.storage.get<AuthorizationResponse>(AUTH_STORAGE_KEY);
		this.accessToken = accessTokenFromStorage?.access_token ?? "";
	}

	setAccessToken(accessToken: string) {
		this.accessToken = accessToken;
	}

	async get<T>(url: string): Promise<T> {
		const response = await fetch(`${this.baseURL}${url}`, {
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
			},
		});

		if (response.status === 401) {
			eventEmitter.emit(Events.TOKEN_EXPIRED);
			throw new Error('Token expired');
		}

		return response.json();
	}

	async post<T>(url: string, data: unknown, options?: RequestInit): Promise<T> {
		const response = await fetch(`${this.baseURL}${url}`, {
			method: "POST",
			body: data instanceof URLSearchParams ? data : JSON.stringify(data),
			...options,
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return response.json();
	}

	async put<T, U>(url: string, body: U, options?: RequestInit): Promise<T> {
		const response = await fetch(`${this.baseURL}${url}`, {
			method: "PUT",
			body: JSON.stringify(body),
			...options,
		});

		return response.json();
	}

	async delete<T>(url: string): Promise<T> {
		const response = await fetch(`${this.baseURL}${url}`, {
			method: "DELETE",
		});

		return response.json();
	}
}
