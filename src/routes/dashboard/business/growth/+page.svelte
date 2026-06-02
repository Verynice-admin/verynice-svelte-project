<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth, db } from '$lib/firebase';
	import { onAuthStateChanged } from 'firebase/auth';
	import { collection, query, where, getDocs } from 'firebase/firestore';

	let loading = true;
	let listings: any[] = [];

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
			const listingsQuery = query(
				collection(db!, 'listings'),
				where('businessId', '==', uid)
			);
			const snapshot = await getDocs(listingsQuery);
			listings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
		} catch (err) {
			console.error('Error loading data:', err);
		}
	}

	// Generate shareable link for a listing
	function getShareLink(listingId: string): string {
		return `${window.location.origin}/listing/${listingId}`;
	}

	// Generate QR code data URL (placeholder - in production use a QR library)
	function getQRCodeUrl(listingId: string): string {
		const link = getShareLink(listingId);
		// Simple QR code placeholder - in production use a proper QR library
		return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(link)}`;
	}
</script>

<svelte:head>
	<title>Growth & Marketing Tools — VERYNICE.kz</title>
</svelte:head>

<div class="growth-page">
	<header class="page-header">
		<div>
			<h1>🚀 Growth & Marketing Tools</h1>
			<p>Promote your listings and grow your business</p>
		</div>
	</header>

	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
		</div>
	{:else}
		<!-- Social Share Cards -->
		<section class="section">
			<h2>📱 Social Share Cards</h2>
			<p class="section-desc">Share your listings on social media with auto-generated images</p>
			
			{#if listings.length === 0}
				<div class="empty-state">
					<p>No listings yet. Create a listing first to generate share cards.</p>
					<a href="/dashboard/business/listings/new" class="btn-primary">Add Listing</a>
				</div>
			{:else}
				<div class="share-cards-grid">
					{#each listings.filter(l => l.status === 'published').slice(0, 6) as listing}
						<div class="share-card">
							{#if listing.coverImage}
								<img src={listing.coverImage} alt={listing.title} class="card-image" />
							{:else}
								<div class="card-image placeholder">
									<span>No image</span>
								</div>
							{/if}
							<div class="card-content">
								<h3>{listing.title}</h3>
								<p>{listing.location || 'Kazakhstan'}</p>
								<div class="card-actions">
									<button class="btn-small" on:click={() => navigator.clipboard.writeText(getShareLink(listing.id))}>
										📋 Copy Link
									</button>
									<a href={getShareLink(listing.id)} target="_blank" class="btn-small">
										👁 Preview
									</a>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- QR Codes -->
		<section class="section">
			<h2>🔳 QR Code Generator</h2>
			<p class="section-desc">Generate QR codes for your listings to use in print materials</p>
			
			{#if listings.length === 0}
				<div class="empty-state">
					<p>No listings yet.</p>
				</div>
			{:else}
				<div class="qr-grid">
					{#each listings.filter(l => l.status === 'published').slice(0, 4) as listing}
						<div class="qr-card">
							<img src={getQRCodeUrl(listing.id)} alt="QR Code" class="qr-image" />
							<h3>{listing.title}</h3>
							<button class="btn-small" on:click={() => {
								const link = getQRCodeUrl(listing.id);
								navigator.clipboard.writeText(link);
							}}>
								📥 Download
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Promotional Offers -->
		<section class="section">
			<h2>🏷️ Promotional Offers</h2>
			<p class="section-desc">Create special offers to attract more customers</p>
			
			<div class="offer-placeholder">
				<div class="offer-icon">🎁</div>
				<h3>Create Your First Offer</h3>
				<p>Set up discounts, limited-time offers, or special packages</p>
				<button class="btn-primary">Coming Soon</button>
			</div>
		</section>

		<!-- Referral Program -->
		<section class="section">
			<h2>🤝 Referral Program</h2>
			<p class="section-desc">Invite other businesses to join VERYNICE.kz and earn rewards</p>
			
			<div class="referral-card">
				<div class="referral-icon">📨</div>
				<div class="referral-content">
					<h3>Invite Other Businesses</h3>
					<p>Share your referral link and earn credits when businesses you refer get their first booking.</p>
					<div class="referral-link">
						<input type="text" readonly value="https://verynice.kz/ref/{'business'}" />
						<button class="btn-small" on:click={() => navigator.clipboard.writeText('https://verynice.kz/ref/business')}>
							📋 Copy
						</button>
					</div>
				</div>
			</div>
		</section>

		<!-- Featured Listing Upgrade -->
		<section class="section upgrade-section">
			<div class="upgrade-icon">⭐</div>
			<h2>Get Featured</h2>
			<p>Boost your visibility with a featured listing placement</p>
			<ul class="upgrade-benefits">
				<li>✓ Appear at the top of search results</li>
				<li>✓ Featured badge on your listing</li>
				<li>✓ Priority support</li>
			</ul>
			<button class="btn-upgrade">Upgrade to Pro</button>
		</section>

		<!-- SEO Preview -->
		<section class="section">
			<h2>🔍 SEO Preview</h2>
			<p class="section-desc">See how your listings appear in Google search results</p>
			
			{#if listings.length > 0}
				<div class="seo-preview">
					<div class="google-result">
						<div class="google-title">{listings[0]?.title || 'Your Listing Title'}</div>
						<div class="google-url">https://verynice.kz/listing/{listings[0]?.id || 'your-listing'}</div>
						<div class="google-desc">{listings[0]?.description?.slice(0, 160) || 'Your listing description will appear here. Add a compelling description to improve click-through rates.'}</div>
					</div>
				</div>
			{:else}
				<div class="empty-state">
					<p>Create a listing to see SEO preview</p>
				</div>
			{/if}
		</section>
	{/if}
</div>

<style>
	.growth-page {
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

	.empty-state {
		text-align: center;
		padding: 2rem;
		color: #6b7280;
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		background: #E8A44A;
		color: white;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 500;
		transition: background 0.2s;
		border: none;
		cursor: pointer;
	}

	.btn-primary:hover {
		background: #d69440;
	}

	.btn-small {
		padding: 0.4rem 0.75rem;
		background: #f3f4f6;
		color: #374151;
		border: none;
		border-radius: 6px;
		font-size: 0.85rem;
		cursor: pointer;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		transition: all 0.2s;
	}

	.btn-small:hover {
		background: #e5e7eb;
	}

	/* Share Cards Grid */
	.share-cards-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	@media (max-width: 768px) {
		.share-cards-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.share-card {
		border: 1px solid #e5e7eb;
		border-radius: 10px;
		overflow: hidden;
	}

	.card-image {
		width: 100%;
		height: 120px;
		object-fit: cover;
	}

	.card-image.placeholder {
		background: #f3f4f6;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #9ca3af;
		height: 120px;
	}

	.card-content {
		padding: 1rem;
	}

	.card-content h3 {
		font-size: 0.95rem;
		color: #0a1e3c;
		margin-bottom: 0.25rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.card-content p {
		font-size: 0.8rem;
		color: #6b7280;
		margin-bottom: 0.75rem;
	}

	.card-actions {
		display: flex;
		gap: 0.5rem;
	}

	/* QR Grid */
	.qr-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
	}

	@media (max-width: 768px) {
		.qr-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.qr-card {
		text-align: center;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 10px;
	}

	.qr-image {
		width: 120px;
		height: 120px;
		margin-bottom: 0.75rem;
	}

	.qr-card h3 {
		font-size: 0.85rem;
		color: #0a1e3c;
		margin-bottom: 0.75rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Offer Placeholder */
	.offer-placeholder {
		text-align: center;
		padding: 2rem;
		background: #f9fafb;
		border-radius: 10px;
	}

	.offer-icon {
		font-size: 2.5rem;
		margin-bottom: 1rem;
	}

	.offer-placeholder h3 {
		color: #0a1e3c;
		margin-bottom: 0.5rem;
	}

	.offer-placeholder p {
		color: #6b7280;
		margin-bottom: 1rem;
	}

	/* Referral Card */
	.referral-card {
		display: flex;
		gap: 1.5rem;
		padding: 1.5rem;
		background: linear-gradient(135deg, #fffbf0 0%, #fef7e8 100%);
		border: 1px solid #fde68a;
		border-radius: 10px;
	}

	.referral-icon {
		font-size: 2.5rem;
	}

	.referral-content h3 {
		color: #0a1e3c;
		margin-bottom: 0.5rem;
	}

	.referral-content p {
		color: #6b7280;
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	.referral-link {
		display: flex;
		gap: 0.5rem;
	}

	.referral-link input {
		flex: 1;
		padding: 0.5rem 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		font-size: 0.85rem;
		background: white;
	}

	/* Upgrade Section */
	.upgrade-section {
		text-align: center;
		background: linear-gradient(135deg, #0a1e3c 0%, #1a3a5c 100%);
		color: white;
	}

	.upgrade-section h2 {
		color: white;
	}

	.upgrade-section p {
		color: rgba(255,255,255,0.8);
		margin-bottom: 1rem;
	}

	.upgrade-icon {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}

	.upgrade-benefits {
		list-style: none;
		padding: 0;
		margin-bottom: 1.5rem;
	}

	.upgrade-benefits li {
		color: rgba(255,255,255,0.9);
		padding: 0.35rem 0;
		font-size: 0.9rem;
	}

	.btn-upgrade {
		padding: 0.75rem 2rem;
		background: #E8A44A;
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-upgrade:hover {
		background: #d69440;
	}

	/* SEO Preview */
	.seo-preview {
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		overflow: hidden;
	}

	.google-result {
		padding: 1rem;
	}

	.google-title {
		color: #1a0dab;
		font-size: 1.1rem;
		margin-bottom: 0.25rem;
	}

	.google-url {
		color: #006621;
		font-size: 0.85rem;
		margin-bottom: 0.25rem;
	}

	.google-desc {
		color: #545454;
		font-size: 0.85rem;
		line-height: 1.4;
	}
</style>
