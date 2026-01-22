<!-- src/routes/about-borat/+page.svelte -->
<script>
	import { onMount } from 'svelte';
	import mermaid from 'mermaid';
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

	onMount(async () => {
		if (browser) {
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
	<meta
		name="keywords"
		content={pageData?.seo?.keywords || 'Borat, Kazakhstan, movie, Sacha Baron Cohen'}
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="article" />
	<meta property="og:title" content={pageData?.seo?.title || pageData.mainTitle} />
	<meta
		property="og:description"
		content={pageData?.seo?.description || pageData.headerDescription}
	/>
	<meta
		property="og:url"
		content={browser ? window.location.href : 'https://verynice.kz/about-borat'}
	/>
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
	<!-- PREMIUM HERO SECTION (BORAT STYLE) -->
	<section id="page-hero-section" class="hero-premium" bind:this={heroSection}>
		<div class="hero-bg-container">
			{#if pageData.headerBackgroundPublicId}
				<div
					class="hero-bg-image"
					role="img"
					aria-label={pageData.headerBackgroundImageAriaLabel || 'Background image for page'}
					style={`background-image: url("${getCloudinaryUrl(pageData.headerBackgroundPublicId, {
						width: 2200,
						height: 1200,
						crop: 'fill',
						gravity: 'auto',
						quality: 'auto:good',
						fetch_format: 'auto'
					})}")`}
				></div>
			{/if}
			<div class="hero-overlay"></div>
		</div>

		<div class="hero-content wrapper">
			<div class="hero-text-box">
				<!-- Breadcrumbs (Keep them but subtle) -->
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

				<span class="hero-kicker">Fact vs Fiction</span>
				<h1>{pageData.mainTitle}</h1>
				<p class="hero-lead">
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
				</div>
			</div>
		</div>
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
			{#if pageData.relatedPosts && pageData.relatedPosts.length > 0}
				<!-- Wrap generic components in a dark container if they don't support dark mode natively -->
				<div class="dark-component-wrapper">
					<RelatedPosts
						title={pageData.relatedPostsTitle || 'Related Posts'}
						posts={pageData.relatedPosts}
					/>
				</div>
			{/if}
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

<style>
	/* PREMIUM DARK STYLING FOR BORAT PAGE */

	:global(body) {
		background: #0f172a !important;
		color: #f8fafc !important;
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

	/* HERO SECTION */
	.hero-premium {
		position: relative;
		height: 80vh; /* Slightly shorter than home */
		min-height: 600px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding-top: 80px; /* Header clearance */
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
		background-position: center 20%; /* Focus on top part of image usually */
		filter: none !important;
	}

	.hero-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to bottom, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.95) 100%);
	}

	.hero-content {
		position: relative;
		z-index: 10;
		width: 100%;
		padding-top: 10vh; /* Visual balance */
	}

	.hero-text-box {
		max-width: 900px;
		margin: 0 auto;
		text-align: center;
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
		letter-spacing: 0.4em;
		color: #fbbf24; /* Gold */
		font-weight: 700;
		font-size: 0.9rem;
		margin-bottom: 1rem;
		text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
	}

	.hero-text-box h1 {
		font-family: 'Outfit', sans-serif;
		font-size: clamp(3.5rem, 6vw, 5.5rem);
		font-weight: 900;
		line-height: 1.1;
		margin-bottom: 1.5rem;
		color: #fff;
		text-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
		letter-spacing: -0.02em;
	}

	.hero-lead {
		font-family: 'Inter', sans-serif;
		font-size: clamp(1.2rem, 2vw, 1.5rem);
		line-height: 1.6;
		color: #cbd5e1;
		margin-bottom: 3rem;
		max-width: 700px;
		margin-left: auto;
		margin-right: auto;
	}

	/* Post Info Pills */
	.post-info-premium {
		display: flex;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.stat-pill {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.1);
		padding: 0.5rem 1.25rem;
		border-radius: 50px;
		font-size: 0.9rem;
		color: #fff;
		font-weight: 500;
		backdrop-filter: blur(10px);
	}

	.stat-pill span[class^='icon-'] {
		color: var(--vnk-accent-color);
	}

	/* TIMELINE CONTAINER */
	.timeline-container-premium {
		position: relative;
		background: #0f172a; /* Match body */
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
		background: #0f172a;
		border: 2px solid #fbbf24;
		border-radius: 50%;
		z-index: 5;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 0 15px rgba(251, 191, 36, 0.5);
	}

	.node-inner {
		width: 8px;
		height: 8px;
		background: #fbbf24;
		border-radius: 50%;
	}

	/* Cards positioning - No Yellow Lines */
	.timeline-card-wrapper.left .timeline-card-glass {
		margin-right: 50%;
		transform: translateX(-3rem); /* Gap from spine */
		text-align: right;
		border-right: 1px solid rgba(255, 255, 255, 0.1);
		border-left: 1px solid rgba(255, 255, 255, 0.05);
	}

	.timeline-card-wrapper.right .timeline-card-glass {
		margin-left: 50%;
		transform: translateX(3rem); /* Gap from spine */
		text-align: left;
		border-left: 1px solid rgba(255, 255, 255, 0.1);
		border-right: 1px solid rgba(255, 255, 255, 0.05);
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

	/* Ensure generic component headers are white on Borat page */
	:global(.themed-content-block h2),
	:global(.additional-content-header h2),
	:global(.photo-gallery-block h2),
	:global(.related-posts-header h2),
	:global(.map-wrapper-premium h2),
	:global(.video-single h2),
	:global(.faq-header-wrapper h2),
	:global(.comments-header h2),
	:global(#video-section h2),
	:global(section.related-posts h2) {
		font-family: 'Outfit', sans-serif !important;
		font-size: clamp(2rem, 3vw, 3rem) !important;
		color: #ffffff !important; /* STRICTLY WHITE */
		font-weight: 800 !important;
		text-align: left !important;
		margin: 0 0 1.5rem 0 !important;
		letter-spacing: -0.03em !important;
		text-shadow: 0 4px 10px rgba(0, 0, 0, 0.3) !important;
		display: block !important;
		opacity: 1 !important;
		visibility: visible !important;
	}

	/* FAQ Section Overrides */
	:global(.faq-section .faq-card) {
		background: rgba(30, 41, 59, 0.5) !important;
		backdrop-filter: blur(20px) !important;
		border: 1px solid rgba(255, 255, 255, 0.1) !important;
		border-radius: 24px !important;
		box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.5) !important;
	}

	/* Reset FAQ override specifically if it conflicts w/ global white headers, 
	   but keep question text legible if needed (assuming yellow/accent for questions is distinct from headers)
	*/
	:global(.faq-section .faq-question-text) {
		color: #fbbf24 !important;
	}
	:global(.faq-section .faq-body-inner),
	:global(.faq-section .faq-body-inner p),
	:global(.faq-section .faq-body-inner li),
	:global(.faq-section .faq-body-inner span),
	:global(.faq-section .faq-body-inner div) {
		color: #e2e8f0 !important; /* Very light slate for readability */
	}
	:global(.faq-section .faq-body-inner strong),
	:global(.faq-section .faq-body-inner b) {
		color: #fff !important;
	}

	/* FAQ "Ask a Question" Section */
	:global(.faq-ask-wrapper .ask-container) {
		background: linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8)) !important;
		border: 1px solid rgba(255, 255, 255, 0.1) !important;
		box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.5) !important;
	}
	:global(.faq-ask-wrapper .ask-container h3) {
		color: #fbbf24 !important;
	}
	:global(.faq-ask-wrapper .ask-subtitle) {
		color: #94a3b8 !important;
	}
	:global(.faq-ask-wrapper input) {
		background: #0f172a !important;
		border-color: #334155 !important;
		color: #fff !important;
	}
	:global(.faq-ask-wrapper input::placeholder) {
		color: #64748b !important;
	}

	/* Author Info Overrides */
	:global(.author-info-section .author-info-unified-box) {
		background: linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8)) !important;
		backdrop-filter: blur(20px) !important;
		border: 1px solid rgba(255, 255, 255, 0.1) !important;
		box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.5) !important;
	}
	:global(.author-info-section .author-name-display) {
		color: #fbbf24 !important;
		font-family: 'Outfit', sans-serif !important;
	}
	:global(.author-info-section .author-title-display) {
		color: #22d3ee !important; /* Blue/Cyan accent */
	}
	:global(.author-info-section .author-description-display) {
		color: #cbd5e1 !important;
	}
	:global(.author-info-section .author-photo) {
		border-color: rgba(255, 255, 255, 0.1) !important;
		background-color: #1e293b !important;
	}
	:global(.author-info-section .author-photo-placeholder) {
		border-color: rgba(255, 255, 255, 0.1) !important;
	}
	:global(.author-info-section .author-section-label) {
		color: #94a3b8 !important;
	}

	/* Comments Section Overrides */
	:global(.comments-section .comment-card) {
		background: linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8)) !important;
		border: 1px solid rgba(255, 255, 255, 0.1) !important;
		box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.3) !important;
	}
	:global(.comments-section .author-name) {
		color: #fbbf24 !important;
	}
	:global(.comments-section .comment-text) {
		color: #cbd5e1 !important;
	}
	:global(.comments-section .comment-date) {
		color: #94a3b8 !important;
	}
	:global(.comments-section .comment-form-wrapper) {
		background: linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8)) !important;
		border: 1px solid rgba(255, 255, 255, 0.1) !important;
	}
	:global(.comments-section .comment-form-wrapper h3) {
		color: #fbbf24 !important;
	}
	:global(.comments-section .modern-input),
	:global(.comments-section .modern-textarea) {
		background: #0f172a !important;
		border-color: #334155 !important;
		color: #fff !important;
	}
	:global(.comments-section .modern-input::placeholder),
	:global(.comments-section .modern-textarea::placeholder) {
		color: #64748b !important;
	}
	:global(.comments-section .empty-state) {
		background: rgba(30, 41, 59, 0.5) !important;
		color: #94a3b8 !important;
	}

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
			border-left: 4px solid #fbbf24;
			border-right: 1px solid rgba(255, 255, 255, 0.05); /* Reset borders */
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
