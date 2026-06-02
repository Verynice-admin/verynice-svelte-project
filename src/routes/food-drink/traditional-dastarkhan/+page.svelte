<script>
	import { browser } from '$app/environment';
	import { getCloudinaryUrl } from '$lib/utils/cloudinary';
	import { processContent } from '$lib/utils/markdown';
	import Comments from '$components/features/content/Comments.svelte';
	import AsideToc from '$components/layout/navigation/AsideToc.svelte';

	export let data;

	const { page, sections = [] } = data;

	const defaultPage = {
		seo: {
			title: 'Traditional Dastarkhan | VeryNice',
			description:
				'An advanced guide to the Kazakh dastarkhan: ritual etiquette, symbolic serving order, tea choreography, and ceremonial table culture.'
		},
		mainTitle: 'Traditional Kazakh Dastarkhan',
		headerDescription:
			'The full etiquette architecture of the dastarkhan, from honored seating and tabak tartu to tea rhythm, seasonal feasts, and modern urban revival.',
		heroKicker: 'Table of Hospitality',
		location: 'Kazakhstan',
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Food & Drinks', href: '/food-drink' },
			{ label: 'Traditional Dastarkhan' }
		],
		headerBackgroundPublicId: 'content/pages/foodDrinks/traditionalDastarkhan/hero'
	};

	const sectionCodes = {
		'ethos-of-hosting': 'Host',
		'seating-hierarchy': 'SEAT',
		'serving-order': 'SERV',
		'tea-ritual': 'TEA',
		'speech-and-etiquette': 'BATA',
		'ceremonial-contexts': 'RITE',
		'modern-practice': 'NOW'
	};

	let pageData = { ...defaultPage, ...(page ?? {}) };
	$: breadcrumbs = pageData.breadcrumbs || defaultPage.breadcrumbs;
	$: tocSections = (sections || []).map((item) => ({ id: item.id, title: item.title }));

	let windowWidth = 1200;

	function scrollToSection(event, sectionId) {
		event.preventDefault();
		if (!browser) return;
		const element = document.getElementById(sectionId);
		if (!element) return;
		element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		history.pushState(null, '', `#${sectionId}`);
	}
</script>

<svelte:window bind:innerWidth={windowWidth} />

<AsideToc articles={tocSections} />

<svelte:head>
	<title>{pageData?.seo?.title || 'Traditional Kazakh Dastarkhan | VeryNice'}</title>
	<meta name="description" content={pageData?.seo?.description || 'An advanced guide to the Kazakh dastarkhan: ritual etiquette, symbolic serving order, tea choreography, and ceremonial table culture.'} />
	<link rel="canonical" href="https://verynice.kz/food-drink/traditional-dastarkhan" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://verynice.kz/food-drink/traditional-dastarkhan" />
	<meta property="og:title" content={pageData?.seo?.title || 'Traditional Kazakh Dastarkhan | VeryNice'} />
	<meta property="og:description" content={pageData?.seo?.description || 'An advanced guide to the Kazakh dastarkhan: ritual etiquette, symbolic serving order, tea choreography, and ceremonial table culture.'} />
	<meta property="og:image" content="https://verynice.kz/assets/og-cover.jpg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageData?.seo?.title || 'Traditional Kazakh Dastarkhan | VeryNice'} />
	<meta name="twitter:description" content={pageData?.seo?.description || 'An advanced guide to the Kazakh dastarkhan: ritual etiquette, symbolic serving order, tea choreography, and ceremonial table culture.'} />
</svelte:head>

<div class="attractions-page">
<section id="page-hero-section" class="section">
	<div class="section-header wrapper">
		<nav aria-label="Breadcrumb" class="breadcrumb-modern">
			<ol class="breadcrumb-modern__list">
				{#each breadcrumbs as crumb, index}
					<li class="breadcrumb-modern__item">
						{#if crumb.href && index !== breadcrumbs.length - 1}
							<a class="breadcrumb-modern__link" href={crumb.href}>{crumb.label}</a>
						{:else}
							<span class="breadcrumb-modern__current" aria-current="page">{crumb.label}</span>
						{/if}
						{#if index < breadcrumbs.length - 1}
							<span class="breadcrumb-modern__divider" aria-hidden="true"></span>
						{/if}
					</li>
				{/each}
			</ol>
		</nav>
		<div class="section-header-content-row">
			<div class="section-header-text">
				{#if pageData.heroKicker}
					<span class="hero-kicker">{pageData.heroKicker}</span>
				{/if}
				<h1 itemprop="headline">{pageData.mainTitle}</h1>
				<p class="section-description" itemprop="description">{pageData.headerDescription}</p>
				<div class="post-info" role="group" aria-label="Article statistics">
					{#if pageData.location}
						<div class="post-info-inner" aria-label="Location: {pageData.location}">
							<span class="icon-location" aria-hidden="true"></span>
							<div class="post-info-content">{pageData.location}</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
	{#if pageData.headerBackgroundPublicId}
		<div
			class="header-background"
			role="img"
			aria-label="Traditional dastarkhan background"
			style={`--hero-bg-url: url("${getCloudinaryUrl(pageData.headerBackgroundPublicId, {
				width: 2200,
				height: 1600,
				crop: 'fill',
				gravity: 'north',
				quality: 'auto:good',
				fetch_format: 'auto'
			})}")`}
		>
			<div class="background-image"></div>
		</div>
	{/if}
</section>
</div>

<div class="timeline-container">
	<div style="max-width: 1400px; margin: 0 auto; padding: 2rem min(2rem, 4vw); position: relative;">
		<section class="dishes-intro">
			<p>
				The traditional <strong>dastarkhan</strong> is a choreography of honor. This page focuses on
				high-level table customs and ritual flow, while signature foods are discussed inside their
				ceremonial context rather than as repeated standalone dish cards.
			</p>
		</section>

			{#each sections as section (section.id)}
				<section class="category-section" id={section.id}>
					<header class="category-header">
						<span class="category-icon">{sectionCodes[section.id] || 'KD'}</span>
						<div class="category-header-text">
							<h2>{section.title}</h2>
							{#if section.description}
								<p>{section.description}</p>
							{/if}
						</div>
					</header>

					<div class="dishes-list">
						<article class="dish-article ritual-article">
							<div class="dish-article-image">
								{#if section.imagePublicId}
									<div
										class="dish-image"
										role="img"
										aria-label={section.title}
										style={`background-image: url("${getCloudinaryUrl(section.imagePublicId, {
											width: 1000,
											height: 760,
											crop: 'fill',
											gravity: 'auto',
											quality: 'auto:good',
											fetch_format: 'auto'
										})}")`}
									></div>
								{:else}
									<div class="image-placeholder" role="img" aria-label={section.title}>
										<span class="placeholder-text">{section.title}</span>
										<span class="placeholder-icon">{sectionCodes[section.id] || 'KD'}</span>
									</div>
								{/if}
							</div>
							<div class="dish-article-content">
								<div class="dish-header">
									<span class="dish-tier tier-1">Traditional Dastarkhan</span>
									<h3>{section.title}</h3>
								</div>
								<div class="dish-body ritual-prose">
									{@html processContent(section.contentMarkdown || section.contentHTML, 'auto')}
								</div>
							</div>
						</article>
					</div>
				</section>
			{/each}

		<section class="themed-content-block" style="margin-top: 3rem;">
			<Comments postId="traditionalDastarkhan" />
		</section>
	</div>
</div>

{#if windowWidth <= 1023}
	<nav class="mobile-bottom-nav-local" aria-label="Mobile navigation">
		<a href="/" aria-label="Home"><i class="fa fa-home" aria-hidden="true"></i></a>
	</nav>
{/if}

<style>
	.hero-kicker {
		display: block;
		font-family: 'Outfit', sans-serif;
		text-transform: uppercase;
		letter-spacing: 0.3em;
		color: var(--vnk-accent-color);
		font-weight: 700;
		font-size: 0.9rem;
		margin-bottom: 1.5rem;
	}

	/* Intro Section */
	.dishes-intro {
		max-width: 800px;
		margin: 0 auto 2rem;
		text-align: center;
		padding: 1.5rem 2rem;
		background: #fff;
		border-radius: 16px;
	}

	.dishes-intro p {
		font-family: 'Inter', sans-serif;
		font-size: 1.15rem;
		line-height: 1.8;
		color: #1a1a1a;
		margin: 0;
	}

	.dishes-intro strong {
		color: #000;
		font-weight: 600;
	}

	.dishes-intro em {
		color: var(--vnk-accent-color);
		font-style: italic;
	}

	/* Category Navigation */
	/* Category Section */
	.category-section {
		margin-bottom: 4rem;
		scroll-margin-top: 100px;
		background: #fff !important;
	}

	.category-header {
		display: flex;
		align-items: flex-start;
		gap: 1.25rem;
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 2px solid rgba(0, 0, 0, 0.1);
		background: #fff !important;
	}

	.category-icon {
		font-size: 2.5rem;
		line-height: 1;
	}

	.category-header-text h2 {
		font-family: 'Outfit', sans-serif;
		font-size: 1.8rem;
		font-weight: 700;
		color: #000;
		margin: 0 0 0.5rem;
	}

	.category-header-text p {
		font-family: 'Inter', sans-serif;
		font-size: 1rem;
		color: rgba(var(--vnk-text-secondary-color-rgb), 0.66);
		margin: 0;
		line-height: 1.5;
	}

	/* Dishes List */
	.dishes-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* Individual Dish Article */
	.dish-article {
		display: grid;
		grid-template-columns: 1fr 1fr; /* 50% Image, 50% Text */
		gap: 0;
		background: var(--vnk-card-bg);
		border-radius: 24px;
		overflow: hidden;
		box-shadow:
			0 4px 20px rgba(0, 0, 0, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.6);
	}

	/* Chess-like alternating layout: even items have image on right */
	.dish-article:nth-child(even) {
		grid-template-columns: 1fr 1fr;
	}

	.dish-article:nth-child(even) .dish-article-image {
		order: 2;
	}

	.dish-article:nth-child(even) .dish-article-content {
		order: 1;
	}

	/* Image Placeholder */
	.dish-article-image {
		position: relative;
		min-height: 300px;
		overflow: hidden;
		z-index: 1;
	}

	/* Diagonal clip — odd: image left, slant on right; even: image right, slant on left */
	.dish-article:nth-child(odd) .dish-article-image {
		clip-path: polygon(0 0, calc(100% - 80px) 0, 100% 100%, 0 100%);
	}

	.dish-article:nth-child(even) .dish-article-image {
		clip-path: polygon(80px 0, 100% 0, 100% 100%, 0 100%);
	}

	.dish-image {
		position: absolute;
		inset: 0;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		transition: transform 0.3s ease;
	}

	.dish-article:hover .dish-image {
		transform: scale(1.05);
	}

	.image-placeholder {
		position: absolute;
		inset: 0;
		background: linear-gradient(145deg, rgba(255, 255, 255, 0.88) 0%, rgba(242, 132, 137, 0.42) 100%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem;
	}

	.placeholder-text {
		font-family: 'Outfit', sans-serif;
		font-size: 0.85rem;
		font-weight: 600;
		color: rgba(var(--vnk-text-secondary-color-rgb), 0.72);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-align: center;
	}

	.placeholder-icon {
		font-size: 2rem;
		opacity: 0.6;
	}

	/* Article Content */
	.dish-article-content {
		padding: 1.5rem 2rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		justify-content: center; /* Vertically align text */
	}

	.dish-header {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.dish-tier {
		display: inline-block;
		width: fit-content;
		font-family: 'Inter', sans-serif;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		padding: 4px 10px;
		border-radius: 12px;
		color: #fff;
	}

	.dish-tier.tier-1 {
		background: linear-gradient(135deg, var(--vnk-primary-color), rgb(126, 197, 179));
	}

	.dish-article-content h3 {
		font-family: 'Outfit', sans-serif;
		font-size: 1.35rem;
		font-weight: 700;
		color: var(--vnk-text-secondary-color);
		margin: 0;
		line-height: 1.3;
	}

	.dish-body {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.ritual-prose :global(p) {
		font-family: 'Inter', sans-serif;
		font-size: 0.95rem;
		line-height: 1.6;
		color: rgba(var(--vnk-text-secondary-color-rgb), 0.88);
		margin: 0 0 0.8rem;
	}

	.ritual-prose :global(p:last-child) {
		margin-bottom: 0;
	}

	.ritual-prose :global(strong) {
		color: var(--vnk-text-secondary-color);
		font-weight: 600;
	}

	.ritual-prose :global(em) {
		color: var(--vnk-primary-color);
		font-style: italic;
	}

	.ritual-prose :global(ul),
	.ritual-prose :global(ol) {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.ritual-prose :global(li) {
		margin: 0;
		padding: 0;
	}

	@media (max-width: 900px) {
		.category-header {
			gap: 1rem;
		}

		.category-header-text h2 {
			font-size: 1.5rem;
		}

		.dish-article {
			grid-template-columns: 2fr 3fr;
		}

		/* Maintain chess pattern on tablets */
		.dish-article:nth-child(even) {
			grid-template-columns: 3fr 2fr;
		}

		.dish-article-image {
			min-height: 180px;
		}

		.dish-article-content {
			padding: 1.25rem 1.5rem;
		}

		.dish-article-content h3 {
			font-size: 1.15rem;
		}
	}

	@media (max-width: 600px) {
		.dishes-intro p {
			font-size: 1rem;
		}

		.category-icon {
			font-size: 2rem;
		}

		.category-header-text h2 {
			font-size: 1.3rem;
		}

		.dish-article {
			grid-template-columns: 1fr;
		}

		/* Reset chess pattern on mobile - all images on top */
		.dish-article:nth-child(even) {
			grid-template-columns: 1fr;
		}

		.dish-article:nth-child(even) .dish-article-image,
		.dish-article:nth-child(even) .dish-article-content {
			order: unset;
		}

		.dish-article-image {
			min-height: 160px;
		}

		.dish-article:nth-child(odd) .dish-article-image,
		.dish-article:nth-child(even) .dish-article-image {
			clip-path: none;
		}

		.dish-article-content {
			padding: 1.25rem;
		}

		.dish-article-content h3 {
			font-size: 1.1rem;
		}
	}
</style>
