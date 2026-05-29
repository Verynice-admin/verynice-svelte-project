import { json } from '@sveltejs/kit';
import { generateAnswer } from '$lib/server/aiService';
import { enforceRateLimit } from '$lib/server/rateLimit';
import { logger } from '$lib/server/logger';

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

        // Cap at 500 characters to prevent AI token-budget exhaustion and DoS via oversized payloads.
        if (question.trim().length > 500) {
            return json({ error: 'Question must be 500 characters or fewer' }, { status: 400 });
        }

        // Generate answer using AI
        const aiResult = await generateAnswer(question);

        if (aiResult) {
            // Strip any relatedLink whose URL is not a root-relative same-origin path.
            // The LLM may hallucinate or be injected into returning external/javascript: URLs.
            // A genuine internal link is always a path starting with a single '/' (never '//').
            const safeLinks = (aiResult.relatedLinks ?? []).filter(
                (link: unknown): link is { title: string; url: string } =>
                    typeof (link as Record<string, unknown>)?.title === 'string' &&
                    typeof (link as Record<string, unknown>)?.url === 'string' &&
                    /^\/[^/]/.test((link as Record<string, unknown>).url as string)
            );

            return json({
                success: true,
                aiAnswer: aiResult.answer,
                correctedQuestion: aiResult.correctedQuestion,
                relatedLinks: safeLinks
            });
        } else {
            return json({
                error: 'AI service unavailable. Please try again later.'
            }, { status: 503 });
        }

    } catch (error) {
        logger.error('[history] Error processing question', { err: String(error) });
        return json({ error: 'Failed to submit question' }, { status: 500 });
    }
}
