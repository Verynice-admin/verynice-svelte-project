<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Input from '$lib/components/ui/Input.svelte';

  export let postId = '';
  export let isAuthenticated = false;
  export let uid: string | null = null;
  export let role: string | null = null;

  interface Review {
    id: string;
    uid: string;
    author: string;
    title: string;
    body: string;
    rating: number;
    createdAt: string | null;
    updatedAt: string | null;
  }

  let reviews: Review[] = [];
  let totalReviews = 0;
  let averageRating = 0;
  let ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let loading = false;
  let loaded = false;
  let error = '';
  let success = '';

  // Form state
  let showForm = false;
  let editingReviewId: string | null = null;
  let formTitle = '';
  let formBody = '';
  let formRating = 0;
  let formAuthor = '';
  let formError = '';
  let submitting = false;
  let confirmDeleteId: string | null = null;

  $: isOwnReview = (reviewUid: string) => uid && reviewUid === uid;
  $: canReview = isAuthenticated && postId;
  $: userHasReview = uid && reviews.some((r) => r.uid === uid);

  async function fetchReviews() {
    if (!postId) return;
    loading = true;
    error = '';
    try {
      const res = await fetch(`/api/reviews?postId=${encodeURIComponent(postId)}`);
      const json = await res.json();
      if (!res.ok) {
        error = json.error || 'Failed to load reviews';
        return;
      }
      reviews = json.reviews || [];
      totalReviews = json.totalReviews || 0;
      averageRating = json.averageRating || 0;
      ratingDistribution = json.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      loaded = true;
    } catch {
      error = 'Network error. Please try again.';
    } finally {
      loading = false;
    }
  }

  // Auto-load on mount
  import { onMount } from 'svelte';
  onMount(() => {
    fetchReviews();
  });

  function openCreateForm() {
    if (!isAuthenticated) {
      error = 'Please sign in to write a review.';
      return;
    }
    if (userHasReview) {
      error = 'You have already reviewed this page. Edit your existing review instead.';
      return;
    }
    editingReviewId = null;
    formTitle = '';
    formBody = '';
    formRating = 0;
    formAuthor = '';
    formError = '';
    showForm = true;
  }

  function openEditForm(review: Review) {
    editingReviewId = review.id;
    formTitle = review.title;
    formBody = review.body;
    formRating = review.rating;
    formAuthor = review.author;
    formError = '';
    showForm = true;
  }

  function cancelForm() {
    showForm = false;
    editingReviewId = null;
    formError = '';
  }

  function setRating(r: number) {
    formRating = r;
  }

  async function submitReview() {
    formError = '';

    if (!formRating || formRating < 1 || formRating > 5) {
      formError = 'Please select a rating (1-5 stars).';
      return;
    }
    if (!formTitle.trim()) {
      formError = 'Title is required.';
      return;
    }
    if (formTitle.trim().length > 120) {
      formError = 'Title must be 120 characters or fewer.';
      return;
    }
    if (!formBody.trim()) {
      formError = 'Review body is required.';
      return;
    }
    if (formBody.trim().length > 2000) {
      formError = 'Review body must be 2000 characters or fewer.';
      return;
    }

    submitting = true;

    try {
      if (editingReviewId) {
        const res = await fetch('/api/reviews', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reviewId: editingReviewId,
            postId,
            title: formTitle.trim(),
            body: formBody.trim(),
            rating: formRating,
            author: formAuthor.trim() || undefined
          })
        });
        const json = await res.json();
        if (!res.ok) {
          formError = json.error || 'Failed to update review.';
          return;
        }
        success = 'Review updated successfully!';
      } else {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId,
            title: formTitle.trim(),
            body: formBody.trim(),
            rating: formRating,
            author: formAuthor.trim() || undefined
          })
        });
        const json = await res.json();
        if (!res.ok) {
          formError = json.error || 'Failed to submit review.';
          return;
        }
        success = 'Review submitted successfully!';
      }

      showForm = false;
      editingReviewId = null;
      await fetchReviews();
    } catch {
      formError = 'Network error. Please try again.';
    } finally {
      submitting = false;
    }
  }

  async function deleteReview(reviewId: string) {
    if (confirmDeleteId !== reviewId) {
      confirmDeleteId = reviewId;
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, postId })
      });
      const json = await res.json();
      if (!res.ok) {
        error = json.error || 'Failed to delete review.';
        return;
      }
      confirmDeleteId = null;
      success = 'Review deleted.';
      await fetchReviews();
    } catch {
      error = 'Network error. Please try again.';
    }
  }

  function formatDate(iso: string | null): string {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  }

  function ratingBarWidth(star: number): string {
    if (totalReviews === 0) return '0%';
    return `${((ratingDistribution[star] || 0) / totalReviews) * 100}%`;
  }

  function starLabel(r: number): string {
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return labels[r] || '';
  }
</script>

<section class="review-section" aria-label="User Reviews">
  <div class="review-section-header">
    <h2>Reviews</h2>
    {#if canReview && !userHasReview}
      <Button variant="primary" size="sm" on:click={openCreateForm} disabled={showForm && !editingReviewId}>
        ✍️ Write a Review
      </Button>
    {:else if !isAuthenticated}
      <span class="signin-hint">Sign in to write a review</span>
    {/if}
  </div>

  <!-- Alerts -->
  {#if error}
    <div class="alert alert-error">
      <span>⚠️</span> {error}
      <button class="alert-dismiss" on:click={() => (error = '')}>✕</button>
    </div>
  {/if}
  {#if success}
    <div class="alert alert-success">
      <span>✅</span> {success}
      <button class="alert-dismiss" on:click={() => (success = '')}>✕</button>
    </div>
  {/if}

  {#if loading && !loaded}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading reviews...</p>
    </div>
  {:else}
    <!-- Rating Summary -->
    {#if totalReviews > 0}
      <div class="rating-summary-inline">
        <div class="big-rating">
          <span class="big-number">{averageRating}</span>
          <div class="big-stars">
            {#each [1, 2, 3, 4, 5] as star}
              <span class="star" class:filled={star <= Math.round(averageRating)}>★</span>
            {/each}
          </div>
          <span class="review-count">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</span>
        </div>
        <div class="rating-bars">
          {#each [5, 4, 3, 2, 1] as star}
            <div class="rating-bar-row">
              <span class="bar-label">{star}★</span>
              <div class="bar-track">
                <div class="bar-fill" style="width: {ratingBarWidth(star)}"></div>
              </div>
              <span class="bar-count">{ratingDistribution[star] || 0}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Review Form -->
    {#if showForm}
      <Card>
        <div slot="header">
          <h3>{editingReviewId ? 'Edit Your Review' : 'Write a Review'}</h3>
        </div>
        <form class="review-form" on:submit|preventDefault={submitReview}>
          {#if formError}
            <div class="alert alert-error">
              <span>⚠️</span> {formError}
            </div>
          {/if}

          <div class="form-group">
            <label class="form-label">Rating *</label>
            <div class="star-input">
              {#each [1, 2, 3, 4, 5] as star}
                <button
                  type="button"
                  class="star-btn"
                  class:active={star <= formRating}
                  on:click={() => setRating(star)}
                  aria-label="Rate {star} star{star !== 1 ? 's' : ''}"
                >
                  ★
                </button>
              {/each}
              {#if formRating}
                <span class="star-hint">{starLabel(formRating)}</span>
              {/if}
            </div>
          </div>

          <div class="form-group">
            <Input
              type="text"
              label="Your Name"
              bind:value={formAuthor}
              placeholder="Anonymous"
              id="review-author-inline"
            />
          </div>

          <div class="form-group">
            <Input
              type="text"
              label="Review Title *"
              bind:value={formTitle}
              placeholder="Summarize your experience"
              required={true}
              id="review-title-inline"
            />
            <span class="char-count">{formTitle.length}/120</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="review-body-inline">Your Review *</label>
            <textarea
              id="review-body-inline"
              class="review-textarea"
              bind:value={formBody}
              placeholder="Share the details of your experience..."
              rows="4"
              required
              maxlength="2000"
            ></textarea>
            <span class="char-count">{formBody.length}/2000</span>
          </div>

          <div class="form-actions">
            <Button type="submit" variant="primary" size="sm" disabled={submitting} loading={submitting}>
              {editingReviewId ? 'Update' : 'Submit'}
            </Button>
            <Button variant="ghost" size="sm" on:click={cancelForm} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    {/if}

    <!-- Reviews List -->
    {#if reviews.length === 0}
      <div class="empty-state">
        <p>No reviews yet. Be the first to share your experience!</p>
      </div>
    {:else}
      <div class="reviews-list">
        {#each reviews as review (review.id)}
          <div class="review-item">
            <div class="review-header">
              <div class="review-meta">
                <div class="review-stars">
                  {#each [1, 2, 3, 4, 5] as star}
                    <span class="star" class:filled={star <= review.rating}>★</span>
                  {/each}
                </div>
                <h4 class="review-title-text">{review.title}</h4>
              </div>
              <div class="review-author-info">
                <span class="review-author">{review.author}</span>
                {#if review.createdAt}
                  <span class="review-date">· {formatDate(review.createdAt)}</span>
                {/if}
                {#if review.updatedAt && review.updatedAt !== review.createdAt}
                  <span class="review-edited">(edited)</span>
                {/if}
              </div>
            </div>
            <p class="review-body">{review.body}</p>

            {#if isOwnReview(review.uid) || role === 'admin'}
              <div class="review-actions">
                {#if isOwnReview(review.uid)}
                  <Button variant="ghost" size="sm" on:click={() => openEditForm(review)}>
                    ✏️ Edit
                  </Button>
                {/if}
                <Button
                  variant={confirmDeleteId === review.id ? 'danger' : 'ghost'}
                  size="sm"
                  on:click={() => deleteReview(review.id)}
                >
                  {confirmDeleteId === review.id ? '⚠️ Confirm' : '🗑️ Delete'}
                </Button>
                {#if confirmDeleteId === review.id}
                  <span class="confirm-hint">Click again to confirm</span>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</section>

<style>
  .review-section {
    margin-top: 2rem;
  }

  .review-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .review-section-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #e2e8f0;
    margin: 0;
  }

  .signin-hint {
    font-size: 0.875rem;
    color: #94a3b8;
  }

  /* Alerts */
  .alert {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }

  .alert-error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: #fca5a5;
  }

  .alert-success {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.2);
    color: #86efac;
  }

  .alert-dismiss {
    margin-left: auto;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    opacity: 0.6;
    font-size: 1rem;
  }

  .alert-dismiss:hover {
    opacity: 1;
  }

  /* Rating Summary */
  .rating-summary-inline {
    display: flex;
    gap: 2rem;
    align-items: center;
    padding: 1.25rem;
    background: rgba(30, 41, 59, 0.3);
    border-radius: 0.75rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .big-rating {
    text-align: center;
    min-width: 100px;
  }

  .big-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: #fbbf24;
    line-height: 1;
  }

  .big-stars {
    margin: 0.25rem 0;
  }

  .review-count {
    display: block;
    font-size: 0.8rem;
    color: #94a3b8;
    margin-top: 0.25rem;
  }

  .rating-bars {
    flex: 1;
    min-width: 200px;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .rating-bar-row {
    display: grid;
    grid-template-columns: 2rem 1fr 2rem;
    align-items: center;
    gap: 0.5rem;
  }

  .bar-label {
    font-size: 0.75rem;
    color: #94a3b8;
    text-align: right;
  }

  .bar-track {
    height: 6px;
    background: rgba(148, 163, 184, 0.1);
    border-radius: 3px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #fbbf24, #f59e0b);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .bar-count {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  /* Stars */
  .star {
    color: rgba(148, 163, 184, 0.3);
    font-size: 1rem;
    transition: color 0.15s;
  }

  .star.filled {
    color: #fbbf24;
  }

  .star-btn {
    background: none;
    border: none;
    font-size: 1.75rem;
    color: rgba(148, 163, 184, 0.3);
    cursor: pointer;
    padding: 0.125rem;
    transition: color 0.15s, transform 0.15s;
    line-height: 1;
  }

  .star-btn:hover {
    transform: scale(1.2);
  }

  .star-btn.active {
    color: #fbbf24;
  }

  .star-hint {
    font-size: 0.8rem;
    color: #fbbf24;
    margin-left: 0.5rem;
    font-weight: 500;
  }

  /* Review Form */
  .review-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .form-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #e2e8f0;
  }

  .star-input {
    display: flex;
    align-items: center;
    gap: 0.125rem;
  }

  .review-textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    line-height: 1.5rem;
    color: #e2e8f0;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    font-family: inherit;
    resize: vertical;
    min-height: 100px;
  }

  .review-textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .review-textarea::placeholder {
    color: rgba(203, 213, 225, 0.5);
  }

  .char-count {
    font-size: 0.75rem;
    color: #64748b;
    text-align: right;
  }

  .form-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  /* Review Item */
  .review-item {
    padding: 1.25rem 0;
    border-bottom: 1px solid rgba(148, 163, 184, 0.08);
  }

  .review-item:last-child {
    border-bottom: none;
  }

  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 0.5rem;
  }

  .review-meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .review-stars .star {
    font-size: 0.9rem;
  }

  .review-title-text {
    font-size: 1rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0;
  }

  .review-author-info {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.8rem;
    color: #94a3b8;
  }

  .review-author {
    font-weight: 500;
    color: #cbd5e1;
  }

  .review-edited {
    font-style: italic;
    color: #64748b;
  }

  .review-body {
    color: #cbd5e1;
    line-height: 1.6;
    margin: 0;
    font-size: 0.95rem;
    white-space: pre-line;
  }

  .review-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .confirm-hint {
    font-size: 0.75rem;
    color: #fca5a5;
  }

  /* Reviews List */
  .reviews-list {
    display: flex;
    flex-direction: column;
  }

  /* Empty & Loading */
  .empty-state {
    text-align: center;
    padding: 2rem 1rem;
    color: #94a3b8;
  }

  .loading-state {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(148, 163, 184, 0.2);
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 0.75rem;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 640px) {
    .rating-summary-inline {
      flex-direction: column;
      align-items: stretch;
    }

    .big-rating {
      text-align: center;
    }

    .review-header {
      flex-direction: column;
    }
  }
</style>
