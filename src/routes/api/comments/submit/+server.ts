import { json } from '@sveltejs/kit';
import { adminDB } from '$lib/server/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';
import { processComment } from '$lib/server/aiService';
import { enforceRateLimit } from '$lib/server/rateLimit';
import { logger } from '$lib/server/logger';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const rate = await enforceRateLimit({
            request,
            scope: 'api-comments-submit',
            maxRequests: 10,
            windowMs: 60_000
        });
        if (!rate.allowed) {
            return json(
                { error: 'Too many comment submissions. Please retry shortly.' },
                { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
            );
        }

        const { postId, text, author } = await request.json() as { postId: string, text: string, author: string };

        if (!postId || !text) {
            return json({ error: 'Post ID and Text are required' }, { status: 400 });
        }

        // Validate postId format: alphanumeric, hyphens, underscores only, 1–120 chars.
        // Prevents writing comments to arbitrary Firestore namespaces via Admin SDK (which bypasses rules).
        if (!/^[a-zA-Z0-9_-]{1,120}$/.test(postId)) {
            return json({ error: 'Invalid post ID' }, { status: 400 });
        }

        // Cap comment text at 1000 characters to mirror the Firestore security rule limit and
        // prevent AI token-budget exhaustion in the processComment() moderation step.
        if (typeof text !== 'string' || text.trim().length > 1000) {
            return json({ error: 'Comment text must be 1000 characters or fewer' }, { status: 400 });
        }

        if (!adminDB) {
            logger.error('[comments] Firebase Admin not initialized');
            return json({ error: 'Server configuration unavailable' }, { status: 503 });
        }

        // Verify the target page actually exists in Firestore before writing.
        // Prevents database namespace pollution via Admin SDK (which bypasses security rules).
        const pageSnap = await adminDB.collection('pages').doc(postId).get();
        if (!pageSnap.exists) {
            return json({ error: 'Post not found' }, { status: 404 });
        }

        // AI Processing check
        let finalText = text.trim();
        let isAiCorrected = false;

        try {
            const aiResult = await processComment(finalText);
            if (aiResult) {
                if (aiResult.isOffensive) {
                    return json({
                        validationError: 'Your comment was flagged as inappropriate.',
                        isOffensive: true
                    }, { status: 400 });
                }
                if (aiResult.correctedText) {
                    // Cap AI-returned text to prevent LLM response expansion beyond client-submitted limit.
                    finalText = aiResult.correctedText.slice(0, 1000);
                    isAiCorrected = true;
                }
            }
        } catch (aiError) {
            logger.warn('[comments] AI moderation failed, proceeding with original text', { err: String(aiError) });
        }

        // Generate ID
        const sanitizeSegment = (value: string | null | undefined) => (value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24) || 'anonymous';
        const base = sanitizeSegment(author);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const random = Math.random().toString(36).slice(2, 6);
        const commentId = `${base}-${timestamp}-${random}`;

        const newComment = {
            text: finalText,
            author: (author || 'Anonymous').trim().slice(0, 50),
            createdAt: Timestamp.now(),
            isAiCorrected: isAiCorrected,
            source: 'api_submit'
        };

        // Write via Admin SDK (Bypasses rules)
        await adminDB
            .collection('pages')
            .doc(postId)
            .collection('comments')
            .doc(commentId)
            .set(newComment);

        return json({ success: true, comment: newComment });

    } catch (error) {
        logger.error('[comments] Error submitting comment', { err: String(error) });
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
