<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { fade } from 'svelte/transition';

	let isVisible = false;

	function handleScroll() {
		isVisible = window.scrollY > 100;
	}

	function scrollToTop() {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	}

	onMount(() => {
		if (browser) {
			window.addEventListener('scroll', handleScroll, { passive: true });
			// Initial check
			handleScroll();
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('scroll', handleScroll);
		}
	});
</script>

{#if isVisible}
	<button
		id="back-to-top"
		on:click={scrollToTop}
		aria-label="Back to top"
		transition:fade={{ duration: 250 }}
	>
		<!-- Minimal Chevron Up Icon -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M18 15l-6-6-6 6" />
		</svg>
	</button>
{/if}

<style>
	#back-to-top {
		position: fixed;
		z-index: 2147483647 !important;
		bottom: 2rem;
		right: 2rem;
		width: 48px;
		height: 48px;
		border-radius: 12px; /* Modern "Squircle" shape */
		background: #fff;
		color: rgb(1, 134, 200); /* Theme Blue */
		border: 2px solid rgba(0, 0, 0, 0.05); /* Very subtle border */
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* Soft shadow */
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		padding: 0;
	}

	#back-to-top:hover {
		transform: translateY(-4px); /* Lift effect */
		box-shadow: 0 12px 20px rgba(1, 134, 200, 0.15); /* Colored shadow on hover */
		background: rgb(1, 134, 200);
		color: white;
		border-color: transparent;
	}

	#back-to-top:active {
		transform: translateY(-1px);
	}

	svg {
		transition: transform 0.3s ease;
	}
</style>
