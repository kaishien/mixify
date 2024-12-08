import type { CacheStrategy } from "./cache-strategy.interface";

export class MemoryCacheStrategy implements CacheStrategy {
	private cache = new Map<string, { value: unknown; timestamp: number; ttl: number }>();

	get<T>(key: string): T | null {
		const entry = this.cache.get(key);
		if (!entry) return null;

		if (Date.now() - entry.timestamp > entry.ttl) {
			this.cache.delete(key);
			return null;
		}

		return entry.value as T;
	}

	set<T>(key: string, value: T, ttl: number): void {
		this.cache.set(key, {
			value,
			timestamp: Date.now(),
			ttl,
		});
	}

	remove(key: string): void {
		this.cache.delete(key);
	}

	clear(): void {
		this.cache.clear();
	}

	clearExpired(): void {
		const now = Date.now();
		for (const [key, entry] of this.cache.entries()) {
			if (now - entry.timestamp > entry.ttl) {
				this.cache.delete(key);
			}
		}
	}

	get size(): number {
		return this.cache.size;
	}
}
