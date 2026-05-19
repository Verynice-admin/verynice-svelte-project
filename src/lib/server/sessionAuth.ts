import { dev } from '$app/environment';
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
  if (dev) {
    return { isAuthenticated: true, uid: 'dev-user-uid', role: null };
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
