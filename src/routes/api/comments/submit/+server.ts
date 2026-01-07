import { json } from '@sveltejs/kit';
import { adminDB } from '$lib/server/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';
import { processComment } from '$lib/server/aiService';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { postId, text, author } = await request.json() as { postId: string, text: string, author: string };

        if (!postId || !text) {
            return json({ error: 'Post ID and Text are required' }, { status: 400 });
        }

        if (!adminDB) {
            console.error('[API] Firebase Admin not initialized');
            return json({ error: 'Server configuration unavailable' }, { status: 503 });
        }

        // AI Processing check
        let finalText = text.trim();
        let isAiCorrected = false;

        try {
            const aiResult = await processComment(finalText);
            if (aiResult) {
                if (aiResult.isOffensive) {
                    return json({
                        valiationError: 'Your comment was flagged as inappropriate.',
                        isOffensive: true
                    }, { status: 400 });
                }
                if (aiResult.correctedText) {
                    finalText = aiResult.correctedText;
                    isAiCorrected = true;
                }
            }
        } catch (aiError) {
            console.warn('[API] AI Check failed, proceeding with original text:', aiError);
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
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[API] Error submitting comment:', error);
        return json({ error: 'Internal Server Error: ' + message }, { status: 500 });
    }
}
