import { json } from '@sveltejs/kit';
import { adminDB } from '$lib/server/firebaseAdmin';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    try {
        const { postId } = await request.json();

        if (!postId) {
            return json({ error: 'Post ID is required' }, { status: 400 });
        }

        if (!adminDB) {
            console.error('Firebase Admin not initialized');
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
                console.log(`[Comments Cleanup] Deleted ${docsToDelete.length} old comments from ${postId}`);

                return json({
                    success: true,
                    message: `Cleanup successful. Deleted ${docsToDelete.length} comments.`
                });
            }
        }

        return json({ success: true, message: 'No cleanup needed.' });

    } catch (error) {
        console.error('[Comments Cleanup] Error:', error);
        return json({ error: 'Failed to cleanup comments' }, { status: 500 });
    }
}
