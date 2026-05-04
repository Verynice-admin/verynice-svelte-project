import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

type AuthResult = { ok: true } | { ok: false; response: Response };

const localHostnames = new Set(['localhost', '127.0.0.1', '::1']);

export function requireAdminAccess(request: Request, url: URL): AuthResult {
  // Keep local developer workflows working without extra setup.
  if (dev && localHostnames.has(url.hostname)) {
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

  if (!provided || provided !== expected) {
    return {
      ok: false,
      response: json({ success: false, error: 'Unauthorized' }, { status: 401 })
    };
  }

  return { ok: true };
}
