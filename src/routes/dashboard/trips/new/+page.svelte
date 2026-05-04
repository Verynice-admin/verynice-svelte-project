<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { auth, db } from '$lib/firebase';
	import { onAuthStateChanged } from 'firebase/auth';
	import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

	let currentUser: any = null;
	let loading = true;
	let saving = false;
	let error = '';

	// Form data
	let tripName = '';
	let destination = '';
	let startDate = '';
	let endDate = '';
	let notes = '';

	// Popular destinations in Kazakhstan
	const destinations = [
		'Almaty',
		'Astana (Nur-Sultan)',
		'Shymkent',
		'Turkistan',
		'Baikonur',
		'Kolsai Lakes',
		'Charyn Canyon',
		'Kaindy Lake',
		'Medeu',
		'Shymbulak',
		'Big Almaty Lake',
		'Issyk Lake',
		'Burabay',
		'Aktau',
		'Karaganda'
	];

	onMount(() => {
		if (!browser || !auth) {
			goto('/get-started');
			return;
		}

		const unsubscribe = onAuthStateChanged(auth, (user) => {
			currentUser = user;
			if (!user) {
				goto('/get-started');
			}
			loading = false;
		});

		return () => unsubscribe();
	});

	async function handleSubmit() {
		if (!currentUser || !db) return;
		
		if (!tripName || !destination || !startDate || !endDate) {
			error = 'Please fill in all required fields';
			return;
		}

		saving = true;
		error = '';

		try {
			await addDoc(collection(db, 'users', currentUser.uid, 'trips'), {
				name: tripName,
				destination: destination,
				startDate: new Date(startDate),
				endDate: new Date(endDate),
				notes: notes,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp()
			});
			
			goto('/dashboard/trips');
		} catch (err: any) {
			console.error('Error creating trip:', err);
			error = err.message || 'Failed to create trip';
		}

		saving = false;
	}
</script>

<svelte:head>
	<title>Plan New Trip — VERYNICE.kz</title>
	<meta name="description" content="Plan a new trip in Kazakhstan" />
</svelte:head>

<div class="new-trip-page">
	<header class="page-header">
		<div class="header-content">
			<a href="/dashboard/trips" class="back-link">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M19 12H5M12 19l-7-7 7-7"/>
				</svg>
				Back to Trips
			</a>
			<h1>Plan New Trip</h1>
		</div>
	</header>

	<main class="page-content">
		{#if loading}
			<div class="loading-state">
				<div class="spinner"></div>
				<p>Loading...</p>
			</div>
		{:else}
			<form on:submit|preventDefault={handleSubmit} class="trip-form">
				{#if error}
					<div class="error-message">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="12" cy="12" r="10"></circle>
							<line x1="12" y1="8" x2="12" y2="12"></line>
							<line x1="12" y1="16" x2="12.01" y2="16"></line>
						</svg>
						{error}
					</div>
				{/if}

				<div class="form-group">
					<label for="tripName">Trip Name *</label>
					<input 
						type="text" 
						id="tripName" 
						bind:value={tripName}
						placeholder="e.g., Summer in Almaty"
						required
					/>
				</div>

				<div class="form-group">
					<label for="destination">Destination *</label>
					<select id="destination" bind:value={destination} required>
						<option value="">Select a destination</option>
						{#each destinations as dest}
							<option value={dest}>{dest}</option>
						{/each}
					</select>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="startDate">Start Date *</label>
						<input 
							type="date" 
							id="startDate" 
							bind:value={startDate}
							required
						/>
					</div>

					<div class="form-group">
						<label for="endDate">End Date *</label>
						<input 
							type="date" 
							id="endDate" 
							bind:value={endDate}
							required
						/>
					</div>
				</div>

				<div class="form-group">
					<label for="notes">Notes</label>
					<textarea 
						id="notes" 
						bind:value={notes}
						placeholder="Add any notes about your trip..."
						rows="4"
					></textarea>
				</div>

				<div class="form-actions">
					<a href="/dashboard/trips" class="btn-secondary">Cancel</a>
					<button type="submit" class="btn-primary" disabled={saving}>
						{#if saving}
							<span class="spinner-small"></span>
							Saving...
						{:else}
							Create Trip
						{/if}
					</button>
				</div>
			</form>
		{/if}
	</main>
</div>

<style>
	.new-trip-page {
		min-height: 100vh;
		background: #f8f9fa;
	}

	.page-header {
		background: #0a1e3c;
		padding: 1.5rem 0;
	}

	.header-content {
		max-width: 800px;
		margin: 0 auto;
		padding: 0 2rem;
		display: flex;
		align-items: center;
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

	.page-content {
		max-width: 800px;
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

	.trip-form {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.08);
	}

	.error-message {
		background: #fff5f5;
		color: #e53e3e;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #2d3436;
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #e9ecef;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #00b894;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		margin-top: 2rem;
	}

	.btn-primary {
		background: #00b894;
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 500;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: background 0.2s;
		border: none;
		cursor: pointer;
	}

	.btn-primary:hover:not(:disabled) {
		background: #00a085;
	}

	.btn-primary:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: #f8f9fa;
		color: #6c757d;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 500;
		transition: background 0.2s;
	}

	.btn-secondary:hover {
		background: #e9ecef;
	}

	.spinner-small {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255,255,255,0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@media (max-width: 600px) {
		.form-row {
			grid-template-columns: 1fr;
		}
	}
</style>