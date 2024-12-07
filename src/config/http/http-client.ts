import { injectable } from "inversify";

@injectable()
export class HttpClient {
	private baseURL: string;

	constructor(baseURL: string) {
		this.baseURL = baseURL;
	}

	async get<T>(url: string): Promise<T> {
		const response = await fetch(`${this.baseURL}${url}`);
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
