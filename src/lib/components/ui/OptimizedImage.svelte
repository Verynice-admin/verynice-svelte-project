<script lang="ts">
	// Optimized Image component with lazy loading and proper loading strategies
	export let src: string;
	export let alt: string;
	export let width: number | string = 'auto';
	export let height: number | string = 'auto';
	export let loading: 'lazy' | 'eager' = 'lazy';
	export let fetchpriority: 'high' | 'low' | 'auto' = 'auto';
	export let className: string = '';
	export let sizes: string = '100vw';
	export let decoding: 'async' | 'sync' | 'auto' = 'async';
	
	// Optional srcset for responsive images
	export let srcset: string = '';
	
	let imgElement: HTMLImageElement;
	let isLoaded = false;
	let hasError = false;

	function handleLoad() {
		isLoaded = true;
	}

	function handleError() {
		hasError = true;
		console.error(`Failed to load image: ${src}`);
	}
</script>

<img
	bind:this={imgElement}
	{src}
	{alt}
	{width}
	{height}
	{loading}
	{fetchpriority}
	{decoding}
	{sizes}
	srcset={srcset || undefined}
	class="{className} {isLoaded ? 'loaded' : 'loading'} {hasError ? 'error' : ''}"
	on:load={handleLoad}
	on:error={handleError}
/>

<style>
	img {
		display: block;
		max-width: 100%;
		height: auto;
	}

	img.loading {
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: loading 1.5s ease-in-out infinite;
	}

	img.loaded {
		animation: fadeIn 0.3s ease-in;
	}

	img.error {
		background: #f0f0f0;
		border: 1px dashed #ccc;
	}

	@keyframes loading {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
</style>
