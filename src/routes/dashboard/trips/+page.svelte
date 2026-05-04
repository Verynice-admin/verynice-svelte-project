<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { auth, db } from '$lib/firebase';
	import { onAuthStateChanged } from 'firebase/auth';
	import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

	let trips: any[] = [];
	let loading = true;
	let currentUser: any = null;

	onMount(() => {
		if (!browser || !auth || !db) {
			loading = false;
			return;
		}

		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			currentUser = user;
			if (!user) {
				goto('/get-started');
				return;
			}

			try {
				// Fetch trips from Firestore
				const tripsQuery = query(
					collection(db, 'users', user.uid, 'trips'),
					orderBy('startDate', 'desc')
				);
				
				const snapshot = await getDocs(tripsQuery);
				trips = snapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data()
				}));
			} catch (err) {
				console.error('Error fetching trips:', err);
			}

			loading = false;
		});

		return () => unsubscribe();
	});

	function formatDate(date: any): string {
		if (!date) return '';
		const d = date.toDate ? date.toDate() : new Date(date);
		return d.toLocaleDateString('en-US', { 
			year: 'numeric', 
			month: 'short', 
			day: 'numeric' 
		});
	}

	function getTripStatus(trip: any): string {
		const now = new Date();
		const start = trip.startDate?.toDate ? trip.startDate.toDate() : new Date(trip.startDate);
		const end = trip.endDate?.toDate ? trip.endDate.toDate() : new Date(trip.endDate);
		
		if (now < start) return 'upcoming';
		if (now > end) return 'completed';
		return 'ongoing';
	}
</script>

<svelte:head>
	<title>My Trips — VERYNICE.kz</title>
	<meta name="description" content="View and manage your trips" />
</svelte:head>

<div class="trips-page">
	<header class="page-header">
		<div class="header-content">
			<a href="/get-started" class="back-link">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M19 12H5M12 19l-7-7 7-7"/>
				</svg>
				Back to Dashboard
			</a>
			<h1>My Trips</h1>
			<a href="/dashboard/trips/new" class="btn-primary">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="12" y1="5" x2="12" y2="19"></line>
					<line x1="5" y1="12" x2="19" y2="12"></line>
				</svg>
				Plan New Trip
			</a>
		</div>
	</header>

	<main class="page-content">
		{#if loading}
			<div class="loading-state">
				<div class="spinner"></div>
				<p>Loading trips...</p>
			</div>
		{:else if trips.length === 0}
			<div class="empty-state">
				<div class="empty-icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
						<line x1="16" y1="2" x2="16" y2="6"></line>
						<line x1="8" y1="2" x2="8" y2="6"></line>
						<line x1="3" y1="10" x2="21" y2="10"></line>
					</svg>
				</div>
				<h2>No trips planned yet</h2>
				<p>Start planning your next adventure in Kazakhstan!</p>
				<a href="/dashboard/trips/new" class="btn-primary">Plan Your First Trip</a>
			</div>
		{:else}
			<div class="trips-grid">
				{#each trips as trip}
					<a href="/dashboard/trips/{trip.id}" class="trip-card">
						<div class="trip-header">
							<h3>{trip.name || 'Unnamed Trip'}</h3>
							<span class="status-badge {getTripStatus(trip)}">{getTripStatus(trip)}</span>
						</div>
						<div class="trip-dates">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
								<line x1="16" y1="2" x2="16" y2="6"></line>
								<line x1="8" y1="2" x2="8" y2="6"></line>
								<line x1="3" y1="10" x2="21" y2="10"></line>
							</svg>
							{formatDate(trip.startDate)} - {formatDate(trip.endDate)}
						</div>
						{#if trip.destination}
							<div class="trip-destination">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
									<circle cx="12" cy="10" r="3"></circle>
								</svg>
								{trip.destination}
							</div>
						{/if}
					</a>
				{/each}
			</div>
		{/if}
	</main>
</div>

<style>
	.trips-page {
		min-height: 100vh;
		background: #f8f9fa;
	}

	.page-header {
		background: #0a1e3c;
		padding: 1.5rem 0;
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.page-header h1 {
		color: white;
		font-size: 1.75rem;
		font-weight: 600;
		margin: 0;
	}

	.back-link {
		color: rgba(255,255,255,0.8);
		text-decoration: none;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		transition: color 0.2s;
	}

	.back-link:hover {
		color: white;
	}

	.btn-primary {
		background: #00b894;
		color: white;
		padding: 0.75rem 1.25rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 500;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: background 0.2s;
	}

	.btn-primary:hover {
		background: #00a085;
	}

	.page-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		color: #6c757d;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid #e9ecef;
		border-top-color: #00b894;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.08);
	}

	.empty-icon {
		margin-bottom: 1.5rem;
		color: #adb5bd;
	}

	.empty-state h2 {
		font-size: 1.5rem;
		color: #2d3436;
		margin-bottom: 0.5rem;
	}

	.empty-state p {
		color: #6c757d;
		margin-bottom: 1.5rem;
	}

	.trips-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
	}

	.trip-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		text-decoration: none;
		box-shadow: 0 2px 8px rgba(0,0,0,0.08);
		transition: transform 0.2s, box-shadow 0.2s;
		display: block;
	}

	.trip-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0,0,0,0.12);
	}

	.trip-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
	}

	.trip-header h3 {
		font-size: 1.25rem;
		color: #2d3436;
		margin: 0;
	}

	.status-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: capitalize;
	}

	.status-badge.upcoming {
		background: #e3f2fd;
		color: #1976d2;
	}

	.status-badge.ongoing {
		background: #e8f5e9;
		color: #388e3c;
	}

	.status-badge.completed {
		background: #f5f5f5;
		color: #757575;
	}

	.trip-dates {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #6c757d;
		font-size: 0.9rem;
		margin-bottom: 0.5rem;
	}

	.trip-destination {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #00b894;
		font-weight: 500;
	}
</style>