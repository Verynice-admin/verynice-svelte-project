<!-- src/lib/components/content/AuthorInfo.svelte (UPDATED TO BE REAL-TIME) -->

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { getFirestore } from '$lib/firebaseApp';
	import { getCloudinaryUrl } from '$lib/utils/cloudinary';
	import LikeButton from '$lib/components/features/ui-elements/LikeButton.svelte';
	import SocialShare from '$lib/components/features/ui-elements/SocialShare.svelte';

	export let author: any = {};
	export let labels: any = {};
	export let postId: string | null = null;
	export let articleLikes: number | undefined = undefined;
	export let collectionPath: string = 'pages';
	export let showSocialActions: boolean = true;

	let unsubscribe = () => {};

	// Compute image public ID and URL with proper transformations
	$: rawImagePublicId =
		author?.profilePicturePublicId || author?.authorImagePublicId || author?.avatarPublicId || '';
	$: imagePublicId = typeof rawImagePublicId === 'string' ? rawImagePublicId.trim() : '';

	// Generate image URL with proper transformations for author photo
	$: imageUrl =
		imagePublicId && imagePublicId.length > 0
			? getCloudinaryUrl(imagePublicId, {
					width: 400,
					height: 400,
					crop: 'fill',
					gravity: 'face',
					quality: 'auto:good',
					fetch_format: 'auto'
				})
			: '';

	$: hasImage = !!(imageUrl && imageUrl.length > 0);

	// Track image load state
	let imageError = false;

	// Reset error state when imagePublicId changes
	$: if (imagePublicId) {
		imageError = false;
	}

	// Debug: Log author data
	$: if (browser && author) {
		console.log('[AuthorInfo] Author data received:', {
			name: author.name,
			title: author.title,
			bio: author.bio,
			description: author.description,
			profilePicturePublicId: author.profilePicturePublicId,
			authorImagePublicId: author.authorImagePublicId,
			avatarPublicId: author.avatarPublicId,
			rawImagePublicId: rawImagePublicId,
			imagePublicId: imagePublicId,
			imageUrl: imageUrl,
			hasImage: hasImage,
			allFields: Object.keys(author)
		});

		if (!hasImage) {
			console.warn('[AuthorInfo] No image publicId found. Available fields:', Object.keys(author));
			console.warn('[AuthorInfo] Checking for image fields:', {
				profilePicturePublicId: author.profilePicturePublicId,
				authorImagePublicId: author.authorImagePublicId,
				avatarPublicId: author.avatarPublicId,
				hasAny: !!(
					author.profilePicturePublicId ||
					author.authorImagePublicId ||
					author.avatarPublicId
				)
			});
		}
	}

	onMount(() => {
		if (!browser || !postId?.trim()) return;
		(async () => {
			const db = await getFirestore();
			if (!db) return;
			const { doc, onSnapshot } = await import('firebase/firestore');
			const ref = doc(db, 'pages', postId);
			unsubscribe = onSnapshot(ref, () => {
				// keep subscription for future live counters; no-op for now
			});
		})();
	});

	onDestroy(() => unsubscribe());
</script>

{#if author && (author.name || author.authorName)}
	<section class="themed-content-block author-info-section">
		<div class="author-info-unified-box">
			<!-- Eyebrow Label -->
			<div class="author-section-label">
				{labels?.authorSectionTitle || 'About the Historian'}
			</div>

			<!-- Column 1: Avatar -->
			<div class="author-photo-container">
				{#if hasImage && !imageError}
					<img
						class="author-photo"
						src={imageUrl}
						alt={author.ariaLabelForImage ||
							`Photo of ${author.name || author.authorName || 'author'}`}
						width="200"
						height="200"
						loading="lazy"
						decoding="async"
						on:error={(e) => {
							console.error('[AuthorInfo] Image failed to load.', imageUrl);
							imageError = true;
						}}
						on:load={() => {
							imageError = false;
						}}
					/>
				{:else}
					<!-- Fallback -->
					<div
						class="author-photo-placeholder"
						role="img"
						aria-label={`Photo placeholder for ${author.name || author.authorName || 'author'}`}
					>
						<span class="author-initials">
							{((author.name || author.authorName || '').match(/\b\w/g) || [])
								.join('')
								.substring(0, 2)
								.toUpperCase() || 'A'}
						</span>
					</div>
				{/if}
			</div>

			<!-- Column 2: Content (Text + Actions) -->
			<div class="author-content-wrapper">
				<div class="author-text">
					{#if author?.name || author?.authorName}
						<h3 class="author-name-display">{author.name || author.authorName}</h3>
					{/if}
					{#if author?.title || author?.authorTitle}
						<p class="author-title-display">{author.title || author.authorTitle}</p>
					{/if}
					{#if author?.description || author?.bio || author?.authorBio}
						<p class="author-description-display">
							{author.description || author.bio || author.authorBio}
						</p>
					{/if}
				</div>

				<!-- Social Actions Section (Vertical, under text) -->
				{#if showSocialActions}
					<div class="author-social-actions-container">
						<div class="author-share-block">
							<SocialShare title="Share this article" />
						</div>

						{#if articleLikes !== undefined}
							<div class="author-likes-block">
								<LikeButton likes={articleLikes || 0} postId={postId || ''} {collectionPath} />
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</section>
{/if}

<style>
	/* Component-specific styles - these work with global styles in pages.css */
	@import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&family=Inter:wght@300;400;500;600&display=block');

	/* Unified box container - Modern Sleek Design */
	.author-info-unified-box {
		display: grid;
		grid-template-columns: auto 1fr; /* Avatar | Content */
		align-items: center; /* Vertically center avatar */
		gap: 2rem; /* Reduced from 3rem */
		padding: 2rem 2.5rem; /* Slimmer padding */
		max-width: 800px; /* Match other sections */
		margin: 0 auto; /* Center the box */
		border-radius: 32px; /* More modern, less rounded */
		border: 1px solid rgba(0, 0, 0, 0.06);
		background: #d1d4da; /* Light gray background to match other sections */
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Softer, more modern shadow */
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: visible; /* Allow avatar to pop */
	}

	.author-info-unified-box:hover {
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
	}

	/* Decorative top accent line */
	/* Decorative top accent line REMOVED */
	.author-info-unified-box::before {
		display: none;
	}

	/* H4 Header removed from flow or restyled as kicker? 
	   Let's keep it subtle or hide it if it's redundant. 
	   We'll position it absolute top-left or visually integrated.
	   Actually, let's make it a small eyebrow label above the name.
	*/
	.author-section-label {
		position: absolute;
		top: 1.25rem;
		left: 2.5rem;
		font-family: 'Inter', sans-serif;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1.5px;
		color: #64748b; /* Darker for better contrast */
		pointer-events: none;
	}

	/* Container for the avatar to allow border tricks */
	.author-photo-container {
		position: relative;
		width: 120px !important; /* Smaller, more modern */
		height: 120px !important;
		min-width: 120px !important;
		flex-shrink: 0;
	}

	/* Ensure image displays correctly */
	.author-photo {
		display: block !important;
		width: 100%;
		height: 100%;
		object-fit: cover;
		background-color: #f8fafc;
		border-radius: 50%;
		border: 4px solid #e8eaee; /* Lighter border */
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
		transition: all 0.3s ease;
	}

	.author-photo:hover {
		transform: scale(1.05);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.16);
	}

	/* Placeholder */
	.author-photo-placeholder {
		display: flex !important;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
		color: #ffffff;
		font-family: 'Inter', sans-serif;
		font-weight: 700;
		font-size: 2.5rem; /* Smaller for reduced size */
		border-radius: 50%;
		border: 4px solid #e8eaee;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
		transition: all 0.3s ease;
	}

	.author-photo-placeholder:hover {
		transform: scale(1.05);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.16);
	}

	.author-content-wrapper {
		display: flex;
		flex-direction: column;
		gap: 1.25rem; /* Tighter spacing */
		padding-top: 1rem; /* Less padding */
		justify-content: center;
	}

	.author-text {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.5rem;
	}

	.author-name-display {
		font-family: 'Inter', sans-serif; /* Modern sans-serif */
		font-size: 1.5rem; /* Smaller, more modern */
		font-weight: 800;
		color: #1e293b;
		margin: 0;
		line-height: 1.3;
		letter-spacing: -0.02em;
	}

	.author-title-display {
		font-family: 'Inter', sans-serif;
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 1px;
		color: #3498db; /* Blue accent instead of gold */
		margin: 0;
	}

	.author-description-display {
		font-family: 'Inter', sans-serif;
		font-size: 0.95rem;
		line-height: 1.6;
		color: #475569;
		max-width: 600px;
		margin: 0;
	}

	/* Social Actions Container (Horizontal Row for modern look) */
	.author-social-actions-container {
		display: flex;
		flex-direction: row;
		gap: 2rem;
		align-items: center;
		justify-content: flex-start;
		border-top: 1px solid rgba(0, 0, 0, 0.06);
		padding-top: 1rem;
		margin-top: 0.5rem;
		width: 100%;
	}

	.author-likes-block,
	.author-share-block {
		display: flex;
		flex-direction: row;
		align-items: center;
		text-align: left;
		gap: 0.75rem;
	}

	.author-share-block h4 {
		display: block; /* Show Share label */
		font-family: 'Inter', sans-serif;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: #64748b;
		margin: 0;
	}

	.author-likes-block h4 {
		display: none; /* Keep Like label hidden for cleaner look */
	}

	@media (max-width: 900px) {
		.author-info-unified-box {
			display: flex;
			flex-direction: column;
			gap: 1.5rem;
			padding: 2rem;
			text-align: center;
		}

		.author-section-label {
			position: static;
			margin-bottom: 0.75rem;
		}

		.author-photo-container {
			margin: 0 auto;
			width: 180px !important; /* Proportionally bigger on tablet */
			height: 180px !important;
		}

		.author-content-wrapper {
			align-items: center;
			padding-top: 0;
			gap: 1rem;
		}

		.author-social-actions-container {
			justify-content: center;
			flex-wrap: wrap;
		}

		.author-name-display {
			font-size: 1.35rem;
		}

		.author-description-display {
			font-size: 0.9rem;
		}
	}

	@media (max-width: 500px) {
		.author-info-unified-box {
			padding: 1.5rem;
		}

		.author-photo-container {
			width: 140px !important; /* Proportionally bigger on mobile */
			height: 140px !important;
		}

		.author-name-display {
			font-size: 1.2rem;
		}

		.author-title-display {
			font-size: 0.8rem;
		}

		.author-description-display {
			font-size: 0.85rem;
		}

		.author-photo-placeholder {
			font-size: 3.5rem; /* Bigger initials for mobile */
		}
	}
</style>
