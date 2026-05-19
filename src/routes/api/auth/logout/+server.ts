import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export const POST: RequestHandler = async ({ cookies }) => {
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
