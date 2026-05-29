import { adminDB } from '$lib/server/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { logger } from '$lib/server/logger';

type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

// In-memory fallback for when adminDB is unavailable (local dev without service account)
type Bucket = { count: number; resetAt: number };
const fallbackBuckets = new Map<string, Bucket>();

function getClientIp(request: Request): string {
  // Priority 1 — Cloudflare sets CF-Connecting-IP to the true visitor IP and it cannot be
  // spoofed by the client (Cloudflare strips any client-provided header of that name).
  const cfIp = request.headers.get('cf-connecting-ip')?.trim();
  if (cfIp) return cfIp;

  // Priority 2 — X-Forwarded-For is a comma-separated list: client, proxy1, proxy2, ...
  // Each hop APPENDS its own IP, so the rightmost value is the last trusted proxy — the one
  // immediately upstream of us. Taking the first value is insecure because the client
  // controls it (they can prepend any IP). Taking the last gives the nearest trusted hop.
  // On Vercel the last entry is the Vercel edge node; on direct-origin traffic it is the
  // real client. Either way it cannot be injected by an end-user.
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',').map((s) => s.trim()).filter(Boolean);
    const last = ips[ips.length - 1];
    if (last) return last;
  }

  // Priority 3 — Vercel / nginx set X-Real-IP to the connecting client IP.
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  // Fallback — no IP header present (raw local TCP connection in dev/test).
  // Use a per-request random key so all anonymous requests do NOT share one rate-limit
  // bucket, which would let one attacker exhaust the limit for every headerless client.
  return `anon-${Math.random().toString(36).slice(2, 10)}`;
}

export async function enforceRateLimit(options: {
  request: Request;
  scope: string;
  maxRequests: number;
  windowMs: number;
}): Promise<RateLimitResult> {
  const { request, scope, maxRequests, windowMs } = options;
  const ip = getClientIp(request);
  const key = `${scope}:${ip}`;
  const now = Date.now();

  if (adminDB) {
    try {
      const docRef = adminDB.collection('_ratelimit').doc(key);
      return await adminDB.runTransaction(async (tx) => {
        const snap = await tx.get(docRef);
        const data = snap.data();

        if (!data || data.resetAt.toMillis() <= now) {
          tx.set(docRef, { count: 1, resetAt: new Date(now + windowMs) });
          return { allowed: true };
        }

        if (data.count >= maxRequests) {
          const retryAfterSeconds = Math.max(1, Math.ceil((data.resetAt.toMillis() - now) / 1000));
          logger.warn('rate_limit_exceeded', { event: 'rate_limit_exceeded', scope, retryAfterSeconds });
          return { allowed: false, retryAfterSeconds };
        }

        tx.update(docRef, { count: FieldValue.increment(1) });
        return { allowed: true };
      });
    } catch (err) {
      logger.error('[rateLimit] Firestore error, falling back to in-memory', { err: String(err) });
    }
  }

  // In-memory fallback
  const existing = fallbackBuckets.get(key);
  if (!existing || existing.resetAt <= now) {
    fallbackBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (existing.count >= maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    logger.warn('rate_limit_exceeded', { event: 'rate_limit_exceeded', scope, retryAfterSeconds, source: 'memory' });
    return { allowed: false, retryAfterSeconds };
  }
  existing.count += 1;
  return { allowed: true };
}
