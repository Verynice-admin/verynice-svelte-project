import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
  const { uid, role } = await parent();
  return { userData: { uid, role } };
};
