import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { getCoordinates } from '$lib/server/aiService';
import { enforceRateLimit } from '$lib/server/rateLimit';
import { logger } from '$lib/server/logger';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const rate = await enforceRateLimit({
            request,
            scope: 'api-map-navigate',
            maxRequests: 25,
            windowMs: 60_000
        });
        if (!rate.allowed) {
            return json(
                { error: 'Too many navigation requests. Please retry shortly.' },
                { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
            );
        }

        const { query } = await request.json();

        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return json({ error: 'Invalid query' }, { status: 400 });
        }

        if (query.trim().length > 200) {
            return json({ error: 'Query must be 200 characters or fewer' }, { status: 400 });
        }

        if (dev) logger.debug('[map] Received navigation query', { query });
        const result = await getCoordinates(query);

        if (!result) {
            return json({ error: 'Could not find location' }, { status: 404 });
        }

        return json({
            success: true,
            ...result
        });
    } catch (e) {
        logger.error('[map] Error processing request', { err: String(e) });
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}
