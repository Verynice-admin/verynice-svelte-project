import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { adminDB } from '$lib/server/firebaseAdmin';

const SESSION_DURATION_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export const POST: RequestHandler = async ({ request, cookies }) => {
  let idToken: string | undefined;
  try {
    const body = await request.json();
    idToken = typeof body?.idToken === 'string' ? body.idToken.trim() : undefined;
  } catch {
    throw error(400, 'Invalid request body');
  }

  if (!idToken) throw error(400, 'idToken is required');
  if (!getApps().length) throw error(503, 'Auth service unavailable');

  const adminAuth = getAuth();

  let decoded: Awaited<ReturnType<typeof adminAuth.verifyIdToken>>;
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch {
    throw error(401, 'Invalid ID token');
  }

  const uid = decoded.uid;

  // Fetch role from Firestore (source of truth until claim is propagated)
  let role: string | null = decoded.role as string | null ?? null;
  if (!role && adminDB) {
    try {
      const snap = await adminDB.collection('users').doc(uid).get();
      role = snap.exists ? (snap.data()?.role ?? null) : null;
    } catch (e) {
      console.error('[session] Failed to fetch user role:', e);
    }
  }

  // Set custom claim if role is valid and not already stamped on the token
  if ((role === 'business' || role === 'traveller') && decoded.role !== role) {
    try {
      await adminAuth.setCustomUserClaims(uid, { role });
    } catch (e) {
      console.error('[session] Failed to set custom claim:', e);
    }
  }

  let sessionCookie: string;
  try {
    sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS
    });
  } catch {
    throw error(500, 'Failed to create session cookie');
  }

  cookies.set('__session', sessionCookie, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_DURATION_MS / 1000
  });

  return json({ success: true });
};
