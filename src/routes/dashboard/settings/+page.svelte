<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { auth, db } from '$lib/firebase';
	import { signOut, onAuthStateChanged, updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
	import { doc, getDoc, deleteDoc, collection, getDocs, writeBatch, updateDoc } from 'firebase/firestore';

	let currentUser: any = null;
	let loading = true;
	let activeTab = 'profile';
	
	// Form fields
	let newPassword = '';
	let confirmPassword = '';
	let passwordError = '';
	let passwordSuccess = '';
	
	// Notification preferences
	let emailNotifications = true;
	let tripReminders = true;
	let marketingEmails = false;
	
	// GDPR deletion
	let showDeleteConfirm = false;
	let deleteConfirmationText = '';
	let deleting = false;
	
	// 2FA
	let show2FASetup = false;
	let verificationCode = '';
	
	onMount(async () => {
		if (!browser || !auth) {
			goto('/get-started');
			return;
		}

		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (!user) {
				goto('/get-started');
				return;
			}
			currentUser = user;
			
			// Load notification preferences from Firestore
			try {
				const prefsDoc = await getDoc(doc(db!, 'users', user.uid));
				if (prefsDoc.exists()) {
					const data = prefsDoc.data();
					emailNotifications = data.preferences?.emailNotifications ?? true;
					tripReminders = data.preferences?.tripReminders ?? true;
					marketingEmails = data.preferences?.marketingEmails ?? false;
				}
			} catch (err) {
				console.error('Error loading preferences:', err);
			}
			
			loading = false;
		});

		return () => unsubscribe();
	});

	async function handlePasswordChange() {
		passwordError = '';
		passwordSuccess = '';
		
		if (!newPassword || !confirmPassword) {
			passwordError = 'Please fill in all fields';
			return;
		}
		
		if (newPassword.length < 6) {
			passwordError = 'Password must be at least 6 characters';
			return;
		}
		
		if (newPassword !== confirmPassword) {
			passwordError = 'Passwords do not match';
			return;
		}
		
		try {
			if (currentUser) {
				await updatePassword(currentUser, newPassword);
				passwordSuccess = 'Password updated successfully';
				newPassword = '';
				confirmPassword = '';
			}
		} catch (error: any) {
			console.error('Password update error:', error);
			if (error.code === 'auth/requires-recent-login') {
				passwordError = 'Please sign out and sign in again to change your password';
			} else {
				passwordError = error.message || 'Failed to update password';
			}
		}
	}

	async function saveNotificationPreferences() {
		if (!currentUser || !db) return;
		
		try {
			await updateDoc(doc(db, 'users', currentUser.uid), {
				preferences: {
					emailNotifications,
					tripReminders,
					marketingEmails
				}
			});
			alert('Preferences saved!');
		} catch (error) {
			console.error('Error saving preferences:', error);
			alert('Failed to save preferences');
		}
	}

	async function handleDeleteAccount() {
		if (deleteConfirmationText !== 'DELETE') {
			alert('Please type DELETE to confirm');
			return;
		}
		
		if (!currentUser || !db) return;
		
		deleting = true;
		
		try {
			// 1. Delete all user subcollections
			const collectionsToDelete = ['savedDestinations', 'trips', 'notifications', 'activity'];
			
			for (const collName of collectionsToDelete) {
				const collRef = collection(db, 'users', currentUser.uid, collName);
				const snapshot = await getDocs(collRef);
				
				const batch = writeBatch(db);
				snapshot.forEach((doc) => {
					batch.delete(doc.ref);
				});
				await batch.commit();
			}
			
			// 2. Delete user document
			await deleteDoc(doc(db, 'users', currentUser.uid));
			
			// 3. Delete auth user
			await deleteUser(currentUser);
			
			alert('Account deleted successfully');
			goto('/');
		} catch (error: any) {
			console.error('Delete account error:', error);
			if (error.code === 'auth/requires-recent-login') {
				alert('Please sign out and sign in again to delete your account');
			} else {
				alert('Failed to delete account: ' + error.message);
			}
		} finally {
			deleting = false;
			showDeleteConfirm = false;
		}
	}

	async function setup2FA() {
		// Note: Firebase 2FA requires additional setup in Firebase console
		// This is a placeholder for the multi-factor enrollment flow
		alert('Two-factor authentication setup requires additional Firebase configuration. Please contact support.');
		show2FASetup = false;
	}

	async function handleSignOut() {
		await signOut(auth!);
		goto('/get-started');
	}
</script>

<svelte:head>
	<title>Account Settings — VERYNICE.kz</title>
</svelte:head>

<div class="settings-page">
	<div class="settings-container">
		<h1>Account Settings</h1>
		
		<div class="settings-nav">
			<button 
				class:active={activeTab === 'profile'} 
				on:click={() => activeTab = 'profile'}
			>
				Profile
			</button>
			<button 
				class:active={activeTab === 'security'} 
				on:click={() => activeTab = 'security'}
			>
				Security
			</button>
			<button 
				class:active={activeTab === 'notifications'} 
				on:click={() => activeTab = 'notifications'}
			>
				Notifications
			</button>
			<button 
				class:active={activeTab === 'privacy'} 
				on:click={() => activeTab = 'privacy'}
			>
				Privacy
			</button>
		</div>

		<div class="settings-content">
			{#if activeTab === 'profile'}
				<div class="settings-section">
					<h2>Profile Information</h2>
					<div class="profile-info">
						<div class="profile-field">
							<label>Name</label>
							<p>{currentUser?.displayName || 'Not set'}</p>
						</div>
						<div class="profile-field">
							<label>Email</label>
							<p>{currentUser?.email || 'Not set'}</p>
						</div>
						<div class="profile-field">
							<label>Account ID</label>
							<p class="user-id">{currentUser?.uid || 'N/A'}</p>
						</div>
					</div>
					
					<button class="btn-secondary" on:click={handleSignOut}>
						Sign Out
					</button>
				</div>
			{/if}

			{#if activeTab === 'security'}
				<div class="settings-section">
					<h2>Change Password</h2>
					<form on:submit|preventDefault={handlePasswordChange}>
						<div class="form-group">
							<label for="new-password">New Password</label>
							<input 
								type="password" 
								id="new-password"
								bind:value={newPassword}
								placeholder="Enter new password"
							/>
						</div>
						<div class="form-group">
							<label for="confirm-password">Confirm Password</label>
							<input 
								type="password" 
								id="confirm-password"
								bind:value={confirmPassword}
								placeholder="Confirm new password"
							/>
						</div>
						
						{#if passwordError}
							<p class="error">{passwordError}</p>
						{/if}
						{#if passwordSuccess}
							<p class="success">{passwordSuccess}</p>
						{/if}
						
						<button type="submit" class="btn-primary">
							Update Password
						</button>
					</form>
				</div>

				<div class="settings-section">
					<h2>Two-Factor Authentication</h2>
					<p class="description">Add an extra layer of security to your account.</p>
					<button class="btn-secondary" on:click={() => show2FASetup = true}>
						Set Up 2FA
					</button>
				</div>
			{/if}

			{#if activeTab === 'notifications'}
				<div class="settings-section">
					<h2>Notification Preferences</h2>
					<div class="preference-item">
						<label>
							<input type="checkbox" bind:checked={emailNotifications} />
							Email Notifications
						</label>
						<p class="description">Receive notifications via email</p>
					</div>
					<div class="preference-item">
						<label>
							<input type="checkbox" bind:checked={tripReminders} />
							Trip Reminders
						</label>
						<p class="description">Get reminded about upcoming trips</p>
					</div>
					<div class="preference-item">
						<label>
							<input type="checkbox" bind:checked={marketingEmails} />
							Marketing Emails
						</label>
						<p class="description">Receive promotional content and updates</p>
					</div>
					
					<button class="btn-primary" on:click={saveNotificationPreferences}>
						Save Preferences
					</button>
				</div>
			{/if}

			{#if activeTab === 'privacy'}
				<div class="settings-section">
					<h2>Delete Account</h2>
					<p class="warning-text">
						Warning: This action is irreversible. All your data including saved destinations, 
						trips, and preferences will be permanently deleted.
					</p>
					
					{#if !showDeleteConfirm}
						<button class="btn-danger" on:click={() => showDeleteConfirm = true}>
							Delete My Account
						</button>
					{:else}
						<div class="delete-confirmation">
							<p>Type <strong>DELETE</strong> to confirm:</p>
							<input 
								type="text" 
								bind:value={deleteConfirmationText}
								placeholder="Type DELETE"
							/>
							<div class="delete-actions">
								<button 
									class="btn-danger" 
									on:click={handleDeleteAccount}
									disabled={deleting || deleteConfirmationText !== 'DELETE'}
								>
									{deleting ? 'Deleting...' : 'Confirm Delete'}
								</button>
								<button 
									class="btn-secondary" 
									on:click={() => { showDeleteConfirm = false; deleteConfirmationText = ''; }}
								>
									Cancel
								</button>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.settings-page {
		min-height: 100vh;
		padding: 2rem;
		background: #f5f5f5;
	}

	.settings-container {
		max-width: 800px;
		margin: 0 auto;
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
	}

	h1 {
		font-size: 1.75rem;
		margin-bottom: 1.5rem;
		color: #333;
	}

	h2 {
		font-size: 1.25rem;
		margin-bottom: 1rem;
		color: #333;
	}

	.settings-nav {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 2rem;
		border-bottom: 1px solid #eee;
		padding-bottom: 1rem;
	}

	.settings-nav button {
		padding: 0.75rem 1.25rem;
		border: none;
		background: transparent;
		color: #666;
		font-size: 0.95rem;
		cursor: pointer;
		border-radius: 8px;
		transition: all 0.2s;
	}

	.settings-nav button.active,
	.settings-nav button:hover {
		background: #e8f5e9;
		color: #2e7d32;
	}

	.settings-section {
		margin-bottom: 2rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid #eee;
	}

	.settings-section:last-child {
		border-bottom: none;
	}

	.profile-info {
		margin-bottom: 1.5rem;
	}

	.profile-field {
		margin-bottom: 1rem;
	}

	.profile-field label {
		display: block;
		font-size: 0.85rem;
		color: #666;
		margin-bottom: 0.25rem;
	}

	.profile-field p {
		font-size: 1rem;
		color: #333;
	}

	.user-id {
		font-family: monospace;
		font-size: 0.85rem;
		color: #666;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
	}

	.form-group input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
	}

	.description {
		font-size: 0.9rem;
		color: #666;
		margin-bottom: 1rem;
	}

	.preference-item {
		margin-bottom: 1.25rem;
	}

	.preference-item label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 500;
		cursor: pointer;
	}

	.preference-item input[type="checkbox"] {
		width: 18px;
		height: 18px;
	}

	.warning-text {
		color: #c62828;
		font-size: 0.95rem;
		margin-bottom: 1rem;
		padding: 1rem;
		background: #ffebee;
		border-radius: 8px;
	}

	.delete-confirmation {
		margin-top: 1rem;
	}

	.delete-confirmation input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		margin: 0.5rem 0;
	}

	.delete-actions {
		display: flex;
		gap: 1rem;
	}

	.btn-primary,
	.btn-secondary,
	.btn-danger {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary {
		background: #2e7d32;
		color: white;
	}

	.btn-primary:hover {
		background: #1b5e20;
	}

	.btn-secondary {
		background: #e0e0e0;
		color: #333;
	}

	.btn-secondary:hover {
		background: #bdbdbd;
	}

	.btn-danger {
		background: #c62828;
		color: white;
	}

	.btn-danger:hover {
		background: #b71c1c;
	}

	.btn-danger:disabled {
		background: #e0e0e0;
		color: #999;
		cursor: not-allowed;
	}

	.error {
		color: #c62828;
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	.success {
		color: #2e7d32;
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	@media (max-width: 768px) {
		.settings-nav {
			flex-wrap: wrap;
		}
		
		.settings-nav button {
			flex: 1;
			min-width: calc(50% - 0.25rem);
		}
	}
</style>