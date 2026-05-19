import { json } from '@sveltejs/kit';
import { processComment } from '$lib/server/aiService';
import { enforceRateLimit } from '$lib/server/rateLimit';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const rate = await enforceRateLimit({
            request,
            scope: 'api-comments-process',
            maxRequests: 20,
            windowMs: 60_000
        });
        if (!rate.allowed) {
            return json(
                { error: 'Too many requests. Please retry shortly.' },
                { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
            );
        }

        const { text } = await request.json() as { text: string };

        if (!text || typeof text !== 'string') {
            return json({ error: 'Text is required' }, { status: 400 });
        }

        const result = await processComment(text);

        if (!result) {
            // Fallback: return original text if AI fails
            return json({ correctedText: text, isOffensive: false });
        }

        return json(result);

    } catch (error) {
        console.error('Error processing comment:', error);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
