import type { CacheStrategy } from "./cache-strategy.interface";

export class LocalStorageCache implements CacheStrategy {
	get<T>(key: string): T | null {
		const item = localStorage.getItem(key);
		if (!item) return null;

		try {
			const { value, timestamp, ttl } = JSON.parse(item);

			if (Date.now() - timestamp > ttl) {
				localStorage.removeItem(key);
				return null;
			}

			return value as T;
		} catch {
			return null;
		}
	}

	set<T>(key: string, value: T, ttl: number): void {
		localStorage.setItem(
			key,
			JSON.stringify({
				value,
				timestamp: Date.now(),
				ttl,
			}),
		);
	}

	remove(key: string): void {
		localStorage.removeItem(key);
	}

	clear(): void {
		localStorage.clear();
	}

	clearExpired(): void {
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key) {
				this.get(key);
			}
		}
	}

	get size(): number {
		return localStorage.length;
	}
}
