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
		'regional tastes': '/food-drink/international-tastes'
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

	const defaultPage = {
		seo: {
			title: 'Food & Drinks | VeryNice',
			description: 'A rich guide to Kazakhstan’s signature dishes, tea culture, markets, and dining.'
		},
		mainTitle: 'Food & Drinks of Kazakhstan',
		headerDescription:
			'Signature dishes, tea rituals, regional specialties, and modern dining — a complete guide to the country’s table.',
		heroKicker: 'Taste the Tradition',
		location: 'Kazakhstan',
		articleViews: 0,
		articleLikes: 0,
		articleComments: 0,
		breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Food & Drinks' }],
		headerBackgroundPublicId: 'content/site/backgrounds/attractions-hero',
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
	<title>{pageData?.seo?.title || 'Food & Drinks | VeryNice'}</title>
	<meta
		name="description"
		content={pageData?.seo?.description || 'A rich guide to Kazakhstan’s signature dishes and drinks.'}
	/>
</svelte:head>

{#if pageData}
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
									style="background-image: url('{getCloudinaryUrl(item.image?.publicId || item.imagePublicId || 'site/backgrounds/attractions-hero', { width: 600, crop: 'fill' })}')"
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
									style="background-image: url('{getCloudinaryUrl(item.image?.publicId || item.imagePublicId || 'site/backgrounds/attractions-hero', { width: 600, crop: 'fill' })}')"
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
								style="background-image: url('{getCloudinaryUrl(restaurant.image?.publicId || restaurant.imagePublicId || 'site/backgrounds/attractions-hero', { width: 600, crop: 'fill' })}')"
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

		{#if relatedPosts && relatedPosts.length}
			<section class="themed-content-block">
				<RelatedPosts title="Related Posts" posts={relatedPosts} />
			</section>
		{/if}

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
		color: #cbd5e1;
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

	.food-intro :global(.prose a) {
		color: var(--vnk-accent-color);
		text-decoration: underline;
	}

	.food-intro :global(.prose a:hover) {
		color: #0ea5b7;
	}

	.food-article {
		background: #d1d4da;
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
		color: #3f3f3f;
	}

	.food-article :global(.prose h2),
	.food-article :global(.prose h3),
	.food-article :global(.prose h4),
	.food-article :global(.prose strong) {
		color: #1f1f1f;
	}

	.food-article :global(.prose a) {
		color: var(--vnk-accent-color);
	}

	.food-article :global(.prose a:hover) {
		color: #0ea5b7;
	}

	.food-article h2 {
		font-family: 'Segoe UI', 'Inter', sans-serif;
		font-size: 1.6rem;
		color: #1f1f1f;
		margin-bottom: 1.25rem;
	}

	.food-split {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 2rem;
		margin-top: 2rem;
	}

	.food-list-block {
		background: #d1d4da;
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
		color: #1f1f1f;
		margin-bottom: 1rem;
	}

	.food-list-block ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		color: #3f3f3f;
	}

	.food-list-block strong {
		color: #1f1f1f;
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

	:global(.attractions-item-card) {
		display: flex !important;
		flex-direction: column !important;
		background: #d1d4da !important;
		border-radius: 84px !important;
		overflow: hidden !important;
		text-decoration: none !important;
		color: inherit !important;
		transition: box-shadow 0.25s ease, transform 0.25s ease !important;
		position: relative !important;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6) !important;
		border: none !important;
		aspect-ratio: 1 / 1 !important;
		box-sizing: border-box !important;
		padding: 12px !important;
		gap: 12px !important;
	}

	:global(.attractions-item-card:hover) {
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12) !important;
		transform: translateY(-4px) !important;
	}

	:global(.attractions-item-card .card-image-wrapper) {
		position: relative !important;
		width: 100% !important;
		aspect-ratio: 16 / 9 !important;
		flex: 0 0 45% !important;
		min-height: 0 !important;
		overflow: hidden !important;
		background-color: #c6c9cf !important;
		border-radius: 66px !important;
	}

	:global(.attractions-item-card .card-image) {
		position: absolute !important;
		inset: 0 !important;
		width: 100% !important;
		height: 100% !important;
		background-size: cover !important;
		background-position: center !important;
		transition: transform 0.3s ease !important;
		filter: none !important;
		border-radius: 66px !important;
	}

	:global(.attractions-item-card:hover .card-image) {
		transform: scale(1.03) !important;
	}

	:global(.attractions-item-card .tier-badge) {
		position: absolute !important;
		bottom: 1rem !important;
		right: 1rem !important;
		background: rgba(0, 0, 0, 0.75) !important;
		backdrop-filter: blur(8px) !important;
		color: #fff !important;
		padding: 0.75rem 1.2rem !important;
		font-size: 1.95rem !important;
		font-weight: 700 !important;
		z-index: 10 !important;
		text-transform: uppercase !important;
		letter-spacing: 0.03em !important;
		display: flex !important;
		gap: 0.35rem !important;
		align-items: center !important;
		border-radius: 18px !important;
	}

	:global(.tier-badge.tier-1) {
		background: linear-gradient(135deg, #2563eb, #3b82f6) !important;
		box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4) !important;
	}

	:global(.tier-badge.tier-2) {
		background: linear-gradient(135deg, #10b981, #34d399) !important;
		box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4) !important;
	}

	:global(.tier-badge.tier-3) {
		background: linear-gradient(135deg, #f59e0b, #fbbf24) !important;
		box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4) !important;
	}

	:global(.attractions-item-content) {
		display: flex !important;
		flex-direction: column !important;
		align-items: flex-start !important;
		text-align: left !important;
		flex: 1 1 auto !important;
		padding: 0 0.7cm !important;
		gap: 6px !important;
		min-height: 0 !important;
		justify-content: flex-start !important;
	}

	:global(.attractions-item-content .item-title) {
		font-family: 'Segoe UI', 'Inter', sans-serif !important;
		font-size: 1.25rem !important;
		font-weight: 600 !important;
		color: #1f1f1f !important;
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
		color: #000000 !important;
	}

	:global(.attractions-item-content .item-description) {
		font-family: 'Segoe UI', 'Inter', sans-serif !important;
		font-size: 1rem !important;
		line-height: 1.4 !important;
		color: #3f3f3f !important;
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
		color: #1a1a1a !important;
		text-transform: none !important;
		letter-spacing: 0 !important;
		margin-top: 0 !important;
		display: inline-flex !important;
		align-items: center !important;
		justify-content: center !important;
		gap: 8px !important;
		padding: 10px 16px !important;
		background: #f6f6f6 !important;
		border: 2px solid #c7cbd2 !important;
		border-radius: 999px !important;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7) !important;
		transition: all 0.2s ease !important;
		width: 300px !important;
		align-self: center !important;
		transform: translateY(-0.7cm) !important;
	}

	:global(.attractions-item-card:hover .read-more) {
		background: #f5f5f5 !important;
		border-color: #9ca0a8 !important;
	}

	@media (max-width: 900px) {
		:global(.attractions-items-list) {
			grid-template-columns: repeat(2, 1fr) !important;
			gap: 1rem !important;
		}
	}

	@media (max-width: 600px) {
		:global(.attractions-items-list) {
			grid-template-columns: repeat(2, 1fr) !important;
			gap: 0.75rem !important;
		}

		:global(.attractions-item-card .card-image-wrapper) {
			margin: 8px !important;
		}

		:global(.attractions-item-content) {
			padding: 0 !important;
			gap: 4px !important;
		}

		:global(.attractions-item-content .item-title) {
			font-size: 0.8rem !important;
		}

		:global(.attractions-item-content .item-description) {
			font-size: 0.7rem !important;
			-webkit-line-clamp: 1 !important;
			line-clamp: 1 !important;
		}

		:global(.attractions-item-card .read-more) {
			font-size: 0.7rem !important;
			padding: 5px 10px !important;
		}
	}
</style>
