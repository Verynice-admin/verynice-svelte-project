import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { createHash, timingSafeEqual } from 'node:crypto';

type AuthResult = { ok: true } | { ok: false; response: Response };

const localHostnames = new Set(['localhost', '127.0.0.1', '::1']);

function safeCompare(a: string, b: string): boolean {
  // Hash both values first so lengths match regardless of input, preventing
  // length-based timing leaks before timingSafeEqual runs.
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function requireAdminAccess(request: Request, url: URL): AuthResult {
  // Dev bypass: only when BYPASS_ADMIN_AUTH_IN_DEV=true is explicitly set in .env
  // Prevents a developer running `npm run dev` against the production database from
  // having silent admin access without a token.
  if (dev && localHostnames.has(url.hostname) && env.BYPASS_ADMIN_AUTH_IN_DEV === 'true') {
    return { ok: true };
  }

  const expected = String(env.FIREBASE_ADMIN_TOKEN || '').trim();
  if (!expected) {
    return {
      ok: false,
      response: json(
        { success: false, error: 'FIREBASE_ADMIN_TOKEN is not configured' },
        { status: 500 }
      )
    };
  }

  const rawHeader = request.headers.get('x-admin-token') || request.headers.get('authorization') || '';
  const provided = rawHeader.replace(/^Bearer\s+/i, '').trim();

  if (!provided || !safeCompare(provided, expected)) {
    return {
      ok: false,
      response: json({ success: false, error: 'Unauthorized' }, { status: 401 })
    };
  }

  return { ok: true };
}
