import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOrFetch, invalidate } from '$lib/server/cache';

// The cache uses a module-level Map that persists across tests within the same module instance.
// We use unique key prefixes per test group to avoid cross-test pollution.

describe('getOrFetch', () => {
    it('calls the fetcher on first access', async () => {
        const fetcher = vi.fn().mockResolvedValue('value-a');
        const result = await getOrFetch('test:first-access', fetcher, 5000);
        expect(fetcher).toHaveBeenCalledOnce();
        expect(result).toBe('value-a');
    });

    it('returns cached value on subsequent calls within TTL', async () => {
        const fetcher = vi.fn().mockResolvedValue('cached');
        await getOrFetch('test:cached', fetcher, 5000);
        const second = await getOrFetch('test:cached', fetcher, 5000);
        expect(fetcher).toHaveBeenCalledOnce(); // only called once
        expect(second).toBe('cached');
    });

    it('calls fetcher again after TTL expires', async () => {
        vi.useFakeTimers();
        const fetcher = vi.fn().mockResolvedValue('fresh');
        await getOrFetch('test:ttl', fetcher, 100);
        vi.advanceTimersByTime(200);
        await getOrFetch('test:ttl', fetcher, 100);
        expect(fetcher).toHaveBeenCalledTimes(2);
        vi.useRealTimers();
    });

    it('propagates errors from the fetcher', async () => {
        const fetcher = vi.fn().mockRejectedValue(new Error('fetch-error'));
        await expect(getOrFetch('test:error', fetcher, 5000)).rejects.toThrow('fetch-error');
    });

    it('stores different values for different keys', async () => {
        const fetchA = vi.fn().mockResolvedValue('alpha');
        const fetchB = vi.fn().mockResolvedValue('beta');
        const a = await getOrFetch('test:key-a', fetchA, 5000);
        const b = await getOrFetch('test:key-b', fetchB, 5000);
        expect(a).toBe('alpha');
        expect(b).toBe('beta');
    });
});

describe('invalidate', () => {
    it('forces fetcher to run again after invalidation', async () => {
        const fetcher = vi.fn().mockResolvedValue('v1');
        await getOrFetch('test:invalidate', fetcher, 60_000);
        invalidate('test:invalidate');
        fetcher.mockResolvedValue('v2');
        const result = await getOrFetch('test:invalidate', fetcher, 60_000);
        expect(fetcher).toHaveBeenCalledTimes(2);
        expect(result).toBe('v2');
    });

    it('is a no-op for keys that do not exist', () => {
        expect(() => invalidate('test:nonexistent')).not.toThrow();
    });
});
