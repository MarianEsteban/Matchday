import "server-only";

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
  staleUntil: number;
};

const globalCache = globalThis as typeof globalThis & {
  __matchdayServerCache?: Map<string, CacheEntry<unknown>>;
};

const cache = globalCache.__matchdayServerCache ?? new Map<string, CacheEntry<unknown>>();
globalCache.__matchdayServerCache = cache;

export function getServerCacheValue<T>(key: string, options: { allowStale?: boolean } = {}): T | undefined {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  const now = Date.now();
  if (entry.expiresAt > now || (options.allowStale && entry.staleUntil > now)) return entry.value;
  cache.delete(key);
  return undefined;
}

export function setServerCacheValue<T>(key: string, value: T, ttlSeconds: number, staleSeconds = 86_400): T {
  const now = Date.now();
  cache.set(key, { value, expiresAt: now + ttlSeconds * 1000, staleUntil: now + (ttlSeconds + staleSeconds) * 1000 });
  return value;
}

export function getOrSetInFlight<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const inFlightKey = `in-flight:${key}`;
  const existing = getServerCacheValue<Promise<T>>(inFlightKey);
  if (existing) return existing;
  const promise = loader().finally(() => cache.delete(inFlightKey));
  setServerCacheValue(inFlightKey, promise, 30, 0);
  return promise;
}
