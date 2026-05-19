import type { LayoutServerLoadEvent } from './$types';
import { verifyFirebaseSessionCookie } from '$lib/server/sessionAuth';
import { adminDB } from '$lib/server/firebaseAdmin';
import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';

export async function load(event: LayoutServerLoadEvent) {
  const sessionCookie = event.cookies.get('__session');
  const session = await verifyFirebaseSessionCookie(sessionCookie);

  if (!session.isAuthenticated) {
    throw redirect(303, '/get-started');
  }

  const uid = session.uid!;

  // In dev mode verifyFirebaseSessionCookie returns a synthetic uid that has no
  // Firestore document. Skip the role fetch so local development stays working.
  if (dev) {
    return { isAuthenticated: true, uid, role: 'business' as const };
  }

  let role: string | null = null;
  if (adminDB) {
    try {
      const snap = await adminDB.collection('users').doc(uid).get();
      role = snap.exists ? (snap.data()?.role ?? null) : null;
    } catch (e) {
      console.error('[dashboard layout] Failed to fetch user role:', e);
    }
  }

  // Any user whose document is missing or has an unrecognised role is bounced.
  if (role !== 'business' && role !== 'traveller') {
    throw redirect(303, '/get-started');
  }

  return { isAuthenticated: true, uid, role };
}
