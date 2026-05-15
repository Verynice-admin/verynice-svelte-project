<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	import LanguageSelector from '$lib/components/ui/LanguageSelector.svelte';

	export let headerConfig = {};
	export let isSearchOpen = false;
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
	$: menu = arr(config.menu).length ? arr(config.menu) : arr(config.menuLinks);

	let isScrolled = false;
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

	// Open search modal
	function openSearch() {
		isSearchOpen = true;
		if (browser) {
			const event = new CustomEvent('openSearch');
			window.dispatchEvent(event);
		}
	}



	onMount(() => {
		if (browser) {
			checkScroll(); // Check initial state
			checkMobile(); // Check initial mobile state
			window.addEventListener('scroll', checkScroll, { passive: true });
			window.addEventListener('resize', checkMobile, { passive: true });
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
				VERYNICE .kz
			</a>
		</div>

		<!-- 3. Desktop Menu (Hidden on mobile) -->
		<div class="header-item header-menu" role="navigation" aria-label="Main">
			<ul id="menu-topmenu">
				{#each menu as item}
					<li class={item.url === '/about-borat' ? 'nav-borat' : ''}><a href={item.url}>{item.text}</a></li>
				{/each}
			</ul>
		</div>

		<!-- 4. Right Actions -->
		<div class="header-item header-buttons">
			<div class="header-right-actions">
				{#if !isMobile}
					<button
						class="header-search-btn"
						aria-label="Search"
						on:click={openSearch}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="11" cy="11" r="8"></circle>
							<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
						</svg>
					</button>
				{/if}
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
#site-header,
		header#site-header {
			width: 100% !important;
			position: fixed !important;
			top: 0 !important;
			left: 0 !important;
			right: 0 !important;
			z-index: 2001 !important;
			-webkit-transform: translateZ(0) !important;
			transform: translateZ(0) !important;
			-webkit-backface-visibility: hidden !important;
			backface-visibility: hidden !important;
		}

		.header-inner {
			display: grid;
			/* [Toggle: ~44px] [Logo: Shared] [Actions: ~100px] */
			grid-template-columns: 44px 1fr 100px;
			align-items: center;
			padding: 0.5rem 0 0.5rem 0.75rem;
			min-height: 3.5rem;
			gap: 0;
			width: 100%;
			max-width: none;
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
			padding: 0 1.75rem;
		}

		/* Language selector should touch right edge */
		.language-selector {
			margin-right: 0;
		}
	}

	/* 2. Desktop Styles (min-width: 1024px) */
	@media (min-width: 1024px) {
		.header-inner {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 2rem;
			max-width: 1600px;
			margin: 0 auto;
			width: 100%;
			height: 4.5rem;
			gap: 2rem;
		}

		/* Logo centered but slightly left towards menu */
		.header-logo {
			flex: 0 0 auto;
			display: flex;
			justify-content: center;
			align-items: center;
			position: relative;
			left: -10px;
			transform: none;
			order: 1;
		}

		/* Centered Menu: Perfectly centered */
		.header-item.header-menu {
			flex: 1;
			display: flex;
			justify-content: center;
			align-items: center;
			min-width: 0;
			padding: 0;
			order: 2;
		}

		#menu-topmenu {
			display: flex;
			gap: 2.5rem;
			list-style: none;
			margin: 0;
			padding: 0;
			padding-top: 8px;
			white-space: nowrap;
			align-items: center;
			justify-content: center;
		}

		#menu-topmenu li {
			display: flex;
			align-items: center;
		}

		#menu-topmenu a {
			font-size: 13px;
			font-weight: 700;
			letter-spacing: 0.05em;
			text-transform: uppercase;
			color: #ffffff !important;
			transition: all 0.2s ease;
			padding: 0.5rem 0;
			display: flex;
			align-items: center;
		}

		#menu-topmenu li.nav-borat a {
			color: #f59e0b !important;
		}

		#menu-topmenu li.nav-borat a:hover {
			color: #fbbf24 !important;
		}

		/* Actions on right */
		.header-buttons {
			flex: 0 0 auto;
			display: flex;
			justify-content: flex-end;
			align-items: center;
			order: 3;
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

		.header-search-btn {
			padding: 0.4rem;
		}

		.header-search-btn svg {
			width: 18px;
			height: 18px;
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

	.header-search-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		color: #fff;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 6px;
		transition: background-color 0.2s ease;
	}

	.header-search-btn:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.logo {
		color: #fff !important;
		font-weight: 800;
		text-decoration: none;
		font-size: 1.5rem;
		letter-spacing: -0.01em;
		white-space: nowrap;
		display: flex;
		justify-content: center;
		align-items: center;
		line-height: 1;
		width: auto;
		text-align: center;
	}

	@media (min-width: 1024px) {
		.logo {
			font-family: 'Inter', sans-serif;
			font-weight: 800;
			font-size: 1.4rem;
			display: flex;
			justify-content: flex-start;
			align-items: center;
			color: #fff !important;
			text-decoration: none;
			letter-spacing: -0.01em;
			transition: transform 0.2s ease-in-out;
			white-space: nowrap;
			width: auto;
			text-align: left;
		}
	}

	#menu-topmenu {
		list-style: none;
		margin: 0;
		padding: 0;
		white-space: nowrap;
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
