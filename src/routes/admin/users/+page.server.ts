import type { PageServerLoad, Actions } from './$types';
import { adminDB } from '$lib/server/firebaseAdmin';
import { fail } from '@sveltejs/kit';

const VALID_ROLES = new Set(['traveller', 'business', 'admin']);
const UID_RE = /^[a-zA-Z0-9_-]{1,128}$/;

export const load: PageServerLoad = async () => {
  if (!adminDB) return { users: [] };

  const snap = await adminDB.collection('users').limit(200).get().catch(() => null);
  if (!snap) return { users: [] };

  const users = snap.docs.map((doc) => {
    const d = doc.data();
    return {
      uid: doc.id,
      email: d.email ?? '',
      displayName: d.displayName ?? '',
      role: (d.role as string) ?? 'traveller',
      suspended: !!d.suspended,
      createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
    };
  });

  // Sort newest first in JS (avoids requiring a Firestore index on createdAt)
  users.sort((a, b) => {
    if (!a.createdAt && !b.createdAt) return 0;
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  return { users };
};

export const actions: Actions = {
  updateRole: async ({ request }) => {
    if (!adminDB) return fail(503, { error: 'Service unavailable' });
    const fd = await request.formData();
    const uid = String(fd.get('uid') ?? '');
    const role = String(fd.get('role') ?? '');
    if (!UID_RE.test(uid) || !VALID_ROLES.has(role)) {
      return fail(400, { error: 'Invalid input' });
    }
    await adminDB.collection('users').doc(uid).update({ role });
    return { success: true };
  },

  toggleSuspend: async ({ request }) => {
    if (!adminDB) return fail(503, { error: 'Service unavailable' });
    const fd = await request.formData();
    const uid = String(fd.get('uid') ?? '');
    const current = fd.get('suspended') === 'true';
    if (!UID_RE.test(uid)) return fail(400, { error: 'Invalid uid' });
    await adminDB.collection('users').doc(uid).update({ suspended: !current });
    return { success: true };
  },
};
