<script lang="ts">
  import { page } from '$app/stores';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Input from '$lib/components/ui/Input.svelte';

  export let data: {
    isAuthenticated: boolean;
    uid: string | null;
    role: string | null;
    postId: string;
    reviewablePages: { id: string; title: string }[];
    reviews: {
      id: string;
      uid: string;
      author: string;
      title: string;
      body: string;
      rating: number;
      createdAt: string | null;
      updatedAt: string | null;
    }[];
    totalReviews: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
    userReviewIds: string[];
  };

  // ── Local state ──────────────────────────────────────────────────────
  let selectedPageId = data.postId || '';
  let reviews = [...data.reviews];
  let totalReviews = data.totalReviews;
  let averageRating = data.averageRating;
  let ratingDistribution = { ...data.ratingDistribution };
  let loading = false;
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

  // Confirm delete
  let confirmDeleteId: string | null = null;

  $: isOwnReview = (reviewId: string) => data.userReviewIds.includes(reviewId);
  $: canReview = data.isAuthenticated && selectedPageId;

  // ── Page selection ───────────────────────────────────────────────────
  async function selectPage(pageId: string) {
    selectedPageId = pageId;
    error = '';
    success = '';
    showForm = false;
    editingReviewId = null;
    confirmDeleteId = null;

    // Update URL
    const params = new URLSearchParams($page.url.searchParams);
    if (pageId) {
      params.set('postId', pageId);
    } else {
      params.delete('postId');
    }
    const newUrl = params.toString() ? `/reviews?${params.toString()}` : '/reviews';
    window.history.replaceState({}, '', newUrl);

    if (pageId) {
      await fetchReviews();
    } else {
      reviews = [];
      totalReviews = 0;
      averageRating = 0;
      ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    }
  }

  // ── Fetch reviews ────────────────────────────────────────────────────
  async function fetchReviews() {
    if (!selectedPageId) return;
    loading = true;
    error = '';
    try {
      const res = await fetch(`/api/reviews?postId=${encodeURIComponent(selectedPageId)}`);
      const json = await res.json();
      if (!res.ok) {
        error = json.error || 'Failed to load reviews';
        return;
      }
      reviews = json.reviews || [];
      totalReviews = json.totalReviews || 0;
      averageRating = json.averageRating || 0;
      ratingDistribution = json.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    } catch {
      error = 'Network error. Please try again.';
    } finally {
      loading = false;
    }
  }

  // ── Open create form ─────────────────────────────────────────────────
  function openCreateForm() {
    if (!data.isAuthenticated) {
      error = 'Please sign in to write a review.';
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

  // ── Open edit form ───────────────────────────────────────────────────
  function openEditForm(review: typeof reviews[0]) {
    editingReviewId = review.id;
    formTitle = review.title;
    formBody = review.body;
    formRating = review.rating;
    formAuthor = review.author;
    formError = '';
    showForm = true;
  }

  // ── Cancel form ──────────────────────────────────────────────────────
  function cancelForm() {
    showForm = false;
    editingReviewId = null;
    formError = '';
  }

  // ── Set rating ───────────────────────────────────────────────────────
  function setRating(r: number) {
    formRating = r;
  }

  // ── Submit review (create or update) ─────────────────────────────────
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
        // UPDATE
        const res = await fetch('/api/reviews', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reviewId: editingReviewId,
            postId: selectedPageId,
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
        // CREATE
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId: selectedPageId,
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

  // ── Delete review ────────────────────────────────────────────────────
  async function deleteReview(reviewId: string) {
    if (confirmDeleteId !== reviewId) {
      confirmDeleteId = reviewId;
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, postId: selectedPageId })
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

  // ── Helpers ──────────────────────────────────────────────────────────
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

<svelte:head>
  <title>Reviews — VeryNice Kazakhstan</title>
  <meta name="description" content="Read and write reviews for destinations across Kazakhstan." />
</svelte:head>

<div class="reviews-page">
  <!-- Hero -->
  <section class="reviews-hero">
    <div class="hero-content">
      <h1>Traveler Reviews</h1>
      <p class="hero-subtitle">Share your experiences and help fellow travelers discover Kazakhstan</p>
    </div>
  </section>

  <div class="reviews-container">
    <!-- Sidebar: Page Selector -->
    <aside class="reviews-sidebar">
      <Card>
        <div slot="header">
          <h3>Select Destination</h3>
        </div>
        <div class="page-selector">
          <select bind:value={selectedPageId} on:change={(e) => selectPage(e.currentTarget.value)}>
            <option value="">— Choose a page —</option>
            {#each data.reviewablePages as pg}
              <option value={pg.id}>{pg.title}</option>
            {/each}
          </select>
        </div>
      </Card>

      <!-- Rating Summary (shown when a page is selected) -->
      {#if selectedPageId}
        <Card>
          <div slot="header">
            <h3>Rating Summary</h3>
          </div>
          <div class="rating-summary">
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
        </Card>
      {/if}
    </aside>

    <!-- Main Content -->
    <main class="reviews-main">
      {#if !selectedPageId}
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <h2>Select a Destination</h2>
          <p>Choose a destination from the sidebar to read and write reviews.</p>
        </div>
      {:else if loading}
        <div class="loading-state">
          <div class="spinner-large"></div>
          <p>Loading reviews...</p>
        </div>
      {:else}
        <!-- Action Bar -->
        <div class="action-bar">
          <h2>Reviews for {data.reviewablePages.find(p => p.id === selectedPageId)?.title || selectedPageId}</h2>
          <div class="action-buttons">
            {#if canReview}
              <Button variant="primary" on:click={openCreateForm} disabled={showForm && !editingReviewId}>
                ✍️ Write a Review
              </Button>
            {:else if !data.isAuthenticated}
              <p class="signin-hint">Sign in to write a review</p>
            {/if}
          </div>
        </div>

        <!-- Alerts -->
        {#if error}
          <div class="alert alert-error">
            <span class="alert-icon">⚠️</span> {error}
            <button class="alert-dismiss" on:click={() => (error = '')}>✕</button>
          </div>
        {/if}
        {#if success}
          <div class="alert alert-success">
            <span class="alert-icon">✅</span> {success}
            <button class="alert-dismiss" on:click={() => (success = '')}>✕</button>
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
                  <span class="alert-icon">⚠️</span> {formError}
                </div>
              {/if}

              <!-- Star Rating -->
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

              <!-- Author Name -->
              <div class="form-group">
                <Input
                  type="text"
                  label="Your Name"
                  bind:value={formAuthor}
                  placeholder="Anonymous"
                  id="review-author"
                />
              </div>

              <!-- Title -->
              <div class="form-group">
                <Input
                  type="text"
                  label="Review Title *"
                  bind:value={formTitle}
                  placeholder="Summarize your experience"
                  required={true}
                  id="review-title"
                />
                <span class="char-count">{formTitle.length}/120</span>
              </div>

              <!-- Body -->
              <div class="form-group">
                <label class="form-label" for="review-body">Your Review *</label>
                <textarea
                  id="review-body"
                  class="review-textarea"
                  bind:value={formBody}
                  placeholder="Share the details of your experience..."
                  rows="5"
                  required
                  maxlength="2000"
                ></textarea>
                <span class="char-count">{formBody.length}/2000</span>
              </div>

              <div class="form-actions">
                <Button type="submit" variant="primary" disabled={submitting} loading={submitting}>
                  {editingReviewId ? 'Update Review' : 'Submit Review'}
                </Button>
                <Button variant="ghost" on:click={cancelForm} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        {/if}

        <!-- Reviews List -->
        {#if reviews.length === 0}
          <div class="empty-state compact">
            <div class="empty-icon">💬</div>
            <h3>No reviews yet</h3>
            <p>Be the first to share your experience!</p>
          </div>
        {:else}
          <div class="reviews-list">
            {#each reviews as review (review.id)}
              <Card hover={false}>
                <div class="review-card">
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
                        <span class="review-date">{formatDate(review.createdAt)}</span>
                      {/if}
                      {#if review.updatedAt && review.updatedAt !== review.createdAt}
                        <span class="review-edited">(edited)</span>
                      {/if}
                    </div>
                  </div>

                  <p class="review-body">{review.body}</p>

                  <!-- Owner actions -->
                  {#if isOwnReview(review.id)}
                    <div class="review-actions">
                      <Button variant="ghost" size="sm" on:click={() => openEditForm(review)}>
                        ✏️ Edit
                      </Button>
                      <Button
                        variant={confirmDeleteId === review.id ? 'danger' : 'ghost'}
                        size="sm"
                        on:click={() => deleteReview(review.id)}
                      >
                        {confirmDeleteId === review.id ? '⚠️ Confirm Delete' : '🗑️ Delete'}
                      </Button>
                      {#if confirmDeleteId === review.id}
                        <span class="confirm-hint">Click again to confirm</span>
                      {/if}
                    </div>
                  {/if}
                </div>
              </Card>
            {/each}
          </div>
        {/if}
      {/if}
    </main>
  </div>
</div>

<style>
  /* ── Page Layout ─────────────────────────────────────────────────────── */
  .reviews-page {
    min-height: 100vh;
    color: #e2e8f0;
  }

  .reviews-hero {
    text-align: center;
    padding: 4rem 1.5rem 2rem;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  }

  .hero-content h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-subtitle {
    font-size: 1.125rem;
    color: #94a3b8;
    margin: 0;
  }

  .reviews-container {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
  }

  /* ── Sidebar ─────────────────────────────────────────────────────────── */
  .reviews-sidebar {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .page-selector select {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    color: #e2e8f0;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 0.5rem;
    font-family: inherit;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
  }

  .page-selector select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  /* ── Rating Summary ──────────────────────────────────────────────────── */
  .rating-summary {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .big-rating {
    text-align: center;
  }

  .big-number {
    font-size: 3rem;
    font-weight: 700;
    color: #fbbf24;
    line-height: 1;
  }

  .big-stars {
    margin: 0.25rem 0;
  }

  .review-count {
    display: block;
    font-size: 0.875rem;
    color: #94a3b8;
    margin-top: 0.25rem;
  }

  .rating-bars {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
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
    height: 8px;
    background: rgba(148, 163, 184, 0.1);
    border-radius: 4px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #fbbf24, #f59e0b);
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .bar-count {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  /* ── Stars ────────────────────────────────────────────────────────────── */
  .star {
    color: rgba(148, 163, 184, 0.3);
    font-size: 1.25rem;
    transition: color 0.15s;
  }

  .star.filled {
    color: #fbbf24;
  }

  .star-btn {
    background: none;
    border: none;
    font-size: 2rem;
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
    font-size: 0.875rem;
    color: #fbbf24;
    margin-left: 0.5rem;
    font-weight: 500;
  }

  .review-stars .star {
    font-size: 1rem;
  }

  /* ── Main Content ─────────────────────────────────────────────────────── */
  .reviews-main {
    min-width: 0;
  }

  .action-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .action-bar h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }

  .signin-hint {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
  }

  /* ── Alerts ───────────────────────────────────────────────────────────── */
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

  .alert-icon {
    flex-shrink: 0;
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

  /* ── Review Form ──────────────────────────────────────────────────────── */
  .review-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
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
    min-height: 120px;
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

  /* ── Review Card ──────────────────────────────────────────────────────── */
  .review-card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .review-meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .review-title-text {
    font-size: 1.1rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0;
  }

  .review-author-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
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
    line-height: 1.65;
    margin: 0;
    white-space: pre-line;
  }

  .review-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(148, 163, 184, 0.08);
  }

  .confirm-hint {
    font-size: 0.8rem;
    color: #fca5a5;
  }

  /* ── Reviews List ─────────────────────────────────────────────────────── */
  .reviews-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* ── Empty & Loading States ───────────────────────────────────────────── */
  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
  }

  .empty-state.compact {
    padding: 3rem 2rem;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .empty-state h2,
  .empty-state h3 {
    color: #e2e8f0;
    margin: 0 0 0.5rem;
  }

  .empty-state p {
    color: #94a3b8;
    margin: 0;
  }

  .loading-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #94a3b8;
  }

  .spinner-large {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(148, 163, 184, 0.2);
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* ── Responsive ───────────────────────────────────────────────────────── */
  @media (max-width: 768px) {
    .reviews-container {
      grid-template-columns: 1fr;
      padding: 1rem 1rem 3rem;
    }

    .reviews-hero {
      padding: 2.5rem 1rem 1.5rem;
    }

    .hero-content h1 {
      font-size: 1.75rem;
    }

    .review-header {
      flex-direction: column;
    }
  }
</style>
