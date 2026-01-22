<script>
	import { slide } from 'svelte/transition';
	import { processContent } from '$lib/utils/markdown';

	/** @type {string} */
	export let title = 'Frequently Asked Questions';

	/** @type {Array<{question: string, answer: string, answerMarkdown?: string, answerFormat?: 'markdown' | 'html' | 'auto'}>} */
	export let items = [];

	// Track open items by their question text (assuming unique questions)
	let openItems = new Set();

	// Visibility state
	let showAll = false;
	$: displayedItems = showAll ? items.slice(0, 30) : items.slice(0, 3);
	$: console.log(
		'FAQ Items:',
		items.length,
		'Displayed:',
		displayedItems.length,
		'ShowAll:',
		showAll,
		items
	);

	// Form state
	let userQuestion = '';
	let isSubmitting = false;
	let successMessage = '';
	let errorMessage = '';
	let newAnswerItem = null;

	/**
	 * Toggles the open state of a question
	 * @param {string} question
	 */
	function toggle(question) {
		if (openItems.has(question)) {
			openItems.delete(question);
		} else {
			openItems.add(question);
		}
		// Trigger reactivity
		openItems = openItems;
	}

	async function submitQuestion() {
		if (!userQuestion.trim()) return;

		isSubmitting = true;
		errorMessage = '';
		successMessage = '';

		try {
			const response = await fetch('/api/history/ask-question', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ question: userQuestion })
			});

			const result = await response.json();

			if (response.ok) {
				if (result.aiAnswer) {
					successMessage = 'Thanks! Here is the answer:';
					const newItem = {
						question: result.correctedQuestion || userQuestion,
						answer: result.aiAnswer,
						answerFormat: 'markdown'
					};

					// Set for immediate display above form
					newAnswerItem = newItem;

					// Add the new question/answer to the top of the list temporarily for this session
					items = [newItem, ...items];
					// Open it immediately
					openItems.add(result.correctedQuestion || userQuestion);
					openItems = openItems;

					// Also show generic success
					setTimeout(() => {
						successMessage = 'Your question has been added to the FAQ!';
					}, 2000);
				} else {
					successMessage = 'Thanks! Your question has been sent to our historian.';
				}

				userQuestion = '';
				// Clear success message after 5 seconds
				setTimeout(() => {
					successMessage = '';
				}, 5000);
			} else {
				errorMessage = result.error || 'Something went wrong. Please try again.';
			}
		} catch (e) {
			errorMessage = 'Network error. Please try again later.';
			console.error(e);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<section class="themed-content-block faq-section" id="faq">
	<div class="faq-header-wrapper">
		<h2>{title}</h2>
	</div>

	{#if items && items.length > 0}
		<div class="faq-grid">
			{#each displayedItems as item, i (item.question + '-' + i)}
				{@const isOpen = openItems.has(item.question)}
				<div class="faq-card" class:is-open={isOpen}>
					<button class="faq-btn" on:click={() => toggle(item.question)} aria-expanded={isOpen}>
						<span class="faq-question-text">{item.question}</span>
						<div class="faq-icon-wrapper">
							<span class="faq-icon"></span>
						</div>
					</button>

					{#if isOpen}
						<div class="faq-content" transition:slide={{ duration: 300, axis: 'y' }}>
							<div class="faq-body-inner">
								{@html processContent(
									item.answerMarkdown || item.answer,
									item.answerFormat || 'auto',
									item.answer
								)}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>

		{#if items.length > 3}
			<div class="faq-toggle-wrapper">
				<button class="faq-toggle-btn" on:click={() => (showAll = !showAll)}>
					{showAll ? 'Show Less' : 'Show More'}
					<span class="faq-toggle-icon" class:rotated={showAll}>
						<svg
							width="12"
							height="12"
							viewBox="0 0 12 12"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M2.5 4.5L6 8L9.5 4.5"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</span>
				</button>
			</div>
		{/if}
	{/if}
</section>

<!-- Ask a Question Section -->
<section class="faq-ask-wrapper">
	<div class="ask-container">
		<h3>Have a question?</h3>
		<p class="ask-subtitle">Ask and get answers in seconds!</p>

		{#if newAnswerItem}
			<div class="new-answer-alert" transition:slide>
				<div class="new-answer-header">
					<span class="new-answer-badge">Just Answered</span>
					<h4>{newAnswerItem.question}</h4>
				</div>
				<div class="new-answer-body">
					{@html processContent(
						newAnswerItem.answer,
						newAnswerItem.answerFormat || 'auto',
						newAnswerItem.answer
					)}
				</div>
				<button class="new-answer-close" on:click={() => (newAnswerItem = null)}>
					Ask another question
				</button>
			</div>
		{/if}

		<form
			on:submit|preventDefault={submitQuestion}
			class="ask-form"
			style="display: block !important; visibility: visible !important; opacity: 1 !important;"
		>
			<div class="input-wrapper">
				<input
					type="text"
					bind:value={userQuestion}
					placeholder="What would you like to know?"
					disabled={isSubmitting}
					class:error={errorMessage}
				/>
				<button type="submit" disabled={isSubmitting || !userQuestion.trim()}>
					{#if isSubmitting}
						<span class="spinner"></span>
					{:else}
						Ask
					{/if}
				</button>
			</div>

			{#if isSubmitting}
				<div class="message info" transition:slide>
					The answer will appear in a few seconds, please wait...
				</div>
			{/if}

			{#if successMessage}
				<div class="message success" transition:slide>{successMessage}</div>
			{/if}

			{#if errorMessage}
				<div class="message error" transition:slide>{errorMessage}</div>
			{/if}
		</form>
	</div>
</section>

<style>
	.faq-section {
		width: 100%;
		margin: 6rem auto;
		padding: 0 1.5rem;
	}

	.faq-header-wrapper {
		text-align: left;
		margin: 0 auto 2rem auto; /* Reduced spacing */
		max-width: 800px;
		width: 100%;
	}

	.faq-header-wrapper h2 {
		font-family: 'Inter', sans-serif;
		font-size: clamp(1.75rem, 4vw, 2.5rem); /* Slightly smaller */
		font-weight: 800;
		letter-spacing: -0.02em;
		color: inherit; /* Allow override */
		margin: 0;
		display: inline-block;
	}

	.faq-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem; /* Reduced from 1.5rem for tighter spacing */
		max-width: 800px; /* Reduced width for better readability */
		margin: 0 auto;
	}

	.faq-card {
		/* Background controlled by global theme */
		border-radius: 999px; /* Pill-shaped like Google */
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
		border: 1px solid rgba(0, 0, 0, 0.06);
		overflow: hidden;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.faq-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
		border-color: rgba(0, 0, 0, 0.1);
	}

	.faq-card.is-open {
		background: #d1d4da; /* Light gray background */
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
		border-color: rgba(0, 0, 0, 0.1);
		border-radius: 24px; /* Less rounded when open to show content better */
	}

	.faq-btn {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.875rem 1.5rem; /* Slimmer for pill shape */
		background: transparent;
		border: none;
		cursor: pointer;
		text-align: left;
		color: #1a202c; /* Contrast */
		gap: 1.5rem;
		transition: color 0.2s ease;
	}

	.faq-question-text {
		font-family: 'Inter', sans-serif;
		font-size: 1.05rem; /* Slightly smaller for slim look */
		font-weight: 600;
		line-height: 1.3;
		/* Color controlled by global theme */
	}

	.faq-icon-wrapper {
		flex-shrink: 0;
		width: 28px; /* Slightly smaller */
		height: 28px;
		background: rgba(52, 152, 219, 0.1);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			background-color 0.3s ease,
			transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.faq-icon {
		position: relative;
		width: 14px;
		height: 14px;
	}

	.faq-icon::before,
	.faq-icon::after {
		content: '';
		position: absolute;
		background-color: #3498db;
		border-radius: 2px;
		transition: transform 0.3s ease;
	}

	/* Vertical line */
	.faq-icon::before {
		top: 0;
		left: 6px; /* (14 - 2) / 2 */
		width: 2px;
		height: 14px;
	}

	/* Horizontal line */
	.faq-icon::after {
		top: 6px;
		left: 0;
		width: 14px;
		height: 2px;
	}

	/* Open state animations */
	.faq-card.is-open .faq-icon-wrapper {
		background: #3498db;
		transform: rotate(90deg);
	}

	.faq-card.is-open .faq-icon::before,
	.faq-card.is-open .faq-icon::after {
		background-color: #fff;
	}

	.faq-card.is-open .faq-icon::before {
		transform: scaleY(0); /* Hide vertical line to make minus */
	}

	.faq-btn:hover .faq-question-text {
		color: #3498db;
	}

	.faq-content {
		border-top: 1px solid rgba(0, 0, 0, 0.05);
	}

	.faq-body-inner {
		padding: 1rem 1.5rem 1.25rem; /* Reduced from 1.5rem 2rem 2rem for slimmer look */
		color: #0f172a !important; /* Force dark text for readability on white */
		line-height: 1.8;
		font-size: 1.05rem;
	}

	/* Content Styling within Answer */
	.faq-body-inner :global(p) {
		margin-bottom: 1rem;
	}

	.faq-body-inner :global(p:last-child) {
		margin-bottom: 0;
	}

	.faq-body-inner :global(a) {
		color: #3498db;
		text-decoration: none;
		font-weight: 500;
		border-bottom: 1px solid transparent;
		transition: border-color 0.2s;
	}

	.faq-body-inner :global(a:hover) {
		border-bottom-color: #3498db;
	}

	.faq-body-inner :global(img) {
		display: block;
		max-width: 100%;
		height: auto;
		border-radius: 12px;
		margin: 1.5rem auto;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	/* Mobile Responsiveness */
	@media (max-width: 768px) {
		.faq-section {
			margin: 4rem auto;
			padding: 0 1rem;
		}

		.faq-header-wrapper h2 {
			font-size: 2rem;
		}

		.faq-btn {
			padding: 0.75rem 1rem; /* Slimmer for mobile */
			gap: 1rem;
		}

		.faq-question-text {
			font-size: 0.95rem;
		}

		.faq-body-inner {
			padding: 0.875rem 1rem 1rem; /* Further reduced for mobile */
			font-size: 0.95rem;
		}
	}

	/* ... existing styles ... */
	.faq-section {
		width: 100%;
		margin: 6rem auto 4rem; /* Adjusted margin */
		padding: 0 1.5rem;
	}

	/* ... existing styles ... */

	/* Ask Question Section Styles */
	.faq-ask-wrapper {
		width: 100%;
		max-width: 800px; /* Match FAQ grid width */
		margin: 0 auto 6rem;
		padding: 0 1.5rem;
		text-align: center;
		position: relative;
		z-index: 5;
	}

	.ask-container {
		/* Background controlled by global theme */
		padding: 1.25rem 1.5rem; /* Further reduced for slimmer look */
		border-radius: 20px; /* Reduced from 32px for sleeker look */
		box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(0, 0, 0, 0.02);
		position: relative;
		z-index: 10;
	}

	.ask-container h3 {
		font-family: 'Inter', sans-serif;
		font-size: 1.35rem; /* Slightly reduced */
		font-weight: 700;
		/* Color controlled by global theme */
		margin-bottom: 0.35rem; /* Reduced for tighter spacing */
	}

	.ask-subtitle {
		/* Color controlled by global theme */
		margin-bottom: 1rem; /* Reduced from 1.25rem */
		font-size: 0.875rem; /* Slightly smaller */
	}

	.ask-form {
		position: relative;
		width: 100%;
	}

	.input-wrapper {
		display: flex;
		gap: 0;
		width: 100%;
		/* Background controlled by global theme */
		border-radius: 999px; /* Pill-shaped like Google */
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		border: 1px solid rgba(0, 0, 0, 0.08);
		padding: 0.5rem 0.5rem 0.5rem 1.5rem;
		transition: all 0.2s;
	}

	.input-wrapper:focus-within {
		background: #e8eaee; /* Slightly lighter on focus */
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		border-color: rgba(0, 0, 0, 0.1);
	}

	input {
		flex: 1;
		padding: 0.5rem;
		border-radius: 0;
		background-color: transparent;
		border: none;
		font-family: 'Inter', sans-serif;
		font-size: 1rem;
		transition: all 0.2s;
		outline: none;
		color: #1a202c;
		pointer-events: auto !important;
		position: relative;
		z-index: 20;
		min-width: 0; /* Flexbox safety */
	}

	input:focus {
		background-color: transparent;
		border: none;
		box-shadow: none;
	}

	input.error {
		color: #e74c3c;
	}

	button[type='submit'] {
		background: #3498db;
		color: white;
		border: none;
		padding: 0.625rem 1.75rem;
		border-radius: 999px; /* Pill-shaped */
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		min-width: 90px; /* Ensure visual width */
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: auto !important;
		z-index: 20;
		white-space: nowrap;
	}

	button[type='submit']:hover:not(:disabled) {
		background: #2980b9;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
	}

	button[type='submit']:disabled {
		background: #cbd5e1; /* Lighter grey */
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.message {
		margin-top: 0.75rem;
		padding: 0.625rem 1rem;
		border-radius: 999px; /* Pill-shaped */
		font-size: 0.875rem;
		font-weight: 500;
		text-align: center;
	}

	.message.success {
		background: #d4edda;
		color: #155724;
	}

	.message.error {
		background: #f8d7da;
		color: #721c24;
	}

	.message.info {
		background: #e3f2fd;
		color: #0d47a1;
	}

	.spinner {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: white;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 600px) {
		.input-wrapper {
			flex-direction: row; /* Keep single line on mobile too */
			padding: 0.4rem 0.4rem 0.4rem 1rem;
		}

		input {
			font-size: 0.9rem;
		}

		button[type='submit'] {
			padding: 0.5rem 1.25rem;
			font-size: 0.875rem;
			min-width: 70px;
		}
	}

	.faq-toggle-wrapper {
		display: flex;
		justify-content: center;
		margin-top: 2rem;
	}

	.faq-toggle-btn {
		/* Background controlled by global theme */
		border: 1px solid rgba(0, 0, 0, 0.08);
		padding: 0.625rem 1.5rem; /* Slimmer */
		border-radius: 999px; /* Pill-shaped */
		font-family: 'Inter', sans-serif;
		font-weight: 600;
		font-size: 0.9rem;
		/* Color controlled by global theme */
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.2s ease;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
	}

	.faq-toggle-btn:hover {
		/* Background and color controlled by global theme */
		box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
		border-color: rgba(0, 0, 0, 0.12);
	}

	.new-answer-alert {
		background: #f0f9ff;
		border: 1px solid #bae6fd;
		border-radius: 20px; /* More rounded like Google */
		padding: 1.25rem 1.5rem;
		margin-bottom: 1.5rem;
		text-align: left;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
	}

	.new-answer-header {
		margin-bottom: 0.875rem;
	}

	.new-answer-badge {
		background: #0ea5e9;
		color: white;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.25rem 0.75rem;
		border-radius: 999px; /* Pill-shaped */
		display: inline-block;
		margin-bottom: 0.5rem;
	}

	.new-answer-header h4 {
		margin: 0;
		color: #0f172a;
		font-size: 1.05rem;
		font-weight: 700;
	}

	.new-answer-body {
		color: #334155;
		font-size: 0.95rem;
		line-height: 1.6;
		margin-bottom: 1.25rem;
	}

	.new-answer-body :global(p:last-child) {
		margin-bottom: 0;
	}

	.new-answer-close {
		background: #d1d4da; /* Light gray background */
		border: 1px solid rgba(0, 0, 0, 0.08);
		color: #475569;
		font-weight: 600;
		padding: 0.5rem 1.25rem;
		border-radius: 999px; /* Pill-shaped like Google */
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
	}

	.new-answer-close:hover {
		background: #c4c7cd; /* Slightly darker gray on hover */
		color: #1e293b;
		box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12);
	}

	.faq-toggle-icon {
		display: flex;
		align-items: center;
		transition: transform 0.3s ease;
	}

	.faq-toggle-icon.rotated {
		transform: rotate(180deg);
	}
</style>
