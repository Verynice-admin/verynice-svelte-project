import type { LayoutServerLoadEvent } from './$types';
import { verifyFirebaseSessionCookie } from '$lib/server/sessionAuth';
import { redirect } from '@sveltejs/kit';

export async function load(event: LayoutServerLoadEvent) {
  const sessionCookie = event.cookies.get('__session');
  const session = await verifyFirebaseSessionCookie(sessionCookie);

  if (!session.isAuthenticated) {
    throw redirect(303, '/get-started');
  }

  return {
    isAuthenticated: session.isAuthenticated,
    uid: session.uid
  };
}
