
import { json } from '@sveltejs/kit';
import { createAltynEmelPage } from '$lib/server/seedAltynEmel';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    try {
        await createAltynEmelPage();
        return json({ success: true, message: 'Altyn-Emel page seeded successfully!' });
    } catch (e: any) {
        return json({ success: false, error: e.message }, { status: 500 });
    }
}
