<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { user, userProfile } from '$lib/stores/userStore';

	let displayName = 'Traveller';
	let photoURL = '';
	let email = '';
	let loading = true; // CRITICAL: start as true
	let authResolved = false; // CRITICAL: track if Firebase responded

	// Placeholder stats
	let savedDestinations = 0;
	let upcomingTrips = 0;
	let savedTips = 0;

	import { auth, db } from '$lib/firebase';
	import { onAuthStateChanged, signOut } from 'firebase/auth';
	import { doc, getDoc, collection, getDocs, deleteDoc, query, orderBy } from 'firebase/firestore';

	// Delete saved destination
	async function deleteSavedDestination(destId: string) {
		if (!auth.currentUser) return;
		try {
			await deleteDoc(doc(db!, 'users', auth.currentUser.uid, 'savedDestinations', destId));
			// Remove from local list
			savedDestinationsList = savedDestinationsList.filter(d => d.id !== destId);
			savedDestinations = savedDestinationsList.length;
		} catch (err) {
			console.error('Error deleting destination:', err);
		}
	}

	// Actual data arrays
	let savedDestinationsList: any[] = [];
	let upcomingTripsList: any[] = [];
	let savedTipsList: any[] = [];

	onMount(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			authResolved = true;

			if (!firebaseUser) {
				// Only redirect if Firebase has FULLY resolved and confirmed there is no user
				loading = false;
				goto('/get-started');
				return;
			}

			// Get user data
			displayName = firebaseUser.displayName || 'Traveller';
			photoURL = firebaseUser.photoURL || '';
			email = firebaseUser.email || '';

			// Try to get role from Firestore
			try {
				const userDocRef = doc(db!, 'users', firebaseUser.uid);
				const userDoc = await getDoc(userDocRef);

				if (userDoc.exists()) {
					const data = userDoc.data();
					// Verify this is a traveller - if not, redirect to correct dashboard
					if (data.role === 'business') {
						// Use window.location.href for proper redirect after auth
						window.location.href = '/dashboard/business';
						return;
					}
				}

				// Fetch saved destinations
				try {
					const savedQuery = query(
						collection(db!, 'users', firebaseUser.uid, 'savedDestinations'),
						orderBy('savedAt', 'desc')
					);
					const savedSnapshot = await getDocs(savedQuery);
					savedDestinationsList = savedSnapshot.docs.map(doc => ({
						id: doc.id,
						...doc.data()
					}));
					savedDestinations = savedDestinationsList.length;
				} catch (err) {
					console.error('Error fetching saved destinations:', err);
				}
			} catch (err) {
				console.error('Error fetching user profile:', err);
			}

			loading = false; // Only set false AFTER auth fully resolves
		});

		// Safety timeout  if Firebase takes more than 5 seconds, something is wrong, redirect to sign in
		const timeout = setTimeout(() => {
			if (!authResolved) {
				goto('/get-started');
			}
		}, 5000);

		return () => {
			unsubscribe();
			clearTimeout(timeout);
		};
	});

	async function handleSignOut() {
		try {
			await signOut(auth!);
			user.set(null);
			userProfile.set(null);
			goto('/get-started');
		} catch (err) {
			console.error('Sign out error:', err);
		}
	}
</script>

<svelte:head>
	<title>Traveller Dashboard  VERYNICE.kz</title>
	<meta name="description" content="Manage your trips and saved destinations" />
</svelte:head>

<div class="dashboard-page">
	<!-- Header -->
	<header class="dashboard-header">
		<div class="header-content">
			<a href="/" class="logo" data-sveltekit-scroll="reset">VERYNICE.kz</a>
			<div class="header-right">
				{#if photoURL}
					<img src={photoURL} alt={displayName} class="user-avatar" />
				{:else}
					<div class="user-avatar-placeholder">
						{displayName.charAt(0).toUpperCase()}
					</div>
				{/if}
				<button class="signout-btn" on:click={handleSignOut}>
					Sign Out
				</button>
			</div>
		</div>
	</header>

	{#if loading}
		<!-- Show spinner/loading  do NOT redirect here -->
		<div class="auth-loading">
			<div class="spinner"></div>
			<p>Loading your dashboard...</p>
		</div>
	{:else}
		<main class="dashboard-content">
			<!-- Welcome Section -->
			<section class="welcome-section">
				<h1>Welcome back, {displayName}!</h1>
				<p>Plan your next adventure in Kazakhstan</p>
			</section>

			<!-- Stats Row -->
			<section class="stats-row">
				<div class="stat-card">
					<a href="/destinations">
						<div class="stat-icon">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
								<circle cx="12" cy="10" r="3"></circle>
							</svg>
						</div>
						<div class="stat-number">{savedDestinations}</div>
						<div class="stat-label">Saved Destinations</div>
					</a>
				</div>

				<div class="stat-card">
					<a href="/dashboard/trips">
						<div class="stat-icon">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
								<line x1="16" y1="2" x2="16" y2="6"></line>
								<line x1="8" y1="2" x2="8" y2="6"></line>
								<line x1="3" y1="10" x2="21" y2="10"></line>
							</svg>
						</div>
						<div class="stat-number">{upcomingTrips}</div>
						<div class="stat-label">Upcoming Trips</div>
					</a>
				</div>

				<div class="stat-card"><a href="/travel-tips"><div class="stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg></div><div class="stat-number">{savedTips}</div><div class="stat-label">Travel Tips Saved</div></a></div>
			</section>

			<!-- Upcoming Trips Section -->
			<section class="trips-section">
				<div class="section-header">
					<h2>Upcoming Trips</h2>
					<a href="/dashboard/trips/new" class="btn-primary">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="12" y1="5" x2="12" y2="19"></line>
							<line x1="5" y1="12" x2="19" y2="12"></line>
						</svg>
						Plan New Trip
					</a>
				</div>
				<div class="trips-empty-state">
					<div class="empty-icon">
						<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
							<line x1="16" y1="2" x2="16" y2="6"></line>
							<line x1="8" y1="2" x2="8" y2="6"></line>
							<line x1="3" y1="10" x2="21" y2="10"></line>
						</svg>
					</div>
					<h3>No trips planned yet</h3>
					<p>Start planning your next adventure in Kazakhstan!</p>
					<a href="/dashboard/trips/new" class="btn-primary">Create Your First Trip</a>
				</div>
			</section>

			<!-- Main Content Grid -->
			<section class="content-grid">
				<!-- Saved Destinations -->
				<div class="content-card">
					<h2>My Saved Destinations</h2>
					{#if savedDestinationsList.length > 0}
						<div class="saved-list">
							{#each savedDestinationsList as dest}
								<div class="saved-item">
									<a href="/destinations/{dest.slug || dest.id}" class="saved-link">
										{#if dest.imageUrl}
											<img src={dest.imageUrl} alt={dest.name} class="saved-thumb" />
										{:else}
											<div class="saved-thumb-placeholder">
												<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
													<circle cx="12" cy="10" r="3"></circle>
												</svg>
											</div>
										{/if}
										<div class="saved-info">
											<h3>{dest.name || 'Destination'}</h3>
											<p>{dest.region || ''}</p>
										</div>
									</a>
									<button 
										class="delete-btn" 
										on:click={() => deleteSavedDestination(dest.id)}
										title="Remove from saved"
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M3 6h18"></path>
											<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
											<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
										</svg>
									</button>
								</div>
							{/each}
						</div>
					{:else}
						<div class="empty-state">
							<div class="empty-icon">
								<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
									<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
									<circle cx="12" cy="10" r="3"></circle>
								</svg>
							</div>
							<p>You haven't saved any destinations yet</p>
							<a href="/destinations" class="btn-primary">Explore Destinations</a>
						</div>
					{/if}
				</div>

				<!-- Recent Activity -->
				<div class="content-card">
					<h2>Recent Activity</h2>
					<div class="empty-state">
						<p>No recent activity yet</p>
					</div>
				</div>
			</section>

			<!-- Quick Links -->
			<section class="quick-links">
				<h3>Quick Links</h3>
				<div class="links-row">
					<a href="/destinations" class="quick-link">Destinations</a>
					<a href="/heritage" class="quick-link">Heritage</a>
					<a href="/food-drink" class="quick-link">Food & Drinks</a>
					<a href="/travel-tips" class="quick-link">Travel Tips</a>
				</div>
			</section>
		</main>
	{/if}
</div>

<style>
	.dashboard-page {
		min-height: 100vh;
		background: #f8f9fa;
	}

	.dashboard-header {
		background: #0a1e3c;
		height: 80px;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.logo {
		color: white;
		font-size: 1.5rem;
		font-weight: 700;
		text-decoration: none;
		font-family: var(--vnk-font-primary, 'Outfit', sans-serif);
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.user-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid rgba(255,255,255,0.3);
	}

	.user-avatar-placeholder {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: #4A9EE8;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: 600;
	}

	.signout-btn {
		padding: 0.5rem 1rem;
		background: transparent;
		border: 1px solid rgba(255,255,255,0.5);
		color: white;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s ease;
	}

	.signout-btn:hover {
		background: rgba(255,255,255,0.1);
		border-color: white;
	}

	.dashboard-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.auth-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		gap: 1rem;
		color: #666;
	}

	.auth-loading p {
		font-size: 1.1rem;
		color: #666;
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
		to {
			transform: rotate(360deg);
		}
	}

	.welcome-section {
		margin-bottom: 2rem;
	}

	.welcome-section h1 {
		font-size: 2rem;
		color: #0a1e3c;
		margin-bottom: 0.5rem;
		font-family: var(--vnk-font-primary, 'Outfit', sans-serif);
	}

	.welcome-section p {
		color: #666;
		font-size: 1.1rem;
	}

	.stats-row {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		background: white;
		border-radius: 16px;
		padding: 1.5rem;
		box-shadow: 0 2px 12px rgba(0,0,0,0.08);
		text-align: center;
	}

	.stat-icon {
		width: 48px;
		height: 48px;
		margin: 0 auto 1rem;
		background: rgba(74, 158, 232, 0.1);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #4A9EE8;
	}

	.stat-number {
		font-size: 2rem;
		font-weight: 700;
		color: #0a1e3c;
		margin-bottom: 0.25rem;
	}

	.stat-label {
		font-size: 0.9rem;
		color: #666;
	}

	.content-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.content-card {
		background: white;
		border-radius: 16px;
		padding: 1.5rem;
		box-shadow: 0 2px 12px rgba(0,0,0,0.08);
	}

	.content-card h2 {
		font-size: 1.25rem;
		color: #0a1e3c;
		margin-bottom: 1rem;
		font-family: var(--vnk-font-primary, 'Outfit', sans-serif);
	}

	.empty-state {
		text-align: center;
		padding: 2rem 1rem;
	}

	.empty-icon {
		color: #ccc;
		margin-bottom: 1rem;
	}

	.empty-state p {
		color: #999;
		margin-bottom: 1rem;
	}

	.btn-primary {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: #4A9EE8;
		color: white;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 500;
		transition: background 0.2s ease;
	}

	.btn-primary:hover {
		background: #3a8ed8;
	}

	.quick-links {
		margin-top: 2rem;
	}

	.quick-links h3 {
		font-size: 1.1rem;
		color: #0a1e3c;
		margin-bottom: 1rem;
	}

	.links-row {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.quick-link {
		padding: 0.75rem 1.5rem;
		background: white;
		color: #0a1e3c;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 500;
		box-shadow: 0 2px 8px rgba(0,0,0,0.06);
		transition: all 0.2s ease;
	}

	.quick-link:hover {
		background: #0a1e3c;
		color: white;
	}

	/* Upcoming Trips Section */
	.trips-section {
		margin-bottom: 2rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.section-header h2 {
		font-size: 1.5rem;
		color: #2d3436;
		margin: 0;
	}

	.trips-section .btn-primary {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.trips-empty-state {
		background: white;
		border-radius: 12px;
		padding: 3rem 2rem;
		text-align: center;
		box-shadow: 0 2px 8px rgba(0,0,0,0.08);
	}

	.trips-empty-state .empty-icon {
		margin-bottom: 1rem;
		color: #adb5bd;
	}

	.trips-empty-state h3 {
		font-size: 1.25rem;
		color: #2d3436;
		margin: 0 0 0.5rem 0;
	}

	.trips-empty-state p {
		color: #6c757d;
		margin: 0 0 1.5rem 0;
	}

	@media (max-width: 768px) {
		.stats-row {
			grid-template-columns: repeat(2, 1fr);
		}

		.content-grid {
			grid-template-columns: 1fr;
		}

		.welcome-section h1 {
			font-size: 1.5rem;
		}

		.dashboard-content {
			padding: 1.5rem 1rem;
		}
	}
</style>



