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
		getDoc,
		updateDoc,
		deleteDoc,
		serverTimestamp
	} from 'firebase/firestore';

	let loading = true;
	let businessData: any = null;
	let businessName = 'Business';
	let businessCategory = '';
	let businessCity = '';
	let verified = false;
	let profileCompletion = 0;
	
	// Active tab
	let activeTab = 'overview';

	// Stats
	let stats = {
		views: 0,
		bookings: 0,
		revenue: 0,
		avgRating: 0,
		activeListings: 0,
		unreadMessages: 0
	};

	// Data
	let listings: any[] = [];
	let bookings: any[] = [];
	let reviews: any[] = [];
	let messages: any[] = [];
	let activities: any[] = [];
	let chartData: number[] = [];
	let days: string[] = [];
	
	// Filters
	let listingFilter: 'all' | 'published' | 'draft' | 'paused' = 'all';
	let bookingFilter: 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed' = 'all';
	let reviewFilter: 'all' | '5' | '4' | '3' | '2' | '1' = 'all';
	let sortBy = 'newest';

	// Forms
	let newListing: any = {
		title: '',
		category: '',
		description: '',
		price: '',
		duration: '',
		groupSizeMin: 1,
		groupSizeMax: 10,
		languages: [],
		included: [],
		notIncluded: [],
		meetingPoint: '',
		tags: [],
		photos: [],
		bookingType: 'instant',
		cancellationPolicy: 'flexible',
		status: 'draft'
	};

	// Profile form
	let profileForm: any = {};

	// Notifications
	let notifications: any[] = [];

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

			await loadAllData(firebaseUser.uid);
			loading = false;
		});

		return () => unsubscribe();
	});

	async function loadAllData(uid: string) {
		try {
			// Fetch all data in parallel with limits to prevent unbounded reads
			const [businessDoc, listingsSnap, bookingsSnap, reviewsSnap, messagesSnap] = await Promise.all([
				getDoc(doc(db!, 'businesses', uid)),
				getDocs(query(collection(db!, 'listings'), where('businessId', '==', uid), limit(100))),
				getDocs(query(collection(db!, 'bookings'), where('businessId', '==', uid), orderBy('createdAt', 'desc'), limit(100))),
				getDocs(query(collection(db!, 'reviews'), where('businessId', '==', uid), orderBy('createdAt', 'desc'), limit(100))),
				getDocs(query(collection(db!, 'messages'), where('businessId', '==', uid), orderBy('createdAt', 'desc'), limit(20)))
			]);

			if (businessDoc.exists()) {
				const data = businessDoc.data();
				businessData = data;
				businessName = data.businessName || 'Business';
				businessCategory = data.category || '';
				businessCity = data.city || '';
				verified = data.verified || false;
				profileForm = { ...data };
				const fields = ['businessName', 'category', 'city', 'description', 'phone', 'address', 'coverImage', 'logo'];
				const completed = fields.filter(f => data[f]).length;
				profileCompletion = Math.round((completed / fields.length) * 100);
			}

			listings = listingsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
			stats.activeListings = listings.filter(l => l.status === 'published').length;
			stats.views = listings.reduce((sum, l) => sum + (l.views || 0), 0);

			bookings = bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
			stats.bookings = bookings.length;
			stats.revenue = bookings.filter(b => b.status === 'completed' || b.status === 'confirmed').reduce((sum, b) => sum + (b.price || 0), 0);

			reviews = reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
			if (reviews.length > 0) {
				stats.avgRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
			}

			messages = messagesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
			stats.unreadMessages = messages.filter(m => !m.read).length;

			// Generate chart from real booking data
			generateChartData();

			// Build activity feed
			activities = [];
			bookings.slice(0, 3).forEach(b => {
				activities.push({ type: 'booking', title: `New booking for ${b.listingTitle || 'listing'}`, date: b.createdAt, icon: '📅' });
			});
			reviews.slice(0, 2).forEach(r => {
				activities.push({ type: 'review', title: `New ${r.rating}-star review`, date: r.createdAt, icon: '⭐' });
			});
			activities.sort((a, b) => {
				const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
				const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
				return dateB.getTime() - dateA.getTime();
			});

		} catch (err) {
			console.error('Error loading data:', err);
		}
	}

	function generateChartData() {
		const now = new Date();
		days = [];
		chartData = [];
		// Build a map of bookings per day over the last 30 days
		const countByDay = new Map<string, number>();
		bookings.forEach(b => {
			if (!b.createdAt) return;
			const d = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
			const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
			countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
		});
		for (let i = 29; i >= 0; i--) {
			const date = new Date(now);
			date.setDate(date.getDate() - i);
			const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
			days.push(label);
			chartData.push(countByDay.get(label) ?? 0);
		}
	}

	function formatDate(date: any): string {
		if (!date) return '';
		const d = date.toDate ? date.toDate() : new Date(date);
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function formatRelativeTime(date: any): string {
		if (!date) return '';
		const d = date.toDate ? date.toDate() : new Date(date);
		const diff = Date.now() - d.getTime();
		const hours = Math.floor(diff / 3600000);
		if (hours < 1) return 'Just now';
		if (hours < 24) return `${hours}h ago`;
		return `${Math.floor(hours / 24)}d ago`;
	}

	// Computed
	$: filteredListings = listings.filter(l => {
		if (listingFilter === 'all') return true;
		return l.status === listingFilter;
	}).sort((a, b) => {
		if (sortBy === 'newest') return (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0);
		if (sortBy === 'mostViewed') return (b.views || 0) - (a.views || 0);
		if (sortBy === 'highestRated') return (b.rating || 0) - (a.rating || 0);
		return 0;
	});

	$: filteredBookings = bookings.filter(b => {
		if (bookingFilter === 'all') return true;
		return b.status === bookingFilter;
	});

	$: filteredReviews = reviews.filter(r => {
		if (reviewFilter === 'all') return true;
		return r.rating === parseInt(reviewFilter);
	});

	// Actions
	async function updateBookingStatus(bookingId: string, status: string) {
		try {
			await updateDoc(doc(db!, 'bookings', bookingId), { status, updatedAt: serverTimestamp() });
			bookings = bookings.map(b => b.id === bookingId ? { ...b, status } : b);
		} catch (err) {
			console.error('Error updating booking:', err);
		}
	}

	async function toggleListingStatus(listing: any) {
		try {
			const newStatus = listing.status === 'published' ? 'draft' : 'published';
			await updateDoc(doc(db!, 'listings', listing.id), { status: newStatus });
			listings = listings.map(l => l.id === listing.id ? { ...l, status: newStatus } : l);
		} catch (err) {
			console.error('Error updating listing:', err);
		}
	}

	async function deleteListing(listingId: string) {
		if (!confirm('Delete this listing?')) return;
		try {
			await deleteDoc(doc(db!, 'listings', listingId));
			listings = listings.filter(l => l.id !== listingId);
		} catch (err) {
			console.error('Error deleting listing:', err);
		}
	}

	async function saveProfile() {
		if (!auth?.currentUser) return;
		try {
			await updateDoc(doc(db!, 'businesses', auth.currentUser.uid), profileForm);
			alert('Profile saved!');
		} catch (err) {
			console.error('Error saving profile:', err);
		}
	}

	// Listing creation
	async function createListing() {
		if (!auth?.currentUser) return;
		try {
			const { addDoc } = await import('firebase/firestore');
			await addDoc(collection(db!, 'listings'), {
				...newListing,
				businessId: auth.currentUser.uid,
				createdAt: serverTimestamp(),
				views: 0,
				bookings: 0,
				rating: 0
			});
			alert('Listing created!');
			newListing = { title: '', category: '', description: '', price: '', duration: '', groupSizeMin: 1, groupSizeMax: 10, languages: [], included: [], notIncluded: [], meetingPoint: '', tags: [], photos: [], bookingType: 'instant', cancellationPolicy: 'flexible', status: 'draft' };
			await loadAllData(auth.currentUser.uid);
		} catch (err) {
			console.error('Error creating listing:', err);
		}
	}

	// Categories
	const categories = ['Tour', 'Restaurant', 'Hotel', 'Attraction', 'Activity', 'Transport', 'Heritage Site'];
	const languages = ['Kazakh', 'Russian', 'English', 'German', 'French', 'Chinese'];
	const tagOptions = ['adventure', 'family', 'cultural', 'food', 'nature', 'photography', 'history', 'wellness', 'outdoor', 'romantic'];
</script>

<svelte:head>
	<title>Business Dashboard — VERYNICE.kz</title>
</svelte:head>

{#if loading}
	<div class="loading"><div class="spinner"></div></div>
{:else}
	<div class="dashboard-container">
		<!-- Header -->
		<header class="main-header">
			<div class="header-left">
				<h1>Business Dashboard</h1>
				{#if verified}
					<span class="badge verified">✓ Verified</span>
				{:else}
					<span class="badge pending">⏳ Verification pending</span>
				{/if}
			</div>
			<div class="header-right">
				<button class="notification-btn" class:has-unread={notifications.some(n => !n.read)}>
					🔔
					{#if notifications.filter(n => !n.read).length > 0}
						<span class="badge-count">{notifications.filter(n => !n.read).length}</span>
					{/if}
				</button>
			</div>
		</header>

		<!-- Tabs Navigation -->
		<nav class="tabs-nav">
			<button class="tab-btn" class:active={activeTab === 'overview'} on:click={() => activeTab = 'overview'}>🏠 Overview</button>
			<button class="tab-btn" class:active={activeTab === 'listings'} on:click={() => activeTab = 'listings'}>📋 Listings</button>
			<button class="tab-btn" class:active={activeTab === 'bookings'} on:click={() => activeTab = 'bookings'}>📅 Bookings</button>
			<button class="tab-btn" class:active={activeTab === 'inbox'} on:click={() => activeTab = 'inbox'}>📥 Inbox {#if stats.unreadMessages > 0}<span class="tab-badge">{stats.unreadMessages}</span>{/if}</button>
			<button class="tab-btn" class:active={activeTab === 'reviews'} on:click={() => activeTab = 'reviews'}>⭐ Reviews</button>
			<button class="tab-btn" class:active={activeTab === 'analytics'} on:click={() => activeTab = 'analytics'}>📊 Analytics</button>
			<button class="tab-btn" class:active={activeTab === 'media'} on:click={() => activeTab = 'media'}>🖼 Media</button>
			<button class="tab-btn" class:active={activeTab === 'profile'} on:click={() => activeTab = 'profile'}>👤 Profile</button>
			<button class="tab-btn" class:active={activeTab === 'settings'} on:click={() => activeTab = 'settings'}>⚙️ Settings</button>
			<button class="tab-btn" class:active={activeTab === 'growth'} on:click={() => activeTab = 'growth'}>🚀 Growth</button>
			<button class="tab-btn" class:active={activeTab === 'ai'} on:click={() => activeTab = 'ai'}>🤖 AI Tools</button>
		</nav>

		<!-- Content -->
		<div class="tab-content">
			<!-- OVERVIEW TAB -->
			{#if activeTab === 'overview'}
				<div class="overview-section">
					<!-- Welcome -->
					<div class="welcome-banner">
						<div class="welcome-text">
							<h2>Welcome back, {businessName}! 👋</h2>
							<p>{businessCategory} • {businessCity}</p>
						</div>
						<div class="profile-progress">
							<span>Profile: {profileCompletion}%</span>
							<div class="progress-bar"><div class="progress-fill" style="width: {profileCompletion}%"></div></div>
						</div>
					</div>

					<!-- Quick Actions -->
					<div class="quick-actions">
						<button class="action-btn" on:click={() => activeTab = 'listings'}>➕ Add Listing</button>
						<button class="action-btn" on:click={() => activeTab = 'bookings'}>📅 View Bookings</button>
						<button class="action-btn" on:click={() => activeTab = 'inbox'}>💬 Inbox</button>
						<button class="action-btn" on:click={() => activeTab = 'profile'}>✏️ Edit Profile</button>
					</div>

					<!-- Stats Grid -->
					<div class="stats-grid">
						<div class="stat-card"><div class="stat-icon views">👁</div><div class="stat-content"><span class="stat-value">{stats.views.toLocaleString()}</span><span class="stat-label">Views (30d)</span></div></div>
						<div class="stat-card"><div class="stat-icon bookings">📅</div><div class="stat-content"><span class="stat-value">{stats.bookings}</span><span class="stat-label">Bookings</span></div></div>
						<div class="stat-card"><div class="stat-icon revenue">💰</div><div class="stat-content"><span class="stat-value">₸{stats.revenue.toLocaleString()}</span><span class="stat-label">Revenue</span></div></div>
						<div class="stat-card"><div class="stat-icon rating">⭐</div><div class="stat-content"><span class="stat-value">{stats.avgRating.toFixed(1)}</span><span class="stat-label">Avg Rating</span></div></div>
						<div class="stat-card"><div class="stat-icon listings">📋</div><div class="stat-content"><span class="stat-value">{stats.activeListings}</span><span class="stat-label">Active Listings</span></div></div>
						<div class="stat-card"><div class="stat-icon messages">💬</div><div class="stat-content"><span class="stat-value">{stats.unreadMessages}</span><span class="stat-label">Unread Messages</span></div></div>
					</div>

					<!-- Charts & Activity -->
					<div class="overview-grid">
						<div class="chart-section">
							<h3>Views (30 Days)</h3>
							<div class="chart">
								{#each chartData as value, i}
									<div class="chart-bar-wrapper">
										<div class="chart-bar" style="height: {Math.max(10, (value / Math.max(...chartData)) * 100)}%"></div>
										<span class="chart-label">{days[i]?.split(' ')[1]}</span>
									</div>
								{/each}
							</div>
						</div>
						<div class="activity-section">
							<h3>Recent Activity</h3>
							{#each activities.slice(0, 5) as activity}
								<div class="activity-item">
									<span class="activity-icon">{activity.icon}</span>
									<div class="activity-details"><span class="activity-title">{activity.title}</span></div>
									<span class="activity-time">{formatRelativeTime(activity.date)}</span>
								</div>
							{/each}
						</div>
					</div>

					<!-- Recent Tables -->
					<div class="tables-grid">
						<div class="table-section">
							<h3>Recent Bookings <button class="link-btn" on:click={() => activeTab = 'bookings'}>View all →</button></h3>
							<table class="data-table">
								<thead><tr><th>Guest</th><th>Listing</th><th>Status</th></tr></thead>
								<tbody>
									{#each bookings.slice(0, 5) as booking}
										<tr><td>{booking.customerName || 'Guest'}</td><td>{booking.listingTitle || 'N/A'}</td><td><span class="status-badge {booking.status}">{booking.status}</span></td></tr>
									{/each}
								</tbody>
							</table>
						</div>
						<div class="table-section">
							<h3>Recent Reviews <button class="link-btn" on:click={() => activeTab = 'reviews'}>View all →</button></h3>
							<table class="data-table">
								<thead><tr><th>Reviewer</th><th>Rating</th><th>Date</th></tr></thead>
								<tbody>
									{#each reviews.slice(0, 5) as review}
										<tr><td>{review.reviewerName || 'Anonymous'}</td><td>{'⭐'.repeat(review.rating || 0)}</td><td>{formatDate(review.createdAt)}</td></tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			{/if}

			<!-- LISTINGS TAB -->
			{#if activeTab === 'listings'}
				<div class="listings-section">
					<div class="section-header">
						<h2>📋 Listings</h2>
						<button class="btn-primary" on:click={() => activeTab = 'new-listing'}>+ Add New Listing</button>
					</div>
					
					<!-- Filters -->
					<div class="filters-bar">
						<div class="filter-group">
							<button class="filter-btn" class:active={listingFilter === 'all'} on:click={() => listingFilter = 'all'}>All ({listings.length})</button>
							<button class="filter-btn" class:active={listingFilter === 'published'} on:click={() => listingFilter = 'published'}>Published ({listings.filter(l => l.status === 'published').length})</button>
							<button class="filter-btn" class:active={listingFilter === 'draft'} on:click={() => listingFilter = 'draft'}>Draft ({listings.filter(l => l.status === 'draft').length})</button>
							<button class="filter-btn" class:active={listingFilter === 'paused'} on:click={() => listingFilter = 'paused'}>Paused ({listings.filter(l => l.status === 'paused').length})</button>
						</div>
						<select bind:value={sortBy} class="sort-select">
							<option value="newest">Newest</option>
							<option value="mostViewed">Most Viewed</option>
							<option value="highestRated">Highest Rated</option>
						</select>
					</div>

					<!-- Listings Table -->
					<table class="data-table full">
						<thead>
							<tr>
								<th>Listing</th>
								<th>Category</th>
								<th>Status</th>
								<th>Views</th>
								<th>Bookings</th>
								<th>Rating</th>
								<th>Quality</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredListings as listing}
								<tr>
									<td class="listing-cell">
										<div class="listing-info">
											{#if listing.coverImage}<img src={listing.coverImage} alt="" class="thumb"/>{:else}<div class="thumb placeholder">📷</div>{/if}
											<div><strong>{listing.title || 'Untitled'}</strong><br/><small>{listing.location || 'No location'}</small></div>
										</div>
									</td>
									<td><span class="category-tag">{listing.category || 'None'}</span></td>
									<td><span class="status-badge {listing.status}">{listing.status}</span></td>
									<td>{listing.views || 0}</td>
									<td>{listing.bookings || 0}</td>
									<td>{(listing.rating || 0).toFixed(1)} ⭐</td>
									<td>
										<div class="quality-score">
											<span>📷 {(listing.photos?.length || 0)}</span>
											<span>📝 {listing.description?.length > 50 ? '✓' : '✗'}</span>
											<span>💰 {listing.price ? '✓' : '✗'}</span>
										</div>
									</td>
									<td>
										<div class="action-buttons">
											<button class="action-btn sm" title="Edit">✏️</button>
											<button class="action-btn sm" title="Preview">👁</button>
											<button class="action-btn sm" title="Duplicate">📋</button>
											<button class="action-btn sm" on:click={() => toggleListingStatus(listing)} title={listing.status === 'published' ? 'Pause' : 'Publish'}>
												{listing.status === 'published' ? '⏸' : '▶️'}
											</button>
											<button class="action-btn sm danger" on:click={() => deleteListing(listing.id)} title="Delete">🗑️</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}

			<!-- NEW LISTING TAB -->
			{#if activeTab === 'new-listing'}
				<div class="new-listing-section">
					<div class="section-header">
						<h2>➕ Create New Listing</h2>
						<button class="btn-secondary" on:click={() => activeTab = 'listings'}>← Back to Listings</button>
					</div>

					<div class="form-grid">
						<div class="form-group">
							<label>Title *</label>
							<input type="text" bind:value={newListing.title} placeholder="Enter listing title" />
						</div>
						<div class="form-group">
							<label>Category *</label>
							<select bind:value={newListing.category}>
								<option value="">Select category</option>
								{#each categories as cat}<option value={cat}>{cat}</option>{/each}
							</select>
						</div>
						<div class="form-group full">
							<label>Description</label>
							<textarea bind:value={newListing.description} rows="4" placeholder="Describe your listing..."></textarea>
						</div>
						<div class="form-group">
							<label>Price (₸)</label>
							<input type="text" bind:value={newListing.price} placeholder="e.g. 15000" />
						</div>
						<div class="form-group">
							<label>Duration</label>
							<input type="text" bind:value={newListing.duration} placeholder="e.g. 3 hours" />
						</div>
						<div class="form-group">
							<label>Group Size Min</label>
							<input type="number" bind:value={newListing.groupSizeMin} min="1" />
						</div>
						<div class="form-group">
							<label>Group Size Max</label>
							<input type="number" bind:value={newListing.groupSizeMax} min="1" />
						</div>
						<div class="form-group full">
							<label>Meeting Point / Address</label>
							<input type="text" bind:value={newListing.meetingPoint} placeholder="Enter address or meeting point" />
						</div>
						<div class="form-group full">
							<label>Tags</label>
							<div class="tags-input">
								{#each tagOptions as tag}
									<button type="button" class="tag-option" class:selected={newListing.tags.includes(tag)} on:click={() => newListing.tags = newListing.tags.includes(tag) ? newListing.tags.filter(t => t !== tag) : [...newListing.tags, tag]}>{tag}</button>
								{/each}
							</div>
						</div>
						<div class="form-group">
							<label>Booking Type</label>
							<select bind:value={newListing.bookingType}>
								<option value="instant">Instant Confirmation</option>
								<option value="request">Request Only</option>
								<option value="enquiry">Enquiry Only</option>
							</select>
						</div>
						<div class="form-group">
							<label>Cancellation Policy</label>
							<select bind:value={newListing.cancellationPolicy}>
								<option value="flexible">Flexible</option>
								<option value="moderate">Moderate</option>
								<option value="strict">Strict</option>
							</select>
						</div>
					</div>

					<div class="form-actions">
						<button class="btn-secondary" on:click={() => { newListing.status = 'draft'; createListing(); }}>💾 Save as Draft</button>
						<button class="btn-primary" on:click={() => { newListing.status = 'published'; createListing(); }}>🚀 Publish Now</button>
					</div>
				</div>
			{/if}

			<!-- BOOKINGS TAB -->
			{#if activeTab === 'bookings'}
				<div class="bookings-section">
					<div class="section-header">
						<h2>📅 Bookings</h2>
						<button class="btn-secondary">📥 Export CSV</button>
					</div>

					<div class="filters-bar">
						<button class="filter-btn" class:active={bookingFilter === 'all'} on:click={() => bookingFilter = 'all'}>All ({bookings.length})</button>
						<button class="filter-btn" class:active={bookingFilter === 'pending'} on:click={() => bookingFilter = 'pending'}>Pending ({bookings.filter(b => b.status === 'pending').length})</button>
						<button class="filter-btn" class:active={bookingFilter === 'confirmed'} on:click={() => bookingFilter = 'confirmed'}>Confirmed ({bookings.filter(b => b.status === 'confirmed').length})</button>
						<button class="filter-btn" class:active={bookingFilter === 'completed'} on:click={() => bookingFilter = 'completed'}>Completed ({bookings.filter(b => b.status === 'completed').length})</button>
						<button class="filter-btn" class:active={bookingFilter === 'cancelled'} on:click={() => bookingFilter = 'cancelled'}>Cancelled ({bookings.filter(b => b.status === 'cancelled').length})</button>
					</div>

					<table class="data-table full">
						<thead>
							<tr>
								<th>Guest</th>
								<th>Listing</th>
								<th>Date</th>
								<th>Guests</th>
								<th>Price</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredBookings as booking}
								<tr>
									<td>
										<div><strong>{booking.customerName || 'Guest'}</strong><br/><small>{booking.customerEmail || ''}</small></div>
									</td>
									<td>{booking.listingTitle || 'N/A'}</td>
									<td>{formatDate(booking.date || booking.createdAt)}</td>
									<td>{booking.guests || 1}</td>
									<td>₸{booking.price?.toLocaleString() || 0}</td>
									<td><span class="status-badge {booking.status}">{booking.status}</span></td>
									<td>
										<div class="action-buttons">
											{#if booking.status === 'pending'}
												<button class="action-btn sm success" on:click={() => updateBookingStatus(booking.id, 'confirmed')}>✓ Confirm</button>
												<button class="action-btn sm danger" on:click={() => updateBookingStatus(booking.id, 'cancelled')}>✕ Cancel</button>
											{:else if booking.status === 'confirmed'}
												<button class="action-btn sm" on:click={() => updateBookingStatus(booking.id, 'completed')}>✓ Complete</button>
											{/if}
											<button class="action-btn sm">💬 Contact</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}

			<!-- INBOX TAB -->
			{#if activeTab === 'inbox'}
				<div class="inbox-section">
					<div class="section-header">
						<h2>📥 Inbox</h2>
						<button class="btn-secondary">⚙️ Auto-reply Settings</button>
					</div>

					{#if messages.length === 0}
						<div class="empty-state"><p>No messages yet</p></div>
					{:else}
						<div class="messages-list">
							{#each messages as message}
								<div class="message-item" class:unread={!message.read}>
									<div class="message-avatar">{message.customerName?.charAt(0) || 'G'}</div>
									<div class="message-content">
										<div class="message-header">
											<strong>{message.customerName || 'Guest'}</strong>
											<span class="listing-ref">{message.listingTitle || ''}</span>
										</div>
										<p class="message-preview">{message.message || 'No message content'}</p>
										<span class="message-time">{formatRelativeTime(message.createdAt)}</span>
									</div>
									{#if !message.read}<span class="unread-dot"></span>{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			<!-- REVIEWS TAB -->
			{#if activeTab === 'reviews'}
				<div class="reviews-section">
					<div class="section-header">
						<h2>⭐ Reviews</h2>
						<button class="btn-secondary">🔗 Generate Review Link</button>
					</div>

					<!-- Rating Summary -->
					<div class="rating-summary">
						<div class="rating-big">{stats.avgRating.toFixed(1)}</div>
						<div class="rating-stars">{'⭐'.repeat(Math.round(stats.avgRating))}</div>
						<div class="rating-count">({reviews.length} reviews)</div>
					</div>

					<!-- Star Breakdown -->
					<div class="star-breakdown">
						{#each [5,4,3,2,1] as star}
							<div class="breakdown-row">
								<span class="star-label">{star} ⭐</span>
								<div class="breakdown-bar"><div class="breakdown-fill" style="width: {reviews.length ? (reviews.filter(r => r.rating === star).length / reviews.length * 100) : 0}%"></div></div>
								<span class="breakdown-count">{reviews.filter(r => r.rating === star).length}</span>
							</div>
						{/each}
					</div>

					<!-- Filters -->
					<div class="filters-bar">
						<button class="filter-btn" class:active={reviewFilter === 'all'} on:click={() => reviewFilter = 'all'}>All</button>
						{#each [5,4,3,2,1] as star}
							<button class="filter-btn" class:active={reviewFilter === String(star)} on:click={() => reviewFilter = String(star)}>{star} ⭐</button>
						{/each}
					</div>

					<!-- Reviews List -->
					<div class="reviews-list">
						{#each filteredReviews as review}
							<div class="review-card">
								<div class="review-header">
									<strong>{review.reviewerName || 'Anonymous'}</strong>
									<span class="review-rating">{'⭐'.repeat(review.rating)}</span>
								</div>
								<p class="review-text">{review.reviewText || 'No comment'}</p>
								<div class="review-footer">
									<span class="review-date">{formatDate(review.createdAt)}</span>
									{#if review.reply}
										<span class="replied-badge">✓ Replied</span>
									{:else}
										<button class="btn-small">💬 Reply</button>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- ANALYTICS TAB -->
			{#if activeTab === 'analytics'}
				<div class="analytics-section">
					<div class="section-header">
						<h2>📊 Analytics</h2>
						<div class="date-picker">
							<button class="date-btn active">7d</button>
							<button class="date-btn active">30d</button>
							<button class="date-btn">90d</button>
							<button class="date-btn">Custom</button>
						</div>
					</div>

					<!-- Overview Cards -->
					<div class="analytics-cards">
						<div class="analytics-card"><h4>Total Views</h4><div class="analytics-value">{stats.views.toLocaleString()}</div></div>
						<div class="analytics-card"><h4>Total Bookings</h4><div class="analytics-value">{stats.bookings}</div></div>
						<div class="analytics-card"><h4>Revenue</h4><div class="analytics-value">₸{stats.revenue.toLocaleString()}</div></div>
						<div class="analytics-card"><h4>Conversion Rate</h4><div class="analytics-value">{stats.views > 0 ? ((stats.bookings / stats.views) * 100).toFixed(1) : 0}%</div></div>
					</div>

					<!-- Traffic Sources -->
					<div class="analytics-grid">
						<div class="analytics-panel">
							<h4>Traffic Sources</h4>
							<div class="source-list">
								<div class="source-item"><span>🔍 Search</span><span>45%</span></div>
								<div class="source-item"><span>🔗 Direct</span><span>30%</span></div>
								<div class="source-item"><span>📱 Social</span><span>15%</span></div>
								<div class="source-item"><span>📤 Referral</span><span>10%</span></div>
							</div>
						</div>
						<div class="analytics-panel">
							<h4>Top Listings</h4>
							<div class="top-listings">
								{#each listings.slice(0, 5) as listing, i}
									<div class="top-listing-item">
										<span class="rank">{i+1}</span>
										<span class="title">{listing.title}</span>
										<span class="views">{listing.views || 0} views</span>
									</div>
								{/each}
							</div>
						</div>
					</div>

					<button class="btn-secondary full-width">📥 Export All Data as CSV</button>
				</div>
			{/if}

			<!-- MEDIA TAB -->
			{#if activeTab === 'media'}
				<div class="media-section">
					<div class="section-header">
						<h2>🖼️ Media Library</h2>
						<div class="storage-indicator">
							<span>Storage: 2.1 GB / 5 GB</span>
							<div class="storage-bar"><div class="storage-fill" style="width: 42%"></div></div>
						</div>
					</div>

					<div class="filters-bar">
						<button class="filter-btn active">All</button>
						<button class="filter-btn">Photos</button>
						<button class="filter-btn">Videos</button>
						<button class="filter-btn">PDFs</button>
					</div>

					<div class="media-upload">
						<button class="upload-btn">☁️ Upload to Cloudinary</button>
					</div>

					<div class="media-grid">
						{#each listings.flatMap(l => (l.photos || []).map(p => ({ ...l, photo: p }))) as item}
							<div class="media-item">
								<img src={item.photo} alt="" />
								<div class="media-overlay">
									<button>📋</button>
									<button>🗑️</button>
								</div>
							</div>
						{/each}
						{#if listings.every(l => !l.photos || l.photos.length === 0)}
							<div class="empty-media"><p>No media uploaded yet</p></div>
						{/if}
					</div>
				</div>
			{/if}

			<!-- PROFILE TAB -->
			{#if activeTab === 'profile'}
				<div class="profile-section">
					<div class="section-header">
						<h2>👤 Business Profile</h2>
						<button class="btn-primary" on:click={saveProfile}>💾 Save Changes</button>
					</div>

					<div class="form-grid">
						<div class="form-group">
							<label>Business Name *</label>
							<input type="text" bind:value={profileForm.businessName} />
						</div>
						<div class="form-group">
							<label>Category</label>
							<select bind:value={profileForm.category}>
								{#each categories as cat}<option value={cat}>{cat}</option>{/each}
							</select>
						</div>
						<div class="form-group">
							<label>City</label>
							<input type="text" bind:value={profileForm.city} />
						</div>
						<div class="form-group">
							<label>Phone</label>
							<input type="tel" bind:value={profileForm.phone} />
						</div>
						<div class="form-group">
							<label>Website</label>
							<input type="url" bind:value={profileForm.website} placeholder="https://" />
						</div>
						<div class="form-group">
							<label>Year Established</label>
							<input type="number" bind:value={profileForm.yearEstablished} />
						</div>
						<div class="form-group full">
							<label>Short Description (for search results)</label>
							<textarea bind:value={profileForm.shortDescription} rows="2" maxlength="160"></textarea>
						</div>
						<div class="form-group full">
							<label>Full Description</label>
							<textarea bind:value={profileForm.description} rows="4"></textarea>
						</div>
						<div class="form-group full">
							<label>Address</label>
							<input type="text" bind:value={profileForm.address} />
						</div>
						<div class="form-group">
							<label>Logo</label>
							<input type="file" accept="image/*" />
						</div>
						<div class="form-group">
							<label>Cover Photo</label>
							<input type="file" accept="image/*" />
						</div>
						<div class="form-group full">
							<label>Social Links</label>
							<div class="social-inputs">
								<input type="text" placeholder="Instagram" bind:value={profileForm.socialInstagram} />
								<input type="text" placeholder="Facebook" bind:value={profileForm.socialFacebook} />
								<input type="text" placeholder="TikTok" bind:value={profileForm.socialTikTok} />
								<input type="text" placeholder="WhatsApp" bind:value={profileForm.socialWhatsApp} />
							</div>
						</div>
						<div class="form-group full">
							<label>Languages Spoken</label>
							<div class="tags-input">
								{#each languages as lang}
									<button type="button" class="tag-option" class:selected={profileForm.languages?.includes(lang)} on:click={() => profileForm.languages = profileForm.languages?.includes(lang) ? profileForm.languages.filter(l => l !== lang) : [...(profileForm.languages || []), lang]}>{lang}</button>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- SETTINGS TAB -->
			{#if activeTab === 'settings'}
				<div class="settings-section">
					<div class="section-header"><h2>⚙️ Settings</h2></div>
					<div class="settings-tabs">
						<button class="settings-tab active">Account</button>
						<button class="settings-tab">Notifications</button>
						<button class="settings-tab">Team</button>
						<button class="settings-tab">Billing</button>
						<button class="settings-tab danger">Danger Zone</button>
					</div>
					<div class="settings-panel">
						<div class="form-group"><label>Email</label><input type="email" value={businessData?.email || ''} disabled /></div>
						<div class="form-group"><label>New Password</label><input type="password" placeholder="Enter new password" /></div>
						<button class="btn-primary">Update Password</button>
						<hr/>
						<h4>Two-Factor Authentication</h4>
						<label class="toggle"><input type="checkbox" /> <span>Enable 2FA</span></label>
						<hr/>
						<h4>Active Sessions</h4>
						<div class="session-list"><div class="session-item"><span>✓ Current Session</span><span>Chrome on Windows</span><button>Revoke</button></div></div>
					</div>
				</div>
			{/if}

			<!-- GROWTH TAB -->
			{#if activeTab === 'growth'}
				<div class="growth-section">
					<div class="section-header"><h2>🚀 Growth & Marketing</h2></div>
					<div class="growth-grid">
						<div class="growth-card"><h3>📱 Social Share Cards</h3><p>Generate shareable images for social media</p><button class="btn-secondary">Coming Soon</button></div>
						<div class="growth-card"><h3>🔳 QR Code Generator</h3><p>Create QR codes for your listings</p><button class="btn-secondary">Coming Soon</button></div>
						<div class="growth-card"><h3>🏷️ Promotional Offers</h3><p>Create discount offers</p><button class="btn-secondary">Coming Soon</button></div>
						<div class="growth-card"><h3>🤝 Referral Program</h3><p>Invite other businesses</p><button class="btn-secondary">Coming Soon</button></div>
					</div>
					<div class="upgrade-banner"><h3>⭐ Get Featured</h3><p>Boost your visibility with featured placement</p><button class="btn-upgrade">Upgrade to Pro</button></div>
				</div>
			{/if}

			<!-- AI TAB -->
			{#if activeTab === 'ai'}
				<div class="ai-section">
					<div class="section-header"><h2>🤖 AI Tools</h2></div>
					<div class="ai-grid">
						<div class="ai-card"><h3>✍️ Description Generator</h3><p>AI-powered listing descriptions</p><button class="btn-secondary">Coming Soon</button></div>
						<div class="ai-card"><h3>💭 Sentiment Analysis</h3><p>Understand customer feedback</p><button class="btn-secondary">Coming Soon</button></div>
						<div class="ai-card"><h3>🏷️ Tag Suggestions</h3><p>AI-powered tag recommendations</p><button class="btn-secondary">Coming Soon</button></div>
						<div class="ai-card"><h3>🌐 Translation</h3><p>Translate to KZ / RU / EN</p><button class="btn-secondary">Coming Soon</button></div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.dashboard-container { max-width: 1400px; margin: 0 auto; }
	.loading { display: flex; align-items: center; justify-content: center; min-height: 400px; }
	.spinner { width: 40px; height: 40px; border: 3px solid #f0f0f0; border-top-color: #0a1e3c; border-radius: 50%; animation: spin 0.8s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }

	.main-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding: 1rem 1.5rem; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
	.header-left h1 { font-size: 1.5rem; color: #0a1e3c; margin: 0; }
	.badge { padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.85rem; font-weight: 500; }
	.badge.verified { background: #dcfce7; color: #166534; }
	.badge.pending { background: #fef3c7; color: #92400e; }

	.notification-btn { position: relative; background: none; border: none; font-size: 1.25rem; cursor: pointer; padding: 0.5rem; }
	.notification-btn.has-unread::after { content: ''; position: absolute; top: 4px; right: 4px; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; }
	.badge-count { position: absolute; top: 0; right: 0; background: #ef4444; color: white; font-size: 0.65rem; padding: 0.1rem 0.35rem; border-radius: 10px; }

	.tabs-nav { display: flex; gap: 0.25rem; margin-bottom: 1.5rem; overflow-x: auto; padding-bottom: 0.5rem; }
	.tab-btn { padding: 0.6rem 1rem; background: white; border: none; border-radius: 8px; font-size: 0.9rem; cursor: pointer; white-space: nowrap; transition: all 0.2s; color: #6b7280; display: flex; align-items: center; gap: 0.35rem; }
	.tab-btn:hover { background: #f3f4f6; }
	.tab-btn.active { background: #E8A44A; color: white; }
	.tab-badge { background: #ef4444; color: white; font-size: 0.7rem; padding: 0.1rem 0.4rem; border-radius: 10px; margin-left: 0.25rem; }

	.tab-content { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); min-height: 500px; }
	.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
	.section-header h2 { font-size: 1.25rem; color: #0a1e3c; margin: 0; }

	.btn-primary { padding: 0.6rem 1.25rem; background: #E8A44A; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; }
	.btn-primary:hover { background: #d69440; }
	.btn-secondary { padding: 0.6rem 1.25rem; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; }
	.btn-secondary:hover { background: #e5e7eb; }

	.welcome-banner { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; background: linear-gradient(135deg, #0a1e3c, #1a3a5c); border-radius: 12px; color: white; margin-bottom: 1.5rem; }
	.welcome-text h2 { margin: 0 0 0.25rem 0; }
	.welcome-text p { margin: 0; opacity: 0.8; }
	.profile-progress { width: 200px; }
	.profile-progress span { font-size: 0.85rem; display: block; margin-bottom: 0.35rem; }
	.progress-bar { height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; overflow: hidden; }
	.progress-fill { height: 100%; background: #E8A44A; }

	.quick-actions { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
	.action-btn { padding: 0.75rem 1.25rem; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; }
	.action-btn:hover { background: #fffbf0; border-color: #E8A44A; }

	.stats-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
	.stat-card { background: #f9fafb; border-radius: 10px; padding: 1rem; display: flex; align-items: center; gap: 0.75rem; }
	.stat-icon { font-size: 1.5rem; }
	.stat-value { display: block; font-size: 1.25rem; font-weight: 700; color: #0a1e3c; }
	.stat-label { font-size: 0.75rem; color: #6b7280; }

	.overview-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
	.chart-section, .activity-section { background: #f9fafb; border-radius: 10px; padding: 1.25rem; }
	.chart-section h3, .activity-section h3 { margin: 0 0 1rem 0; font-size: 1rem; color: #0a1e3c; }
	.chart { display: flex; align-items: flex-end; height: 150px; gap: 3px; }
	.chart-bar-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; }
	.chart-bar { width: 100%; background: linear-gradient(to top, #E8A44A, #f0b86e); border-radius: 3px 3px 0 0; min-height: 4px; }
	.chart-label { font-size: 0.6rem; color: #9ca3af; margin-top: 0.25rem; }

	.activity-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb; }
	.activity-item:last-child { border: none; }
	.activity-icon { font-size: 1.1rem; }
	.activity-details { flex: 1; }
	.activity-title { font-size: 0.85rem; color: #374151; }
	.activity-time { font-size: 0.75rem; color: #9ca3af; }

	.tables-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
	.table-section h3 { display: flex; justify-content: space-between; align-items: center; margin: 0 0 1rem 0; font-size: 1rem; }
	.link-btn { background: none; border: none; color: #E8A44A; cursor: pointer; font-size: 0.85rem; }

	.data-table { width: 100%; border-collapse: collapse; }
	.data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
	.data-table th { background: #f9fafb; font-weight: 500; color: #6b7280; font-size: 0.8rem; text-transform: uppercase; }
	.data-table td { font-size: 0.9rem; color: #374151; }
	.data-table.full { width: 100%; }

	.filters-bar { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center; }
	.filter-btn { padding: 0.4rem 0.75rem; background: white; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 0.85rem; cursor: pointer; }
	.filter-btn.active { background: #E8A44A; border-color: #E8A44A; color: white; }
	.sort-select { padding: 0.4rem 0.75rem; border: 1px solid #e5e7eb; border-radius: 6px; }

	.status-badge { padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500; text-transform: capitalize; }
	.status-badge.pending { background: #fef3c7; color: #92400e; }
	.status-badge.confirmed { background: #dcfce7; color: #166534; }
	.status-badge.completed { background: #e0e7ff; color: #3730a3; }
	.status-badge.cancelled { background: #fee2e2; color: #dc2626; }
	.status-badge.published { background: #dcfce7; color: #166534; }
	.status-badge.draft { background: #f3f4f6; color: #6b7280; }
	.status-badge.paused { background: #fef3c7; color: #92400e; }

	.listing-cell .listing-info { display: flex; align-items: center; gap: 0.75rem; }
	.thumb { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; }
	.thumb.placeholder { background: #f3f4f6; display: flex; align-items: center; justify-content: center; }
	.category-tag { padding: 0.2rem 0.5rem; background: #e0e7ff; color: #3730a3; border-radius: 12px; font-size: 0.75rem; }
	.quality-score { display: flex; gap: 0.5rem; font-size: 0.8rem; }
	.action-buttons { display: flex; gap: 0.35rem; }
	.action-btn.sm { padding: 0.35rem 0.5rem; font-size: 0.8rem; }
	.action-btn.danger:hover { background: #fee2e2; }

	.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
	.form-group { }
	.form-group.full { grid-column: span 2; }
	.form-group label { display: block; font-size: 0.85rem; color: #374151; margin-bottom: 0.35rem; font-weight: 500; }
	.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.6rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.95rem; }
	.form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #E8A44A; }
	.form-actions { display: flex; gap: 1rem; justify-content: flex-end; }

	.tags-input { display: flex; flex-wrap: wrap; gap: 0.5rem; }
	.tag-option { padding: 0.35rem 0.75rem; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 0.8rem; cursor: pointer; }
	.tag-option.selected { background: #E8A44A; border-color: #E8A44A; color: white; }

	.social-inputs { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
	.social-inputs input { padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 6px; }

	.messages-list { display: flex; flex-direction: column; gap: 0.75rem; }
	.message-item { display: flex; align-items: flex-start; gap: 1rem; padding: 1rem; background: #f9fafb; border-radius: 10px; position: relative; }
	.message-item.unread { background: #fffbf0; border-left: 3px solid #E8A44A; }
	.message-avatar { width: 40px; height: 40px; background: #E8A44A; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; }
	.message-content { flex: 1; }
	.message-header { display: flex; justify-content: space-between; margin-bottom: 0.25rem; }
	.listing-ref { font-size: 0.8rem; color: #6b7280; }
	.message-preview { font-size: 0.9rem; color: #6b7280; margin: 0.25rem 0; }
	.message-time { font-size: 0.75rem; color: #9ca3af; }
	.unread-dot { width: 8px; height: 8px; background: #E8A44A; border-radius: 50%; }

	.rating-summary { display: flex; align-items: center; gap: 1rem; padding: 1.5rem; background: #f9fafb; border-radius: 12px; margin-bottom: 1.5rem; }
	.rating-big { font-size: 3rem; font-weight: 700; color: #0a1e3c; }
	.rating-stars { font-size: 1.5rem; }
	.rating-count { color: #6b7280; }

	.star-breakdown { margin-bottom: 1.5rem; }
	.breakdown-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
	.star-label { width: 50px; font-size: 0.85rem; }
	.breakdown-bar { flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; }
	.breakdown-fill { height: 100%; background: #fbbf24; border-radius: 4px; }
	.breakdown-count { width: 30px; text-align: right; font-size: 0.85rem; color: #6b7280; }

	.reviews-list { display: flex; flex-direction: column; gap: 1rem; }
	.review-card { padding: 1rem; background: #f9fafb; border-radius: 10px; }
	.review-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
	.review-text { font-size: 0.9rem; color: #374151; margin-bottom: 0.5rem; }
	.review-footer { display: flex; justify-content: space-between; align-items: center; }
	.review-date { font-size: 0.8rem; color: #9ca3af; }
	.replied-badge { background: #dcfce7; color: #166534; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; }
	.btn-small { padding: 0.35rem 0.75rem; background: white; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.8rem; cursor: pointer; }

	.analytics-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
	.analytics-card { background: #f9fafb; border-radius: 10px; padding: 1.25rem; text-align: center; }
	.analytics-card h4 { margin: 0 0 0.5rem 0; font-size: 0.85rem; color: #6b7280; }
	.analytics-value { font-size: 1.5rem; font-weight: 700; color: #0a1e3c; }

	.analytics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 1.5rem; }
	.analytics-panel { background: #f9fafb; border-radius: 10px; padding: 1.25rem; }
	.analytics-panel h4 { margin: 0 0 1rem 0; font-size: 1rem; }
	.source-list, .top-listings { display: flex; flex-direction: column; gap: 0.5rem; }
	.source-item, .top-listing-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb; font-size: 0.9rem; }
	.rank { width: 24px; height: 24px; background: #E8A44A; color: white; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; margin-right: 0.5rem; }
	.date-picker { display: flex; gap: 0.25rem; }
	.date-btn { padding: 0.35rem 0.75rem; background: white; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.85rem; cursor: pointer; }
	.date-btn.active { background: #0a1e3c; color: white; border-color: #0a1e3c; }

	.full-width { width: 100%; }

	.media-section .storage-indicator { display: flex; align-items: center; gap: 1rem; }
	.storage-bar { width: 100px; height: 6px; background: #e5e7eb; border-radius: 3px; }
	.storage-fill { height: 100%; background: #E8A44A; border-radius: 3px; }

	.media-upload { margin-bottom: 1.5rem; }
	.upload-btn { padding: 0.75rem 1.5rem; background: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 10px; cursor: pointer; font-size: 0.9rem; }
	.upload-btn:hover { border-color: #E8A44A; background: #fffbf0; }

	.media-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
	.media-item { aspect-ratio: 1; background: #f3f4f6; border-radius: 8px; overflow: hidden; position: relative; }
	.media-item img { width: 100%; height: 100%; object-fit: cover; }
	.empty-media { grid-column: span 4; text-align: center; padding: 3rem; color: #9ca3af; }

	.settings-tabs { display: flex; gap: 0.25rem; margin-bottom: 1.5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; }
	.settings-tab { padding: 0.5rem 1rem; background: none; border: none; font-size: 0.9rem; cursor: pointer; color: #6b7280; }
	.settings-tab.active { color: #E8A44A; border-bottom: 2px solid #E8A44A; }
	.settings-tab.danger { color: #dc2626; }
	.settings-panel { background: #f9fafb; border-radius: 10px; padding: 1.5rem; }
	.settings-panel h4 { margin: 1.5rem 0 0.75rem 0; }
	.settings-panel hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0; }
	.toggle { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
	.session-list { display: flex; flex-direction: column; gap: 0.5rem; }
	.session-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 6px; }

	.growth-grid, .ai-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
	.growth-card, .ai-card { background: #f9fafb; border-radius: 10px; padding: 1.25rem; }
	.growth-card h3, .ai-card h3 { margin: 0 0 0.5rem 0; font-size: 1rem; }
	.growth-card p, .ai-card p { font-size: 0.85rem; color: #6b7280; margin-bottom: 1rem; }

	.upgrade-banner { background: linear-gradient(135deg, #0a1e3c, #1a3a5c); border-radius: 12px; padding: 2rem; text-align: center; color: white; }
	.upgrade-banner h3 { margin: 0 0 0.5rem 0; }
	.upgrade-banner p { opacity: 0.8; margin-bottom: 1rem; }
	.btn-upgrade { padding: 0.75rem 2rem; background: #E8A44A; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }

	.empty-state { text-align: center; padding: 3rem; color: #9ca3af; }

	@media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } .overview-grid, .tables-grid, .analytics-grid { grid-template-columns: 1fr; } .growth-grid, .ai-grid { grid-template-columns: 1fr; } }
	@media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .form-grid { grid-template-columns: 1fr; } .form-group.full { grid-column: span 1; } .media-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
