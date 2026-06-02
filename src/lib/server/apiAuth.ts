import { json } from '@sveltejs/kit';
import { verifyFirebaseSessionCookie } from '$lib/server/sessionAuth';

type AuthResult = { ok: true; uid: string } | { ok: false; response: Response };

/**
 * Verifies that the request comes from an authenticated user with the 'admin' role.
 * Uses Firebase session cookies (HttpOnly, Secure, SameSite=Strict).
 */
export async function requireAdminAccess(
  cookies: { get: (name: string) => string | undefined }
): Promise<AuthResult> {
  const sessionCookie = cookies.get('__session');
  const session = await verifyFirebaseSessionCookie(sessionCookie);

  if (session.isAuthenticated && session.uid && session.role === 'admin') {
    return { ok: true, uid: session.uid };
  }

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
