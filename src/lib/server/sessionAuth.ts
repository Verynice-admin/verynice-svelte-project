import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export type SessionAuthResult = {
  isAuthenticated: boolean;
  uid: string | null;
  role: string | null;
};

export async function verifyFirebaseSessionCookie(
  sessionCookie: string | undefined
): Promise<SessionAuthResult> {
  if (dev && env.SKIP_AUTH_IN_DEV === 'true') {
    return { isAuthenticated: true, uid: 'dev-user-uid', role: env.DEV_USER_ROLE ?? 'traveller' };
  }

  if (!sessionCookie || !sessionCookie.trim()) {
    return { isAuthenticated: false, uid: null, role: null };
  }

  if (!getApps().length) {
    return { isAuthenticated: false, uid: null, role: null };
  }

  try {
    const decoded = await getAuth().verifySessionCookie(sessionCookie, true);
    const role = (decoded.role as string | undefined) ?? null;
    return { isAuthenticated: true, uid: decoded.uid, role };
  } catch {
    return { isAuthenticated: false, uid: null, role: null };
  }
}
