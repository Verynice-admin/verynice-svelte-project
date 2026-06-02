import type { PageServerLoad, Actions } from './$types';
import { adminDB } from '$lib/server/firebaseAdmin';
import { fail } from '@sveltejs/kit';

const COMMENT_PATH = /^pages\/[a-zA-Z0-9_-]+\/comments\/[^\s/]+$/;
const REVIEW_PATH  = /^pages\/[a-zA-Z0-9_-]+\/reviews\/[^\s/]+$/;

export const load: PageServerLoad = async () => {
  if (!adminDB) return { comments: [], reviews: [] };

  const [commentsResult, reviewsResult] = await Promise.allSettled([
    adminDB.collectionGroup('comments').orderBy('createdAt', 'desc').limit(50).get(),
    adminDB.collectionGroup('reviews').orderBy('createdAt', 'desc').limit(50).get(),
  ]);

  const comments =
    commentsResult.status === 'fulfilled'
      ? commentsResult.value.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            path: doc.ref.path,
            postId: doc.ref.parent.parent?.id ?? '',
            text: d.text ?? '',
            author: d.author ?? 'Anonymous',
            createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
            isAiCorrected: !!d.isAiCorrected,
          };
        })
      : [];

  const reviews =
    reviewsResult.status === 'fulfilled'
      ? reviewsResult.value.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            path: doc.ref.path,
            postId: doc.ref.parent.parent?.id ?? '',
            uid: d.uid ?? '',
            author: d.author ?? 'Anonymous',
            title: d.title ?? '',
            body: d.body ?? '',
            rating: d.rating ?? 0,
            createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
          };
        })
      : [];

  return { comments, reviews };
};

export const actions: Actions = {
  deleteComment: async ({ request }) => {
    if (!adminDB) return fail(503, { error: 'Service unavailable' });
    const fd = await request.formData();
    const path = String(fd.get('path') ?? '');
    if (!COMMENT_PATH.test(path)) return fail(400, { error: 'Invalid path' });
    await adminDB.doc(path).delete();
    return { success: true };
  },

  deleteReview: async ({ request }) => {
    if (!adminDB) return fail(503, { error: 'Service unavailable' });
    const fd = await request.formData();
    const path = String(fd.get('path') ?? '');
    if (!REVIEW_PATH.test(path)) return fail(400, { error: 'Invalid path' });
    await adminDB.doc(path).delete();
    return { success: true };
  },
};
