import type { PageServerLoad } from './$types';
import { readAuditLog } from '$lib/server/adminAudit';

export const load: PageServerLoad = async () => {
  const entries = await readAuditLog(200);
  return { entries };
};
