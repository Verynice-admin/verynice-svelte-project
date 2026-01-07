<script>
	import { currentLanguage } from '$lib/stores/languageStore';
	import { get } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import { clickOutside } from '$lib/utils/clickOutside';
	import { translatePageTo, translationStatus } from '$lib/services/aiTranslator';
	import TranslationDisclaimer from '$lib/components/ui/TranslationDisclaimer.svelte';

	export let isCompact = false;
	let isOpen = false;
	let translationError = '';

	$: isTranslating = $translationStatus === 'loading';

	// Supported languages: Eng, Kaz, Rus, French, German, Spanish, Chinese, Japanese, Arabic
	// Supported languages with flags
	const languages = [
		{
			code: 'EN',
			label: 'Eng',
			name: 'English',
			flag: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#00247d"/><path d="M16 16v16m0-16V0m0 16h16m-16 0H0" stroke="#f9f9f9" stroke-width="4"/><path d="m0 32 32-32M0 0l32 32" stroke="#f9f9f9" stroke-width="3"/><path d="m0 32 12-12m8 8 12-12M0 0l12 12m8-8 12 12" stroke="#cf142b" stroke-width="2"/><path d="M16 16v16m0-16V0m0 16h16m-16 0H0" stroke="#cf142b" stroke-width="2"/></svg>`
		},
		{
			code: 'KK',
			label: 'Kaz',
			name: 'Kazakh',
			flag: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#00afca"/><circle cx="16" cy="16" r="8" fill="#ffc629"/><path d="M16 10l2 4 4-2-2 4 4 2-4 2 2 4-4-2-2 4-2-4-4 2 2-4-4-2 4-2-2-4 4 2z" fill="#ffc629"/></svg>`
		},
		{
			code: 'RU',
			label: 'Rus',
			name: 'Russian',
			flag: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><clipPath id="a"><circle cx="16" cy="16" r="16"/></clipPath><g clip-path="url(#a)"><path d="M0 0h32v32H0z" fill="#fff"/><path d="M0 10.6h32v10.6H0z" fill="#0039a6"/><path d="M0 21.3h32V32H0z" fill="#d52b1e"/></g></svg>`
		},
		{
			code: 'FR',
			label: 'Fra',
			name: 'French',
			flag: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><clipPath id="b"><circle cx="16" cy="16" r="16"/></clipPath><g clip-path="url(#b)"><path d="M0 0h32v32H0z" fill="#fff"/><path d="M0 0h10.6v32H0z" fill="#002395"/><path d="M21.3 0H32v32H21.3z" fill="#ed2939"/></g></svg>`
		},
		{
			code: 'DE',
			label: 'Ger',
			name: 'German',
			flag: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><clipPath id="c"><circle cx="16" cy="16" r="16"/></clipPath><g clip-path="url(#c)"><path d="M0 0h32v10.6H0z" fill="#000"/><path d="M0 10.6h32v10.6H0z" fill="#d00"/><path d="M0 21.3h32V32H0z" fill="#ffce00"/></g></svg>`
		},
		{
			code: 'ES',
			label: 'Spa',
			name: 'Spanish',
			flag: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><clipPath id="d"><circle cx="16" cy="16" r="16"/></clipPath><g clip-path="url(#d)"><path d="M0 0h32v32H0z" fill="#ffc400"/><path d="M0 0h32v8H0zm0 24h32v8H0z" fill="#c60b1e"/></g></svg>`
		},
		{
			code: 'ZH',
			label: 'Chi',
			name: 'Chinese',
			flag: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><clipPath id="e"><circle cx="16" cy="16" r="16"/></clipPath><g clip-path="url(#e)"><path d="M0 0h32v32H0z" fill="#de2910"/><getPath d="M5 5l2 6h-6l5 4-2 6 5-4 5 4-2-6 5-4h-6z" fill="#ffde00" transform="scale(0.5) translate(8,8)"/></g></svg>`
		},
		{
			code: 'JA',
			label: 'Jap',
			name: 'Japanese',
			flag: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><clipPath id="f"><circle cx="16" cy="16" r="16"/></clipPath><g clip-path="url(#f)"><path d="M0 0h32v32H0z" fill="#fff"/><circle cx="16" cy="16" r="6" fill="#bc002d"/></g></svg>`
		},
		{
			code: 'AR',
			label: 'Ara',
			name: 'Arabic',
			flag: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><clipPath id="g"><circle cx="16" cy="16" r="16"/></clipPath><g clip-path="url(#g)"><path d="M0 0h32v10.6H0z" fill="#00732f"/><path d="M0 10.6h32v10.6H0z" fill="#fff"/><path d="M0 21.3h32V32H0z" fill="#000"/><path d="M0 0v32l10.6-16z" fill="#f00"/></g></svg>`
		}
	];

	async function selectLanguage(code) {
		if (get(currentLanguage) === code && $translationStatus !== 'error') {
			isOpen = false;
			return;
		}

		translationError = '';
		isOpen = false; // Close immediately for better feedback

		const previous = get(currentLanguage);
		currentLanguage.set(code);

		try {
			const ok = await translatePageTo(code);

			if (!ok) {
				console.error('Failed to translate content for language', code);
				currentLanguage.set(previous);
				translationError = 'Translation failed. Please try again.';
			}
		} catch (error) {
			console.error('Unexpected translation error', error);
			currentLanguage.set(previous);
			translationError = 'Translation failed. Please try again.';
		}
	}

	function toggle() {
		isOpen = !isOpen;
	}

	function close() {
		isOpen = false;
	}
</script>

<div class="language-selector" data-no-ai-translate use:clickOutside on:click_outside={close}>
	<button
		class="current-lang"
		class:compact={isCompact}
		on:click={toggle}
		aria-label="Select Language"
		aria-haspopup="true"
		aria-expanded={isOpen}
		aria-busy={isTranslating}
	>
		{#if !isCompact}
			<span class="current-flag">
				{@html languages.find((l) => l.code === $currentLanguage)?.flag || ''}
			</span>
		{/if}
		<span class="lang-code">{$currentLanguage}</span>
		{#if isTranslating}
			<span class="lang-spinner" aria-hidden="true"></span>
		{/if}
		<svg
			class="chevron"
			class:open={isOpen}
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<polyline points="6 9 12 15 18 9"></polyline>
		</svg>
	</button>

	{#if isOpen}
		<div class="dropdown" transition:fade={{ duration: 150 }}>
			{#each languages as lang}
				<button
					class="lang-option"
					class:active={$currentLanguage === lang.code}
					on:click={() => selectLanguage(lang.code)}
				>
					<span class="flag-icon">{@html lang.flag}</span>
					<span class="option-label">{lang.label}</span>
					<span class="option-name">{lang.name}</span>
				</button>
			{/each}
		</div>
	{/if}

	{#if translationError}
		<p class="translation-error" role="alert">{translationError}</p>
	{/if}

	<TranslationDisclaimer />
</div>

<style>
	.language-selector {
		position: relative;
		display: inline-flex;
		align-items: center;
		margin: 0;
	}

	.current-lang {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.3);
		color: #f1f5f9;
		padding: 0.35rem 0.75rem;
		border-radius: 9999px; /* Pill shape */
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-family: 'Inter', sans-serif;
		font-size: 0.85rem;
		font-weight: 600;
		transition: all 0.2s ease;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		backdrop-filter: blur(4px);
	}

	.current-lang.compact {
		padding: 0.25rem 0.5rem;
		gap: 0.25rem;
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.current-lang:hover,
	.current-lang[aria-expanded='true'] {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.6);
		color: #fff;
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.current-flag {
		display: flex;
		align-items: center;
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 50%;
		overflow: hidden;
	}

	.current-flag :global(svg) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.lang-code {
		position: relative;
		top: 1px;
	}

	.lang-spinner {
		width: 10px;
		height: 10px;
		border-radius: 999px;
		margin-left: 0.35rem;
		border: 2px solid rgba(255, 255, 255, 0.5);
		border-top-color: #fff;
		animation: spin 0.6s linear infinite;
		display: inline-block;
	}

	.chevron {
		transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		opacity: 0.8;
	}
	.chevron.open {
		transform: rotate(180deg);
	}

	.dropdown {
		position: absolute;
		top: calc(100% + 0.75rem);
		right: 0;
		background: white;
		border-radius: 16px;
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05),
			0 0 0 1px rgba(0, 0, 0, 0.05);
		padding: 0.5rem;
		min-width: 200px; /* Slight increase for flags */
		z-index: 1000;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		transform-origin: top right;
		max-height: 400px;
		overflow-y: auto;
	}

	/* Scrollbar for dropdown */
	.dropdown::-webkit-scrollbar {
		width: 6px;
	}
	.dropdown::-webkit-scrollbar-track {
		background: transparent;
	}
	.dropdown::-webkit-scrollbar-thumb {
		background-color: #cbd5e1;
		border-radius: 3px;
	}

	.lang-option {
		background: transparent;
		border: none;
		width: 100%;
		text-align: left;
		padding: 0.6rem 1rem;
		border-radius: 12px;
		color: #334155;
		font-size: 0.9rem;
		font-family: 'Inter', sans-serif;
		cursor: pointer;
		display: flex;
		align-items: center; /* Changed to simple align center */
		gap: 0.75rem; /* Gap for flag */
		transition: all 0.2s;
	}

	.lang-option:hover {
		background: #f1f5f9;
		color: #0f172a;
	}

	.lang-option.active {
		background: #e0f2fe;
		color: #0284c7;
		font-weight: 600;
	}

	.flag-icon {
		display: flex;
		align-items: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		overflow: hidden;
		flex-shrink: 0;
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
	}

	.flag-icon :global(svg) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.option-label {
		text-transform: uppercase;
		font-size: 0.75rem;
		font-weight: 700;
		color: #64748b;
		width: 2rem; /* Fixed width for alignment */
	}

	.lang-option.active .option-label {
		color: #0ea5e9;
	}

	.option-name {
		flex: 1;
		text-align: left; /* Align name to left, next to label */
	}

	.translation-error {
		margin-top: 0.5rem;
		padding: 0.4rem 0.75rem;
		border-radius: 999px;
		font-size: 0.78rem;
		font-weight: 600;
		color: #7f1d1d;
		background: rgba(248, 113, 113, 0.2);
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		position: absolute;
		top: 100%;
		right: 0;
		white-space: nowrap;
		margin-top: 0.75rem;
		backdrop-filter: blur(8px);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 600px) {
		.dropdown {
			right: -50px; /* Adjust for mobile centering/padding */
		}
	}
</style>
