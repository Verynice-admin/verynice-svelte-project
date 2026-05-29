import { json } from '@sveltejs/kit';
import { adminDB } from '$lib/server/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';
import { verifyFirebaseSessionCookie } from '$lib/server/sessionAuth';
import { enforceRateLimit } from '$lib/server/rateLimit';
import { logger } from '$lib/server/logger';
import type { RequestHandler } from './$types';

// ── Validation constants ──────────────────────────────────────────────
const VALID_RATINGS = new Set([1, 2, 3, 4, 5]);
const MAX_TITLE_LENGTH = 120;
const MAX_BODY_LENGTH = 2000;
const MAX_AUTHOR_LENGTH = 50;
const POST_ID_PATTERN = /^[a-zA-Z0-9_-]{1,120}$/;
const REVIEW_ID_PATTERN = /^[a-zA-Z0-9_-]{1,150}$/;

// ── Helpers ───────────────────────────────────────────────────────────
function sanitize(input: string, maxLength: number): string {
  return input.replace(/[<>"'&]/g, '').trim().slice(0, maxLength);
}

function validateReviewPayload(body: any): {
  title: string;
  body: string;
  rating: number;
  postId: string;
  author: string;
} | null {
  if (!body || typeof body !== 'object') return null;

  const postId = typeof body.postId === 'string' ? body.postId.trim() : '';
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const reviewBody = typeof body.body === 'string' ? body.body.trim() : '';
  const rating = typeof body.rating === 'number' ? body.rating : 0;
  const author = typeof body.author === 'string' ? body.author.trim() : 'Anonymous';

  if (!postId || !POST_ID_PATTERN.test(postId)) return null;
  if (!title || title.length > MAX_TITLE_LENGTH) return null;
  if (!reviewBody || reviewBody.length > MAX_BODY_LENGTH) return null;
  if (!VALID_RATINGS.has(rating)) return null;

  return {
    postId,
    title: sanitize(title, MAX_TITLE_LENGTH),
    body: sanitize(reviewBody, MAX_BODY_LENGTH),
    rating,
    author: sanitize(author, MAX_AUTHOR_LENGTH) || 'Anonymous'
  };
}

// ── CREATE ────────────────────────────────────────────────────────────
export const POST: RequestHandler = async ({ request, cookies }) => {
  const rate = await enforceRateLimit({
    request,
    scope: 'api-reviews-create',
    maxRequests: 5,
    windowMs: 60_000
  });
  if (!rate.allowed) {
    return json(
      { error: 'Too many review submissions. Please retry shortly.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

  const sessionCookie = cookies.get('__session');
  const session = await verifyFirebaseSessionCookie(sessionCookie);

  if (!session.isAuthenticated || !session.uid) {
    return json({ error: 'Authentication required' }, { status: 401 });
  }

  if (!adminDB) {
    logger.error('[reviews] Firebase Admin not initialized');
    return json({ error: 'Server configuration unavailable' }, { status: 503 });
  }

  let parsed: any;
  try {
    parsed = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, { status: 400 });
  }

  const validated = validateReviewPayload(parsed);
  if (!validated) {
    return json({ error: 'Invalid review data. Check postId, title (max 120 chars), body (max 2000 chars), and rating (1-5).' }, { status: 400 });
  }

  // Verify the target page exists in Firestore before writing
  const pageSnap = await adminDB.collection('pages').doc(validated.postId).get();
  if (!pageSnap.exists) {
    return json({ error: 'Page not found' }, { status: 404 });
  }

  // One review per user per page
  const existingSnap = await adminDB
    .collection('pages')
    .doc(validated.postId)
    .collection('reviews')
    .where('uid', '==', session.uid)
    .limit(1)
    .get();

  if (!existingSnap.empty) {
    return json({ error: 'You have already reviewed this page. Use PUT to update it.' }, { status: 409 });
  }

  const reviewId = `${session.uid}-${Date.now()}`;
  const now = Timestamp.now();

  const newReview = {
    uid: session.uid,
    author: validated.author,
    title: validated.title,
    body: validated.body,
    rating: validated.rating,
    createdAt: now,
    updatedAt: now,
    source: 'api_submit'
  };

  await adminDB
    .collection('pages')
    .doc(validated.postId)
    .collection('reviews')
    .doc(reviewId)
    .set(newReview);

  // Update aggregate rating on the page document
  await updatePageRating(validated.postId);

  return json({ success: true, reviewId, review: { ...newReview, id: reviewId } }, { status: 201 });
};

// ── READ (list reviews for a page) ────────────────────────────────────
export const GET: RequestHandler = async ({ url, request }) => {
  const rate = await enforceRateLimit({
    request,
    scope: 'api-reviews-read',
    maxRequests: 30,
    windowMs: 60_000
  });
  if (!rate.allowed) {
    return json(
      { error: 'Too many requests. Please retry shortly.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

  const postId = url.searchParams.get('postId') || '';
  if (!postId || !POST_ID_PATTERN.test(postId)) {
    return json({ error: 'Valid postId is required' }, { status: 400 });
  }

  if (!adminDB) {
    return json({ error: 'Server configuration unavailable' }, { status: 503 });
  }

  try {
    const snap = await adminDB
      .collection('pages')
      .doc(postId)
      .collection('reviews')
      .orderBy('createdAt', 'desc')
      .get();

    const reviews = snap.docs.map((doc) => {
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

    // Compute aggregate stats
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
      : 0;

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      if (r.rating >= 1 && r.rating <= 5) {
        ratingDistribution[r.rating]++;
      }
    }

    return json({
      success: true,
      postId,
      totalReviews,
      averageRating,
      ratingDistribution,
      reviews
    });
  } catch (error) {
    logger.error('[reviews] GET failed', { err: String(error) });
    return json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
};

// ── UPDATE ────────────────────────────────────────────────────────────
export const PUT: RequestHandler = async ({ request, cookies }) => {
  const rate = await enforceRateLimit({
    request,
    scope: 'api-reviews-update',
    maxRequests: 10,
    windowMs: 60_000
  });
  if (!rate.allowed) {
    return json(
      { error: 'Too many requests. Please retry shortly.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

  const sessionCookie = cookies.get('__session');
  const session = await verifyFirebaseSessionCookie(sessionCookie);

  if (!session.isAuthenticated || !session.uid) {
    return json({ error: 'Authentication required' }, { status: 401 });
  }

  if (!adminDB) {
    return json({ error: 'Server configuration unavailable' }, { status: 503 });
  }

  let parsed: any;
  try {
    parsed = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, { status: 400 });
  }

  const reviewId = typeof parsed.reviewId === 'string' ? parsed.reviewId.trim() : '';
  const postId = typeof parsed.postId === 'string' ? parsed.postId.trim() : '';

  if (!reviewId || !REVIEW_ID_PATTERN.test(reviewId)) {
    return json({ error: 'Valid reviewId is required' }, { status: 400 });
  }
  if (!postId || !POST_ID_PATTERN.test(postId)) {
    return json({ error: 'Valid postId is required' }, { status: 400 });
  }

  // Fetch the existing review and verify ownership
  const reviewRef = adminDB.collection('pages').doc(postId).collection('reviews').doc(reviewId);
  const reviewSnap = await reviewRef.get();

  if (!reviewSnap.exists) {
    return json({ error: 'Review not found' }, { status: 404 });
  }

  const existingData = reviewSnap.data();
  if (existingData?.uid !== session.uid) {
    return json({ error: 'You can only edit your own reviews' }, { status: 403 });
  }

  // Build update object — only allow updating specific fields
  const updates: Record<string, any> = {
    updatedAt: Timestamp.now()
  };

  if (typeof parsed.title === 'string') {
    const title = parsed.title.trim();
    if (!title || title.length > MAX_TITLE_LENGTH) {
      return json({ error: 'Title must be 1-120 characters' }, { status: 400 });
    }
    updates.title = sanitize(title, MAX_TITLE_LENGTH);
  }

  if (typeof parsed.body === 'string') {
    const body = parsed.body.trim();
    if (!body || body.length > MAX_BODY_LENGTH) {
      return json({ error: 'Body must be 1-2000 characters' }, { status: 400 });
    }
    updates.body = sanitize(body, MAX_BODY_LENGTH);
  }

  if (typeof parsed.rating === 'number') {
    if (!VALID_RATINGS.has(parsed.rating)) {
      return json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }
    updates.rating = parsed.rating;
  }

  await reviewRef.update(updates);

  // Recalculate aggregate rating
  await updatePageRating(postId);

  return json({ success: true, updatedFields: Object.keys(updates) });
};

// ── DELETE ────────────────────────────────────────────────────────────
export const DELETE: RequestHandler = async ({ request, cookies }) => {
  const rate = await enforceRateLimit({
    request,
    scope: 'api-reviews-delete',
    maxRequests: 5,
    windowMs: 60_000
  });
  if (!rate.allowed) {
    return json(
      { error: 'Too many requests. Please retry shortly.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

  const sessionCookie = cookies.get('__session');
  const session = await verifyFirebaseSessionCookie(sessionCookie);

  if (!session.isAuthenticated || !session.uid) {
    return json({ error: 'Authentication required' }, { status: 401 });
  }

  if (!adminDB) {
    return json({ error: 'Server configuration unavailable' }, { status: 503 });
  }

  let parsed: any;
  try {
    parsed = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, { status: 400 });
  }

  const reviewId = typeof parsed.reviewId === 'string' ? parsed.reviewId.trim() : '';
  const postId = typeof parsed.postId === 'string' ? parsed.postId.trim() : '';

  if (!reviewId || !REVIEW_ID_PATTERN.test(reviewId)) {
    return json({ error: 'Valid reviewId is required' }, { status: 400 });
  }
  if (!postId || !POST_ID_PATTERN.test(postId)) {
    return json({ error: 'Valid postId is required' }, { status: 400 });
  }

  // Fetch the existing review and verify ownership
  const reviewRef = adminDB.collection('pages').doc(postId).collection('reviews').doc(reviewId);
  const reviewSnap = await reviewRef.get();

  if (!reviewSnap.exists) {
    return json({ error: 'Review not found' }, { status: 404 });
  }

  const existingData = reviewSnap.data();
  // Only the review author or an admin can delete
  if (existingData?.uid !== session.uid && session.role !== 'admin') {
    return json({ error: 'You can only delete your own reviews' }, { status: 403 });
  }

  await reviewRef.delete();

  // Recalculate aggregate rating
  await updatePageRating(postId);

  return json({ success: true });
};

// ── Aggregate rating helper ───────────────────────────────────────────
async function updatePageRating(postId: string): Promise<void> {
  try {
    const snap = await adminDB!
      .collection('pages')
      .doc(postId)
      .collection('reviews')
      .get();

    const reviews = snap.docs.map((d) => d.data());
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Math.round((reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews) * 10) / 10
      : 0;

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      if (r.rating >= 1 && r.rating <= 5) {
        ratingDistribution[r.rating]++;
      }
    }

    await adminDB!.collection('pages').doc(postId).set({
      reviewStats: {
        totalReviews,
        averageRating,
        ratingDistribution
      }
    }, { merge: true });
  } catch (error) {
    logger.error('[reviews] Failed to update page rating aggregate', { err: String(error) });
  }
}
