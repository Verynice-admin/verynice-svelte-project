<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { createEventDispatcher, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	export let isOpen = false;
	export let initialQuery: string;

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		query = target.value;
	}

	function formatAiAnswer(text: string): string {
		// Escape HTML special chars first to prevent injection from AI output,
		// then apply safe structural formatting.
		const escaped = text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');

		return escaped
			.replace(/\n\n+/g, '</p><p>')
			.replace(/\n/g, '<br>')
			.replace(/^(.)/, '<p>$1')
			.replace(/(.)$/, '$1</p>');
	}

	const dispatch = createEventDispatcher();

	let query = '';
	let inputElement: HTMLInputElement;
	let loading = false;
	const placeholder = "Search destinations, pages...";
	let aiResponse: {
		question: string;
		answer: string;
		relatedLinks?: { title: string; url: string }[];
	} | null = null;

	// Simple client-side index of content
	const pages = [
		{
			title: 'Home',
			description: 'Welcome to VeryNice.kz - The Ultimate Guide',
			url: '/',
			keywords: 'home, landing, main, welcome'
		},
		{
			title: 'History of Kazakhstan',
			description: 'Explore the rich history from the Stone Age to Modern Independence.',
			url: '/history',
			keywords: 'history, past, ancient, soviet, independence, khanate'
		},
		{
			title: 'Destinations',
			description: 'Discover the most beautiful places in Kazakhstan.',
			url: '/destinations',
			keywords: 'destinations, places, sights, travel, locations'
		},
		{
			title: 'Culture',
			description: 'Traditions, food, music, and the way of life.',
			url: '/culture',
			keywords: 'culture, food, beshbarmak, music, traditions, yurt'
		},
		{
			title: 'Tips',
			description: 'Travel tips, visa info, and safety advice.',
			url: '/tips',
			keywords: 'tips, advice, help, visa, safety, money'
		},
		{
			title: 'About Borat',
			description: 'The truth about the movie vs reality.',
			url: '/about-borat',
			keywords: 'borat, movie, cohen, facts, myths'
		},
		// --- CITIES ---
		{
			title: 'Almaty City',
			description: 'The cultural capital, nestled in the Trans-Ili Alatau mountains.',
			url: '/destinations/almaty',
			keywords: 'almaty, apple city, mountains, kok tobe, medeu'
		},
		{
			title: 'Astana City',
			description: 'The modern futuristic capital in the heart of the steppes.',
			url: '/destinations/astana',
			keywords: 'astana, capital, nur-sultan, baiterek, khan shatyr'
		},
		{
			title: 'Shymkent',
			description: 'The southern gastronomic heart of Kazakhstan.',
			url: '/destinations/shymkent',
			keywords: 'shymkent, south, food, warmest city'
		},
		// --- TOP ATTRACTIONS (Assumed slugs based on common structure) ---
		{
			title: 'Shymbulak Mountain Resort',
			description: 'World-class skiing and snowboarding just minutes from Almaty.',
			url: '/destinations/shymbulak-ski-resort',
			keywords: 'shymbulak, ski, snowboard, mountains, resort, almaty'
		},
		{
			title: 'Charyn Canyon',
			description: 'The Valley of Castles, often compared to the Grand Canyon.',
			url: '/destinations/charyn-canyon',
			keywords: 'charyn, canyon, nature, desert, valley of castles'
		},
		{
			title: 'Kolsai Lakes',
			description: 'The Pearls of Tien Shan - stunning alpine lakes.',
			url: '/destinations/kolsai-lakes',
			keywords: 'kolsai, lakes, saty, nature, hiking, kayindy'
		},
		{
			title: 'Big Almaty Lake',
			description: 'A turquoise alpine lake supplying water to the city.',
			url: '/destinations/big-almaty-lake',
			keywords: 'big almaty lake, bal, bao, mountains, lake'
		},
		{
			title: 'Burabay (Borovoe)',
			description: 'The "Switzerland of Kazakhstan" with pine forests and lakes.',
			url: '/destinations/burabay-national-park',
			keywords: 'burabay, borovoe, nature, swimming, resort, north'
		},
		{
			title: 'Turkistan & Mausoleum',
			description: 'The spiritual capital and home to Yasawi Mausoleum.',
			url: '/destinations/khoja-ahmed-yasawi-mausoleum',
			keywords: 'turkistan, mausoleum, yasawi, silk road, history, spiritual'
		},
		{
			title: 'Kaindy Lake',
			description: 'The bizarre and beautiful sunken forest.',
			url: '/destinations/kaindy-lake',
			keywords: 'kaindy, sunker forest, lake, saty, nature'
		}
	];

	let filteredPages = pages;

	$: {
		if (query.trim() === '') {
			filteredPages = pages;
		} else {
			const lowerQuery = query.toLowerCase();
			filteredPages = pages.filter(
				(page) =>
					page.title.toLowerCase().includes(lowerQuery) ||
					page.description.toLowerCase().includes(lowerQuery) ||
					page.keywords.toLowerCase().includes(lowerQuery)
			);
		}
	}

	function close() {
		// Don't allow closing during AI search
		if (loading) return;

		dispatch('close');
		// slight delay to clear content after animation starts
		setTimeout(() => {
			if (!isOpen) {
				query = '';
				aiResponse = null;
			}
		}, 300);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen) return;
		if (e.key === 'Escape') {
			e.preventDefault(); // Safety to ensure browser doesn't do default escape actions if any
			// Don't allow closing during AI search
			if (!loading) {
				close();
			}
			return;
		}
		// Don't auto-trigger AI search on Enter - show page results first
		// User can click "Ask AI" button manually if they want AI response
	}

	async function performAiSearch() {
		if (!query.trim() || loading) return;

		loading = true;
		aiResponse = null;

		try {
			const response = await fetch('/api/history/ask-question', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ question: query })
			});

			const data = await response.json();

			if (!response.ok) {
				// Handle HTTP errors
				aiResponse = {
					question: query,
					answer: data.error || "Sorry, I'm having trouble processing your question right now. Please try again."
				};
			} else if (data.aiAnswer) {
				// Success - we have an AI answer
				aiResponse = {
					question: data.correctedQuestion || query,
					answer: data.aiAnswer,
					relatedLinks: data.relatedLinks || []
				};
			} else {
				// No answer returned
				aiResponse = {
					question: query,
					answer: "I'm sorry, I couldn't find a specific answer for that. Please try rephrasing or checking the specific pages."
				};
			}
		} catch (error) {
			console.error('Search error:', error);
			aiResponse = {
				question: query,
				answer: "Sorry, I'm having trouble connecting to the knowledge base right now."
			};
		} finally {
			loading = false;
		}
	}

	function isSafeUrl(url: string): boolean {
		// Allow only root-relative paths (starts with '/' but NOT '//').
		// '//example.com' is a protocol-relative external URL — block it.
		return /^\/[^/]/.test(url);
	}

	function navigateTo(url: string) {
		if (!isSafeUrl(url)) return;
		// Close mobile menu if open before navigation
		const mobileMenu = document.getElementById('mobile-menu');
		const fadeBlock = document.querySelector('.fadeblock');
		if (mobileMenu && mobileMenu.getAttribute('data-open') === 'true') {
			mobileMenu.setAttribute('data-open', 'false');
			mobileMenu.setAttribute('aria-hidden', 'true');
			if (fadeBlock) fadeBlock.classList.remove('active');
			document.body.style.overflow = '';
		}
		goto(url);
		close();
	}

	// Initialize when modal opens
	$: if (isOpen) {
		// Set query from initialQuery if provided, otherwise preserve current state
		if (initialQuery && initialQuery !== query) {
			query = initialQuery;
			// Reset AI state when setting a new query
			aiResponse = null;
			loading = false;
		}
		// Don't reset existing state unless it's completely empty

		// Focus the input
		setTimeout(() => {
			if (inputElement) {
				inputElement.focus();
				// Set cursor to end
				inputElement.selectionStart = inputElement.selectionEnd = inputElement.value.length;
			}
		}, 100);
	}

	// Update filtered pages when query changes
	$: {
		const lowerQuery = query.toLowerCase();
		filteredPages = query.trim() === ''
			? pages
			: pages.filter(
				(page) =>
					page.title.toLowerCase().includes(lowerQuery) ||
					page.description.toLowerCase().includes(lowerQuery) ||
					page.keywords.toLowerCase().includes(lowerQuery)
			);
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<!-- Use click on overlay to close, stop prop on modal -->
	<div
		class="search-overlay"
		transition:fade={{ duration: 200 }}
		on:click={close}
		role="dialog"
		aria-modal="true"
	>
		<div class="search-modal" on:click|stopPropagation transition:fly={{ y: -20, duration: 300 }}>
				<!-- Search Header / Input -->
			<div class="search-header" style="display: flex; align-items: center; padding: 1rem; gap: 0.75rem; border-bottom: 1px solid rgba(0,0,0,0.06); position: relative; z-index: 10000;">
				{#if aiResponse}
					<button type="button" class="back-btn" on:click={() => aiResponse = null} aria-label="Back to results">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>
					<div style="flex: 1; text-align: center; color: #64748b; font-size: 0.9rem;">
						Search results for "{query}"
					</div>
				{:else}
					<div style="color: #64748b; display: flex; align-items: center; flex-shrink: 0;">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M21 21L15.0001 15.0001M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
					</div>
					<div style="position: relative; flex: 1; display: flex; align-items: center;">
						<input
bind:this={inputElement}
							type="text"
							autocomplete="off"
							autocorrect="off"
							autocapitalize="off"
							spellcheck="false"
							placeholder={placeholder}
							value={query}
							on:input={handleInput}
							on:keydown={(e) => { if (e.key === 'Enter' && query.trim()) performAiSearch(); }}
							readonly={false}
							disabled={false}
							style="width: 100%; padding: 0.75rem 2.5rem 0.75rem 0; font-family: inherit; font-size: 1.1rem; font-weight: 500; border: 1px solid transparent; outline: none; color: #0f172a; background: rgba(255, 255, 255, 0.1); line-height: 1.5; z-index: 10001; pointer-events: auto !important; touch-action: manipulation; cursor: text;"
						/>
						{#if query}
							<button
								type="button"
								style="position: absolute; right: 0.25rem; z-index: 10002; background: rgba(0, 0, 0, 0.1); border: none; cursor: pointer; padding: 0.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; min-width: 32px; min-height: 32px;"
								on:mousedown|preventDefault
								on:click={() => { query = ''; setTimeout(() => inputElement?.focus(), 50); }}
								aria-label="Clear input"
							>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: #475569;">
									<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</button>
						{/if}
					</div>
				{/if}
				<!-- Close button always visible inside header -->
				<button class="close-btn" on:click={close} aria-label="Close">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
			</div>

			<!-- Search Body -->
			<div class="search-body">
				{#if loading}
					<div class="ai-state loading">
						<div class="spinner"></div>
						<span>Getting travel tips for "{query}"...</span>
					</div>
				{:else if aiResponse}
					<div class="ai-state result">
						<div class="ai-header">
							<span class="badge">AI</span>
							<h4>{aiResponse.question}</h4>
						</div>
						<div class="ai-answer">
							{@html formatAiAnswer(aiResponse.answer)}
						</div>
						{#if aiResponse.relatedLinks && aiResponse.relatedLinks.length > 0}
							<div class="ai-related-links">
								<span class="related-label">Related Pages</span>
								<div class="related-links-list">
									{#each aiResponse.relatedLinks as link}
										{#if isSafeUrl(link.url)}
											<a href={link.url} on:click|preventDefault={() => navigateTo(link.url)} class="related-link">
												{link.title}
											</a>
										{/if}
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<div class="results-group">
						<h5>Destinations</h5>
						<ul>
							{#each filteredPages.slice(0, 5) as page}
								<li>
									<a href={page.url} on:click|preventDefault={() => navigateTo(page.url)}>
										<div class="result-icon">
											<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
												<path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="2"/>
											</svg>
										</div>
										<div class="result-content">
											<span class="result-title">{page.title}</span>
											<span class="result-desc">{page.description}</span>
										</div>
									</a>
								</li>
							{/each}
						</ul>
					</div>
					{#if query.trim()}
						<button type="button" class="action-btn" on:click={() => performAiSearch()} style="margin-top: 1rem; cursor: pointer;">
							<span class="action-icon">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
									<path d="M12 3L4 9V21H20V9L12 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
									<path d="M12 12V16M12 8V8.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</span>
							<div class="action-content">
								<span class="action-title">Ask AI about "{query}"</span>
								<span class="action-desc">Get travel tips and recommendations</span>
							</div>
						</button>
					{/if}
				{/if}
			</div>

			<div class="search-footer">
				<div class="key-hints">
					<span class="key-hint">
						<kbd>↵</kbd>
						<span>to select / ask</span>
					</span>
					<span class="key-hint">
						<kbd>esc</kbd>
						<span>to close</span>
					</span>
				</div>
				<button class="mobile-close-btn" on:click={close} aria-label="Close search">
					✕ Close
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* 
    Glassmorphism & Base Layout 
    */
	.search-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(122, 189, 170, 0.4); /* Darker, richer overlay */
		backdrop-filter: blur(12px);
		z-index: 9999;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		padding-top: 8vh; /* Less top padding since modal has its own margins */
		padding-bottom: 4vh; /* Add bottom padding too */
	}

	.search-modal {
		width: 100%;
		max-width: 640px;
		background: rgba(255, 255, 255, 0.98); /* Even more opaque */
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border-radius: 28px; /* More rounded corners */
		box-shadow:
			0 25px 50px -12px rgba(0, 0, 0, 0.25),
			0 0 0 3px rgba(17, 63, 114, 0.15) inset; /* More visible border */
		overflow: auto;
		display: flex;
		flex-direction: column;
		max-height: calc(100vh - 12rem); /* Leave more space at bottom */
		border: 3px solid rgba(17, 63, 114, 0.25); /* More defined border */
		transform: translateZ(0); /* Hardware acceleration */
		margin: 3rem 2rem; /* More top margin, horizontal margin */
		margin-bottom: 6rem; /* Much more bottom margin */
		color: #1e293b; /* Ensure all text is dark */
	}

	/* Ensure all text elements are visible */
	.search-modal * {
		color: inherit;
	}

	/* Mobile responsive */
	@media (max-width: 767px) {
		.search-modal {
			max-height: calc(100vh - 10rem); /* Leave more space on mobile */
			width: calc(100% - 2rem);
			margin: 2rem 1rem; /* More top margin */
			margin-bottom: 5rem; /* More bottom margin */
			touch-action: manipulation;
			border-radius: 24px; /* Keep rounded on mobile */
			color: #1e293b; /* Ensure all text is dark on mobile */
		}

		/* Ensure all text elements are visible on mobile */
		.search-modal * {
			color: inherit;
		}

		.search-header {
			padding: 1rem;
			gap: 0.75rem;
			position: relative;
			z-index: 100;
		}

		.search-header input {
			font-size: 16px; /* Prevent zoom on iOS */
			padding-right: 3rem;
			touch-action: manipulation;
			pointer-events: auto !important;
		}

		.search-input-wrapper {
			position: relative;
			z-index: 100;
			pointer-events: auto !important;
		}

		.search-icon-wrapper svg,
		.close-btn svg,
		.clear-input-btn svg,
		.back-btn svg {
			width: 18px;
			height: 18px;
		}

		.close-btn {
			padding: 0.5rem;
			min-width: 44px;
			min-height: 44px;
			display: flex;
			align-items: center;
			justify-content: center;
			background: rgba(0, 0, 0, 0.05);
			border-radius: 8px;
		}

		.clear-input-btn {
			right: 0.5rem !important;
			padding: 0.5rem;
			min-width: 36px;
			min-height: 36px;
			display: flex !important;
			align-items: center;
			justify-content: center;
			background: rgba(0, 0, 0, 0.08);
			border-radius: 50%;
		}

		.search-input-wrapper {
			position: relative;
		}

		.results-group h5 {
			font-size: 0.75rem;
			color: #1e293b;
		}

		.result-title {
			font-size: 0.9rem;
			color: #1e293b;
		}

		.result-desc {
			font-size: 0.75rem;
			color: #64748b;
		}

		.clear-ai-btn,
		.action-btn {
			width: 100%;
			justify-content: center;
		}

		.key-hints {
			display: none;
		}

		.mobile-close-btn {
			display: flex;
		}
	}

	/* 
    Header & Input 
    */
	.search-header {
		display: flex;
		align-items: center;
		padding: 1.25rem 1.75rem;
		padding-right: 0.5rem;
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);
		gap: 0.5rem;
		position: relative;
		z-index: 100;
	}

	.search-header > * {
		flex-shrink: 0;
		z-index: 100;
	}

	.search-input-wrapper {
		flex: 1;
		position: relative;
		display: flex;
		align-items: center;
		z-index: 100;
		pointer-events: auto;
	}

	.search-icon-wrapper {
		color: #64748b;
		display: flex;
		align-items: center;
		filter: drop-shadow(0 1px 1px rgba(255, 255, 255, 0.5));
		z-index: 100;
	}

	.search-header input {
		flex: 1;
		font-family: 'Inter', system-ui, -apple-system, sans-serif;
		font-size: 1.25rem;
		font-weight: 500;
		border: none;
		outline: none;
		color: #0f172a;
		background: transparent;
		line-height: 1.5;
		padding-right: 2rem;
		pointer-events: auto;
		z-index: 100;
	}

	.search-input-wrapper {
		flex: 1;
		position: relative;
		display: flex;
		align-items: center;
	}

.search-input-wrapper input {
		width: 100%;
		padding-right: 2.5rem;
	}

	.search-header input::placeholder {
		color: #94a3b8;
		font-weight: 400;
	}

	.close-btn {
		background: rgba(0, 0, 0, 0.03);
		border: none;
		color: #64748b;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 10px;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 30;
		pointer-events: auto;
	}

	.close-btn:hover {
		color: #0f172a;
		background: rgba(0, 0, 0, 0.06);
		transform: scale(0.95);
	}

	.clear-input-btn {
		background: rgba(0, 0, 0, 0.05);
		border: none;
		color: #64748b;
		cursor: pointer;
		padding: 0.4rem;
		display: flex;
		align-items: center;
		justify-content: center;
		position: absolute;
		right: 0;
		z-index: 20;
		border-radius: 50%;
		pointer-events: auto;
	}

	.clear-input-btn:hover {
		color: #0f172a;
		background: rgba(0, 0, 0, 0.1);
	}

	.back-btn {
		background: none;
		border: none;
		color: #64748b;
		cursor: pointer;
		padding: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.back-btn:hover {
		color: #0f172a;
	}

	.search-header input {
		padding-right: 4rem;
	}

	/* 
    Body & Results 
    */
	.search-body {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
		scrollbar-width: thin;
		scrollbar-color: #cbd5e1 transparent;
	}

	/* Remove dots/bullets explicitly */
	ul {
		list-style: none !important;
		margin: 0 !important;
		padding: 0 !important;
	}

	li {
		list-style: none !important;
		margin: 0 !important;
		padding: 0 !important;
	}

	li::before,
	li::after {
		content: none !important;
		display: none !important;
	}

	.results-group {
		margin-bottom: 1.5rem;
	}

	.results-group h5 {
		margin: 0.5rem 0.75rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 700;
		color: #1e293b;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	li {
		margin-bottom: 0.25rem !important;
	}

	li a {
		display: grid;
		grid-template-columns: 24px 1fr auto;
		align-items: center;
		gap: 1rem;
		padding: 0.875rem 1rem;
		border-radius: 12px;
		text-decoration: none;
		color: #1e293b;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		border: 1px solid transparent;
	}

	li a:hover,
	li a:focus {
		background: #f1f5f9;
		/* Subtle scale effect */
		transform: scale(0.995);
		border-color: rgba(0, 0, 0, 0.04);
	}

	.result-icon {
		color: #94a3b8;
		display: flex;
		justify-content: center;
	}

	li a:hover .result-icon {
		color: #3b82f6; /* Highlight icon on hover */
	}

	.result-content {
		overflow: hidden;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.result-title {
		display: block;
		font-weight: 600;
		color: #1e293b;
		font-size: 1rem;
	}

	.result-desc {
		display: block;
		color: #64748b;
		font-size: 0.85rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.result-enter {
		opacity: 0;
		transform: translateX(-10px);
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		color: #cbd5e1;
	}

	li a:hover .result-enter {
		opacity: 1;
		transform: translateX(0);
	}

	/* 
    Action Button (Ask AI) 
    */
	.action-btn {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.25rem;
		border: none;
		background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
		border-radius: 12px;
		cursor: pointer;
		text-align: left;
		transition: all 0.2s ease;
		box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
		color: #1e293b;
	}

	.action-btn:hover {
		background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
		transform: translateY(-1px);
		box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.15);
	}

	.action-icon {
		color: #2563eb;
		display: flex;
		background: white;
		padding: 0.4rem;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.action-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.action-title {
		display: block;
		font-weight: 700;
		color: #1e3a8a; /* Deep blue */
		font-size: 1rem;
	}

	.action-desc {
		display: block;
		color: #3b82f6;
		font-size: 0.85rem;
		font-weight: 500;
	}

	.action-key {
		font-family: inherit;
		color: #93c5fd;
		font-size: 1.5rem;
		font-weight: 300;
		line-height: 1;
	}

	/* 
    Empty & AI States
    */
	.empty-state {
		padding: 4rem 2rem;
		text-align: center;
		color: #94a3b8;
		font-size: 1.1rem;
	}

	.ai-state {
		padding: 0.5rem;
	}

	.ai-state.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		color: #64748b;
		gap: 1.5rem;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #e2e8f0;
		border-top-color: #3b82f6;
		border-radius: 50%;
		animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.ai-state.result {
		background: #f8fafc;
		border-radius: 12px;
		border: 1px solid #e2e8f0;
		padding: 1.5rem;
	}

	.ai-header {
		margin-bottom: 1.25rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.badge {
		background: #3b82f6;
		color: white;
		font-size: 0.7rem;
		font-weight: 800;
		padding: 0.35rem 0.6rem;
		border-radius: 6px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
	}

	.ai-header h4 {
		margin: 0;
		color: #0f172a;
		font-size: 1.15rem;
		font-weight: 700;
		line-height: 1.4;
	}

	.ai-answer {
		line-height: 1.7;
		color: #334155;
		margin-bottom: 2rem;
		font-size: 1.05rem;
		max-height: 60vh;
		overflow-y: auto;
		padding-right: 0.5rem;
		scrollbar-width: thin;
		scrollbar-color: #cbd5e1 transparent;
	}

	.ai-answer p {
		margin-bottom: 1.2rem;
		text-align: justify;
	}

	.ai-answer br {
		margin-bottom: 0.5rem;
	}

	.clear-ai-btn {
		background: white;
		border: 1px solid #cbd5e1;
		padding: 0.6rem 1.2rem;
		border-radius: 8px;
		color: #475569;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	.clear-ai-btn:hover {
		background: #f1f5f9;
		border-color: #94a3b8;
		color: #0f172a;
	}

	/* 
    Footer
    */
	.search-footer {
		padding: 1rem 1.75rem;
		background: rgba(248, 250, 252, 0.8);
		border-top: 1px solid rgba(0, 0, 0, 0.06);
		color: #94a3b8;
		font-size: 0.75rem;
		display: flex;
		justify-content: flex-end;
		align-items: center;
		backdrop-filter: blur(10px);
	}

	.key-hints {
		display: flex;
		gap: 1.5rem;
	}

	.key-hint {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 500;
	}

	.mobile-close-btn {
		display: none;
		width: 100%;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		background: rgba(0, 0, 0, 0.07);
		border: none;
		border-radius: 999px;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		font-weight: 600;
		color: #0f172a;
		cursor: pointer;
		min-height: 48px;
	}

	.mobile-close-btn:hover {
		background: rgba(0, 0, 0, 0.12);
	}

	/* AI Related Links */
	.ai-related-links {
		margin-top: 1.5rem;
		padding-top: 1.25rem;
		border-top: 1px solid #e2e8f0;
	}

	.related-label {
		display: block;
		font-size: 0.8rem;
		text-transform: uppercase;
		font-weight: 700;
		color: #1e293b;
		margin-bottom: 0.75rem;
		letter-spacing: 0.05em;
	}

	.related-links-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.related-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: white;
		border: 1px solid #cbd5e1;
		padding: 0.5rem 1rem;
		border-radius: 99px;
		color: #3b82f6;
		font-size: 0.9rem;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s ease;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	.related-link:hover {
		background: #eff6ff;
		border-color: #93c5fd;
		transform: translateY(-1px);
		box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
	}

	.link-icon {
		font-size: 1rem;
		line-height: 1;
	}

	kbd {
		background: white;
		border: 1px solid #e2e8f0;
		border-bottom-width: 2px;
		border-radius: 6px;
		padding: 0.15rem 0.4rem;
		font-family: inherit;
		font-size: 0.75rem;
		font-weight: 700;
		color: #475569;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
		min-width: 1.5em;
		text-align: center;
	}
	.search-header {
		display: flex;

		align-items: center;

		padding: 1.25rem 1.75rem;

		border-bottom: 1px solid rgba(0, 0, 0, 0.06);

		gap: 1rem;

		position: relative;
	}

	.search-icon-wrapper {
		color: #64748b;

		display: flex;

		align-items: center;

		filter: drop-shadow(0 1px 1px rgba(255, 255, 255, 0.5));
	}

	.search-header input {
		flex: 1;
		font-family: 'Inter', system-ui, -apple-system, sans-serif;
		font-size: 1.25rem;
		font-weight: 500;
		border: none;
		outline: none;
		color: #0f172a;
		background: transparent;
		line-height: 1.5;
		padding-right: 2rem;
	}

	.search-header input::placeholder {
		color: #94a3b8;

		font-weight: 400;
	}

	.close-btn {
		background: rgba(0, 0, 0, 0.03);

		border: none;

		color: #64748b;

		cursor: pointer;

		padding: 0.5rem;

		border-radius: 10px;

		transition: all 0.2s ease;

		display: flex;

		align-items: center;

		justify-content: center;
	}

	.close-btn:hover {
		color: #0f172a;

		background: rgba(0, 0, 0, 0.06);

		transform: scale(0.95);
	}

	/* 

    Body & Results 

    */

	.search-body {
		flex: 1;

		overflow-y: auto;

		padding: 1rem;

		scrollbar-width: thin;

		scrollbar-color: #cbd5e1 transparent;
	}

	/* Remove dots/bullets explicitly */

	ul {
		list-style: none !important;

		margin: 0 !important;

		padding: 0 !important;
	}

	li {
		list-style: none !important;

		margin: 0 !important;

		padding: 0 !important;
	}

	li::before,
	li::after {
		content: none !important;

		display: none !important;
	}

	.results-group {
		margin-bottom: 1.5rem;
	}

	.results-group h5 {
		margin: 0.5rem 0.75rem 0.75rem;

		font-size: 0.75rem;

		font-weight: 700;

		color: #1e293b;

		text-transform: uppercase;

		letter-spacing: 0.08em;
	}

	li {
		margin-bottom: 0.25rem !important;
	}

	li a {
		display: grid;

		grid-template-columns: 24px 1fr auto;

		align-items: center;

		gap: 1rem;

		padding: 0.875rem 1rem;

		border-radius: 12px;

		text-decoration: none;

		color: #1e293b;

		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

		border: 1px solid transparent;
	}

	li a:hover,
	li a:focus {
		background: #f1f5f9;

		/* Subtle scale effect */

		transform: scale(0.995);

		border-color: rgba(0, 0, 0, 0.04);
	}

	.result-icon {
		color: #94a3b8;

		display: flex;

		justify-content: center;
	}

	li a:hover .result-icon {
		color: #3b82f6; /* Highlight icon on hover */
	}

	.result-content {
		overflow: hidden;

		display: flex;

		flex-direction: column;

		gap: 0.15rem;
	}

	.result-title {
		display: block;

		font-weight: 600;

		color: #1e293b;

		font-size: 1rem;
	}

	.result-desc {
		display: block;

		color: #64748b;

		font-size: 0.85rem;

		white-space: nowrap;

		overflow: hidden;

		text-overflow: ellipsis;
	}

	.result-enter {
		opacity: 0;

		transform: translateX(-10px);

		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

		color: #cbd5e1;
	}

	li a:hover .result-enter {
		opacity: 1;

		transform: translateX(0);
	}

	/* 

    Action Button (Ask AI) 

    */

	.action-btn {
		width: 100%;

		display: flex;

		align-items: center;

		gap: 1rem;

		padding: 1rem 1.25rem;

		border: none;

		background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);

		border-radius: 12px;

		cursor: pointer;

		text-align: left;

		transition: all 0.2s ease;

		box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);

		color: #1e293b;
	}

	.action-btn:hover {
		background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);

		transform: translateY(-1px);

		box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.15);
	}

	.action-icon {
		color: #2563eb;

		display: flex;

		background: white;

		padding: 0.4rem;

		border-radius: 8px;

		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.action-content {
		flex: 1;

		display: flex;

		flex-direction: column;

		gap: 0.2rem;
	}

	.action-title {
		display: block;

		font-weight: 700;

		color: #1e3a8a; /* Deep blue */

		font-size: 1rem;
	}

	.action-desc {
		display: block;

		color: #3b82f6;

		font-size: 0.85rem;

		font-weight: 500;
	}

	.action-key {
		font-family: inherit;

		color: #93c5fd;

		font-size: 1.5rem;

		font-weight: 300;

		line-height: 1;
	}

	/* 

    Empty & AI States

    */

	.empty-state {
		padding: 4rem 2rem;

		text-align: center;

		color: #94a3b8;

		font-size: 1.1rem;
	}

	.ai-state {
		padding: 0.5rem;
	}

	.ai-state.loading {
		display: flex;

		flex-direction: column;

		align-items: center;

		justify-content: center;

		padding: 4rem 2rem;

		color: #64748b;

		gap: 1.5rem;
	}

	.spinner {
		width: 40px;

		height: 40px;

		border: 4px solid #e2e8f0;

		border-top-color: #3b82f6;

		border-radius: 50%;

		animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.ai-state.result {
		background: #f8fafc;

		border-radius: 12px;

		border: 1px solid #e2e8f0;

		padding: 1.5rem;
	}

	.ai-header {
		margin-bottom: 1.25rem;

		display: flex;

		align-items: center;

		gap: 0.75rem;

		flex-wrap: wrap;
	}

	.badge {
		background: #3b82f6;

		color: white;

		font-size: 0.7rem;

		font-weight: 800;

		padding: 0.35rem 0.6rem;

		border-radius: 6px;

		text-transform: uppercase;

		letter-spacing: 0.05em;

		box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
	}

	.ai-header h4 {
		margin: 0;
		color: #0f172a;
		font-size: 1.15rem;
		font-weight: 700;
		line-height: 1.4;
	}

	.ai-answer {
		line-height: 1.7;
		color: #334155;
		margin-bottom: 2rem;
		font-size: 1.05rem;
		max-height: 60vh;
		overflow-y: auto;
		padding-right: 0.5rem;
		scrollbar-width: thin;
		scrollbar-color: #cbd5e1 transparent;
	}

	.ai-answer p {
		margin-bottom: 1.2rem;
		text-align: justify;
	}

	.ai-answer br {
		margin-bottom: 0.5rem;
	}

	.clear-ai-btn {
		background: white;

		border: 1px solid #cbd5e1;

		padding: 0.6rem 1.2rem;

		border-radius: 8px;

		color: #475569;

		font-weight: 600;

		cursor: pointer;

		transition: all 0.2s;

		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	.clear-ai-btn:hover {
		background: #f1f5f9;

		border-color: #94a3b8;

		color: #0f172a;
	}

	/* 

    Footer

    */

	.search-footer {
		padding: 1rem 1.75rem;

		background: rgba(248, 250, 252, 0.8);

		border-top: 1px solid rgba(0, 0, 0, 0.06);

		color: #94a3b8;

		font-size: 0.75rem;

		display: flex;

		justify-content: flex-end;

		backdrop-filter: blur(10px);
	}

	.key-hints {
		display: flex;

		gap: 1.5rem;
	}

	.key-hint {
		display: flex;

		align-items: center;

		gap: 0.5rem;

		font-weight: 500;
	}

	kbd {
		background: white;

		border: 1px solid #e2e8f0;

		border-bottom-width: 2px;

		border-radius: 6px;

		padding: 0.15rem 0.4rem;

		font-family: inherit;

		font-size: 0.75rem;

		font-weight: 700;

		color: #475569;

		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

		min-width: 1.5em;

		text-align: center;
	}

	/* Mobile overrides — must be last to win the cascade */
	@media (max-width: 767px) {
		.key-hints {
			display: none !important;
		}

		.mobile-close-btn {
			display: flex !important;
			width: 100%;
			align-items: center;
			justify-content: center;
			gap: 0.5rem;
			background: rgba(0, 0, 0, 0.07) !important;
			border: none;
			border-radius: 999px;
			padding: 0.75rem 1.5rem;
			font-size: 1rem !important;
			font-weight: 600;
			color: #0f172a !important;
			cursor: pointer;
			min-height: 48px;
			touch-action: manipulation;
		}

		.close-btn {
			background: rgba(0, 0, 0, 0.08) !important;
			border-radius: 50% !important;
			min-width: 40px !important;
			min-height: 40px !important;
			display: flex !important;
			align-items: center !important;
			justify-content: center !important;
			flex-shrink: 0 !important;
		}

		.search-footer {
			padding: 0.75rem 1rem !important;
			justify-content: center !important;
		}
	}
</style>
