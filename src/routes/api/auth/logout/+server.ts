import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { enforceRateLimit } from '$lib/server/rateLimit';

export const POST: RequestHandler = async ({ cookies, request }) => {
  const rate = await enforceRateLimit({
    request,
    scope: 'api-auth-logout',
    maxRequests: 10,
    windowMs: 60_000
  });
  if (!rate.allowed) {
    return json(
      { error: 'Too many logout attempts. Please wait.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }
  const sessionCookie = cookies.get('__session');

  if (sessionCookie && getApps().length) {
    try {
      const decoded = await getAuth().verifySessionCookie(sessionCookie, false);
      await getAuth().revokeRefreshTokens(decoded.uid);
    } catch {
      // Cookie invalid or already expired — still clear it
    }
  }

  cookies.delete('__session', { path: '/' });

  return json({ success: true });
};
