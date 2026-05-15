import { dev } from '$app/environment';
import { getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export type SessionAuthResult = {
  isAuthenticated: boolean;
  uid: string | null;
};

export async function verifyFirebaseSessionCookie(
  sessionCookie: string | undefined
): Promise<SessionAuthResult> {
  if (dev) {
    return { isAuthenticated: true, uid: 'dev-user-uid' };
  }

  if (!sessionCookie || !sessionCookie.trim()) {
    return { isAuthenticated: false, uid: null };
  }

  if (!getApps().length) {
    return { isAuthenticated: false, uid: null };
  }

  try {
    const decoded = await getAuth().verifySessionCookie(sessionCookie, true);
    return { isAuthenticated: true, uid: decoded.uid };
  } catch {
    return { isAuthenticated: false, uid: null };
  }
}
