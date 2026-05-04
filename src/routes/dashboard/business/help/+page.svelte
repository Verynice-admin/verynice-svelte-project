<script lang="ts">
	let searchQuery = '';
	let activeCategory = 'getting-started';

	const categories = [
		{ id: 'getting-started', label: 'Getting Started', icon: '🚀' },
		{ id: 'listings', label: 'Managing Listings', icon: '📝' },
		{ id: 'bookings', label: 'Bookings & Enquiries', icon: '📅' },
		{ id: 'marketing', label: 'Marketing & Growth', icon: '📈' },
		{ id: 'account', label: 'Account & Billing', icon: '💳' },
		{ id: 'faq', label: 'FAQ', icon: '❓' }
	];

	const helpArticles = [
		{
			id: '1',
			category: 'getting-started',
			title: 'How to complete your business profile',
			content: 'Your business profile is the first thing customers see. Make sure to add your business name, category, location, description, and photos. A complete profile helps you get verified faster.'
		},
		{
			id: '2',
			category: 'getting-started',
			title: 'Understanding your dashboard',
			content: 'The dashboard overview shows your key metrics: views, bookings, reviews, and revenue. Use the quick actions to navigate to different sections.'
		},
		{
			id: '3',
			category: 'listings',
			title: 'Creating a new listing',
			content: 'Click "Add Listing" to create a new listing. Fill in the title, category, description, price, and add photos. You can save as draft or publish immediately.'
		},
		{
			id: '4',
			category: 'listings',
			title: 'Adding photos to your listing',
			content: 'Good photos are crucial! Add at least 5 photos showing different aspects of your business. Use the drag-and-drop to reorder and set a cover photo.'
		},
		{
			id: '5',
			category: 'listings',
			title: 'Setting pricing and availability',
			content: 'Set your prices in the listing editor. You can also configure availability, seasonal pricing, and booking rules.'
		},
		{
			id: '6',
			category: 'bookings',
			title: 'Managing incoming bookings',
			content: 'When a customer books, you\'ll receive a notification. View all bookings in the Bookings section. You can confirm, cancel, or mark them as completed.'
		},
		{
			id: '7',
			category: 'bookings',
			title: 'Responding to enquiries',
			content: 'Customers can also send enquiries without booking. Check your inbox regularly and respond within 24 hours for best results.'
		},
		{
			id: '8',
			category: 'marketing',
			title: 'Promoting your listings',
			content: 'Use the Growth Tools to generate shareable links and QR codes. Share on social media to attract more customers.'
		},
		{
			id: '9',
			category: 'marketing',
			title: 'Getting more reviews',
			content: 'Great service leads to great reviews! You can also share your review link with satisfied customers.'
		},
		{
			id: '10',
			category: 'account',
			title: 'Updating your account settings',
			content: 'Go to Settings to update your email, password, notification preferences, and team members.'
		},
		{
			id: '11',
			category: 'account',
			title: 'Understanding billing',
			content: 'VERYNICE.kz offers a free tier with basic features. Upgrade to Pro for additional features like analytics and priority support.'
		},
		{
			id: '12',
			category: 'faq',
			title: 'How do I get verified?',
			content: 'Complete your business profile with accurate information and add photos. Our team will review your application within 2-3 business days.'
		},
		{
			id: '13',
			category: 'faq',
			title: 'Can I have multiple businesses?',
			content: 'Yes! You can manage multiple listings from a single account. Each listing can represent a different service or location.'
		},
		{
			id: '14',
			category: 'faq',
			title: 'How do I delete my account?',
			content: 'Go to Settings > Danger Zone to find the account deletion option. Note that this action is irreversible.'
		}
	];

	$: filteredArticles = helpArticles.filter(article => {
		const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
		const matchesSearch = !searchQuery || 
			article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			article.content.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesCategory && matchesSearch;
	});
</script>

<svelte:head>
	<title>Help Center — VERYNICE.kz</title>
</svelte:head>

<div class="help-page">
	<header class="page-header">
		<h1>Help Center</h1>
		<p>Find answers to common questions and learn how to use VERYNICE.kz</p>
		
		<div class="search-box">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="11" cy="11" r="8"/>
				<line x1="21" y1="21" x2="16.65" y2="16.65"/>
			</svg>
			<input 
				type="text" 
				placeholder="Search for help..." 
				bind:value={searchQuery}
			/>
		</div>
	</header>

	<div class="help-layout">
		<!-- Sidebar -->
		<aside class="categories-sidebar">
			<h2>Categories</h2>
			<nav class="categories-nav">
				{#each categories as category}
					<button 
						class="category-btn" 
						class:active={activeCategory === category.id}
						on:click={() => activeCategory = category.id}
					>
						<span class="cat-icon">{category.icon}</span>
						<span class="cat-label">{category.label}</span>
					</button>
				{/each}
			</nav>
		</aside>

		<!-- Main Content -->
		<main class="help-content">
			{#if filteredArticles.length === 0}
				<div class="no-results">
					<span class="search-icon">🔍</span>
					<h3>No results found</h3>
					<p>Try a different search term or browse categories</p>
				</div>
			{:else}
				<div class="articles-grid">
					{#each filteredArticles as article}
						<div class="article-card">
							<h3>{article.title}</h3>
							<p>{article.content}</p>
						</div>
					{/each}
				</div>
			{/if}
		</main>
	</div>

	<!-- Contact Support -->
	<section class="support-section">
		<h2>Still need help?</h2>
		<p>Can't find what you're looking for? Our support team is here to help.</p>
		<div class="support-options">
			<a href="mailto:support@verynice.kz" class="support-card">
				<span class="support-icon">📧</span>
				<span class="support-label">Email Support</span>
				<span class="support-desc">support@verynice.kz</span>
			</a>
			<a href="https://wa.me/77000000000" class="support-card">
				<span class="support-icon">💬</span>
				<span class="support-label">WhatsApp</span>
				<span class="support-desc">Chat with us</span>
			</a>
			<div class="support-card">
				<span class="support-icon">📱</span>
				<span class="support-label">Phone</span>
				<span class="support-desc">+7 (700) 000-00-00</span>
			</div>
		</div>
	</section>
</div>

<style>
	.help-page {
		max-width: 1100px;
	}

	.page-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.page-header h1 {
		font-size: 2rem;
		color: #0a1e3c;
		margin-bottom: 0.5rem;
	}

	.page-header > p {
		color: #6b7280;
		margin-bottom: 1.5rem;
	}

	.search-box {
		max-width: 500px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: white;
		border: 2px solid #e5e7eb;
		border-radius: 12px;
		transition: border-color 0.2s;
	}

	.search-box:focus-within {
		border-color: #E8A44A;
	}

	.search-box svg {
		color: #9ca3af;
	}

	.search-box input {
		flex: 1;
		border: none;
		outline: none;
		font-size: 1rem;
	}

	.help-layout {
		display: grid;
		grid-template-columns: 250px 1fr;
		gap: 2rem;
		margin-bottom: 2rem;
	}

	@media (max-width: 768px) {
		.help-layout {
			grid-template-columns: 1fr;
		}
	}

	.categories-sidebar {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		height: fit-content;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	}

	.categories-sidebar h2 {
		font-size: 1rem;
		color: #0a1e3c;
		margin-bottom: 1rem;
	}

	.categories-nav {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.category-btn {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: transparent;
		border: none;
		border-radius: 8px;
		text-align: left;
		cursor: pointer;
		transition: all 0.2s;
	}

	.category-btn:hover {
		background: #f3f4f6;
	}

	.category-btn.active {
		background: #fffbf0;
		color: #E8A44A;
	}

	.cat-icon {
		font-size: 1.2rem;
	}

	.cat-label {
		font-size: 0.95rem;
		color: #374151;
	}

	.category-btn.active .cat-label {
		color: #E8A44A;
		font-weight: 500;
	}

	.help-content {
		min-height: 400px;
	}

	.no-results {
		text-align: center;
		padding: 3rem;
		background: white;
		border-radius: 12px;
	}

	.search-icon {
		font-size: 3rem;
		display: block;
		margin-bottom: 1rem;
	}

	.no-results h3 {
		color: #0a1e3c;
		margin-bottom: 0.5rem;
	}

	.no-results p {
		color: #6b7280;
	}

	.articles-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	@media (max-width: 768px) {
		.articles-grid {
			grid-template-columns: 1fr;
		}
	}

	.article-card {
		background: white;
		border-radius: 12px;
		padding: 1.25rem;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
		transition: all 0.2s;
	}

	.article-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
	}

	.article-card h3 {
		font-size: 1rem;
		color: #0a1e3c;
		margin-bottom: 0.5rem;
	}

	.article-card p {
		font-size: 0.9rem;
		color: #6b7280;
		line-height: 1.5;
	}

	.support-section {
		background: linear-gradient(135deg, #0a1e3c 0%, #1a3a5c 100%);
		border-radius: 16px;
		padding: 2rem;
		text-align: center;
		color: white;
	}

	.support-section h2 {
		color: white;
		margin-bottom: 0.5rem;
	}

	.support-section > p {
		color: rgba(255,255,255,0.8);
		margin-bottom: 1.5rem;
	}

	.support-options {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	@media (max-width: 640px) {
		.support-options {
			grid-template-columns: 1fr;
		}
	}

	.support-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1.5rem;
		background: rgba(255,255,255,0.1);
		border-radius: 12px;
		text-decoration: none;
		transition: all 0.2s;
	}

	.support-card:hover {
		background: rgba(255,255,255,0.15);
	}

	.support-icon {
		font-size: 2rem;
	}

	.support-label {
		font-weight: 500;
		color: white;
	}

	.support-desc {
		font-size: 0.85rem;
		color: rgba(255,255,255,0.7);
	}
</style>
