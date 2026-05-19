import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
  const { role } = await parent();
  if (role !== 'traveller') {
    throw redirect(303, '/get-started');
  }
  return { userData: null };
};
