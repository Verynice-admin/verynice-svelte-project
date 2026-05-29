import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { adminDB } from '$lib/server/firebaseAdmin';
import { enforceRateLimit } from '$lib/server/rateLimit';
import { logger } from '$lib/server/logger';

function logAuthEvent(event: string, data: Record<string, unknown>) {
	logger.info(event, data);
}

const SESSION_DURATION_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export const POST: RequestHandler = async ({ request, cookies }) => {
  // Tight rate limit on session creation: 5 attempts per 5 minutes per IP.
  // Prevents Firebase ID-token exchange abuse and login-flow brute-forcing.
  const rate = await enforceRateLimit({
    request,
    scope: 'api-auth-session',
    maxRequests: 5,
    windowMs: 5 * 60_000
  });
  if (!rate.allowed) {
    return json(
      { error: 'Too many login attempts. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

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
    logAuthEvent('login_failure', { reason: 'invalid_id_token' });
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
      logger.error('[session] Failed to fetch user role', { err: String(e) });
    }
  }

  // Set custom claim if role is valid and not already stamped on the token
  if ((role === 'business' || role === 'traveller') && decoded.role !== role) {
    try {
      await adminAuth.setCustomUserClaims(uid, { role });
    } catch (e) {
      logger.error('[session] Failed to set custom claim', { err: String(e) });
    }
  }

  let sessionCookie: string;
  try {
    sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS
    });
  } catch {
    logAuthEvent('login_failure', { uid, reason: 'session_cookie_creation_failed' });
    throw error(500, 'Failed to create session cookie');
  }

  logAuthEvent('login_success', { uid, role: role ?? 'none' });

  cookies.set('__session', sessionCookie, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_DURATION_MS / 1000
  });

  return json({ success: true });
};
