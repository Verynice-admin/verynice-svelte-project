<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { createEventDispatcher, onMount } from 'svelte';
	import { goto } from '$app/navigation';

	export let isOpen = false;

	const dispatch = createEventDispatcher();

	let query = '';
	let inputElement: HTMLInputElement;
	let loading = false;
	let aiResponse: {
		question: string;
		answer: string;
		relatedLinks?: { title: string; url: string }[];
	} | null = null;
	let searchRef: HTMLElement;

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
					page.keywords.includes(lowerQuery)
			);
		}
	}

	function close() {
		dispatch('close');
		// slight delay to clear content after animation starts
		setTimeout(() => {
			if (!isOpen) {
				query = '';
				aiResponse = null;
				loading = false;
			}
		}, 300);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen) return;
		if (e.key === 'Escape') {
			close();
		}
		if (e.key === 'Enter' && query.trim()) {
			performAiSearch();
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (searchRef && !searchRef.contains(event.target as Node)) {
			close();
		}
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

			if (data.success && data.aiAnswer) {
				aiResponse = {
					question: data.correctedQuestion || query,
					answer: data.aiAnswer,
					relatedLinks: data.relatedLinks || []
				};
			} else {
				// Fallback if AI fails or returns no answer
				aiResponse = {
					question: query,
					answer:
						"I'm sorry, I couldn't find a specific answer for that. Please try rephrasing or checking the specific pages."
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

	function navigateTo(url: string) {
		goto(url);
		close();
	}

	$: if (isOpen && inputElement) {
		setTimeout(() => inputElement.focus(), 100);

		// Re-apply translation to the modal content if needed
		if (browser) {
			const lang = get(currentLanguage);
			if (lang !== 'EN') {
				translatePageTo(lang)
					.then((ok) => {
						if (!ok) {
							console.error('[Translation] Failed to apply to search modal');
						}
					})
					.catch(console.error);
			}
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<div class="search-overlay" transition:fade={{ duration: 200 }} on:click={handleClickOutside}>
		<div
			class="search-modal"
			bind:this={searchRef}
			transition:fly={{ y: -20, duration: 300 }}
			role="dialog"
			aria-modal="true"
		>
			<!-- Search Header / Input -->
			<div class="search-header">
				<div class="search-icon-wrapper">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M21 21L15.0001 15.0001M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</div>
				<input
					bind:this={inputElement}
					type="text"
					placeholder="Search pages or ask a question..."
					bind:value={query}
				/>
				<button class="close-btn" on:click={close}>
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M18 6L6 18M6 6L18 18"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
			</div>

			<!-- Search Body -->
			<div class="search-body">
				<!-- AI Response Section -->
				{#if loading}
					<div class="ai-state loading">
						<span class="spinner"></span>
						<p>Consulting the historian...</p>
					</div>
				{:else if aiResponse}
					<div class="ai-state result" in:fade>
						<div class="ai-header">
							<span class="badge">AI Answer</span>
							<h4>{aiResponse.question}</h4>
						</div>
						<p class="ai-answer">{aiResponse.answer}</p>
						{#if aiResponse.relatedLinks && aiResponse.relatedLinks.length > 0}
							<div class="ai-related-links">
								<span class="related-label">Recommended for you:</span>
								<div class="related-links-list">
									{#each aiResponse.relatedLinks as link}
										<a
											href={link.url}
											on:click|preventDefault={() => navigateTo(link.url)}
											class="related-link"
										>
											<span class="link-icon">↗</span>
											{link.title}
										</a>
									{/each}
								</div>
							</div>
						{/if}
						<button class="clear-ai-btn" on:click={() => (aiResponse = null)}>
							Back to results
						</button>
					</div>
				{:else}
					<!-- Navigation Results -->
					{#if filteredPages.length > 0}
						<div class="results-group">
							<h5>Pages</h5>
							<ul>
								{#each filteredPages as page}
									<li>
										<a href={page.url} on:click|preventDefault={() => navigateTo(page.url)}>
											<div class="result-icon">
												<svg
													width="16"
													height="16"
													viewBox="0 0 24 24"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z"
														stroke="currentColor"
														stroke-width="2"
														stroke-linecap="round"
														stroke-linejoin="round"
													/>
												</svg>
											</div>
											<div class="result-content">
												<span class="result-title">{page.title}</span>
												<span class="result-desc">{page.description}</span>
											</div>
											<div class="result-enter">
												<svg
													width="16"
													height="16"
													viewBox="0 0 24 24"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														d="M9 10L4 15M4 15L9 20M4 15H20"
														stroke="currentColor"
														stroke-width="2"
														stroke-linecap="round"
														stroke-linejoin="round"
													/>
												</svg>
											</div>
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					<!-- Ask Action -->
					{#if query.trim().length > 0}
						<div class="results-group action-group">
							<h5>Ask AI</h5>
							<button class="action-btn" on:click={performAiSearch}>
								<div class="action-icon">
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
								</div>
								<div class="action-content">
									<span class="action-title">Ask question: "{query}"</span>
									<span class="action-desc">Get an instant answer from our AI historian</span>
								</div>
								<span class="action-key">↵</span>
							</button>
						</div>
					{/if}

					<!-- Empty State -->
					{#if filteredPages.length === 0 && query.trim().length === 0}
						<div class="empty-state">
							<p>Start typing to search pages or ask a question.</p>
						</div>
					{:else if filteredPages.length === 0 && query.trim().length > 0}
						<div class="empty-state">
							<p>No pages found. Try asking our AI!</p>
						</div>
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
		background: rgba(15, 23, 42, 0.4); /* Darker, richer overlay */
		backdrop-filter: blur(12px);
		z-index: 9999;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		padding-top: 12vh;
	}

	.search-modal {
		width: 100%;
		max-width: 640px;
		background: rgba(255, 255, 255, 0.85); /* Glassy white */
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border-radius: 20px;
		box-shadow:
			0 25px 50px -12px rgba(0, 0, 0, 0.25),
			0 0 0 1px rgba(255, 255, 255, 0.3) inset;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		max-height: 75vh;
		border: 1px solid rgba(255, 255, 255, 0.4);
		transform: translateZ(0); /* Hardware acceleration */
	}

	/* 
    Header & Input 
    */
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
		font-family:
			'Inter',
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 1.25rem;
		font-weight: 500;
		border: none;
		outline: none;
		color: #0f172a;
		background: transparent;
		line-height: 1.5;
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
		color: #94a3b8;
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
		color: inherit;
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
		color: #94a3b8;
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

		font-family:
			'Inter',
			system-ui,
			-apple-system,
			sans-serif;

		font-size: 1.25rem;

		font-weight: 500;

		border: none;

		outline: none;

		color: #0f172a;

		background: transparent;

		line-height: 1.5;
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

		color: #94a3b8;

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

		color: inherit;

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
</style>
