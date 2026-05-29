import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Firebase Admin module so enforceRateLimit uses the in-memory fallback path.
// This lets tests run without any Firebase credentials or network access.
vi.mock('$lib/server/firebaseAdmin', () => ({ adminDB: null }));
vi.mock('firebase-admin/firestore', () => ({
    FieldValue: { increment: (n: number) => n }
}));

import { enforceRateLimit } from '$lib/server/rateLimit';

// Build a minimal Request object with the given IP headers.
function makeRequest(headers: Record<string, string> = {}): Request {
    return new Request('http://localhost/test', { headers });
}

// Each test uses a unique scope to avoid bucket collisions within the shared in-memory Map.
let scopeCounter = 0;
function uniqueScope(): string {
    return `test-scope-${++scopeCounter}`;
}

describe('enforceRateLimit — in-memory fallback (adminDB=null)', () => {
    it('allows the first request within the window', async () => {
        const result = await enforceRateLimit({
            request: makeRequest({ 'cf-connecting-ip': '1.2.3.4' }),
            scope: uniqueScope(),
            maxRequests: 3,
            windowMs: 60_000
        });
        expect(result.allowed).toBe(true);
    });

    it('allows requests up to the limit', async () => {
        const scope = uniqueScope();
        const ip = '10.0.0.1';
        for (let i = 0; i < 5; i++) {
            const r = await enforceRateLimit({
                request: makeRequest({ 'x-real-ip': ip }),
                scope,
                maxRequests: 5,
                windowMs: 60_000
            });
            expect(r.allowed).toBe(true);
        }
    });

    it('blocks requests that exceed the limit', async () => {
        const scope = uniqueScope();
        const ip = '10.0.0.2';
        for (let i = 0; i < 2; i++) {
            await enforceRateLimit({
                request: makeRequest({ 'x-real-ip': ip }),
                scope,
                maxRequests: 2,
                windowMs: 60_000
            });
        }
        const blocked = await enforceRateLimit({
            request: makeRequest({ 'x-real-ip': ip }),
            scope,
            maxRequests: 2,
            windowMs: 60_000
        });
        expect(blocked.allowed).toBe(false);
        if (!blocked.allowed) {
            expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
        }
    });

    it('resets the bucket after the window expires', async () => {
        vi.useFakeTimers();
        const scope = uniqueScope();
        const ip = '10.0.0.3';
        for (let i = 0; i < 2; i++) {
            await enforceRateLimit({
                request: makeRequest({ 'x-real-ip': ip }),
                scope,
                maxRequests: 2,
                windowMs: 1_000
            });
        }
        // Advance past the window
        vi.advanceTimersByTime(2_000);
        const result = await enforceRateLimit({
            request: makeRequest({ 'x-real-ip': ip }),
            scope,
            maxRequests: 2,
            windowMs: 1_000
        });
        expect(result.allowed).toBe(true);
        vi.useRealTimers();
    });

    describe('IP detection priority', () => {
        it('prefers CF-Connecting-IP over X-Forwarded-For', async () => {
            // Same CF IP → share a bucket; different XFF should not matter
            const scope = uniqueScope();
            await enforceRateLimit({
                request: makeRequest({ 'cf-connecting-ip': '9.9.9.9', 'x-forwarded-for': '1.1.1.1' }),
                scope,
                maxRequests: 1,
                windowMs: 60_000
            });
            const second = await enforceRateLimit({
                request: makeRequest({ 'cf-connecting-ip': '9.9.9.9', 'x-forwarded-for': '2.2.2.2' }),
                scope,
                maxRequests: 1,
                windowMs: 60_000
            });
            expect(second.allowed).toBe(false); // same CF IP → same bucket → blocked
        });

        it('takes the last entry of X-Forwarded-For', async () => {
            // Two requests with different first XFF entries but same last entry → same bucket
            const scope = uniqueScope();
            await enforceRateLimit({
                request: makeRequest({ 'x-forwarded-for': 'attacker-ip, 5.5.5.5' }),
                scope,
                maxRequests: 1,
                windowMs: 60_000
            });
            const second = await enforceRateLimit({
                request: makeRequest({ 'x-forwarded-for': 'other-ip, 5.5.5.5' }),
                scope,
                maxRequests: 1,
                windowMs: 60_000
            });
            expect(second.allowed).toBe(false); // same last XFF → same bucket → blocked
        });

        it('falls back to X-Real-IP when no CF or XFF header', async () => {
            const scope = uniqueScope();
            await enforceRateLimit({
                request: makeRequest({ 'x-real-ip': '7.7.7.7' }),
                scope,
                maxRequests: 1,
                windowMs: 60_000
            });
            const second = await enforceRateLimit({
                request: makeRequest({ 'x-real-ip': '7.7.7.7' }),
                scope,
                maxRequests: 1,
                windowMs: 60_000
            });
            expect(second.allowed).toBe(false);
        });

        it('uses a unique random key when no IP header is present', async () => {
            // Without any IP header each request gets an anon-* key, so they should
            // never share a bucket and always be allowed.
            const scope = uniqueScope();
            const results = await Promise.all(
                Array.from({ length: 10 }, () =>
                    enforceRateLimit({
                        request: makeRequest({}),
                        scope,
                        maxRequests: 1,
                        windowMs: 60_000
                    })
                )
            );
            expect(results.every(r => r.allowed)).toBe(true);
        });
    });
});
