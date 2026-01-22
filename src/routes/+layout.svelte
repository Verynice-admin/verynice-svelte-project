<script lang="ts">
	import '../styles/index.css';
	import SiteHeader from '$components/layout/header/SiteHeader.svelte';
	import Footer from '$components/layout/footer/Footer.svelte';
	// Lazy load non-critical components for better performance
	import { onMount } from 'svelte';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { get } from 'svelte/store';
	import { currentLanguage } from '$lib/stores/languageStore';
	import { translatePageTo, translationStatus } from '$lib/services/aiTranslator';

	import type { LayoutData } from './$types';
	export let data: LayoutData;
	const headerConfig = data.headerConfig ?? {};
	const footerConfig = data.footerContent ?? {};

	// Lazy loaded components
	let TimeWeatherDock: any;
	let BackToTop: any;
	let TranslationProgressBar: any;
	let componentsLoaded = false;

	if (browser) {
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
		// Use requestIdleCallback or setTimeout for better performance
		const loadComponents = () => {
			Promise.all([
				import('$components/features/widgets/TimeWeatherDock.svelte'),
				import('$components/features/ui-elements/BackToTop.svelte'),
				import('$lib/components/ui/TranslationProgressBar.svelte')
			]).then(([timeWeather, backToTop, translation]) => {
				TimeWeatherDock = timeWeather.default;
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
	});
</script>

<SiteHeader {headerConfig} />

<slot />

{#if componentsLoaded}
	<svelte:component this={TranslationProgressBar} />
	<svelte:component this={TimeWeatherDock} city="Almaty" timeZone="Asia/Almaty" dockLeft={32} />
	<svelte:component this={BackToTop} />
{/if}
<Footer {footerConfig} />
