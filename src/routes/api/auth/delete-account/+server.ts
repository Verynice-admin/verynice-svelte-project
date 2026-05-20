import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { adminDB } from '$lib/server/firebaseAdmin';
import { verifyFirebaseSessionCookie } from '$lib/server/sessionAuth';

export const DELETE: RequestHandler = async ({ cookies }) => {
  const sessionCookie = cookies.get('__session');
  const session = await verifyFirebaseSessionCookie(sessionCookie);

  if (!session.isAuthenticated || !session.uid) {
    throw error(401, 'Not authenticated');
  }

  if (!getApps().length) {
    throw error(503, 'Auth service unavailable');
  }

  const uid = session.uid;
  const adminAuth = getAuth();

  // Delete Firestore user document and private subcollection
  if (adminDB) {
    try {
      const privateSnap = await adminDB
        .collection('users')
        .doc(uid)
        .collection('private')
        .get();

      const batch = adminDB.batch();
      for (const doc of privateSnap.docs) {
        batch.delete(doc.ref);
      }
      batch.delete(adminDB.collection('users').doc(uid));
      await batch.commit();
    } catch (e) {
      console.error('[delete-account] Failed to delete Firestore data:', e);
    }
  }

  // Revoke all refresh tokens then delete the Firebase Auth user
  try {
    await adminAuth.revokeRefreshTokens(uid);
    await adminAuth.deleteUser(uid);
  } catch (e) {
    console.error('[delete-account] Failed to delete Firebase Auth user:', e);
    throw error(500, 'Failed to delete account');
  }

  // Clear session cookie
  cookies.delete('__session', { path: '/' });

  return json({ success: true });
};
