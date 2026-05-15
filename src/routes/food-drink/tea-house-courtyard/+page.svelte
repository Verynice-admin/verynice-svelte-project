<script>
	import { browser } from '$app/environment';
	import { getCloudinaryUrl } from '$lib/utils/cloudinary';
	import { processContent } from '$lib/utils/markdown';
	import Comments from '$components/features/content/Comments.svelte';
	import AsideToc from '$components/layout/navigation/AsideToc.svelte';

	export let data;
	const { page, sections = [] } = data;
	let pageData = page ?? {};

	const sectionIcons = {
		'tea-quick-guide':          '🍵',
		'pouring-etiquette':        '🫖',
		'table-companions':         '🍽️',
		'conversation-rhythm':      '🫖',
		'who-pours-and-serves':     '🍵',
		'regional-tea-preferences': '🌿',
		'traveler-etiquette':       '🫗'
	};
	$: breadcrumbs = pageData.breadcrumbs || [];
	$: tocSections = (sections || []).map((x) => ({ id: x.id, title: x.title }));
	let windowWidth = 1200;

	function scrollToSection(event, id) {
		event.preventDefault();
		if (!browser) return;
		const el = document.getElementById(id);
		if (!el) return;
		el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		history.pushState(null, '', `#${id}`);
	}
</script>

<svelte:window bind:innerWidth={windowWidth} />
<AsideToc articles={tocSections} />

<svelte:head>
	<title>{pageData?.seo?.title || 'Tea House Courtyard | VeryNice'}</title>
	<meta name="description" content={pageData?.seo?.description || 'Step into Kazakhstan\'s chaikhana culture — the tea house courtyard where hospitality, storytelling, and pot-brewed black tea define the social heart of Central Asia.'} />
	<link rel="canonical" href="https://verynice.kz/food-drink/tea-house-courtyard" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://verynice.kz/food-drink/tea-house-courtyard" />
	<meta property="og:title" content={pageData?.seo?.title || 'Tea House Courtyard | VeryNice'} />
	<meta property="og:description" content={pageData?.seo?.description || 'Step into Kazakhstan\'s chaikhana culture — the tea house courtyard where hospitality, storytelling, and pot-brewed black tea define the social heart of Central Asia.'} />
	<meta property="og:image" content="https://verynice.kz/assets/og-cover.jpg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageData?.seo?.title || 'Tea House Courtyard | VeryNice'} />
	<meta name="twitter:description" content={pageData?.seo?.description || 'Step into Kazakhstan\'s chaikhana culture — the tea house courtyard where hospitality, storytelling, and pot-brewed black tea define the social heart of Central Asia.'} />
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
		<div
			class="header-background"
			role="img"
			aria-label="Tea house courtyard background"
			style={`--hero-bg-url: url("${getCloudinaryUrl(pageData.headerBackgroundPublicId, { width: 2200, height: 1600, crop: 'fill', gravity: 'north', quality: 'auto:good', fetch_format: 'auto' })}")`}
		><div class="background-image"></div></div>
	{/if}
</section>
</div>

<div class="timeline-container">
	<div style="max-width: 1400px; margin: 0 auto; padding: 2rem min(2rem, 4vw); position: relative;">
		<section class="dishes-intro">
			<p>Tea in Kazakhstan is a social ritual: small pours, frequent refills, dried fruits, sweets, and long conversation around the dastarkhan.</p>
		</section>
		<nav class="category-nav" aria-label="Jump to section">
			{#each sections as section (section.id)}
				<a href="#{section.id}" class="category-nav-link" on:click={(e) => scrollToSection(e, section.id)}>
					<span class="nav-icon">{sectionIcons[section.id] || '🍵'}</span><span class="nav-text">{section.title}</span>
				</a>
			{/each}
		</nav>
		{#each sections as section (section.id)}
			<section class="category-section" id={section.id}>
				<div class="dishes-list">
					<article class="dish-article">
						<div class="dish-article-image">
							{#if section.imagePublicId}
								<div class="dish-image" role="img" aria-label={section.title} style={`background-image: url("${getCloudinaryUrl(section.imagePublicId, { width: 1000, height: 760, crop: 'fill', gravity: 'auto', quality: 'auto:good', fetch_format: 'auto' })}")`}></div>
							{:else}
								<div class="image-placeholder" role="img" aria-label={section.title}><span class="placeholder-text">{section.title}</span><span class="placeholder-icon">{sectionIcons[section.id] || '🍵'}</span></div>
							{/if}
						</div>
						<div class="dish-article-content">
							<div class="dish-header"><span class="dish-tier tier-1">Tea House Courtyard</span><h3>{section.title}</h3></div>
							{#if section.description}
								<p class="dish-summary">{section.description}</p>
							{/if}
							<div class="dish-body ritual-prose">{@html processContent(section.contentMarkdown || section.contentHTML, 'auto')}</div>
						</div>
					</article>
				</div>
			</section>
		{/each}
		<section class="themed-content-block" style="margin-top: 3rem;"><Comments postId="teaHouseCourtyard" /></section>
	</div>
</div>

{#if windowWidth <= 1023}
	<nav class="mobile-bottom-nav-local" aria-label="Mobile navigation"><a href="/" aria-label="Home"><i class="fa fa-home" aria-hidden="true"></i></a></nav>
{/if}

<style>
	.hero-kicker { display:block; font-family:'Outfit',sans-serif; text-transform:uppercase; letter-spacing:.3em; color:var(--vnk-accent-color); font-weight:700; font-size:.9rem; margin-bottom:1.5rem; }
	.dishes-intro { max-width:800px; margin:0 auto 2rem; text-align:center; }
	.dishes-intro p { font-family:'Inter',sans-serif; font-size:1.15rem; line-height:1.8; color:rgba(255, 255, 255, 0.82); margin:0; }
	.category-nav { display:flex; flex-wrap:wrap; justify-content:center; gap:.75rem; margin-bottom:3rem; padding:1.5rem; background:rgba(255,255,255,.05); border-radius:24px; }
	.category-nav-link { display:flex; align-items:center; gap:.5rem; padding:.6rem 1.2rem; background:var(--vnk-text-secondary-color); border-radius:20px; text-decoration:none; color:#fff; font-family:'Inter',sans-serif; font-size:.85rem; font-weight:500; transition:all .2s ease; box-shadow:0 2px 6px rgba(0,0,0,.1); }
	.category-nav-link:hover { background:var(--vnk-primary-color); transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,0,0,.15); }
	.category-nav-link .nav-icon { font-size:1.4rem !important; width:52px !important; height:52px !important; min-width:52px !important; }
	.category-nav-link .nav-text { display:flex !important; justify-content:center !important; align-items:center !important; color:#0f172a !important; font-size:0.875rem !important; }
	.category-section { margin-bottom:2.25rem; scroll-margin-top:110px; }
	.dishes-list { display:flex; flex-direction:column; gap:1.5rem; }
	.dish-article { display:grid; grid-template-columns:1.2fr .8fr; gap:0; background:var(--vnk-card-bg); border-radius:24px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,.1), inset 0 1px 0 rgba(255,255,255,.6); }
	.dish-article:nth-child(even) .dish-article-image { order:2; }
	.dish-article:nth-child(even) .dish-article-content { order:1; }
	.dish-article-image { position:relative; min-height:360px; overflow:hidden; z-index:1; }
	.dish-article-image::after { content:''; position:absolute; top:0; bottom:0; width:300px; background:var(--vnk-card-bg); z-index:10; pointer-events:none; }
	.dish-article:nth-child(odd) .dish-article-image::after { right:-120px; transform:skewX(-20deg); }
	.dish-article:nth-child(even) .dish-article-image::after { left:-120px; transform:skewX(20deg); }
	.dish-image { position:absolute; inset:0; background-size:cover; background-position:center; background-repeat:no-repeat; transition:transform .3s ease; }
	.dish-article:hover .dish-image { transform:scale(1.05); }
	.dish-article-content { padding:1.3rem 1.7rem; display:flex; flex-direction:column; gap:.6rem; justify-content:center; }
	.dish-header { display:flex; flex-direction:column; gap:.5rem; }
	.dish-tier { display:inline-block; width:fit-content; font-family:'Inter',sans-serif; font-size:.7rem; font-weight:600; text-transform:uppercase; letter-spacing:.1em; padding:4px 10px; border-radius:12px; color:#fff; }
	.dish-tier.tier-1 { background:linear-gradient(135deg,var(--vnk-primary-color),rgb(126, 197, 179)); }
	.dish-article-content h3 { font-family:'Outfit',sans-serif; font-size:1.35rem; font-weight:700; color:var(--vnk-text-secondary-color); margin:0; line-height:1.3; }
	.dish-summary { margin:0; font-family:'Inter',sans-serif; font-size:.95rem; line-height:1.5; color:rgba(var(--vnk-text-secondary-color-rgb), 0.86); font-weight:500; }
	.ritual-prose :global(p) { font-family:'Inter',sans-serif; font-size:.95rem; line-height:1.6; color:rgba(var(--vnk-text-secondary-color-rgb), 0.88); margin:0 0 .8rem; }
	.ritual-prose :global(p:last-child) { margin-bottom:0; }
	.ritual-prose :global(strong) { color:var(--vnk-text-secondary-color); font-weight:600; }
	.ritual-prose :global(ul), .ritual-prose :global(ol), .ritual-prose :global(li) { list-style:none; margin:0; padding:0; }
	@media (max-width: 900px) { .dish-article { grid-template-columns:1.15fr .85fr; } .dish-article-image { min-height:300px; } }
	@media (max-width: 600px) { .dish-article, .dish-article:nth-child(even) { grid-template-columns:1fr; } .dish-article:nth-child(even) .dish-article-image, .dish-article:nth-child(even) .dish-article-content { order:unset; } .dish-article-image::after { display:none; } .dish-article-image { min-height:220px; } .dish-article-content { padding:1.25rem; } }
</style>
