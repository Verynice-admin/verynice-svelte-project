import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ parent }) => {
  const { role } = await parent();
  if (role !== 'business') {
    throw redirect(303, '/get-started');
  }
  return {};
};
