import { adminDB } from '$lib/server/firebaseAdmin';

function serializeDates(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  const out = { ...obj };
  for (const k of Object.keys(out)) {
    const v = out[k];
    if (v && typeof v.toDate === 'function') out[k] = v.toDate().toISOString();
  }
  return out;
}

export async function load() {
  if (!adminDB) return { tips: [], error: 'DB not initialized' };
  try {
    const snap = await adminDB.collection('pages').doc('travelTipsPage').collection('tips').orderBy('order', 'asc').get();
    const tips = snap.docs.map(d => ({ id: d.id, ...serializeDates(d.data()) }));
    return { tips };
  } catch (e) {
    console.error('[tips] load error', e);
    return { tips: [], error: 'Failed to fetch tips' };
  }
}


