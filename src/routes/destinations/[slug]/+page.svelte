<!-- src/routes/destinations/[slug]/+page.svelte -->
<script>
	import { onMount } from 'svelte';
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
	import KeyFacts from '$components/features/content/KeyFacts.svelte';
	import FaqSection from '$components/features/content/FaqSection.svelte';

	export let data;
	$: page = data?.page;
	$: articles = data?.articles;
	$: author = data?.author;

	$: pageData = { ...(page ?? {}) };

	// Split a single article at NUMBERED ## headings (e.g. "## 1. Title", "## 5. Tips")
	// Non-numbered H2 subsections are folded into the preceding numbered section.
	// Falls back to all-H2 splitting when no numbered headings exist.
	function splitArticleByHeadings(article) {
		const rawContent = article.contentMarkdown || article.contentHTML || '';
		if (!rawContent) return [article];

		const isHTML = !article.contentMarkdown && rawContent.includes('<');
		const useMd = !!article.contentMarkdown;

		if (!isHTML) {
			// --- Markdown path ---
			const hasAnyH2 = rawContent.includes('\n## ') || rawContent.startsWith('## ');
			if (!hasAnyH2) return [article];

			const hasNumberedH2 = /^## \d/m.test(rawContent);
			const isNumbered = (line) => hasNumberedH2 ? /^## \d/.test(line) : line.startsWith('## ');

			const lines = rawContent.split('\n');
			const sections = [];
			let current = [];
			for (const line of lines) {
				if (line.startsWith('## ') && isNumbered(line)) {
					if (current.length > 0) sections.push(current.join('\n'));
					current = [line];
				} else {
					current.push(line);
				}
			}
			if (current.length > 0) sections.push(current.join('\n'));
			const trimmed = sections.filter(s => s.trim());
			if (trimmed.length <= 1) return [article];

			return trimmed.map((part, i) => {
				const firstLine = part.split('\n')[0];
				const startsH2 = firstLine.startsWith('## ');
				const rawTitle = startsH2 ? firstLine.slice(3).trim() : (i === 0 ? article.title : `Section ${i + 1}`);
				const title = rawTitle.replace(/^\d+\.\s*/, '');
				const body = startsH2 ? part.slice(firstLine.length).trim() : part.trim();
				return {
					...article,
					id: `${article.id || 'art'}-s${i}`,
					articleId: `${article.articleId || article.id || 'art'}-s${i}`,
					title,
					contentMarkdown: useMd ? body : '',
					contentHTML: useMd ? '' : body,
					year: i === 0 ? article.year : ''
				};
			});
		}

		// --- HTML path ---
		if (!rawContent.includes('<h2')) return [article];
		const allParts = rawContent.split(/(?=<h2[\s>])/i).filter(Boolean);
		if (allParts.length <= 1) return [article];

		const headingText = (part) => {
			const m = part.match(/^<h2[^>]*>([\s\S]*?)<\/h2>/i);
			return m ? m[1].replace(/<[^>]+>/g, '').trim() : '';
		};
		const hasNumberedHTML = allParts.some(p => /^\d/.test(headingText(p)));
		const isNumberedPart = (part) => hasNumberedHTML ? /^\d/.test(headingText(part)) : true;

		// Merge non-numbered HTML parts into the preceding numbered part
		const merged = [];
		let currentPart = '';
		for (const part of allParts) {
			const startsH2 = /^<h2[\s>]/i.test(part);
			if (startsH2 && isNumberedPart(part)) {
				if (currentPart) merged.push(currentPart);
				currentPart = part;
			} else {
				currentPart += part;
			}
		}
		if (currentPart) merged.push(currentPart);
		if (merged.length <= 1) return [article];

		return merged.map((part, i) => {
			const m = part.match(/^<h2[^>]*>([\s\S]*?)<\/h2>/i);
			const title = m ? m[1].replace(/<[^>]+>/g, '').trim() : `Section ${i + 1}`;
			const body = m ? part.slice(m[0].length).trim() : part.trim();
			return {
				...article,
				id: `${article.id || 'art'}-s${i}`,
				articleId: `${article.articleId || article.id || 'art'}-s${i}`,
				title,
				contentHTML: body,
				contentMarkdown: '',
				year: i === 0 ? article.year : ''
			};
		});
	}

	// Expand articles: split single rich articles at H2 to create chess-order timeline items
	$: expandedArticles = (() => {
		const arts = articles || [];
		if (arts.length !== 1) return arts;
		return splitArticleByHeadings(arts[0]);
	})();

	// Derived State
	// Fix [object Object] issue:
	$: locationLabel = (() => {
		const loc = pageData.location;
		if (!loc) return '';
		if (typeof loc === 'string') return loc;
		if (typeof loc === 'object') return loc.address || loc.name || 'Kazakhstan';
		return '';
	})();

	$: breadcrumbs = [
		{ label: 'Home', href: '/' },
		{ label: 'Destinations', href: '/destinations' }, // Added intermediate crumb
		{ label: pageData.mainTitle || 'Destination', href: null } // Current page
	];

	$: normalizedKeyFacts = pageData.keyFacts || [];

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

	$: rawPhotos =
		pageData?.photoGallery?.photos?.length > 0
			? pageData.photoGallery.photos
			: pageData?.photos || [];
	$: normalizedPhotoGallery = rawPhotos
		.map((item, index) => {
			if (!item) return null;
			if (typeof item === 'string') {
				return {
					imageUrl: getCloudinaryUrl(item),
					thumbnailUrl: getCloudinaryUrl(item, { width: 480 }),
					altText: `Photo ${index + 1}`
				};
			}
			const publicId = item.publicId || item.public_id || item.url || '';
			return {
				imageUrl: item.imageUrl || item.url || getCloudinaryUrl(publicId),
				thumbnailUrl: item.thumbnailUrl || getCloudinaryUrl(publicId, { width: 480 }),
				altText: item.alt || item.altText || item.caption || `Photo ${index + 1}`,
				caption: item.caption || ''
			};
		})
		.filter(Boolean);

	$: hasPhotoGallery = normalizedPhotoGallery.length > 0;
	$: photoGalleryTitle = pageData?.photoGallery?.title || 'Visual Journey';

	// Structured Data (Schema.org)
	$: structuredData = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: pageData.mainTitle,
		description: pageData.headerDescription,
		image: pageData.headerBackgroundPublicId
			? getCloudinaryUrl(pageData.headerBackgroundPublicId)
			: undefined,
		author: author ? { '@type': 'Person', name: author.name } : undefined,
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': browser ? window.location.href : `https://verynice.kz/destinations/${data.slug}`
		}
	};

	// Virtual Section for TOC
	$: keyFactsSection = {
		id: 'key-facts',
		articleId: 'key-facts',
		title: 'Key Facts',
		year: 'Essentials',
		type: 'key-facts',
		contentHTML: ''
	};

	$: allArticles = [...expandedArticles, keyFactsSection];

	let heroSection;
	let windowWidth;
</script>

<svelte:window bind:innerWidth={windowWidth} />

<svelte:head>
	<title>{pageData.seo?.title || `${pageData.mainTitle} | VeryNice`}</title>
	<meta name="description" content={pageData.seo?.description || pageData.headerDescription} />
	{@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
</svelte:head>

{#if pageData}
	<div class="attractions-page">
	<section id="page-hero-section" class="section" bind:this={heroSection}>
		<div class="section-header wrapper">
			<!-- Breadcrumbs -->
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
					<!-- Post Info Icons -->
					<div class="post-info" role="group">
						{#if locationLabel}
							<div class="post-info-inner">
								<span class="icon-location" aria-hidden="true"></span>
								<div class="post-info-content">{locationLabel}</div>
							</div>
						{/if}
						<div class="post-info-inner">
							<span class="icon-view" aria-hidden="true"></span>
							<div class="post-info-content">{pageData.articleViews || 0}</div>
						</div>
						<div class="post-info-inner">
							<span class="icon-comment" aria-hidden="true"></span>
							<div class="post-info-content">{pageData.articleComments || 0}</div>
						</div>
						<div class="post-info-inner">
							<span class="icon-like" aria-hidden="true"></span>
							<div class="post-info-content">{pageData.articleLikes || 0}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- Background Image -->
		{#if pageData.headerBackgroundPublicId}
			<div
				class="header-background"
				role="img"
				style={`--hero-bg-url: url("${getCloudinaryUrl(pageData.headerBackgroundPublicId, { width: 2200, crop: 'fill' })}")`}
			>
				<div class="background-image"></div>
			</div>
		{/if}
	</section>
	</div>

	<div class="timeline-container">
		<div class="timeline">
			{#each allArticles as article, index (article.id || article.articleId || index)}
				{@const articleId = article.articleId || article.id}
				<div id={articleId} class="timeline-item {index % 2 === 0 ? 'left' : 'right'}">
					<div class="timeline-content">
						{#if article.year}<div class="timeline-year">{article.year}</div>{/if}
						<h2 class="timeline-title">{article.title}</h2>
						<div class="timeline-body">
							{#if article.type === 'key-facts'}
								<KeyFacts title="Key Facts" facts={normalizedKeyFacts} embedded={true} />
							{:else}
								{@html processContent(
									article.contentMarkdown || article.contentHTML,
									article.contentFormat || 'auto'
								)}
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Footer Content in Timeline -->
		<div class="timeline-footer wrapper">
			{#if hasPhotoGallery}
				<PhotoGallery title={photoGalleryTitle} photos={normalizedPhotoGallery} />
			{/if}
			<RelatedPosts
				title="More to Explore"
				posts={pageData.relatedPosts || []}
				collectionPath="destinations"
				postId={data.slug}
			/>
			{#if pageData.video}
				<VideoEmbed title={pageData.video.title} url={pageData.video.url} />
			{/if}
			{#if pageData.map?.coordinates}
				<Map title={pageData.map.title} coordinates={pageData.map.coordinates} />
			{/if}
			{#if pageData.faq?.items?.length}
				<FaqSection title={pageData.faq.title} items={pageData.faq.items} />
			{/if}
			{#if author}
				<AuthorInfo
					{author}
					postId={`dest-${data.slug}`}
					articleLikes={pageData.articleLikes}
					collectionPath="pages"
				/>
			{/if}
			<Comments postId={data.dbPath || data.slug} />
		</div>
	</div>

	<!-- Floating TOC -->
	{#if browser}
		<AsideToc articles={allArticles} heroElement={heroSection} />
	{/if}

{/if}
