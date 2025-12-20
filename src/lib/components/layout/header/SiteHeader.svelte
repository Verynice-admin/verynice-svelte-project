<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	import SearchModal from '$lib/components/features/search/SearchModal.svelte';

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
		<div class="header-item header-logo">
			{#if config.logoUrlWhite}
				<a href="/" aria-label={config.logoAltText}>
					<img id="header-logo-img" src={config.logoUrlWhite} alt={config.logoAltText} />
				</a>
			{:else}
				<a class="logo" href="/">{config.siteName}</a>
			{/if}
		</div>

		<div class="header-item header-menu" role="navigation" aria-label="Main">
			<ul id="menu-topmenu">
				{#each menu as item}
					<li><a href={item.url}>{item.text}</a></li>
				{/each}
			</ul>
		</div>

		<div class="header-item header-buttons">
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

	/* 1. Default Styles (Mobile) */

	/* Hide desktop menu by default */
	.header-item.header-menu {
		display: none;
	}

	/* Center logo by default (Mobile) */
	.header-logo {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1;
	}

	.header-buttons {
		width: 100%;
		display: flex;
		justify-content: space-between;
	}

	/* Show hamburger by default (Mobile) */
	.header-menu-toggle {
		background: transparent;
		border: none;
		color: #fff;
		cursor: pointer;
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		-webkit-tap-highlight-color: transparent;
	}

	/* 2. Desktop Styles (min-width: 1024px) */
	@media (min-width: 1024px) {
		/* Show desktop menu */
		.header-item.header-menu {
			display: block;
			position: absolute;
			left: 55%;
			top: 60%;
			transform: translate(-50%, -50%);
		}

		/* Reset logo position */
		.header-logo {
			position: static;
			transform: none;
		}

		.header-buttons {
			width: auto;
			display: block;
		}

		/* Hide hamburger on desktop */
		.header-menu-toggle {
			display: none;
		}
	}

	/* --- Component Styles --- */

	.logo {
		color: #e2e8f0;
		font-weight: 700;
		text-decoration: none;
	}
	#menu-topmenu {
		display: flex;
		gap: 1rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.header-search-btn {
		background: transparent;
		border: none;
		color: #cbd5e1;
		cursor: pointer;
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.2s;
	}
	.header-search-btn:hover {
		color: #fff;
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
