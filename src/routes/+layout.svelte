<script lang="ts">
	import '../styles/index.css';
	import SiteHeader from '$components/layout/header/SiteHeader.svelte';
	import Footer from '$components/layout/footer/Footer.svelte';
	import TimeWeatherDock from '$components/features/widgets/TimeWeatherDock.svelte';
	import BackToTop from '$components/features/ui-elements/BackToTop.svelte';
	import TranslationProgressBar from '$lib/components/ui/TranslationProgressBar.svelte';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { get } from 'svelte/store';
	import { currentLanguage } from '$lib/stores/languageStore';
	import { translatePageTo, translationStatus } from '$lib/services/aiTranslator';

	import type { LayoutData } from './$types';
	export let data: LayoutData;
	const headerConfig = data.headerConfig ?? {};
	const footerConfig = data.footerContent ?? {};

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
				console.log(`[Translation] Re-applying ${lang} to new page...`);
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
</script>

<SiteHeader {headerConfig} />

<slot />

<TranslationProgressBar />
<Footer {footerConfig} />
<TimeWeatherDock city="Almaty" timeZone="Asia/Almaty" dockLeft={32} />
<BackToTop />
