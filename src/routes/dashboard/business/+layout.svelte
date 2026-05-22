<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { auth, db } from '$lib/firebase';
	import { onAuthStateChanged, signOut } from 'firebase/auth';
	import { doc, getDoc } from 'firebase/firestore';

	let loading = true;
	let authResolved = false;
	let displayName = 'Business';
	let photoURL = '';
	let userRole = '';
	let businessVerified = false;
	let notificationsCount = 0;

	onMount(async () => {
		if (!auth) {
			goto('/get-started');
			return;
		}

		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			authResolved = true;

			if (!firebaseUser) {
				loading = false;
				goto('/get-started');
				return;
			}

			displayName = firebaseUser.displayName || 'Business';
			photoURL = firebaseUser.photoURL || '';

			try {
				// Check user role
				const userDocRef = doc(db!, 'users', firebaseUser.uid);
				const userDoc = await getDoc(userDocRef);

				if (userDoc.exists()) {
					const data = userDoc.data();
					userRole = data.role;

					// If not business role, redirect
					if (data.role !== 'business') {
						window.location.href = '/dashboard/traveller';
						return;
					}

					// Check business onboarding status
					const businessDocRef = doc(db!, 'businesses', firebaseUser.uid);
					const businessDoc = await getDoc(businessDocRef);
					
					if (businessDoc.exists()) {
						const businessData = businessDoc.data();
						businessVerified = businessData.verified || false;
						
						// Check onboarding status - redirect if not complete
						if (businessData.onboardingComplete !== true) {
							const currentPath = page.url.pathname;
							// Only redirect if not already on onboarding or settings
							if (!currentPath.includes('/onboarding') && !currentPath.includes('/settings')) {
								goto('/dashboard/business/onboarding');
								return;
							}
						}
					} else if (!data.businessCreated) {
						// No business doc means needs onboarding
						const currentPath = page.url.pathname;
						if (!currentPath.includes('/onboarding') && !currentPath.includes('/settings')) {
							goto('/dashboard/business/onboarding');
							return;
						}
					}
				} else {
					// No user doc, redirect to get-started
					goto('/get-started');
					return;
				}
			} catch (err) {
				console.error('Error fetching business data:', err);
			}

			loading = false;
		});

		// Safety timeout
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
			goto('/get-started');
		} catch (err) {
			console.error('Sign out error:', err);
		}
	}

	// Current path for active nav
	$: currentPath = page.url.pathname;
	$: isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');
</script>

<svelte:head>
	<title>Business Dashboard — VERYNICE.kz</title>
</svelte:head>

{#if loading}
	<div class="loading-screen">
		<div class="spinner"></div>
		<p>Loading dashboard...</p>
	</div>
{:else}
	<div class="dashboard-layout">
		<!-- Sidebar -->
		<aside class="sidebar">
			<div class="sidebar-header">
				<a href="/" class="logo" data-sveltekit-scroll="reset">VERY<span class="logo-accent">NICE</span>.kz</a>
				<span class="badge">Business</span>
			</div>

			<nav class="sidebar-nav">
				<a href="/dashboard/business" class="nav-item" class:active={isActive('/dashboard/business') && !isActive('/dashboard/business/')}>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="3" y="3" width="7" height="9"></rect>
						<rect x="14" y="3" width="7" height="5"></rect>
						<rect x="14" y="12" width="7" height="9"></rect>
						<rect x="3" y="16" width="7" height="5"></rect>
					</svg>
					Overview
				</a>
				<a href="/dashboard/business/profile" class="nav-item" class:active={isActive('/dashboard/business/profile')}>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
						<circle cx="12" cy="7" r="4"></circle>
					</svg>
					Profile
				</a>
				<a href="/dashboard/business/listings" class="nav-item" class:active={isActive('/dashboard/business/listings')}>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
						<path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
						<path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
					</svg>
					Listings
				</a>
				<a href="/dashboard/business/bookings" class="nav-item" class:active={isActive('/dashboard/business/bookings')}>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
						<line x1="16" y1="2" x2="16" y2="6"></line>
						<line x1="8" y1="2" x2="8" y2="6"></line>
						<line x1="3" y1="10" x2="21" y2="10"></line>
					</svg>
					Bookings
				</a>
				<a href="/dashboard/business/inbox" class="nav-item" class:active={isActive('/dashboard/business/inbox')}>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
					</svg>
					Inbox
					{#if notificationsCount > 0}
						<span class="notification-badge">{notificationsCount}</span>
					{/if}
				</a>
				<a href="/dashboard/business/reviews" class="nav-item" class:active={isActive('/dashboard/business/reviews')}>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
					</svg>
					Reviews
				</a>
				<a href="/dashboard/business/analytics" class="nav-item" class:active={isActive('/dashboard/business/analytics')}>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="20" x2="18" y2="10"></line>
						<line x1="12" y1="20" x2="12" y2="4"></line>
						<line x1="6" y1="20" x2="6" y2="14"></line>
					</svg>
					Analytics
				</a>
				<a href="/dashboard/business/media" class="nav-item" class:active={isActive('/dashboard/business/media')}>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
						<circle cx="8.5" cy="8.5" r="1.5"></circle>
						<polyline points="21 15 16 10 5 21"></polyline>
					</svg>
					Media
				</a>
				<a href="/dashboard/business/growth" class="nav-item" class:active={isActive('/dashboard/business/growth')}>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 20V10"></path>
						<path d="M18 20V4"></path>
						<path d="M6 20v-4"></path>
					</svg>
					Growth Tools
				</a>
				<a href="/dashboard/business/ai-tools" class="nav-item" class:active={isActive('/dashboard/business/ai-tools')}>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
						<path d="M12 12 2.1 12.05"></path>
						<path d="M12 12 18.9 5"></path>
						<circle cx="12" cy="12" r="2"></circle>
					</svg>
					AI Tools
				</a>
			</nav>

			<div class="sidebar-footer">
				<a href="/dashboard/business/settings" class="nav-item" class:active={isActive('/dashboard/business/settings')}>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="3"></circle>
						<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
					</svg>
					Settings
				</a>
				<a href="/dashboard/business/help" class="nav-item" class:active={isActive('/dashboard/business/help')}>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"></circle>
						<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
						<line x1="12" y1="17" x2="12.01" y2="17"></line>
					</svg>
					Help
				</a>
				<a href="/get-started?from=true" class="nav-item">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
						<polyline points="10 17 15 12 10 7"></polyline>
						<line x1="15" y1="12" x2="3" y2="12"></line>
					</svg>
					Back to Site
				</a>
				<button class="nav-item signout" on:click={handleSignOut}>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
						<polyline points="16 17 21 12 16 7"></polyline>
						<line x1="21" y1="12" x2="9" y2="12"></line>
					</svg>
					Sign Out
				</button>
			</div>
		</aside>

		<!-- Main Content -->
		<main class="main-content">
			<!-- Top Header -->
			<header class="top-header">
				<div class="header-left">
					<button class="mobile-menu-btn" aria-label="Toggle menu">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="3" y1="12" x2="21" y2="12"></line>
							<line x1="3" y1="6" x2="21" y2="6"></line>
							<line x1="3" y1="18" x2="21" y2="18"></line>
						</svg>
					</button>
				</div>
				
				<div class="header-right">
					{#if !businessVerified}
						<div class="verification-banner">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="12" cy="12" r="10"></circle>
								<line x1="12" y1="8" x2="12" y2="12"></line>
								<line x1="12" y1="16" x2="12.01" y2="16"></line>
							</svg>
							<span>Verification pending</span>
						</div>
					{/if}
					
					<button class="notification-btn" aria-label="Notifications">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
							<path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
						</svg>
						{#if notificationsCount > 0}
							<span class="badge-count">{notificationsCount}</span>
						{/if}
					</button>
					
					<div class="user-menu">
						{#if photoURL}
							<img src={photoURL} alt={displayName} class="user-avatar" />
						{:else}
							<div class="avatar-placeholder">
								{displayName.charAt(0).toUpperCase()}
							</div>
						{/if}
						<span class="user-name">{displayName}</span>
					</div>
				</div>
			</header>

			<!-- Page Content -->
			<div class="content-wrapper">
				<slot />
			</div>
		</main>
	</div>
{/if}

<style>
	.loading-screen {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #0a1e3c;
		color: white;
		gap: 1rem;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid rgba(255,255,255,0.1);
		border-top-color: #E8A44A;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.dashboard-layout {
		display: flex;
		min-height: 100vh;
		background: #f5f7fa;
	}

	/* Sidebar */
	.sidebar {
		width: 260px;
		background: #0a1e3c;
		color: white;
		display: flex;
		flex-direction: column;
		position: fixed;
		height: 100vh;
		left: 0;
		top: 0;
		z-index: 100;
	}

	.sidebar-header {
		padding: 1.5rem;
		border-bottom: 1px solid rgba(255,255,255,0.1);
	}

	.logo {
		font-size: 1.4rem;
		font-weight: 700;
		color: white;
		text-decoration: none;
		font-family: var(--vnk-font-primary, 'Outfit', sans-serif);
	}

	.logo-accent {
		color: #E8A44A;
	}

	.badge {
		display: inline-block;
		font-size: 0.7rem;
		background: #E8A44A;
		color: #0a1e3c;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		margin-left: 0.5rem;
		font-weight: 600;
	}

	.sidebar-nav {
		flex: 1;
		padding: 1rem 0;
		overflow-y: auto;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1.5rem;
		color: rgba(255,255,255,0.7);
		text-decoration: none;
		transition: all 0.2s;
		border: none;
		background: none;
		width: 100%;
		text-align: left;
		font-size: 0.95rem;
		cursor: pointer;
		font-family: inherit;
	}

	.nav-item:hover {
		background: rgba(255,255,255,0.1);
		color: white;
	}

	.nav-item.active {
		background: rgba(232, 164, 74, 0.2);
		color: #E8A44A;
		border-right: 3px solid #E8A44A;
	}

	.nav-item.signout:hover {
		background: rgba(239, 68, 68, 0.2);
		color: #ef4444;
	}

	.notification-badge, .badge-count {
		background: #ef4444;
		color: white;
		font-size: 0.7rem;
		padding: 0.1rem 0.4rem;
		border-radius: 10px;
		margin-left: auto;
	}

	.sidebar-footer {
		padding: 1rem 0;
		border-top: 1px solid rgba(255,255,255,0.1);
	}

	/* Main Content */
	.main-content {
		flex: 1;
		margin-left: 260px;
		display: flex;
		flex-direction: column;
	}

	.top-header {
		height: 64px;
		background: white;
		border-bottom: 1px solid #e5e7eb;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 2rem;
		position: sticky;
		top: 0;
		z-index: 50;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.verification-banner {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: #fef3c7;
		color: #92400e;
		padding: 0.4rem 0.75rem;
		border-radius: 6px;
		font-size: 0.85rem;
	}

	.notification-btn {
		position: relative;
		background: none;
		border: none;
		padding: 0.5rem;
		cursor: pointer;
		color: #6b7280;
	}

	.notification-btn:hover {
		color: #0a1e3c;
	}

	.badge-count {
		position: absolute;
		top: 0;
		right: 0;
	}

	.user-menu {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.user-avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		object-fit: cover;
	}

	.avatar-placeholder {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: #E8A44A;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.user-name {
		font-weight: 500;
		color: #0a1e3c;
		font-size: 0.9rem;
	}

	.content-wrapper {
		flex: 1;
		padding: 2rem;
	}

	.mobile-menu-btn {
		display: none;
		background: none;
		border: none;
		cursor: pointer;
		color: #6b7280;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.sidebar {
			transform: translateX(-100%);
			transition: transform 0.3s;
		}

		.sidebar.open {
			transform: translateX(0);
		}

		.main-content {
			margin-left: 0;
		}

		.mobile-menu-btn {
			display: block;
		}

		.content-wrapper {
			padding: 1rem;
		}

		.user-name {
			display: none;
		}
	}
</style>








