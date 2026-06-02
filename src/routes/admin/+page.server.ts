import type { PageServerLoad } from './$types';
import { adminDB } from '$lib/server/firebaseAdmin';

export const load: PageServerLoad = async () => {
  if (!adminDB) {
    return { stats: null, recentComments: [], recentReviews: [] };
  }

  const [usersResult, pagesResult, commentsResult, reviewsResult, rateLimitResult] =
    await Promise.allSettled([
      adminDB.collection('users').count().get(),
      adminDB.collection('pages').count().get(),
      adminDB.collectionGroup('comments').orderBy('createdAt', 'desc').limit(8).get(),
      adminDB.collectionGroup('reviews').orderBy('createdAt', 'desc').limit(8).get(),
      adminDB.collection('_ratelimit').count().get(),
    ]);

  const userCount =
    usersResult.status === 'fulfilled' ? usersResult.value.data().count : 0;
  const pageCount =
    pagesResult.status === 'fulfilled' ? pagesResult.value.data().count : 0;
  const rateLimitBuckets =
    rateLimitResult.status === 'fulfilled' ? rateLimitResult.value.data().count : 0;

  const recentComments =
    commentsResult.status === 'fulfilled'
      ? commentsResult.value.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            postId: doc.ref.parent.parent?.id ?? '',
            text: (d.text ?? '').slice(0, 120),
            author: d.author ?? 'Anonymous',
            createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
            isAiCorrected: !!d.isAiCorrected,
          };
        })
      : [];

  const recentReviews =
    reviewsResult.status === 'fulfilled'
      ? reviewsResult.value.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            postId: doc.ref.parent.parent?.id ?? '',
            author: d.author ?? 'Anonymous',
            rating: d.rating ?? 0,
            title: (d.title ?? '').slice(0, 80),
            createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
          };
        })
      : [];

  return {
    stats: { userCount, pageCount, rateLimitBuckets },
    recentComments,
    recentReviews,
  };
};
