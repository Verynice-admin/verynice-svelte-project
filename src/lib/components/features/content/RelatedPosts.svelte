<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { getFirestore } from '$lib/firebaseApp';
	import RelatedPostCard from './RelatedPostCard.svelte';

	export let title = '';
	export let posts: any[] = [];
	export let collectionPath: string = '';
	export let postId: string | null = null;
	export let titleUrl = '';

	let fetched: any[] = [];

	$: displayPosts = (fetched?.length ? fetched : posts) ?? [];

	// Carousel logic
	let scrollContainer: HTMLElement;

	function scroll(direction: 'left' | 'right') {
		if (!scrollContainer) return;
		const cardWidth = 320; // Approx card width + gap to scroll one by one or page
		// Or better: scroll by container width / 3
		const scrollAmount = scrollContainer.clientWidth;

		const targetScroll =
			direction === 'left'
				? scrollContainer.scrollLeft - scrollAmount
				: scrollContainer.scrollLeft + scrollAmount;

		scrollContainer.scrollTo({
			left: targetScroll,
			behavior: 'smooth'
		});
	}

	onMount(() => {
		if (!browser) return;
		if (!collectionPath?.trim() || !postId?.trim()) {
			fetched = posts ?? [];
			return;
		}

		(async () => {
			const db = await getFirestore();
			if (!db) return;
			// Dynamic import
			const { doc, getDoc, collection, query, where, limit, getDocs } = await import(
				'firebase/firestore'
			);

			try {
				const ref = doc(db, collectionPath, postId);
				const snap = await getDoc(ref);
				if (snap.exists()) {
					const data: any = snap.data();
					if (data?.category) {
						// Fetch more than 3 to demonstrate carousel, e.g. 10
						const q = query(
							collection(db, collectionPath),
							where('category', '==', data.category),
							limit(10)
						);
						const res = await getDocs(q);
						fetched = res.docs
							.filter((d) => d.id !== postId)
							.map((d) => ({ id: d.id, ...d.data() }));
					}
				}
			} catch (e) {
				console.warn('Error fetching related posts:', e);
			}

			if (!fetched.length) fetched = posts ?? [];
		})();
	});
</script>

<section class="related-posts" id="related-posts">
	{#if title}
		<header class="related-posts-header">
			<h2>
				{#if titleUrl}
					<a href={titleUrl}>{title}</a>
				{:else}
					{title}
				{/if}
			</h2>

			<!-- Navigation Arrows -->
			{#if displayPosts.length > 4}
				<div class="nav-arrows">
					<button on:click={() => scroll('left')} aria-label="Scroll left" class="nav-btn">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg
						>
					</button>
					<button on:click={() => scroll('right')} aria-label="Scroll right" class="nav-btn">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"><path d="M9 18l6-6-6-6" /></svg
						>
					</button>
				</div>
			{/if}
		</header>
	{/if}

	{#if displayPosts?.length}
		<div class="carousel-container" bind:this={scrollContainer}>
			<ul class="related-posts-list">
				{#each displayPosts as post, index (post?.id || index)}
					<li class="carousel-item" style="--rotation: {index % 2 === 0 ? '-1.5deg' : '1.5deg'};">
						<RelatedPostCard {post} {collectionPath} />
					</li>
				{/each}
			</ul>
		</div>
	{:else}
		<p class="related-posts-empty">No related articles yet.</p>
	{/if}
</section>

<style>
	.related-posts {
		margin-top: var(--vnk-spacing-xl);
		position: relative;
	}

	.related-posts-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--vnk-spacing-lg);
	}

	.related-posts-header h2 {
		font-family: 'Outfit', sans-serif;
		font-size: clamp(2rem, 3vw, 3rem);
		font-weight: 800;
		text-align: left;
		margin: 0;
		color: #1c1c1e !important;
		letter-spacing: -0.03em;
		text-shadow: none;
	}

	.related-posts-header h2 a {
		text-decoration: none;
		color: inherit;
		transition: color 0.3s ease;
	}

	.related-posts-header h2 a:hover {
		color: var(--vnk-accent-color, #22d3ee);
	}

	.nav-arrows {
		display: flex;
		gap: 0.5rem;
	}

	.nav-btn {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		color: #64748b;
	}

	.nav-btn:hover {
		background: #f8fafc;
		border-color: #cbd5e1;
		color: #0f172a;
		transform: scale(1.05);
	}

	.carousel-container {
		overflow-x: auto;
		overflow-y: visible;
		scroll-snap-type: x mandatory;
		/* Hide scrollbar */
		scrollbar-width: none;
		-ms-overflow-style: none;
		padding: 1rem 0 2rem 0;
		padding-left: env(safe-area-inset-left, 1rem);
		padding-right: env(safe-area-inset-right, 1rem);
	}

	.carousel-container::-webkit-scrollbar {
		display: none;
	}

	.related-posts-list {
		list-style: none !important;
		padding: 0;
		margin: 0;
		display: flex;
		/* Reduced gap */
		gap: 1rem;
	}

	.carousel-item {
		list-style: none !important;
		scroll-snap-align: start;
		/* Mobile: 1 item visible (full screen width) */
		flex: 0 0 calc(100% - 0rem);
		width: auto;
		min-width: 0;
	}

	/* Mobile: 140px cards with horizontal scroll */
	@media (max-width: 767px) {
		.carousel-container {
			padding-left: 20px !important;
			padding-right: 20px !important;
			margin: 0 0 0 -20px !important;
			width: calc(100% + 40px) !important;
		}

		.related-posts-list {
			gap: 0 !important;
		}

		.carousel-item {
			flex: 0 0 140px !important;
			width: 140px !important;
			min-width: 140px !important;
			max-width: 140px !important;
			scroll-snap-align: start !important;
		}

		.carousel-item :global(.attractions-item-card) {
			border-radius: 12px !important;
			overflow: hidden !important;
		}

		.carousel-item :global(.card-image-wrapper) {
			aspect-ratio: 4 / 3 !important;
			height: auto !important;
			min-height: 0 !important;
			margin: 0 !important;
		}

		.carousel-item :global(.card-image) {
			border-radius: 0 !important;
		}

		.attractions-item-content {
			padding: 8px 10px !important;
		}

		.attractions-item-content .item-title {
			font-size: 13px !important;
			line-height: 1.3 !important;
			display: -webkit-box !important;
			-webkit-line-clamp: 3 !important;
			-webkit-box-orient: vertical !important;
			overflow: hidden !important;
		}

		.category {
			font-size: 10px !important;
			margin-bottom: 2px !important;
		}
	}

	/* Tablet: 3 items */
	@media (min-width: 768px) and (max-width: 1199px) {
		.related-posts-list {
			gap: 1.25rem;
		}
		.carousel-item {
			flex: 0 0 calc((100% - 2.5rem) / 3);
			max-width: calc((100% - 2.5rem) / 3);
		}
	}

	/* Desktop: Exactly 4 items visible with proper card sizing */
	@media (min-width: 1200px) {
		.related-posts-list {
			display: flex;
			gap: 1.5rem;
		}
		.carousel-item {
			/* Fixed card width guarantees 4 full cards in the homepage wrapper */
			flex: 0 0 270px;
			min-width: 270px;
			max-width: 270px;
		}
	}

	/* Large Desktop: Ensure cards don't stretch too wide */
	@media (min-width: 1600px) {
		.related-posts-list {
			gap: 1.75rem;
		}
		.carousel-item {
			flex: 0 0 280px;
			min-width: 280px;
			max-width: 280px;
		}
	}

	.related-posts-empty {
		margin-top: var(--vnk-spacing-md);
		color: var(--vnk-text-secondary-color);
	}
</style>
