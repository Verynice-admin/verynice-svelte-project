<!-- src/lib/components/features/content/PhotoGallery.svelte -->

<script>
	import { getCloudinaryUrl } from '$lib/utils/cloudinary';

	/** @type {string} */
	export let title = 'Photo Gallery';

	/** @type {Array<any>} */
	export let photos = [];

	let activeIndex = 0;

	const toImageUrl = (value, opts = {}) => {
		const source = typeof value === 'string' ? value.trim() : '';
		if (!source) return '';
		if (source.startsWith('http://') || source.startsWith('https://')) return source;
		return getCloudinaryUrl(source, opts);
	};

	const normalizePhoto = (photo, index) => {
		if (typeof photo === 'string') {
			const imageUrl = toImageUrl(photo, {
				width: 1600,
				height: 900,
				crop: 'fill',
				quality: 'auto:best',
				fetch_format: 'auto'
			});
			const thumbnailUrl = toImageUrl(photo, {
				width: 320,
				height: 180,
				crop: 'fill',
				quality: 'auto',
				fetch_format: 'auto'
			});
			return imageUrl
				? {
						imageUrl,
						thumbnailUrl,
						altText: `Photo ${index + 1}`,
						caption: ''
					}
				: null;
		}

		if (!photo || typeof photo !== 'object') return null;

		const primarySource =
			photo.imageUrl ||
			photo.url ||
			photo.publicId ||
			photo.public_id ||
			photo.imagePublicId ||
			photo.image?.publicId ||
			photo.image?.public_id ||
			'';
		const thumbnailSource =
			photo.thumbnailUrl ||
			photo.thumbnailPublicId ||
			photo.thumbnail?.publicId ||
			photo.thumbnail?.public_id ||
			primarySource;

		const imageUrl = toImageUrl(primarySource, {
			width: 1600,
			height: 900,
			crop: 'fill',
			quality: 'auto:best',
			fetch_format: 'auto'
		});
		const thumbnailUrl = toImageUrl(thumbnailSource, {
			width: 320,
			height: 180,
			crop: 'fill',
			quality: 'auto',
			fetch_format: 'auto'
		});

		if (!imageUrl) return null;

		return {
			imageUrl,
			thumbnailUrl: thumbnailUrl || imageUrl,
			altText: photo.altText || photo.alt || `Photo ${index + 1}`,
			caption: photo.caption || photo.captionName || ''
		};
	};

	$: normalizedPhotos = (Array.isArray(photos) ? photos : [])
		.map((photo, index) => normalizePhoto(photo, index))
		.filter(Boolean);
	$: totalPhotos = normalizedPhotos.length;
	$: activeIndex = totalPhotos ? Math.max(0, Math.min(activeIndex, totalPhotos - 1)) : 0;

	const showSlide = (index) => {
		if (!totalPhotos) return;
		activeIndex = (index + totalPhotos) % totalPhotos;
	};

	const showPrev = () => showSlide(activeIndex - 1);
	const showNext = () => showSlide(activeIndex + 1);
</script>

<section class="themed-content-block photo-gallery-block">
	<div class="additional-content-header">
		<h2>{title}</h2>
		{#if totalPhotos > 0}
			<div class="gallery-controls" aria-live="polite">
				<button
					class="nav-button"
					on:click={showPrev}
					aria-label="Show previous photo"
					disabled={totalPhotos < 2}
				>
					&#8249;
				</button>
				<button
					class="nav-button"
					on:click={showNext}
					aria-label="Show next photo"
					disabled={totalPhotos < 2}
				>
					&#8250;
				</button>
			</div>
		{/if}
	</div>

	{#if totalPhotos > 0}
		<div class="gallery-slider" role="group" aria-label="Photo gallery carousel">
			<div class="slides" style={`transform: translateX(-${activeIndex * 100}%);`}>
				{#each normalizedPhotos as photo, index (index)}
					<figure class="slide" aria-hidden={index === activeIndex ? 'false' : 'true'}>
						<img src={photo.imageUrl} alt={photo.altText || `Photo ${index + 1}`} loading="lazy" />
						{#if photo.caption}
							<figcaption>{photo.caption}</figcaption>
						{/if}
					</figure>
				{/each}
			</div>
		</div>

		{#if totalPhotos > 1}
			<div class="gallery-thumbnails" role="tablist" aria-label="Select gallery image">
				{#each normalizedPhotos as photo, index (index)}
					<button
						type="button"
						role="tab"
						class:selected={index === activeIndex}
						on:click={() => showSlide(index)}
						aria-selected={index === activeIndex}
						aria-label={`Show photo ${index + 1}`}
					>
						<img
							src={photo.thumbnailUrl || photo.imageUrl}
							alt={photo.altText || `Thumbnail ${index + 1}`}
							loading="lazy"
						/>
					</button>
				{/each}
			</div>
		{/if}
	{/if}
</section>

<style>
	.photo-gallery-block {
		display: flex;
		flex-direction: column;
		gap: var(--vnk-spacing-md);
		background: transparent !important;
	}

  .photo-gallery-block h2 {
    font-family: 'Outfit', sans-serif;
    font-size: clamp(2rem, 3vw, 3rem);
    font-weight: 800;
    color: #000 !important;
    margin: 0;
    text-align: center;
    letter-spacing: -0.03em;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  }

	.gallery-controls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--vnk-spacing-sm);
		margin-top: var(--vnk-spacing-xs);
		font-weight: 600;
	}

	.nav-button {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 999px;
		border: 1px solid var(--vnk-card-border-color);
		background: #fff;
		font-size: 1.5rem;
		line-height: 1;
		cursor: pointer;
		transition:
			background 0.2s ease,
			color 0.2s ease;
	}

	.nav-button:hover:not(:disabled) {
		background: var(--vnk-text-accent-color);
		color: #fff;
	}

	.nav-button:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.gallery-slider {
		overflow: hidden;
		border-radius: 1.2rem;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
		background: transparent;
	}

	.slides {
		display: flex;
		transition: transform 0.5s ease;
	}

	.slide {
		min-width: 100%;
		margin: 0;
		position: relative;
	}

	.slide img {
		width: 100%;
		height: auto;
		display: block;
		object-fit: cover;
		aspect-ratio: 16 / 9;
	}

	.slide figcaption {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 0.75rem 1rem;
		background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%);
		color: #fff;
		font-size: 0.95rem;
	}

	.gallery-thumbnails {
		display: flex;
		flex-wrap: nowrap;
		gap: var(--vnk-spacing-xs);
		overflow-x: auto;
		overflow-y: hidden;
		padding-bottom: 6px;
		scroll-snap-type: x mandatory;
		-webkit-overflow-scrolling: touch;
	}

	.gallery-thumbnails button {
		flex: 0 0 auto;
		scroll-snap-align: start;
		border: 2px solid transparent;
		border-radius: 0.75rem;
		padding: 0;
		overflow: hidden;
		cursor: pointer;
		background: transparent;
		transition:
			border-color 0.2s ease,
			transform 0.2s ease;
	}

	.gallery-thumbnails button img {
		display: block;
		width: 88px;
		height: 64px;
		object-fit: cover;
	}

	.gallery-thumbnails button.selected {
		border-color: var(--vnk-text-accent-color);
		transform: translateY(-2px);
	}

	@media (max-width: 600px) {
		.gallery-controls {
			flex-wrap: wrap;
			gap: var(--vnk-spacing-xs);
		}

		.gallery-thumbnails button img {
			height: 48px;
		}
	}
</style>
