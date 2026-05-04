import { redirect } from '@sveltejs/kit';
import { verifyFirebaseSessionCookie } from '$lib/server/sessionAuth';

export async function load({ cookies }: { cookies: { get: (name: string) => string | undefined } }) {
  const session = await verifyFirebaseSessionCookie(cookies.get('__session'));
  if (!session.isAuthenticated) {
    throw redirect(303, '/get-started');
  }

  return {
    userData: null
  };
}
