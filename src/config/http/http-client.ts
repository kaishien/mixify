import { injectable } from "inversify";
import { AUTH_STORAGE_KEY } from "~/shared/constants";
import { Events, eventEmitter } from "~/shared/event-emmiter";
import { type CacheStrategy, LocalStorageCache } from "~/shared/factories/async-operation";

export interface AuthorizationResponse {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
	scope: string;
}

interface RequestOptions extends RequestInit {
	params?: Record<string, string | number | boolean | string[]>;
}

@injectable()
export class HttpClient {
	private baseURL: string;
	private accessToken = "";
	private storage: CacheStrategy;

	constructor(baseURL: string) {
		this.baseURL = baseURL;
		this.storage = new LocalStorageCache();
		const accessTokenFromStorage = this.storage.get<AuthorizationResponse>(AUTH_STORAGE_KEY);
		this.accessToken = accessTokenFromStorage?.access_token ?? "";
	}

	setAccessToken(accessToken: string) {
		this.accessToken = accessToken;
	}

	private createUrl(
		path: string,
		params?: Record<string, string | number | boolean | string[]>,
	): string {
		const url = new URL(`${this.baseURL}${path}`);

		if (params) {
			for (const [key, value] of Object.entries(params)) {
				if (Array.isArray(value)) {
					for (const item of value) {
						url.searchParams.append(key, String(item));
					}
				} else {
					url.searchParams.append(key, String(value));
				}
			}
		}

		return url.toString();
	}

	async get<T>(url: string, options?: RequestOptions): Promise<T> {
		const { params, headers, ...restOptions } = options || {};
		const maxRetries = 3;
		let retryCount = 0;
		let lastError: Error | null = null;

		while (retryCount < maxRetries) {
			try {
				const fullUrl = this.createUrl(url, params);
				const response = await fetch(fullUrl, {
					headers: {
						Authorization: `Bearer ${this.accessToken}`,
						"Accept-Language": "en",
						...headers,
					},
					...restOptions,
				});

				if (response.status === 403 || response.status === 401) {
					eventEmitter.emit(Events.AUTH_ERROR);
					throw new Error("Auth error");
				}

				if (response.status === 429) {
					const retryAfter = response.headers.get("Retry-After");
					const waitTime = retryAfter
						? Number.parseInt(retryAfter) * 1000
						: 1000 * (retryCount + 1);
					await new Promise((resolve) => setTimeout(resolve, waitTime));
					retryCount++;
					continue;
				}

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				return response.json();
			} catch (error) {
				lastError = error as Error;
				if (retryCount === maxRetries - 1) {
					throw error;
				}
				retryCount++;
			}
		}

		throw lastError || new Error("Maximum retries exceeded");
	}

	async post<T>(url: string, data: unknown, options?: RequestInit): Promise<T> {
		const response = await fetch(`${this.baseURL}${url}`, {
			method: "POST",
			body: data instanceof URLSearchParams ? data : JSON.stringify(data),
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				"Accept-Language": "en",
				...options?.headers,
			},
			...options,
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return response.json();
	}

	async put<T, U>(url: string, body: U, options?: RequestInit): Promise<T | null> {
		const response = await fetch(`${this.baseURL}${url}`, {
			method: "PUT",
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				"Accept-Language": "en",
				...options?.headers,
			},
			body: JSON.stringify(body),
			...options,
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		if (response.status === 403 || response.status === 401) {
			eventEmitter.emit(Events.AUTH_ERROR);
			throw new Error("Auth error");
		}

		if (response.status === 403) {
			eventEmitter.emit(Events.AUTH_ERROR);
			throw new Error("Auth error");
		}

		const contentLength = response.headers.get("content-length");
		const hasContent = contentLength && Number.parseInt(contentLength) > 0;

		return hasContent ? response.json() : (null as T);
	}

	async delete<T, U>(url: string, body?: U, options?: RequestInit): Promise<T> {
		const response = await fetch(`${this.baseURL}${url}`, {
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				"Accept-Language": "en",
				...options?.headers,
			},
			body: JSON.stringify(body),
			method: "DELETE",
			...options,
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		if (response.status === 403 || response.status === 401) {
			eventEmitter.emit(Events.AUTH_ERROR);
			throw new Error("Auth error");
		}

		if (response.status === 403) {
			eventEmitter.emit(Events.AUTH_ERROR);
			throw new Error("Auth error");
		}

		const contentLength = response.headers.get("content-length");
		const hasContent = contentLength && Number.parseInt(contentLength) > 0;

		return hasContent ? response.json() : (null as T);
	}
}
