<script>
	import { browser } from '$app/environment';
	import { getCloudinaryUrl } from '$lib/utils/cloudinary';
	import { processContent } from '$lib/utils/markdown';
	import PhotoGallery from '$components/features/content/PhotoGallery.svelte';
	import FaqSection from '$components/features/content/FaqSection.svelte';
	import Comments from '$components/features/content/Comments.svelte';
	import AsideToc from '$components/layout/navigation/AsideToc.svelte';

	export let data;

	const { page, highlights, articles, photoGallery, faq, relatedPosts } = data;

	$: sectionIds = new Set(
		(articles || []).map((article) => article.articleId || article.id).filter(Boolean)
	);

	const normalizeKey = (value) =>
		typeof value === 'string' ? value.trim().toLowerCase() : '';

  const cardImageUrl = (item) => {
    const title = normalizeKey(item?.title);
    const byTitle = {
      'traditional clothing': 'content/pages/destinations/Almaty_nearby/central-state-museum/central-state-museum-01',
      'yurt & nomadic life': 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-01',
      'kazakh melodies': 'content/pages/destinations/Astana_Nearby/baiterek-tower/baiterek-tower-01',
      'arts & crafts': 'content/pages/destinations/Turkistan_Shymkent/khoja-ahmed-yasawi-mausoleum/khoja-ahmed-yasawi-mausoleum-01',
      'traditions & customs': 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-02',
      'mythology & folklore': 'content/pages/destinations/Almaty_nearby/charyn-canyon/charyn-canyon-01',
      'traditional games': 'content/pages/destinations/Almaty_nearby/altyn-emel-national-park/altyn-emel-national-park-01'
    };
    // First check if title has a mapping to the sub-page hero image
    const mappedImage = byTitle[title];
    const publicId = mappedImage ||
      item?.image?.publicId ||
      item?.imagePublicId ||
      item?.publicId ||
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

  // Map highlight cards to their respective sub-pages
  const highlightPageLinks = {
    'Traditional Clothing': '/culture/traditional-clothing',
    'Yurt & Nomadic Life': '/culture/yurt-nomadic-life',
    'Kazakh Melodies': '/culture/kazakh-melodies',
    'Arts & Crafts': '/culture/arts-crafts',
    'Traditions & Customs': '/culture/traditions-customs',
    'Mythology & Folklore': '/culture/mythology-folklore',
    'Traditional Games': '/culture/traditional-games'
  };

	const resolveCardHref = (title) => {
		return highlightPageLinks[title] || null;
	};

	const defaultPage = {
		seo: {
			title: 'Culture | VeryNice',
			description: 'Discover the rich traditions, customs, arts, and heritage of Kazakh culture.'
		},
		mainTitle: 'Kazakh Culture & Heritage',
		headerDescription:
			'Nomadic traditions, vibrant arts, ancient mythology, and the warm hospitality that defines the soul of Kazakhstan.',
		heroKicker: 'Experience the Heritage',
		location: 'Kazakhstan',
		articleViews: 0,
		articleLikes: 0,
		articleComments: 0,
		breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Culture' }],
		headerBackgroundPublicId: 'content/pages/destinations/Almaty_nearby/charyn-canyon/charyn-canyon-01',
		introMarkdown:
			'Kazakh culture is rooted in **centuries of nomadic tradition**, shaped by the vast steppes, harsh winters, and the deep connection between people, nature, and community.'
	};

	let pageData = { ...defaultPage, ...(page ?? {}) };

	const fallbackBreadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Culture' }];
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
	<title>{pageData?.seo?.title || 'Kazakh Culture & Heritage | VeryNice'}</title>
	<meta name="description" content={pageData?.seo?.description || 'Discover the rich traditions, arts, music, and heritage of Kazakh culture — from nomadic yurts to epic poetry.'} />
	<link rel="canonical" href="https://verynice.kz/culture" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://verynice.kz/culture" />
	<meta property="og:title" content={pageData?.seo?.title || 'Kazakh Culture & Heritage | VeryNice'} />
	<meta property="og:description" content={pageData?.seo?.description || 'Discover the rich traditions, arts, music, and heritage of Kazakh culture — from nomadic yurts to epic poetry.'} />
	<meta property="og:image" content="https://verynice.kz/assets/og-cover.jpg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageData?.seo?.title || 'Kazakh Culture & Heritage | VeryNice'} />
	<meta name="twitter:description" content={pageData?.seo?.description || 'Discover the rich traditions, arts, music, and heritage of Kazakh culture — from nomadic yurts to epic poetry.'} />
</svelte:head>

{#if pageData}
<div class="attractions-page">
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
				aria-label={pageData.headerBackgroundImageAriaLabel || 'Kazakh culture background image'}
				style={`position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; min-height: 100vh; --hero-bg-url: url("${getCloudinaryUrl(pageData.headerBackgroundPublicId, {
					width: 2200,
					height: 2000,
					crop: 'fill',
					gravity: 'center',
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
			<section class="culture-intro">
				<div class="prose">
					{@html processContent(pageData.introMarkdown || pageData.introHTML, 'auto')}
				</div>
			</section>

			{#if highlights && highlights.length}
			<section class="attractions-items-list" style="margin-top: 2rem;">
				{#each highlights as item (item.id || item.title)}
					{@const cardHref = resolveCardHref(item.title)}
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

			{#if articles && articles.length}
				{#each articles as article (article.articleId || article.id)}
					<section class="themed-content-block culture-article" id={article.articleId || article.id}>
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
					<PhotoGallery title={photoGallery.title || 'Kazakh Culture Gallery'} photos={photoGallery.photos} />
				</section>
			{/if}

			{#if faq?.items?.length}
				<section class="themed-content-block">
					<FaqSection title={faq.title || 'Kazakh Culture FAQs'} items={faq.items} />
				</section>
			{/if}

			<section class="themed-content-block">
				<Comments postId="culturePage" />
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
  /* Card styles are now global in pages.css - no need for local overrides */
  .culture-intro {
		padding: 0;
		background: transparent;
		border: none;
		box-shadow: none;
		max-width: 800px;
		margin: 0 auto 2rem;
		text-align: center;
	}

  .culture-intro :global(.prose),
  .culture-intro :global(.prose p),
  .culture-intro :global(.prose li) {
    color: #000;
    font-size: 1.15rem;
    line-height: 1.7;
  }

  .culture-intro :global(.prose strong) {
    color: #000;
    font-weight: 600;
  }

	.culture-intro :global(.prose em) {
		color: var(--vnk-accent-color);
		font-style: italic;
	}

	.culture-article :global(h2) {
		color: var(--vnk-gold-text, #d4a373);
		font-size: 1.75rem;
		margin-bottom: 1.5rem;
		padding-bottom: 0.75rem;
		border-bottom: 2px solid var(--vnk-gold-border, rgba(212, 163, 115, 0.3));
	}

	.culture-article :global(h3) {
		color: var(--vnk-gold-text, #d4a373);
		font-size: 1.25rem;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
	}

	.culture-article :global(p) {
		margin-bottom: 1rem;
		line-height: 1.8;
	}

	.culture-article :global(strong) {
		color: var(--vnk-gold-text, #d4a373);
		font-weight: 600;
	}

	.culture-article :global(ul) {
		list-style: none;
		padding-left: 0;
		margin: 1rem 0;
	}

	.culture-article :global(ul li) {
		position: relative;
		padding-left: 1.5rem;
		margin-bottom: 0.5rem;
		line-height: 1.7;
	}

	.culture-article :global(ul li::before) {
		content: '';
		position: absolute;
		left: 0;
		top: 0.6rem;
		width: 8px;
		height: 8px;
		background: var(--vnk-accent-color, #d4a373);
		border-radius: 50%;
	}

	:global(.themed-content-block) {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(212, 163, 115, 0.15);
		border-radius: 16px;
		padding: 2rem;
		margin-bottom: 2rem;
}

 	/* Card styles now global in pages.css */
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
    color: #000 !important;
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

  @media (max-width: 768px) {
    .culture-intro {
			padding: 0 0.5rem;
			margin: 0 auto 1.5rem;
		}

		.culture-intro :global(.prose p) {
			font-size: 1rem;
			line-height: 1.6;
		}

		.culture-article :global(h2) {
			font-size: 1.5rem;
			margin-bottom: 1rem;
			padding-bottom: 0.5rem;
		}

		.culture-article :global(h3) {
			font-size: 1.15rem;
			margin-top: 1rem;
			margin-bottom: 0.5rem;
		}

		.culture-article :global(p) {
			font-size: 1rem;
			line-height: 1.7;
		}

		:global(.themed-content-block) {
			padding: 1.25rem;
			margin-bottom: 1.5rem;
			border-radius: 12px;
		}
	}

  @media (max-width: 600px) {
    .culture-intro {
			margin: 0 auto 1.25rem;
		}

		.culture-intro :global(.prose p) {
			font-size: 0.95rem;
		}

		.culture-article :global(h2) {
			font-size: 1.35rem;
		}

		.culture-article :global(h3) {
			font-size: 1.1rem;
		}

		.culture-article :global(p) {
			font-size: 0.95rem;
			margin-bottom: 0.875rem;
		}

		:global(.themed-content-block) {
			padding: 1rem;
			margin-bottom: 1.25rem;
			border-radius: 10px;
		}
	}
</style>