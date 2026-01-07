import { json } from '@sveltejs/kit';
import { getCoordinates } from '$lib/server/aiService';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { query } = await request.json();

        if (!query || typeof query !== 'string') {
            return json({ error: 'Invalid query' }, { status: 400 });
        }

        console.log('[Map API] Received navigation query:', query);
        const result = await getCoordinates(query);

        if (!result) {
            return json({ error: 'Could not find location' }, { status: 404 });
        }

        return json({
            success: true,
            ...result
        });
    } catch (e) {
        console.error('[Map API] Error processing request:', e);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}
