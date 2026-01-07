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
			{#if displayPosts.length > 3}
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
		font-size: clamp(1.4rem, 2vw, 2rem);
		text-align: left;
		margin: 0;
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
		scroll-snap-type: x mandatory;
		/* Hide scrollbar */
		scrollbar-width: none;
		-ms-overflow-style: none;
		padding: 1rem 0 3rem 0; /* Vertical padding for shadows and hover effects */
		margin: 0 -1rem; /* Negative margin to allow full-bleed scroll on mobile if needed, but keeping content aligned */
		padding-left: 1rem;
		padding-right: 1rem;
	}

	.carousel-container::-webkit-scrollbar {
		display: none;
	}

	.related-posts-list {
		list-style: none !important; /* Force remove bullets */
		padding: 0;
		margin: 0;
		display: flex;
		gap: 2rem; /* Spacing between items */
	}

	.carousel-item {
		list-style: none !important; /* Force remove bullets from items too */
		scroll-snap-align: start;
		/* 3 items visible: (100% - 2 * gap) / 3 */
		/* gap is 2rem. So (100% - 4rem) / 3 = 33.33% - 1.33rem */
		flex: 0 0 calc((100% - 4rem) / 3);
		min-width: 220px; /* Lower min-width to allow shrinking on tablet/small laptop */
	}

	/* Mobile: 1 item per row (carousel style) */
	@media (max-width: 700px) {
		.carousel-item {
			flex: 0 0 85%; /* Shows part of the next slide to encourage scrolling */
		}
	}

	/* Tablet: 2 items per row if space is tight */
	@media (min-width: 701px) and (max-width: 900px) {
		.carousel-item {
			flex: 0 0 calc(50% - 1rem); /* 2 items, 1 gap of 2rem */
		}
	}

	.related-posts-empty {
		margin-top: var(--vnk-spacing-md);
		color: var(--vnk-text-secondary-color);
	}
</style>
