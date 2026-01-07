<script>
	import { translationStatus } from '$lib/services/aiTranslator';
	import { fade } from 'svelte/transition';

	$: isLoading = $translationStatus === 'loading';
</script>

{#if isLoading}
	<div class="translation-progress-bar" transition:fade={{ duration: 200 }}>
		<div class="progress-fill"></div>
	</div>
{/if}

<style>
	.translation-progress-bar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 4px;
		background: rgba(255, 255, 255, 0.1);
		z-index: 9999;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--vnk-accent-color), #39dff8, var(--vnk-accent-color));
		background-size: 200% 100%;
		width: 100%;
		animation:
			progress-shimmer 2s infinite linear,
			progress-indefinite 20s cubic-bezier(0, 0.5, 0.5, 1) forwards;
		transform-origin: left;
	}

	@keyframes progress-shimmer {
		0% {
			background-position: 100% 0;
		}
		100% {
			background-position: -100% 0;
		}
	}

	@keyframes progress-indefinite {
		0% {
			transform: scaleX(0);
		}
		50% {
			transform: scaleX(0.7);
		}
		100% {
			transform: scaleX(0.95);
		}
	}
</style>
