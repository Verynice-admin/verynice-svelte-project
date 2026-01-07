<script lang="ts">
	import '../styles/index.css';
	import RelatedPosts from '$components/features/content/RelatedPosts.svelte';
	import VideoEmbed from '$components/features/content/VideoEmbed.svelte';
	import { getCloudinaryUrl } from '$lib/utils/cloudinary';

	/** @type {import('./$types').PageData} */
	export let data;
	const { homepage, sliders } = data;

	const heroImageUrl = homepage?.heroImagePublicId
		? getCloudinaryUrl(homepage.heroImagePublicId, { width: 1920, crop: 'fill', gravity: 'center' })
		: '';

	$: combinedFood = [
		...(sliders?.cuisine || []),
		...(sliders?.restaurants || []),
		...(sliders?.cafes || [])
	];

	if (typeof window !== 'undefined') {
		window.addEventListener('scroll', () => {
			if (window.scrollY > 200) {
				document.body.classList.add('scrolled');
			} else {
				document.body.classList.remove('scrolled');
			}
		});
	}
</script>

<svelte:head>
	<title>{homepage?.title}</title>
	<meta name="description" content={homepage?.metaDescription} />
</svelte:head>

<div class="section" id="page-hero-section">
	<div class="section-header wrapper">
		<div class="section-header-text">
			<h1>{homepage?.heroTitle}</h1>
			<p class="section-description">{homepage?.heroSubtitle}</p>
			<form role="search" method="get" class="search-form" action="/search">
				<input class="text" type="text" name="q" placeholder="Search for places, attractions..." />
				<input class="submit" type="submit" value="Find" />
			</form>
		</div>
	</div>
	{#if heroImageUrl}
		<div class="header-background">
			<div class="background-image" style="background-image: url({heroImageUrl})"></div>
		</div>
	{/if}
</div>

<article class="wrapper article" data-variant="polaroid-3cards">
	<div class="main-column-content">
		{#if homepage?.featuredVideoUrl}
			<div class="video-embed-container">
				<VideoEmbed title="Featured Video" url={homepage.featuredVideoUrl} />
			</div>
		{/if}

		<RelatedPosts
			title="Cities"
			posts={sliders?.cities || []}
			collectionPath="cities"
			titleUrl="/cities"
			listClass="related-posts-list"
			cardClass="related-post-card"
		/>

		<RelatedPosts
			title="National Parks"
			posts={sliders?.nationalParks || []}
			collectionPath="national-parks"
			titleUrl="/national-parks"
		/>
		<RelatedPosts
			title="Waterside Retreats"
			posts={sliders?.lakes || []}
			collectionPath="lakes"
			titleUrl="/lakes"
		/>
		<RelatedPosts
			title="Mountain Adventures"
			posts={sliders?.mountains || []}
			collectionPath="mountains"
			titleUrl="/mountains"
		/>

		<!-- WRAPPER ADDED -->
		<div class="polaroid-3cards-wrapper">
			<RelatedPosts
				title="Food & Drink"
				posts={combinedFood}
				collectionPath="food-drink"
				titleUrl="/food-drink"
				listClass="related-posts-list polaroid-gallery"
				cardClass="related-post-card polaroid-card"
			/>
		</div>
	</div>
</article>

<style>
	/* Mobile-specific enhancements for homepage */
	@media (max-width: 600px) {
		#page-hero-section {
			min-height: 85vh !important;
			height: 85vh !important;
			max-height: 85vh !important;
			padding: 0;
			margin: 0;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.header-background {
			display: block;
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
		}

		/* Premium Gradient Overlay */
		.header-background::after {
			content: '';
			position: absolute;
			inset: 0;
			background: linear-gradient(180deg, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.85) 100%);
			z-index: 1;
		}

		.background-image {
			width: 100% !important;
			height: 100% !important;
			object-fit: cover;
			background-size: cover !important;
			background-position: center center !important;
		}

		.section-header.wrapper {
			position: relative;
			z-index: 10;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			text-align: center;
			width: 100%;
			height: 100%;
			padding: 2rem !important;
			margin-top: 0 !important;
		}

		.section-header-text {
			align-items: center !important;
			width: 100%;
			/* Ensure no container background */
			background: transparent !important;
			backdrop-filter: none !important;
			-webkit-backdrop-filter: none !important;
			box-shadow: none !important;
		}

		/* Remove any pseudo elements that might create a background shape */
		.section-header-text::before,
		.section-header-text::after,
		.search-form::before,
		.search-form::after {
			display: none !important;
			content: none !important;
		}

		/* Modern Typography */
		.section-header-text h1 {
			font-size: 3.5rem !important;
			line-height: 1.05;
			margin-bottom: 0.75rem;
			text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
			text-align: center !important;
			font-weight: 900;
			letter-spacing: -0.02em;
		}

		.section-description {
			font-size: 1.15rem !important;
			opacity: 0.95;
			margin-bottom: 2.5rem;
			text-align: center !important;
			max-width: 300px;
			margin-left: auto;
			margin-right: auto;
			font-weight: 500;
		}

		.main-column-content {
			padding: 2rem 1.25rem;
			background: #f8fafc; /* Light background for contrast */
			border-radius: 32px 32px 0 0; /* Modern card-like sheet */
			margin-top: -2rem; /* Overlap hero slightly */
			position: relative;
			z-index: 20;
		}

		/* Video Section Polish */
		.video-embed-container {
			border-radius: 24px;
			overflow: hidden;
			box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.25);
			margin-bottom: 3.5rem;
		}

		/* Enhanced related posts cards on mobile */
		:global(.related-posts-list) {
			display: grid;
			grid-template-columns: 1fr;
			gap: 1.5rem;
			margin-top: 1.5rem;
		}

		:global(.related-post-card) {
			border-radius: 20px;
			overflow: hidden;
			background: white;
			box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
			border: 1px solid rgba(0, 0, 0, 0.03);
		}

		/* Section Titles */
		:global(.content-title) {
			font-size: 2rem !important;
			letter-spacing: -0.02em;
			margin-bottom: 1.5rem !important;
			color: #0f172a;
		}

		/* Polaroid gallery mobile adjustments */
		:global(.polaroid-gallery) {
			display: grid;
			grid-template-columns: 1fr;
			gap: 2rem;
			margin-top: 3rem;
		}

		:global(.polaroid-card) {
			border-radius: 20px;
			overflow: hidden;
			box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
			transform: rotate(-1deg);
		}

		:global(.polaroid-card:nth-child(even)) {
			transform: rotate(2deg);
		}
	}
</style>
