<!-- src/lib/components/content/Comments.svelte (FINAL, WITH "SHOW LESS" FUNCTIONALITY) -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { getFirestore } from '$lib/firebaseApp';

	export let postId: string;

	const INITIAL_VISIBLE_COUNT = 3;

	const sanitizeSegment = (value: string) =>
		(value || '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 24) || 'anonymous';

	const generateCommentId = (name: string) => {
		const base = sanitizeSegment(name);
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const random = Math.random().toString(36).slice(2, 6);
		return `${base}-${timestamp}-${random}`;
	};

	const getInitials = (name: string) => {
		return (name || 'A').trim().slice(0, 2).toUpperCase();
	};

	// Generate a consistent pastel color for the avatar background based on the name
	const getAvatarColor = (name: string) => {
		const colors = [
			'#e0f2fe',
			'#dbeafe',
			'#fae8ff',
			'#fce7f3',
			'#ffe4e6',
			'#fee2e2',
			'#ffedd5',
			'#fef3c7',
			'#ecfccb',
			'#dcfce7'
		];
		let hash = 0;
		for (let i = 0; i < name.length; i++) {
			hash = name.charCodeAt(i) + ((hash << 5) - hash);
		}
		return colors[Math.abs(hash) % colors.length];
	};

	const getAvatarTextColor = (name: string) => {
		const colors = [
			'#0369a1',
			'#1e40af',
			'#86198f',
			'#9d174d',
			'#9f1239',
			'#991b1b',
			'#9a3412',
			'#92400e',
			'#3f6212',
			'#166534'
		];
		let hash = 0;
		for (let i = 0; i < name.length; i++) {
			hash = name.charCodeAt(i) + ((hash << 5) - hash);
		}
		return colors[Math.abs(hash) % colors.length];
	};

	let comments: any[] = [];
	let visibleCommentCount = INITIAL_VISIBLE_COUNT;
	let commenterName = '';
	let newCommentText = '';
	let pendingComment = null;
	let unsubscribe = () => {};
	let isSubmitting = false;
	let submitMessage = '';

	$: visibleComments = comments.slice(0, visibleCommentCount);

	onMount(() => {
		if (!browser) return;

		(async () => {
			const db = await getFirestore();
			if (!db) {
				console.warn('[Comments] Firestore not available.');
				return;
			}

			// Dynamic import after db check
			const { collection, query, orderBy, onSnapshot } = await import('firebase/firestore');

			const commentsQuery = query(
				collection(db, 'pages', postId, 'comments'),
				orderBy('createdAt', 'desc') // Show newest first usually makes more sense for active sections, but sticking to existing logic or user pref? Let's use DESC for modern feel
			);

			unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
				comments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
			});
		})();
	});

	onDestroy(() => {
		unsubscribe();
		if (browser) delete (window as any).addComment;
	});

	async function handleSubmit() {
		if (!newCommentText.trim() || !postId || isSubmitting) return;

		isSubmitting = true;
		submitMessage = 'Posting...';

		// Show instant preview (Ghost comment)
		pendingComment = {
			id: 'temp-ghost',
			text: newCommentText,
			author: commenterName.trim() || 'Anonymous',
			createdAt: { toDate: () => new Date() },
			isPending: true
		};

		try {
			const payload = {
				postId: postId,
				text: newCommentText.trim(),
				author: commenterName
			};

			const response = await fetch('/api/comments/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const result = await response.json();

			if (!response.ok) {
				// Handle offensive content specially
				if (result.isOffensive) {
					submitMessage = 'error';
					newCommentText = '';
					commenterName = '';
					pendingComment = null;
					alert(result.valiationError || 'Comment flagged as inappropriate.');
					return;
				}
				throw new Error(result.error || 'Server rejected post');
			}

			// Success
			newCommentText = '';
			// commenterName = ''; // Optional clear
			submitMessage = 'posted';

			// Note: We leave pendingComment visible for a moment or until real data arrives.
			// Better to clear it now so double-entry doesn't show up when real one arrives fast.
			pendingComment = null;

			// Clear success message after 3 seconds
			setTimeout(() => {
				submitMessage = '';
			}, 3000);

			// Cleanup is handled by the server endpoint implicitly or we can still verify cleanup
			fetch('/api/comments/cleanup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ postId })
			}).catch((err) => console.error('[Comments] Cleanup trigger failed:', err));
		} catch (err) {
			console.error('Error submitting comment:', err);
			submitMessage = 'error';
			pendingComment = null;
			alert('Failed to post comment: ' + (err.message || 'Unknown error'));
		} finally {
			isSubmitting = false;
		}
	}

	function showAllComments() {
		visibleCommentCount = comments.length;
	}

	function showLessComments() {
		visibleCommentCount = INITIAL_VISIBLE_COUNT;
	}

	const formatDate = (timestamp: any) => {
		if (!timestamp?.toDate) return 'Just now';
		// Use a relative time format for a modern feel, or a nice short date
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		}).format(timestamp.toDate());
	};
</script>

<section class="comments-section">
	<div class="comments-header">
		<h2>Discussion <span class="count">{comments.length}</span></h2>
	</div>

	<div class="comments-container">
		<!-- List of comments -->
		<div class="comments-list">
			{#if comments.length > 0 || pendingComment}
				{#if pendingComment}
					<div class="comment-card" style="opacity: 0.6;">
						<div
							class="avatar"
							style="background-color: {getAvatarColor(
								pendingComment.author
							)}; color: {getAvatarTextColor(pendingComment.author)}"
						>
							{getInitials(pendingComment.author)}
						</div>
						<div class="comment-body">
							<div class="comment-meta">
								<span class="author-name">{pendingComment.author || 'Anonymous'}</span>
								<span class="dot">•</span>
								<span class="comment-date">Posting...</span>
							</div>
							<p class="comment-text">{pendingComment.text}</p>
						</div>
					</div>
				{/if}

				{#each visibleComments as comment (comment.id)}
					<div class="comment-card">
						<div
							class="avatar"
							style="background-color: {getAvatarColor(comment.author)}; color: {getAvatarTextColor(
								comment.author
							)}"
						>
							{getInitials(comment.author)}
						</div>
						<div class="comment-body">
							<div class="comment-meta">
								<span class="author-name">{comment.author || 'Anonymous'}</span>
								<span class="dot">•</span>
								<span class="comment-date">{formatDate(comment.createdAt)}</span>
							</div>
							<p class="comment-text">{comment.text}</p>
						</div>
					</div>
				{/each}
			{:else}
				<div class="empty-state">
					<p>No comments yet. Start the conversation!</p>
				</div>
			{/if}

			{#if comments.length > INITIAL_VISIBLE_COUNT}
				<div class="load-more-container">
					{#if visibleCommentCount > INITIAL_VISIBLE_COUNT}
						<button class="text-btn" on:click={showLessComments}>Show Less</button>
					{:else}
						<button class="text-btn" on:click={showAllComments}
							>View {comments.length - INITIAL_VISIBLE_COUNT} more comments</button
						>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Add Comment Form -->
		<div class="comment-form-wrapper">
			<h3>Leave a Reply</h3>
			<form class="comment-form" on:submit|preventDefault={handleSubmit}>
				<div class="input-group">
					<input
						type="text"
						id="commenter-name"
						bind:value={commenterName}
						placeholder="Name"
						class="modern-input"
					/>
				</div>

				<div class="input-group">
					<textarea
						id="comment-textarea"
						bind:value={newCommentText}
						placeholder="Join the discussion..."
						required
						rows="3"
						class="modern-textarea"
					></textarea>
				</div>

				<div class="form-actions">
					{#if submitMessage === 'posted'}
						<span class="success-msg">Posted!</span>
					{:else if submitMessage === 'error'}
						<span class="error-msg">Failed to post</span>
					{/if}

					<button
						type="submit"
						class="modern-btn"
						disabled={!newCommentText.trim() || isSubmitting}
					>
						{isSubmitting ? 'Posting...' : 'Post Comment'}
					</button>
				</div>
			</form>
		</div>
	</div>
</section>

<style>
	/* -- Advanced Comments Section -- */
	.comments-section {
		width: 100%;
		max-width: 800px; /* Optimal reading width */
		margin: 4rem auto;
		padding: 2rem 1rem;
		font-family:
			'Inter',
			system-ui,
			-apple-system,
			sans-serif;
	}

	.comments-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 1.5rem;
		margin-bottom: 2.5rem;
		border-bottom: 2px solid #f1f5f9;
		position: relative;
	}

	.comments-header::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 60px;
		height: 2px;
		background: #d4a373; /* Gold accent */
	}

	.comments-header h2 {
		font-size: 1.75rem;
		font-weight: 800;
		color: #1e293b;
		margin: 0;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.comments-header .count {
		background: #eff6ff;
		color: #3b82f6;
		font-size: 0.875rem;
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		font-weight: 700;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	/* -- List Layout -- */
	.comments-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-bottom: 4rem;
	}

	/* -- Comment Card -- */
	.comment-card {
		display: grid;
		grid-template-columns: 48px 1fr;
		gap: 1.25rem;
		background: #ffffff;
		padding: 1.5rem;
		border-radius: 16px;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.02),
			0 2px 4px -1px rgba(0, 0, 0, 0.02);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
		border: 1px solid #f8fafc;
	}

	.comment-card:hover {
		transform: translateY(-2px);
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.05),
			0 4px 6px -2px rgba(0, 0, 0, 0.025);
		border-color: #e2e8f0;
	}

	.avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 1.1rem;
		user-select: none;
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05); /* Subtle inner border */
	}

	.comment-body {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.comment-meta {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
	}

	.author-name {
		font-weight: 700;
		color: #0f172a;
		font-size: 1rem;
	}

	.dot {
		color: #cbd5e1;
		font-size: 0.75rem;
	}

	.comment-date {
		color: #64748b;
		font-size: 0.85rem;
		font-weight: 500;
	}

	.comment-text {
		color: #334155;
		line-height: 1.6;
		font-size: 1rem;
		white-space: pre-wrap; /* Preserve paragraphs */
		margin: 0;
	}

	.empty-state {
		text-align: center;
		padding: 3rem;
		background: #f8fafc;
		border-radius: 12px;
		color: #94a3b8;
		font-style: italic;
	}

	.load-more-container {
		text-align: center;
		margin-top: 1rem;
	}

	/* -- Premium Form -- */
	.comment-form-wrapper {
		background: #ffffff;
		border-radius: 20px;
		padding: 2.5rem;
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.05),
			0 10px 10px -5px rgba(0, 0, 0, 0.01);
		border: 1px solid #e2e8f0;
		position: relative;
		/* overflow: hidden; Removed to prevent clipping */
	}

	/* Decorative gradient top border */
	.comment-form-wrapper::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, #3b82f6, #8b5cf6);
	}

	.comment-form-wrapper h3 {
		font-size: 1.5rem;
		font-weight: 800;
		color: #1e293b;
		margin-bottom: 2rem;
		text-align: center;
		letter-spacing: -0.02em;
	}

	.comment-form {
		display: flex !important;
		flex-direction: column !important;
		gap: 1.25rem !important;
		width: 100% !important;
	}

	.input-group {
		position: relative;
		width: 100% !important;
		display: block !important;
	}

	.modern-input,
	.modern-textarea {
		width: 100% !important;
		padding: 1rem 1.25rem !important;
		border: 2px solid #e2e8f0 !important;
		border-radius: 12px !important;
		font-size: 1rem !important;
		background: #f8fafc !important;
		color: #1e293b !important;
		transition: all 0.2s ease-in-out;
		font-family: inherit;
		display: block !important;
		opacity: 1 !important;
		visibility: visible !important;
		box-sizing: border-box !important;
		min-height: 50px !important; /* Force height */
		box-shadow: none !important;
	}

	.modern-input:focus,
	.modern-textarea:focus {
		outline: none !important;
		background: #fff !important;
		border-color: #3b82f6 !important;
		box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
	}

	.modern-input::placeholder,
	.modern-textarea::placeholder {
		color: #94a3b8 !important;
		opacity: 1 !important;
	}

	.modern-textarea {
		min-height: 120px !important;
		resize: vertical !important;
		height: auto !important;
	}

	.form-actions {
		display: flex !important;
		justify-content: space-between !important;
		align-items: center !important;
		margin-top: 1.5rem !important; /* Increased top margin */
		flex-wrap: wrap !important; /* Allow wrapping on small screens */
		gap: 1rem !important;
		width: 100% !important;
	}

	.modern-btn {
		background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
		color: white !important;
		border: none !important;
		padding: 0.875rem 2rem !important;
		border-radius: 12px !important;
		font-weight: 600 !important;
		font-size: 1rem !important;
		cursor: pointer !important;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2) !important;
		display: inline-flex !important; /* Ensure flex behavior */
		align-items: center !important;
		justify-content: center !important;
		min-width: 140px !important;
		position: relative !important;
		z-index: 10 !important;
		opacity: 1 !important;
		visibility: visible !important;
		height: auto !important;
	}

	.modern-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
		filter: brightness(1.1);
	}

	.modern-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.modern-btn:disabled {
		background: #cbd5e1;
		cursor: not-allowed;
		box-shadow: none;
		transform: none;
	}

	.text-btn {
		background: transparent;
		color: #64748b;
		border: 2px solid #e2e8f0;
		padding: 0.75rem 1.5rem;
		border-radius: 99px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.9rem;
	}

	.text-btn:hover {
		border-color: #cbd5e1;
		color: #1e293b;
		background: #f8fafc;
	}

	@media (max-width: 640px) {
		.comment-card {
			grid-template-columns: 1fr; /* Stack avatar on top for tiny screens or keep side by side if small enough */
			display: flex;
			gap: 1rem;
		}

		.avatar {
			width: 40px;
			height: 40px;
			font-size: 0.9rem;
			flex-shrink: 0;
		}

		.comment-form-wrapper {
			padding: 1.5rem;
		}

		.modern-btn {
			width: 100%; /* Full width button on mobile */
		}

		.form-actions {
			flex-direction: column-reverse;
			gap: 1rem;
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
