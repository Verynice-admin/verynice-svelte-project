<script>
	import { browser } from '$app/environment';
	import { getCloudinaryUrl } from '$lib/utils/cloudinary';
	import { processContent } from '$lib/utils/markdown';
	import RelatedPosts from '$components/features/content/RelatedPosts.svelte';
	import PhotoGallery from '$components/features/content/PhotoGallery.svelte';
	import FaqSection from '$components/features/content/FaqSection.svelte';
	import Comments from '$components/features/content/Comments.svelte';
	import AsideToc from '$components/layout/navigation/AsideToc.svelte';

	export let data;

	const {
		page,
		highlights,
		signatureDishes,
		restaurants,
		articles,
		photoGallery,
		faq,
		relatedPosts
	} = data;

	// Map highlight cards to their destination pages or anchors
	const normalizeKey = (value) =>
		typeof value === 'string' ? value.trim().toLowerCase() : '';

	const highlightPageLinks = {
		'signature dishes': '/food-drink/signature-dishes',
		'international tastes': '/food-drink/international-tastes',
		'regional tastes': '/food-drink/international-tastes',
		'traditional dastarkhan': '/food-drink/traditional-dastarkhan',
		'silk road noodles': '/food-drink/silk-road-noodles',
		'tea house courtyard': '/food-drink/tea-house-courtyard'
	};

	const highlightAnchorCandidates = {
		'international tastes': ['regional-table-article', 'regional-table'],
		'regional tastes': ['regional-table-article', 'regional-table']
	};

	$: sectionIds = new Set([
		'signature-dishes',
		'restaurants',
		...((articles || []).map((article) => article.articleId || article.id).filter(Boolean) ?? [])
	]);

	const resolveAnchor = (title, itemId) => {
		const key = normalizeKey(title) || normalizeKey(itemId);
		// First check if there's a dedicated page for this item
		if (key && highlightPageLinks[key]) {
			return highlightPageLinks[key];
		}
		// Otherwise check for on-page anchors
		const candidates = highlightAnchorCandidates[key] || [];
		const match = candidates.find((id) => sectionIds.has(id));
		return match ? `#${match}` : null;
	};

	const cardImageUrl = (item) =>
		{
			const title = normalizeKey(item?.title);
			const byTitle = {
				'signature dishes': 'content/pages/destinations/Almaty_nearby/charyn-canyon/charyn-canyon-01',
				'international tastes': 'content/pages/destinations/Astana_Nearby/baiterek-tower/baiterek-tower-01',
				'regional tastes': 'content/pages/destinations/Astana_Nearby/baiterek-tower/baiterek-tower-01',
				'traditional dastarkhan': 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-02',
				'silk road noodles': 'content/pages/destinations/Turkistan_Shymkent/khoja-ahmed-yasawi-mausoleum/khoja-ahmed-yasawi-mausoleum-01',
				'tea house courtyard': 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-01'
			};
			const publicId =
				item?.image?.publicId ||
				item?.imagePublicId ||
				item?.publicId ||
				byTitle[title] ||
				'content/pages/destinations/Almaty_nearby/charyn-canyon/charyn-canyon-01';

			return getCloudinaryUrl(publicId, {
				width: 900,
				height: 540,
				crop: 'fill',
				gravity: 'auto',
				quality: 'auto:good',
				fetch_format: 'auto'
			});
		};

	const defaultPage = {
		seo: {
			title: 'Food & Drinks | VeryNice',
			description: "A rich guide to Kazakhstan's signature dishes, tea culture, markets, and dining."
		},
		mainTitle: 'Food & Drinks of Kazakhstan',
		headerDescription:
			"Signature dishes, tea rituals, regional specialties, and modern dining — a complete guide to the country's table.",
		heroKicker: 'Taste the Tradition',
		location: 'Kazakhstan',
		articleViews: 0,
		articleLikes: 0,
		articleComments: 0,
		breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Food & Drinks' }],
		headerBackgroundPublicId: 'content/pages/destinations/Almaty_nearby/charyn-canyon/charyn-canyon-01',
		introMarkdown:
			'Kazakh cuisine is built for the open steppe: **hearty, seasonal, and communal**. Meals are designed to be shared around the *dastarkhan* (the family table), balancing tradition with a fast-growing modern dining scene in Almaty, Astana, and Shymkent.'
	};

	let pageData = { ...defaultPage, ...(page ?? {}) };

	const fallbackBreadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Food & Drinks' }];
	$: breadcrumbs = (() => {
		if (Array.isArray(pageData?.breadcrumbs) && pageData.breadcrumbs.length > 0) {
			return pageData.breadcrumbs.map((c) => ({
				label: c.label ?? c.title ?? '',
				href: c.href ?? c.url ?? null
			}));
		}
		return fallbackBreadcrumbs;
	})();

	let heroSection;
	let windowWidth = 1200;
</script>

<svelte:window bind:innerWidth={windowWidth} />

<svelte:head>
	<title>{pageData?.seo?.title || 'Kazakhstan Food & Drinks | VeryNice'}</title>
	<meta name="description" content={pageData?.seo?.description || 'Explore Kazakhstan\'s cuisine: from the iconic beshbarmak to Silk Road noodles, traditional dastarkhan feasts, and chaikhana tea houses.'} />
	<link rel="canonical" href="https://verynice.kz/food-drink" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://verynice.kz/food-drink" />
	<meta property="og:title" content={pageData?.seo?.title || 'Kazakhstan Food & Drinks | VeryNice'} />
	<meta property="og:description" content={pageData?.seo?.description || 'Explore Kazakhstan\'s cuisine: from the iconic beshbarmak to Silk Road noodles, traditional dastarkhan feasts, and chaikhana tea houses.'} />
	<meta property="og:image" content="https://verynice.kz/assets/og-cover.jpg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageData?.seo?.title || 'Kazakhstan Food & Drinks | VeryNice'} />
	<meta name="twitter:description" content={pageData?.seo?.description || 'Explore Kazakhstan\'s cuisine: from the iconic beshbarmak to Silk Road noodles, traditional dastarkhan feasts, and chaikhana tea houses.'} />
</svelte:head>

{#if pageData}
<div class="attractions-page">
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
					{#if pageData.heroKicker}
						<span class="hero-kicker">{pageData.heroKicker}</span>
					{/if}
					<h1 itemprop="headline">{pageData.mainTitle}</h1>
					<p class="section-description" itemprop="description">
						{pageData.headerDescription}
					</p>
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
				aria-label={pageData.headerBackgroundImageAriaLabel || 'Food and drinks background image'}
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

	<div class="timeline-container">
		<div style="max-width: 1260px; margin: 0 auto; padding: 2rem min(2rem, 4vw); position: relative;">
			<section class="food-intro">
				<div class="prose">
					{@html processContent(pageData.introMarkdown || pageData.introHTML, 'auto')}
				</div>
			</section>

				{#if highlights && highlights.length}
			<section class="attractions-items-list" style="margin-top: 2rem;">
				{#each highlights as item (item.id || item.title)}
					{@const cardHref = resolveAnchor(item.title, item.articleId || item.id)}
					{#if cardHref}
						<a class="attractions-item-card" href={cardHref}>
							<div class="card-image-wrapper">
								<div
									class="card-image"
									style={`background-image: url("${cardImageUrl(item)}")`}
									role="img"
									aria-label={item.title}
								></div>
								{#if item.tier}
									<div class="tier-badge tier-{item.tier}">
										<span class="tier-number">{item.tier}</span>
									</div>
								{/if}
							</div>
							<div class="attractions-item-content">
								<h3 class="item-title">{item.title}</h3>
								<p class="item-description">{item.description}</p>
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
								{#if item.tier}
									<div class="tier-badge tier-{item.tier}">
										<span class="tier-number">{item.tier}</span>
									</div>
								{/if}
							</div>
							<div class="attractions-item-content">
								<h3 class="item-title">{item.title}</h3>
								<p class="item-description">{item.description}</p>
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

		{#if restaurants && restaurants.length}
			<section class="attractions-items-list" id="restaurants" style="padding-top: 1.5rem;">
				{#each restaurants as restaurant (restaurant.id || restaurant.title)}
					<a class="attractions-item-card" href={restaurant.url || restaurant.href || '#'}>
						<div class="card-image-wrapper">
							<div
								class="card-image"
								style={`background-image: url("${cardImageUrl(restaurant)}")`}
								role="img"
								aria-label={restaurant.title}
							></div>
							{#if restaurant.tier}
								<div class="tier-badge tier-{restaurant.tier}">
									<span class="tier-number">{restaurant.tier}</span>
								</div>
							{/if}
						</div>
						<div class="attractions-item-content">
							<h3 class="item-title">{restaurant.title}</h3>
							<p class="item-description">{restaurant.description}</p>
							<span class="read-more">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
								</svg>
								Explore
							</span>
						</div>
					</a>
				{/each}
			</section>
		{/if}

		{#if articles && articles.length}
			{#each articles as article (article.articleId || article.id)}
				<section class="themed-content-block food-article" id={article.articleId || article.id}>
					<h2>{article.title}</h2>
					<div class="prose">
						{@html processContent(
							article.contentMarkdown || article.contentHTML,
							article.contentFormat || 'auto',
							article.contentHTML
						)}
					</div>
				</section>
			{/each}
		{/if}

		{#if photoGallery?.photos?.length}
			<section class="themed-content-block">
				<PhotoGallery title={photoGallery.title || 'Food & Drinks Gallery'} photos={photoGallery.photos} />
			</section>
		{/if}

		<section class="themed-content-block">
			<RelatedPosts title="Related Posts" posts={relatedPosts || []} collectionPath="destinations" />
		</section>

		{#if faq?.items?.length}
			<section class="themed-content-block">
				<FaqSection title={faq.title || 'Food & Drinks FAQs'} items={faq.items} />
			</section>
		{/if}

		<section class="themed-content-block">
			<Comments postId="foodDrinkPage" />
		</section>
		</div>
	</div>

	{#if browser}
		<AsideToc articles={articles || []} heroElement={heroSection} />
	{/if}

	{#if windowWidth <= 1023}
		<nav class="mobile-bottom-nav-local" aria-label="Mobile navigation">
			<a href="/" aria-label="Home"><i class="fa fa-home" aria-hidden="true"></i></a>
		</nav>
	{/if}
</div>
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
		color: #334155;
		font-size: 1.15rem;
		line-height: 1.7;
	}

	.food-intro :global(.prose strong) {
		color: #0f172a;
		font-weight: 600;
	}

	.food-intro :global(.prose em) {
		color: var(--vnk-accent-color);
		font-style: italic;
	}

	.food-intro :global(.prose a) {
		color: var(--vnk-accent-color);
		text-decoration: underline;
	}

	.food-intro :global(.prose a:hover) {
		color: var(--vnk-primary-color);
	}

	.food-article {
		background: var(--vnk-card-bg);
		border-radius: 48px;
		border: none;
		box-shadow:
			0 2px 10px rgba(0, 0, 0, 0.08),
			inset 0 1px 0 rgba(255, 255, 255, 0.6);
		margin-top: 2rem;
	}

	.food-article :global(.prose),
	.food-article :global(.prose p),
	.food-article :global(.prose li) {
		color: rgba(var(--vnk-text-secondary-color-rgb), 0.9);
	}

	.food-article :global(.prose h2),
	.food-article :global(.prose h3),
	.food-article :global(.prose h4),
	.food-article :global(.prose strong) {
		color: var(--vnk-text-secondary-color);
	}

	.food-article :global(.prose a) {
		color: var(--vnk-accent-color);
	}

	.food-article :global(.prose a:hover) {
		color: var(--vnk-primary-color);
	}

	.food-article h2 {
		font-family: 'Segoe UI', 'Inter', sans-serif;
		font-size: 1.6rem;
		color: var(--vnk-text-secondary-color);
		margin-bottom: 1.25rem;
	}

	.food-split {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 2rem;
		margin-top: 2rem;
	}

	.food-list-block {
		background: var(--vnk-card-bg);
		border-radius: 72px;
		padding: 2.5rem;
		border: none;
		box-shadow:
			0 2px 10px rgba(0, 0, 0, 0.08),
			inset 0 1px 0 rgba(255, 255, 255, 0.6);
	}

	.food-list-block h2 {
		font-family: 'Segoe UI', 'Inter', sans-serif;
		font-size: 1.3rem;
		color: var(--vnk-text-secondary-color);
		margin-bottom: 1rem;
	}

	.food-list-block ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		color: rgba(var(--vnk-text-secondary-color-rgb), 0.9);
	}

	.food-list-block strong {
		color: var(--vnk-text-secondary-color);
	}

	/* Force card styles - copied from pages.css */
	:global(.attractions-items-list) {
		display: grid !important;
		grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
		row-gap: 1.75rem !important;
		column-gap: 1.75rem !important;
		padding: 2rem 0 !important;
		max-width: 1200px !important;
		margin: 0 auto !important;
		align-items: stretch !important;
}

 	/* Card styles now global in pages.css */
 	:global(.attractions-item-content .item-title) {
		font-family: 'Segoe UI', 'Inter', sans-serif !important;
		font-size: 1.25rem !important;
		font-weight: 600 !important;
		color: var(--vnk-text-secondary-color) !important;
		margin: 0 !important;
		line-height: 1.3 !important;
		text-transform: none !important;
		letter-spacing: 0 !important;
		border: none !important;
		width: 100% !important;
		padding: 0 !important;
		display: -webkit-box !important;
		-webkit-line-clamp: 1 !important;
		line-clamp: 1 !important;
		-webkit-box-orient: vertical !important;
		overflow: hidden !important;
	}

	:global(.attractions-item-card:hover .item-title) {
		color: var(--vnk-text-secondary-color) !important;
	}

	:global(.attractions-item-content .item-description) {
		font-family: 'Segoe UI', 'Inter', sans-serif !important;
		font-size: 1rem !important;
		line-height: 1.4 !important;
		color: rgba(var(--vnk-text-secondary-color-rgb), 0.9) !important;
		margin: 0 !important;
		display: -webkit-box !important;
		-webkit-line-clamp: 1 !important;
		line-clamp: 1 !important;
		-webkit-box-orient: vertical !important;
		overflow: hidden !important;
		flex: 1 !important;
	}

	:global(.attractions-item-card .read-more) {
		font-family: 'Segoe UI', 'Inter', sans-serif !important;
		font-size: 0.82rem !important;
		font-weight: 500 !important;
		color: var(--vnk-text-secondary-color) !important;
		text-transform: none !important;
		letter-spacing: 0 !important;
		margin-top: 0 !important;
		display: inline-flex !important;
		align-items: center !important;
		justify-content: center !important;
		gap: 8px !important;
		padding: 10px 16px !important;
		background: rgba(255, 255, 255, 0.84) !important;
		border: 2px solid rgba(var(--vnk-accent-rgb), 0.42) !important;
		border-radius: 999px !important;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7) !important;
		transition: all 0.2s ease !important;
		width: 300px !important;
		align-self: center !important;
		transform: translateY(-0.7cm) !important;
	}

	:global(.attractions-item-card:hover .read-more) {
		background: rgba(255, 255, 255, 0.9) !important;
		border-color: rgba(var(--vnk-accent-rgb), 0.6) !important;
	}

	@media (max-width: 900px) {
		:global(.attractions-items-list) {
			grid-template-columns: repeat(2, 1fr) !important;
			gap: 0.6rem !important;
		}
		
		/* Circular cards on tablet - ~55% of desktop */
		:global(.attractions-item-card) {
			border-radius: 46px !important;
			aspect-ratio: 3 / 4 !important;
			min-height: 120px !important;
			max-height: 160px !important;
			padding: 6px !important;
			gap: 6px !important;
		}
		
		:global(.attractions-item-card .card-image-wrapper) {
			margin: 3px !important;
			border-radius: 36px !important;
			aspect-ratio: 1 / 1 !important;
			flex: 0 0 42% !important;
		}
		
		:global(.attractions-item-card .card-image) {
			border-radius: 36px !important;
		}
		
		/* Tier badge - ~55% of desktop */
		:global(.attractions-item-card .tier-badge) {
			padding: 0.4rem 0.65rem !important;
			font-size: 1.05rem !important;
			border-radius: 10px !important;
			bottom: 0.4rem !important;
			right: 0.4rem !important;
		}
		
		:global(.attractions-item-card .tier-number) {
			font-size: 1.05rem !important;
		}
		
		:global(.attractions-item-content .item-title) {
			font-size: 0.8rem !important;
		}
		
		:global(.attractions-item-content .item-description) {
			font-size: 0.65rem !important;
		}
		
		/* Explore button - below description, no overlap */
		:global(.attractions-item-card .read-more) {
			font-size: 0.55rem !important;
			padding: 4px 8px !important;
			width: auto !important;
			max-width: 100px !important;
			transform: none !important;
			align-self: flex-start !important;
			margin-top: auto !important;
		}
	}

	@media (max-width: 600px) {
		:global(.attractions-items-list) {
			grid-template-columns: repeat(2, 1fr) !important;
			gap: 0.4rem !important;
		}

		:global(.attractions-item-card .card-image-wrapper) {
			margin: 2px !important;
		}

		:global(.attractions-item-content) {
			padding: 0 0.25rem !important;
			gap: 2px !important;
		}

		:global(.attractions-item-content .item-title) {
			font-size: 0.65rem !important;
		}

		:global(.attractions-item-content .item-description) {
			font-size: 0.55rem !important;
			-webkit-line-clamp: 1 !important;
			line-clamp: 1 !important;
		}

		/* Explore button - below description, no overlap */
		:global(.attractions-item-card .read-more) {
			font-size: 0.5rem !important;
			padding: 3px 6px !important;
			width: auto !important;
			min-width: 40px !important;
			max-width: 80px !important;
			transform: none !important;
			align-self: flex-start !important;
			margin-top: auto !important;
		}
		
		/* Circular cards on mobile - ~35% of desktop */
		:global(.attractions-item-card) {
			border-radius: 30px !important;
			aspect-ratio: 3 / 4 !important;
			min-height: 100px !important;
			max-height: 140px !important;
			padding: 4px !important;
			gap: 4px !important;
		}
		
		:global(.attractions-item-card .card-image-wrapper) {
			margin: 2px !important;
			border-radius: 23px !important;
			aspect-ratio: 1 / 1 !important;
			flex: 0 0 42% !important;
		}
		
		:global(.attractions-item-card .card-image) {
			border-radius: 23px !important;
		}
		
		/* Tier badge - ~35% of desktop */
		:global(.attractions-item-card .tier-badge) {
			padding: 0.25rem 0.45rem !important;
			font-size: 0.85rem !important;
			border-radius: 7px !important;
			bottom: 0.3rem !important;
			right: 0.3rem !important;
		}
		
		:global(.attractions-item-card .tier-number) {
			font-size: 0.85rem !important;
		}
	}
</style>
