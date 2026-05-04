<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth, db } from '$lib/firebase';
	import { onAuthStateChanged } from 'firebase/auth';
	import { 
		collection, 
		query, 
		where, 
		getDocs, 
		orderBy,
		doc,
		updateDoc,
		serverTimestamp
	} from 'firebase/firestore';

	let loading = true;
	let reviews: any[] = [];
	let error = '';
	let replyingTo: string | null = null;
	let replyText = '';

	// Stats
	let avgRating = 0;
	let totalReviews = 0;
	let ratingBreakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

	onMount(async () => {
		if (!auth) {
			goto('/get-started');
			return;
		}

		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (!firebaseUser) {
				goto('/get-started');
				return;
			}

			await loadReviews(firebaseUser.uid);
			loading = false;
		});

		return () => unsubscribe();
	});

	async function loadReviews(uid: string) {
		try {
			const reviewsQuery = query(
				collection(db!, 'reviews'),
				where('businessId', '==', uid),
				orderBy('createdAt', 'desc')
			);
			
			const snapshot = await getDocs(reviewsQuery);
			reviews = snapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data()
			}));

			// Calculate stats
			totalReviews = reviews.length;
			if (totalReviews > 0) {
				const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
				avgRating = sum / totalReviews;
				
				reviews.forEach(r => {
					const rating = Math.round(r.rating || 0);
					if (ratingBreakdown[rating] !== undefined) {
						ratingBreakdown[rating]++;
					}
				});
			}
		} catch (err) {
			console.error('Error loading reviews:', err);
			error = 'Failed to load reviews';
		}
	}

	async function submitReply(reviewId: string) {
		if (!replyText.trim()) return;

		try {
			await updateDoc(doc(db!, 'reviews', reviewId), {
				reply: replyText.trim(),
				replyAt: serverTimestamp()
			});
			
			reviews = reviews.map(r => 
				r.id === reviewId ? { ...r, reply: replyText.trim() } : r
			);
			
			replyingTo = null;
			replyText = '';
		} catch (err) {
			console.error('Error submitting reply:', err);
			error = 'Failed to submit reply';
		}
	}

	async function flagReview(reviewId: string) {
		if (!confirm('Flag this review for moderation?')) return;

		try {
			await updateDoc(doc(db!, 'reviews', reviewId), {
				flagged: true,
				flaggedAt: serverTimestamp()
			});
			
			reviews = reviews.map(r => 
				r.id === reviewId ? { ...r, flagged: true } : r
			);
		} catch (err) {
			console.error('Error flagging review:', err);
		}
	}

	function formatDate(date: any): string {
		if (!date) return '';
		const d = date.toDate ? date.toDate() : new Date(date);
		return d.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function generateShareLink(reviewId: string): string {
		const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
		return `${baseUrl}/review/${reviewId}`;
	}

	function copyShareLink(reviewId: string) {
		navigator.clipboard.writeText(generateShareLink(reviewId));
		alert('Link copied to clipboard!');
	}
</script>

<svelte:head>
	<title>Reviews — VERYNICE.kz</title>
	<meta name="description" content="Manage your business reviews" />
</svelte:head>

<div class="reviews-page">
	<header class="page-header">
		<div>
			<h1>Reviews</h1>
			<p>Manage customer reviews and responses</p>
		</div>
		<button class="btn-secondary" on:click={() => copyShareLink('generate')}>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
				<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
			</svg>
			Copy Review Link
		</button>
	</header>

	{#if error}
		<div class="alert alert-error">{error}</div>
	{/if}

	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
		</div>
	{:else}
		<!-- Stats Overview -->
		<div class="stats-overview">
			<div class="rating-summary">
				<div class="avg-rating">
					<span class="number">{avgRating.toFixed(1)}</span>
					<div class="stars">
						{#each Array(5) as _, i}
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" 
								class:filled={i < Math.round(avgRating)}
								fill={i < Math.round(avgRating) ? '#E8A44A' : 'none'} 
								stroke={i < Math.round(avgRating) ? '#E8A44A' : '#d1d5db'} 
								stroke-width="2">
								<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
							</svg>
						{/each}
					</div>
					<span class="total">{totalReviews} reviews</span>
				</div>
			</div>

			<div class="rating-breakdown">
				{#each [5, 4, 3, 2, 1] as star}
					<div class="breakdown-row">
						<span class="stars-label">{star} star{star > 1 ? 's' : ''}</span>
						<div class="progress-bar">
							<div class="progress" style="width: {totalReviews ? (ratingBreakdown[star] / totalReviews * 100) : 0}%"></div>
						</div>
						<span class="count">{ratingBreakdown[star]}</span>
					</div>
				{/each}
			</div>
		</div>

		{#if reviews.length === 0}
			<div class="empty-state">
				<div class="empty-icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
					</svg>
				</div>
				<h2>No reviews yet</h2>
				<p>Share your review link to collect reviews from customers</p>
			</div>
		{:else}
			<div class="reviews-list">
				{#each reviews as review}
					<div class="review-card" class:flagged={review.flagged}>
						<div class="review-header">
							<div class="reviewer">
								{#if review.reviewerPhoto}
									<img src={review.reviewerPhoto} alt={review.reviewerName} class="reviewer-avatar" />
								{:else}
									<div class="reviewer-avatar placeholder">
										{(review.reviewerName || 'G').charAt(0).toUpperCase()}
									</div>
								{/if}
								<div>
									<span class="reviewer-name">{review.reviewerName || 'Anonymous'}</span>
									<span class="review-date">{formatDate(review.createdAt)}</span>
								</div>
							</div>
							<div class="review-rating">
								{#each Array(5) as _, i}
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" 
										fill={i < review.rating ? '#E8A44A' : 'none'} 
										stroke={i < review.rating ? '#E8A44A' : '#d1d5db'} 
										stroke-width="2">
										<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
									</svg>
								{/each}
							</div>
						</div>

						{#if review.listingTitle}
							<div class="review-listing">
								For: {review.listingTitle}
							</div>
						{/if}

						<div class="review-content">
							<p>{review.text || review.content || 'No text'}</p>
						</div>

						{#if review.reply}
							<div class="review-reply">
								<div class="reply-header">
									<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<polyline points="9 17 4 12 9 7"></polyline>
										<path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
									</svg>
									Your Reply
								</div>
								<p>{review.reply}</p>
							</div>
						{:else if replyingTo === review.id}
							<div class="reply-form">
								<textarea 
									bind:value={replyText} 
									placeholder="Write your reply..."
									rows="3"
								></textarea>
								<div class="reply-actions">
									<button class="btn-cancel" on:click={() => replyingTo = null}>Cancel</button>
									<button class="btn-submit" on:click={() => submitReply(review.id)}>Submit Reply</button>
								</div>
							</div>
						{/if}

						<div class="review-actions">
							{#if !review.reply && replyingTo !== review.id}
								<button class="action-btn" on:click={() => replyingTo = review.id}>
									<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<polyline points="9 17 4 12 9 7"></polyline>
										<path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
									</svg>
									Reply
								</button>
							{/if}
							{#if !review.flagged}
								<button class="action-btn" on:click={() => flagReview(review.id)}>
									<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
										<line x1="4" y1="22" x2="4" y2="15"></line>
									</svg>
									Flag
								</button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	.reviews-page {
		max-width: 900px;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
	}

	.page-header h1 {
		font-size: 1.75rem;
		color: #0a1e3c;
		margin-bottom: 0.5rem;
	}

	.page-header p {
		color: #666;
	}

	.btn-secondary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-secondary:hover {
		background: #f3f4f6;
	}

	.alert {
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
	}

	.alert-error {
		background: #fee2e2;
		color: #dc2626;
	}

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 300px;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid #f0f0f0;
		border-top-color: #0a1e3c;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Stats */
	.stats-overview {
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: 2rem;
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 2rem;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	}

	.avg-rating {
		text-align: center;
	}

	.avg-rating .number {
		font-size: 3rem;
		font-weight: 700;
		color: #0a1e3c;
		line-height: 1;
	}

	.avg-rating .stars {
		display: flex;
		justify-content: center;
		gap: 0.25rem;
		margin: 0.5rem 0;
	}

	.avg-rating .total {
		color: #6b7280;
		font-size: 0.9rem;
	}

	.rating-breakdown {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.5rem;
	}

	.breakdown-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.stars-label {
		width: 50px;
		font-size: 0.85rem;
		color: #374151;
	}

	.progress-bar {
		flex: 1;
		height: 8px;
		background: #e5e7eb;
		border-radius: 4px;
		overflow: hidden;
	}

	.progress {
		height: 100%;
		background: #E8A44A;
		border-radius: 4px;
	}

	.count {
		width: 30px;
		text-align: right;
		font-size: 0.85rem;
		color: #6b7280;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background: white;
		border-radius: 12px;
	}

	.empty-icon {
		color: #d1d5db;
		margin-bottom: 1rem;
	}

	.empty-state h2 {
		color: #374151;
		margin-bottom: 0.5rem;
	}

	.empty-state p {
		color: #6b7280;
	}

	/* Reviews List */
	.reviews-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.review-card {
		background: white;
		border-radius: 12px;
		padding: 1.25rem;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	}

	.review-card.flagged {
		border-left: 3px solid #f59e0b;
	}

	.review-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.75rem;
	}

	.reviewer {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.reviewer-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
	}

	.reviewer-avatar.placeholder {
		background: #E8A44A;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
	}

	.reviewer-name {
		display: block;
		font-weight: 500;
		color: #0a1e3c;
	}

	.review-date {
		display: block;
		font-size: 0.8rem;
		color: #6b7280;
	}

	.review-rating {
		display: flex;
		gap: 2px;
	}

	.review-listing {
		font-size: 0.85rem;
		color: #6b7280;
		margin-bottom: 0.75rem;
	}

	.review-content p {
		color: #374151;
		line-height: 1.6;
	}

	.review-reply {
		margin-top: 1rem;
		padding: 1rem;
		background: #f0fdf4;
		border-radius: 8px;
		border-left: 3px solid #16a34a;
	}

	.reply-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
		font-weight: 500;
		color: #16a34a;
		margin-bottom: 0.5rem;
	}

	.reply-header ~ p {
		color: #374151;
	}

	.reply-form {
		margin-top: 1rem;
	}

	.reply-form textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.95rem;
		resize: vertical;
	}

	.reply-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.btn-cancel, .btn-submit {
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.85rem;
		cursor: pointer;
	}

	.btn-cancel {
		background: none;
		border: 1px solid #d1d5db;
		color: #374151;
	}

	.btn-submit {
		background: #16a34a;
		border: none;
		color: white;
	}

	.review-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	.action-btn {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.4rem 0.75rem;
		background: #f3f4f6;
		border: none;
		border-radius: 6px;
		font-size: 0.85rem;
		color: #374151;
		cursor: pointer;
		transition: all 0.2s;
	}

	.action-btn:hover {
		background: #e5e7eb;
	}

	@media (max-width: 640px) {
		.stats-overview {
			grid-template-columns: 1fr;
		}
	}
</style>
