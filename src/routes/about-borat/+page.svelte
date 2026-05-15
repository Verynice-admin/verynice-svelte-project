<!-- src/routes/about-borat/+page.svelte -->
<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { getCloudinaryUrl } from '$lib/utils/cloudinary';
	import { processContent } from '$lib/utils/markdown';
	import AuthorInfo from '$components/features/content/AuthorInfo.svelte';
	import VideoEmbed from '$components/features/content/VideoEmbed.svelte';
	import RelatedPosts from '$components/features/content/RelatedPosts.svelte';
	import AsideToc from '$components/layout/navigation/AsideToc.svelte';
	import Comments from '$components/features/content/Comments.svelte';
	import Map from '$components/features/content/Map.svelte';
	import KeyFacts from '$components/features/content/KeyFacts.svelte';
	import FaqSection from '$components/features/content/FaqSection.svelte';
	import SearchModal from '$lib/components/features/search/SearchModal.svelte';

	let isSearchOpen = false;

	function openSearch() {
		isSearchOpen = true;
	}

	function closeSearch() {
		isSearchOpen = false;
	}

	onMount(async () => {
		if (browser) {
			const { default: mermaid } = await import('mermaid');
			mermaid.initialize({
				startOnLoad: false,
				theme: 'neutral',
				securityLevel: 'loose',
				fontFamily: 'Inter, sans-serif',
				fontSize: 56,
				themeVariables: {
					primaryColor: '#fff',
					primaryTextColor: '#000',
					primaryBorderColor: '#d4a373',
					lineColor: '#d4a373',
					secondaryColor: '#f7f9fc',
					tertiaryColor: '#fff',
					mainBkg: '#fff',
					nodeBorder: '#d4a373',
					clusterBkg: '#fff',
					clusterBorder: '#d4a373',
					defaultLinkColor: '#d4a373',
					titleColor: '#000',
					edgeLabelBackground: '#fff',
					actorBorder: '#d4a373',
					actorBkg: '#fff',
					actorTextColor: '#000',
					signalColor: '#000',
					signalTextColor: '#000',
					labelBoxBkgColor: '#fff',
					labelBoxBorderColor: '#d4a373',
					labelTextColor: '#000',
					loopTextColor: '#000',
					noteBorderColor: '#d4a373',
					noteBkgColor: '#fff',
					noteTextColor: '#000',
					activationBorderColor: '#d4a373',
					activationBkgColor: '#f7f9fc',
					sequenceNumberColor: '#000'
				}
			});
			await mermaid.run({
				querySelector: '.language-mermaid'
			});
		}
	});

	export let data;
	const { page, articles, author } = data;

	const defaultPage = {
		seo: {
			title: 'About Borat | VeryNice',
			description: 'The truth about Borat and Kazakhstan.'
		},
		mainTitle: 'About Borat',
		headerDescription: 'Fact vs Fiction',
		location: 'Kazakhstan / Hollywood',
		articleViews: 0,
		articleComments: 0,
		articleLikes: 0,
		breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'About Borat' }],
		keyFacts: []
	};

	let pageData = { ...defaultPage, ...(page ?? {}) };

	// Normalize keyFacts
	const fallbackFacts = [];

	$: normalizedKeyFacts = (() => {
		let dbFacts = [];
		if (Array.isArray(pageData?.keyFacts) && pageData.keyFacts.length > 0) {
			dbFacts = pageData.keyFacts.map((fact) => ({
				label: fact.label || '',
				value: fact.value || ''
			}));
		}
		if (dbFacts.length === 0) return fallbackFacts;
		return dbFacts;
	})();

	let windowWidth = 1200;

	const fallbackBreadcrumbs = [{ label: 'Home', href: '/' }, { label: 'About Borat' }];

	$: breadcrumbs = (() => {
		if (Array.isArray(pageData?.breadcrumbs) && pageData.breadcrumbs.length > 0) {
			return pageData.breadcrumbs.map((c) => ({
				label: c.label ?? c.title ?? '',
				href: c.href ?? c.url ?? null
			}));
		}
		return fallbackBreadcrumbs;
	})();

	// Create virtual section for Key Facts
	$: keyFactsSection = {
		id: 'key-facts',
		articleId: 'key-facts',
		title: pageData.keyFactsTitle || 'Key Facts',
		year: 'Info',
		type: 'key-facts',
		contentHTML: ''
	};

	$: allArticles = [...(data.articles || []), keyFactsSection];

	// Generate structured data for SEO
	$: structuredData = (() => {
		const base = {
			'@context': 'https://schema.org',
			'@type': 'Article',
			headline: pageData.mainTitle,
			description: pageData.headerDescription,
			publisher: {
				'@type': 'Organization',
				name: 'VeryNice.kz',
				logo: {
					'@type': 'ImageObject',
					url: getCloudinaryUrl('logo', { width: 200, height: 200 })
				}
			},
			datePublished: pageData.publishedDate || new Date().toISOString(),
			dateModified: pageData.updatedDate || new Date().toISOString(),
			mainEntityOfPage: {
				'@type': 'WebPage',
				'@id': browser ? window.location.href : 'https://verynice.kz/about-borat'
			}
		};

		if (data.author) {
			const authorData = {
				'@type': 'Person',
				name: data.author.name || data.author.authorName
			};
			if (data.author.profilePicturePublicId) {
				authorData.image = getCloudinaryUrl(data.author.profilePicturePublicId, {
					width: 200,
					height: 200,
					crop: 'fill'
				});
			}
			base.author = authorData;
		}

		if (pageData.headerBackgroundPublicId) {
			base.image = getCloudinaryUrl(pageData.headerBackgroundPublicId, {
				width: 1200,
				height: 630,
				crop: 'fill'
			});
		}

		return base;
	})();

	// Generate breadcrumb structured data
	$: breadcrumbStructuredData = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: breadcrumbs.map((crumb, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: crumb.label,
			...(crumb.href && {
				item: browser
					? new URL(crumb.href, window.location.origin).href
					: `https://verynice.kz${crumb.href}`
			})
		}))
	};

	let heroSection;
</script>

<svelte:window bind:innerWidth={windowWidth} />
<svelte:body class="premium-theme-page" />

<svelte:head>
	<title>{pageData?.seo?.title || 'About Borat | VeryNice'}</title>
	<meta
		name="description"
		content={pageData?.seo?.description || 'The truth about Borat and Kazakhstan.'}
	/>
	<link rel="canonical" href="https://verynice.kz/about-borat" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="article" />
	<meta property="og:title" content={pageData?.seo?.title || pageData.mainTitle} />
	<meta
		property="og:description"
		content={pageData?.seo?.description || pageData.headerDescription}
	/>
	<meta property="og:url" content="https://verynice.kz/about-borat" />
	{#if pageData.headerBackgroundPublicId}
		<meta
			property="og:image"
			content={getCloudinaryUrl(pageData.headerBackgroundPublicId, {
				width: 1200,
				height: 630,
				crop: 'fill'
			})}
		/>
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
	{/if}
	<meta property="og:site_name" content="VeryNice.kz" />
	{#if data.author}
		<meta property="article:author" content={data.author.name || data.author.authorName} />
	{/if}

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageData?.seo?.title || pageData.mainTitle} />
	<meta
		name="twitter:description"
		content={pageData?.seo?.description || pageData.headerDescription}
	/>
	{#if pageData.headerBackgroundPublicId}
		<meta
			name="twitter:image"
			content={getCloudinaryUrl(pageData.headerBackgroundPublicId, {
				width: 1200,
				height: 630,
				crop: 'fill'
			})}
		/>
	{/if}

	<!-- Additional SEO -->
	<meta
		name="robots"
		content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
	/>
	<meta name="author" content={data.author?.name || data.author?.authorName || 'VeryNice.kz'} />
	{#if pageData.publishedDate}
		<meta name="article:published_time" content={pageData.publishedDate} />
	{/if}
	{#if pageData.updatedDate}
		<meta name="article:modified_time" content={pageData.updatedDate} />
	{/if}

	<!-- Performance: DNS prefetch and preconnect -->
	<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
	<link rel="dns-prefetch" href="https://fonts.gstatic.com" />
	<link rel="dns-prefetch" href="https://res.cloudinary.com" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link rel="preconnect" href="https://res.cloudinary.com" />

	<!-- Fonts -->
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=block"
		rel="stylesheet"
	/>

	<!-- Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbStructuredData)}</script>`}
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
					<span class="hero-kicker">{pageData.heroKicker || 'Fact vs Fiction'}</span>
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
					</div>
					<button class="hero-search-btn" on:click={openSearch}>
						<span class="search-icon">🔍</span>
						<span>Search or ask anything...</span>
					</button>
				</div>
			</div>
		</div>
		{#if pageData.headerBackgroundPublicId}
			<div
				class="header-background"
				role="img"
				aria-label={pageData.headerBackgroundImageAriaLabel || 'Background image'}
				style={`--hero-bg-url: url("${getCloudinaryUrl(pageData.headerBackgroundPublicId, { width: 2200, height: 1600, crop: 'fill', gravity: 'auto', quality: 'auto:good', fetch_format: 'auto' })}")`}
			><div class="background-image"></div></div>
		{/if}
	</section>

	<!-- DARK TIMELINE SECTION -->
	<div class="timeline-container-premium">
		<div class="timeline-spine"></div>
		<div class="timeline max-w-content">
			{#each allArticles as article, index (article.id || article.articleId || index)}
				{@const articleId = article.articleId || article.id}
				<div id={articleId} class="timeline-card-wrapper {index % 2 === 0 ? 'left' : 'right'}">
					<!-- Timeline Node -->
					<div class="timeline-node">
						<div class="node-inner"></div>
					</div>

					<!-- Card -->
					<div class="timeline-card-glass">
						<div class="card-header">
							<span class="card-year">{article.year || 'Info'}</span>
							<h2 class="card-title">{article.title}</h2>
						</div>

						<div class="card-body prose-dark">
							{#if article.type === 'key-facts'}
								<KeyFacts
									title={pageData.keyFactsTitle || 'Key Facts'}
									facts={normalizedKeyFacts}
									embedded={true}
								/>
							{:else}
								{@html processContent(
									article.contentMarkdown || article.contentHTML,
									article.contentFormat || 'auto',
									article.contentHTML
								)}
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Footer Content -->
		<div class="timeline-footer wrapper">
			<div class="dark-component-wrapper">
				<RelatedPosts
					title={pageData.relatedPostsTitle || 'Related Posts'}
					posts={pageData.relatedPosts || []}
					collectionPath="destinations"
				/>
			</div>
			{#if pageData.videos && pageData.videos.length > 0}
				<div class="videos-grid">
					{#each pageData.videos as video}
						<VideoEmbed title={video.title || 'Video'} url={video.url} />
					{/each}
				</div>
			{:else if pageData.video?.url}
				<div class="video-single">
					<VideoEmbed title={pageData.video.title || 'Video'} url={pageData.video.url} />
				</div>
			{/if}
			{#if pageData.map?.coordinates}
				<div class="map-wrapper-premium">
					<Map
						title={pageData.map.title || 'Location on Map'}
						coordinates={pageData.map.coordinates}
					/>
				</div>
			{/if}
			{#if pageData.faq?.items?.length}
				<div class="faq-wrapper-premium">
					<FaqSection
						title={pageData.faq.title || 'Frequently Asked Questions'}
						items={pageData.faq.items}
					/>
				</div>
			{/if}
			{#if data.author && (data.author.name || data.author.authorName)}
				<div class="author-wrapper-premium">
					<AuthorInfo
						author={data.author}
						labels={pageData.labels}
						postId="boratPage"
						articleLikes={pageData.articleLikes}
						collectionPath="pages"
					/>
				</div>
			{/if}
			<div class="comments-wrapper-premium">
				<Comments postId="boratPage" />
			</div>
		</div>
	</div>

	<!-- Floating TOC (overlay) -->
	{#if browser}
		<AsideToc articles={allArticles} heroElement={heroSection} />
	{/if}

	{#if windowWidth <= 1023}
		<nav class="mobile-bottom-nav-local" aria-label="Mobile navigation">
			<a href="/" aria-label="Home"><i class="fa fa-home" aria-hidden="true"></i></a>
		</nav>
	{/if}
{:else if data.error}
	<div class="error-message" role="alert">
		<h1>Oops! Something went wrong.</h1>
		<p>{data.error}</p>
	</div>
{/if}

<SearchModal isOpen={isSearchOpen} on:close={closeSearch} />

<style>
	/* Override global dark theme for this page */
	:global(body.premium-theme-page) {
		background: #ffffff !important;
		color: #0f172a !important;
	}

	:global(body.premium-theme-page) main,
	:global(body.premium-theme-page) .section,
	:global(body.premium-theme-page) .timeline-container {
		background: #ffffff !important;
		color: #0f172a !important;
	}

	.wrapper {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.max-w-content {
		max-width: 1000px;
		margin: 0 auto;
	}

	/* Hero Search Button */
	.hero-search-btn {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 50px;
		padding: 0.875rem 1.5rem;
		color: rgba(255, 255, 255, 0.7);
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.3s ease;
		margin-top: 2rem;
		max-width: 400px;
	}

	.hero-search-btn:hover {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.3);
		color: #fff;
		transform: translateY(-2px);
	}

	.hero-search-btn .search-icon {
		font-size: 1.25rem;
	}

	/* TIMELINE CONTAINER */
	.timeline-container-premium {
		position: relative;
		background: #ffffff;
		padding-bottom: 5rem;
		overflow: hidden;
	}

	.timeline-spine {
		display: none; /* Hidden as requested */
		position: absolute;
		top: 0;
		bottom: 0;
		left: 50%;
		width: 2px;
		background: linear-gradient(
			180deg,
			rgba(251, 191, 36, 0.1) 0%,
			rgba(251, 191, 36, 0.8) 20%,
			rgba(251, 191, 36, 0.8) 80%,
			rgba(251, 191, 36, 0.1) 100%
		);
		transform: translateX(-50%);
		z-index: 1;
	}

	.timeline {
		position: relative;
		z-index: 2;
		padding: 4rem 0;
		display: flex;
		flex-direction: column;
		gap: 4rem;
	}

	.timeline-card-wrapper {
		display: flex;
		justify-content: center;
		position: relative;
		width: 100%;
	}

	/* Timeline Node */
	.timeline-node {
		position: absolute;
		left: 50%;
		top: 2rem;
		transform: translateX(-50%);
		width: 24px;
		height: 24px;
		background: #ffffff;
		border: 2px solid #374151;
		border-radius: 50%;
		z-index: 5;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: none;
	}

	.node-inner {
		width: 8px;
		height: 8px;
		background: #374151;
		border-radius: 50%;
	}

	/* Cards positioning - No Yellow Lines */
	.timeline-card-wrapper.left .timeline-card-glass {
		margin-right: 50%;
		transform: translateX(-3rem);
		text-align: right;
		border-right: 1.5px solid #374151;
		border-left: 1px solid #e2e8f0;
	}

	.timeline-card-wrapper.right .timeline-card-glass {
		margin-left: 50%;
		transform: translateX(3rem);
		text-align: left;
		border-left: 1.5px solid #374151;
		border-right: 1px solid #e2e8f0;
	}

	/* Common Card Styles */
	.timeline-card-glass {
		width: 42%; /* Fit within half width */
		background: #ffffff !important; /* Forces White Box */
		border-top: 1px solid rgba(0, 0, 0, 0.05); /* Lighter border */
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
		border-radius: 24px;
		padding: 2.5rem;
		box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.3); /* Stronger shadow */
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
	}

	.timeline-card-glass:hover {
		transform: translateY(-5px) !important; /* Override layout transform slightly */
		box-shadow: 0 30px 60px -10px rgba(0, 0, 0, 0.4);
		background: #ffffff !important;
	}

	/* Reset transform for hover to work on top of base transform */
	.timeline-card-wrapper.left .timeline-card-glass:hover {
		transform: translateX(-3rem) translateY(-5px);
	}
	.timeline-card-wrapper.right .timeline-card-glass:hover {
		transform: translateX(3rem) translateY(-5px);
	}

	.card-header {
		margin-bottom: 1.5rem;
	}

	.card-year {
		display: inline-block;
		font-family: 'Outfit', sans-serif;
		font-weight: 800;
		font-size: 1rem;
		color: var(--vnk-accent-color);
		background: rgba(34, 211, 238, 0.1);
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		margin-bottom: 1rem;
	}

	.card-title {
		font-family: 'Outfit', sans-serif;
		font-size: 2rem;
		font-weight: 700;
		color: #0f172a !important; /* Dark Title for White Box */
		margin: 0;
		line-height: 1.2;
	}

	.card-body {
		color: #334155 !important; /* Slate 700 for readable body text */
		font-size: 1.1rem;
		line-height: 1.7;
	}

	/* Dark Prose Overrides -> Inverted for White Box */
	:global(.prose-dark p) {
		color: #334155 !important;
	}
	:global(.prose-dark strong) {
		color: #0f172a !important;
	}
	:global(.prose-dark h3) {
		color: #0f172a !important;
	}
	:global(.prose-dark a) {
		color: var(--vnk-accent-color) !important;
	}

	/* Global header styling moved to premium-theme.css */

	/* FAQ, Author, Comments styling moved to global premium-theme.css */
	/* This ensures all pages have consistent styling */

	.dark-component-wrapper,
	.videos-grid,
	.video-single,
	.map-wrapper-premium,
	.faq-wrapper-premium,
	.author-wrapper-premium,
	.comments-wrapper-premium {
		margin-bottom: 4rem;
	}

	.videos-grid,
	.video-single,
	.map-wrapper-premium {
		width: 100%; /* Fill the wrapper */
		margin-bottom: 6rem;
	}

	/* Mobile Local Nav */
	.mobile-bottom-nav-local {
		position: fixed;
		bottom: 20px;
		right: 20px;
		z-index: 1000;
		background: rgba(251, 191, 36, 0.9); /* Gold */
		border-radius: 50%;
		width: 50px;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
		color: #000;
	}

	.mobile-bottom-nav-local a {
		color: #000;
		font-size: 1.2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	/* RESPONSIVE */
	@media (max-width: 900px) {
		.timeline-spine {
			left: 2rem;
		}

		.timeline-node {
			left: 2rem;
		}

		.timeline-card-wrapper {
			justify-content: flex-start;
			padding-left: 4rem; /* Space for spine */
			margin-bottom: 2rem;
		}

		.timeline-card-wrapper.left .timeline-card-glass,
		.timeline-card-wrapper.right .timeline-card-glass {
			width: 100%;
			margin: 0;
			transform: none;
			text-align: left;
			border-left: 4px solid #374151;
			border-right: 1px solid #e2e8f0;
		}

		/* Remove hover transforms on mobile for simplicity */
		.timeline-card-wrapper.left .timeline-card-glass:hover,
		.timeline-card-wrapper.right .timeline-card-glass:hover {
			transform: none;
		}

		.hero-text-box h1 {
			font-size: 3rem;
		}
	}
</style>
