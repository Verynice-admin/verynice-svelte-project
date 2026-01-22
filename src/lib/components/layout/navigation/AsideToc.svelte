<!-- src/lib/components/layout/navigation/AsideToc.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { browser } from '$app/environment';

	export let articles = [];
	export let railRight = 32;
	export let heroElement = null; // Direct reference from parent

	// Header offset for scroll calculations (default 80px)
	const headerOffset = 80;

	let activeId = null;
	let observer;
	let isInHeroArea = false; // Start with FALSE to prevent white text on white bg
	let heroTocOpacity = 0; // Opacity 0 by default
	let articleTocVisible = false; // Start HIDDEN to prevent ghosting

	// Positioning for Hero TOC
	let windowWidth = 0;
	let scrollY = 0;
	let innerHeight = 0;
	let heroEl = null; // Fix: Declare heroEl
	let heroHeight = 0; // Fix: Declare heroHeight

	const normalizeId = (id) => (id || '').trim();

	// Normalize article to get the ID
	const getArticleId = (article) => {
		return normalizeId(article?.articleId || article?.sectionId || article?.id || '');
	};

	function scrollToId(id) {
		if (!browser || !id) return;
		const normalizedId = normalizeId(id);
		let el = document.getElementById(normalizedId);
		if (!el) {
			el =
				document.querySelector(`section[id="${normalizedId}"]`) ||
				document.querySelector(`[id="${normalizedId}"]`);
		}

		if (!el) {
			setTimeout(() => {
				el =
					document.getElementById(normalizedId) ||
					document.querySelector(`section[id="${normalizedId}"]`) ||
					document.querySelector(`[id="${normalizedId}"]`);
				if (el) performScroll(el, normalizedId);
			}, 200);
			return;
		}

		performScroll(el, normalizedId);
	}

	function performScroll(el, id) {
		if (!el) return;
		const header = document.getElementById('site-header') || document.querySelector('header');
		const headerHeight = header ? header.offsetHeight : headerOffset;
		const offset = headerHeight + 20;

		const elementTop = el.getBoundingClientRect().top + window.pageYOffset;
		const targetPosition = elementTop - offset;

		window.scrollTo({
			top: targetPosition,
			behavior: 'smooth'
		});

		history.replaceState(null, '', `#${id}`);

		setTimeout(() => {
			el.setAttribute('tabindex', '-1');
			el.focus({ preventScroll: true });
		}, 100);
	}

	function handleClick(e, id) {
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
		e.preventDefault();
		e.stopPropagation();
		scrollToId(id);
	}

	function handleKeyOnLink(e, index) {
		if (!['ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) return;
		e.preventDefault();
		const ids = articles.map((s) => getArticleId(s)).filter(Boolean);
		if (!ids.length) return;
		let next = index;
		if (e.key === 'ArrowUp' || e.key === 'PageUp') next = Math.max(0, index - 1);
		else if (e.key === 'ArrowDown' || e.key === 'PageDown')
			next = Math.min(ids.length - 1, index + 1);
		else if (e.key === 'Home') next = 0;
		else if (e.key === 'End') next = ids.length - 1;

		scrollToId(ids[next]);
		const link = document.getElementById(`toc-link-${next}`);
		link?.focus();
	}

	// --- NEW REACTIVE LOGIC ---

	function updateHeroState() {
		if (!browser) return;

		// FAILSAFE: If we are scrolled past the initial viewport (e.g. > 100vh or > 900px),
		// we are definitely NOT in the hero area. Force Rail Mode.
		const safeHeight = innerHeight || window.innerHeight || 900;
		if (scrollY > safeHeight) {
			heroTocOpacity = 0;
			isInHeroArea = false;
			articleTocVisible = true;
			return;
		}

		// Use prop if available, otherwise try ID (fallback for other pages)
		const el = heroElement || document.getElementById('page-hero-section');

		if (!el) {
			// If we can't find the hero, but we are at the top of the page,
			// assume we are in a hero-like state (or loading one) to avoid flashing the Rail.
			if (scrollY < 100) {
				heroTocOpacity = 1; // Optimistic visibility (Assume Hero exists)
				isInHeroArea = true;
				articleTocVisible = false;
			} else {
				// We are scrolled down (but < 1vh) and still no hero found?
				// It might be a page without a hero. Show Rail.
				heroTocOpacity = 0;
				isInHeroArea = false;
				articleTocVisible = true;
			}
			return;
		}

		const rect = el.getBoundingClientRect();
		// Switch when the hero bottom is above the middle of the screen (plus buffer)
		// This prevents the centered Hero TOC from overlapping white content
		const threshold = safeHeight * 0.55;
		const heroVisible = rect.bottom > threshold && rect.top < safeHeight;

		if (heroVisible) {
			// On the main image: show hero TOC, hide article rail
			heroTocOpacity = 1;
			isInHeroArea = true;
			articleTocVisible = false;
		} else {
			// Scrolled past the hero: hide hero TOC, show article rail
			heroTocOpacity = 0;
			isInHeroArea = false;
			articleTocVisible = true;
		}
	}

	// Trigger update when heroElement changes (e.g., parent mount)
	$: if (heroElement) updateHeroState();

	function initHeroObserver() {
		if (!browser) return;

		const findAndObserve = () => {
			const el = document.getElementById('page-hero-section');
			if (el) {
				heroEl = el;
				heroHeight = el.offsetHeight;
				updateHeroState();

				// Update height immediately
				heroHeight = el.offsetHeight;

				// Observe for future changes
				const ro = new ResizeObserver((entries) => {
					for (const entry of entries) {
						heroHeight = entry.target.offsetHeight;
						updateHeroState();
					}
				});
				ro.observe(el);
				return ro; // Return cleanup
			}
			return null;
		};

		// Try immediately
		let ro = findAndObserve();

		// If not found (race condition during nav), retry briefly
		if (!ro) {
			const interval = setInterval(() => {
				ro = findAndObserve();
				if (ro) clearInterval(interval);
			}, 100);
			// Stop trying after 2 seconds to avoid infinite loops
			setTimeout(() => clearInterval(interval), 2000);
		}

		return () => ro?.disconnect();
	}

	let heroObserverCleanup;
	let observerArticlesKey = '';

	// Re-run observer on every navigation to ensure we catch the NEW page's hero
	afterNavigate(() => {
		// Reset state immediately to prevent "Rail" persisting during transition
		heroEl = null;
		if (scrollY < 100) {
			articleTocVisible = false;
			heroTocOpacity = 1; // Optimistic visibility for new page
		}

		if (heroObserverCleanup) heroObserverCleanup();

		// Wait for DOM to settle/transition to separate old vs new hero
		setTimeout(() => {
			heroObserverCleanup = initHeroObserver();
			updateHeroState();
			initObserver();
		}, 100);
	});

	onMount(() => {
		heroObserverCleanup = initHeroObserver();
		updateHeroState();
		initObserver();
	});

	onDestroy(() => {
		if (heroObserverCleanup) heroObserverCleanup();
		if (observer) observer.disconnect();
	});

	$: if (browser && (scrollY !== undefined || innerHeight)) {
		// Recompute hero/article state when scroll or viewport changes
		updateHeroState();
	}

	function initObserver() {
		if (!browser || !articles.length || typeof IntersectionObserver === 'undefined') return;
		if (observer) observer.disconnect();

		setTimeout(() => {
			observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							activeId = entry.target.id;
						}
					});
				},
				// Adjust root margin to trigger earlier/later as needed
				{ root: null, rootMargin: '0px 0px -55% 0px', threshold: 0 }
			);
			articles.forEach((s) => {
				const articleId = getArticleId(s);
				if (articleId) {
					const el = document.getElementById(articleId);
					if (el) observer.observe(el);
				}
			});
		}, 200);
	}

	$: if (browser) {
		const key = articles
			.map((s) => getArticleId(s))
			.filter(Boolean)
			.join('|');
		if (key !== observerArticlesKey) {
			observerArticlesKey = key;
			initObserver();
		}
	}
	function onScroll() {
		scrollY = window.scrollY;
		updateHeroState();
	}
</script>

<svelte:window bind:innerWidth={windowWidth} on:scroll={onScroll} bind:innerHeight />

{#if browser && articles.length}
	<!-- Hero TOC: Standard Text List, Centered -->
	<nav
		class="toc-rail toc-rail-hero"
		class:in-hero-area={isInHeroArea}
		class:interactive={heroTocOpacity > 0.1}
		data-aside-toc
		style={`opacity: ${heroTocOpacity}; pointer-events: none; visibility: ${heroTocOpacity > 0 ? 'visible' : 'hidden'};`}
		aria-label="Table of contents"
	>
		<div class="toc-header">Contents</div>
		<ol>
			{#each articles as s, i (getArticleId(s))}
				{@const articleId = getArticleId(s)}
				{#if articleId}
					<li class:active={activeId === articleId}>
						<a
							href={`#${articleId}`}
							aria-label={`${i + 1}. ${s.title || 'Article'}`}
							on:click={(e) => handleClick(e, articleId)}
						>
							<span class="text-label">{s.title}</span>
						</a>
					</li>
				{/if}
			{/each}
		</ol>
	</nav>

	<!-- Article TOC: Original Rail Design (Right Aligned) -->
	<nav
		class="toc-rail toc-rail-article"
		class:visible={articleTocVisible}
		data-aside-toc
		style={`--rail-right:${railRight}px;`}
		aria-label="Article table of contents"
	>
		<ol>
			{#each articles as s, i (getArticleId(s))}
				{@const articleId = getArticleId(s)}
				{#if articleId}
					<li class:active={activeId === articleId}>
						<a
							id={`toc-link-article-${i}`}
							tabindex={activeId === articleId && articleTocVisible ? 0 : -1}
							on:keydown={(e) => handleKeyOnLink(e, i)}
							href={`#${articleId}`}
							aria-label={`${i + 1}. ${s.title || 'Article'}`}
							aria-current={activeId === articleId ? 'true' : undefined}
							on:click={(e) => handleClick(e, articleId)}
							style="display: block; width: 100%; height: 100%; cursor: pointer;"
						>
							<span class="rail-item">
								<span class="number">{String(i + 1).padStart(2, '0')}</span>
								<span class="dot" aria-hidden="true"></span>
								<span class="card" role="presentation">
									<span class="card-label">{s.title}</span>
								</span>
							</span>
						</a>
					</li>
				{/if}
			{/each}
		</ol>
	</nav>
{/if}

<style>
	:global(.history-section-spacing) {
		scroll-margin-top: var(--toc-offset, 80px);
	}

	:root {
		--toc-offset: 80px;
		--toc-font: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI',
			'Roboto', 'Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'Noto Sans', 'Liberation Sans',
			sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
		--c-bg: #ffffff;
		--c-bg-translucent: rgba(255, 255, 255, 0.82);
		--c-text: #1c1c1e;
		--c-muted: #8e8e93;
		--c-rail: #c7c7cc;
		--c-rail-fade: #d1d1d6;
		--c-hairline: #d1d1d6;
		--c-accent: #0a84ff;
		--c-accent-600: #0071eb;
		--c-glow: rgba(10, 132, 255, 0.35);
		--z: 1002;
		--w-rail: 42px;
		--dot: 10px;
		--dot-active: 14px;
		--r-card: 16px;
		--shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08);
		--rail-right: 32px;
	}
	@media (prefers-color-scheme: dark) {
		:root {
			--c-bg: #1c1c1e;
			--c-bg-translucent: rgba(28, 28, 30, 0.78);
			--c-text: #f2f2f7;
			--c-muted: #9fa4ad;
			--c-rail: #636366;
			--c-rail-fade: #48484a;
			--c-hairline: #38383a;
			--shadow: 0 16px 40px rgba(0, 0, 0, 0.55), 0 2px 12px rgba(0, 0, 0, 0.35);
		}
	}

	.toc-rail {
		position: fixed;
		top: 50%;
		/* Right is set via style attribute for article TOC, ignored for Hero TOC which uses Left */
		transform: translateY(-50%);
		z-index: var(--z);
		font-family: var(--toc-font);
		transition: opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	/* ========================================= */
	/* HERO TOC - Standard Text List (Centered)  */
	/* ========================================= */
	/* ========================================= */
	/* HERO TOC - Standard Text List (Centered)  */
	/* ========================================= */
	.toc-rail-hero {
		right: auto !important; /* Override generic right */
		/* Position strictly relative to center to ensure it NEVER enters the content area.
		   Content is max 900px (450px half). 
		   We place this at 500px from center.
		*/
		left: calc(50% + 500px);
		width: max-content;
		max-width: 300px;
		text-align: left;
		display: flex;
		flex-direction: column;
		gap: 12px;
		pointer-events: none !important; /* Container ignores clicks */
	}

	/* Hide Hero TOC on screens where it would not fit or look crowded (<1550px) */
	@media (max-width: 1550px) {
		.toc-rail-hero {
			display: none !important;
		}
	}

	.toc-rail-hero .toc-header {
		font-size: 15px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
		color: #ffffff;
		margin-bottom: 12px;
		padding-left: 14px;
		opacity: 0.9;
		pointer-events: none !important; /* Header not clickable */
	}

	.toc-rail-hero ol {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
		pointer-events: none !important; /* Force override of generic .toc-rail ol */
	}

	.toc-rail-hero li {
		display: block;
		padding: 0;
		margin: 0;
		transition: transform 0.2s ease;
		pointer-events: none !important;
	}

	.toc-rail-hero a {
		text-decoration: none;
		display: block;
		padding: 8px 14px;
		border-radius: 8px;
		transition: background 0.2s ease;
		pointer-events: none; /* Default none */
		width: fit-content; /* Shrink wrap text */
	}

	/* Enable clicks on links only when interactive class is present */
	.toc-rail-hero.interactive a {
		pointer-events: auto !important;
	}

	.toc-rail-hero .text-label {
		color: #ffffff;
		font-size: 19px;
		font-weight: 500;
		line-height: 1.4;
		transition: color 0.2s ease;
		text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
	}

	/* Hover / Active states for Hero */
	.toc-rail-hero a:hover {
		background: rgba(255, 255, 255, 0.15);
	}

	.toc-rail-hero a:hover .text-label {
		color: #ffffff;
		text-shadow: 0 2px 15px rgba(0, 0, 0, 0.5);
	}

	.toc-rail-hero li.active a {
		background: rgba(255, 255, 255, 0.25);
		backdrop-filter: blur(4px);
	}

	.toc-rail-hero li.active .text-label {
		color: #ffffff;
		font-weight: 700;
	}

	/* ========================================= */
	/* ARTICLE TOC - Original Rail Design (Right)*/
	/* ========================================= */

	.toc-rail-article {
		position: fixed;
		top: 50%;
		right: 32px !important; /* Force right alignment */
		width: var(--w-rail);
		pointer-events: none;
		opacity: 0;
		transform: translateY(-50%) translateX(10px);
		z-index: 1002;
	}

	.toc-rail-article.visible {
		opacity: 1;
		transform: translateY(-50%) translateX(0);
		pointer-events: auto;
	}

	.toc-rail-article .card {
		background: linear-gradient(
			140deg,
			color-mix(in srgb, var(--c-bg-translucent) 98%, transparent) 0%,
			color-mix(in srgb, var(--c-bg-translucent) 92%, transparent) 100%
		);
		border: 0.5px solid var(--c-hairline);
		color: var(--c-text);
		box-shadow: var(--shadow);
		backdrop-filter: saturate(180%) blur(14px);
		-webkit-backdrop-filter: saturate(180%) blur(14px);
	}

	/* Original styling maintained for Article TOC */
	.toc-rail-article .card-label {
		color: var(--c-text);
	}
	.toc-rail-article .number {
		color: var(--c-muted);
		opacity: 0.7;
	}
	.toc-rail-article .dot {
		background: var(--c-rail);
	}

	.toc-rail-article li.active .dot {
		background: #4d4d4d;
		box-shadow: none;
	}
	.toc-rail-article a:hover .dot,
	.toc-rail-article a:focus-visible .dot {
		background: #4d4d4d;
	}

	.toc-rail-article ol::before {
		background: var(--c-rail);
	}
	.toc-rail-article ol {
		position: relative;
		margin: 0;
		padding: 14px 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		pointer-events: auto;
	}

	.toc-rail-article ol::before {
		content: '';
		position: absolute;
		inset: 0 auto 0 50%;
		transform: translateX(-50%);
		width: 1px;
		border-radius: 0.5px;
		background: var(--c-rail);
	}
	.toc-rail-article ol::after {
		content: none;
		display: none;
	}

	.toc-rail-article li {
		position: relative;
		height: 40px;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		list-style: none;
		list-style-type: none;
	}

	.toc-rail-article li::before,
	.toc-rail-article li::after,
	.toc-rail-article li::marker {
		content: none !important;
		display: none !important;
	}
	.toc-rail-article a {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;
		text-decoration: none;
		outline: none;
	}

	/* Keeping base classes but applied scoped to article TOC mostly or reused */
	.number {
		position: absolute;
		top: 50%;
		left: calc(100% + 3px);
		transform: translateY(-50%);
		font-size: 16px;
		font-weight: 400;
		letter-spacing: 0.3px;
		color: var(--c-muted);
		opacity: 0.7;
		transition:
			opacity 0.2s ease,
			color 0.2s ease;
		user-select: none;
	}

	.dot {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 0.85em;
		height: 0.85em;
		border-radius: 50%;
		background: var(--c-rail);
		box-shadow: none;
		transition: background-color 0.22s ease;
		display: block;
		z-index: 1;
	}
	.toc-rail-article a:hover .dot,
	.toc-rail-article a:focus-visible .dot {
		background: #4d4d4d; /* deep gray for hover state */
		display: block;
	}
	.toc-rail-article li.active .dot {
		background: #4d4d4d; /* deep gray for selected state */
		box-shadow: none;
		display: block;
	}

	.card {
		position: absolute;
		top: 50%;
		right: calc(100% + 2px); /* very close to the vertical line */
		transform: translateY(-50%) translateX(2px);
		display: flex;
		align-items: center;
		gap: 0;
		max-width: 340px;
		padding: 10px 16px;
		border-radius: var(--r-card);
		box-shadow: var(--shadow);
		opacity: 0;
		pointer-events: none;
		transition:
			opacity 0.22s ease,
			transform 0.26s cubic-bezier(0.25, 0.6, 0.3, 1);
		list-style: none;
	}
	.card::after {
		content: none;
		display: none;
	}

	.card-number {
		display: none !important;
	}

	.card-dot {
		display: none !important;
	}

	.card-label {
		font-size: 17px;
		font-weight: 400;
		line-height: 1.3;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 220px;
		list-style: none;
		letter-spacing: 0.2px;
	}

	.card-label::before,
	.card-label::after {
		content: none !important;
		display: none !important;
	}

	.card::before {
		content: none !important;
		display: none !important;
	}

	/* Fade out animation after 3 seconds */
	@keyframes fadeOutCard {
		0% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	/* reveal logic for Scroll TOC */
	.toc-rail-article li.active .card,
	.toc-rail-article a:hover .card,
	.toc-rail-article a:focus-visible .card {
		opacity: 1;
		transform: translateY(-50%) translateX(0);
		pointer-events: auto;
		animation: fadeOutCard 0.3s ease-out 3s forwards;
	}

	/* subtle focus refinement */
	.toc-rail-article a:focus-visible .card {
		box-shadow:
			0 0 0 3px var(--c-glow),
			var(--shadow);
	}

	/* micro tweak dot to align with card center visually */
	.dot {
		margin-top: 1px;
	}

	/* optional: reduce active glow thickness */
	.toc-rail-article li.active .dot {
		box-shadow: none;
	}

	/* Keep rest unchanged */
	@media (max-width: 900px) {
		.toc-rail {
			display: none !important;
		}
	}
</style>
