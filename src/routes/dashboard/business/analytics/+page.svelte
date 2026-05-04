<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth, db } from '$lib/firebase';
	import { onAuthStateChanged } from 'firebase/auth';
	import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

	let loading = true;
	let stats = {
		totalViews: 0,
		totalBookings: 0,
		avgRating: 0,
		totalReviews: 0
	};
	let topListings: any[] = [];
	let recentViews: any[] = [];

	onMount(async () => {
		if (!auth) {
			goto('/get-started');
			return;
		}

		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (!firebaseUser) {
				goto('/get-started');
				return;
			}

			await loadAnalytics(firebaseUser.uid);
			loading = false;
		});

		return () => unsubscribe();
	});

	async function loadAnalytics(uid: string) {
		try {
			// Get listings
			const listingsQuery = query(
				collection(db!, 'listings'),
				where('businessId', '==', uid)
			);
			const listingsSnap = await getDocs(listingsQuery);
			const listings = listingsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

			// Calculate stats
			stats.totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
			stats.totalBookings = listings.reduce((sum, l) => sum + (l.bookings || 0), 0);

			// Get reviews for this business
			const reviewsQuery = query(
				collection(db!, 'reviews'),
				where('businessId', '==', uid)
			);
			const reviewsSnap = await getDocs(reviewsQuery);
			const reviews = reviewsSnap.docs.map(d => d.data());
			stats.totalReviews = reviews.length;
			if (reviews.length > 0) {
				const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
				stats.avgRating = sum / reviews.length;
			}

			// Top listings by views
			topListings = listings.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

		} catch (err) {
			console.error('Error loading analytics:', err);
		}
	}
</script>

<svelte:head>
	<title>Analytics — VERYNICE.kz</title>
</svelte:head>

<div class="analytics-page">
	<header class="page-header">
		<h1>Analytics</h1>
		<p>Track your business performance</p>
	</header>

	{#if loading}
		<div class="loading"><div class="spinner"></div></div>
	{:else}
		<!-- Stats Cards -->
		<div class="stats-grid">
			<div class="stat-card">
				<div class="stat-icon views">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
						<circle cx="12" cy="12" r="3"></circle>
					</svg>
				</div>
				<div class="stat-content">
					<span class="stat-value">{stats.totalViews}</span>
					<span class="stat-label">Total Views (30d)</span>
				</div>
			</div>

			<div class="stat-card">
				<div class="stat-icon bookings">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
						<line x1="16" y1="2" x2="16" y2="6"></line>
						<line x1="8" y1="2" x2="8" y2="6"></line>
						<line x1="3" y1="10" x2="21" y2="10"></line>
					</svg>
				</div>
				<div class="stat-content">
					<span class="stat-value">{stats.totalBookings}</span>
					<span class="stat-label">Total Bookings</span>
				</div>
			</div>

			<div class="stat-card">
				<div class="stat-icon rating">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
					</svg>
				</div>
				<div class="stat-content">
					<span class="stat-value">{stats.avgRating.toFixed(1)}</span>
					<span class="stat-label">Average Rating</span>
				</div>
			</div>

			<div class="stat-card">
				<div class="stat-icon reviews">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
					</svg>
				</div>
				<div class="stat-content">
					<span class="stat-value">{stats.totalReviews}</span>
					<span class="stat-label">Total Reviews</span>
				</div>
			</div>
		</div>

		<!-- Top Listings -->
		<section class="section">
			<h2>Top Performing Listings</h2>
			{#if topListings.length === 0}
				<div class="empty-state">
					<p>No listings yet. Create your first listing to see analytics.</p>
					<a href="/dashboard/business/listings/new" class="btn-primary">Create Listing</a>
				</div>
			{:else}
				<div class="listings-table">
					<table>
						<thead>
							<tr>
								<th>Listing</th>
								<th>Views</th>
								<th>Bookings</th>
							</tr>
						</thead>
						<tbody>
							{#each topListings as listing}
								<tr>
									<td>{listing.title || 'Untitled'}</td>
									<td>{listing.views || 0}</td>
									<td>{listing.bookings || 0}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</section>
	{/if}
</div>

<style>
	.analytics-page { max-width: 1000px; }
	.page-header { margin-bottom: 2rem; }
	.page-header h1 { font-size: 1.75rem; color: #0a1e3c; margin-bottom: 0.5rem; }
	.page-header p { color: #666; }
	
	.loading { display: flex; justify-content: center; padding: 4rem; }
	.spinner { width: 40px; height: 40px; border: 3px solid #f0f0f0; border-top-color: #0a1e3c; border-radius: 50%; animation: spin 0.8s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }

	.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
	.stat-card { background: white; border-radius: 12px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
	.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
	.stat-icon.views { background: #dbeafe; color: #2563eb; }
	.stat-icon.bookings { background: #dcfce7; color: #16a34a; }
	.stat-icon.rating { background: #fef3c7; color: #d97706; }
	.stat-icon.reviews { background: #f3e8ff; color: #9333ea; }
	.stat-value { display: block; font-size: 1.5rem; font-weight: 700; color: #0a1e3c; }
	.stat-label { font-size: 0.85rem; color: #6b7280; }

	.section { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
	.section h2 { font-size: 1.1rem; color: #0a1e3c; margin-bottom: 1rem; }

	.empty-state { text-align: center; padding: 2rem; }
	.empty-state p { color: #666; margin-bottom: 1rem; }
	.btn-primary { display: inline-flex; padding: 0.75rem 1.5rem; background: #E8A44A; color: white; border-radius: 8px; text-decoration: none; }

	.listings-table table { width: 100%; border-collapse: collapse; }
	.listings-table th, .listings-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
	.listings-table th { font-weight: 600; color: #374151; font-size: 0.85rem; }

	@media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
