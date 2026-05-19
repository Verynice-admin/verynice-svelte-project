interface CacheEntry<T> {
	value: T;
	expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export async function getOrFetch<T>(
	key: string,
	fetcher: () => Promise<T>,
	ttlMs: number
): Promise<T> {
	const entry = store.get(key) as CacheEntry<T> | undefined;
	if (entry && Date.now() < entry.expiresAt) {
		return entry.value;
	}
	const value = await fetcher();
	store.set(key, { value, expiresAt: Date.now() + ttlMs });
	return value;
}

export function invalidate(key: string): void {
	store.delete(key);
}
