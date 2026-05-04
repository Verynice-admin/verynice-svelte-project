<script>
	import { browser } from '$app/environment';
	import { getCloudinaryUrl } from '$lib/utils/cloudinary';
	import { processContent } from '$lib/utils/markdown';
	import Comments from '$components/features/content/Comments.svelte';
	import AsideToc from '$components/layout/navigation/AsideToc.svelte';

	export let data;

	const { page, sections = [] } = data;

	const defaultPage = {
		seo: {
			title: 'Traditional Games & Sports | Heritage | VeryNice',
			description:
				'Discover Kokpar, Audaryspak, Kyz Kuu and other ancient Kazakh games that test strength, skill, and courage.'
		},
		mainTitle: 'Traditional Games & Sports',
		headerDescription:
			'From the thrilling Kokpar to the playful Kyz Kuu — experience the ancient sports that forged the Kazakh warrior spirit and continue to captivate audiences today.',
		heroKicker: 'Warrior Traditions',
		location: 'Kazakhstan',
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Heritage', href: '/culture' },
			{ label: 'Traditional Games' }
		],
		headerBackgroundPublicId: 'content/pages/heritage/traditionalGames/baigeAlamanBaige'
	};

	const sectionCodes = {
		kokpar: 'KOKPAR',
		audaryspak: 'AUDARYSPAK',
		kyzkuu: 'KYZKUU',
		'kazakh-kures': 'KAZAKHKURES',
		togyzkumalak: 'TOGYZKUMALAK',
		'assyk-atu': 'ASHYKATU',
		'er-enish': 'ERENISH',
		altybakan: 'ALTYBAKAN',
		'bese-tas': 'BESETAS',
		'buerkuet-salu': 'BURKUTSALU',
		'arqan-tartys': 'ARQANTARTYS',
		baige: 'BAIGE',
		'tenge-alu': 'TENGEALU'
	};

	let pageData = { ...defaultPage, ...(page ?? {}) };
	$: breadcrumbs = pageData.breadcrumbs || defaultPage.breadcrumbs;

	// Group sections into 9 groups for TOC - each group links to first section in group
	const tocGroupConfig = {
		'kokpar': { id: 'kokpar', title: 'Kokpar' },
		'audaryspak': { id: 'audaryspak', title: 'Audaryspak' },
		'kyzkuu': { id: 'kyzkuu', title: 'Kyz Kuu' },
		'kazakh-kures': { id: 'kazakh-kures', title: 'Kazakh Kures' },
		'togyzkumalak': { id: 'togyzkumalak', title: 'Team Games' },
		'assyk-atu': { id: 'togyzkumalak', title: 'Team Games' },
		'er-enish': { id: 'er-enish', title: 'Strength Games' },
		'altybakan': { id: 'er-enish', title: 'Strength Games' },
		'bese-tas': { id: 'bese-tas', title: 'Dexterity Games' },
		'buerkuet-salu': { id: 'buerkuet-salu', title: 'Eagle Traditions' },
		'arqan-tartys': { id: 'buerkuet-salu', title: 'Eagle Traditions' },
		'baige': { id: 'baige', title: 'Baige' },
		'tenge-alu': { id: 'tenge-alu', title: 'Tenge Alu' }
	};

	$: tocSections = (() => {
		const groups = [];
		const seen = new Set();
		(sections || []).forEach((item) => {
			const config = tocGroupConfig[item.id] || { id: item.id, title: item.title };
			if (!seen.has(config.id)) {
				seen.add(config.id);
				groups.push({ id: config.id, title: config.title });
			}
		});
		return groups.slice(0, 9);
	})();

	let windowWidth = 1200;

	function scrollToSection(event, sectionId) {
		event.preventDefault();
		if (!browser) return;
		const element = document.getElementById(sectionId);
		if (!element) return;
		element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		history.pushState(null, '', `#${sectionId}`);
	}

	// Alternate between left and right layouts
	function isImageLeft(index) {
		return index % 2 === 0;
	}
</script>

<svelte:window bind:innerWidth={windowWidth} />
<AsideToc articles={tocSections} />

<svelte:head>
	<title>{pageData?.seo?.title || 'Traditional Games | VeryNice'}</title>
	<meta
		name="description"
		content={
			pageData?.seo?.description ||
			'Discover Kokpar, Audaryspak, Kyz Kuu and other ancient Kazakh games.'
		}
	/>
</svelte:head>

<div class="attractions-page">
<!-- Hero Section -->
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
			aria-label={pageData.headerBackgroundImageAriaLabel || 'Traditional games background image'}
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

<!-- Content Sections -->
<div class="timeline-container">
	<div style="max-width: 1260px; margin: 0 auto; padding: 2rem min(2rem, 4vw); position: relative;">
		{#if sections && sections.length}
			{#each sections as section, index}
				<section class="garment-section" id={section.id}>
					<div class="section-card {isImageLeft(index) ? 'image-left' : 'image-right'}">
						{#if section.imagePublicId}
							<div class="section-image">
								<div class="oval-frame">
									<img
										src={getCloudinaryUrl(section.imagePublicId, {
											width: 640,
											height: 640,
											crop: 'fill',
											gravity: 'auto',
											quality: 'auto:good',
											fetch_format: 'auto'
										})}
										alt={section.title}
										loading="lazy"
									/>
								</div>
								<span class="garment-number">{String(index + 1).padStart(2, '0')}</span>
							</div>
						{/if}
						<div class="section-text">
							<div class="code-block">{sectionCodes[section.id] || 'GAME'}</div>
							<h2>{section.title}</h2>
							{#if section.description}
								<p class="section-subtitle">{section.description}</p>
							{/if}
							<div class="section-content">
								{#if section.contentMarkdown}
									{@html processContent(section.contentMarkdown, 'markdown')}
								{/if}
							</div>
						</div>
					</div>
				</section>
			{/each}
		{/if}

		<section class="themed-content-block">
			<Comments postId="traditionalGames" />
		</section>
	</div>
</div>
</div>

{#if windowWidth <= 1023}
	<nav class="mobile-bottom-nav-local" aria-label="Mobile navigation">
		<a href="/" aria-label="Home"><i class="fa fa-home" aria-hidden="true"></i></a>
	</nav>
{/if}

<style>
	/* Hero Section - Uses global site styles */
	:global(#page-hero-section) {
		position: relative;
		display: flex;
		align-items: flex-end;
		padding: 0;
		overflow: hidden;
	}

	:global(.section-header) {
		position: relative;
		z-index: 2;
		width: 100%;
		padding: 2rem;
		background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);
	}

	:global(.section-header-content-row) {
		display: flex;
		align-items: flex-end;
		gap: 2rem;
		margin-top: 1rem;
	}

	:global(.section-header-text) {
		flex: 1;
		color: white;
	}

	:global(.section-header-text h1) {
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 700;
		line-height: 1.2;
		margin: 0.5rem 0;
		text-shadow: 0 2px 4px rgba(0,0,0,0.3);
	}

	:global(.hero-kicker) {
		display: block;
		font-family: 'Outfit', sans-serif;
		text-transform: uppercase;
		letter-spacing: 0.3em;
		color: var(--vnk-accent-color, rgb(5, 115, 179));
		font-weight: 600;
		font-size: 0.9rem;
	}

	:global(.section-description) {
		font-size: 1.1rem;
		line-height: 1.6;
		max-width: 600px;
		opacity: 0.95;
	}

	:global(.header-background) {
		position: absolute;
		inset: 0;
		z-index: 0;
	}

	:global(.header-background .background-image) {
		width: 100%;
		height: 100%;
		background-image: var(--hero-bg-url);
		background-size: cover;
		background-position: center;
	}

	/* Timeline Container */
	:global(.timeline-container) {
		background: var(--vnk-site-background-fallback, linear-gradient(135deg, rgb(126, 197, 179) 0%, rgb(3, 158, 155) 100%));
		min-height: 100vh;
		padding: 2rem 0;
	}

	/* Section Cards - Horizontal layout */
	.garment-section {
		margin-bottom: 3rem;
	}

	.section-card {
		display: grid;
		grid-template-columns: 448px 1fr;
		gap: 2rem;
		align-items: center;
		padding: 2rem;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 1rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		transition: transform 0.3s ease, box-shadow 0.3s ease;
	}

	.section-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
	}

	/* Image on right layout */
	.section-card.image-right {
		grid-template-columns: 1fr 448px;
	}

	.section-card.image-right .section-image {
		order: 2;
	}

	.section-card.image-right .section-text {
		order: 1;
	}

	/* Image Frame */
	.section-image {
		position: relative;
		flex-shrink: 0;
	}

	.oval-frame {
		width: 448px;
		height: 448px;
		border-radius: 50%;
		overflow: hidden;
		border: 4px solid var(--vnk-accent-color, rgb(5, 115, 179));
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
		background: white;
	}

	.oval-frame img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.garment-number {
		position: absolute;
		font-size: 4rem;
		font-weight: 800;
		color: rgba(5, 115, 179, 0.1);
		z-index: 0;
		bottom: -10px;
	}

	.image-left .garment-number {
		right: -10px;
	}

	.image-right .garment-number {
		left: -10px;
	}

	/* Section Text Content */
	.section-text {
		color: rgb(2, 114, 112);
		position: relative;
		z-index: 1;
	}

	.code-block {
		display: inline-block;
		background: var(--vnk-accent-color, rgb(5, 115, 179));
		color: #fff;
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.section-text h2 {
		font-size: 1.75rem;
		margin-bottom: 0.5rem;
		color: var(--vnk-accent-color, rgb(5, 115, 179));
		font-weight: 700;
	}

	.section-subtitle {
		font-size: 1.1rem;
		color: rgb(3, 158, 155);
		margin-bottom: 1rem;
		font-style: italic;
		font-weight: 500;
	}

	.section-content {
		font-size: 0.95rem;
		line-height: 1.7;
		color: rgb(2, 114, 112);
	}

	.section-content :global(p) {
		margin-bottom: 0.75rem;
	}

	.section-content :global(strong) {
		color: var(--vnk-accent-color, rgb(5, 115, 179));
		font-weight: 600;
	}

	.section-content :global(h3) {
		color: var(--vnk-accent-color, rgb(5, 115, 179));
		font-size: 1.1rem;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
	}

	.section-content :global(ul) {
		list-style: none;
		padding-left: 0;
		margin: 0.75rem 0;
	}

	.section-content :global(li) {
		padding: 0.35rem 0 0.35rem 1.25rem;
		position: relative;
	}

	.section-content :global(li::before) {
		content: '•';
		color: var(--vnk-accent-color, rgb(5, 115, 179));
		position: absolute;
		left: 0;
		font-weight: bold;
	}

	/* Themed Content Block */
	:global(.themed-content-block) {
		margin-top: 3rem;
	}

	/* Mobile Responsive */
	@media (max-width: 900px) {
		.section-card,
		.section-card.image-right {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.section-card.image-right .section-image,
		.section-card.image-right .section-text {
			order: unset;
		}

		.section-image {
			display: flex;
			justify-content: center;
		}

		.oval-frame {
			width: 384px;
			height: 384px;
		}

		.garment-number {
			font-size: 3rem;
			bottom: -5px;
			right: calc(50% - 130px) !important;
			left: auto !important;
		}
	}

	@media (max-width: 480px) {
		.oval-frame {
			width: 320px;
			height: 320px;
		}

		.garment-number {
			right: calc(50% - 110px) !important;
		}
	}
</style>
