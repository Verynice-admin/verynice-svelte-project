<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth, db } from '$lib/firebase';
	import { onAuthStateChanged } from 'firebase/auth';
	import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

	let loading = true;
	let saving = false;
	let error = '';
	
	// Step tracking
	let currentStep = 1;
	const totalSteps = 3;

	// Business details
	let businessName = '';
	let businessType = '';
	let contactName = '';
	let email = '';
	let phone = '';
	let address = '';

	// Business types
	const businessTypes = [
		{ value: 'restaurant', label: 'Restaurant', icon: '🍽️', desc: 'Food & dining' },
		{ value: 'hotel', label: 'Hotel', icon: '🏨', desc: 'Accommodation' },
		{ value: 'tour_operator', label: 'Tour Operator', icon: '🗺️', desc: 'Tours & excursions' },
		{ value: 'car_rental', label: 'Car Rental', icon: '🚗', desc: 'Vehicle rentals' },
		{ value: 'attraction', label: 'Attraction', icon: '🏛️', desc: 'Places to visit' },
		{ value: 'activity', label: 'Activity', icon: '🎯', desc: 'Things to do' },
		{ value: 'heritage', label: 'Heritage Site', icon: '🏺', desc: 'Cultural sites' },
		{ value: 'transport', label: 'Transport', icon: '🚌', desc: 'Transportation' },
		{ value: 'other', label: 'Other', icon: '📍', desc: 'Other services' }
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

			// Pre-fill from Firebase
			contactName = firebaseUser.displayName || '';
			email = firebaseUser.email || '';
			
			// Redirect if onboarding already complete
			try {
				const businessDoc = await getDoc(doc(db!, 'businesses', firebaseUser.uid));
				if (businessDoc.exists() && businessDoc.data()?.onboardingComplete === true) {
					goto('/dashboard/business');
					return;
				}
			} catch (err) {
				console.error('Error checking business:', err);
			}

			loading = false;
		});

		return () => unsubscribe();
	});

	function nextStep() {
		if (currentStep < totalSteps) {
			currentStep++;
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
		}
	}

	async function completeOnboarding() {
		if (!businessName.trim() || !businessType) {
			error = 'Please fill in all required fields';
			return;
		}

		saving = true;
		error = '';

		try {
			const firebaseUser = auth?.currentUser;
			if (!firebaseUser) return;

			// Create business document
			await setDoc(doc(db!, 'businesses', firebaseUser.uid), {
				businessName: businessName.trim(),
				businessType,
				contactName: contactName.trim(),
				email: email || firebaseUser.email,
				phone: phone.trim(),
				address: address.trim(),
				onboardingComplete: true,
				verified: false, // Requires admin review
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp()
			}, { merge: true });

			// Update user document to mark business created
			await setDoc(doc(db!, 'users', firebaseUser.uid), {
				businessCreated: true,
				updatedAt: serverTimestamp()
			}, { merge: true });

			// Redirect to dashboard
			goto('/dashboard/business');
		} catch (err: any) {
			console.error('Error completing onboarding:', err);
			error = err.message || 'Failed to complete onboarding';
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>Business Setup — VERYNICE.kz</title>
</svelte:head>

{#if loading}
	<div class="loading-screen">
		<div class="spinner"></div>
	</div>
{:else}
	<div class="onboarding-page">
		<div class="onboarding-header">
			<h1>Welcome to VERYNICE.kz Business</h1>
			<p>Let's set up your business profile</p>
			
			<!-- Progress Steps -->
			<div class="steps-indicator">
				{#each [1, 2, 3] as step}
					<div class="step" class:active={currentStep >= step} class:current={currentStep === step}>
						<span class="step-number">{step}</span>
						<span class="step-label">
							{#if step === 1}Business Type{:else if step === 2}Details{:else}Complete{/if}
						</span>
					</div>
					{#if step < totalSteps}
						<div class="step-line" class:active={currentStep > step}></div>
					{/if}
				{/each}
			</div>
		</div>

		{#if error}
			<div class="alert alert-error">{error}</div>
		{/if}

		<div class="step-content">
			<!-- Step 1: Business Type -->
			{#if currentStep === 1}
				<div class="step-panel">
					<h2>What type of business do you have?</h2>
					<p class="step-description">Select the category that best describes your business</p>
					
					<div class="type-grid">
						{#each businessTypes as type}
							<button 
								class="type-card"
								class:selected={businessType === type.value}
								on:click={() => businessType = type.value}
							>
								<span class="type-icon">{type.icon}</span>
								<span class="type-label">{type.label}</span>
								<span class="type-desc">{type.desc}</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Step 2: Business Details -->
			{#if currentStep === 2}
				<div class="step-panel">
					<h2>Tell us about your business</h2>
					<p class="step-description">Add your business details</p>
					
					<div class="form-fields">
						<div class="form-group">
							<label for="businessName">Business Name *</label>
							<input 
								type="text" 
								id="businessName" 
								bind:value={businessName} 
								placeholder="Enter your business name"
								required
							/>
						</div>

						<div class="form-group">
							<label for="contactName">Contact Name</label>
							<input 
								type="text" 
								id="contactName" 
								bind:value={contactName} 
								placeholder="Your name"
							/>
						</div>

						<div class="form-group">
							<label for="email">Email</label>
							<input 
								type="email" 
								id="email" 
								bind:value={email} 
								placeholder="your@email.com"
								disabled
							/>
						</div>

						<div class="form-group">
							<label for="phone">Phone Number</label>
							<input 
								type="tel" 
								id="phone" 
								bind:value={phone} 
								placeholder="+7 (777) 123-4567"
							/>
						</div>

						<div class="form-group full-width">
							<label for="address">Address</label>
							<input 
								type="text" 
								id="address" 
								bind:value={address} 
								placeholder="Your business address"
							/>
						</div>
					</div>
				</div>
			{/if}

			<!-- Step 3: Complete -->
			{#if currentStep === 3}
				<div class="step-panel">
					<div class="success-icon">
						<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
					</div>
					<h2>You're all set!</h2>
					<p class="step-description">Review your information and complete setup</p>

					<div class="summary-card">
						<div class="summary-row">
							<span class="label">Business Name:</span>
							<span class="value">{businessName}</span>
						</div>
						<div class="summary-row">
							<span class="label">Business Type:</span>
							<span class="value capitalize">{businessType.replace('_', ' ')}</span>
						</div>
						<div class="summary-row">
							<span class="label">Email:</span>
							<span class="value">{email}</span>
						</div>
						{#if phone}
							<div class="summary-row">
								<span class="label">Phone:</span>
								<span class="value">{phone}</span>
							</div>
						{/if}
					</div>

					<p class="info-note">
						After completing setup, your business will be reviewed for verification. 
						Once verified, you'll receive a verification badge on your listings.
					</p>
				</div>
			{/if}
		</div>

		<!-- Navigation -->
		<div class="step-navigation">
			{#if currentStep > 1}
				<button class="btn-back" on:click={prevStep}>Back</button>
			{:else}
				<div></div>
			{/if}

			{#if currentStep < totalSteps}
				<button 
					class="btn-next" 
					on:click={nextStep}
					disabled={currentStep === 1 && !businessType}
				>
					Continue
				</button>
			{:else}
				<button class="btn-complete" on:click={completeOnboarding} disabled={saving}>
					{#if saving}
						<span class="spinner-small"></span>
						Setting up...
					{:else}
						Complete Setup
					{/if}
				</button>
			{/if}
		</div>
	</div>
{/if}

<style>
	.loading-screen {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #0a1e3c;
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

	.onboarding-page {
		max-width: 700px;
		margin: 0 auto;
		padding: 2rem;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.onboarding-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.onboarding-header h1 {
		font-size: 1.75rem;
		color: #0a1e3c;
		margin-bottom: 0.5rem;
	}

	.onboarding-header p {
		color: #666;
		margin-bottom: 2rem;
	}

	/* Steps */
	.steps-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0;
	}

	.step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.step-number {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: #e5e7eb;
		color: #6b7280;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		transition: all 0.3s;
	}

	.step.active .step-number {
		background: #E8A44A;
		color: white;
	}

	.step.current .step-number {
		background: #0a1e3c;
		color: white;
	}

	.step-label {
		font-size: 0.8rem;
		color: #6b7280;
	}

	.step.active .step-label {
		color: #0a1e3c;
		font-weight: 500;
	}

	.step-line {
		width: 60px;
		height: 2px;
		background: #e5e7eb;
		margin: 0 0.5rem;
		margin-bottom: 1.5rem;
	}

	.step-line.active {
		background: #E8A44A;
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

	.step-content {
		flex: 1;
	}

	.step-panel {
		background: white;
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	}

	.step-panel h2 {
		font-size: 1.5rem;
		color: #0a1e3c;
		margin-bottom: 0.5rem;
		text-align: center;
	}

	.step-description {
		color: #666;
		text-align: center;
		margin-bottom: 2rem;
	}

	/* Business Type Grid */
	.type-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	.type-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1.25rem;
		border: 2px solid #e5e7eb;
		border-radius: 12px;
		background: white;
		cursor: pointer;
		transition: all 0.2s;
	}

	.type-card:hover {
		border-color: #E8A44A;
	}

	.type-card.selected {
		border-color: #E8A44A;
		background: #fffbf0;
	}

	.type-icon {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}

	.type-label {
		font-weight: 600;
		color: #0a1e3c;
		margin-bottom: 0.25rem;
	}

	.type-desc {
		font-size: 0.8rem;
		color: #6b7280;
	}

	/* Form Fields */
	.form-fields {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.form-group {
		margin-bottom: 0;
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

	.form-group input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.95rem;
	}

	.form-group input:focus {
		outline: none;
		border-color: #E8A44A;
	}

	.form-group input:disabled {
		background: #f3f4f6;
		color: #9ca3af;
	}

	/* Success */
	.success-icon {
		text-align: center;
		color: #16a34a;
		margin-bottom: 1rem;
	}

	.summary-card {
		background: #f9fafb;
		border-radius: 12px;
		padding: 1.5rem;
		margin: 1.5rem 0;
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
		border-bottom: 1px solid #e5e7eb;
	}

	.summary-row:last-child {
		border-bottom: none;
	}

	.summary-row .label {
		color: #6b7280;
	}

	.summary-row .value {
		font-weight: 500;
		color: #0a1e3c;
	}

	.capitalize {
		text-transform: capitalize;
	}

	.info-note {
		font-size: 0.85rem;
		color: #6b7280;
		text-align: center;
		line-height: 1.5;
	}

	/* Navigation */
	.step-navigation {
		display: flex;
		justify-content: space-between;
		margin-top: 2rem;
	}

	.btn-back, .btn-next, .btn-complete {
		padding: 0.875rem 2rem;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 1rem;
	}

	.btn-back {
		background: white;
		border: 1px solid #d1d5db;
		color: #374151;
	}

	.btn-back:hover {
		background: #f3f4f6;
	}

	.btn-next, .btn-complete {
		background: #E8A44A;
		border: none;
		color: white;
	}

	.btn-next:hover:not(:disabled), .btn-complete:hover:not(:disabled) {
		background: #d69440;
	}

	.btn-next:disabled, .btn-complete:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-complete {
		display: flex;
		align-items: center;
		gap: 0.5rem;
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
		.type-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.form-fields {
			grid-template-columns: 1fr;
		}

		.form-group.full-width {
			grid-column: span 1;
		}

		.step-line {
			width: 30px;
		}
	}
</style>
