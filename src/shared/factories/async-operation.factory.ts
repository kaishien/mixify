export interface AsyncOperationResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  cachedAt?: Date;
}

interface CacheOptions {
  cacheKey: string;
  ttl?: number;
  forceRefresh?: boolean;
}

interface CacheEntry<T> {
  result: AsyncOperationResult<T>;
  timestamp: number;
  ttl: number;
}

export class AsyncOperationFactory {
  private static cache = new Map<string, CacheEntry<any>>();

  static async execute<T>(
    operation: () => Promise<T>,
    options?: {
      onSuccess?: (data: T) => void;
      onError?: (error: Error) => void;
      cache?: CacheOptions;
    }
  ): Promise<AsyncOperationResult<T>> {
    const cacheOptions = options?.cache;
    
    if (cacheOptions) {
      const cachedResult = this.getFromCache<T>(cacheOptions);
      if (cachedResult && !cacheOptions.forceRefresh) {
        return cachedResult;
      }
    }

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

      if (cacheOptions) {
        this.setToCache(cacheOptions, successState);
      }

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

  private static getFromCache<T>(options: CacheOptions): AsyncOperationResult<T> | null {
    const cached = this.cache.get(options.cacheKey);
    
    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(options.cacheKey);
      return null;
    }

    return cached.result;
  }

  private static setToCache<T>(
    options: CacheOptions, 
    result: AsyncOperationResult<T>
  ): void {
    this.cache.set(options.cacheKey, {
      result,
      timestamp: Date.now(),
      ttl: options.ttl ?? 5 * 60 * 1000,
    });
  }

  static clearCache(): void {
    this.cache.clear();
  }

  static removeCacheEntry(cacheKey: string): void {
    this.cache.delete(cacheKey);
  }

  static getCacheSize(): number {
    return this.cache.size;
  }
} 