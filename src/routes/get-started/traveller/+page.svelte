<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	import { user, userProfile } from '$lib/stores/userStore';
	import { auth, db, googleProvider } from '$lib/firebase';
	import { 
		onAuthStateChanged, 
		signInWithEmailAndPassword, 
		createUserWithEmailAndPassword,
		signInWithPopup 
	} from 'firebase/auth';
	import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

	let name = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let isSignUp = false;
	let isLoading = false;
	let isSigningIn = false;
	let error = '';

	onMount(() => {
		// Check for ?mode=register query param
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.get('mode') === 'register') {
			isSignUp = true;
		}

		// Check if already authenticated
		if (!auth) return;
		
		onAuthStateChanged(auth, async (firebaseUser) => {
			if (firebaseUser && !isSigningIn) {
				user.set(firebaseUser);
				const role = await loadUserProfile(firebaseUser.uid);
				if (role === 'traveller') goto('/dashboard/traveller');
				else if (role === 'business') goto('/dashboard/business');
			}
		});
	});

	async function loadUserProfile(uid: string): Promise<string | null> {
		const docRef = doc(db!, 'users', uid);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			const data = docSnap.data();
			userProfile.set({
				uid: uid,
				email: data.email || null,
				role: data.role || null
			});
			return data.role ?? null;
		}
		return null;
	}

	async function handleSubmit() {
		isLoading = true;
		isSigningIn = true;
		error = '';

		// Validation
		if (isSignUp) {
			if (password !== confirmPassword) {
				error = 'Passwords do not match';
				isLoading = false;
				return;
			}
			if (password.length < 6) {
				error = 'Password must be at least 6 characters';
				isLoading = false;
				return;
			}
			if (!name.trim()) {
				error = 'Please enter your name';
				isLoading = false;
				return;
			}
		}

		try {
			if (!auth || !db) {
				error = 'Firebase not initialized';
				isLoading = false;
				return;
			}

			let credential;
			if (isSignUp) {
				credential = await createUserWithEmailAndPassword(auth, email, password);
			} else {
				credential = await signInWithEmailAndPassword(auth, email, password);
			}

			const firebaseUser = credential.user;
			user.set(firebaseUser);

			if (isSignUp) {
				await setDoc(doc(db, 'users', firebaseUser.uid), {
					uid: firebaseUser.uid,
					email: firebaseUser.email,
					displayName: name.trim(),
					photoURL: '',
					role: 'traveller',
					createdAt: serverTimestamp(),
					updatedAt: serverTimestamp()
				});

				userProfile.set({
					uid: firebaseUser.uid,
					email: firebaseUser.email,
					role: 'traveller'
				});
			} else {
				await loadUserProfile(firebaseUser.uid);
			}

			await createSession(firebaseUser);
			goto('/dashboard/traveller');
		} catch (err: any) {
			console.error('Auth error:', err);
			error = getErrorMessage(err.code);
		} finally {
			isLoading = false;
			isSigningIn = false;
		}
	}

	async function handleGoogleSignIn() {
		isLoading = true;
		isSigningIn = true;
		error = '';

		try {
			if (!auth || !db) {
				error = 'Firebase not initialized';
				isLoading = false;
				return;
			}

			const result = await signInWithPopup(auth, googleProvider);
			const firebaseUser = result.user;
			user.set(firebaseUser);

			// Check if user exists in Firestore
			const docRef = doc(db, 'users', firebaseUser.uid);
			const docSnap = await getDoc(docRef);

			if (!docSnap.exists()) {
				// Create new user with traveller role
				await setDoc(docRef, {
					uid: firebaseUser.uid,
					email: firebaseUser.email,
					displayName: firebaseUser.displayName ?? '',
					photoURL: firebaseUser.photoURL ?? '',
					role: 'traveller',
					createdAt: serverTimestamp(),
					updatedAt: serverTimestamp()
				});
			}

			await loadUserProfile(firebaseUser.uid);
			await createSession(firebaseUser);
			goto('/dashboard/traveller');
		} catch (err: any) {
			console.error('Google auth error:', err);
			error = getErrorMessage(err.code);
		} finally {
			isLoading = false;
			isSigningIn = false;
		}
	}

	async function createSession(firebaseUser: import('firebase/auth').User): Promise<void> {
		try {
			const idToken = await firebaseUser.getIdToken();
			const res = await fetch('/api/auth/session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ idToken })
			});
			if (!res.ok) {
				const text = await res.text();
				console.error(`[auth] Session endpoint returned ${res.status}:`, text);
			}
		} catch (e) {
			console.error('[auth] Failed to create session cookie:', e);
		}
	}

	function getErrorMessage(code: string): string {
		switch (code) {
			case 'auth/email-already-in-use':
				return 'This email is already registered. Try signing in instead.';
			case 'auth/invalid-email':
				return 'Please enter a valid email address.';
			case 'auth/weak-password':
				return 'Password should be at least 6 characters.';
			case 'auth/user-not-found':
				return 'No account found with this email. Please register.';
			case 'auth/wrong-password':
				return 'Incorrect password. Please try again.';
			case 'auth/invalid-credential':
				return 'Invalid email or password.';
			case 'auth/popup-closed-by-user':
				return 'Sign in was cancelled. Please try again.';
			case 'auth/account-exists-with-different-credential':
				return 'An account already exists with a different sign in method.';
			default:
				return 'An error occurred. Please try again.';
		}
	}

	function toggleMode() {
		isSignUp = !isSignUp;
		error = '';
	}
</script>

<svelte:head>
	<title>Traveller Sign In - VERYNICE.kz</title>
	<meta name="description" content="Sign in or register as a traveller to access your trips and travel plans" />
</svelte:head>

<div class="auth-page">
	<div class="hero-overlay"></div>
	<div class="auth-container">
		<button class="back-button" on:click={() => goto('/get-started')}>
			← Back to options
		</button>

		<div class="auth-card">
			<div class="auth-header">
				<div class="auth-icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect>
						<path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
					</svg>
				</div>
				<h1>{isSignUp ? 'Register' : 'Sign In'}</h1>
				<p class="auth-subtitle">
					{isSignUp 
						? 'Create an account to save destinations and plan trips' 
						: 'Welcome back! Sign in to access your trips'}
				</p>
			</div>

			<!-- Mode Toggle -->
			<div class="mode-toggle">
				<button 
					class="toggle-btn" 
					class:active={!isSignUp} 
					on:click={() => isSignUp = false}
					disabled={isLoading}
				>
					Sign In
				</button>
				<button 
					class="toggle-btn" 
					class:active={isSignUp} 
					on:click={() => isSignUp = true}
					disabled={isLoading}
				>
					Register
				</button>
			</div>

			<!-- Google Sign In -->
			<button class="google-button" on:click={handleGoogleSignIn} disabled={isLoading}>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
					<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
					<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
					<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
					<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
				</svg>
				Continue with Google
			</button>

			<div class="divider">
				<span>or</span>
			</div>

			<form on:submit|preventDefault={handleSubmit}>
				{#if isSignUp}
					<div class="form-group">
						<label for="name">Full Name</label>
						<input 
							type="text" 
							id="name" 
							bind:value={name} 
							required 
							placeholder="Enter your full name"
							disabled={isLoading}
						/>
					</div>
				{/if}

				<div class="form-group">
					<label for="email">Email</label>
					<input 
						type="email" 
						id="email" 
						bind:value={email} 
						required 
						placeholder="your@email.com"
						disabled={isLoading}
					/>
				</div>

				<div class="form-group">
					<label for="password">Password</label>
					<input 
						type="password" 
						id="password" 
						bind:value={password} 
						required 
						placeholder="••••••••"
						minlength="6"
						disabled={isLoading}
					/>
				</div>

				{#if isSignUp}
					<div class="form-group">
						<label for="confirmPassword">Confirm Password</label>
						<input 
							type="password" 
							id="confirmPassword" 
							bind:value={confirmPassword} 
							required 
							placeholder="••••••••"
							minlength="6"
							disabled={isLoading}
						/>
					</div>
				{/if}

				{#if !isSignUp}
					<div class="forgot-password">
						<button type="button" class="link-button">Forgot password?</button>
					</div>
				{/if}

				{#if error}
					<div class="error-message">{error}</div>
				{/if}

				<button type="submit" class="submit-button" disabled={isLoading}>
					{#if isLoading}
						<span class="spinner"></span>
						Please wait...
					{:else}
						{isSignUp ? 'Create Account' : 'Sign In'}
					{/if}
				</button>
			</form>
		</div>
	</div>
</div>

<style>
	.auth-page {
		min-height: 100vh;
		padding: var(--vnk-spacing-xl, 2rem) var(--vnk-spacing-md, 1rem);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		background: var(--vnk-site-background-image), var(--vnk-site-background-fallback);
		background-position: center top;
		background-size: cover;
		background-repeat: no-repeat;
		background-attachment: fixed;
	}

	.hero-overlay {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1;
	}

	.auth-container {
		position: relative;
		z-index: 2;
		width: 100%;
		max-width: 420px;
	}

	.back-button {
		background: none;
		border: none;
		color: white;
		cursor: pointer;
		font-size: 1rem;
		margin-bottom: var(--vnk-spacing-md, 1rem);
		padding: 0;
		font-family: var(--vnk-font-primary, 'Outfit', sans-serif);
		opacity: 0.8;
		transition: opacity 0.2s;
	}

	.back-button:hover {
		opacity: 1;
	}

	.auth-card {
		background: rgba(255, 255, 255, 0.95);
		border-radius: var(--vnk-border-radius-lg, 1rem);
		padding: var(--vnk-spacing-xl, 2rem);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.auth-header {
		text-align: center;
		margin-bottom: var(--vnk-spacing-lg, 1.5rem);
	}

	.auth-icon {
		color: var(--vnk-accent-color, rgb(5, 115, 179));
		margin-bottom: var(--vnk-spacing-sm, 0.75rem);
	}

	.auth-header h1 {
		font-size: 1.5rem;
		color: var(--vnk-text-primary-color, rgb(3, 158, 155));
		margin-bottom: var(--vnk-spacing-xs, 0.5rem);
	}

	.auth-subtitle {
		color: var(--vnk-text-secondary-color, rgb(2, 114, 112));
		font-size: 0.9rem;
	}

	/* Mode Toggle */
	.mode-toggle {
		display: flex;
		background: #f0f0f0;
		border-radius: var(--vnk-border-radius-md, 0.75rem);
		padding: 4px;
		margin-bottom: var(--vnk-spacing-lg, 1.5rem);
	}

	.toggle-btn {
		flex: 1;
		padding: var(--vnk-spacing-sm, 0.75rem);
		border: none;
		background: transparent;
		border-radius: var(--vnk-border-radius-sm, 0.5rem);
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		color: var(--vnk-text-secondary-color, rgb(2, 114, 112));
		font-family: var(--vnk-font-primary, 'Outfit', sans-serif);
	}

	.toggle-btn.active {
		background: var(--vnk-accent-color, rgb(5, 115, 179));
		color: white;
	}

	.toggle-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Google Button */
	.google-button {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: var(--vnk-spacing-sm, 0.75rem);
		background: white;
		border: 2px solid #e0e0e0;
		border-radius: var(--vnk-border-radius-md, 0.75rem);
		font-size: 0.95rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		font-family: var(--vnk-font-primary, 'Outfit', sans-serif);
	}

	.google-button:hover:not(:disabled) {
		background: #f8f8f8;
		border-color: #d0d0d0;
	}

	.google-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.divider {
		display: flex;
		align-items: center;
		margin: var(--vnk-spacing-lg, 1.5rem) 0;
		color: var(--vnk-text-secondary-color, rgb(2, 114, 112));
		font-size: 0.85rem;
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: #e0e0e0;
	}

	.divider span {
		padding: 0 var(--vnk-spacing-md, 1rem);
	}

	.form-group {
		margin-bottom: var(--vnk-spacing-md, 1rem);
	}

	.form-group label {
		display: block;
		margin-bottom: var(--vnk-spacing-xs, 0.5rem);
		font-weight: 500;
		color: var(--vnk-text-primary-color, rgb(3, 158, 155));
		font-size: 0.9rem;
	}

	.form-group input {
		width: 100%;
		padding: var(--vnk-spacing-sm, 0.75rem);
		border: 2px solid var(--vnk-card-border-color, rgba(5, 115, 179, 0.3));
		border-radius: var(--vnk-border-radius-md, 0.75rem);
		font-size: 1rem;
		font-family: var(--vnk-font-secondary, 'Inter', sans-serif);
		transition: border-color 0.2s ease;
	}

	.form-group input:focus {
		outline: none;
		border-color: var(--vnk-accent-color, rgb(5, 115, 179));
	}

	.form-group input:disabled {
		background: #f5f5f5;
		cursor: not-allowed;
	}

	.forgot-password {
		text-align: right;
		margin-bottom: var(--vnk-spacing-md, 1rem);
	}

	.link-button {
		background: none;
		border: none;
		color: var(--vnk-accent-color, rgb(5, 115, 179));
		cursor: pointer;
		font-size: 0.85rem;
		font-family: var(--vnk-font-primary, 'Outfit', sans-serif);
	}

	.link-button:hover {
		text-decoration: underline;
	}

	.error-message {
		background: rgba(248, 113, 113, 0.15);
		color: #dc2626;
		padding: var(--vnk-spacing-sm, 0.75rem);
		border-radius: var(--vnk-border-radius-sm, 0.5rem);
		margin-bottom: var(--vnk-spacing-md, 1rem);
		font-size: 0.9rem;
		border: 1px solid rgba(248, 113, 113, 0.3);
	}

	.submit-button {
		width: 100%;
		background: var(--vnk-accent-color, rgb(5, 115, 179));
		color: white;
		border: none;
		padding: var(--vnk-spacing-sm, 0.75rem) var(--vnk-spacing-md, 1rem);
		font-size: 1rem;
		font-weight: 600;
		border-radius: var(--vnk-border-radius-md, 0.75rem);
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: var(--vnk-font-primary, 'Outfit', sans-serif);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.submit-button:hover:not(:disabled) {
		background: rgb(2, 114, 112);
		transform: scale(1.02);
	}

	.submit-button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
