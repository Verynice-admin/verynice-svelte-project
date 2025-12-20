import { json } from '@sveltejs/kit';
import { processComment } from '$lib/server/aiService';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    try {
        const { text } = await request.json();

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
