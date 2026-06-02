<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth, db } from '$lib/firebase';
	import { onAuthStateChanged } from 'firebase/auth';
	import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

	let loading = true;
	let listings: any[] = [];
	let reviews: any[] = [];
	let selectedListing: any = null;
	let generating = false;
	let generatedDescription = '';
	let selectedTags: string[] = [];
	
	// AI Suggestions
	let aiSuggestions: any[] = [];

	const suggestedTags = [
		'adventure', 'family', 'cultural', 'food', 'nature', 'photography',
		'history', 'wellness', 'outdoor', 'romantic', 'budget-friendly', 'luxury'
	];

	onMount(() => {
		if (!auth) {
			goto('/get-started');
			return;
		}

		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (!firebaseUser) {
				goto('/get-started');
				return;
			}

			await loadData(firebaseUser.uid);
			loading = false;
		});

		return () => unsubscribe();
	});

	async function loadData(uid: string) {
		try {
			// Get listings
			const listingsQuery = query(
				collection(db!, 'listings'),
				where('businessId', '==', uid)
			);
			const listingsSnap = await getDocs(listingsQuery);
			listings = listingsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

			// Get reviews for sentiment analysis
			const reviewsQuery = query(
				collection(db!, 'reviews'),
				where('businessId', '==', uid),
				orderBy('createdAt', 'desc'),
				limit(20)
			);
			const reviewsSnap = await getDocs(reviewsQuery);
			reviews = reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

			// Generate AI suggestions
			generateSuggestions();

		} catch (err) {
			console.error('Error loading data:', err);
		}
	}

	function generateSuggestions() {
		aiSuggestions = [];

		// Check for listings without photos
		const noPhotoListings = listings.filter(l => !l.photos || l.photos.length === 0);
		if (noPhotoListings.length > 0) {
			aiSuggestions.push({
				icon: '📷',
				title: 'Add Photos',
				description: `${noPhotoListings.length} listing${noPhotoListings.length > 1 ? 's have' : ' has'} no photos. Listings with photos get 3x more bookings.`,
				priority: 'high'
			});
		}

		// Check for listings without descriptions
		const noDescListings = listings.filter(l => !l.description || l.description.length < 50);
		if (noDescListings.length > 0) {
			aiSuggestions.push({
				icon: '📝',
				title: 'Improve Descriptions',
				description: `${noDescListings.length} listing${noPhotoListings.length > 1 ? 's have' : ' has'} short or missing descriptions.`,
				priority: 'high'
			});
		}

		// Check for listings without prices
		const noPriceListings = listings.filter(l => !l.price);
		if (noPriceListings.length > 0) {
			aiSuggestions.push({
				icon: '💰',
				title: 'Set Prices',
				description: `${noPriceListings.length} listing${noPriceListings.length > 1 ? 's don\'t have' : ' doesn\'t have'} prices set.`,
				priority: 'medium'
			});
		}

		// Check for pending reviews to reply to
		const unrepliedReviews = reviews.filter(r => !r.reply);
		if (unrepliedReviews.length > 0) {
			aiSuggestions.push({
				icon: '💬',
				title: 'Reply to Reviews',
				description: `You have ${unrepliedReviews.length} unreplied review${unrepliedReviews.length > 1 ? 's' : ''}. Responding improves trust.`,
				priority: 'medium'
			});
		}

		// Check profile completion
		if (listings.length === 0) {
			aiSuggestions.push({
				icon: '🚀',
				title: 'Create Your First Listing',
				description: 'Start by creating a listing to attract customers.',
				priority: 'high'
			});
		}
	}

	// AI Description Generator
	async function generateDescription() {
		if (!selectedListing) return;
		
		generating = true;
		
		// Simulate AI generation (in production, this would call an AI API)
		setTimeout(() => {
			const listing = selectedListing;
			const templates = [
				`Experience the magic of ${listing.title}, located in the heart of ${listing.location || 'Kazakhstan'}. This ${listing.category || 'amazing destination'} offers visitors a unique opportunity to ${listing.category === 'Restaurant' ? 'savor authentic local cuisine' : 'explore stunning landscapes and rich cultural heritage'}. Whether you're ${listing.category === 'Tour' ? 'traveling solo or with a group' : 'visiting for business or pleasure'}, our ${listing.title} provides an unforgettable experience that will leave you with lasting memories.`,
				
				`Welcome to ${listing.title}, your gateway to ${listing.location || 'Kazakhstan'}'s most captivating experiences. ${listing.category ? `As a premier ${listing.category}` : 'Offering exceptional services'}, we pride ourselves on delivering outstanding quality and customer satisfaction. Our team is dedicated to ensuring every visitor enjoys a seamless and memorable experience.`,
				
				`Discover why ${listing.title} is a must-visit destination in ${listing.location || 'Kazakhstan'}. ${listing.category === 'Hotel' ? 'Our comfortable accommodations and excellent amenities ensure a relaxing stay.' : listing.category === 'Restaurant' ? 'Our expert chefs prepare delicious dishes using fresh, local ingredients.' : 'Join us for an unforgettable adventure that showcases the best of the region.'}`
			];
			
			generatedDescription = templates[Math.floor(Math.random() * templates.length)];
			generating = false;
		}, 2000);
	}

	// Sentiment Analysis
	function getSentimentSummary(): string {
		if (reviews.length === 0) return 'No reviews yet to analyze.';
		
		const positive = reviews.filter(r => r.rating >= 4).length;
		const neutral = reviews.filter(r => r.rating === 3).length;
		const negative = reviews.filter(r => r.rating < 3).length;
		
		const total = reviews.length;
		const positivePercent = Math.round((positive / total) * 100);
		
		if (positivePercent >= 70) {
			return `Customers love your business! ${positivePercent}% of reviews are positive.`;
		} else if (positivePercent >= 50) {
			return `Your business has mixed reviews. Consider responding to negative feedback.`;
		} else {
			return `There's room for improvement. Focus on customer service and addressing concerns.`;
		}
	}

	function toggleTag(tag: string) {
		if (selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter(t => t !== tag);
		} else {
			selectedTags = [...selectedTags, tag];
		}
	}
</script>

<svelte:head>
	<title>AI Tools — VERYNICE.kz</title>
</svelte:head>

<div class="ai-tools-page">
	<header class="page-header">
		<div>
			<h1>🤖 AI Tools</h1>
			<p>Use artificial intelligence to enhance your listings</p>
		</div>
	</header>

	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
		</div>
	{:else}
		<!-- AI Recommendations -->
		<section class="section">
			<h2>💡 AI Recommendations</h2>
			<p class="section-desc">Personalized suggestions to improve your business</p>
			
			{#if aiSuggestions.length === 0}
				<div class="empty-state">
					<div class="check-icon">✓</div>
					<h3>You're all set!</h3>
					<p>No recommendations at this time. Keep up the good work!</p>
				</div>
			{:else}
				<div class="suggestions-list">
					{#each aiSuggestions as suggestion}
						<div class="suggestion-card" class:high={suggestion.priority === 'high'} class:medium={suggestion.priority === 'medium'}>
							<span class="suggestion-icon">{suggestion.icon}</span>
							<div class="suggestion-content">
								<h3>{suggestion.title}</h3>
								<p>{suggestion.description}</p>
							</div>
							<span class="priority-badge {suggestion.priority}">{suggestion.priority}</span>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<div class="tools-grid">
			<!-- AI Description Generator -->
			<section class="section">
				<h2>✍️ Description Generator</h2>
				<p class="section-desc">Generate compelling descriptions for your listings</p>
				
				<div class="tool-content">
					<label class="form-label">Select a listing</label>
					<select class="form-select" bind:value={selectedListing}>
						<option value={null}>Choose a listing...</option>
						{#each listings as listing}
							<option value={listing}>{listing.title}</option>
						{/each}
					</select>

					{#if selectedListing}
						<div class="selected-listing-info">
							<h4>{selectedListing.title}</h4>
							<p>{selectedListing.category} • {selectedListing.location || 'No location'}</p>
						</div>

						<button 
							class="btn-generate" 
							on:click={generateDescription}
							disabled={generating}
						>
							{generating ? '🤖 Generating...' : '✨ Generate Description'}
						</button>

						{#if generatedDescription}
							<div class="generated-result">
								<h4>Generated Description:</h4>
								<p>{generatedDescription}</p>
								<div class="result-actions">
									<button class="btn-small" on:click={() => navigator.clipboard.writeText(generatedDescription)}>
										📋 Copy
									</button>
									<button class="btn-small primary" on:click={() => {
										// In production, this would save to Firestore
										alert('Description copied! Paste it into your listing editor.');
									}}>
										✓ Use This
									</button>
								</div>
							</div>
						{/if}
					{/if}
				</div>
			</section>

			<!-- AI Sentiment Summary -->
			<section class="section">
				<h2>💭 Review Sentiment Analysis</h2>
				<p class="section-desc">Understand what customers think about your business</p>
				
				<div class="tool-content">
					<div class="sentiment-summary">
						<div class="sentiment-icon">🧠</div>
						<p class="sentiment-text">{getSentimentSummary()}</p>
					</div>

					{#if reviews.length > 0}
						<div class="rating-breakdown">
							<div class="breakdown-item">
								<span class="stars">⭐⭐⭐⭐⭐</span>
								<span class="count">{reviews.filter(r => r.rating === 5).length}</span>
							</div>
							<div class="breakdown-item">
								<span class="stars">⭐⭐⭐⭐</span>
								<span class="count">{reviews.filter(r => r.rating === 4).length}</span>
							</div>
							<div class="breakdown-item">
								<span class="stars">⭐⭐⭐</span>
								<span class="count">{reviews.filter(r => r.rating === 3).length}</span>
							</div>
							<div class="breakdown-item">
								<span class="stars">⭐⭐</span>
								<span class="count">{reviews.filter(r => r.rating === 2).length}</span>
							</div>
							<div class="breakdown-item">
								<span class="stars">⭐</span>
								<span class="count">{reviews.filter(r => r.rating === 1).length}</span>
							</div>
						</div>
					{:else}
						<div class="no-reviews">
							<p>No reviews yet. Ask customers to leave reviews!</p>
						</div>
					{/if}
				</div>
			</section>
		</div>

		<!-- AI Tag Suggestions -->
		<section class="section">
			<h2>🏷️ Tag Suggestions</h2>
			<p class="section-desc">AI-powered tags to improve your listing discoverability</p>
			
			<div class="tags-container">
				{#each suggestedTags as tag}
					<button 
						class="tag-btn" 
						class:selected={selectedTags.includes(tag)}
						on:click={() => toggleTag(tag)}
					>
						{tag}
					</button>
				{/each}
			</div>
			
			{#if selectedTags.length > 0}
				<div class="selected-tags">
					<p>Selected tags: {selectedTags.join(', ')}</p>
				</div>
			{/if}
		</section>

		<!-- Translation -->
		<section class="section">
			<h2>🌐 Translation</h2>
			<p class="section-desc">Translate your listing content to multiple languages</p>
			
			<div class="translation-grid">
				<div class="translation-card">
					<span class="lang-flag">🇰🇿</span>
					<span class="lang-name">Kazakh</span>
					<button class="btn-small" disabled>Coming Soon</button>
				</div>
				<div class="translation-card">
					<span class="lang-flag">🇷🇺</span>
					<span class="lang-name">Russian</span>
					<button class="btn-small" disabled>Coming Soon</button>
				</div>
				<div class="translation-card">
					<span class="lang-flag">🇬🇧</span>
					<span class="lang-name">English</span>
					<button class="btn-small" disabled>Coming Soon</button>
				</div>
			</div>
		</section>
	{/if}
</div>

<style>
	.ai-tools-page {
		max-width: 1000px;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.page-header h1 {
		font-size: 1.75rem;
		color: #0a1e3c;
		margin-bottom: 0.5rem;
	}

	.page-header p {
		color: #6b7280;
	}

	.section {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	}

	.section h2 {
		font-size: 1.15rem;
		color: #0a1e3c;
		margin-bottom: 0.5rem;
	}

	.section-desc {
		color: #6b7280;
		font-size: 0.9rem;
		margin-bottom: 1.5rem;
	}

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 300px;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid #f0f0f0;
		border-top-color: #0a1e3c;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.tools-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
	}

	@media (max-width: 768px) {
		.tools-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Suggestions */
	.empty-state {
		text-align: center;
		padding: 2rem;
	}

	.check-icon {
		width: 60px;
		height: 60px;
		background: #dcfce7;
		color: #16a34a;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		margin: 0 auto 1rem;
	}

	.empty-state h3 {
		color: #0a1e3c;
		margin-bottom: 0.5rem;
	}

	.empty-state p {
		color: #6b7280;
	}

	.suggestions-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.suggestion-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 10px;
		border-left: 4px solid #e5e7eb;
	}

	.suggestion-card.high {
		border-left-color: #ef4444;
		background: #fef2f2;
	}

	.suggestion-card.medium {
		border-left-color: #f59e0b;
		background: #fffbeb;
	}

	.suggestion-icon {
		font-size: 1.5rem;
	}

	.suggestion-content {
		flex: 1;
	}

	.suggestion-content h3 {
		font-size: 0.95rem;
		color: #0a1e3c;
		margin-bottom: 0.25rem;
	}

	.suggestion-content p {
		font-size: 0.85rem;
		color: #6b7280;
	}

	.priority-badge {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.priority-badge.high {
		background: #fee2e2;
		color: #dc2626;
	}

	.priority-badge.medium {
		background: #fef3c7;
		color: #d97706;
	}

	/* Form Elements */
	.form-label {
		display: block;
		font-size: 0.9rem;
		color: #374151;
		margin-bottom: 0.5rem;
	}

	.form-select {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		font-size: 0.95rem;
		background: white;
		margin-bottom: 1rem;
	}

	.selected-listing-info {
		padding: 1rem;
		background: #f9fafb;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.selected-listing-info h4 {
		color: #0a1e3c;
		margin-bottom: 0.25rem;
	}

	.selected-listing-info p {
		font-size: 0.85rem;
		color: #6b7280;
	}

	.btn-generate {
		width: 100%;
		padding: 0.75rem;
		background: linear-gradient(135deg, #8b5cf6, #6366f1);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 0.95rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-generate:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
	}

	.btn-generate:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.generated-result {
		margin-top: 1rem;
		padding: 1rem;
		background: #f0fdf4;
		border: 1px solid #bbf7d0;
		border-radius: 8px;
	}

	.generated-result h4 {
		font-size: 0.9rem;
		color: #166534;
		margin-bottom: 0.5rem;
	}

	.generated-result p {
		font-size: 0.9rem;
		color: #374151;
		line-height: 1.5;
		margin-bottom: 1rem;
	}

	.result-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-small {
		padding: 0.4rem 0.75rem;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-small:hover:not(:disabled) {
		background: #f3f4f6;
	}

	.btn-small.primary {
		background: #16a34a;
		border-color: #16a34a;
		color: white;
	}

	.btn-small:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Sentiment */
	.sentiment-summary {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.sentiment-icon {
		font-size: 2rem;
	}

	.sentiment-text {
		font-size: 0.95rem;
		color: #374151;
		line-height: 1.4;
	}

	.rating-breakdown {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.breakdown-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.breakdown-item .stars {
		font-size: 0.9rem;
		letter-spacing: 2px;
	}

	.breakdown-item .count {
		background: #e5e7eb;
		padding: 0.15rem 0.5rem;
		border-radius: 4px;
		font-size: 0.8rem;
		color: #6b7280;
	}

	.no-reviews {
		text-align: center;
		padding: 1rem;
		color: #6b7280;
	}

	/* Tags */
	.tags-container {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.tag-btn {
		padding: 0.5rem 1rem;
		background: #f3f4f6;
		border: 1px solid #e5e7eb;
		border-radius: 20px;
		font-size: 0.85rem;
		color: #374151;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tag-btn:hover {
		background: #e5e7eb;
	}

	.tag-btn.selected {
		background: #8b5cf6;
		border-color: #8b5cf6;
		color: white;
	}

	.selected-tags {
		padding: 0.75rem;
		background: #f0f9ff;
		border-radius: 6px;
	}

	.selected-tags p {
		font-size: 0.85rem;
		color: #0369a1;
	}

	/* Translation */
	.translation-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	@media (max-width: 640px) {
		.translation-grid {
			grid-template-columns: 1fr;
		}
	}

	.translation-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1.5rem;
		background: #f9fafb;
		border-radius: 10px;
	}

	.lang-flag {
		font-size: 2rem;
	}

	.lang-name {
		font-weight: 500;
		color: #0a1e3c;
	}
</style>
