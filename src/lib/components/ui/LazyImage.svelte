<script lang="ts">
	import { onMount } from 'svelte';
	import { generateBlurPlaceholder, generateResponsiveSrcSet } from '$lib/utils/imageOptimizer';

	export let src: string;
	export let alt: string;
	export let width: number | undefined = undefined;
	export let height: number | undefined = undefined;
	export let sizes: string = '100vw';
	export let lazy: boolean = true;

	let loaded = false;
	let imgElement: HTMLImageElement;

	$: blurSrc = generateBlurPlaceholder(src);
	$: srcset = generateResponsiveSrcSet(src);

	onMount(() => {
		if (!lazy) {
			loaded = true;
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						loaded = true;
						observer.disconnect();
					}
				});
			},
			{ rootMargin: '50px' }
		);

		if (imgElement) {
			observer.observe(imgElement);
		}

		return () => observer.disconnect();
	});
</script>

<div class="lazy-image-wrapper" class:loaded>
	<!-- Blur placeholder -->
	<img class="blur-placeholder" src={blurSrc} aria-hidden="true" alt="" />

	<!-- Actual image -->
	{#if loaded || !lazy}
		<img
			bind:this={imgElement}
			class="main-image"
			{src}
			{srcset}
			{sizes}
			{alt}
			{width}
			{height}
			loading={lazy ? 'lazy' : 'eager'}
			on:load={() => (loaded = true)}
		/>
	{:else}
		<img bind:this={imgElement} class="main-image" aria-hidden="true" alt="" />
	{/if}
</div>

<style>
	.lazy-image-wrapper {
		position: relative;
		overflow: hidden;
		background: rgba(15, 23, 42, 0.5);
	}

	.blur-placeholder {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: blur(20px);
		transform: scale(1.1);
		transition: opacity 0.3s ease;
	}

	.lazy-image-wrapper.loaded .blur-placeholder {
		opacity: 0;
	}

	.main-image {
		position: relative;
		width: 100%;
		height: auto;
		object-fit: cover;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.lazy-image-wrapper.loaded .main-image {
		opacity: 1;
	}
</style>
