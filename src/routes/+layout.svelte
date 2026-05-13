<script lang="ts">
	import '../styles/index.css';
	import SiteHeader from '$components/layout/header/SiteHeader.svelte';
	import Footer from '$components/layout/footer/Footer.svelte';
	import TimeWeatherDock from '$components/features/widgets/TimeWeatherDock.svelte';
	import SearchModal from '$components/features/search/SearchModal.svelte';
	// Lazy load non-critical components for better performance
	import { onMount, onDestroy } from 'svelte';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import { currentLanguage } from '$lib/stores/languageStore';
	import { translatePageTo, translationStatus } from '$lib/services/aiTranslator';
	import { getFirebaseAuth } from '$lib/firebase';
	import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
	import type { LayoutData } from './$types';
	export let data: LayoutData;
	const headerConfig = data.headerConfig ?? {};
	const footerConfig = data.footerContent ?? {};

	// Lazy loaded components
	let BackToTop: any;
	let TranslationProgressBar: any;
	let componentsLoaded = false;
	
	// Session timeout state
	let showTimeoutWarning = false;
	let timeRemaining = 300;
	let isAuthenticated = false;

	// Search state
	let isSearchOpen = false;
	let searchInput: HTMLInputElement;
	let searchQuery = '';

	if (browser) {
		// Listen for search-open event from SiteHeader
		window.addEventListener('openSearch', () => {
			isSearchOpen = true;
		});

		beforeNavigate(() => {
			const lang = get(currentLanguage) as string;
			if (lang !== 'EN') {
				translationStatus.set('loading');
				document.documentElement.dataset.translationState = 'loading';
			}
		});

		afterNavigate(() => {
			const lang = get(currentLanguage) as string;
			if (lang === 'EN') {
				translationStatus.set('original');
				document.documentElement.dataset.translationState = 'original';
				return;
			}

			// Small delay to ensure the new page content is fully rendered in the DOM
			setTimeout(() => {
				translatePageTo(lang)
					.then((ok) => {
						if (!ok) {
							console.error('[Translation] Failed after navigation (status=false)');
						}
					})
					.catch((error: unknown) => console.error('[Translation] Failed after navigation', error));
			}, 300);
		});
	}

	// Lazy load non-critical components after initial render
	onMount(async () => {
		// Session timeout variables
		let idleTimer: any = null;
		let sessionTimer: any = null;
		let isAuthenticated = false;
		let showTimeoutWarning = false;
		let timeRemaining = 300; // 5 minutes in seconds
		let countdownInterval: any = null;
		let authUnsubscribe: any = null;
		
		// Session timeout constants (in milliseconds)
		const WARNING_TIME = 5 * 60 * 1000; // 5 minutes
		const MAX_SESSION_TIME = 10 * 60 * 1000; // 10 minutes
		
		function resetSessionTimers() {
			clearTimeout(idleTimer);
			clearTimeout(sessionTimer);
			clearInterval(countdownInterval);
			showTimeoutWarning = false;
			timeRemaining = 300;
			
			if (isAuthenticated) {
				// Set warning timer
				idleTimer = setTimeout(() => {
					showTimeoutWarning = true;
					countdownInterval = setInterval(() => {
						timeRemaining--;
						if (timeRemaining <= 0) {
							clearInterval(countdownInterval);
						}
					}, 1000);
				}, MAX_SESSION_TIME - WARNING_TIME);
				
				// Set logout timer
				sessionTimer = setTimeout(async () => {
					try {
						const auth = getFirebaseAuth();
						if (auth) {
							await firebaseSignOut(auth);
							console.log('[Session] Timed out, signed out');
							goto('/');
						}
					} catch (e) {
						console.error('[Session] Sign out failed:', e);
						goto('/');
					}
				}, MAX_SESSION_TIME);
			}
		}
		
		function handleUserActivity() {
			if (isAuthenticated) {
				resetSessionTimers();
			}
		}
		
		// Listen to user activity
		const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
		activityEvents.forEach(event => {
			window.addEventListener(event, handleUserActivity, { passive: true });
		});
		
		// Monitor auth state
		const auth = getFirebaseAuth();
		if (auth) {
			authUnsubscribe = onAuthStateChanged(auth, (user) => {
				isAuthenticated = !!user;
				if (isAuthenticated) {
					resetSessionTimers();
				} else {
					clearTimeout(idleTimer);
					clearTimeout(sessionTimer);
					clearInterval(countdownInterval);
					showTimeoutWarning = false;
				}
			});
		}
		
		// Load components after auth setup (not returning early!)
		const loadComponents = () => {
			console.log('[Layout] Loading components...');
			Promise.all([
				import('$components/features/ui-elements/BackToTop.svelte'),
				import('$lib/components/ui/TranslationProgressBar.svelte')
			]).then(([backToTop, translation]) => {
				console.log('[Layout] Components loaded:', { backToTop: !!backToTop, translation: !!translation });
				BackToTop = backToTop.default;
				TranslationProgressBar = translation.default;
				componentsLoaded = true;
			}).catch(err => console.error('Failed to load components:', err));
		};

		if ('requestIdleCallback' in window) {
			requestIdleCallback(loadComponents, { timeout: 1000 });
		} else {
			setTimeout(loadComponents, 100);
		}
		
		// VisualViewport fix: keep mobile search bar pinned to visual viewport bottom
		// (Chrome mobile shrinks the visual viewport when the URL bar appears on scroll-up)
		let visualViewportCleanup: (() => void) | null = null;
		if (window.visualViewport) {
			const bar = document.querySelector('.global-search-bar') as HTMLElement | null;
			const updateBarBottom = () => {
				if (!bar || window.innerWidth > 767) return;
				const offset = Math.max(0, window.innerHeight - window.visualViewport!.height);
				bar.style.bottom = offset + 'px';
			};
			updateBarBottom();
			window.visualViewport.addEventListener('resize', updateBarBottom);
			visualViewportCleanup = () => {
				window.visualViewport!.removeEventListener('resize', updateBarBottom);
			};
		}

		// Cleanup function - returned at the END of onMount
		return () => {
			if (authUnsubscribe) authUnsubscribe();
			activityEvents.forEach(event => {
				window.removeEventListener(event, handleUserActivity);
			});
			clearTimeout(idleTimer);
			clearTimeout(sessionTimer);
			clearInterval(countdownInterval);
			visualViewportCleanup?.();
		};
	});
</script>

<svelte:body
	data-sveltekit-preload-code="viewport"
	data-sveltekit-preload-data="hover"
/>

<SiteHeader {headerConfig} bind:isSearchOpen on:search-open={() => isSearchOpen = true} />

<main id="main-content" role="main">
	<slot />
</main>

<!-- Search Bar -->
<div class="global-search-bar">
	<div class="global-search-wrapper">
		<input
			type="text"
			autocomplete="off"
			autocorrect="off"
			autocapitalize="off"
			spellcheck="false"
			placeholder="Search..."
			aria-label="Search"
			bind:this={searchInput}
			bind:value={searchQuery}
			on:focus={() => isSearchOpen = true}
			on:keydown={(e) => {
				if (e.key === 'Enter' && e.currentTarget.value.trim()) {
					isSearchOpen = true;
				}
			}}
		/>
		{#if searchQuery}
			<button type="button" class="global-search-clear" aria-label="Clear search" on:click={() => { searchQuery = ''; searchInput?.focus(); }}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</button>
		{/if}
	</div>
</div>

<!-- Search Modal - Mobile & Desktop -->
<SearchModal isOpen={isSearchOpen} on:close={() => { isSearchOpen = false; }} initialQuery={searchQuery} />

{#if componentsLoaded}
	<svelte:component this={TranslationProgressBar} />
	<svelte:component this={BackToTop} />
{/if}
<TimeWeatherDock city="Almaty" timeZone="Asia/Almaty" dockLeft={32} />
<Footer {footerConfig} />

<!-- Session Timeout Warning Modal -->
{#if showTimeoutWarning}
	<div class="timeout-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="timeout-title">
		<div class="timeout-modal">
			<h2 id="timeout-title">Session Timeout</h2>
			<p>Your session will expire due to inactivity.</p>
			<p class="countdown">Time remaining: {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}</p>
			<div class="timeout-modal-actions">
				<button class="btn-primary" on:click={() => { showTimeoutWarning = false; }}>
					Stay Logged In
				</button>
				<button class="btn-secondary" on:click={() => goto('/')}>
					Sign Out
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.timeout-modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
	}

	.timeout-modal {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		max-width: 400px;
		text-align: center;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
	}

	.timeout-modal h2 {
		margin-bottom: 1rem;
		color: #333;
	}

	.timeout-modal p {
		color: #666;
		margin-bottom: 0.5rem;
	}

	.timeout-modal .countdown {
		font-size: 1.5rem;
		font-weight: bold;
		color: #2e7d32;
		margin: 1rem 0;
	}

	.timeout-modal-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 1.5rem;
	}

	.timeout-modal-actions button {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1rem;
	}

	.timeout-modal-actions .btn-primary {
		background: #2e7d32;
		color: white;
	}

	.timeout-modal-actions .btn-secondary {
		background: #e0e0e0;
		color: #333;
	}

	/* Global Search Bar - Mobile only */
	.global-search-bar {
		display: none;
	}

	/* Override any potential issues with parent containers */
	html, body {
		height: 100% !important;
		overflow-x: hidden !important;
		transform: none !important;
		perspective: none !important;
		filter: none !important;
	}

	/* Ensure search bar is always visible */
	@media (max-width: 767px) {
		.global-search-bar {
			display: flex !important;
			position: fixed !important;
			bottom: max(0px, env(safe-area-inset-bottom)) !important;
			left: 0 !important;
			right: 0 !important;
			width: 100vw !important;
			max-width: 100% !important;
			padding: 0.75rem 1rem !important;
			padding-bottom: calc(0.75rem + max(0px, env(safe-area-inset-bottom))) !important;
			background: rgba(255, 255, 255, 0.97);
			z-index: 10000 !important;
			box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
			justify-content: center !important;
			align-items: center !important;
			box-sizing: border-box !important;
			-webkit-transform: translateZ(0) !important;
			transform: translateZ(0) !important;
			will-change: transform !important;
			-webkit-backface-visibility: hidden !important;
			backface-visibility: hidden !important;
		}

		.global-search-wrapper {
			width: 100% !important;
			max-width: 600px !important;
			position: relative !important;
			display: flex !important;
			align-items: center !important;
			margin: 0 auto !important;
			justify-content: center !important;
			flex-shrink: 0 !important;
		}

		.global-search-wrapper input {
			width: 100% !important;
			max-width: 100% !important;
			padding: 0.55rem 2.5rem 0.55rem 1rem !important;
			font-size: 16px !important;
			border: 1px solid rgba(0, 0, 0, 0.2) !important;
			border-radius: 0.75rem !important;
			background: #fff !important;
			color: #0f172a !important;
			outline: none !important;
			font-weight: 500 !important;
			box-sizing: border-box !important;
			text-align: left !important;
			flex: 1 !important;
		}

		.global-search-wrapper input::placeholder {
			color: rgba(0, 0, 0, 0.4);
		}

		.global-search-clear {
			position: absolute;
			right: 0.5rem;
			top: 50%;
			transform: translateY(-50%);
			background: rgba(0, 0, 0, 0.1);
			border: none;
			cursor: pointer;
			padding: 0.4rem;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			min-width: 28px;
			min-height: 28px;
			z-index: 2;
		}

		.global-search-clear:hover {
			background: rgba(0, 0, 0, 0.15);
		}
	}
</style>
