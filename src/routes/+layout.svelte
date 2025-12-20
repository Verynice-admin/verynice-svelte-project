<script lang="ts">
	import '../styles/index.css';
	import SiteHeader from '$components/layout/header/SiteHeader.svelte';
	import Footer from '$components/layout/footer/Footer.svelte';
	import TimeWeatherDock from '$components/features/widgets/TimeWeatherDock.svelte';
	import BackToTop from '$components/features/ui-elements/BackToTop.svelte';
	export let data;
	const headerConfig = data?.headerConfig ?? {};
	const footerConfig = data?.footerContent ?? {};
</script>

<SiteHeader {headerConfig} />

<slot />

<Footer {footerConfig} />
<TimeWeatherDock city="Almaty" timeZone="Asia/Almaty" dockLeft={32} />
<BackToTop />
