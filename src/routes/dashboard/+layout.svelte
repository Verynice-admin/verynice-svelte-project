<script lang="ts">
	import { page } from '$app/state';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { auth, db } from '$lib/firebase';
	import { onAuthStateChanged } from 'firebase/auth';
	import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

	// Breadcrumb derivation from pathname
	$: pathSegments = page.url.pathname.split('/').filter(Boolean);
	$: breadcrumbs = pathSegments.map((segment, index) => {
		const path = '/' + pathSegments.slice(0, index + 1).join('/');
		const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
		return { path, label };
	});

	// Notification state
	let notifications: any[] = [];
	let unreadCount = 0;
	let showNotifications = false;
	let currentUser: any = null;

	// Kept outside onMount so onDestroy can reach it
	let unsubscribeNotifs: (() => void) | null = null;

	onMount(() => {
		if (!browser || !auth || !db) return;

		const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
			currentUser = user;
			// Clean up previous subscription whenever auth state changes
			unsubscribeNotifs?.();
			unsubscribeNotifs = null;

			if (user) {
				const notifQuery = query(
					collection(db, 'users', user.uid, 'notifications'),
					orderBy('createdAt', 'desc'),
					limit(20)
				);
				unsubscribeNotifs = onSnapshot(notifQuery, (snapshot) => {
					notifications = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
					unreadCount = notifications.filter(n => !n.read).length;
				});
			} else {
				notifications = [];
				unreadCount = 0;
			}
		});

		return () => unsubscribeAuth();
	});

	onDestroy(() => {
		unsubscribeNotifs?.();
	});

	function toggleNotifications() {
		showNotifications = !showNotifications;
	}

	function markAsRead(notifId: string) {
		// Mark notification as read in Firestore
		if (db && currentUser) {
			import('firebase/firestore').then(({ doc, updateDoc }) => {
				updateDoc(doc(db, 'users', currentUser.uid, 'notifications', notifId), {
					read: true
				});
			});
		}
	}

	function formatTimeAgo(timestamp: any): string {
		if (!timestamp) return '';
		const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		return `${days}d ago`;
	}
</script>

<div class="dashboard-layout">
	<!-- Dashboard Sidebar -->
	<aside class="dashboard-sidebar">
		<div class="sidebar-header">
			<a href="/get-started?from=true" class="back-to-site">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
					<path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				<span>Back to Site</span>
			</a>
		</div>
		
		<nav class="sidebar-nav">
			<a href="/dashboard/traveller" class:active={page.url.pathname === '/dashboard/traveller'}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
					<rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
					<rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
					<rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
				</svg>
				Dashboard
			</a>
			<a href="/dashboard/saved" class:active={page.url.pathname.includes('/saved')}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2"/>
				</svg>
				Saved
			</a>
			<a href="/dashboard/trips" class:active={page.url.pathname.includes('/trips')}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" stroke-width="2"/>
					<rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="2"/>
				</svg>
				Trips
			</a>
			<a href="/travel-tips" class:active={page.url.pathname.includes('/travel-tips')}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
					<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					<line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
				Travel Tips
			</a>
			<a href="/dashboard/settings" class:active={page.url.pathname.includes('/settings')}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
					<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="2"/>
				</svg>
				Settings
			</a>
			<a href="/help" class="sidebar-link">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10"></circle>
					<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
					<line x1="12" y1="17" x2="12.01" y2="17"></line>
				</svg>
				Help
			</a>
		</nav>
	</aside>

	<!-- Main Content Area -->
	<div class="dashboard-main">
		<!-- Header -->
		<header class="dashboard-header">
			<!-- Breadcrumb -->
			<nav class="breadcrumb" aria-label="Breadcrumb">
				<a href="/dashboard">Home</a>
				{#each breadcrumbs as crumb, i}
					<span class="breadcrumb-sep">/</span>
					<a href={crumb.path} class:active={i === breadcrumbs.length - 1}>{crumb.label}</a>
				{/each}
			</nav>

			<!-- Right side: Notifications + Profile -->
			<div class="header-actions">
				<!-- Notifications Bell -->
				<button class="notification-bell" on:click={toggleNotifications} aria-label="Notifications">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
						<path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
					</svg>
					{#if unreadCount > 0}
						<span class="notification-badge">{unreadCount}</span>
					{/if}
				</button>

				<!-- Notifications Dropdown -->
				{#if showNotifications}
					<div class="notifications-dropdown">
						<div class="notifications-header">
							<h3>Notifications</h3>
						</div>
						<div class="notifications-list">
							{#if notifications.length === 0}
								<p class="no-notifications">No notifications yet</p>
							{:else}
								{#each notifications as notif}
									<button 
										class="notification-item" 
										class:unread={!notif.read}
										on:click={() => markAsRead(notif.id)}
									>
										<p class="notif-title">{notif.title || 'Notification'}</p>
										<p class="notif-message">{notif.message || ''}</p>
										<span class="notif-time">{formatTimeAgo(notif.createdAt)}</span>
									</button>
								{/each}
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</header>

		<!-- Page Content -->
		<main id="main-content" class="dashboard-content">
			<slot />
		</main>
	</div>
</div>

<style>
	.dashboard-layout {
		display: flex;
		min-height: 100vh;
		background-color: #0f0f0f;
		color: #e5e5e5;
	}

	.dashboard-sidebar {
		width: 260px;
		background-color: #1a1a1a;
		border-right: 1px solid #2a2a2a;
		padding: 1rem;
		position: sticky;
		top: 0;
		height: 100vh;
		overflow-y: auto;
	}

	.sidebar-header {
		padding: 0.5rem 0;
		margin-bottom: 1rem;
	}

	.back-to-site {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #a3a3a3;
		text-decoration: none;
		font-size: 0.875rem;
		padding: 0.5rem;
		border-radius: 0.375rem;
		transition: background-color 0.2s;
	}

	.back-to-site:hover {
		background-color: #262626;
		color: #fff;
	}

	.sidebar-nav {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.sidebar-nav a {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		color: #a3a3a3;
		text-decoration: none;
		border-radius: 0.5rem;
		font-size: 0.9375rem;
		transition: all 0.2s;
	}

	.sidebar-nav a:hover {
		background-color: #262626;
		color: #fff;
	}

	.sidebar-nav a.active {
		background-color: #262626;
		color: #fff;
	}

	.dashboard-main {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 2rem;
		background-color: #1a1a1a;
		border-bottom: 1px solid #2a2a2a;
		position: sticky;
		top: 0;
		z-index: 40;
	}

	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	.breadcrumb a {
		color: #a3a3a3;
		text-decoration: none;
	}

	.breadcrumb a:hover {
		color: #fff;
	}

	.breadcrumb a.active {
		color: #fff;
		font-weight: 500;
	}

	.breadcrumb-sep {
		color: #525252;
	}

	.header-actions {
		position: relative;
	}

	.notification-bell {
		background: none;
		border: none;
		color: #a3a3a3;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 0.375rem;
		position: relative;
	}

	.notification-bell:hover {
		background-color: #262626;
		color: #fff;
	}

	.notification-badge {
		position: absolute;
		top: 0;
		right: 0;
		background-color: #ef4444;
		color: white;
		font-size: 0.625rem;
		padding: 0.125rem 0.375rem;
		border-radius: 9999px;
		min-width: 1rem;
		text-align: center;
	}

	.notifications-dropdown {
		position: absolute;
		top: 100%;
		right: 0;
		width: 320px;
		background-color: #1a1a1a;
		border: 1px solid #2a2a2a;
		border-radius: 0.5rem;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
		z-index: 50;
		margin-top: 0.5rem;
	}

	.notifications-header {
		padding: 1rem;
		border-bottom: 1px solid #2a2a2a;
	}

	.notifications-header h3 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
	}

	.notifications-list {
		max-height: 400px;
		overflow-y: auto;
	}

	.no-notifications {
		padding: 2rem;
		text-align: center;
		color: #525252;
	}

	.notification-item {
		display: block;
		width: 100%;
		padding: 1rem;
		text-align: left;
		background: none;
		border: none;
		border-bottom: 1px solid #262626;
		cursor: pointer;
	}

	.notification-item:hover {
		background-color: #262626;
	}

	.notification-item.unread {
		background-color: #262626;
	}

	.notif-title {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 500;
		color: #e5e5e5;
	}

	.notif-message {
		margin: 0.25rem 0 0;
		font-size: 0.8125rem;
		color: #a3a3a3;
	}

	.notif-time {
		font-size: 0.75rem;
		color: #525252;
	}

	.dashboard-content {
		flex: 1;
		padding: 2rem;
	}

	@media (max-width: 768px) {
		.dashboard-sidebar {
			display: none;
		}

		.dashboard-header {
			padding: 1rem;
		}

		.dashboard-content {
			padding: 1rem;
		}
	}
</style>




