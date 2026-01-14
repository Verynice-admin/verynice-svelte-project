<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';

	import SearchModal from '$lib/components/features/search/SearchModal.svelte';
	import LanguageSelector from '$lib/components/ui/LanguageSelector.svelte';

	export let headerConfig = {};
	const defaultConfig = {
		siteName: 'VERYNICE .kz',
		logoUrlWhite: '/logo.svg',
		logoAltText: 'VeryNice',
		menu: [],
		menuLinks: []
	};
	$: config = { ...defaultConfig, ...headerConfig };
	const arr = (v) => (Array.isArray(v) ? v : []);
	// Remove dots and bullet points from menu item text
	const removeDots = (text) =>
		String(text || '')
			.replace(/[.•·]/g, '') // Remove dots, bullet points, and middle dots
			.trim();
	$: menu = (arr(config.menu).length ? arr(config.menu) : arr(config.menuLinks)).map((item) => ({
		...item,
		text: removeDots(item.text)
	}));

	let isScrolled = false;
	let isSearchOpen = false;
	let isMobileMenuOpen = false;
	let isMobile = false;

	function checkMobile() {
		if (browser) {
			isMobile = window.innerWidth <= 1023.98;
		}
	}

	function checkScroll() {
		if (!browser) return;

		// Use a small timeout to allow DOM updates after navigation
		setTimeout(() => {
			// Find the hero section
			const heroSection =
				document.getElementById('page-hero-section') || document.querySelector('.section');

			if (heroSection) {
				const heroRect = heroSection.getBoundingClientRect();
				const scrollY = window.scrollY || window.pageYOffset;
				// Show border when we've scrolled past the hero section (or scrolled down significantly)
				// Check if hero section top is above viewport or if we've scrolled past 100px
				isScrolled = heroRect.top < -50 || scrollY > 100;
			} else {
				// If no hero section, always show background (menu should have background on non-hero pages)
				isScrolled = true;
			}
		}, 0);
	}

	function openSearch() {
		isSearchOpen = true;
	}

	function closeSearch() {
		isSearchOpen = false;
	}

	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
		if (browser) {
			const fullMenu = document.getElementById('mobile-menu');
			const fadeBlock = document.querySelector('.fadeblock');
			if (fullMenu) {
				fullMenu.setAttribute('data-open', String(isMobileMenuOpen));
				fullMenu.setAttribute('aria-hidden', String(!isMobileMenuOpen));
			}
			if (fadeBlock) {
				if (isMobileMenuOpen) {
					fadeBlock.classList.add('active');
				} else {
					fadeBlock.classList.remove('active');
				}
			}
			// Prevent body scroll when menu is open
			document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
		}
	}

	function closeMobileMenu() {
		isMobileMenuOpen = false;
		if (browser) {
			const fullMenu = document.getElementById('mobile-menu');
			const fadeBlock = document.querySelector('.fadeblock');
			if (fullMenu) {
				fullMenu.setAttribute('data-open', 'false');
				fullMenu.setAttribute('aria-hidden', 'true');
			}
			if (fadeBlock) {
				fadeBlock.classList.remove('active');
			}
			document.body.style.overflow = '';
		}
	}

	// Re-check scroll state on navigation
	afterNavigate(() => {
		checkScroll();
	});

	onMount(() => {
		if (browser) {
			checkScroll(); // Check initial state
			checkMobile(); // Check initial mobile state
			window.addEventListener('scroll', checkScroll, { passive: true });
			window.addEventListener('resize', checkMobile, { passive: true });

			// Optional: Add keyboard shortcut (Cmd+K or Ctrl+K)
			window.addEventListener('keydown', (e) => {
				if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
					e.preventDefault();
					openSearch();
				}
			});
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('scroll', checkScroll);
			window.removeEventListener('resize', checkMobile);
		}
	});
</script>

<header id="site-header" class:scrolled={isScrolled}>
	<div class="header-inner">
		<!-- 1. Hamburger (Mobile Only) -->
		<button
			class="header-menu-toggle"
			aria-label="Menu"
			on:click={toggleMobileMenu}
			aria-expanded={isMobileMenuOpen}
		>
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				{#if isMobileMenuOpen}
					<path
						d="M18 6L6 18M6 6L18 18"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				{:else}
					<path
						d="M3 12H21M3 6H21M3 18H21"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				{/if}
			</svg>
		</button>

		<!-- 2. Logo (Centered on mobile, Left on desktop) -->
		<div class="header-item header-logo">
			<a
				class="logo notranslate"
				href="/"
				aria-label="VeryNice.kz"
				data-no-ai-translate
				translate="no"
			>
				VERYNICE<span class="logo-dot">.</span><span class="tld">kz</span>
				<span class="sun-container">
					<span class="sun-glow"></span>
					<span class="samruk-wrapper">
						<span class="samruk"></span>
					</span>
				</span>
			</a>
		</div>

		<!-- 3. Desktop Menu (Hidden on mobile) -->
		<div class="header-item header-menu" role="navigation" aria-label="Main">
			<ul id="menu-topmenu">
				{#each menu as item}
					<li><a href={item.url}>{item.text}</a></li>
				{/each}
			</ul>
		</div>

		<!-- 4. Right Actions (Search + Language) -->
		<div class="header-item header-buttons">
			<div class="header-right-actions">
				<button class="header-search-btn" aria-label="Search" on:click={openSearch}>
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M21 21L15.0001 15.0001M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>

				<LanguageSelector isCompact={isMobile} />
			</div>
		</div>
	</div>
</header>

<!-- Mobile Menu Overlay -->
<div class="fadeblock" on:click={closeMobileMenu} role="button" aria-label="Close menu"></div>
<div id="mobile-menu" class="fullmenu" data-open="false" aria-hidden="true">
	<div class="fullmenu-inner">
		<nav class="menu-topmenu-container" role="navigation" aria-label="Mobile menu">
			<ul class="menu">
				{#each menu as item}
					<li>
						<a href={item.url} on:click={closeMobileMenu}>{item.text}</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>
</div>

<SearchModal isOpen={isSearchOpen} on:close={closeSearch} />

<style>
	#site-header,
	header#site-header {
		position: sticky;
		top: 0;
		z-index: 100;
		/* Background will be handled by pages.css for consistency */
	}

	#site-header.scrolled {
		background-color: rgb(17, 63, 114) !important;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		transition:
			background-color 0.3s ease,
			box-shadow 0.3s ease;
	}

	/* Mobile: Ensure header has blue background */
	@media (max-width: 600px) {
		#site-header,
		header#site-header {
			background-color: rgba(7, 76, 144, 0.95) !important;
			backdrop-filter: blur(20px) !important;
			-webkit-backdrop-filter: blur(20px) !important;
		}
	}
	.header-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		position: relative;
	}

	/* --- Mobile-First Refactoring --- */

	/* 1. Default Styles (Mobile < 1024px) */
	@media (max-width: 1023.98px) {
		.header-inner {
			display: grid;
			/* [Toggle: ~44px] [Logo: Shared] [Actions: ~90px] */
			grid-template-columns: 44px 1fr 90px;
			align-items: center;
			padding: 0.5rem 0.75rem;
			min-height: 3.5rem;
			gap: 0;
		}

		/* Hide desktop menu */
		.header-item.header-menu {
			display: none;
		}

		/* Hamburger */
		.header-menu-toggle {
			grid-column: 1;
			display: flex;
			align-items: center;
			justify-content: flex-start;
			padding: 0.4rem;
			color: #fff;
			background: transparent;
			border: none;
		}

		/* Logo */
		.header-logo {
			grid-column: 2;
			display: flex;
			justify-content: center;
			align-items: center;
			min-width: 0;
			z-index: 10;
		}

		/* Right Side Buttons */
		.header-buttons {
			grid-column: 3;
			display: flex;
			justify-content: flex-end;
			align-items: center;
		}

		.header-right-actions {
			display: flex;
			align-items: center;
			gap: 0.75rem;
		}

		.header-search-btn {
			color: #fff !important; /* Force visibility on mobile */
			padding: 0.4rem;
			display: flex;
			flex-shrink: 0;
		}
	}

	/* 2. Desktop Styles (min-width: 1024px) */
	@media (min-width: 1024px) {
		.header-inner {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 1.5rem;
			max-width: 1400px;
			margin: 0 auto;
			width: 100%;
			height: 4.5rem;
		}

		/* Logo Column: Locked width to match side actions */
		.header-logo {
			flex: 1; /* Take 1/3 of space */
			flex-basis: 0;
			display: flex;
			justify-content: flex-start;
			min-width: 160px;
		}

		/* Centered Menu: Perfectly centered regardless of side content width */
		.header-item.header-menu {
			flex: 2; /* Take 2/3 of space effectively centering */
			display: flex;
			justify-content: center;
			align-items: center;
			min-width: 0;
			padding: 0 1rem;
		}

		#menu-topmenu {
			display: flex;
			/* Fluid gap that tightens up on smaller screens */
			gap: clamp(0.5rem, 1.1vw, 1.75rem);
			list-style: none;
			margin: 0;
			padding: 0;
			white-space: nowrap;
			align-items: center;
		}

		#menu-topmenu a {
			/* Responsive font-size to fit French/Arabic in one line */
			font-size: clamp(10.5px, 0.8vw, 13.5px);
			font-weight: 700;
			letter-spacing: 0.03em;
			text-transform: uppercase;
			color: #fff;
			transition: all 0.2s ease;
		}

		/* Actions Column: Locked width to balance the logo */
		.header-buttons {
			flex: 1;
			flex-basis: 0;
			display: flex;
			justify-content: flex-end;
			align-items: center;
			min-width: 160px;
		}

		.header-right-actions {
			display: flex;
			align-items: center;
			gap: 1rem;
			flex-shrink: 0;
		}

		/* Mobile toggle hidden */
		.header-menu-toggle {
			display: none;
		}
	}

	/* Extra safety for very small desktops */
	@media (min-width: 1024px) and (max-width: 1280px) {
		#menu-topmenu {
			gap: 0.75rem;
		}
		#menu-topmenu a {
			font-size: 11px;
		}
	}

	/* --- Component Styles --- */
	.header-buttons {
		/* Shared button container properties */
		pointer-events: auto;
		display: flex;
		align-items: center;
	}

	.header-menu-toggle,
	.header-right-actions {
		pointer-events: auto;
		z-index: 30;
	}

	.logo {
		color: #e2e8f0;
		font-weight: 700;
		text-decoration: none;
		font-size: 1rem; /* Compact for mobile */
		letter-spacing: -0.015em;
		white-space: nowrap;
		display: flex;
		align-items: center;
		line-height: 1;
	}

	@media (min-width: 1024px) {
		.logo {
			font-family: 'Inter', sans-serif;
			font-weight: 900;
			font-size: 1.85rem; /* Increased from 1.55rem */
			display: inline-flex;
			align-items: center;
			color: #fff;
			text-decoration: none;
			letter-spacing: -0.025em;
			transition: transform 0.2s ease-in-out;
			white-space: nowrap; /* Ensure it stays in one line */
		}
	}

	.logo-dot {
		display: inline-flex;
		align-items: center;
		color: #ffd700;
		font-size: 1.4em; /* Slightly smaller dot */
		line-height: 0;
		margin-left: 2px;
		margin-right: 0px;
		position: relative;
		top: -0.03em;
	}
	.tld {
		color: rgb(125, 210, 251); /* Light Blue */
		font-weight: 500;
		display: inline-flex;
		align-items: center;
		position: relative;
		top: 0.1em;
		text-transform: lowercase; /* Ensure kz is lowercase */
	}

	/* Animated Sun & Birds */
	.sun-container {
		display: inline-flex;
		align-items: center;
		position: relative;
		vertical-align: middle;
		margin-left: 0.12em;
	}

	.sun-glow {
		display: inline-block;
		width: 0.8em; /* Increased from 0.7em to match larger logo */
		height: 0.8em;
		background: radial-gradient(circle, #daa520 0%, #b8860b 50%, rgba(218, 165, 32, 0) 100%);
		border-radius: 50%;
		position: relative;
		top: -0.45em;
		pointer-events: none;
		animation: sun-shimmer 4s infinite ease-in-out;
		filter: blur(1px);
	}

	.samruk-wrapper {
		position: absolute;
		top: -0.1em;
		left: 0.05em;
		pointer-events: none;
		animation: soar-arc 5s infinite ease-in-out alternate;
		z-index: 2;
	}

	.samruk {
		display: block;
		width: 0.7em; /* Returned to elegant size */
		height: 0.35em;
		background: #ffff00; /* Reverted to bright yellow */
		clip-path: path('M0,0 C5,3 10,5 15,0 C20,5 25,3 30,0 L15,3 L0,0');
		opacity: 1;
		filter: drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.5));
		animation: flap 0.4s infinite alternate ease-in-out;
	}

	@keyframes flap {
		0% {
			transform: scaleY(1);
		}
		100% {
			transform: scaleY(0.4); /* Flap motion */
		}
	}

	@keyframes soar-arc {
		0% {
			/* Start position */
			transform: translate(0.05em, 0.5em) rotate(-20deg) scale(1);
			opacity: 1;
		}
		100% {
			/* End position - no longer fades or shrinks */
			transform: translate(0.65em, 0.1em) rotate(0deg) scale(0.9);
			opacity: 1;
		}
	}

	@keyframes sun-shimmer {
		0%,
		100% {
			transform: scale(0.85);
			opacity: 0.7;
			box-shadow: 0 0 15px #daa520;
			filter: blur(1px) brightness(1.2);
		}
		50% {
			transform: scale(1.1);
			opacity: 1;
			box-shadow:
				0 0 45px #daa520,
				0 0 90px #b8860b,
				0 0 120px rgba(218, 165, 32, 0.5);
			filter: blur(2px) brightness(1.5);
		}
	}
	#menu-topmenu {
		list-style: none;
		margin: 0;
		padding: 0;
		white-space: nowrap;
	}
	.header-search-btn {
		background: transparent;
		border: none;
		color: #fff; /* Changed from #cbd5e1 for better visibility */
		cursor: pointer;
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			transform 0.2s,
			opacity 0.2s;
		flex-shrink: 0;
		width: 40px;
		height: 40px;
	}
	.header-search-btn:hover {
		transform: scale(1.1);
		opacity: 0.8;
	}

	/* Clean up any list styles */
	#menu-topmenu li {
		list-style: none;
	}

	#menu-topmenu li::before,
	#menu-topmenu li::after,
	#menu-topmenu a::before,
	#menu-topmenu a::after {
		list-style: none;
		content: none !important;
		display: none !important;
	}
	#menu-topmenu a {
		color: #cbd5e1;
		text-decoration: none;
	}
	#menu-topmenu a:hover {
		color: #fff;
	}
</style>
