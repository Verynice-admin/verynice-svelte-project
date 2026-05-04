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
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: 2px solid #0a84ff;
		background: white;
		cursor: pointer;
		box-shadow: 0 2px 10px rgba(0,0,0,0.2);
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.handle .dot {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #0a84ff;
	}
	
	.handle:hover {
		background: #0a84ff;
	}

	.handle:hover .dot {
		background: white;
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
