import type { LayoutServerLoad } from './$types';
import { adminDB } from '$lib/server/firebaseAdmin';
import { writeAuditLog } from '$lib/server/adminAudit';
import { redirect } from '@sveltejs/kit';

function getIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',').pop()?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

export const load: LayoutServerLoad = async ({ locals, url, request }) => {
  // authHandle in hooks.server.ts already verified the session cookie and
  // populated event.locals — no second Firebase call needed here.
  const { isAuthenticated, uid, role: jwtRole } = locals;

  if (!isAuthenticated || !uid) {
    await writeAuditLog({
      uid: uid ?? 'anonymous',
      path: url.pathname,
      ip: getIp(request),
      action: 'rejected',
      detail: 'unauthenticated',
    });
    throw redirect(303, '/');
  }

  // JWT claim is the fast path. Fall back to Firestore for sessions issued
  // before the admin claim was stamped (avoids forcing a sign-out).
  let role: string | null = jwtRole;

  if (role !== 'admin' && adminDB) {
    try {
      const snap = await adminDB.collection('users').doc(uid).get();
      role = snap.exists ? ((snap.data()?.role as string) ?? null) : null;
    } catch {
      // leave role as-is; the check below will reject if still not admin
    }
  }

  if (role !== 'admin') {
    await writeAuditLog({
      uid,
      path: url.pathname,
      ip: getIp(request),
      action: 'rejected',
      detail: `role was "${role ?? 'null'}"`,
    });
    throw redirect(303, '/');
  }

  await writeAuditLog({ uid, path: url.pathname, ip: getIp(request), action: 'access' });

  return { uid, role: 'admin' as const };
};
