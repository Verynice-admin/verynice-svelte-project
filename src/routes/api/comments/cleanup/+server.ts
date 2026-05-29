import { json } from '@sveltejs/kit';
import { adminDB } from '$lib/server/firebaseAdmin';
import { requireAdminAccess } from '$lib/server/apiAuth';
import { logger } from '$lib/server/logger';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, request }) => {
    const auth = await requireAdminAccess(cookies);
    if (!auth.ok) return auth.response;

    try {
        const { postId } = await request.json() as { postId: string };

        if (!postId) {
            return json({ error: 'Post ID is required' }, { status: 400 });
        }

        if (!adminDB) {
            logger.error('[comments/cleanup] Firebase Admin not initialized');
            return json({ error: 'Server configuration error' }, { status: 500 });
        }

        const commentsRef = adminDB.collection('pages').doc(postId).collection('comments');

        // Fetch all comments sorted by date (newest first)
        const snapshot = await commentsRef.orderBy('createdAt', 'desc').get();

        if (snapshot.size > 15) {
            // Identify comments to delete (everything after the 15th)
            const docsToDelete = snapshot.docs.slice(15);

            if (docsToDelete.length > 0) {
                const batch = adminDB.batch();
                docsToDelete.forEach(doc => {
                    batch.delete(doc.ref);
                });

                await batch.commit();
                logger.info('[comments/cleanup] Deleted old comments', { postId, count: docsToDelete.length });

                return json({
                    success: true,
                    message: `Cleanup successful. Deleted ${docsToDelete.length} comments.`
                });
            }
        }

        return json({ success: true, message: 'No cleanup needed.' });

    } catch (error) {
        logger.error('[comments/cleanup] Error during cleanup', { err: String(error) });
        return json({ error: 'Failed to cleanup comments' }, { status: 500 });
    }
}
