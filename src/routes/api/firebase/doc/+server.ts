import { json } from '@sveltejs/kit';
import { adminDB } from '$lib/server/firebaseAdmin';
import { requireAdminAccess } from '$lib/server/apiAuth';
import { logger } from '$lib/server/logger';

// ── Resource mapping: prevents IDOR by never accepting raw Firestore paths ──
// Clients send a resource type + ID; the server maps to the actual Firestore path.
// To add new resource types, extend this map — never accept arbitrary paths.
const RESOURCE_MAP: Record<string, {
  collection: string;
  subcollections?: Record<string, string>;
}> = {
  page: { collection: 'pages' },
  user: { collection: 'users' },
  'page-articles': { collection: 'pages', subcollections: { articles: 'articles' } },
  'page-comments': { collection: 'pages', subcollections: { comments: 'comments' } },
  'page-reviews': { collection: 'pages', subcollections: { reviews: 'reviews' } },
};

function validateResourceId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{1,120}$/.test(id);
}

// ── GET: read a document or collection via resource mapping ──────────────
export async function GET({ cookies, url }: { cookies: { get: (n: string) => string | undefined }; url: URL }) {
  const auth = await requireAdminAccess(cookies);
  if (!auth.ok) return auth.response;
  if (!adminDB) return json({ success: false, error: 'Firebase Admin not initialized' }, { status: 500 });

  const resourceType = url.searchParams.get('type') || '';
  const resourceId = url.searchParams.get('id') || '';
  const subcollection = url.searchParams.get('sub') || '';
  const subId = url.searchParams.get('subId') || '';

  const mapping = RESOURCE_MAP[resourceType];
  if (!mapping) return json({ success: false, error: 'Unknown resource type' }, { status: 400 });
  if (!resourceId || !validateResourceId(resourceId)) {
    return json({ success: false, error: 'Invalid resource ID' }, { status: 400 });
  }

  try {
    const docRef = adminDB.collection(mapping.collection).doc(resourceId);

    // Subcollection document read
    if (subcollection && subId) {
      const subMapping = mapping.subcollections?.[subcollection];
      if (!subMapping) return json({ success: false, error: 'Unknown subcollection' }, { status: 400 });
      if (!validateResourceId(subId)) return json({ success: false, error: 'Invalid sub-ID' }, { status: 400 });
      const snap = await docRef.collection(subMapping).doc(subId).get();
      if (!snap.exists) return json({ success: true, data: null, id: snap.id });
      return json({ success: true, id: snap.id, data: snap.data() });
    }

    // Subcollection list read
    if (subcollection && !subId) {
      const subMapping = mapping.subcollections?.[subcollection];
      if (!subMapping) return json({ success: false, error: 'Unknown subcollection' }, { status: 400 });
      const snap = await docRef.collection(subMapping).get();
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return json({ success: true, data: docs });
    }

    // Top-level document read
    const snap = await docRef.get();
    if (!snap.exists) return json({ success: true, data: null, id: snap.id });
    return json({ success: true, id: snap.id, data: snap.data() });
  } catch (error) {
    logger.error('[firebase api] GET failed', { err: String(error) });
    return json({ success: false, error: 'Failed to read from Firebase' }, { status: 500 });
  }
}

// ── POST: create a document in a collection via resource mapping ─────────
export async function POST({ request, cookies }: { request: Request; cookies: { get: (n: string) => string | undefined } }) {
  const auth = await requireAdminAccess(cookies);
  if (!auth.ok) return auth.response;
  if (!adminDB) return json({ success: false, error: 'Firebase Admin not initialized' }, { status: 500 });

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!rawBody || typeof rawBody !== 'object') {
    return json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }
  const body = rawBody as Record<string, unknown>;

  const resourceType = typeof body?.type === 'string' ? body.type.trim() : '';
  const resourceId = typeof body?.id === 'string' ? body.id.trim() : '';
  const subcollection = typeof body?.sub === 'string' ? body.sub.trim() : '';
  const docId = typeof body?.docId === 'string' ? body.docId.trim() : '';
  const data = body.data;

  const mapping = RESOURCE_MAP[resourceType];
  if (!mapping) return json({ success: false, error: 'Unknown resource type' }, { status: 400 });
  if (!resourceId || !validateResourceId(resourceId)) {
    return json({ success: false, error: 'Invalid resource ID' }, { status: 400 });
  }
  if (!data || typeof data !== 'object') {
    return json({ success: false, error: 'Data object is required' }, { status: 400 });
  }

  try {
    const parentRef = adminDB.collection(mapping.collection).doc(resourceId);

    if (subcollection) {
      const subMapping = mapping.subcollections?.[subcollection];
      if (!subMapping) return json({ success: false, error: 'Unknown subcollection' }, { status: 400 });
      const colRef = parentRef.collection(subMapping);
      const docRef = docId && validateResourceId(docId) ? colRef.doc(docId) : colRef.doc();
      await docRef.set({ ...data });
      return json({ success: true, id: docRef.id });
    }

    // Creating a doc inside the mapped top-level collection
    const colRef = adminDB.collection(mapping.collection);
    const docRef = docId && validateResourceId(docId) ? colRef.doc(docId) : colRef.doc();
    await docRef.set({ ...data });
    return json({ success: true, id: docRef.id });
  } catch (error) {
    logger.error('[firebase api] POST failed', { err: String(error) });
    return json({ success: false, error: 'Failed to create document' }, { status: 500 });
  }
}

// ── PUT / PATCH: update a document via resource mapping ──────────────────
export async function PUT({ request, cookies }: { request: Request; cookies: { get: (n: string) => string | undefined } }) {
  return updateDoc(request, cookies, false);
}

export async function PATCH({ request, cookies }: { request: Request; cookies: { get: (n: string) => string | undefined } }) {
  return updateDoc(request, cookies, true);
}

async function updateDoc(
  request: Request,
  cookies: { get: (n: string) => string | undefined },
  merge: boolean
) {
  const auth = await requireAdminAccess(cookies);
  if (!auth.ok) return auth.response;
  if (!adminDB) return json({ success: false, error: 'Firebase Admin not initialized' }, { status: 500 });

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!rawBody || typeof rawBody !== 'object') {
    return json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }
  const body = rawBody as Record<string, unknown>;

  const resourceType = typeof body?.type === 'string' ? body.type.trim() : '';
  const resourceId = typeof body?.id === 'string' ? body.id.trim() : '';
  const subcollection = typeof body?.sub === 'string' ? body.sub.trim() : '';
  const subId = typeof body?.subId === 'string' ? body.subId.trim() : '';
  const data = body.data;

  const mapping = RESOURCE_MAP[resourceType];
  if (!mapping) return json({ success: false, error: 'Unknown resource type' }, { status: 400 });
  if (!resourceId || !validateResourceId(resourceId)) {
    return json({ success: false, error: 'Invalid resource ID' }, { status: 400 });
  }
  if (!data || typeof data !== 'object') {
    return json({ success: false, error: 'Data object is required' }, { status: 400 });
  }

  try {
    const parentRef = adminDB.collection(mapping.collection).doc(resourceId);

    if (subcollection && subId) {
      const subMapping = mapping.subcollections?.[subcollection];
      if (!subMapping) return json({ success: false, error: 'Unknown subcollection' }, { status: 400 });
      if (!validateResourceId(subId)) return json({ success: false, error: 'Invalid sub-ID' }, { status: 400 });
      await parentRef.collection(subMapping).doc(subId).set({ ...data }, { merge });
      return json({ success: true });
    }

    // Update the top-level document
    await parentRef.set({ ...data }, { merge });
    return json({ success: true });
  } catch (error) {
    logger.error('[firebase api] UPDATE failed', { err: String(error) });
    return json({ success: false, error: 'Failed to update document' }, { status: 500 });
  }
}

// ── DELETE: remove a document via resource mapping ───────────────────────
export async function DELETE({ request, cookies }: { request: Request; cookies: { get: (n: string) => string | undefined } }) {
  const auth = await requireAdminAccess(cookies);
  if (!auth.ok) return auth.response;
  if (!adminDB) return json({ success: false, error: 'Firebase Admin not initialized' }, { status: 500 });

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!rawBody || typeof rawBody !== 'object') {
    return json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }
  const body = rawBody as Record<string, unknown>;

  const resourceType = typeof body?.type === 'string' ? body.type.trim() : '';
  const resourceId = typeof body?.id === 'string' ? body.id.trim() : '';
  const subcollection = typeof body?.sub === 'string' ? body.sub.trim() : '';
  const subId = typeof body?.subId === 'string' ? body.subId.trim() : '';

  const mapping = RESOURCE_MAP[resourceType];
  if (!mapping) return json({ success: false, error: 'Unknown resource type' }, { status: 400 });
  if (!resourceId || !validateResourceId(resourceId)) {
    return json({ success: false, error: 'Invalid resource ID' }, { status: 400 });
  }

  try {
    const parentRef = adminDB.collection(mapping.collection).doc(resourceId);

    if (subcollection && subId) {
      const subMapping = mapping.subcollections?.[subcollection];
      if (!subMapping) return json({ success: false, error: 'Unknown subcollection' }, { status: 400 });
      if (!validateResourceId(subId)) return json({ success: false, error: 'Invalid sub-ID' }, { status: 400 });
      await parentRef.collection(subMapping).doc(subId).delete();
      return json({ success: true });
    }

    // Delete the top-level document
    await parentRef.delete();
    return json({ success: true });
  } catch (error) {
    logger.error('[firebase api] DELETE failed', { err: String(error) });
    return json({ success: false, error: 'Failed to delete document' }, { status: 500 });
  }
}
