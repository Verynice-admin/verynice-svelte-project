<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth, db } from '$lib/firebase';
	import { onAuthStateChanged } from 'firebase/auth';
	import {
		collection,
		query,
		where,
		getDocs,
		orderBy,
		limit,
		deleteDoc,
		doc,
		updateDoc
	} from 'firebase/firestore';

	let loading = true;
	let listings: any[] = [];
	let error = '';
	let deleting: string | null = null;

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

			await loadListings(firebaseUser.uid);
			loading = false;
		});

		return () => unsubscribe();
	});

	async function loadListings(uid: string) {
		try {
			const listingsQuery = query(
				collection(db!, 'listings'),
				where('businessId', '==', uid),
				orderBy('createdAt', 'desc'),
				limit(100)
			);
			
			const snapshot = await getDocs(listingsQuery);
			listings = snapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data()
			}));
		} catch (err) {
			console.error('Error loading listings:', err);
			error = 'Failed to load listings';
		}
	}

	async function deleteListing(listingId: string) {
		if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
			return;
		}

		deleting = listingId;
		try {
			await deleteDoc(doc(db!, 'listings', listingId));
			listings = listings.filter(l => l.id !== listingId);
		} catch (err) {
			console.error('Error deleting listing:', err);
			error = 'Failed to delete listing';
		} finally {
			deleting = null;
		}
	}

	async function togglePublish(listing: any) {
		try {
			const newStatus = listing.status === 'published' ? 'draft' : 'published';
			await updateDoc(doc(db!, 'listings', listing.id), {
				status: newStatus
			});
			listings = listings.map(l => 
				l.id === listing.id ? { ...l, status: newStatus } : l
			);
		} catch (err) {
			console.error('Error updating listing:', err);
			error = 'Failed to update listing';
		}
	}

	function formatDate(timestamp: any): string {
		if (!timestamp) return '';
		const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>My Listings — VERYNICE.kz</title>
	<meta name="description" content="Manage your business listings" />
</svelte:head>

<div class="listings-page">
	<header class="page-header">
		<div class="header-content">
			<div>
				<h1>My Listings</h1>
				<p>Manage your business listings and services</p>
			</div>
			<a href="/dashboard/business/listings/new" class="btn-primary">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="12" y1="5" x2="12" y2="19"></line>
					<line x1="5" y1="12" x2="19" y2="12"></line>
				</svg>
				Add New Listing
			</a>
		</div>
	</header>

	{#if error}
		<div class="alert alert-error">{error}</div>
	{/if}

	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
		</div>
	{:else if listings.length === 0}
		<div class="empty-state">
			<div class="empty-icon">
				<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
					<path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
					<path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
				</svg>
			</div>
			<h2>No listings yet</h2>
			<p>Start by adding your first listing to showcase your business</p>
			<a href="/dashboard/business/listings/new" class="btn-primary">Add Your First Listing</a>
		</div>
	{:else}
		<div class="listings-table">
			<table>
				<thead>
					<tr>
						<th>Listing</th>
						<th>Category</th>
						<th>Status</th>
						<th>Views</th>
						<th>Created</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each listings as listing}
						<tr>
							<td class="listing-cell">
								<div class="listing-info">
									{#if listing.coverImage}
										<img src={listing.coverImage} alt={listing.title} class="listing-thumb" />
									{:else}
										<div class="listing-thumb placeholder">
											<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
												<circle cx="8.5" cy="8.5" r="1.5"></circle>
												<polyline points="21 15 16 10 5 21"></polyline>
											</svg>
										</div>
									{/if}
									<div>
										<span class="listing-title">{listing.title || 'Untitled'}</span>
										{#if listing.location}
											<span class="listing-location">{listing.location}</span>
										{/if}
									</div>
								</div>
							</td>
							<td>
								<span class="category-badge">
									{listing.category || 'Uncategorized'}
								</span>
							</td>
							<td>
								<span class="status-badge" class:published={listing.status === 'published'} class:draft={listing.status === 'draft'}>
									{listing.status || 'draft'}
								</span>
							</td>
							<td class="views-cell">
								{listing.views || 0}
							</td>
							<td class="date-cell">
								{formatDate(listing.createdAt)}
							</td>
							<td class="actions-cell">
								<div class="action-buttons">
									<a href="/dashboard/business/listings/{listing.id}/edit" class="action-btn" title="Edit">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
											<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
										</svg>
									</a>
									<button 
										class="action-btn" 
										class:publishing={deleting === listing.id}
										on:click={() => togglePublish(listing)}
										title={listing.status === 'published' ? 'Unpublish' : 'Publish'}
									>
										{#if listing.status === 'published'}
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
												<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
											</svg>
										{:else}
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<polyline points="20 6 9 17 4 12"></polyline>
											</svg>
										{/if}
									</button>
									<button 
										class="action-btn delete" 
										class:deleting={deleting === listing.id}
										on:click={() => deleteListing(listing.id)}
										disabled={deleting === listing.id}
										title="Delete"
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<polyline points="3 6 5 6 21 6"></polyline>
											<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
										</svg>
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.listings-page {
		max-width: 1200px;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.header-content {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.page-header h1 {
		font-size: 1.75rem;
		color: #0a1e3c;
		margin-bottom: 0.5rem;
	}

	.page-header p {
		color: #666;
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
	}

	.btn-primary:hover {
		background: #d69440;
	}

	.alert {
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
	}

	.alert-error {
		background: #fee2e2;
		color: #dc2626;
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
		padding: 4rem 2rem;
		background: white;
		border-radius: 12px;
	}

	.empty-icon {
		color: #d1d5db;
		margin-bottom: 1rem;
	}

	.empty-state h2 {
		color: #374151;
		margin-bottom: 0.5rem;
	}

	.empty-state p {
		color: #6b7280;
		margin-bottom: 1.5rem;
	}

	.listings-table {
		background: white;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th, td {
		padding: 1rem;
		text-align: left;
		border-bottom: 1px solid #e5e7eb;
	}

	th {
		background: #f9fafb;
		font-weight: 600;
		color: #374151;
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	tr:last-child td {
		border-bottom: none;
	}

	.listing-cell {
		min-width: 250px;
	}

	.listing-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.listing-thumb {
		width: 48px;
		height: 48px;
		border-radius: 8px;
		object-fit: cover;
	}

	.listing-thumb.placeholder {
		background: #f3f4f6;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #9ca3af;
	}

	.listing-title {
		display: block;
		font-weight: 500;
		color: #0a1e3c;
	}

	.listing-location {
		display: block;
		font-size: 0.85rem;
		color: #6b7280;
	}

	.category-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		background: #e0e7ff;
		color: #3730a3;
		border-radius: 20px;
		font-size: 0.8rem;
		font-weight: 500;
		text-transform: capitalize;
	}

	.status-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.8rem;
		font-weight: 500;
		text-transform: capitalize;
	}

	.status-badge.published {
		background: #dcfce7;
		color: #166534;
	}

	.status-badge.draft {
		background: #fef3c7;
		color: #92400e;
	}

	.views-cell, .date-cell {
		color: #6b7280;
		font-size: 0.9rem;
	}

	.action-buttons {
		display: flex;
		gap: 0.5rem;
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		background: #f3f4f6;
		color: #374151;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.action-btn:hover {
		background: #e5e7eb;
	}

	.action-btn.delete:hover {
		background: #fee2e2;
		color: #dc2626;
	}

	.action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
		}

		.listings-table {
			overflow-x: auto;
		}

		table {
			min-width: 700px;
		}
	}
</style>
