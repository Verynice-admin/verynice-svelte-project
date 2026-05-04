<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth, db } from '$lib/firebase';
	import { onAuthStateChanged } from 'firebase/auth';
	import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

	let loading = true;
	let saving = false;
	let error = '';
	let success = '';
	
	// Business profile fields
	let businessName = '';
	let businessType = '';
	let description = '';
	let address = '';
	let phone = '';
	let website = '';
	let facebook = '';
	let instagram = '';
	let telegram = '';
	let logoUrl = '';
	let coverPhoto = '';
	
	// Opening hours
	let hours = {
		monday: { open: '09:00', close: '18:00', closed: false },
		tuesday: { open: '09:00', close: '18:00', closed: false },
		wednesday: { open: '09:00', close: '18:00', closed: false },
		thursday: { open: '09:00', close: '18:00', closed: false },
		friday: { open: '09:00', close: '18:00', closed: false },
		saturday: { open: '10:00', close: '16:00', closed: false },
		sunday: { open: '', close: '', closed: true }
	};

	// Business types
	const businessTypes = [
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

			// Load business profile
			try {
				const businessDocRef = doc(db!, 'businesses', firebaseUser.uid);
				const businessDoc = await getDoc(businessDocRef);
				
				if (businessDoc.exists()) {
					const data = businessDoc.data();
					businessName = data.businessName || '';
					businessType = data.businessType || '';
					description = data.description || '';
					address = data.address || '';
					phone = data.phone || '';
					website = data.website || '';
					facebook = data.facebook || '';
					instagram = data.instagram || '';
					telegram = data.telegram || '';
					logoUrl = data.logoUrl || '';
					coverPhoto = data.coverPhoto || '';
					
					if (data.hours) {
						hours = { ...hours, ...data.hours };
					}
				}
			} catch (err) {
				console.error('Error loading business profile:', err);
			}

			loading = false;
		});

		return () => unsubscribe();
	});

	async function saveProfile() {
		saving = true;
		error = '';
		success = '';

		try {
			const firebaseUser = auth?.currentUser;
			if (!firebaseUser) return;

			const businessDocRef = doc(db!, 'businesses', firebaseUser.uid);
			
			await updateDoc(businessDocRef, {
				businessName,
				businessType,
				description,
				address,
				phone,
				website,
				facebook,
				instagram,
				telegram,
				logoUrl,
				coverPhoto,
				hours,
				updatedAt: serverTimestamp()
			});

			success = 'Profile saved successfully!';
		} catch (err: any) {
			console.error('Error saving profile:', err);
			error = err.message || 'Failed to save profile';
		} finally {
			saving = false;
		}
	}

	function handleLogoUpload() {
		// TODO: Implement Cloudinary upload widget
		alert('Logo upload will be implemented with Cloudinary');
	}

	function handleCoverUpload() {
		// TODO: Implement Cloudinary upload widget
		alert('Cover photo upload will be implemented with Cloudinary');
	}
</script>

<svelte:head>
	<title>Business Profile — VERYNICE.kz</title>
	<meta name="description" content="Manage your business profile" />
</svelte:head>

{#if loading}
	<div class="loading">
		<div class="spinner"></div>
	</div>
{:else}
	<div class="profile-page">
		<header class="page-header">
			<h1>Business Profile</h1>
			<p>Manage your business information and details</p>
		</header>

		{#if error}
			<div class="alert alert-error">{error}</div>
		{/if}

		{#if success}
			<div class="alert alert-success">{success}</div>
		{/if}

		<form on:submit|preventDefault={saveProfile}>
			<!-- Cover Photo & Logo -->
			<section class="profile-banner">
				<div class="cover-photo" style={coverPhoto ? `background-image: url(${coverPhoto})` : ''}>
					<button type="button" class="upload-cover-btn" on:click={handleCoverUpload}>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
							<circle cx="8.5" cy="8.5" r="1.5"></circle>
							<polyline points="21 15 16 10 5 21"></polyline>
						</svg>
						Upload Cover
					</button>
				</div>
				
				<div class="logo-section">
					<div class="logo-preview">
						{#if logoUrl}
							<img src={logoUrl} alt={businessName} />
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
								<circle cx="12" cy="7" r="4"></circle>
							</svg>
						{/if}
					</div>
					<button type="button" class="upload-logo-btn" on:click={handleLogoUpload}>
						Upload Logo
					</button>
				</div>
			</section>

			<!-- Basic Info -->
			<section class="form-section">
				<h2>Basic Information</h2>
				
				<div class="form-grid">
					<div class="form-group">
						<label for="businessName">Business Name *</label>
						<input 
							type="text" 
							id="businessName" 
							bind:value={businessName} 
							required 
							placeholder="Enter your business name"
						/>
					</div>

					<div class="form-group">
						<label for="businessType">Business Type *</label>
						<select id="businessType" bind:value={businessType} required>
							<option value="">Select type...</option>
							{#each businessTypes as type}
								<option value={type.value}>{type.icon} {type.label}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="form-group">
					<label for="description">Description</label>
					<textarea 
						id="description" 
						bind:value={description} 
						rows="4"
						placeholder="Describe your business..."
					></textarea>
				</div>
			</section>

			<!-- Contact Info -->
			<section class="form-section">
				<h2>Contact Information</h2>
				
				<div class="form-grid">
					<div class="form-group">
						<label for="address">Address</label>
						<input 
							type="text" 
							id="address" 
							bind:value={address} 
							placeholder="Business address"
						/>
					</div>

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

			<!-- Social Links -->
			<section class="form-section">
				<h2>Social Media</h2>
				
				<div class="form-grid">
					<div class="form-group">
						<label for="facebook">Facebook</label>
						<input 
							type="url" 
							id="facebook" 
							bind:value={facebook} 
							placeholder="https://facebook.com/..."
						/>
					</div>

					<div class="form-group">
						<label for="instagram">Instagram</label>
						<input 
							type="url" 
							id="instagram" 
							bind:value={instagram} 
							placeholder="https://instagram.com/..."
						/>
					</div>

					<div class="form-group">
						<label for="telegram">Telegram</label>
						<input 
							type="text" 
							id="telegram" 
							bind:value={telegram} 
							placeholder="@username"
						/>
					</div>
				</div>
			</section>

			<!-- Opening Hours -->
			<section class="form-section">
				<h2>Opening Hours</h2>
				
				<div class="hours-grid">
					{#each Object.entries(hours) as [day, dayHours]}
						<div class="hours-row">
							<label class="day-label">
								<input 
									type="checkbox" 
									bind:checked={dayHours.closed}
								/>
								<span class="day-name">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
							</label>
							
							{#if !dayHours.closed}
								<div class="hours-inputs">
									<input 
										type="time" 
										bind:value={dayHours.open}
									/>
									<span>to</span>
									<input 
										type="time" 
										bind:value={dayHours.close}
									/>
								</div>
							{:else}
								<span class="closed-label">Closed</span>
							{/if}
						</div>
					{/each}
				</div>
			</section>

			<!-- Submit -->
			<div class="form-actions">
				<button type="submit" class="btn-primary" disabled={saving}>
					{#if saving}
						<span class="spinner-small"></span>
						Saving...
					{:else}
						Save Changes
					{/if}
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

	.profile-page {
		max-width: 800px;
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
		color: #0a1e3c;
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

	/* Profile Banner */
	.profile-banner {
		position: relative;
		margin-bottom: 3rem;
	}

	.cover-photo {
		height: 200px;
		background: linear-gradient(135deg, #0a1e3c, #1e3a5f);
		background-size: cover;
		background-position: center;
		border-radius: 12px;
		display: flex;
		align-items: flex-end;
		justify-content: flex-end;
		padding: 1rem;
	}

	.upload-cover-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: rgba(0,0,0,0.6);
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.85rem;
	}

	.upload-cover-btn:hover {
		background: rgba(0,0,0,0.8);
	}

	.logo-section {
		position: absolute;
		bottom: -40px;
		left: 1.5rem;
	}

	.logo-preview {
		width: 100px;
		height: 100px;
		border-radius: 12px;
		background: white;
		border: 3px solid white;
		box-shadow: 0 2px 8px rgba(0,0,0,0.15);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		color: #9ca3af;
	}

	.logo-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.upload-logo-btn {
		display: block;
		margin-top: 0.5rem;
		background: none;
		border: none;
		color: #6b7280;
		font-size: 0.8rem;
		cursor: pointer;
		text-decoration: underline;
	}

	/* Hours */
	.hours-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.hours-row {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.day-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 140px;
	}

	.day-name {
		font-weight: 500;
	}

	.hours-inputs {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.hours-inputs input {
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
	}

	.closed-label {
		color: #9ca3af;
		font-style: italic;
	}

	.form-actions {
		margin-top: 1.5rem;
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: #E8A44A;
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-primary:hover:not(:disabled) {
		background: #d69440;
	}

	.btn-primary:disabled {
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

		.logo-section {
			bottom: -30px;
		}

		.logo-preview {
			width: 80px;
			height: 80px;
		}
	}
</style>
