<script>
	import { browser } from '$app/environment';
	import { getCloudinaryUrl } from '$lib/utils/cloudinary';
	import Comments from '$components/features/content/Comments.svelte';
	import AsideToc from '$components/layout/navigation/AsideToc.svelte';

	export let data;

	const { page, categories = [], dishes = [] } = data;

	const defaultPage = {
		seo: {
			title: 'International Tastes | VeryNice',
			description: 'Explore the international flavors found across Kazakhstan.'
		},
		mainTitle: 'International Tastes of Kazakhstan',
		headerDescription:
			'From East Asian noodles to Mediterranean mezze, discover the global flavors that define the modern Kazakh dining scene.',
		heroKicker: 'World of Flavors',
		location: 'Kazakhstan',
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Food & Drinks', href: '/food-drink' },
			{ label: 'International Tastes' }
		],
		headerBackgroundPublicId: 'content/pages/destinations/Astana_Nearby/baiterek-tower/baiterek-tower-01'
	};

	let pageData = { ...defaultPage, ...(page ?? {}) };
	$: heroPublicId = defaultPage.headerBackgroundPublicId;
	$: heroBackgroundUrl = getCloudinaryUrl(heroPublicId, {
		width: 2200,
		height: 1200,
		crop: 'fill',
		gravity: 'auto',
		quality: 'auto:good',
		fetch_format: 'auto'
	});

	$: breadcrumbs = pageData.breadcrumbs || defaultPage.breadcrumbs;

	// Group dishes by category
	$: dishesByCategory =
		categories?.reduce((acc, cat) => {
			acc[cat.id] = dishes?.filter((d) => d.category === cat.id) || [];
			return acc;
		}, {}) || {};

	// Category icons
	const categoryIcons = {
		japan: '🇯🇵',
		korea: '🇰🇷',
		china: '🇨🇳',
		thailand: '🇹🇭',
		taiwan: '🇹🇼',
		italy: '🇮🇹',
		france: '🇫🇷',
		usa: '🇺🇸',
		mexico: '🇲🇽',
		'middle-east': '🇹🇷',
		'central-asia': '🌏',
		'eastern-europe': '🇵🇱',
		caucasus: '🇬🇪',
		mediterranean: '🇬🇷'
	};

	// Smooth scroll navigation
	function scrollToCategory(event, categoryId) {
		event.preventDefault();
		if (browser) {
			const element = document.getElementById(categoryId);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth', block: 'start' });
				// Update URL without triggering navigation
				history.pushState(null, '', `#${categoryId}`);
			}
		}
	}

	let windowWidth = 1200;
</script>

<svelte:window bind:innerWidth={windowWidth} />

<AsideToc articles={categories} />

<svelte:head>
	<title>{pageData?.seo?.title || 'International Tastes in Kazakhstan | VeryNice'}</title>
	<meta name="description" content={pageData?.seo?.description || 'Explore the diverse international flavors found across Kazakhstan — from Russian dumplings to Uighur cuisine and modern fusion dining in Almaty.'} />
	<link rel="canonical" href="https://verynice.kz/food-drink/international-tastes" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://verynice.kz/food-drink/international-tastes" />
	<meta property="og:title" content={pageData?.seo?.title || 'International Tastes in Kazakhstan | VeryNice'} />
	<meta property="og:description" content={pageData?.seo?.description || 'Explore the diverse international flavors found across Kazakhstan — from Russian dumplings to Uighur cuisine and modern fusion dining in Almaty.'} />
	<meta property="og:image" content="https://verynice.kz/assets/og-cover.jpg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageData?.seo?.title || 'International Tastes in Kazakhstan | VeryNice'} />
	<meta name="twitter:description" content={pageData?.seo?.description || 'Explore the diverse international flavors found across Kazakhstan — from Russian dumplings to Uighur cuisine and modern fusion dining in Almaty.'} />
</svelte:head>

<div class="attractions-page">
<section id="page-hero-section" class="section">
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
				</div>
			</div>
		</div>
	</div>
	<div
		class="header-background"
		role="img"
		aria-label="International tastes background"
		style={`--hero-bg-url: url(${heroBackgroundUrl})`}
	>
		<div class="background-image" style={`background-image: url(${heroBackgroundUrl})`}></div>
	</div>
</section>
</div>

<div class="timeline-container">
	<div style="max-width: 1400px; margin: 0 auto; padding: 2rem min(2rem, 4vw); position: relative;">
		<!-- Intro text -->
		<section class="dishes-intro">
			<p>
				Kazakhstan's dining scene is a vibrant mix of <strong>global flavors</strong> and
				<strong>local favorites</strong>. From sushi bars to Middle Eastern grills, the country offers
				an ever-growing international culinary landscape.
			</p>
		</section>

		<!-- Dishes by Category -->
		{#each categories as category (category.id)}
			{@const categoryDishes = dishesByCategory[category.id] || []}
			{#if categoryDishes.length > 0}
				<section class="category-section" id={category.id}>
					<header class="category-header">
						<span class="category-icon">{categoryIcons[category.id] || '🍽️'}</span>
						<div class="category-header-text">
							<h2>{category.title}</h2>
							{#if category.description}
								<p>{category.description}</p>
							{/if}
						</div>
					</header>

					<div class="dishes-list">
						{#each categoryDishes as dish, index (dish.id)}
							<article class="dish-article" id={dish.id}>
								<div class="dish-article-image">
									{#if dish.publicId}
										<div
											class="dish-image"
											role="img"
											aria-label={dish.title}
											style={`background-image: url("${getCloudinaryUrl(dish.publicId, {
												width: 800,
												height: 600,
												crop: 'fill',
												gravity: 'auto',
												quality: 'auto:good',
												fetch_format: 'auto'
											})}")`}
										></div>
									{:else}
										<div class="image-placeholder" role="img" aria-label={dish.title}>
											<span class="placeholder-text">{dish.kazakh || dish.title}</span>
											<span class="placeholder-icon">{categoryIcons[category.id] || '🍽️'}</span>
										</div>
									{/if}
								</div>
								<div class="dish-article-content">
									<div class="dish-header">
										{#if dish.tier}
											<span class="dish-tier tier-{dish.tier}">#{dish.tier} Must-Try</span>
										{/if}
										<h3>
											{dish.title}
											{#if dish.kazakh}
												<span class="kazakh-name">({dish.kazakh})</span>
											{/if}
										</h3>
										{#if dish.region && dish.region !== 'Nationwide'}
											<span class="dish-region-tag">{dish.region}</span>
										{/if}
									</div>
									<div class="dish-body">
										<p class="dish-description">{dish.longDescription || dish.description}</p>
										{#if dish.ingredients && dish.ingredients.length}
											<div class="dish-meta">
												<strong>Key Ingredients:</strong>
												<span>{dish.ingredients.join(', ')}</span>
											</div>
										{/if}
										{#if dish.servingStyle}
											<div class="dish-meta">
												<strong>How It's Served:</strong>
												<span>{dish.servingStyle}</span>
											</div>
										{/if}
									</div>
								</div>
							</article>
						{/each}
					</div>
				</section>
			{/if}
		{/each}

		<!-- Comments -->
		<section class="themed-content-block" style="margin-top: 3rem;">
			<Comments postId="internationalTastes" />
		</section>
	</div>
</div>

{#if windowWidth <= 1023}
	<nav class="mobile-bottom-nav-local" aria-label="Mobile navigation">
		<a href="/" aria-label="Home"><i class="fa fa-home" aria-hidden="true"></i></a>
	</nav>
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

	/* Intro Section */
	.dishes-intro {
		max-width: 800px;
		margin: 0 auto 2rem;
		text-align: center;
		padding: 1.5rem 2rem;
		background: #fff;
		border-radius: 16px;
	}

	.dishes-intro p {
		font-family: 'Inter', sans-serif;
		font-size: 1.15rem;
		line-height: 1.8;
		color: #1a1a1a;
		margin: 0;
	}

	.dishes-intro strong {
		color: #000;
		font-weight: 600;
	}

	.dishes-intro em {
		color: var(--vnk-accent-color);
		font-style: italic;
	}

	/* Category Navigation */
	/* Category Section */
	.category-section {
		margin-bottom: 4rem;
		scroll-margin-top: 100px;
		background: #fff !important;
	}

	.category-header {
		display: flex;
		align-items: flex-start;
		gap: 1.25rem;
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 2px solid rgba(0, 0, 0, 0.1);
		background: #fff !important;
	}

	.category-icon {
		font-size: 2.5rem;
		line-height: 1;
	}

	.category-header-text h2 {
		font-family: 'Outfit', sans-serif;
		font-size: 1.8rem;
		font-weight: 700;
		color: #000;
		margin: 0 0 0.5rem;
	}

	.category-header-text p {
		font-family: 'Inter', sans-serif;
		font-size: 1rem;
		color: rgba(var(--vnk-text-secondary-color-rgb), 0.66);
		margin: 0;
		line-height: 1.5;
	}

	/* Dishes List */
	.dishes-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* Individual Dish Article */
	.dish-article {
		display: grid;
		grid-template-columns: 1fr 1fr; /* 50% Image, 50% Text */
		gap: 0;
		background: var(--vnk-card-bg);
		border-radius: 24px;
		overflow: hidden;
		box-shadow:
			0 4px 20px rgba(0, 0, 0, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.6);
	}

	/* Chess-like alternating layout: even items have image on right */
	.dish-article:nth-child(even) {
		grid-template-columns: 1fr 1fr;
	}

	.dish-article:nth-child(even) .dish-article-image {
		order: 2;
	}

	.dish-article:nth-child(even) .dish-article-content {
		order: 1;
	}

	/* Image Placeholder */
	.dish-article-image {
		position: relative;
		min-height: 300px;
		overflow: hidden;
		z-index: 1;
	}

	/* Diagonal clip — odd: image left, slant on right; even: image right, slant on left */
	.dish-article:nth-child(odd) .dish-article-image {
		clip-path: polygon(0 0, calc(100% - 80px) 0, 100% 100%, 0 100%);
	}

	.dish-article:nth-child(even) .dish-article-image {
		clip-path: polygon(80px 0, 100% 0, 100% 100%, 0 100%);
	}

	.dish-image {
		position: absolute;
		inset: 0;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		transition: transform 0.3s ease;
		z-index: 1;
	}

	.dish-article:hover .dish-image {
		transform: scale(1.05);
	}

	.image-placeholder {
		position: absolute;
		inset: 0;
		background: linear-gradient(145deg, rgba(255, 255, 255, 0.88) 0%, rgba(242, 132, 137, 0.42) 100%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem;
		z-index: 1;
	}

	.placeholder-text {
		font-family: 'Outfit', sans-serif;
		font-size: 0.85rem;
		font-weight: 600;
		color: rgba(var(--vnk-text-secondary-color-rgb), 0.72);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-align: center;
	}

	.placeholder-icon {
		font-size: 2rem;
		opacity: 0.6;
	}

	/* Article Content */
	.dish-article-content {
		padding: 1.5rem 2rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		justify-content: center; /* Vertically align text */
	}

	.dish-header {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.dish-tier {
		display: inline-block;
		width: fit-content;
		font-family: 'Inter', sans-serif;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		padding: 4px 10px;
		border-radius: 12px;
		color: #fff;
	}

	.dish-tier.tier-1 {
		background: linear-gradient(135deg, var(--vnk-primary-color), rgb(126, 197, 179));
	}

	.dish-tier.tier-2 {
		background: linear-gradient(135deg, rgb(2, 114, 112), var(--vnk-primary-color));
	}

	.dish-tier.tier-3 {
		background: linear-gradient(135deg, var(--vnk-accent-color), rgb(255, 173, 177));
	}

	.dish-article-content h3 {
		font-family: 'Outfit', sans-serif;
		font-size: 1.35rem;
		font-weight: 700;
		color: var(--vnk-text-secondary-color);
		margin: 0;
		line-height: 1.3;
	}

	.kazakh-name {
		font-weight: 400;
		color: rgba(var(--vnk-text-secondary-color-rgb), 0.78);
		font-size: 1rem;
	}

	.dish-region-tag {
		display: inline-block;
		width: fit-content;
		font-family: 'Inter', sans-serif;
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #fff;
		background: var(--vnk-accent-color);
		padding: 4px 10px;
		border-radius: 12px;
	}

	.dish-body {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.dish-description {
		font-family: 'Inter', sans-serif;
		font-size: 0.95rem;
		line-height: 1.6;
		color: rgba(var(--vnk-text-secondary-color-rgb), 0.88);
		margin: 0;
	}

	.dish-meta {
		font-family: 'Inter', sans-serif;
		font-size: 0.85rem;
		color: rgba(var(--vnk-text-secondary-color-rgb), 0.78);
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.dish-meta strong {
		color: var(--vnk-text-secondary-color);
		font-weight: 600;
	}

	/* Responsive */
	@media (max-width: 900px) {
		.category-header {
			gap: 1rem;
		}

		.category-header-text h2 {
			font-size: 1.5rem;
		}

		.dish-article {
			grid-template-columns: 2fr 3fr;
		}

		/* Maintain chess pattern on tablets */
		.dish-article:nth-child(even) {
			grid-template-columns: 3fr 2fr;
		}

		.dish-article-image {
			min-height: 180px;
		}

		.dish-article-content {
			padding: 1.25rem 1.5rem;
		}

		.dish-article-content h3 {
			font-size: 1.15rem;
		}
	}

	@media (max-width: 600px) {
		.dishes-intro p {
			font-size: 1rem;
		}

		.category-icon {
			font-size: 2rem;
		}

		.category-header-text h2 {
			font-size: 1.3rem;
		}

		.dish-article {
			grid-template-columns: 1fr;
		}

		/* Reset chess pattern on mobile - all images on top */
		.dish-article:nth-child(even) {
			grid-template-columns: 1fr;
		}

		.dish-article:nth-child(even) .dish-article-image,
		.dish-article:nth-child(even) .dish-article-content {
			order: unset;
		}

		.dish-article-image {
			min-height: 160px;
		}

		.dish-article:nth-child(odd) .dish-article-image,
		.dish-article:nth-child(even) .dish-article-image {
			clip-path: none;
		}

		.dish-article-content {
			padding: 1.25rem;
		}

		.dish-article-content h3 {
			font-size: 1.1rem;
		}

		.kazakh-name {
			display: block;
			font-size: 0.9rem;
		}

		.dish-description {
			font-size: 0.9rem;
		}
	}
</style>
