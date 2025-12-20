<script>
	import { browser } from '$app/environment';
	import TimeWeather from '$components/features/widgets/TimeWeather.svelte';
	export let dockLeft = 32;
	// NEW: pass city + timezone down
	export let city = 'Almaty';
	export let timeZone = 'Asia/Almaty';
</script>

{#if browser}
	<aside
		class="cu-weather-dock"
		aria-label="Current conditions"
		style={`--dock-left:${dockLeft}px`}
	>
		<div class="inner">
			<button class="handle" type="button" aria-label="Show current conditions"></button>
			<div class="card" role="region" aria-label="Current conditions panel">
				<TimeWeather {city} {timeZone} />
			</div>
		</div>
	</aside>
{/if}

<style>
	:root {
		--cu-font: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', Segoe UI, Roboto,
			Inter, Arial, sans-serif;
		--cu-bg: #fff;
		--cu-bg-translucent: rgba(255, 255, 255, 0.78);
		--cu-text: #1c1c1e;
		--cu-rail: #c7c7cc;
		--cu-accent: #0a84ff;
		--cu-glow: rgba(10, 132, 255, 0.28);
		--cu-hairline: #d1d1d6;
		--cu-shadow: 0 12px 28px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
	}
	@media (prefers-color-scheme: dark) {
		:root {
			--cu-bg: #1c1c1e;
			--cu-bg-translucent: rgba(28, 28, 30, 0.72);
			--cu-text: #f2f2f7;
			--cu-rail: #636366;
			--cu-hairline: #3a3a3c;
			--cu-shadow: 0 18px 42px rgba(0, 0, 0, 0.55), 0 2px 12px rgba(0, 0, 0, 0.35);
		}
	}

	.cu-weather-dock {
		position: fixed;
		top: 50%;
		left: var(--dock-left, 32px);
		transform: translateY(-50%);
		z-index: 380;
		font-family: var(--cu-font);
		pointer-events: auto;
		padding: 6px;
	}
	.cu-weather-dock .inner {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
	}

	/* Round handle */
	.handle {
		width: 42px;
		height: 42px;
		border-radius: 999px;
		border: none;
		background: color-mix(in srgb, var(--cu-rail) 30%, transparent);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			background 0.25s,
			box-shadow 0.25s,
			transform 0.25s;
	}
	.handle::before {
		content: '';
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--cu-rail);
		transition:
			background 0.25s,
			transform 0.25s;
	}
	.handle:hover,
	.handle:focus {
		background: color-mix(in srgb, var(--cu-accent) 10%, transparent);
		box-shadow: 0 0 0 6px var(--cu-glow);
	}
	.handle:hover::before,
	.handle:focus::before {
		background: var(--cu-accent);
		transform: scale(1.1);
	}

	/* Glass card */
	.card {
		min-width: 300px;
		max-width: 360px;
		padding: 12px 14px;
		background: var(--cu-bg-translucent);
		color: var(--cu-text);
		border: 0.5px solid var(--cu-hairline);
		border-radius: 16px;
		box-shadow: var(--cu-shadow);
		opacity: 0;
		transform: translateX(-10px);
		pointer-events: none;
		backdrop-filter: saturate(180%) blur(16px);
		-webkit-backdrop-filter: saturate(180%) blur(16px);
		transition:
			opacity 0.22s ease,
			transform 0.28s cubic-bezier(0.25, 0.6, 0.3, 1);
	}
	/* Show card when hovering button or the card itself */
	.handle:hover ~ .card,
	.card:hover,
	.cu-weather-dock:focus-within .card {
		opacity: 1;
		transform: translateX(0);
		pointer-events: auto;
	}

	@media (max-width: 1200px) {
		.cu-weather-dock {
			display: none;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.card,
		.handle {
			transition: none !important;
		}
		.card {
			opacity: 1;
			transform: none;
		}
	}
</style>
