import type { PageServerLoad } from './$types';
import { adminDB } from '$lib/server/firebaseAdmin';
import { verifyFirebaseSessionCookie } from '$lib/server/sessionAuth';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies, url }) => {
  // Check authentication
  const sessionCookie = cookies.get('__session');
  const session = await verifyFirebaseSessionCookie(sessionCookie);

  // Get optional postId filter from query params
  const postId = url.searchParams.get('postId') || '';

  // Fetch all reviewable pages (pages that exist in the 'pages' collection)
  let reviewablePages: { id: string; title: string }[] = [];
  let reviews: any[] = [];
  let totalReviews = 0;
  let averageRating = 0;
  let ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let userReviewIds: string[] = [];

  if (adminDB) {
    try {
      // Fetch reviewable pages
      const pagesSnap = await adminDB.collection('pages').limit(100).get();
      reviewablePages = pagesSnap.docs
        .map((doc) => ({
          id: doc.id,
          title: doc.data()?.heroTitle || doc.data()?.title || doc.data()?.mainTitle || doc.id
        }))
        .sort((a, b) => a.title.localeCompare(b.title));

      // If a specific page is selected, load its reviews
      if (postId) {
        const reviewsSnap = await adminDB
          .collection('pages')
          .doc(postId)
          .collection('reviews')
          .orderBy('createdAt', 'desc')
          .get();

        reviews = reviewsSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            uid: data.uid,
            author: data.author || 'Anonymous',
            title: data.title || '',
            body: data.body || '',
            rating: data.rating || 0,
            createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null
          };
        });

        totalReviews = reviews.length;
        averageRating = totalReviews > 0
          ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
          : 0;

        for (const r of reviews) {
          if (r.rating >= 1 && r.rating <= 5) {
            ratingDistribution[r.rating]++;
          }
        }

        // Track which reviews belong to the current user
        if (session.isAuthenticated && session.uid) {
          userReviewIds = reviews
            .filter((r) => r.uid === session.uid)
            .map((r) => r.id);
        }
      }
    } catch (err) {
      console.error('[reviews page] Error loading data:', err);
    }
  }

  return {
    isAuthenticated: session.isAuthenticated,
    uid: session.uid,
    role: session.role,
    postId,
    reviewablePages,
    reviews,
    totalReviews,
    averageRating,
    ratingDistribution,
    userReviewIds
  };
};
