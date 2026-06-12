<script>
	import { browser } from '$app/environment';
	import { getCloudinaryUrl } from '$lib/utils/cloudinary';
	import { processContent } from '$lib/utils/markdown';
	import Comments from '$components/features/content/Comments.svelte';
	import AsideToc from '$components/layout/navigation/AsideToc.svelte';

	export let data;

	const { page, sections = [] } = data;

	const defaultPage = {
		seo: { title: 'Traditions, Customs & Social Life | Culture | VeryNice', description: 'Discover Kazakh hospitality, ceremonies, and social customs.' },
		mainTitle: 'Traditions, Customs & Social Life',
		headerDescription: 'Kazakh social customs revolve around hospitality, respect for elders, and community bonds — values essential for survival on the steppe.',
		heroKicker: 'Living Traditions',
		location: 'Kazakhstan',
		breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Culture', href: '/culture' }, { label: 'Traditions & Customs' }],
		headerBackgroundPublicId: 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-02'
	};

	const sectionCodes = { konakasy: 'Konak', 'besikke-salu': 'Besik', 'tusau-keser': 'Tusau', betashar: 'Betashar', 'respect-elders': 'Elders' };

	let pageData = { ...defaultPage, ...(page ?? {}) };
	$: breadcrumbs = pageData.breadcrumbs || defaultPage.breadcrumbs;
	$: tocSections = (sections || []).map((item) => ({ id: item.id, title: item.title }));

	let windowWidth = 1200;

	function scrollToSection(event, sectionId) {
		event.preventDefault();
		if (!browser) return;
		const element = document.getElementById(sectionId);
		if (!element) return;
		element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		history.pushState(null, '', `#${sectionId}`);
	}
</script>

<svelte:window bind:innerWidth={windowWidth} />
<AsideToc articles={tocSections} />

<svelte:head>
	<title>{pageData?.seo?.title || 'Kazakh Traditions & Customs | VeryNice'}</title>
	<meta name="description" content={pageData?.seo?.description || 'Discover Kazakh hospitality rituals, Nauryz celebrations, wedding ceremonies, and the social customs that bind nomadic communities.'} />
	<link rel="canonical" href="https://verynice.kz/culture/traditions-customs" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://verynice.kz/culture/traditions-customs" />
	<meta property="og:title" content={pageData?.seo?.title || 'Kazakh Traditions & Customs | VeryNice'} />
	<meta property="og:description" content={pageData?.seo?.description || 'Discover Kazakh hospitality rituals, Nauryz celebrations, wedding ceremonies, and the social customs that bind nomadic communities.'} />
	<meta property="og:image" content="https://verynice.kz/assets/og-cover.jpg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageData?.seo?.title || 'Kazakh Traditions & Customs | VeryNice'} />
	<meta name="twitter:description" content={pageData?.seo?.description || 'Discover Kazakh hospitality rituals, Nauryz celebrations, wedding ceremonies, and the social customs that bind nomadic communities.'} />
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
				{#if pageData.heroKicker}<span class="hero-kicker">{pageData.heroKicker}</span>{/if}
				<h1 itemprop="headline">{pageData.mainTitle}</h1>
				<p class="section-description" itemprop="description">{pageData.headerDescription}</p>
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
	{#if pageData.headerBackgroundPublicId}
		<div class="header-background" role="img" aria-label="Kazakh traditions background" style={`--hero-bg-url: url("${getCloudinaryUrl(pageData.headerBackgroundPublicId, { width: 2200, height: 2000, crop: 'fill', gravity: 'center', quality: 'auto:good', fetch_format: 'auto' })}")`}>
			<div class="background-image"></div>
		</div>
	{/if}
</section>
</div>

<div class="timeline-container">
	<div style="max-width: 1260px; margin: 0 auto; padding: 2rem min(2rem, 4vw); position: relative;">
		<section class="intro">
			<p>Kazakh social customs revolve around <strong>hospitality, respect for elders, and community bonds</strong> — values essential for survival on the steppe.</p>
		</section>

		{#if sections && sections.length}

			{#each sections as section (section.id)}
				<section class="category-section" id={section.id}>
					<header class="category-header">
						<span class="category-icon">{sectionCodes[section.id] || 'Trad'}</span>
						<h2 class="category-title">{section.title}</h2>
						{#if section.description}<p class="category-description">{section.description}</p>{/if}
					</header>
					{#if section.imagePublicId}
						<div class="category-image-wrapper">
							<img src={getCloudinaryUrl(section.imagePublicId, { width: 1200, height: 600, crop: 'fill', gravity: 'auto', quality: 'auto:good', fetch_format: 'auto' })} alt={section.title} class="category-image" loading="lazy" />
						</div>
					{/if}
					{#if section.contentMarkdown}
						<div class="category-content prose">{@html processContent(section.contentMarkdown, 'markdown')}</div>
					{/if}
				</section>
			{/each}
		{/if}

		<section class="themed-content-block">
			<Comments postId="cultureTraditionsCustoms" />
		</section>
	</div>
</div>

{#if windowWidth <= 1023}
	<nav class="mobile-bottom-nav-local" aria-label="Mobile navigation">
		<a href="/" aria-label="Home"><i class="fa fa-home" aria-hidden="true"></i></a>
	</nav>
{/if}

<style>
	.hero-kicker { display: block; font-family: 'Outfit', sans-serif; text-transform: uppercase; letter-spacing: 0.3em; color: var(--vnk-accent-color); font-weight: 700; font-size: 0.9rem; margin-bottom: 1.5rem; }
	.intro { max-width: 100%; margin: 0 auto 3rem; text-align: center; font-size: 1.15rem; line-height: 1.9; color: #000000; background: rgba(255, 255, 255, 0.95); padding: 2.5rem; border-radius: 12px; border: 1px solid rgba(0, 0, 0, 0.1); }
	.intro strong { color: #000000; font-weight: 700; }
	.category-nav { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; margin-bottom: 3rem; padding: 1rem; background: linear-gradient(135deg, rgba(5, 115, 179, 0.1), rgba(3, 80, 130, 0.15)); border-radius: 12px; border: 1px solid rgba(5, 115, 179, 0.2); }
	.category-nav-link { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; background: linear-gradient(135deg, rgba(5, 115, 179, 0.15), rgba(3, 80, 130, 0.2)); border: 1px solid rgba(5, 115, 179, 0.3); border-radius: 8px; color: #000000; text-decoration: none; transition: all 0.2s ease; font-size: 0.9rem; }
	.category-nav-link:hover { background: linear-gradient(135deg, rgba(5, 115, 179, 0.25), rgba(3, 80, 130, 0.3)); border-color: rgba(5, 115, 179, 0.5); transform: translateY(-2px); }
	.nav-icon { font-weight: 600; font-size: 0.75rem; letter-spacing: 0.05em; text-transform: uppercase; color: #000000; background: #ffffff; padding: 0.35rem 0.75rem; border-radius: 999px; border: 1px solid rgba(5, 115, 179, 0.3); box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
	.category-section { margin-bottom: 4rem; padding: 2.5rem; background: rgba(255, 255, 255, 0.95); border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 16px; width: 100%; }
	.category-header { text-align: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(0, 0, 0, 0.1); }
	.category-icon { display: inline-flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.85rem; letter-spacing: 0.08em; text-transform: uppercase; color: #ffffff; background: linear-gradient(135deg, rgba(5, 115, 179, 0.9), rgba(3, 80, 130, 0.95)); padding: 0.6rem 1.25rem; border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.3); box-shadow: 0 4px 15px rgba(5, 115, 179, 0.3); margin-bottom: 1rem; }
	.category-title { font-size: 2rem; color: #000000; margin-bottom: 1rem; font-weight: 700; }
	.category-description { color: rgba(0, 0, 0, 0.7); font-size: 1rem; margin: 0 auto; }
	.category-image-wrapper { margin: 2rem 0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); width: 100%; }
	.category-image { width: 100%; height: auto; display: block; }	.category-content { width: 100%; max-width: 100%; text-align: left; margin: 0; padding: 0; box-sizing: border-box; }
	.category-content :global(*) { max-width: 100%; box-sizing: border-box; }
	.category-content :global(h3) { color: #000000; font-size: 1.5rem; margin-top: 2rem; margin-bottom: 1rem; font-weight: 700; }
	.category-content :global(p) { margin-bottom: 1.25rem; line-height: 1.9; color: rgba(0, 0, 0, 0.85); font-size: 1.05rem; }
	.category-content :global(strong) { color: rgba(5, 115, 179, 0.9); font-weight: 600; }
	.category-content :global(ul) { list-style: none; padding-left: 0; margin: 1rem 0; }
	.category-content :global(ul li) { position: relative; padding-left: 1.5rem; margin-bottom: 0.75rem; line-height: 1.7; color: rgba(0, 0, 0, 0.85); }
	.category-content :global(ul li::before) { content: ''; position: absolute; left: 0; top: 0.6rem; width: 8px; height: 8px; background: rgba(5, 115, 179, 0.8); border-radius: 50%; }
	@media (max-width: 768px) { .category-nav { gap: 0.5rem; } .category-nav-link { padding: 0.5rem 0.75rem; font-size: 0.8rem; } .category-section { padding: 1.5rem; } .category-title { font-size: 1.5rem; } }

	:global(.category-content.prose) { max-width: none !important; }
</style>
