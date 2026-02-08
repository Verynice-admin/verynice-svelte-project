import { json } from '@sveltejs/kit';
import { adminDB } from '$lib/server/firebaseAdmin';
import { env } from '$env/dynamic/private';

function requireAdminToken(request: Request) {
  const token = request.headers.get('x-admin-token') || request.headers.get('authorization') || '';
  const expected = env.FIREBASE_ADMIN_TOKEN || '';
  if (!expected) {
    return { ok: false, status: 500, error: 'FIREBASE_ADMIN_TOKEN not configured' };
  }
  if (token.replace(/^Bearer\s+/i, '') !== expected) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }
  return { ok: true };
}

function isValidPath(path: string) {
  return typeof path === 'string' && path.trim().length > 0 && !path.includes('//');
}

function isDocPath(path: string) {
  return path.split('/').filter(Boolean).length % 2 === 0;
}

function isCollectionPath(path: string) {
  return path.split('/').filter(Boolean).length % 2 === 1;
}

export async function GET({ request, url }) {
  const auth = requireAdminToken(request);
  if (!auth.ok) return json({ success: false, error: auth.error }, { status: auth.status });
  if (!adminDB) return json({ success: false, error: 'Firebase Admin not initialized' }, { status: 500 });

  const path = url.searchParams.get('path') || '';
  if (!isValidPath(path)) {
    return json({ success: false, error: 'Invalid path' }, { status: 400 });
  }

  try {
    if (isDocPath(path)) {
      const snap = await adminDB.doc(path).get();
      if (!snap.exists) {
        return json({ success: true, data: null, id: snap.id });
      }
      return json({ success: true, id: snap.id, data: snap.data() });
    }

    if (isCollectionPath(path)) {
      const snap = await adminDB.collection(path).get();
      const docs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return json({ success: true, data: docs });
    }

    return json({ success: false, error: 'Path must be doc or collection' }, { status: 400 });
  } catch (error) {
    console.error('[firebase api] GET failed', error);
    return json({ success: false, error: 'Failed to read from Firebase' }, { status: 500 });
  }
}

export async function POST({ request }) {
  const auth = requireAdminToken(request);
  if (!auth.ok) return json({ success: false, error: auth.error }, { status: auth.status });
  if (!adminDB) return json({ success: false, error: 'Firebase Admin not initialized' }, { status: 500 });

  const body = await request.json().catch(() => null);
  const path = body?.path || '';
  const data = body?.data || null;
  const docId = body?.docId || null;

  if (!isValidPath(path) || !data || typeof data !== 'object') {
    return json({ success: false, error: 'Invalid path or data' }, { status: 400 });
  }

  if (!isCollectionPath(path)) {
    return json({ success: false, error: 'POST requires a collection path' }, { status: 400 });
  }

  try {
    const collectionRef = adminDB.collection(path);
    const docRef = docId ? collectionRef.doc(docId) : collectionRef.doc();
    await docRef.set({ ...data });
    return json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('[firebase api] POST failed', error);
    return json({ success: false, error: 'Failed to create document' }, { status: 500 });
  }
}

export async function PUT({ request }) {
  return updateDoc(request, false);
}

export async function PATCH({ request }) {
  return updateDoc(request, true);
}

async function updateDoc(request: Request, merge: boolean) {
  const auth = requireAdminToken(request);
  if (!auth.ok) return json({ success: false, error: auth.error }, { status: auth.status });
  if (!adminDB) return json({ success: false, error: 'Firebase Admin not initialized' }, { status: 500 });

  const body = await request.json().catch(() => null);
  const path = body?.path || '';
  const data = body?.data || null;

  if (!isValidPath(path) || !data || typeof data !== 'object') {
    return json({ success: false, error: 'Invalid path or data' }, { status: 400 });
  }

  if (!isDocPath(path)) {
    return json({ success: false, error: 'PUT/PATCH requires a document path' }, { status: 400 });
  }

  try {
    await adminDB.doc(path).set({ ...data }, { merge });
    return json({ success: true });
  } catch (error) {
    console.error('[firebase api] UPDATE failed', error);
    return json({ success: false, error: 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE({ request }) {
  const auth = requireAdminToken(request);
  if (!auth.ok) return json({ success: false, error: auth.error }, { status: auth.status });
  if (!adminDB) return json({ success: false, error: 'Firebase Admin not initialized' }, { status: 500 });

  const body = await request.json().catch(() => null);
  const path = body?.path || '';

  if (!isValidPath(path)) {
    return json({ success: false, error: 'Invalid path' }, { status: 400 });
  }

  if (!isDocPath(path)) {
    return json({ success: false, error: 'DELETE requires a document path' }, { status: 400 });
  }

  try {
    await adminDB.doc(path).delete();
    return json({ success: true });
  } catch (error) {
    console.error('[firebase api] DELETE failed', error);
    return json({ success: false, error: 'Failed to delete document' }, { status: 500 });
  }
}
