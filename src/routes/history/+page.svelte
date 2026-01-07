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
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=block"
		rel="stylesheet"
	/>

	<!-- Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbStructuredData)}</script>`}
</svelte:head>

{#if pageData}
	<!-- apply .section styles from pages.css -->
	<section id="page-hero-section" class="section" bind:this={heroSection}>
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
						{#if pageData.articleComments > 0}
							<div class="post-info-inner" aria-label="{pageData.articleComments} comments">
								<span class="icon-comment" aria-hidden="true"></span>
								<div class="post-info-content">{pageData.articleComments.toLocaleString()}</div>
							</div>
						{/if}
						{#if pageData.articleLikes > 0}
							<div class="post-info-inner" aria-label="{pageData.articleLikes} likes">
								<span class="icon-like" aria-hidden="true"></span>
								<div class="post-info-content">{pageData.articleLikes.toLocaleString()}</div>
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
				aria-label={pageData.headerBackgroundImageAriaLabel || 'Background image for history page'}
				style={`--hero-bg-url: url("${getCloudinaryUrl(pageData.headerBackgroundPublicId, {
					width: 2200,
					height: 1200,
					crop: 'fill',
					gravity: 'auto',
					quality: 'auto:good',
					fetch_format: 'auto'
				})}")`}
			>
				<div class="background-image"></div>
			</div>
		{/if}
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
				<PhotoGallery title={photoGalleryTitle} photos={normalizedPhotoGallery} />
			{/if}
			{#if pageData.relatedPosts && pageData.relatedPosts.length > 0}
				<RelatedPosts
					title={pageData.relatedPostsTitle || 'Related Posts'}
					posts={pageData.relatedPosts}
				/>
			{/if}
			{#if pageData.video?.url}
				<VideoEmbed title={pageData.video.title || 'Video'} url={pageData.video.url} />
			{/if}
			{#if pageData.map?.coordinates}
				<Map
					title={pageData.map.title || 'Location on Map'}
					coordinates={pageData.map.coordinates}
				/>
			{/if}
			{#if pageData.faq?.items?.length}
				<FaqSection
					title={pageData.faq.title || 'Frequently Asked Questions'}
					items={pageData.faq.items}
				/>
			{/if}
			{#if data.author && (data.author.name || data.author.authorName)}
				<AuthorInfo
					author={data.author}
					labels={pageData.labels}
					postId="historyPage"
					articleLikes={pageData.articleLikes}
					collectionPath="pages"
				/>
			{/if}
			<Comments postId="historyPage" />
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
