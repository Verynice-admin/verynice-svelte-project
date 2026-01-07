<!-- src/routes/destinations/+page.svelte -->
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
	import MapComponent from '$components/features/content/Map.svelte';
	import { initSidebarToggler } from '$components/layout/navigation/sidebarToggler';
	import KeyFacts from '$components/features/content/KeyFacts.svelte';
	import LazyImage from '$components/ui/LazyImage.svelte';
	import KazakhDivider from '$components/ui/KazakhDivider.svelte';
	import FaqSection from '$components/features/content/FaqSection.svelte';

	// Destinations-style tier descriptions and region normalization
	const TIER_DESCRIPTIONS = {
		1: 'Must-see highlights for first-time visitors; iconic and most in-demand.',
		2: 'Strongly recommended; memorable, sometimes more effort or time needed.',
		3: 'Nice-to-see; good if you have extra time or niche interests.'
	};

	const normalizeRegion = (raw = '') => {
		const r = String(raw).trim();
		if (/almaty/i.test(r)) return 'Almaty & Nearby';
		if (/(nur[-\s]?sultan|astana)/i.test(r)) return 'Astana & Nearby';
		if (/(turkistan|turkestan|shymkent)/i.test(r)) return 'Turkistan & Shymkent';
		if (/mangystau|ustyurt|aktau/i.test(r)) return 'Mangystau Region';
		if (/(east|oskemen|ust[-\s]?kamenogorsk)/i.test(r)) return 'East Kazakhstan';
		if (/other/i.test(r)) return 'Other Attractions';
		return r || 'Uncategorized';
	};

	const dedupeAttractions = (items = []) => {
		// Prioritize items with better (lower) tier, then by title length (prefer richer content?), then random
		// This ensures if we have Tier 2 and Tier 3 duplicates, we keep Tier 2.
		const sorted = [...items].sort((a, b) => {
			const aTier = Number(a.tier) || 99;
			const bTier = Number(b.tier) || 99;
			return aTier - bTier;
		});

		const seen = new Set();
		const out = [];
		for (const it of sorted) {
			// Generate a unique key based on Title + Region (to allow same name in different regions if legitimate)
			// But for "Palace of Peace", title is unique enough globally or within Astana.
			// Let's be strict: Normalized Title is the key.
			const titleNorm = (it?.title || '')
				.toLowerCase()
				.trim()
				.replace(/[^a-z0-9]/g, '');
			const regionNorm = (it?.region || '').toLowerCase().trim();

			// Fallback ID if title is empty
			const key = titleNorm ? `${titleNorm}` : it?.id || Math.random().toString(36);

			if (seen.has(key)) continue;
			seen.add(key);
			out.push(it);
		}
		return out;
	};

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
			title: 'Destinations | VeryNice',
			description: 'Discover the top destinations in Kazakhstan.'
		},
		mainTitle: 'Destinations of Kazakhstan',
		headerDescription: 'From ancient nomads to modern nationhood',
		location: 'Kazakhstan',
		articleViews: 0,
		articleComments: 0,
		articleLikes: 0,
		breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Destinations' }],
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

	const fallbackBreadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Destinations' }];

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
				'@id': browser ? window.location.href : 'https://verynice.kz/destinations'
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
	$: tocArticles = (data.articles || [])
		.filter((a) => !a.fromAttraction)
		.sort((a, b) => {
			const isOtherA = /other/i.test(a.title || a.id);
			const isOtherB = /other/i.test(b.title || b.id);
			if (isOtherA && !isOtherB) return 1;
			if (!isOtherA && isOtherB) return -1;
			return (a.order || 0) - (b.order || 0);
		});

	// Destinations-style grouping for attractions layout
	$: attractions = data.attractions || [];
	$: byRegion = attractions.reduce((acc, item) => {
		const region = normalizeRegion(item.region || item.category || '');
		(acc[region] ||= []).push(item);
		return acc;
	}, {});

	// Sort helper: Region/City match first, then Tier 1-3
	const sortAttractionsInGroup = (items, regionLabel) => {
		const r = regionLabel
			.toLowerCase()
			.replace(/(& nearby|region)/g, '')
			.trim();
		// Strict match for "City" or exact name variants
		const isMain = (t) => {
			const title = (t || '').toLowerCase();
			return (
				title === r || title === `${r} city` || (title.startsWith(r) && title.includes('city'))
			);
		};

		return items.sort((a, b) => {
			const aTitle = (a.title || '').toLowerCase();
			const bTitle = (b.title || '').toLowerCase();

			const aMain = isMain(a.title);
			const bMain = isMain(b.title);
			if (aMain && !bMain) return -1;
			if (!aMain && bMain) return 1;

			// Force Altyn-Emel to be near the top (after main city)
			const isAltyn = (t) => t.includes('altyn') && t.includes('emel');
			const aAltyn = isAltyn(aTitle);
			const bAltyn = isAltyn(bTitle);
			if (aAltyn && !bAltyn) return -1;
			if (!aAltyn && bAltyn) return 1;

			const aTier = Number(a.tier) || 99;
			const bTier = Number(b.tier) || 99;
			if (aTier !== bTier) return aTier - bTier;

			return (a.order || 0) - (b.order || 0);
		});
	};

	// Merge duplicate regions so each region shows once
	$: mergedRegionMap = (() => {
		const map = new Map();
		(data.articles || []).forEach((article) => {
			const regionName = normalizeRegion(article.title || article.region || '');
			const rawItems = byRegion[regionName] || [];
			// Even if no raw items, we might keep the header if it exists in articles?
			// But current logic only adds if (rawItems.length) check was present in previous code?
			// Previous code: if (!rawItems.length) return;
			// Wait, if no attractions, we probably don't want to show empty header.
			// But 'articles' are just headers now.

			const existing = map.get(regionName) || {
				region: regionName,
				title: regionName,
				id: article.articleId || article.id,
				order: article.order || 0,
				attractions: []
			};

			if (rawItems.length) {
				existing.attractions = dedupeAttractions([...existing.attractions, ...rawItems]);
				existing.attractions = sortAttractionsInGroup(existing.attractions, regionName);
			}

			// Only add to map if we have attractions OR if it's a known header (up to user preference, but usually better to hide empty)
			if (existing.attractions.length > 0) {
				existing.order = Math.min(existing.order, article.order || 0);
				map.set(regionName, existing);
			}
		});
		return map;
	})();

	$: orderedGroups = Array.from(mergedRegionMap.values());

	$: remainingGroups = Object.keys(byRegion)
		.filter((r) => !orderedGroups.find((g) => g.region === r))
		.map((r) => ({
			region: r,
			title: r,
			id: `section-${r.replace(/\s+/g, '-').toLowerCase()}`,
			attractions: sortAttractionsInGroup(dedupeAttractions(byRegion[r]), r)
		}))
		.filter((g) => g.attractions.length > 0);

	import { slide } from 'svelte/transition';
	import { page as pageStore } from '$app/stores';

	// ... existing code ...

	$: groupedAndSorted = [...orderedGroups, ...remainingGroups].sort((a, b) => {
		// Explicitly prioritize Almaty
		const isAlmatyA = /almaty/i.test(a.region);
		const isAlmatyB = /almaty/i.test(b.region);
		if (isAlmatyA && !isAlmatyB) return -1;
		if (!isAlmatyA && isAlmatyB) return 1;

		// Then prioritize Astana
		const isAstanaA = /astana/i.test(a.region);
		const isAstanaB = /astana/i.test(b.region);
		if (isAstanaA && !isAstanaB) return -1;
		if (!isAstanaA && isAstanaB) return 1;

		// Push "Other Attractions" to bottom
		const isOtherA = /other/i.test(a.region);
		const isOtherB = /other/i.test(b.region);
		if (isOtherA && !isOtherB) return 1;
		if (!isOtherA && isOtherB) return -1;

		const ao = a.order ?? 0;
		const bo = b.order ?? 0;
		if (ao === bo) return a.region.localeCompare(b.region);
		return ao - bo;
	});

	let expandedSections = {};
	let sectionsInitialized = false;

	// Initialize sections: Only Almaty open by default (run once)
	$: {
		if (groupedAndSorted.length > 0 && !sectionsInitialized) {
			const defaults = {};
			groupedAndSorted.forEach((g) => {
				// Check if it's Almaty key
				const isAlmaty = /almaty/i.test(g.region) || /almaty/i.test(g.id);
				defaults[g.id] = isAlmaty;
			});
			expandedSections = defaults;
			sectionsInitialized = true;
		}
	}

	// Auto-expand logic removed as per request

	function toggleSection(id) {
		expandedSections[id] = !expandedSections[id];
	}

	let heroSection;
</script>

<svelte:window bind:innerWidth={windowWidth} />

<svelte:head>
	<title>{pageData?.seo?.title || 'Destinations | VeryNice'}</title>
	<meta
		name="description"
		content={pageData?.seo?.description || 'Discover the top destinations in Kazakhstan.'}
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
		content={browser ? window.location.href : 'https://verynice.kz/destinations'}
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
				aria-label={pageData.headerBackgroundImageAriaLabel ||
					'Background image for destinations page'}
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
		<div
			style="max-width: 1260px; margin: 0 auto; padding: 2rem min(2rem, 4vw); position: relative;"
		>
			<!-- Tier Info Block (same as destinations) -->
			<section
				class="themed-content-block attractions-tier-block"
				style="background: white; border-radius: 1rem; padding: 2rem; margin-bottom: 3rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);"
			>
				<div class="additional-content-header">
					<h2 class="attractions-tier-heading">Tier system to make your travel planning easier</h2>
				</div>
				<div class="attractions-tier-body">
					<p class="attractions-tier-description">
						Rankings reflect traveler popularity and significance, using aggregated demand signals
						(tour and booking interest, review volumes/ratings, seasonal traffic) and our editorial
						field knowledge. They’re a planning aid, not an absolute measure.
					</p>
					<div class="attractions-tier-list">
						<div class="attractions-tier-item">
							<div class="tier-box tier-1">
								<span class="tier-label">TIER</span>
								<span class="tier-number">1</span>
							</div>
							<div>
								<h3 class="tier-title">Must-see highlights</h3>
								<p>{TIER_DESCRIPTIONS[1]}</p>
							</div>
						</div>
						<div class="attractions-tier-item">
							<div class="tier-box tier-2">
								<span class="tier-label">TIER</span>
								<span class="tier-number">2</span>
							</div>
							<div>
								<h3 class="tier-title">Strongly recommended</h3>
								<p>{TIER_DESCRIPTIONS[2]}</p>
							</div>
						</div>
						<div class="attractions-tier-item">
							<div class="tier-box tier-3">
								<span class="tier-label">TIER</span>
								<span class="tier-number">3</span>
							</div>
							<div>
								<h3 class="tier-title">Nice-to-see</h3>
								<p>{TIER_DESCRIPTIONS[3]}</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- Attraction Regions (destinations-style cards) -->
			{#each groupedAndSorted as group (group.region)}
				<section
					id={group.id}
					class="attractions-region-block"
					aria-labelledby={`${group.id}-heading`}
					style="scroll-margin-top: 100px; margin-bottom: 2rem;"
				>
					<button
						type="button"
						class="attractions-region-summary"
						style="background: white; border-radius: 1rem; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border: none; text-align: left;"
						on:click={() => toggleSection(group.id)}
						aria-expanded={!!expandedSections[group.id]}
						aria-controls="{group.id}-content"
					>
						<h2
							id={`${group.id}-heading`}
							class="attractions-region-title"
							style="margin: 0; display: flex; align-items: center; gap: 0.5rem;"
						>
							{group.region}
							<span class="attractions-count-badge">{group.attractions.length}</span>
						</h2>
						<div
							style="display: flex; align-items: center; gap: 0.5rem; color: #6b7280; font-size: 0.875rem; font-weight: 500;"
						>
							<span>{expandedSections[group.id] ? 'View Less' : 'View More'}</span>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								style="transition: transform 0.3s ease; transform: {expandedSections[group.id]
									? 'rotate(180deg)'
									: 'rotate(0deg)'};"
							>
								<polyline points="6 9 12 15 18 9"></polyline>
							</svg>
						</div>
					</button>

					{#if expandedSections[group.id]}
						<div
							id="{group.id}-content"
							class="attractions-items-list"
							style="padding-top: 1.5rem;"
							transition:slide={{ duration: 300, axis: 'y' }}
						>
							{#each group.attractions as attraction (attraction.id)}
								{@const isAlmaty =
									/almaty/i.test(attraction.title) && !/region|nearby|lake/i.test(attraction.title)}
								<a
									href={isAlmaty
										? '/destinations/almaty'
										: /astana/i.test(attraction.title) && /city/i.test(attraction.title)
											? '/destinations/astana'
											: /altyn[-\s]?emel/i.test(attraction.title)
												? '/destinations/altyn-emel-national-park'
												: /big[-\s]?almaty[-\s]?lake/i.test(attraction.title)
													? '/destinations/big-almaty-lake'
													: attraction.url || attraction.href || `/destinations/${attraction.id}`}
									class="attractions-item-card"
								>
									<div class="card-image-wrapper">
										<div
											class="card-image"
											style="background-image: url('{getCloudinaryUrl(
												attraction.images?.[0]?.publicId ||
													attraction.image?.publicId ||
													(typeof attraction.image === 'string' ? attraction.image : null) ||
													attraction.image?.url ||
													attraction.mainImage ||
													attraction.heroImage ||
													attraction.heroImagePublicId ||
													attraction.headerBackgroundPublicId ||
													'site/backgrounds/attractions-hero',
												{
													width: 600,
													crop: 'fill'
												}
											)}')"
											role="img"
											aria-label={attraction.title}
										></div>
										{#if attraction.tier}
											<div class="tier-badge tier-{attraction.tier}">
												<span class="tier-label">TIER</span>
												<span class="tier-number">{attraction.tier}</span>
											</div>
										{/if}
									</div>
									<div class="attractions-item-content">
										<h3 class="item-title">{attraction.title}</h3>
										<p class="item-description">
											{attraction.shortDescription ||
												attraction.description ||
												attraction.headerDescription ||
												''}
										</p>
										<span class="read-more">Read more <span class="arrow">→</span></span>
									</div>
								</a>
							{/each}
						</div>
					{/if}
				</section>
			{/each}
		</div>

		<!-- Footer Content (Video, Map, FAQ, Author) -->
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

			{#if pageData.map?.coordinates}
				<MapComponent
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
					postId="destinationsPage"
					articleLikes={pageData.articleLikes}
					collectionPath="pages"
				/>
			{/if}
			<Comments postId="destinationsPage" />
		</div>
	</div>

	<!-- Floating TOC (overlay) -->
	{#if browser}
		<AsideToc articles={tocArticles} heroElement={heroSection} />
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
