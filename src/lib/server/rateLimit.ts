import { adminDB } from '$lib/server/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

// In-memory fallback for when adminDB is unavailable (local dev without service account)
type Bucket = { count: number; resetAt: number };
const fallbackBuckets = new Map<string, Bucket>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
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
          console.log(JSON.stringify({ ts: new Date().toISOString(), event: 'rate_limit_exceeded', scope, retryAfterSeconds }));
          return { allowed: false, retryAfterSeconds };
        }

        tx.update(docRef, { count: FieldValue.increment(1) });
        return { allowed: true };
      });
    } catch (err) {
      console.error('[rateLimit] Firestore error, falling back to in-memory:', err);
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
    console.log(JSON.stringify({ ts: new Date().toISOString(), event: 'rate_limit_exceeded', scope, retryAfterSeconds, source: 'memory' }));
    return { allowed: false, retryAfterSeconds };
  }
  existing.count += 1;
  return { allowed: true };
}
