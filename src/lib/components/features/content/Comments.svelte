<!-- src/lib/components/content/Comments.svelte (FINAL, WITH "SHOW LESS" FUNCTIONALITY) -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { get } from 'svelte/store';
	import { getFirestore } from '$lib/firebaseApp';
	import { currentLanguage } from '$lib/stores/languageStore';
	import { translatePageTo } from '$lib/services/aiTranslator';

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
				collection(db, `pages/${postId}/comments`),
				orderBy('createdAt', 'desc')
			);

			unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
				comments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

				// Re-apply translation so newly loaded comments are also localized
				if (browser) {
					const lang = get(currentLanguage);
					if (lang && lang !== 'EN') {
						translatePageTo(lang).catch((err) =>
							console.error('[Comments] Failed to re-apply translation', err)
						);
					}
				}
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
		padding: 1.5rem 1rem; /* Reduced padding */
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
		padding-bottom: 1.25rem; /* Reduced from 1.5rem */
		margin-bottom: 2rem; /* Reduced from 2.5rem */
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
		font-size: 1.5rem; /* Slightly smaller */
		font-weight: 800;
		color: inherit;
		margin: 0;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.comments-header .count {
		background: #eff6ff;
		color: #3b82f6;
		font-size: 0.8rem;
		padding: 0.2rem 0.65rem;
		border-radius: 999px; /* Pill-shaped */
		font-weight: 700;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
	}

	/* -- List Layout -- */
	.comments-list {
		display: flex;
		flex-direction: column;
		gap: 1rem; /* Reduced from 1.5rem for tighter spacing */
		margin-bottom: 4rem;
	}

	/* -- Comment Card -- */
	.comment-card {
		display: grid;
		grid-template-columns: 48px 1fr;
		gap: 1rem;
		background: #d1d4da; /* Light gray background */
		padding: 0.875rem 1.5rem; /* Slimmer padding for pill shape */
		border-radius: 999px; /* Pill-shaped like Google */
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
		border: 1px solid rgba(0, 0, 0, 0.06);
	}

	.comment-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
		border-color: rgba(0, 0, 0, 0.1);
	}

	.avatar {
		width: 44px; /* Slightly smaller */
		height: 44px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 1rem;
		user-select: none;
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05); /* Subtle inner border */
		flex-shrink: 0;
	}

	.comment-body {
		display: flex;
		flex-direction: column;
		gap: 0.35rem; /* Tighter spacing */
		justify-content: center; /* Center vertically for slim look */
	}

	.comment-meta {
		display: flex;
		align-items: baseline;
		gap: 0.6rem; /* Tighter spacing */
	}

	.author-name {
		font-weight: 700;
		color: #1e293b;
		font-size: 0.95rem; /* Slightly smaller */
	}

	.dot {
		color: #cbd5e1;
		font-size: 0.7rem;
	}

	.comment-date {
		color: #64748b;
		font-size: 0.8rem;
		font-weight: 500;
	}

	.comment-text {
		color: #334155;
		line-height: 1.5;
		font-size: 0.95rem; /* Slightly smaller for slim look */
		white-space: pre-wrap; /* Preserve paragraphs */
		margin: 0;
	}

	.empty-state {
		text-align: center;
		padding: 2rem;
		background: #d1d4da; /* Light gray background */
		border-radius: 999px; /* Pill-shaped */
		color: #94a3b8;
		font-style: italic;
		font-size: 0.9rem;
	}

	.load-more-container {
		text-align: center;
		margin-top: 1rem;
	}

	/* -- Premium Form -- */
	.comment-form-wrapper {
		background: #d1d4da; /* Light gray background */
		border-radius: 20px; /* Reduced from 40px for sleeker look */
		padding: 1.25rem 1.5rem; /* Further reduced for slimmer look */
		box-shadow:
			0 20px 40px -5px rgba(0, 0, 0, 0.1),
			0 8px 10px -6px rgba(0, 0, 0, 0.1);
		border: 1px solid #f1f5f9;
		position: relative;
		/* overflow: hidden; Removed to prevent clipping */
	}

	/* Decorative gradient top border */
	/* Decorative gradient top border REMOVED */
	.comment-form-wrapper::before {
		display: none;
	}

	.comment-form-wrapper h3 {
		font-size: 1.35rem; /* Slightly reduced */
		font-weight: 800;
		color: #1e293b;
		margin-bottom: 1.25rem; /* Reduced from 1.5rem */
		text-align: center;
		letter-spacing: -0.02em;
	}

	.comment-form {
		display: flex !important;
		flex-direction: column !important;
		gap: 0.875rem !important; /* Reduced from 1rem */
		width: 100% !important;
	}

	.input-group {
		position: relative;
		width: 100% !important;
		display: block !important;
	}

	/* Google-style input wrapper */
	.input-group:has(.modern-input) {
		background: #e8eaee; /* Slightly lighter gray for input fields */
		border-radius: 999px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		border: 1px solid rgba(0, 0, 0, 0.08);
		transition: all 0.2s;
	}

	.input-group:has(.modern-input):focus-within {
		background: #f0f1f4; /* Even lighter on focus */
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		border-color: rgba(0, 0, 0, 0.1);
	}

	/* Google-style textarea wrapper */
	.input-group:has(.modern-textarea) {
		background: #e8eaee; /* Slightly lighter gray for input fields */
		border-radius: 24px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		border: 1px solid rgba(0, 0, 0, 0.08);
		transition: all 0.2s;
	}

	.input-group:has(.modern-textarea):focus-within {
		background: #f0f1f4; /* Even lighter on focus */
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		border-color: rgba(0, 0, 0, 0.1);
	}

	.modern-input,
	.modern-textarea {
		width: 100% !important;
		padding: 0.75rem 1.25rem !important;
		border: none !important;
		border-radius: 0 !important;
		font-size: 0.95rem !important;
		background: transparent !important;
		color: #1e293b !important;
		transition: all 0.2s ease-in-out;
		font-family: inherit;
		display: block !important;
		opacity: 1 !important;
		visibility: visible !important;
		box-sizing: border-box !important;
		min-height: 40px !important;
		box-shadow: none !important;
	}

	.modern-input:focus,
	.modern-textarea:focus {
		outline: none !important;
		background: transparent !important;
		border: none !important;
		box-shadow: none !important;
	}

	.modern-input::placeholder,
	.modern-textarea::placeholder {
		color: #94a3b8 !important;
		opacity: 1 !important;
	}

	.modern-textarea {
		min-height: 80px !important;
		resize: vertical !important;
		height: auto !important;
		padding: 1rem 1.25rem !important;
	}

	.form-actions {
		display: flex !important;
		justify-content: flex-end !important;
		align-items: center !important;
		margin-top: 0.5rem !important;
		flex-wrap: wrap !important;
		gap: 1rem !important;
		width: 100% !important;
	}

	.modern-btn {
		background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
		color: white !important;
		border: none !important;
		padding: 0.625rem 1.75rem !important;
		border-radius: 999px !important; /* Pill-shaped like Google */
		font-weight: 600 !important;
		font-size: 0.95rem !important;
		cursor: pointer !important;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3) !important;
		display: inline-flex !important;
		align-items: center !important;
		justify-content: center !important;
		min-width: 130px !important;
		position: relative !important;
		z-index: 10 !important;
		opacity: 1 !important;
		visibility: visible !important;
		height: auto !important;
		white-space: nowrap !important;
	}

	.modern-btn:hover:not(:disabled) {
		background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%) !important;
		box-shadow: 0 4px 8px rgba(37, 99, 235, 0.4) !important;
	}

	.modern-btn:active:not(:disabled) {
		transform: scale(0.98);
	}

	.modern-btn:disabled {
		background: #cbd5e1 !important;
		cursor: not-allowed;
		box-shadow: none !important;
		transform: none;
		opacity: 0.6 !important;
	}

	.text-btn {
		background: #d1d4da; /* Light gray background */
		color: #64748b;
		border: 1px solid rgba(0, 0, 0, 0.08);
		padding: 0.625rem 1.5rem;
		border-radius: 999px; /* Pill-shaped like Google */
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.9rem;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
	}

	.text-btn:hover {
		border-color: rgba(0, 0, 0, 0.12);
		color: #1e293b;
		background: #c4c7cd; /* Slightly darker gray on hover */
		box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
	}

	.success-msg {
		color: #15803d;
		font-size: 0.875rem;
		font-weight: 600;
		background: #dcfce7;
		padding: 0.5rem 1rem;
		border-radius: 999px; /* Pill-shaped like Google */
		display: inline-block;
	}

	.error-msg {
		color: #991b1b;
		font-size: 0.875rem;
		font-weight: 600;
		background: #fee2e2;
		padding: 0.5rem 1rem;
		border-radius: 999px; /* Pill-shaped like Google */
		display: inline-block;
	}

	@media (max-width: 640px) {
		.comment-card {
			grid-template-columns: 1fr; /* Stack avatar on top for tiny screens or keep side by side if small enough */
			display: flex;
			gap: 0.75rem;
			padding: 0.75rem 1rem; /* Slimmer on mobile */
		}

		.avatar {
			width: 38px;
			height: 38px;
			font-size: 0.875rem;
			flex-shrink: 0;
		}

		.comment-form-wrapper {
			padding: 1rem; /* Reduced from 1.25rem */
		}

		.modern-input,
		.modern-textarea {
			font-size: 0.9rem !important;
			padding: 0.625rem 1rem !important;
		}

		.modern-textarea {
			padding: 0.875rem 1rem !important;
		}

		.modern-btn {
			width: 100%; /* Full width button on mobile */
			padding: 0.75rem 1.5rem !important;
		}

		.form-actions {
			flex-direction: column-reverse;
			gap: 0.75rem;
		}

		.comment-form {
			gap: 0.75rem !important;
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
