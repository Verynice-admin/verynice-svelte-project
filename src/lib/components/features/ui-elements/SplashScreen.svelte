<script lang="ts">
	import { onMount } from 'svelte';
	const STORAGE_KEY = 'vnk_splash_shown';

	let show = false;
	let fading = false;
	let label = '3';
	let labelVisible = false;
	let isGo = false;

	const logoUrl = '/Borat_logo_image.png';

	function tick(ms: number) {
		return new Promise<void>((r) => setTimeout(r, ms));
	}

	async function swap(next: string, go = false) {
		labelVisible = false;
		await tick(220);
		label = next;
		isGo = go;
		labelVisible = true;
	}

	onMount(async () => {
		const isFirstVisit = !localStorage.getItem(STORAGE_KEY);
		const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
		const isReload = navEntry?.type === 'reload';
		if (!isFirstVisit && !isReload) return;

		show = true;

		// Small pause so the logo/title animate in first
		await tick(600);

		label = '3';
		labelVisible = true;
		await tick(750);
		await swap('2');
		await tick(750);
		await swap('1');
		await tick(750);
		await swap('GO!', true);

		await tick(800);
		fading = true;
		await tick(900);
		show = false;
		localStorage.setItem(STORAGE_KEY, '1');
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

			<div class="label-wrap">
				<span class="label" class:visible={labelVisible} class:go={isGo}>{label}</span>
			</div>

			<div class="progress-track" aria-hidden="true">
				<div class="progress-bar"></div>
			</div>
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
		gap: 1.5rem;
		padding: 2rem;
		text-align: center;
		max-width: 560px;
		animation: rise 0.8s ease both;
	}
	@keyframes rise {
		from { opacity: 0; transform: translateY(18px); }
		to   { opacity: 1; transform: translateY(0); }
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

	.label-wrap {
		height: 2.8rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.label {
		display: block;
		font-family: 'Outfit', sans-serif;
		font-size: 2rem;
		font-weight: 900;
		letter-spacing: 0.04em;
		color: #0f172a;
		opacity: 0;
		transform: scale(1.3);
		transition: opacity 0.22s ease, transform 0.3s cubic-bezier(0.34, 1.4, 0.64, 1);
	}
	.label.visible {
		opacity: 1;
		transform: scale(1);
	}

	.label.go {
		background: linear-gradient(135deg, #1e4a8a 0%, #3b82f6 60%, #06b6d4 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		font-size: 2.4rem;
	}

	.progress-track {
		width: 180px;
		height: 3px;
		background: #e2e8f0;
		border-radius: 99px;
		overflow: hidden;
	}
	.progress-bar {
		height: 100%;
		width: 0%;
		background: linear-gradient(90deg, #1e4a8a, #3b82f6);
		border-radius: 99px;
		animation: fill 3.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}
	@keyframes fill {
		0%   { width: 0%; }
		75%  { width: 85%; }
		100% { width: 100%; }
	}
</style>
