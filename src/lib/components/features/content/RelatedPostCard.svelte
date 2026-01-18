<script lang="ts">
	import { getCloudinaryUrl } from '$lib/utils/cloudinary';

	export let post: any;
	export let collectionPath: string = 'posts';

	// Resolve the image source with fallback logic
	// Resolve the image source with fallback logic
	$: imageSrc = (() => {
		const resolve = (p: any) => p?.publicId || p?.url || (typeof p === 'string' ? p : null);

		const publicId =
			post.headerBackgroundPublicId ||
			post.heroImagePublicId ||
			post.imagePublicId ||
			post.coverImagePublicId ||
			resolve(post.mainImage) ||
			resolve(post.image);

		if (publicId) {
			return getCloudinaryUrl(publicId, { width: 400, height: 400, crop: 'fill', gravity: 'auto' });
		}
		return post.imageUrl || post.thumbnailUrl || '/images/placeholder.jpg';
	})();

	// Resolve link
	$: href = (() => {
		if (post.url) return post.url;
		if (post.slug) return `/${collectionPath}/${post.slug}`;
		if (post.id) return `/${collectionPath}/${post.id}`;
		return '#';
	})();
</script>

<a {href} class="polaroid-card">
	<div class="polaroid-inner">
		<div class="image-frame">
			{#if imageSrc}
				<img src={imageSrc} alt={post.mainTitle || post.title} loading="lazy" decoding="async" />
			{:else}
				<div class="placeholder"></div>
			{/if}
		</div>
		<div class="caption">
			{#if post.category}
				<span class="category">{post.category}</span>
			{/if}
			<h3>{post.mainTitle || post.title}</h3>
		</div>
	</div>
</a>

<style>
	.polaroid-card {
		display: block;
		text-decoration: none;
		color: inherit;
		transition:
			transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
			box-shadow 0.3s ease;
		/* Optional: subtle graphical shift */
		transform: rotate(var(--rotation, 0deg));
		height: 100%;
	}

	/* Hover effect: straighten and lift */
	.polaroid-card:hover {
		transform: translateY(-5px) rotate(0deg) scale(1.02);
		z-index: 10;
	}

	.polaroid-inner {
		background-color: #ffffff;
		/* Reduce padding to tighten the frame. Top/sides thinner, bottom thicker for "chin" effect */
		padding: 0.75rem 0.75rem 1.25rem 0.75rem;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
		border-radius: 2px;
		height: 100%;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
	}

	.polaroid-card:hover .polaroid-inner {
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}

	.image-frame {
		aspect-ratio: 1 / 1;
		width: 100%;
		background-color: #f1f5f9;
		margin-bottom: 0.75rem; /* Reduce gap between image and text */
		overflow: hidden;
		border: 1px solid rgba(0, 0, 0, 0.03);
	}

	/* ... img styles unchanged ... */
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 0.5s ease;
	}

	.polaroid-card:hover img {
		transform: scale(1.05);
	}

	.caption {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem; /* Tighter gap */
		text-align: left;
	}

	.category {
		font-size: 0.65rem; /* Smaller category */
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #64748b; /* More subtle color */
		font-weight: 600;
	}

	h3 {
		font-family: 'Inter', sans-serif;
		font-size: 0.95rem; /* Reduced from 1.1rem */
		font-weight: 600;
		line-height: 1.3;
		color: #1e293b;
		margin: 0;
		/* Limit lines to 2 to prevent excessive height */
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.placeholder {
		width: 100%;
		height: 100%;
		background: #e2e8f0;
	}
</style>
