<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { getCloudinaryUrl } from '$lib/utils/cloudinary';
	import { processContent } from '$lib/utils/markdown';

	export let data;

	onMount(() => {
		if (browser) {
			window.scrollTo(0, 0);
		}
	});

	const defaultPage = {
		seo: {
			title: 'Travel Tips for Kazakhstan | VeryNice',
			description: 'Essential travel tips for visiting Kazakhstan: visa requirements, best time to visit, safety, getting around, and more.'
		},
		mainTitle: 'Travel Tips for Kazakhstan',
		headerDescription: 'Essential guides for your Kazakhstan adventure: visa info, best seasons, safety tips, transportation, and practical advice.',
		heroKicker: 'Plan Your Trip',
		location: 'Kazakhstan',
		articleViews: 0,
		articleLikes: 0,
		articleComments: 0,
		breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Travel Tips' }],
		headerBackgroundPublicId: 'site/backgrounds/attractions-hero',
		introMarkdown: 'Welcome to Kazakhstan! Here are essential travel tips to help you plan your perfect trip.'
	};

	$: pageData = { ...defaultPage, ...(data?.page ?? {}) };
	$: highlights = data?.highlights ?? [];

	$: breadcrumbs = Array.isArray(pageData?.breadcrumbs) && pageData.breadcrumbs.length > 0
		? pageData.breadcrumbs.map((c: any) => ({
				label: c.label ?? c.title ?? '',
				href: c.href ?? c.url ?? null
			}))
		: [{ label: 'Home', href: '/' }, { label: 'Travel Tips' }];

	const cardImageUrl = (item: any) => {
		const byTitle: Record<string, string> = {
			'best time to visit': 'site/backgrounds/almaty-mountains',
			'visa & entry': 'site/backgrounds/passport',
			'safety & precautions': 'site/backgrounds/safety',
			'getting around': 'site/backgrounds/transport',
			'airport taxis': 'site/backgrounds/taxi',
			'money & costs': 'site/backgrounds/money'
		};
		const titleKey = item?.title?.toLowerCase() || '';
		const publicId = item?.image?.publicId || item?.imagePublicId || item?.publicId || byTitle[titleKey] || 'site/backgrounds/attractions-hero';

		return getCloudinaryUrl(publicId, {
			width: 900,
			height: 540,
			crop: 'fill',
			gravity: 'auto',
			quality: 'auto:good',
			fetch_format: 'auto'
		});
	};

	// Map highlight titles to their slug paths for navigation
	const highlightSlugMap: Record<string, string> = {
		'best time to visit': 'best-time-to-visit',
		'best time to visit kazakhstan': 'best-time-to-visit',
		'visa & entry': 'visa-entry-requirements',
		'visa & entry requirements': 'visa-entry-requirements',
		'safety & precautions': 'safety-general-precautions',
		'safety & general precautions': 'safety-general-precautions',
		'getting around': 'getting-there-around',
		'getting there & around': 'getting-there-around',
		'how to order a taxi from kazakhstan airports': 'airport-taxi-guide',
		'airport taxis': 'airport-taxi-guide',
		'money & costs': 'money-costs-tips',
		'money, costs & practical tips': 'money-costs-tips'
	};

	const getTipLink = (item: any) => {
		const titleKey = item?.title?.toLowerCase() || '';
		return highlightSlugMap[titleKey] || item?.id || null;
	};

	let heroSection;
	let windowWidth = 1200;
</script>

<svelte:window bind:innerWidth={windowWidth} />

<svelte:head>
	<title>{pageData?.seo?.title || 'Travel Tips | VeryNice'}</title>
	<meta name="description" content={pageData?.seo?.description || 'Essential travel tips for Kazakhstan.'} />
</svelte:head>

{#if pageData}
	<section id="page-hero-section" class="hero-premium" bind:this={heroSection}>
		<div class="hero-bg-container">
			{#if pageData.headerBackgroundPublicId}
				<div
					class="hero-bg-image"
					role="img"
					aria-label={pageData.mainTitle || 'Travel tips background'}
					style={`background-image: url("${getCloudinaryUrl(pageData.headerBackgroundPublicId, {
						width: 2200,
						height: 1200,
						crop: 'fill',
						gravity: 'auto',
						quality: 100,
						fetch_format: 'auto'
					})}")`}
				></div>
			{/if}
			<div class="hero-overlay"></div>
		</div>

		<div class="hero-content wrapper">
			<nav aria-label="Breadcrumb" class="breadcrumb-premium">
				<ol class="breadcrumb-list">
					{#each breadcrumbs as crumb, index}
						<li class="breadcrumb-item">
							{#if crumb.href && index !== breadcrumbs.length - 1}
								<a class="breadcrumb-link" href={crumb.href}>{crumb.label}</a>
								<span class="breadcrumb-divider">/</span>
							{:else}
								<span class="breadcrumb-current" aria-current="page">{crumb.label}</span>
							{/if}
						</li>
					{/each}
				</ol>
			</nav>
			<div class="hero-text-box">
				{#if pageData.heroKicker}
					<span class="hero-kicker">{pageData.heroKicker}</span>
				{/if}
				<h1 itemprop="headline">{pageData.mainTitle}</h1>
				<p class="hero-lead" itemprop="description">
					{pageData.headerDescription}
				</p>
				<!-- Stats Bar (Integrated into Hero) -->
				<div class="post-info-premium" role="group" aria-label="Article statistics">
					{#if pageData.location}
						<div class="stat-pill" aria-label="Location: {pageData.location}">
							<span class="icon-location" aria-hidden="true"></span>
							<span>{pageData.location}</span>
						</div>
					{/if}
					{#if pageData.articleViews > 0}
						<div class="stat-pill" aria-label="{pageData.articleViews} views">
							<span class="icon-view" aria-hidden="true"></span>
							<span>{pageData.articleViews.toLocaleString()}</span>
						</div>
					{/if}
					{#if pageData.articleLikes > 0}
						<div class="stat-pill" aria-label="{pageData.articleLikes} likes">
							<span class="icon-like" aria-hidden="true"></span>
							<span>{pageData.articleLikes.toLocaleString()}</span>
						</div>
					{/if}
					{#if pageData.articleComments > 0}
						<div class="stat-pill" aria-label="{pageData.articleComments} comments">
							<span class="icon-comment" aria-hidden="true"></span>
							<span>{pageData.articleComments.toLocaleString()}</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<div class="attractions-page timeline-container">
		<div style="max-width: 1260px; margin: 0 auto; padding: 2rem min(2rem, 4vw); position: relative;">
			<section class="food-intro">
				<div class="prose">
					{@html processContent(pageData.introMarkdown || pageData.introHTML, 'auto')}
				</div>
			</section>

			{#if highlights && highlights.length}
			<section class="attractions-items-list" style="margin-top: 2rem;">
				{#each highlights as item (item.id || item.title)}
					{@const tipLink = getTipLink(item)}
					{#if tipLink}
						<a class="attractions-item-card" href="/tips/{tipLink}">
							<div class="card-image-wrapper">
								<div
									class="card-image"
									style={`background-image: url("${cardImageUrl(item)}")`}
									role="img"
									aria-label={item.title}
								></div>
								{#if item.tier && item.tier !== 1}
									<div class="tier-badge tier-{item.tier}">
										<span class="tier-number">{item.tier}</span>
									</div>
								{/if}
							</div>
							<div class="attractions-item-content">
								<h3 class="item-title">{item.title}</h3>
								<p class="item-description">{item.excerpt || item.description || ''}</p>
								<span class="read-more">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
									</svg>
									Explore
								</span>
							</div>
						</a>
					{:else}
						<div class="attractions-item-card" role="article">
							<div class="card-image-wrapper">
								<div
									class="card-image"
									style={`background-image: url("${cardImageUrl(item)}")`}
									role="img"
									aria-label={item.title}
								></div>
								{#if item.tier && item.tier !== 1}
									<div class="tier-badge tier-{item.tier}">
										<span class="tier-number">{item.tier}</span>
									</div>
								{/if}
							</div>
							<div class="attractions-item-content">
								<h3 class="item-title">{item.title}</h3>
								<p class="item-description">{item.excerpt || item.description || ''}</p>
								<span class="read-more">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
									</svg>
									Explore
								</span>
							</div>
						</div>
					{/if}
				{/each}
			</section>
			{/if}
		</div>
	</div>

	{#if windowWidth <= 1023}
		<nav class="mobile-bottom-nav-local" aria-label="Mobile navigation">
			<a href="/" aria-label="Home"><i class="fa fa-home" aria-hidden="true"></i></a>
		</nav>
	{/if}
{/if}

<style>
	/* HERO PREMIUM Styles (matching history page) */
	.hero-premium {
		position: relative;
		height: 80vh;
		min-height: 600px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding-top: 80px;
		overflow: hidden;
 		background: #000;
		margin-bottom: 0;
	}

	.hero-bg-container {
		position: absolute;
		inset: 0;
		z-index: 1;
	}

	.hero-bg-image {
		width: 100%;
		height: 100%;
		background-size: cover;
		background-position: center 20%;
		filter: none !important;
	}

	.hero-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.65) 100%);
	}

	.hero-content {
		position: relative;
		z-index: 10;
		width: 100%;
		padding-top: 10vh;
	}

	.wrapper {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.hero-text-box {
		max-width: 800px;
		margin: 0;
		text-align: left;
	}

	/* Breadcrumbs - Premium */
	.breadcrumb-premium {
		margin-bottom: 2rem;
		display: inline-block;
	}

	.breadcrumb-list {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		padding: 0;
		margin: 0;
		list-style: none;
		gap: 0.5rem;
		font-family: 'Inter', sans-serif;
		font-size: 0.9rem;
		color: #94a3b8;
	}

	.breadcrumb-link {
		color: #cbd5e1;
		text-decoration: none;
		transition: color 0.2s;
	}

	.breadcrumb-link:hover {
		color: var(--vnk-accent-color);
	}

	.breadcrumb-divider {
		color: #475569;
		margin-left: 0.5rem;
	}

	.breadcrumb-current {
		color: var(--vnk-accent-color);
		font-weight: 600;
	}

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

	.hero-text-box h1 {
		font-family: 'Outfit', sans-serif;
		font-size: clamp(3rem, 7vw, 6rem);
		font-weight: 900;
		line-height: 1;
		margin-bottom: 1.5rem;
		color: #fff;
		text-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
		letter-spacing: -0.04em;
	}

	.hero-lead {
		font-family: 'Inter', sans-serif;
		font-size: clamp(1.1rem, 1.5vw, 1.4rem);
		line-height: 1.6;
		color: #cbd5e1;
		margin-bottom: 3.5rem;
		max-width: 600px;
		margin-left: 0;
		margin-right: 0;
	}

	/* Post Info Pills */
	.post-info-premium {
		display: flex;
		justify-content: flex-start;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.stat-pill {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: transparent;
		border: none;
		padding: 0.5rem 1.25rem;
		border-radius: 50px;
		font-size: 0.9rem;
		color: #fff;
		font-weight: 500;
		backdrop-filter: none;
	}

	.stat-pill span[class^='icon-'] {
		color: var(--vnk-accent-color);
	}

	.food-intro {
		padding: 0;
		background: transparent;
		border: none;
		box-shadow: none;
		max-width: 800px;
		margin: 0 auto 2rem;
		text-align: center;
	}

	.food-intro :global(.prose),
	.food-intro :global(.prose p),
	.food-intro :global(.prose li) {
		color: rgba(255, 255, 255, 0.82);
		font-size: 1.15rem;
		line-height: 1.7;
	}

	.food-intro :global(.prose strong) {
		color: #fff;
		font-weight: 600;
	}

	.food-intro :global(.prose em) {
		color: var(--vnk-accent-color);
		font-style: italic;
	}

	.section-header {
		position: relative;
		z-index: 2;
		padding: 3rem 0;
	}

	.breadcrumb-modern {
		margin-bottom: 1.5rem;
	}

	.breadcrumb-modern__list {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.breadcrumb-modern__item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.breadcrumb-modern__link {
		color: rgba(255, 255, 255, 0.7);
		text-decoration: none;
		font-size: 0.9rem;
		transition: color 0.2s;
	}

	.breadcrumb-modern__link:hover {
		color: #fff;
	}

	.breadcrumb-modern__current {
		color: #fff;
		font-weight: 500;
		font-size: 0.9rem;
	}

	.breadcrumb-modern__divider {
		color: rgba(255, 255, 255, 0.4);
	}

	.section-header-content-row {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 2rem;
		flex-wrap: wrap;
	}

	.section-header-text {
		flex: 1;
		min-width: 280px;
	}

	.section-header h1 {
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 700;
		line-height: 1.1;
		margin: 0 0 1rem;
		color: #fff;
		font-family: var(--vnk-font-primary, 'Outfit', sans-serif);
	}

	.section-description {
		font-size: 1.15rem;
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.8);
		margin: 0;
		max-width: 600px;
	}

	.section-background {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1;
		overflow: hidden;
	}

	.background-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-size: cover;
		background-position: center;
		filter: brightness(0.5);
	}

	.section {
		position: relative;
		overflow: hidden;
	}

	.timeline-container {
		position: relative;
		z-index: 2;
		margin-top: -2rem;
		padding-top: 2rem;
	}

	/* Card styles now taken from destinations page via attractions-page class */

	/* Mobile card layout now taken from destinations page via attractions-page class */

	.mobile-bottom-nav-local {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #fff;
		border-top: 1px solid #eee;
		padding: 0.75rem;
		display: flex;
		justify-content: center;
		z-index: 100;
	}
</style>
