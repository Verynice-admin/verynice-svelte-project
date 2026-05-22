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
		doc,
		updateDoc,
		serverTimestamp
	} from 'firebase/firestore';

	let loading = true;
	let bookings: any[] = [];
	let error = '';
	let filter: 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed' = 'all';

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

			await loadBookings(firebaseUser.uid);
			loading = false;
		});

		return () => unsubscribe();
	});

	async function loadBookings(uid: string) {
		try {
			const bookingsQuery = query(
				collection(db!, 'bookings'),
				where('businessId', '==', uid),
				orderBy('createdAt', 'desc'),
				limit(100)
			);
			
			const snapshot = await getDocs(bookingsQuery);
			bookings = snapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data()
			}));
		} catch (err) {
			console.error('Error loading bookings:', err);
			error = 'Failed to load bookings';
		}
	}

	async function updateStatus(bookingId: string, status: string) {
		try {
			await updateDoc(doc(db!, 'bookings', bookingId), {
				status,
				updatedAt: serverTimestamp()
			});
			bookings = bookings.map(b => 
				b.id === bookingId ? { ...b, status } : b
			);
		} catch (err) {
			console.error('Error updating booking:', err);
			error = 'Failed to update booking';
		}
	}

	function formatDate(date: any): string {
		if (!date) return '';
		const d = date.toDate ? date.toDate() : new Date(date);
		return d.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	$: filteredBookings = filter === 'all' 
		? bookings 
		: bookings.filter(b => b.status === filter);
</script>

<svelte:head>
	<title>Bookings — VERYNICE.kz</title>
	<meta name="description" content="Manage your bookings and enquiries" />
</svelte:head>

<div class="bookings-page">
	<header class="page-header">
		<div>
			<h1>Bookings & Enquiries</h1>
			<p>Manage incoming bookings and customer enquiries</p>
		</div>
	</header>

	{#if error}
		<div class="alert alert-error">{error}</div>
	{/if}

	<!-- Filter -->
	<div class="filter-tabs">
		<button class:active={filter === 'all'} on:click={() => filter = 'all'}>
			All <span class="count">{bookings.length}</span>
		</button>
		<button class:active={filter === 'pending'} on:click={() => filter = 'pending'}>
			Pending <span class="count">{bookings.filter(b => b.status === 'pending').length}</span>
		</button>
		<button class:active={filter === 'confirmed'} on:click={() => filter = 'confirmed'}>
			Confirmed <span class="count">{bookings.filter(b => b.status === 'confirmed').length}</span>
		</button>
		<button class:active={filter === 'completed'} on:click={() => filter = 'completed'}>
			Completed <span class="count">{bookings.filter(b => b.status === 'completed').length}</span>
		</button>
		<button class:active={filter === 'cancelled'} on:click={() => filter = 'cancelled'}>
			Cancelled <span class="count">{bookings.filter(b => b.status === 'cancelled').length}</span>
		</button>
	</div>

	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
		</div>
	{:else if filteredBookings.length === 0}
		<div class="empty-state">
			<div class="empty-icon">
				<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
					<line x1="16" y1="2" x2="16" y2="6"></line>
					<line x1="8" y1="2" x2="8" y2="6"></line>
					<line x1="3" y1="10" x2="21" y2="10"></line>
				</svg>
			</div>
			<h2>No bookings yet</h2>
			<p>When customers book your services, they'll appear here</p>
		</div>
	{:else}
		<div class="bookings-list">
			{#each filteredBookings as booking}
				<div class="booking-card">
					<div class="booking-header">
						<div class="booking-id">
							<span class="label">Booking #</span>
							<span class="value">{booking.id.slice(0, 8)}</span>
						</div>
						<span class="status-badge {booking.status}">{booking.status}</span>
					</div>

					<div class="booking-content">
						<div class="booking-info">
							<div class="info-row">
								<span class="label">Listing:</span>
								<span class="value">{booking.listingTitle || 'N/A'}</span>
							</div>
							<div class="info-row">
								<span class="label">Customer:</span>
								<span class="value">{booking.customerName || 'Guest'}</span>
							</div>
							<div class="info-row">
								<span class="label">Email:</span>
								<span class="value">{booking.customerEmail || 'N/A'}</span>
							</div>
							{#if booking.date}
								<div class="info-row">
									<span class="label">Date:</span>
									<span class="value">{formatDate(booking.date)}</span>
								</div>
							{/if}
							{#if booking.guests}
								<div class="info-row">
									<span class="label">Guests:</span>
									<span class="value">{booking.guests}</span>
								</div>
							{/if}
						</div>

						{#if booking.message}
							<div class="booking-message">
								<span class="label">Message:</span>
								<p>{booking.message}</p>
							</div>
						{/if}
					</div>

					<div class="booking-actions">
						{#if booking.status === 'pending'}
							<button class="btn-confirm" on:click={() => updateStatus(booking.id, 'confirmed')}>
								Confirm
							</button>
							<button class="btn-cancel" on:click={() => updateStatus(booking.id, 'cancelled')}>
								Cancel
							</button>
						{:else if booking.status === 'confirmed'}
							<button class="btn-complete" on:click={() => updateStatus(booking.id, 'completed')}>
								Mark Completed
							</button>
						{/if}
						<a href="/dashboard/business/bookings/{booking.id}" class="btn-view">
							View Details
						</a>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.bookings-page {
		max-width: 900px;
	}

	.page-header {
		margin-bottom: 1.5rem;
	}

	.page-header h1 {
		font-size: 1.75rem;
		color: #0a1e3c;
		margin-bottom: 0.5rem;
	}

	.page-header p {
		color: #666;
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

	.filter-tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}

	.filter-tabs button {
		padding: 0.5rem 1rem;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 20px;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.filter-tabs button:hover {
		border-color: #E8A44A;
	}

	.filter-tabs button.active {
		background: #E8A44A;
		border-color: #E8A44A;
		color: white;
	}

	.filter-tabs .count {
		background: rgba(0,0,0,0.1);
		padding: 0.1rem 0.4rem;
		border-radius: 10px;
		font-size: 0.8rem;
	}

	.filter-tabs button.active .count {
		background: rgba(255,255,255,0.2);
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
	}

	.bookings-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.booking-card {
		background: white;
		border-radius: 12px;
		padding: 1.25rem;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	}

	.booking-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.booking-id .label {
		font-size: 0.8rem;
		color: #6b7280;
	}

	.booking-id .value {
		font-weight: 600;
		color: #0a1e3c;
		margin-left: 0.5rem;
	}

	.status-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.8rem;
		font-weight: 500;
		text-transform: capitalize;
	}

	.status-badge.pending {
		background: #fef3c7;
		color: #92400e;
	}

	.status-badge.confirmed {
		background: #dcfce7;
		color: #166534;
	}

	.status-badge.completed {
		background: #e0e7ff;
		color: #3730a3;
	}

	.status-badge.cancelled {
		background: #fee2e2;
		color: #dc2626;
	}

	.booking-content {
		margin-bottom: 1rem;
	}

	.booking-info {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem;
	}

	.info-row .label {
		font-size: 0.85rem;
		color: #6b7280;
		margin-right: 0.5rem;
	}

	.info-row .value {
		font-weight: 500;
		color: #0a1e3c;
	}

	.booking-message {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	.booking-message .label {
		font-size: 0.85rem;
		color: #6b7280;
		display: block;
		margin-bottom: 0.5rem;
	}

	.booking-message p {
		color: #374151;
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.booking-actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.btn-confirm, .btn-cancel, .btn-complete, .btn-view {
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		text-decoration: none;
	}

	.btn-confirm {
		background: #16a34a;
		color: white;
		border: none;
	}

	.btn-confirm:hover {
		background: #15803d;
	}

	.btn-cancel {
		background: white;
		color: #dc2626;
		border: 1px solid #dc2626;
	}

	.btn-cancel:hover {
		background: #fee2e2;
	}

	.btn-complete {
		background: #3730a3;
		color: white;
		border: none;
	}

	.btn-complete:hover {
		background: #312e81;
	}

	.btn-view {
		background: #f3f4f6;
		color: #374151;
		border: none;
	}

	.btn-view:hover {
		background: #e5e7eb;
	}

	@media (max-width: 640px) {
		.booking-info {
			grid-template-columns: 1fr;
		}
	}
</style>
