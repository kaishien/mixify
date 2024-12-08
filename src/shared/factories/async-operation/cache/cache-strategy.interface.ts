export interface CacheStrategy {
	get<T>(key: string): T | null;
	set<T>(key: string, value: T, ttl: number): void;
	remove(key: string): void;
	clear(): void;
	clearExpired(): void;
	size: number;
}
