<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth, db } from '$lib/firebase';
	import { onAuthStateChanged } from 'firebase/auth';
	import { doc, getDoc, setDoc, serverTimestamp, collection } from 'firebase/firestore';

	let loading = true;
	let saving = false;
	let error = '';
	let success = '';

	// Form fields
	let title = '';
	let category = '';
	let description = '';
	let price = '';
	let location = '';
	let address = '';
	let phone = '';
	let website = '';
	let tags: string[] = [];
	let tagInput = '';
	let photos: string[] = [];
	let status: 'draft' | 'published' = 'draft';

	// Categories
	const categories = [
		{ value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
		{ value: 'hotel', label: 'Hotel', icon: '🏨' },
		{ value: 'tour_operator', label: 'Tour Operator', icon: '🗺️' },
		{ value: 'car_rental', label: 'Car Rental', icon: '🚗' },
		{ value: 'attraction', label: 'Attraction', icon: '🏛️' },
		{ value: 'activity', label: 'Activity', icon: '🎯' },
		{ value: 'heritage', label: 'Heritage Site', icon: '🏺' },
		{ value: 'transport', label: 'Transport', icon: '🚌' },
		{ value: 'other', label: 'Other', icon: '📍' }
	];

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
			loading = false;
		});

		return () => unsubscribe();
	});

	function addTag() {
		const tag = tagInput.trim().toLowerCase();
		if (tag && !tags.includes(tag)) {
			tags = [...tags, tag];
			tagInput = '';
		}
	}

	function removeTag(tag: string) {
		tags = tags.filter(t => t !== tag);
	}

	function handleTagKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addTag();
		}
	}

	async function saveListing(publish: boolean = false) {
		if (!title.trim()) {
			error = 'Please enter a title for your listing';
			return;
		}

		saving = true;
		error = '';
		success = '';

		try {
			const firebaseUser = auth?.currentUser;
			if (!firebaseUser) return;

			// Get business info
			const businessDoc = await getDoc(doc(db!, 'businesses', firebaseUser.uid));
			const businessData = businessDoc.exists() ? businessDoc.data() : {};

			const listingData = {
				title: title.trim(),
				category,
				description,
				price: price ? parseFloat(price) : null,
				location,
				address,
				phone,
				website,
				tags,
				photos,
				status: publish ? 'published' : status,
				businessId: firebaseUser.uid,
				businessName: businessData.businessName || '',
				ownerName: firebaseUser.displayName || '',
				ownerEmail: firebaseUser.email || '',
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
				views: 0,
				bookings: 0
			};

			// Create new listing
			const listingRef = doc(collection(db!, 'listings'));
			await setDoc(listingRef, listingData);

			success = 'Listing created successfully!';
			
			// Redirect after short delay
			setTimeout(() => {
				goto('/dashboard/business/listings');
			}, 1500);

		} catch (err: any) {
			console.error('Error creating listing:', err);
			error = err.message || 'Failed to create listing';
		} finally {
			saving = false;
		}
	}

	async function uploadPhoto() {
		// TODO: Implement Cloudinary upload widget
		alert('Photo upload will be implemented with Cloudinary');
	}
</script>

<svelte:head>
	<title>New Listing — VERYNICE.kz</title>
	<meta name="description" content="Create a new business listing" />
</svelte:head>

{#if loading}
	<div class="loading">
		<div class="spinner"></div>
	</div>
{:else}
	<div class="new-listing-page">
		<header class="page-header">
			<div class="header-content">
				<div>
					<a href="/dashboard/business/listings" class="back-link">← Back to Listings</a>
					<h1>Create New Listing</h1>
					<p>Add a new listing to showcase your business</p>
				</div>
			</div>
		</header>

		{#if error}
			<div class="alert alert-error">{error}</div>
		{/if}

		{#if success}
			<div class="alert alert-success">{success}</div>
		{/if}

		<form on:submit|preventDefault={() => saveListing(false)}>
			<!-- Basic Info -->
			<section class="form-section">
				<h2>Basic Information</h2>
				
				<div class="form-grid">
					<div class="form-group full-width">
						<label for="title">Listing Title *</label>
						<input 
							type="text" 
							id="title" 
							bind:value={title} 
							required 
							placeholder="e.g., Best Restaurant in Almaty"
						/>
					</div>

					<div class="form-group">
						<label for="category">Category *</label>
						<select id="category" bind:value={category} required>
							<option value="">Select category...</option>
							{#each categories as cat}
								<option value={cat.value}>{cat.icon} {cat.label}</option>
							{/each}
						</select>
					</div>

					<div class="form-group">
						<label for="price">Price (₸)</label>
						<input 
							type="number" 
							id="price" 
							bind:value={price} 
							placeholder="e.g., 5000"
							min="0"
						/>
					</div>
				</div>

				<div class="form-group">
					<label for="description">Description</label>
					<textarea 
						id="description" 
						bind:value={description} 
						rows="5"
						placeholder="Describe your listing in detail..."
					></textarea>
				</div>
			</section>

			<!-- Location -->
			<section class="form-section">
				<h2>Location</h2>
				
				<div class="form-grid">
					<div class="form-group">
						<label for="location">City / Region</label>
						<input 
							type="text" 
							id="location" 
							bind:value={location} 
							placeholder="e.g., Almaty"
						/>
					</div>

					<div class="form-group">
						<label for="address">Full Address</label>
						<input 
							type="text" 
							id="address" 
							bind:value={address} 
							placeholder="Street address"
						/>
					</div>
				</div>
			</section>

			<!-- Contact -->
			<section class="form-section">
				<h2>Contact Information</h2>
				
				<div class="form-grid">
					<div class="form-group">
						<label for="phone">Phone</label>
						<input 
							type="tel" 
							id="phone" 
							bind:value={phone} 
							placeholder="+7 (777) 123-4567"
						/>
					</div>

					<div class="form-group">
						<label for="website">Website</label>
						<input 
							type="url" 
							id="website" 
							bind:value={website} 
							placeholder="https://example.com"
						/>
					</div>
				</div>
			</section>

			<!-- Tags -->
			<section class="form-section">
				<h2>Tags</h2>
				
				<div class="form-group">
					<label for="tagInput">Add Tags</label>
					<div class="tag-input-wrapper">
						<input 
							type="text" 
							id="tagInput" 
							bind:value={tagInput} 
							on:keydown={handleTagKeydown}
							placeholder="Type and press Enter"
						/>
						<button type="button" class="add-tag-btn" on:click={addTag}>Add</button>
					</div>
					
					{#if tags.length > 0}
						<div class="tags-list">
							{#each tags as tag}
								<span class="tag">
									{tag}
									<button type="button" on:click={() => removeTag(tag)}>×</button>
								</span>
							{/each}
						</div>
					{/if}
				</div>
			</section>

			<!-- Photos -->
			<section class="form-section">
				<h2>Photos</h2>
				
				<div class="photos-grid">
					{#each photos as photo, i}
						<div class="photo-item">
							<img src={photo} alt="Listing photo" />
							<button type="button" class="remove-photo" on:click={() => photos = photos.filter((_, idx) => idx !== i)}>×</button>
						</div>
					{/each}
					
					<button type="button" class="add-photo-btn" on:click={uploadPhoto}>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
							<circle cx="8.5" cy="8.5" r="1.5"></circle>
							<polyline points="21 15 16 10 5 21"></polyline>
						</svg>
						<span>Add Photo</span>
					</button>
				</div>
			</section>

			<!-- Actions -->
			<div class="form-actions">
				<a href="/dashboard/business/listings" class="btn-secondary">Cancel</a>
				<button type="button" class="btn-secondary" on:click={() => saveListing(false)} disabled={saving}>
					{#if saving}
						<span class="spinner-small"></span>
					{/if}
					Save as Draft
				</button>
				<button type="button" class="btn-primary" on:click={() => saveListing(true)} disabled={saving}>
					{#if saving}
						<span class="spinner-small"></span>
					{/if}
					Publish Listing
				</button>
			</div>
		</form>
	</div>
{/if}

<style>
	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 400px;
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

	.new-listing-page {
		max-width: 800px;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.back-link {
		color: #6b7280;
		text-decoration: none;
		font-size: 0.9rem;
	}

	.back-link:hover {
		color: #0a1e3c;
	}

	.page-header h1 {
		font-size: 1.75rem;
		color: #0a1e3c;
		margin: 0.5rem 0;
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

	.alert-success {
		background: #dcfce7;
		color: #16a34a;
	}

	.form-section {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	}

.form-section h2 {
        font-size: 1.1rem;
        color: #1c1c1e !important;
        margin-bottom: 1.25rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #e5e7eb;
    }

	.form-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group.full-width {
		grid-column: span 2;
	}

	.form-group label {
		display: block;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.95rem;
		transition: border-color 0.2s;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #E8A44A;
	}

	.form-group textarea {
		resize: vertical;
	}

	/* Tags */
	.tag-input-wrapper {
		display: flex;
		gap: 0.5rem;
	}

	.tag-input-wrapper input {
		flex: 1;
	}

	.add-tag-btn {
		padding: 0 1rem;
		background: #f3f4f6;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		cursor: pointer;
	}

	.tags-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}

	.tag {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
		background: #e0e7ff;
		color: #3730a3;
		border-radius: 4px;
		font-size: 0.85rem;
	}

	.tag button {
		background: none;
		border: none;
		color: inherit;
		cursor: pointer;
		padding: 0;
		font-size: 1rem;
		line-height: 1;
	}

	/* Photos */
	.photos-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
	}

	.photo-item {
		position: relative;
		aspect-ratio: 1;
		border-radius: 8px;
		overflow: hidden;
	}

	.photo-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.remove-photo {
		position: absolute;
		top: 4px;
		right: 4px;
		width: 24px;
		height: 24px;
		background: rgba(0,0,0,0.6);
		color: white;
		border: none;
		border-radius: 50%;
		cursor: pointer;
	}

	.add-photo-btn {
		aspect-ratio: 1;
		border: 2px dashed #d1d5db;
		border-radius: 8px;
		background: #f9fafb;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		color: #9ca3af;
		cursor: pointer;
		transition: all 0.2s;
	}

	.add-photo-btn:hover {
		border-color: #E8A44A;
		color: #E8A44A;
	}

	.add-photo-btn span {
		font-size: 0.8rem;
	}

	/* Actions */
	.form-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		margin-top: 1.5rem;
	}

	.btn-primary, .btn-secondary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		text-decoration: none;
	}

	.btn-primary {
		background: #E8A44A;
		color: white;
		border: none;
	}

	.btn-primary:hover:not(:disabled) {
		background: #d69440;
	}

	.btn-secondary {
		background: white;
		color: #374151;
		border: 1px solid #d1d5db;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #f3f4f6;
	}

	.btn-primary:disabled, .btn-secondary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.spinner-small {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255,255,255,0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@media (max-width: 640px) {
		.form-grid {
			grid-template-columns: 1fr;
		}

		.form-group.full-width {
			grid-column: span 1;
		}

		.photos-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.form-actions {
			flex-direction: column;
		}
	}
</style>
