
import { json } from '@sveltejs/kit';
import { createAltynEmelPage } from '$lib/server/seedAltynEmel';
import { requireAdminAccess } from '$lib/server/apiAuth';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
    const auth = await requireAdminAccess(cookies);
    if (!auth.ok) return auth.response;

    try {
        await createAltynEmelPage();
        return json({ success: true, message: 'Altyn-Emel page seeded successfully!' });
    } catch (e: any) {
        return json({ success: false, error: e.message }, { status: 500 });
    }
}
