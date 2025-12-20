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
		submitMessage = '';

		try {
			const db = await getFirestore();
			if (!db) throw new Error('Firestore not available');

			const { collection, doc, setDoc, serverTimestamp } = await import('firebase/firestore');
			const commentsCollection = collection(db, 'pages', postId, 'comments');
			const commentId = generateCommentId(commenterName);

			await setDoc(doc(commentsCollection, commentId), {
				text: newCommentText.trim(),
				author: commenterName.trim() || 'Anonymous',
				createdAt: serverTimestamp()
			});

			newCommentText = '';
			// Keep name for convenience? Or clear it? Typically creating a better UX means clearing.
			// commenterName = '';
			submitMessage = 'posted';

			// Clear success message after 3 seconds
			setTimeout(() => {
				submitMessage = '';
			}, 3000);

			// Trigger background cleanup (fire and forget)
			fetch('/api/comments/cleanup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ postId })
			}).catch((err) => console.error('[Comments] Cleanup trigger failed:', err));
		} catch (err) {
			console.error('Error submitting comment:', err);
			submitMessage = 'error';
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
			{#if comments.length > 0}
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
	.comments-section {
		max-width: 1000px;
		margin: 4rem auto;
		padding: 0 2rem;
		font-family:
			'Inter',
			system-ui,
			-apple-system,
			sans-serif;
	}

	.comments-header h2 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1e293b;
		margin-bottom: 2rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.comments-header .count {
		background: #f1f5f9;
		color: #64748b;
		font-size: 0.9rem;
		padding: 0.2rem 0.6rem;
		border-radius: 999px;
		font-weight: 600;
	}

	.comments-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.comment-card {
		display: flex;
		gap: 1rem;
		animation: fadeIn 0.3s ease-in-out;
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

	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.9rem;
		flex-shrink: 0;
		user-select: none;
	}

	.comment-body {
		flex: 1;
		background: #f8fafc;
		border-radius: 0 1rem 1rem 1rem;
		padding: 1rem;
		position: relative;
	}

	/* Little triangle for speech bubble effect */
	.comment-body::before {
		content: '';
		position: absolute;
		top: 0;
		left: -8px;
		width: 0;
		height: 0;
		border-style: solid;
		border-width: 0 8px 10px 0;
		border-color: transparent #f8fafc transparent transparent;
	}

	.comment-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.4rem;
	}

	.author-name {
		font-weight: 600;
		color: #0f172a;
		font-size: 0.95rem;
	}

	.dot {
		color: #cbd5e1;
		font-size: 0.8rem;
	}

	.comment-date {
		color: #94a3b8;
		font-size: 0.85rem;
	}

	.comment-text {
		color: #334155;
		line-height: 1.5;
		font-size: 1rem;
		margin: 0;
		white-space: pre-wrap;
	}

	.empty-state {
		text-align: center;
		color: #94a3b8;
		padding: 2rem;
		font-style: italic;
	}

	.load-more-container {
		text-align: center;
		margin-top: 1rem;
	}

	/* Form Styles */
	.comment-form-wrapper {
		background: #fff !important;
		border: 1px solid #e2e8f0 !important;
		border-radius: 1rem !important;
		padding: 2rem !important;
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
		margin-top: 3rem !important;
	}

	.comment-form-wrapper h3 {
		font-size: 1.1rem;
		font-weight: 600;
		color: #1e293b;
		margin-bottom: 1.25rem;
	}

	.comment-form {
		display: flex !important;
		flex-direction: column !important;
		gap: 1rem !important;
		visibility: visible !important;
		opacity: 1 !important;
	}

	.modern-input,
	.modern-textarea {
		width: 100% !important;
		padding: 0.875rem 1rem !important;
		border: 1px solid #cbd5e1 !important;
		border-radius: 0.5rem !important;
		font-size: 0.95rem !important;
		transition: all 0.2s;
		font-family: inherit;
		background: #fff !important;
		display: block !important;
		visibility: visible !important;
		opacity: 1 !important;
		color: #1f2937 !important;
		box-shadow: none;
	}

	.modern-input:focus,
	.modern-textarea:focus {
		outline: none !important;
		border-color: #3498db !important;
		box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1) !important;
	}

	.modern-textarea {
		resize: vertical;
		min-height: 100px !important;
		height: auto !important;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 1rem;
	}

	.success-msg {
		color: #16a34a;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.error-msg {
		color: #dc2626;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.modern-btn {
		background: #3498db !important;
		color: white !important;
		border: none !important;
		padding: 0.75rem 1.5rem !important;
		border-radius: 0.5rem !important;
		font-weight: 600 !important;
		font-size: 0.95rem !important;
		cursor: pointer !important;
		transition: all 0.2s;
		display: inline-block !important;
		visibility: visible !important;
		opacity: 1 !important;
	}

	.modern-btn:hover:not(:disabled) {
		background: #2980b9;
		transform: translateY(-1px);
		box-shadow: 0 4px 6px -1px rgba(52, 152, 219, 0.2);
	}

	.modern-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.text-btn {
		background: none;
		border: none;
		color: #3498db;
		font-weight: 600;
		cursor: pointer;
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
		transition: color 0.2s;
	}

	.text-btn:hover {
		color: #2980b9;
		text-decoration: underline;
	}
</style>
