import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { verifyFirebaseSessionCookie } from '$lib/server/sessionAuth';

type AuthResult = { ok: true; uid: string } | { ok: false; response: Response };

/**
 * Verifies that the request comes from an authenticated user with the 'admin' role.
 *
 * Uses Firebase session cookies (HttpOnly, Secure, SameSite=Strict) instead of
 * a static shared secret in HTTP headers. This eliminates the attack surface
 * where anyone who knows the token gains full admin DB access.
 *
 * Migration path: during rollout, if FIREBASE_ADMIN_TOKEN is set and no session
 * cookie is present, the old header-based auth is attempted as a fallback via
 * requireAdminAccessLegacy(). Once all admin clients are migrated to session
 * cookies, remove the legacy export.
 */
export async function requireAdminAccess(
  cookies: { get: (name: string) => string | undefined }
): Promise<AuthResult> {
  // ── Primary: session cookie RBAC ──────────────────────────────────────
  const sessionCookie = cookies.get('__session');
  const session = await verifyFirebaseSessionCookie(sessionCookie);

  if (session.isAuthenticated && session.uid && session.role === 'admin') {
    return { ok: true, uid: session.uid };
  }

  // ── Denied ────────────────────────────────────────────────────────────
  if (session.isAuthenticated && session.role !== 'admin') {
    return {
      ok: false,
      response: json({ success: false, error: 'Forbidden: admin role required' }, { status: 403 })
    };
  }

  return {
    ok: false,
    response: json({ success: false, error: 'Unauthorized' }, { status: 401 })
  };
}

/**
 * Legacy header-based admin auth — ONLY for use during migration.
 * Accepts the old x-admin-token / Authorization header.
 * Will be removed once all admin clients use session cookies.
 */
export async function requireAdminAccessLegacy(
  request: Request
): Promise<AuthResult> {
  const { createHash, timingSafeEqual } = await import('node:crypto');

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

  if (!provided) {
    return {
      ok: false,
      response: json({ success: false, error: 'Unauthorized' }, { status: 401 })
    };
  }

  const ha = createHash('sha256').update(provided).digest();
  const hb = createHash('sha256').update(expected).digest();
  if (!timingSafeEqual(ha, hb)) {
    return {
      ok: false,
      response: json({ success: false, error: 'Unauthorized' }, { status: 401 })
    };
  }

  return { ok: true, uid: 'legacy-token-admin' };
}
