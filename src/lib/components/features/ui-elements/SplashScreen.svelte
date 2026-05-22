<script lang="ts">
	import { onMount } from 'svelte';
	import { getCloudinaryUrl } from '$lib/utils/cloudinary';

	const STORAGE_KEY = 'vnk_splash_shown';

	let show = false;
	let fading = false;

	const logoUrl = getCloudinaryUrl('content/pages/aboutBorat/Borat_logo_image', {
		width: 640,
		quality: 'auto:best',
		fetch_format: 'auto'
	});

	onMount(() => {
		const isFirstVisit = !localStorage.getItem(STORAGE_KEY);
		const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
		const isReload = navEntry?.type === 'reload';

		if (isFirstVisit || isReload) {
			show = true;
			setTimeout(() => {
				fading = true;
				setTimeout(() => {
					show = false;
					localStorage.setItem(STORAGE_KEY, '1');
				}, 900);
			}, 6000);
		}
	});
</script>

{#if show}
	<div class="splash" class:fading aria-live="polite" role="status">
		<div class="splash-inner">
			<img src={logoUrl} alt="VeryNice.kz logo" class="splash-logo" />
			<h1 class="splash-title">Welcome to VeryNice.kz</h1>
			<p class="splash-text">
				Your guide to Kazakhstan's most iconic places and timeless attractions — from the
				soaring peaks of the Tien Shan to the ancient Silk Road cities of the south.
			</p>
			<span class="splash-hint">Loading your journey…</span>
		</div>
	</div>
{/if}

<style>
	.splash {
		position: fixed;
		inset: 0;
		z-index: 99999;
		background: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 1;
		transition: opacity 0.9s ease;
	}

	.splash.fading {
		opacity: 0;
		pointer-events: none;
	}

	.splash-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.75rem;
		padding: 2rem;
		text-align: center;
		max-width: 560px;
		animation: rise 0.8s ease both;
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.splash-logo {
		width: clamp(160px, 38vw, 300px);
		height: auto;
		object-fit: contain;
	}

	.splash-title {
		font-family: 'Outfit', sans-serif;
		font-size: clamp(1.6rem, 4vw, 2.4rem);
		font-weight: 900;
		color: #0f172a;
		letter-spacing: -0.03em;
		margin: 0;
	}

	.splash-text {
		font-size: clamp(0.95rem, 2vw, 1.1rem);
		color: #475569;
		line-height: 1.75;
		margin: 0;
	}

	.splash-hint {
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: #94a3b8;
	}
</style>
