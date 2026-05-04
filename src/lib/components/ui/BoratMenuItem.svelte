<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { getCloudinaryUrl } from '$lib/utils/cloudinary';

	export let url = '/about-borat';

	let phase = 0; // 0=i-Robot, 1=i-Robot-blink, 2=lightning, 3=i-Borat
	let isBlinking = false;

	// Get Cloudinary URLs for the images
	const lightning1Url = browser 
		? getCloudinaryUrl('content/pages/aboutBorat/lightning', { width: 400, height: 100, crop: 'fit', quality: 'auto', fetch_format: 'auto' })
		: '';

	onMount(() => {
		// Phase 0: "i-Robot" normal for 3 seconds
		const timer0 = setTimeout(() => {
			isBlinking = true;
			// Phase 1: "i-Robot" blinks 3 times (about 0.9s), then show lightning
			const timer1 = setTimeout(() => {
				isBlinking = false;
				phase = 2;
				// Phase 2: Lightning GIF for 2 seconds
				const timer2 = setTimeout(() => {
					phase = 3; // Permanent "i-Borat"
				}, 2000);
				return () => clearTimeout(timer2);
			}, 1000);
			return () => clearTimeout(timer1);
		}, 3000);
		return () => clearTimeout(timer0);
	});
</script>

<a href={url} class="borat-menu-item">
	{#if phase === 0}
		<span class="text-phase">i-Robot</span>
	{:else if phase === 1}
		<span class="text-phase blinking">i-Robot</span>
	{:else if phase === 2}
		<img src={lightning1Url} alt="Lightning" class="gif-phase" />
	{:else if phase === 3}
		<span class="text-phase final">i-Borat</span>
	{/if}
</a>

<style>
	.borat-menu-item {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
		vertical-align: middle;
	}

	.text-phase {
		font-weight: 700;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		color: #fff;
		font-size: inherit;
		white-space: nowrap;
		animation: blink 0.3s ease-in-out 3;
	}

	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0; }
	}

	.text-phase.final {
		color: #ffd700; /* Gold color for final state */
		text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
	}

	.gif-phase {
		height: 2.4em;
		width: auto;
		max-width: 240px;
		object-fit: contain;
		vertical-align: middle;
	}
</style>
