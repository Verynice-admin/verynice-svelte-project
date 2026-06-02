<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth, db } from '$lib/firebase';
	import { onAuthStateChanged } from 'firebase/auth';
	import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
	import { updatePassword, deleteUser, reauthenticateWithPopup, GoogleAuthProvider } from 'firebase/auth';

	let loading = true;
	let saving = false;
	let error = '';
	let success = '';

	// Tabs
	let activeTab: 'account' | 'notifications' | 'billing' | 'danger' = 'account';

	// Account
	let currentPassword = '';
	let newPassword = '';
	let confirmPassword = '';

	// Notifications
	let emailNewBooking = true;
	let emailNewReview = true;
	let emailWeeklyDigest = false;

	onMount(() => {
		if (!auth) { goto('/get-started'); return; }

		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (!firebaseUser) { goto('/get-started'); return; }
			await loadSettings(firebaseUser.uid);
			loading = false;
		});
		return () => unsubscribe();
	});

	async function loadSettings(uid: string) {
		try {
			const prefsDoc = await getDoc(doc(db!, 'users', uid));
			if (prefsDoc.exists()) {
				const data = prefsDoc.data();
				emailNewBooking = data.emailNewBooking ?? true;
				emailNewReview = data.emailNewReview ?? true;
				emailWeeklyDigest = data.emailWeeklyDigest ?? false;
			}
		} catch (err) { console.error('Error:', err); }
	}

	async function changePassword() {
		if (newPassword !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}
		if (newPassword.length < 6) {
			error = 'Password must be at least 6 characters';
			return;
		}
		saving = true; error = '';
		try {
			const user = auth?.currentUser;
			if (!user) return;
			// Re-authenticate first (required by Firebase)
			await reauthenticateWithPopup(user, new GoogleAuthProvider());
			await updatePassword(user, newPassword);
			success = 'Password changed successfully';
			currentPassword = ''; newPassword = ''; confirmPassword = '';
		} catch (err: any) {
			error = err.message || 'Failed to change password';
		}
		saving = false;
	}

	async function saveNotifications() {
		saving = true; error = '';
		try {
			const user = auth?.currentUser;
			if (!user) return;
			await updateDoc(doc(db!, 'users', user.uid), {
				emailNewBooking,
				emailNewReview,
				emailWeeklyDigest,
				updatedAt: serverTimestamp()
			});
			success = 'Notification preferences saved';
		} catch (err: any) {
			error = err.message || 'Failed to save';
		}
		saving = false;
	}

	async function deleteAccount() {
		if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
		if (!confirm('This will permanently delete all your data including listings and bookings. Continue?')) return;
		
		saving = true;
		try {
			const user = auth?.currentUser;
			if (!user) return;
			
			// Delete business data from Firestore
			await deleteDoc(doc(db!, 'businesses', user.uid));
			
			// Delete Firebase user
			await deleteUser(user);
			goto('/');
		} catch (err: any) {
			error = err.message || 'Failed to delete account';
		}
		saving = false;
	}
</script>

<svelte:head>
	<title>Settings — VERYNICE.kz</title>
</svelte:head>

<div class="settings-page">
	<header class="page-header"><h1>Settings</h1><p>Manage your account and preferences</p></header>

	{#if error}
		<div class="alert alert-error">{error}</div>
	{/if}
	{#if success}
		<div class="alert alert-success">{success}</div>
	{/if}

	{#if loading}
		<div class="loading"><div class="spinner"></div></div>
	{:else}
		<div class="settings-container">
			<!-- Tabs -->
			<nav class="settings-tabs">
				<button class:active={activeTab === 'account'} on:click={() => activeTab = 'account'}>Account</button>
				<button class:active={activeTab === 'notifications'} on:click={() => activeTab = 'notifications'}>Notifications</button>
				<button class:active={activeTab === 'billing'} on:click={() => activeTab = 'billing'}>Billing</button>
				<button class:active={activeTab === 'danger'} on:click={() => activeTab = 'danger'}>Danger Zone</button>
			</nav>

			<!-- Account Tab -->
			{#if activeTab === 'account'}
				<section class="settings-section">
					<h2>Change Password</h2>
					<p class="section-desc">Update your password</p>
					
					<div class="form-fields">
						<div class="form-group">
							<label>Current Password</label>
							<input type="password" bind:value={currentPassword} />
						</div>
						<div class="form-group">
							<label>New Password</label>
							<input type="password" bind:value={newPassword} />
						</div>
						<div class="form-group">
							<label>Confirm New Password</label>
							<input type="password" bind:value={confirmPassword} />
						</div>
					</div>
					<button class="btn-primary" on:click={changePassword} disabled={saving}>
						{saving ? 'Saving...' : 'Change Password'}
					</button>
				</section>

				<section class="settings-section">
					<h2>Two-Factor Authentication</h2>
					<p class="section-desc">Add extra security to your account</p>
					<p class="info-box">2FA setup requires Firebase Auth configuration. Contact support to enable.</p>
				</section>
			{/if}

			<!-- Notifications Tab -->
			{#if activeTab === 'notifications'}
				<section class="settings-section">
					<h2>Email Notifications</h2>
					<p class="section-desc">Choose what emails you receive</p>
					
					<div class="toggle-list">
						<label class="toggle-item">
							<input type="checkbox" bind:checked={emailNewBooking} />
							<span class="toggle-label">
								<strong>New Booking</strong>
								<span>Get notified when someone books your service</span>
							</span>
						</label>
						<label class="toggle-item">
							<input type="checkbox" bind:checked={emailNewReview} />
							<span class="toggle-label">
								<strong>New Review</strong>
								<span>Get notified when someone leaves a review</span>
							</span>
						</label>
						<label class="toggle-item">
							<input type="checkbox" bind:checked={emailWeeklyDigest} />
							<span class="toggle-label">
								<strong>Weekly Digest</strong>
								<span>Receive a weekly summary of your activity</span>
							</span>
						</label>
					</div>
					<button class="btn-primary" on:click={saveNotifications} disabled={saving}>
						{saving ? 'Saving...' : 'Save Preferences'}
					</button>
				</section>
			{/if}

			<!-- Billing Tab -->
			{#if activeTab === 'billing'}
				<section class="settings-section">
					<h2>Current Plan</h2>
					<div class="plan-card">
						<div class="plan-info">
							<span class="plan-name">Free Plan</span>
							<span class="plan-price">₸0/month</span>
						</div>
						<button class="btn-upgrade">Upgrade to Pro</button>
					</div>
				</section>
			{/if}

			<!-- Danger Zone -->
			{#if activeTab === 'danger'}
				<section class="settings-section danger">
					<h2>Delete Account</h2>
					<p class="section-desc">Permanently delete your account and all associated data</p>
					<div class="danger-actions">
						<button class="btn-danger" on:click={deleteAccount} disabled={saving}>
							{saving ? 'Deleting...' : 'Delete My Account'}
						</button>
					</div>
				</section>
			{/if}
		</div>
	{/if}
</div>

<style>
	.settings-page { max-width: 700px; }
	.page-header { margin-bottom: 2rem; }
	.page-header h1 { font-size: 1.75rem; color: #0a1e3c; margin-bottom: 0.5rem; }
	.page-header p { color: #666; }
	.alert { padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; }
	.alert-error { background: #fee2e2; color: #dc2626; }
	.alert-success { background: #dcfce7; color: #16a34a; }
	.loading { display: flex; justify-content: center; padding: 4rem; }
	.spinner { width: 40px; height: 40px; border: 3px solid #f0f0f0; border-top-color: #0a1e3c; border-radius: 50%; animation: spin 0.8s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }

	.settings-container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
	.settings-tabs { display: flex; border-bottom: 1px solid #e5e7eb; }
	.settings-tabs button { flex: 1; padding: 1rem; background: none; border: none; font-size: 0.9rem; font-weight: 500; color: #6b7280; cursor: pointer; transition: all 0.2s; }
	.settings-tabs button:hover { background: #f9fafb; }
	.settings-tabs button.active { color: #E8A44A; border-bottom: 2px solid #E8A44A; }

	.settings-section { padding: 1.5rem; border-bottom: 1px solid #e5e7eb; }
	.settings-section:last-child { border-bottom: none; }
	.settings-section h2 { font-size: 1.1rem; color: #0a1e3c; margin-bottom: 0.25rem; }
	.section-desc { color: #6b7280; font-size: 0.9rem; margin-bottom: 1rem; }
	
	.form-fields { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1rem; max-width: 300px; }
	.form-group label { display: block; font-size: 0.85rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
	.form-group input { width: 100%; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 6px; }
	
	.btn-primary { padding: 0.6rem 1.25rem; background: #E8A44A; color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; }
	.btn-primary:hover:not(:disabled) { background: #d69440; }
	.btn-primary:disabled { opacity: 0.6; }
	
	.toggle-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
	.toggle-item { display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; padding: 0.75rem; background: #f9fafb; border-radius: 8px; }
	.toggle-item input { margin-top: 0.25rem; }
	.toggle-label { display: flex; flex-direction: column; }
	.toggle-label strong { color: #0a1e3c; font-size: 0.95rem; }
	.toggle-label span { color: #6b7280; font-size: 0.85rem; }
	
	.info-box { padding: 0.75rem; background: #fef3c7; border-radius: 6px; font-size: 0.9rem; color: #92400e; margin-bottom: 1rem; }
	
	.plan-card { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f9fafb; border-radius: 8px; }
	.plan-name { font-weight: 600; color: #0a1e3c; }
	.plan-price { color: #6b7280; font-size: 0.9rem; }
	.btn-upgrade { padding: 0.5rem 1rem; background: #16a34a; color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; }
	
	.danger h2 { color: #dc2626; }
	.danger .section-desc { color: #6b7280; }
	.btn-danger { padding: 0.75rem 1.5rem; background: #dc2626; color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; }
	.btn-danger:hover:not(:disabled) { background: #b91c1c; }
	.btn-danger:disabled { opacity: 0.6; }
</style>
