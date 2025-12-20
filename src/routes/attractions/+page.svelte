<script>
	import { browser } from '$app/environment';
	import { getCloudinaryUrl } from '$lib/utils/cloudinary';
	import AsideToc from '$components/layout/navigation/AsideToc.svelte';
	// BackToTop is now global in +layout.svelte

	/** @type {import('./$types').PageData} */
	export let data;

	// Hero content (same fields History uses)
	// Hero content - sourced from DB with fallback
	$: pageData = {
		mainTitle: 'Attractions',
		headerDescription:
			"An organized guide to Kazakhstan's highlights, grouped by region and ranked by traveler popularity to help you plan your perfect trip.",
		headerBackgroundPublicId: 'site/backgrounds/attractions-hero',
		headerBackgroundImageAriaLabel: 'Kazakhstan landscape',
		location: 'The Great Steppe (Desht-i-Kipchak)',
		articleViews: 48210,
		articleComments: 38,
		articleLikes: 1244,
		...(data.page || {})
	};

	// ------ Utilities ------
	function slugify(s = '') {
		return String(s)
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/&/g, ' and ')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}
	const idForRegion = (name) => `section-${slugify(name)}`;

	// Tier legend
	const TIER_DESCRIPTIONS = {
		1: 'Must-see highlights for first-time visitors; iconic and most in-demand.',
		2: 'Strongly recommended; memorable, sometimes more effort or time needed.',
		3: 'Nice-to-see; good if you have extra time or niche interests.'
	};

	// Canonical region order
	const regionOrder = [
		'Almaty & Nearby',
		'Astana & Nearby',
		'Turkistan & Shymkent',
		'Mangystau Region',
		'East Kazakhstan',
		'Central Kazakhstan',
		'Northern Kazakhstan'
	];

	function normalizeRegion(raw = '') {
		const r = String(raw).trim();
		if (/almaty/i.test(r)) return 'Almaty & Nearby';
		if (/(nur[-\s]?sultan|astana)/i.test(r)) return 'Astana & Nearby';
		if (/(turkistan|turkestan|shymkent)/i.test(r)) return 'Turkistan & Shymkent';
		if (/mangystau|ustyurt|aktau/i.test(r)) return 'Mangystau Region';
		if (/(east|oskemen|ust[-\s]?kamenogorsk)/i.test(r)) return 'East Kazakhstan';
		if (/(central|karaganda|ulytau)/i.test(r)) return 'Central Kazakhstan';
		if (/(north|northern|petropavl|kostanay|kokshetau|pavlodar)/i.test(r))
			return 'Northern Kazakhstan';
		return 'Uncategorized';
	}

	const regionAnchors = {
		'Almaty & Nearby': { lat: 43.238949, lng: 76.889709 },
		'Astana & Nearby': { lat: 51.169392, lng: 71.449074 },
		'Turkistan & Shymkent': { lat: 42.315514, lng: 69.586907 },
		'Mangystau Region': { lat: 43.653, lng: 51.157 },
		'East Kazakhstan': { lat: 49.948, lng: 82.627 },
		'Central Kazakhstan': { lat: 49.803, lng: 73.087 },
		'Northern Kazakhstan': { lat: 53.287, lng: 69.404 }
	};

	// Distance helpers
	function haversineKm(a, b) {
		if (!a || !b || a.lat == null || a.lng == null || b.lat == null || b.lng == null)
			return Infinity;
		const toRad = (x) => (x * Math.PI) / 180;
		const R = 6371;
		const dLat = toRad(b.lat - a.lat);
		const dLng = toRad(b.lng - a.lng);
		const lat1 = toRad(a.lat);
		const lat2 = toRad(b.lat);
		const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
		return 2 * R * Math.asin(Math.sqrt(h));
	}
	function getCoord(it) {
		const c = it.location || it.coordinates || it.coord || { lat: it.lat, lng: it.lng };
		return c && c.lat != null && c.lng != null ? c : null;
	}
	function orderByNearestNeighbor(anchor, items) {
		const remaining = items.slice();
		const ordered = [];
		let current = anchor;
		while (remaining.length) {
			let bestIdx = 0;
			let bestDist = Infinity;
			for (let i = 0; i < remaining.length; i++) {
				const coord = getCoord(remaining[i]);
				const d = haversineKm(current, coord || { lat: NaN, lng: NaN });
				if (d < bestDist) {
					bestDist = d;
					bestIdx = i;
				}
			}
			const next = remaining.splice(bestIdx, 1)[0];
			ordered.push(next);
			const nextCoord = getCoord(next);
			if (nextCoord) current = nextCoord;
		}
		return ordered;
	}

	// Pin main city first in each region (heuristics)
	const pinnedCityIdsByRegion = {
		'Almaty & Nearby': ['almaty-city'],
		'Astana & Nearby': ['astana-city'],
		'Turkistan & Shymkent': ['turkistan-city', 'shymkent-city'],
		'Mangystau Region': ['aktau-city'],
		'East Kazakhstan': ['oskemen-city', 'semey-city'],
		'Central Kazakhstan': ['karaganda-city'],
		'Northern Kazakhstan': ['kokshetau-city', 'petropavl-city']
	};
	function titleMatchesCity(regionName, title = '') {
		const t = String(title).toLowerCase();
		if (regionName === 'Almaty & Nearby') return /almaty/.test(t);
		if (regionName === 'Astana & Nearby') return /(astana|nur[-\s]?sultan)/.test(t);
		if (regionName === 'Turkistan & Shymkent') return /\b(turkistan|shymkent)\b/.test(t);
		if (regionName === 'Mangystau Region') return /\baktau\b/.test(t);
		if (regionName === 'East Kazakhstan') return /\b(oskemen|ust[-\s]?kamenogorsk|semey)\b/.test(t);
		if (regionName === 'Central Kazakhstan') return /\bkaraganda\b/.test(t);
		if (regionName === 'Northern Kazakhstan') return /\b(kokshetau|petropavl)\b/.test(t);
		return false;
	}
	function findPinnedCity(regionName, items) {
		const ids = pinnedCityIdsByRegion[regionName] || [];
		for (const id of ids) {
			const found = items.find((x) => x.id === id);
			if (found) return found;
		}
		return items.find((x) => titleMatchesCity(regionName, x.title)) || null;
	}

	function prepareRegion(regionName, source) {
		const list = source.slice();
		const anchor = regionAnchors[regionName];
		const pinned = findPinnedCity(regionName, list);
		const out = [];
		let current = anchor;

		if (pinned) {
			const idx = list.findIndex((x) => x.id === pinned.id);
			if (idx !== -1) list.splice(idx, 1);
			out.push(pinned);
			current = getCoord(pinned) || anchor;
		}

		const buckets = { 1: [], 2: [], 3: [], other: [] };
		for (const it of list) {
			const t = Number(it.tier);
			if (t === 1) buckets[1].push(it);
			else if (t === 2) buckets[2].push(it);
			else if (t === 3) buckets[3].push(it);
			else buckets.other.push(it);
		}

		const orderTierFrom = (start, arr) => {
			const withCoords = [];
			const withoutCoords = [];
			for (const it of arr) (getCoord(it) ? withCoords : withoutCoords).push(it);

			let orderedWith = [];
			const startPoint = start || anchor;
			if (startPoint && withCoords.length) {
				orderedWith = orderByNearestNeighbor(startPoint, withCoords);
			} else if (withCoords.length) {
				orderedWith = withCoords.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
			}

			withoutCoords.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

			let nextCurrent = startPoint;
			for (let i = orderedWith.length - 1; i >= 0; i--) {
				const c = getCoord(orderedWith[i]);
				if (c) {
					nextCurrent = c;
					break;
				}
			}

			return { ordered: [...orderedWith, ...withoutCoords], current: nextCurrent };
		};

		for (const tierArr of [buckets[1], buckets[2], buckets[3], buckets.other]) {
			const { ordered, current: next } = orderTierFrom(current, tierArr);
			out.push(...ordered);
			current = next;
		}
		return out;
	}

	// Group and order by region
	const byRegion = (data.attractions || []).reduce((acc, item) => {
		const region = normalizeRegion(item.region);
		(acc[region] ||= []).push(item);
		return acc;
	}, {});
	const orderedGroups = regionOrder
		.map((r) => ({ region: r, attractions: prepareRegion(r, byRegion[r] || []) }))
		.filter((g) => g.attractions.length);
	const remainingGroups = Object.keys(byRegion)
		.filter((r) => !regionOrder.includes(r))
		.map((r) => ({ region: r, attractions: prepareRegion(r, byRegion[r]) }));
	const groupedAndSorted = [...orderedGroups, ...remainingGroups];

	// Build TOC entries exactly like History (data.sections)
	const sections = groupedAndSorted.map((g) => {
		const id = slugify(g.region);
		return { id, title: g.region, sectionId: `section-${id}` };
	});

	// --- Mobile collapsible sections (ADDED) ---
	let isMobile = false;
	const MQ = '(max-width: 1024px)';
	function computeIsMobile() {
		return typeof window !== 'undefined' && window.matchMedia(MQ).matches;
	}

	function closeOthersExcept(detailsEl) {
		if (!isMobile) return;
		document.querySelectorAll('.region-details[open]').forEach((d) => {
			if (d !== detailsEl) d.open = false;
		});
	}
	function openExclusive(sectionId) {
		const current = document.getElementById(`${sectionId}-details`);
		if (current) {
			current.open = true;
			closeOthersExcept(current);
		}
	}
	// Open the section when clicking a TOC link, then scroll
	function onTocClick(sectionId) {
		if (typeof document !== 'undefined') {
			if (isMobile) openExclusive(sectionId);
			const el = document.getElementById(sectionId);
			if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
			history.replaceState(null, '', `#${sectionId}`);
		}
	}

	// Mobile UX state: search, tier filters, bottom sheet
	let q = '';
	let selectedTiers = new Set(); // 1,2,3
	let showSheet = false;
	let sheetQuery = '';

	function toggleTier(t) {
		const next = new Set(selectedTiers);
		next.has(t) ? next.delete(t) : next.add(t);
		selectedTiers = next;
	}
	function clearFilters() {
		q = '';
		selectedTiers = new Set();
	}

	// Filtered groups derived from your groupedAndSorted
	$: filteredGroups = groupedAndSorted.map((g) => {
		const items = g.attractions.filter((a) => {
			const tierOk = selectedTiers.size ? selectedTiers.has(Number(a.tier)) : true;
			const textOk = q ? (a.title || '').toLowerCase().includes(q.toLowerCase()) : true;
			return tierOk && textOk;
		});
		return { ...g, attractions: items };
	});

	// Counts per section (used in mobile sheet)
	$: countsBySectionId = Object.fromEntries(
		filteredGroups.map((g) => [idForRegion(g.region), g.attractions.length])
	);

	// Expand/collapse all accordions on mobile
	function expandAll() {
		if (!isMobile) return;
		document.querySelectorAll('.region-details').forEach((d) => (d.open = true));
	}
	function collapseAll() {
		if (!isMobile) return;
		document.querySelectorAll('.region-details').forEach((d) => (d.open = false));
	}

	// Persist mobile filters between navigations
	import { onMount, onDestroy } from 'svelte';
	onMount(() => {
		isMobile = computeIsMobile();
		const mql = window.matchMedia(MQ);
		const mqHandler = (e) => (isMobile = e.matches);
		mql.addEventListener('change', mqHandler);

		// If page opens with a hash on mobile, expand the right <details>
		const hash = (location.hash || '').slice(1);
		if (hash && isMobile) {
			const det = document.getElementById(`${hash}-details`);
			if (det) det.open = true;
		}

		// Restore filters
		try {
			const saved = JSON.parse(sessionStorage.getItem('attractionsFilters') || '{}');
			if (typeof saved.q === 'string') q = saved.q;
			if (Array.isArray(saved.tiers)) selectedTiers = new Set(saved.tiers);
		} catch {}
		const save = () =>
			sessionStorage.setItem(
				'attractionsFilters',
				JSON.stringify({ q, tiers: Array.from(selectedTiers) })
			);
		const iv = setInterval(save, 500);
		onDestroy(() => clearInterval(iv));

		return () => mql.removeEventListener('change', mqHandler);
	});
</script>

<svelte:head>
	<title>Attractions | VeryNice.kz</title>
	<meta
		name="description"
		content="An organized guide to Kazakhstan's highlights, grouped by region and ranked by traveler popularity."
	/>
</svelte:head>

{#if pageData}
	<!-- apply .section styles from pages.css -->
	<section id="page-hero-section" class="section">
		<div class="section-header wrapper">
			<nav class="breadcrumb-modern" aria-label="Breadcrumb">
				<ol class="breadcrumb-modern__list">
					<li class="breadcrumb-modern__item">
						<a class="breadcrumb-modern__link" href="/">Home</a>
						<span class="breadcrumb-modern__divider" aria-hidden="true"></span>
					</li>
					<li class="breadcrumb-modern__item">
						<span class="breadcrumb-modern__current" aria-current="page">Attractions</span>
					</li>
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
			<div class="header-background">
				<div
					class="background-image"
					style="background-image: url({getCloudinaryUrl(pageData.headerBackgroundPublicId, {
						width: 1920,
						crop: 'fill'
					})})"
					aria-label={pageData.headerBackgroundImageAriaLabel}
				></div>
			</div>
		{/if}
	</section>
{/if}

<!-- MAIN CONTENT -->
<div class="container article-container">
	<article class="article prose attractions-page" aria-label="Kazakhstan attractions guide">
		<div class="main-column-content">
			<section class="themed-content-block attractions-tier-block">
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

			{#each groupedAndSorted as group (group.region)}
				<section class="attractions-region-block" aria-labelledby={idForRegion(group.region)}>
					<details
						id={`${idForRegion(group.region)}-details`}
						class="attractions-region-details"
						open={!isMobile}
						on:toggle={(e) => {
							if (e.currentTarget.open) closeOthersExcept(e.currentTarget);
						}}
					>
						<summary class="attractions-region-summary">
							<h2 id={idForRegion(group.region)} class="attractions-region-title">
								{group.region}
								<span class="attractions-count-badge">{group.attractions.length}</span>
							</h2>
							<div class="region-toggle-btn">
								<span class="toggle-text"></span>
								<div class="toggle-icon-box">
									<svg
										width="12"
										height="8"
										viewBox="0 0 12 8"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M1 1.5L6 6.5L11 1.5"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
								</div>
							</div>
						</summary>

						<div class="attractions-items-list">
							{#each group.attractions as attraction (attraction.id)}
								<a href={`/attractions/${attraction.id}`} class="attractions-item-card">
									<div class="card-image-wrapper">
										<div
											class="card-image"
											style="background-image: url({getCloudinaryUrl(
												attraction.image ||
													attraction.mainImage ||
													attraction.heroImage ||
													'site/backgrounds/attractions-hero',
												{
													width: 600,
													crop: 'fill'
												}
											)})"
											role="img"
											aria-label={attraction.title}
										></div>
										<div class="tier-badge tier-{attraction.tier}">
											<span class="tier-label">TIER</span>
											<span class="tier-number">{attraction.tier}</span>
										</div>
									</div>
									<div class="attractions-item-content">
										<h3 class="item-title">{attraction.title}</h3>
										<p class="item-description">{attraction.shortDescription}</p>
										<span class="read-more">Read more <span class="arrow">→</span></span>
									</div>
								</a>
							{/each}
						</div>
					</details>
				</section>
			{/each}
		</div>
	</article>
</div>

{#if browser}
	<AsideToc articles={sections} />
{/if}

<!-- Mobile toolbar: shows on small screens -->
<div class="attractions-mobile-toolbar" aria-label="Filters and navigation">
	<button class="btn attractions-sheet-trigger" type="button" on:click={() => (showSheet = true)}>
		Sections
	</button>

	<input
		class="attractions-search"
		type="search"
		inputmode="search"
		placeholder="Search attractions"
		bind:value={q}
		aria-label="Search attractions"
	/>

	<div class="attractions-tier-pills" role="group" aria-label="Filter by tier">
		<button
			type="button"
			class="attractions-pill"
			class:active={selectedTiers.has(1)}
			on:click={() => toggleTier(1)}>Tier 1</button
		>
		<button
			type="button"
			class="attractions-pill"
			class:active={selectedTiers.has(2)}
			on:click={() => toggleTier(2)}>Tier 2</button
		>
		<button
			type="button"
			class="attractions-pill"
			class:active={selectedTiers.has(3)}
			on:click={() => toggleTier(3)}>Tier 3</button
		>
		<button
			type="button"
			class="attractions-pill clear"
			on:click={clearFilters}
			disabled={!q && selectedTiers.size === 0}>Clear</button
		>
	</div>

	<div class="attractions-toolbar-actions">
		<button type="button" class="link" on:click={expandAll}>Expand all</button>
		<span class="sep">•</span>
		<button type="button" class="link" on:click={collapseAll}>Collapse all</button>
	</div>
</div>

{#if showSheet}
	<button
		type="button"
		class="attractions-sheet-backdrop"
		aria-label="Close sections panel"
		on:click={() => (showSheet = false)}
	></button>
	<div class="attractions-sheet" role="dialog" aria-modal="true" aria-label="Sections">
		<div class="attractions-sheet-handle"></div>
		<div class="attractions-sheet-header">
			<input
				class="attractions-sheet-search"
				type="search"
				placeholder="Search sections"
				bind:value={sheetQuery}
				aria-label="Search sections"
			/>
			<button class="btn attractions-sheet-close" type="button" on:click={() => (showSheet = false)}
				>Close</button
			>
		</div>
		<ul class="attractions-sheet-list">
			{#each sections.filter((s) => !sheetQuery || s.title
						.toLowerCase()
						.includes(sheetQuery.toLowerCase())) as s}
				<li>
					<a
						href={`#${s.sectionId}`}
						on:click|preventDefault={() => {
							onTocClick(s.sectionId);
							showSheet = false;
						}}
					>
						<span class="sheet-item-title">{s.title}</span>
						<span class="attractions-sheet-count">{countsBySectionId[s.sectionId] ?? 0}</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
{/if}
