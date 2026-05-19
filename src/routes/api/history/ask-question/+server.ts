import { json } from '@sveltejs/kit';
import { generateAnswer } from '$lib/server/aiService';
import { enforceRateLimit } from '$lib/server/rateLimit';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const rate = await enforceRateLimit({
            request,
            scope: 'api-history-ask',
            maxRequests: 20,
            windowMs: 60_000
        });
        if (!rate.allowed) {
            return json(
                { error: 'Too many requests. Please retry shortly.' },
                { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
            );
        }

        const { question } = await request.json();

        if (!question || typeof question !== 'string' || question.trim().length === 0) {
            return json({ error: 'Question is required' }, { status: 400 });
        }

        // Generate answer using AI
        const aiResult = await generateAnswer(question);

        if (aiResult) {
            return json({
                success: true,
                aiAnswer: aiResult.answer,
                correctedQuestion: aiResult.correctedQuestion,
                relatedLinks: aiResult.relatedLinks || []
            });
        } else {
            return json({
                error: 'AI service unavailable. Please try again later.'
            }, { status: 503 });
        }

    } catch (error) {
        console.error('Error submitting question:', error);
        return json({ error: 'Failed to submit question' }, { status: 500 });
    }
}
