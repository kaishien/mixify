import type { CacheStrategy } from "./cache/cache-strategy.interface";

export interface AsyncOperationResult<T> {
	data: T | null;
	error: Error | null;
	isLoading: boolean;
	isError: boolean;
	isSuccess: boolean;
	cachedAt?: Date;
}

export class AsyncOperation {
	async execute<T>(
		operation: () => Promise<T>,
		options?: {
			onSuccess?: (data: T) => void;
			onError?: (error: Error) => void;
			cache?: {
				strategy: CacheStrategy;
				key: string;
				ttl?: number;
				forceRefresh?: boolean;
			};
		},
	): Promise<AsyncOperationResult<T>> {
		const cacheOptions = options?.cache;
		if (cacheOptions) {
			const cached = cacheOptions.strategy.get<T>(cacheOptions.key);
			if (cached && !cacheOptions.forceRefresh) {
				return this.createSuccessResult(cached);
			}
		}

		const result = await this.executeOperation(operation, options);

		if (cacheOptions && result.isSuccess && result.data) {
			const ttl = cacheOptions.ttl ?? 5 * 60 * 1000;
			cacheOptions.strategy.set(cacheOptions.key, result.data, ttl);
		}

		return result;
	}

	private createSuccessResult<T>(data: T): AsyncOperationResult<T> {
		return {
			data,
			error: null,
			isLoading: false,
			isError: false,
			isSuccess: true,
			cachedAt: new Date(),
		};
	}

	private async executeOperation<T>(
		operation: () => Promise<T>,
		options?: {
			onSuccess?: (data: T) => void;
			onError?: (error: Error) => void;
		},
	): Promise<AsyncOperationResult<T>> {
		const initialState: AsyncOperationResult<T> = {
			data: null,
			error: null,
			isLoading: true,
			isError: false,
			isSuccess: false,
		};

		try {
			const data = await operation();
			const successState: AsyncOperationResult<T> = {
				...initialState,
				data,
				isLoading: false,
				isSuccess: true,
				cachedAt: new Date(),
			};

			options?.onSuccess?.(data);

			return successState;
		} catch (error) {
			const errorState: AsyncOperationResult<T> = {
				...initialState,
				error: error instanceof Error ? error : new Error(String(error)),
				isLoading: false,
				isError: true,
			};

			if (options?.onError && errorState.error) {
				options.onError(errorState.error);
			}

			return errorState;
		}
	}
}
