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
		headerBackgroundPublicId: 'content/pages/destinations/Almaty_nearby/kolsai-lakes/kolsai-lakes-01',
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
			'best time to visit': 'content/pages/destinations/Almaty_nearby/kolsai-lakes/kolsai-lakes-01',
			'visa & entry': 'content/pages/destinations/Almaty_nearby/charyn-canyon/charyn-canyon-01',
			'safety & precautions': 'content/pages/destinations/Almaty_nearby/besshatyr-scythian-mounds/besshatyr-scythian-mounds-01',
			'getting around': 'content/pages/destinations/Astana_Nearby/baiterek-tower/baiterek-tower-01',
			'airport taxis': 'content/pages/destinations/Astana_Nearby/baiterek-tower/baiterek-tower-01',
			'money & costs': 'content/pages/destinations/Almaty_nearby/central-state-museum/central-state-museum-01'
		};
		const titleKey = item?.title?.toLowerCase() || '';
		const publicId = item?.image?.publicId || item?.imagePublicId || item?.publicId || byTitle[titleKey] || 'content/pages/destinations/Almaty_nearby/kolsai-lakes/kolsai-lakes-01';

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
	<title>{pageData?.seo?.title || 'Kazakhstan Travel Tips | VeryNice'}</title>
	<meta name="description" content={pageData?.seo?.description || 'Essential travel tips for visiting Kazakhstan: visa requirements, best time to visit, safety, getting around, money, and more.'} />
	<link rel="canonical" href="https://verynice.kz/tips" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://verynice.kz/tips" />
	<meta property="og:title" content={pageData?.seo?.title || 'Kazakhstan Travel Tips | VeryNice'} />
	<meta property="og:description" content={pageData?.seo?.description || 'Essential travel tips for visiting Kazakhstan: visa requirements, best time to visit, safety, getting around, money, and more.'} />
	<meta property="og:image" content="https://verynice.kz/assets/og-cover.jpg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageData?.seo?.title || 'Kazakhstan Travel Tips | VeryNice'} />
	<meta name="twitter:description" content={pageData?.seo?.description || 'Essential travel tips for visiting Kazakhstan: visa requirements, best time to visit, safety, getting around, money, and more.'} />
</svelte:head>

{#if pageData}
	<section id="page-hero-section" class="section" bind:this={heroSection} style="min-height: 100vh !important; height: 100vh !important;">
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
						{#if pageData.articleViews > 0}
							<div class="post-info-inner" aria-label="{pageData.articleViews} views">
								<span class="icon-view" aria-hidden="true"></span>
								<div class="post-info-content">{pageData.articleViews.toLocaleString()}</div>
							</div>
						{/if}
						{#if pageData.articleLikes > 0}
							<div class="post-info-inner" aria-label="{pageData.articleLikes} likes">
								<span class="icon-like" aria-hidden="true"></span>
								<div class="post-info-content">{pageData.articleLikes.toLocaleString()}</div>
							</div>
						{/if}
						{#if pageData.articleComments > 0}
							<div class="post-info-inner" aria-label="{pageData.articleComments} comments">
								<span class="icon-comment" aria-hidden="true"></span>
								<div class="post-info-content">{pageData.articleComments.toLocaleString()}</div>
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
				aria-label="Travel Tips for Kazakhstan background"
				style={`--hero-bg-url: url("${getCloudinaryUrl(pageData.headerBackgroundPublicId, { width: 2200, height: 1600, crop: 'fill', gravity: 'auto', quality: 'auto:good', fetch_format: 'auto' })}")`}
			><div class="background-image"></div></div>
		{/if}
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
	.timeline-container {
		position: relative;
		z-index: 2;
		margin-top: -2rem;
		padding-top: 2rem;
	}

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
