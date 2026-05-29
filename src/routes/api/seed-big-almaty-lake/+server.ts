import { json } from '@sveltejs/kit';
import { createBigAlmatyLakePage } from '$lib/server/seedBigAlmatyLake';
import { requireAdminAccess } from '$lib/server/apiAuth';
import { logger } from '$lib/server/logger';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
    const auth = await requireAdminAccess(cookies);
    if (!auth.ok) return auth.response;

    try {
        await createBigAlmatyLakePage();
        return json({ success: true, message: 'Big Almaty Lake seeded successfully' });
    } catch (error) {
        logger.error('[seed] Big Almaty Lake seeding failed', { err: String(error) });
        return json({ success: false, error: 'Failed to seed' }, { status: 500 });
    }
};
