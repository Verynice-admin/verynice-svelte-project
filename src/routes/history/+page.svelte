<!-- src/routes/history/+page.svelte -->
<script>
	import { onMount } from 'svelte';
	import mermaid from 'mermaid';
	import { browser } from '$app/environment';
	import { getCloudinaryUrl } from '$lib/utils/cloudinary';
	import { processContent } from '$lib/utils/markdown';
	import AuthorInfo from '$components/features/content/AuthorInfo.svelte';
	import VideoEmbed from '$components/features/content/VideoEmbed.svelte';
	import PhotoGallery from '$components/features/content/PhotoGallery.svelte';
	import RelatedPosts from '$components/features/content/RelatedPosts.svelte';
	import AsideToc from '$components/layout/navigation/AsideToc.svelte';
	import Comments from '$components/features/content/Comments.svelte';
	import Map from '$components/features/content/Map.svelte';
	import { initSidebarToggler } from '$components/layout/navigation/sidebarToggler';
	import KeyFacts from '$components/features/content/KeyFacts.svelte';
	import LazyImage from '$components/ui/LazyImage.svelte';
	import KazakhDivider from '$components/ui/KazakhDivider.svelte';
	import FaqSection from '$components/features/content/FaqSection.svelte';

	onMount(async () => {
		if (browser) {
			mermaid.initialize({
				startOnLoad: false,
				theme: 'neutral',
				securityLevel: 'loose',
				fontFamily: 'Inter, sans-serif',
				fontSize: 56, // Significantly increased base font size
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
			title: 'History | VeryNice',
			description: 'Learn about the rich history of Kazakhstan.'
		},
		mainTitle: 'History of Kazakhstan',
		headerDescription: 'From ancient nomads to modern nationhood',
		location: 'Kazakhstan',
		articleViews: 0,
		articleComments: 0,
		articleLikes: 0,
		breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'History' }],
		keyFacts: [
			{ label: 'Capital', value: 'Astana' },
			{ label: 'Official language', value: 'Kazakh' },
			{ label: 'Spaceport', value: "Baikonur Cosmodrome (world's first)" },
			{ label: 'First human spaceflight', value: 'Yuri Gagarin (1961) from Baikonur' },
			{ label: 'Land Area', value: '9th largest country in the world' },
			{ label: 'Origin of Apples', value: 'Almaty Region (Malus sieversii)' }
		]
	};

	let pageData = { ...defaultPage, ...(page ?? {}) };

	// Normalize keyFacts
	const fallbackFacts = [
		{ label: 'Capital', value: 'Astana' },
		{ label: 'Official language', value: 'Kazakh' },
		{ label: 'Spaceport', value: "Baikonur Cosmodrome (world's first)" },
		{ label: 'First human spaceflight', value: 'Yuri Gagarin (1961) from Baikonur' },
		{ label: 'Land Area', value: '9th largest country in the world' },
		{ label: 'Origin of Apples', value: 'Almaty Region (Malus sieversii)' }
	];

	$: normalizedKeyFacts = (() => {
		// KeyFacts now come from subcollection (already normalized by server)
		// Server returns them as array of {id, label, value, order}
		let dbFacts = [];
		if (Array.isArray(pageData?.keyFacts) && pageData.keyFacts.length > 0) {
			// Map from subcollection format to component format
			dbFacts = pageData.keyFacts.map((fact) => ({
				label: fact.label || '',
				value: fact.value || ''
			}));
		}

		// If no DB facts, return fallback
		if (dbFacts.length === 0) return fallbackFacts;

		// Return DB facts (subcollection is the source of truth)
		return dbFacts;
	})();

	let windowWidth = 1200;

	const fallbackBreadcrumbs = [{ label: 'Home', href: '/' }, { label: 'History' }];

	// Breadcrumbs now come from subcollection (already normalized by server)
	$: breadcrumbs = (() => {
		if (Array.isArray(pageData?.breadcrumbs) && pageData.breadcrumbs.length > 0) {
			return pageData.breadcrumbs.map((c) => ({
				label: c.label ?? c.title ?? '',
				href: c.href ?? c.url ?? null
			}));
		}
		return fallbackBreadcrumbs;
	})();

	const buildCloudinaryImage = (publicId, { width = 1600, height = 900 } = {}) => {
		if (!publicId) return null;
		return getCloudinaryUrl(publicId, {
			width,
			height,
			crop: 'fill',
			quality: 'auto:good',
			fetch_format: 'auto'
		});
	};

	const normalizeGalleryItem = (item, index) => {
		if (!item) return null;

		const isStringItem = typeof item === 'string';
		const stringValue = isStringItem ? item.trim() : '';
		const stringLooksLikeUrl = isStringItem && /^https?:/i.test(stringValue);

		const raw = isStringItem
			? stringLooksLikeUrl
				? { imageUrl: stringValue }
				: { publicId: stringValue }
			: item;

		const publicId = raw.publicId || raw.public_id || raw.cloudinaryId || raw.photoId || null;

		const directImageUrl =
			raw.imageUrl || raw.url || raw.src || (stringLooksLikeUrl ? stringValue : null);
		const imageUrl = directImageUrl || (publicId ? buildCloudinaryImage(publicId) : null);

		const thumbnailUrl =
			raw.thumbnailUrl ||
			raw.thumbUrl ||
			(publicId ? buildCloudinaryImage(publicId, { width: 480, height: 320 }) : null) ||
			imageUrl;

		if (!imageUrl) return null;

		return {
			imageUrl,
			thumbnailUrl,
			altText: raw.altText || raw.alt || raw.caption || `Photo ${index + 1}`,
			caption: raw.caption || raw.description || raw.title || ''
		};
	};

	// Photo gallery now comes from subcollection (page.photoGallery = { title, photos })
	$: normalizedPhotoGallery = (() => {
		if (pageData?.photoGallery?.photos && Array.isArray(pageData.photoGallery.photos)) {
			return pageData.photoGallery.photos
				.map((item, index) => normalizeGalleryItem(item, index))
				.filter(Boolean);
		}
		return [];
	})();

	$: hasPhotoGallery = normalizedPhotoGallery && normalizedPhotoGallery.length > 0;

	$: photoGalleryTitle = pageData?.photoGallery?.title || 'Photo Gallery';

	let cleanup = () => {};
	import.meta.env &&
		(async () => {
			// if (browser) cleanup = initSidebarToggler('[data-aside-toc]', '#key-facts');
		})();

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
				'@id': browser ? window.location.href : 'https://verynice.kz/history'
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

	// Create virtual section for Key Facts to integrate into timeline and TOC
	$: keyFactsSection = {
		id: 'key-facts',
		articleId: 'key-facts',
		title: pageData.keyFactsTitle || 'Key Facts',
		year: 'Summary',
		type: 'key-facts',
		// Ensure it has required props for generic usage if needed
		contentHTML: ''
	};

	$: allArticles = [...(data.articles || []), keyFactsSection];

	let heroSection;
</script>

<svelte:window bind:innerWidth={windowWidth} />
<svelte:body class="premium-theme-page" />

<svelte:head>
	<title>{pageData?.seo?.title || 'History | VeryNice'}</title>

	<meta
		name="description"
		content={pageData?.seo?.description || 'Learn about the rich history of Kazakhstan.'}
	/>
	<meta
		name="keywords"
		content={pageData?.seo?.keywords || 'Kazakhstan, history, culture, Central Asia'}
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
		content={browser ? window.location.href : 'https://verynice.kz/history'}
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

	<!-- Performance: DNS prefetch and preconnect to external domains -->
	<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
	<link rel="dns-prefetch" href="https://fonts.gstatic.com" />
	<link rel="dns-prefetch" href="https://res.cloudinary.com" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link rel="preconnect" href="https://res.cloudinary.com" />

	<!-- Fonts with display=block for performance -->
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Outfit:wght@400;700;800;900&display=block"
		rel="stylesheet"
	/>

	<!-- Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbStructuredData)}</script>`}
</svelte:head>

{#if pageData}
	<!-- apply .section styles from pages.css -->
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
						quality: 100,
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

				<span class="hero-kicker">HISTORY OF KAZAKHSTAN</span>
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

	<div class="timeline-container">
		<div class="timeline">
			{#each allArticles as article, index (article.id || article.articleId || index)}
				{@const articleId = article.articleId || article.id}
				<div id={articleId} class="timeline-item {index % 2 === 0 ? 'left' : 'right'}">
					<div class="timeline-content">
						<div class="timeline-year">{article.year || 'Era'}</div>
						<h2 class="timeline-title">{article.title}</h2>
						<div class="timeline-body">
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

		<!-- Footer Content (Video, Map, FAQ, Author) moved below timeline -->
		<div class="timeline-footer wrapper">
			{#if hasPhotoGallery}
				<div class="themed-content-block">
					<PhotoGallery title={photoGalleryTitle} photos={normalizedPhotoGallery} />
				</div>
			{/if}
			{#if pageData.relatedPosts && pageData.relatedPosts.length > 0}
				<div class="dark-component-wrapper">
					<RelatedPosts
						title={pageData.relatedPostsTitle || 'Related Posts'}
						posts={pageData.relatedPosts}
					/>
				</div>
			{/if}
			{#if pageData.video?.url}
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
						postId="historyPage"
						articleLikes={pageData.articleLikes}
						collectionPath="pages"
					/>
				</div>
			{/if}
			<div class="comments-wrapper-premium">
				<Comments postId="historyPage" />
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
	/* PREMIUM HERO SECTION (Borat Style) */
	/* Global theme handles body background - removed duplicate */

	.wrapper {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	/* HERO SECTION Styles (From Borat Page) */
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
		/* Filter forced off for maximum clarity as requested */
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
		padding-top: 10vh;
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
</style>
