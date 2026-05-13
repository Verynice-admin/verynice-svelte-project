<script lang="ts">
	import { getCloudinaryUrl } from '$lib/utils/cloudinary';

	export let post: any;
	export let collectionPath: string = 'posts';

	$: imageSrc = (() => {
		const resolve = (p: any) => p?.publicId || p?.url || (typeof p === 'string' ? p : null);
		const publicId =
			post.headerBackgroundPublicId ||
			post.heroImagePublicId ||
			post.imagePublicId ||
			post.coverImagePublicId ||
			resolve(post.mainImage) ||
			resolve(post.image);
		if (publicId) return getCloudinaryUrl(publicId, { width: 600, height: 380, crop: 'fill', gravity: 'auto' });
		return post.imageUrl || post.thumbnailUrl || getCloudinaryUrl('general/placeholder', { width: 600, height: 380, crop: 'fill' });
	})();

	$: href = (() => {
		if (post.url) return post.url;
		if (post.slug) return `/${collectionPath}/${post.slug}`;
		if (post.id) return `/${collectionPath}/${post.id}`;
		return '#';
	})();

	$: description = post.shortDescription || post.description || post.headerDescription || '';
</script>

<a {href} class="card">
	<div class="card-image-wrapper">
		<div class="card-image" style={`background-image: url('${imageSrc}')`} role="img" aria-label={post.mainTitle || post.title}></div>
		{#if post.tier}
			<div class="tier-badge tier-{post.tier}">
				<span class="tier-label">TIER</span>
				<span class="tier-num">{post.tier}</span>
			</div>
		{/if}
	</div>
	<div class="card-body">
		{#if post.category}
			<span class="category">{post.category}</span>
		{/if}
		<h3 class="card-title">{post.mainTitle || post.title || post.name || 'Discover'}</h3>
		{#if description}
			<p class="card-desc">{description}</p>
		{/if}
		<span class="explore-btn">
			<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
			</svg>
			Explore
		</span>
	</div>
</a>

<style>
	.card {
		display: flex;
		flex-direction: column;
		background: #fff;
		border: 1.5px solid #9ca3af;
		border-radius: 14px;
		overflow: hidden;
		text-decoration: none;
		color: inherit;
		width: 100%;
		height: 100%;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		box-shadow: 0 3px 14px rgba(0,0,0,0.18);
	}

	.card:hover {
		transform: translateY(-3px);
		box-shadow: 0 8px 24px rgba(0,0,0,0.15);
	}

	.card-image-wrapper {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		flex-shrink: 0;
	}

	.card-image {
		position: absolute;
		inset: 0;
		background-size: cover;
		background-position: center;
		transition: transform 0.35s ease;
	}

	.card:hover .card-image {
		transform: scale(1.04);
	}

	.tier-badge {
		position: absolute;
		top: 0.6rem;
		right: 0.6rem;
		display: flex;
		align-items: center;
		gap: 3px;
		padding: 3px 8px;
		border-radius: 20px;
		color: #fff;
		font-weight: 700;
		z-index: 2;
	}

	.tier-badge.tier-1 { background: linear-gradient(135deg, #2563eb, #3b82f6); }
	.tier-badge.tier-2 { background: linear-gradient(135deg, #059669, #10b981); }
	.tier-badge.tier-3 { background: linear-gradient(135deg, #f59e0b, #fbbf24); }

	.tier-label {
		font-size: 0.5rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.tier-num {
		font-size: 0.85rem;
		line-height: 1;
	}

	.card-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 1rem 1rem 1.1rem;
		gap: 0.5rem;
		flex: 1;
	}

	.category {
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #64748b;
		font-weight: 600;
	}

	.card-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 700;
		line-height: 1.3;
		color: #111;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-desc {
		margin: 0;
		font-size: 0.8rem;
		line-height: 1.45;
		color: #555;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		max-width: 100%;
	}

	.explore-btn {
		margin-top: auto;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 7px 16px;
		background: #f4f4f5;
		border: 1.5px solid #d1d5db;
		border-radius: 999px;
		font-size: 0.78rem;
		font-weight: 600;
		color: #111;
		transition: background 0.2s, border-color 0.2s;
	}

	.card:hover .explore-btn {
		background: #e5e7eb;
		border-color: #9ca3af;
	}

	/* Mobile: bigger fonts for readability */
	@media (max-width: 767px) {
		.card-title { font-size: 1.15rem; }
		.card-desc { font-size: 0.88rem; -webkit-line-clamp: 3; }
		.explore-btn { font-size: 0.88rem; padding: 9px 20px; }
		.category { font-size: 0.7rem; }
		.card-body { padding: 1.1rem 1.25rem 1.25rem; gap: 0.6rem; }
	}
</style>
