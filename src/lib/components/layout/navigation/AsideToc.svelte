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
		/* Base TOC rail */
		.toc-rail {
			position: fixed;
			font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
			z-index: 200;
			transition: all 0.3s ease;
		}

		/* ========================================= */
		/* MOBILE TOC - Bottom-right pill stack */
		/* ========================================= */
		@media (max-width: 768px) {
			.toc-rail {
				top: auto !important;
				bottom: 80px !important;
				right: 16px !important;
				left: auto !important;
				transform: none !important;
				background: rgba(0, 0, 0, 0.75) !important;
				backdrop-filter: blur(8px) !important;
				-webkit-backdrop-filter: blur(8px) !important;
				border-radius: 24px !important;
				padding: 8px 10px !important;
				box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
				max-width: none !important;
				width: auto !important;
			}

			.toc-rail .toc-header {
				font-size: 11px !important;
				font-weight: 700 !important;
				letter-spacing: 0.08em !important;
				text-transform: uppercase !important;
				color: white !important;
				margin-bottom: 6px !important;
				padding: 0 6px !important;
				text-align: center !important;
				display: block !important;
			}

			.toc-rail ol {
				display: flex !important;
				flex-direction: column !important;
				gap: 4px !important;
				padding: 0 !important;
				margin: 0 !important;
				list-style: none !important;
			}

			.toc-rail li {
				list-style: none !important;
				height: auto !important;
			}

			.toc-rail a {
				display: flex !important;
				align-items: center !important;
				justify-content: center !important;
				width: 32px !important;
				height: 32px !important;
				min-width: 32px !important;
				border-radius: 50% !important;
				background: rgba(255, 255, 255, 0.15) !important;
				color: white !important;
				text-decoration: none !important;
				font-size: 12px !important;
				font-weight: 600 !important;
				transition: all 0.2s ease !important;
				border: none !important;
			}

			.toc-rail a:hover,
			.toc-rail li.active a {
				background: rgba(255, 255, 255, 0.3) !important;
				transform: scale(1.1) !important;
			}

			/* Hide number and card labels on mobile pill */
			.toc-rail .number,
			.toc-rail .card-label,
			.toc-rail .text-label {
				display: none !important;
			}

			/* Ensure vertical rail line is hidden */
			.toc-rail-ol::before,
			.toc-rail ol::before {
				display: none !important;
				content: none !important;
			}

			/* Show both hero and article TOC as same pill stack */
			.toc-rail-hero,
			.toc-rail-article {
				display: block !important;
				opacity: 1 !important;
				visibility: visible !important;
				pointer-events: auto !important;
				position: fixed !important;
				top: auto !important;
				bottom: 80px !important;
				right: 16px !important;
				left: auto !important;
			}

			/* Hide the card preview tooltip */
			.toc-rail .card {
				display: none !important;
			}
		}

		/* Desktop TOC hidden on mobile is already handled by existing media query at bottom */
		@media (max-width: 900px) {
			.toc-rail {
				display: none !important;
			}
		}

		/* Desktop TOC overrides for large screens */
		@media (min-width: 769px) {
			.toc-rail {
				display: block !important;
			}
		}
	</style>
