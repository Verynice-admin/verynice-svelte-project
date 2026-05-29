import { json } from '@sveltejs/kit';
import { seedCharynCanyon } from '$lib/server/seedCharynCanyon';
import { requireAdminAccess } from '$lib/server/apiAuth';
import { logger } from '$lib/server/logger';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
    const auth = await requireAdminAccess(cookies);
    if (!auth.ok) return auth.response;

    try {
        await seedCharynCanyon();
        return json({ success: true, message: "Charyn Canyon seeded successfully" });
    } catch (err) {
        logger.error('[seed] Charyn Canyon seeding failed', { err: String(err) });
        return json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
};
