<script>
	import { browser } from '$app/environment';
	import TimeWeather from '$components/features/widgets/TimeWeather.svelte';
	export let dockLeft = 32;
	export let city = 'Almaty';
	export let timeZone = 'Asia/Almaty';
	
	let isOpen = false;
	
	function toggleOpen() {
		isOpen = !isOpen;
	}
	
	function closeOnClickOutside(event) {
		const dock = event.target.closest('.cu-weather-dock');
		if (!dock) {
			isOpen = false;
		}
	}
</script>

<svelte:window on:click={closeOnClickOutside} />

{#if browser}
	<div 
		class="cu-weather-dock"
		class:open={isOpen}
		style="left: {dockLeft}px;"
	>
		<button 
			class="handle" 
			type="button" 
			aria-label="Show current conditions"
			aria-expanded={isOpen}
			on:click|stopPropagation={toggleOpen}
		>
			<span class="dot"></span>
		</button>
		
		{#if isOpen}
			<div 
				class="card" 
				role="region" 
				aria-label="Current conditions panel"
				on:click|stopPropagation
			>
				<TimeWeather {city} {timeZone} />
			</div>
		{/if}
	</div>
{/if}

<style>
	.cu-weather-dock {
		position: fixed;
		top: 50%;
		left: 32px;
		transform: translateY(-50%);
		z-index: 10000;
		display: flex;
		align-items: center;
	}

	.handle {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		border: 1.5px solid rgba(147, 210, 255, 0.7);
		background: linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(224,242,255,0.92) 100%);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		cursor: pointer;
		box-shadow:
			0 4px 18px rgba(59, 130, 246, 0.18),
			0 1px 4px rgba(0, 0, 0, 0.07),
			inset 0 1px 0 rgba(255, 255, 255, 1);
		transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.handle:hover {
		transform: scale(1.1);
		border-color: rgba(96, 165, 250, 0.9);
		box-shadow:
			0 6px 26px rgba(59, 130, 246, 0.28),
			0 2px 8px rgba(0, 0, 0, 0.09),
			inset 0 1px 0 rgba(255, 255, 255, 1);
	}

	.cu-weather-dock.open .handle {
		border-color: rgba(52, 211, 153, 0.8);
		box-shadow:
			0 6px 24px rgba(16, 185, 129, 0.25),
			0 0 0 5px rgba(52, 211, 153, 0.12),
			inset 0 1px 0 rgba(255, 255, 255, 1);
	}

	.handle .dot {
		width: 11px;
		height: 11px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, #7dd3fc, #3b82f6);
		box-shadow: 0 1px 4px rgba(59, 130, 246, 0.4);
		animation: beacon-pulse 2.6s ease-out infinite;
		flex-shrink: 0;
	}

	.cu-weather-dock.open .handle .dot {
		background: radial-gradient(circle at 35% 35%, #6ee7b7, #10b981);
		box-shadow: 0 1px 4px rgba(16, 185, 129, 0.4);
		animation: beacon-pulse-green 2.2s ease-out infinite;
	}

	@keyframes beacon-pulse {
		0%   { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.55); }
		65%  { box-shadow: 0 0 0 9px rgba(59, 130, 246, 0); }
		100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
	}

	@keyframes beacon-pulse-green {
		0%   { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.55); }
		65%  { box-shadow: 0 0 0 9px rgba(16, 185, 129, 0); }
		100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
	}

	.card {
		position: absolute;
		background: white;
		border-radius: 16px;
		box-shadow: 0 8px 30px rgba(0,0,0,0.25);
		padding: 16px;
		min-width: 280px;
		opacity: 0;
		visibility: hidden;
		transition: all 0.2s ease;
		left: calc(100% + 8px);
		top: 50%;
		transform: translateY(-50%);
	}
	
	.cu-weather-dock.open .card {
		opacity: 1;
		visibility: visible;
	}

	@media (max-width: 1200px) {
		.cu-weather-dock {
			display: none;
		}
	}
</style>
