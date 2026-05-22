<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser, dev } from '$app/environment';
	const log = dev ? console.log.bind(console) : () => {};
	import { onMount } from 'svelte';
	import { user } from '$lib/stores/userStore';
	import { getCloudinaryUrl } from '$lib/utils/cloudinary';
	import { page } from '$app/state';
	import { getFirebaseAuth, getFirebaseDb } from '$lib/firebase';
	import { onAuthStateChanged } from 'firebase/auth';
	import { doc, getDoc } from 'firebase/firestore';

	export let data;

	$: pageData = data.pageData || {};
	$: mainTitle = pageData.mainTitle || 'Welcome to VERYNICE.kz';
	$: headerDescription = pageData.headerDescription || 'Choose how you\'d like to continue';
	$: headerBackgroundPublicId = pageData.headerBackgroundPublicId || 'general/background';
	$: backgroundUrl = getCloudinaryUrl('general/background', { width: 1920, height: 1080, crop: 'fill' });

	// Card background images from Firebase
	$: travellerCardBgId = pageData.travellerCardBackgroundPublicId || 'content/pages/getStarted/travellerSignIn';
	$: businessCardBgId = pageData.businessCardBackgroundPublicId || 'content/pages/getStarted/businessSignIn';
	$: travellerCardBgUrl = getCloudinaryUrl(travellerCardBgId, { width: 900, height: 540, crop: 'fill', gravity: 'auto' });
	$: businessCardBgUrl = getCloudinaryUrl(businessCardBgId, { width: 900, height: 540, crop: 'fill', gravity: 'auto' });

	// Check if user is already signed in on mount
	let pageLoading = true;

	onMount(() => {
		// Check if user explicitly navigated here (via "Back to Site" button)
		const explicitlyNavigated = page.url.searchParams.get('from') === 'true';
		if (explicitlyNavigated) {
			sessionStorage.removeItem('navigatingFromDashboard');
			log('[get-started] User explicitly navigated here (from dashboard)');
		}
		
		const auth = getFirebaseAuth();
		const db = getFirebaseDb();

		// If no auth/db available, show the page
		if (!auth || !db) {
			log('[get-started] No auth/db, showing page');
			pageLoading = false;
			return;
		}

		log('[get-started] Auth available, waiting for state change...');

		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			log('[get-started] Auth state changed:', firebaseUser ? firebaseUser.email : 'no user');
			
			// Don't redirect if user explicitly came here
			if (explicitlyNavigated) {
				log('[get-started] User explicitly navigated here, not redirecting');
				pageLoading = false;
				return;
			}
			
			if (firebaseUser && !isSigningIn) {
				// User already signed in — check their role and redirect
				// Skip if we're currently in the middle of a sign-in flow
				try {
					log('[get-started] Fetching user doc from Firestore...');
					const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
					log('[get-started] User doc exists:', snap.exists());
					
					if (snap.exists()) {
						const role = snap.data().role;
						log('[get-started] User role:', role);
						log('[get-started] Redirecting to:', `/dashboard/${role}`);
						pageLoading = false;
						goto(`/dashboard/${role}`);
						return;
					} else {
						log('[get-started] No user doc in Firestore, redirecting to traveller');
						pageLoading = false;
						goto('/dashboard/traveller');
						return;
					}
				} catch (e) {
					console.error('Error checking existing session:', e);
					// On error, still try to redirect to traveller
					pageLoading = false;
					goto('/dashboard/traveller');
					return;
				}
			}
			pageLoading = false; // Only show page if NOT already signed in
		});

		// Safety timeout - if auth state doesn't resolve in 3 seconds, show the page
		const timeout = setTimeout(() => {
			log('[get-started] Timeout reached, showing page');
			pageLoading = false;
		}, 3000);

		return () => {
			clearTimeout(timeout);
			unsubscribe();
		};
	});

	// Google OAuth sign-in function
	import { getFirebaseGoogleProvider } from '$lib/firebase';
	import { signInWithPopup } from 'firebase/auth';
	import { setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

	let authError = '';
	let isSigningIn = false; // Prevent race condition with onAuthStateChanged

	function getErrorMessage(code: string | undefined): string {
		switch (code) {
			case 'auth/popup-blocked':
				return 'Please allow popups for this site';
			case 'auth/popup-closed-by-user':
				return 'Sign in was cancelled. Please try again.';
			case 'auth/network-request-failed':
				return 'Check your internet connection';
			case 'auth/too-many-requests':
				return 'Too many attempts. Try again later';
			case 'auth/user-disabled':
				return 'This account has been disabled';
			case 'auth/unauthorized-domain':
				return 'This domain is not authorized for OAuth';
			default:
				return 'Sign in failed. Please try again';
		}
	}

	async function handleGoogleSignIn(userType: 'traveller' | 'business') {
		// Prevent onAuthStateChanged from redirecting while we're processing
		isSigningIn = true;
		log('[Step 1] Starting sign in for role:', userType);
		
		try {
			const auth = getFirebaseAuth();
			const db = getFirebaseDb();
			const googleProvider = getFirebaseGoogleProvider();

			log('[Step 1b] Firebase instances ready');
			
			if (!auth || !db) {
				authError = 'Firebase not initialized. Check configuration.';
				console.error('[Google SignIn] Firebase not initialized:', { auth, db });
				return;
			}

			// Step 1 — Google Sign In
			const result = await signInWithPopup(auth, googleProvider);
			const firebaseUser = result.user;
			log('[Step 2] Auth success:', firebaseUser.email);
			log('[Step 3] UID:', firebaseUser.uid);

			// Step 2 — Reference to user document
			const docRef = doc(db, 'users', firebaseUser.uid);
			log('[Step 4] User ref created');

			// Step 3 — Check if user already exists
			const docSnap = await getDoc(docRef);
			log('[Step 5] User exists:', docSnap.exists());

			let finalUserRole = userType;

			if (!docSnap.exists()) {
				log('[Step 6] Creating new user doc with role:', userType);
				
				await setDoc(docRef, {
					uid: firebaseUser.uid,
					email: firebaseUser.email,
					displayName: firebaseUser.displayName ?? '',
					photoURL: firebaseUser.photoURL ?? '',
					role: userType,
					createdAt: serverTimestamp(),
					updatedAt: serverTimestamp()
				});
				log('[Step 7] User doc created successfully');
			} else {
				// Existing user - check if they want to switch roles
				const existingRole = docSnap.data()?.role;
				log('[Step 6] Existing user, current role:', existingRole);
				
				// If clicking a different role than current, update it
				if (existingRole && existingRole !== userType) {
					log('[Step 6b] Switching role from', existingRole, 'to', userType);
					await updateDoc(docRef, {
						role: userType,
						updatedAt: serverTimestamp()
					});
					finalUserRole = userType;
				} else {
					finalUserRole = existingRole || userType;
				}
			}

			log('[Step 8] Final role:', finalUserRole);

			// Update user store
			user.set(firebaseUser);

			// Step 5 — Create session cookie then redirect
			log('[Step 9] Redirecting to:', `/dashboard/${finalUserRole}`);
			try {
				const idToken = await firebaseUser.getIdToken();
				const sessionRes = await fetch('/api/auth/session', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ idToken })
				});
				if (!sessionRes.ok) {
					const text = await sessionRes.text();
					console.error(`[auth] Session endpoint returned ${sessionRes.status}:`, text);
				}
			} catch (e) {
				console.error('[auth] Failed to create session cookie:', e);
			}

			// Set loading to false before redirecting
			pageLoading = false;
			// Use goto() for proper client-side navigation
			goto(`/dashboard/${finalUserRole}`);
			
			log('[Step 10] Redirect called');

		} catch (error: any) {
			// Log EVERY detail of any error
			console.error('[ERROR] Full error object:', error);
			console.error('[ERROR] Code:', error?.code);
			console.error('[ERROR] Message:', error?.message);
			console.error('[ERROR] Stack:', error?.stack);
			
			// Show inline error to user
			authError = getErrorMessage(error?.code);
		} finally {
			// Reset the flag so future onAuthStateChanged can work normally
			isSigningIn = false;
		}
	}
</script>

<svelte:head>
	<title>{mainTitle} — VERYNICE.kz</title>
	<meta name="description" content={headerDescription} />
</svelte:head>

{#if pageLoading}
	<div class="page-loading">
		<div class="spinner"></div>
	</div>
{:else}
	<div class="get-started-page" style="background-image: url({backgroundUrl});">
		<div class="hero-overlay"></div>
		<div class="container">
		<header class="page-header">
			<h1 class="page-title">{mainTitle}</h1>
			<p class="page-subtitle">{headerDescription}</p>
		</header>

		<div class="cards-wrapper">
			<!-- Traveller Card -->
			<button type="button" class="attractions-item-card role-card traveller-card" on:click={() => handleGoogleSignIn('traveller')}>
				<div class="card-image-wrapper">
					<div class="card-image" style="background-image: url({travellerCardBgUrl})"></div>
					<div class="card-overlay"></div>
				</div>
				<div class="attractions-item-content">
					<h2 class="item-title card-title">Traveller</h2>
					<p class="item-description card-description">Access your trips, saved destinations & travel plans</p>
					<span class="read-more card-action">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
						</svg>
						Continue with Google
					</span>
				</div>
			</button>

			<!-- Business Card -->
			<button type="button" class="attractions-item-card role-card business-card" on:click={() => handleGoogleSignIn('business')}>
				<div class="card-image-wrapper">
					<div class="card-image" style="background-image: url({businessCardBgUrl})"></div>
					<div class="card-overlay"></div>
				</div>
				<div class="attractions-item-content">
					<h2 class="item-title card-title">Business</h2>
					<p class="item-description card-description">
						Manage your hotel, car service, tour agency or other listing
					</p>
					<span class="read-more card-action">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
						</svg>
						Continue with Google
					</span>
				</div>
			</button>
		</div>

		<div class="footer-reassurance">
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
				<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
			</svg>
			Secure sign-in powered by Google
		</div>

		{#if authError}
			<p class="auth-error">{authError}</p>
		{/if}
		</div>
	</div>
{/if}

<style>
	/* Ensure global card styles are applied */
	:global(.attractions-item-card.role-card) {
		min-height: 220px;
	}

	:global(.attractions-item-card.role-card:hover) {
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12) !important;
	}

	:global(.attractions-item-card.role-card .card-image-wrapper) {
		position: relative !important;
		inset: 0;
		z-index: 1;
		overflow: hidden;
	}

	:global(.attractions-item-card.role-card .card-image) {
		position: absolute;
		width: 100%;
		height: 100%;
		background-size: cover !important;
		background-position: center !important;
		transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	:global(.attractions-item-card.role-card:hover .card-image) {
		transform: scale(1.03) !important;
	}

	:global(.attractions-item-card.role-card .attractions-item-content) {
		position: relative !important;
		z-index: 10;
		display: flex !important;
		flex-direction: column;
		justify-content: flex-end;
		padding: 1.25rem;
		min-height: 220px;
		box-sizing: border-box;
	}

	:global(.attractions-item-card.role-card .item-title) {
		font-family: 'Segoe UI', 'Inter', sans-serif !important;
		font-size: 1.25rem;
		font-weight: 700;
		color: #ffffff;
		text-align: left;
		margin-bottom: 0.4rem;
		line-height: 1.2;
		text-shadow: 0 2px 8px rgba(0,0,0,0.3);
	}

	:global(.attractions-item-card.role-card:hover .item-title) {
		color: var(--vnk-text-secondary-color) !important;
	}

	:global(.attractions-item-card.role-card .item-description) {
		font-family: 'Segoe UI', 'Inter', sans-serif !important;
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.85);
		text-align: left;
		line-height: 1.4;
		margin-bottom: 0.75rem;
	}

	:global(.attractions-item-card.role-card .read-more) {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	:global(.attractions-item-card.role-card.traveller-card .read-more) {
		background: rgba(74, 158, 232, 0.85) !important;
	}

	:global(.attractions-item-card.role-card.traveller-card .read-more:hover) {
		background: rgba(74, 158, 232, 1) !important;
	}

	:global(.attractions-item-card.role-card.business-card .read-more) {
		background: rgba(232, 164, 74, 0.85) !important;
	}

	:global(.attractions-item-card.role-card.business-card .read-more:hover) {
		background: rgba(232, 164, 74, 1) !important;
	}

	/* Fallback backgrounds if images don't load */
	:global(.attractions-item-card.role-card.traveller-card .card-image) {
		background: linear-gradient(135deg, #1a365d 0%, #2d5a87 50%, #4A9EE8 100%);
	}

	:global(.attractions-item-card.role-card.business-card .card-image) {
		background: linear-gradient(135deg, #1a365d 0%, #5a4020 50%, #E8A44A 100%);
	}

	.page-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: #0a1e3c;
	}

	.page-loading .spinner {
		width: 40px;
		height: 40px;
		border: 3px solid rgba(255,255,255,0.1);
		border-top-color: #4A9EE8;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.get-started-page {
		min-height: 100vh;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	}

	.hero-overlay {
		position: absolute;
		inset: 0;
		z-index: 1;
	}

	.container {
		position: relative;
		z-index: 2;
		max-width: 900px;
		margin: 0 auto;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.page-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.page-title {
		font-size: clamp(2rem, 5vw, 3.2rem);
		font-weight: 800;
		color: #ffffff;
		text-align: center;
		letter-spacing: -0.5px;
		margin-bottom: 0.5rem;
		text-shadow: 0 2px 20px rgba(0,0,0,0.3);
		font-family: var(--vnk-font-primary, 'Outfit', sans-serif);
	}

	.page-subtitle {
		font-size: 1.1rem;
		color: rgba(255, 255, 255, 0.72);
		text-align: center;
		font-weight: 400;
		margin-bottom: 0;
		letter-spacing: 0.2px;
	}

	/* Cards Wrapper - matching tips page grid */
	.cards-wrapper {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
		width: 100%;
		max-width: 800px;
	}

	.container {
		max-width: 900px;
	}

	/* Dark overlay for readability - local only */
	.card-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.7) 100%);
		z-index: 2;
	}

	.footer-reassurance {
		font-size: 0.85rem;
		font-weight: 500;
		color: rgba(255,255,255,0.7);
		text-align: center;
		margin-top: 1.5rem;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.auth-error {
		margin-top: 1rem;
		padding: 0.75rem 1rem;
		background: rgba(220, 38, 38, 0.15);
		border: 1px solid rgba(220, 38, 38, 0.3);
		border-radius: 8px;
		color: #fca5a5;
		font-size: 0.9rem;
		text-align: center;
	}

	/* Mobile responsive - only layout changes */
	@media (max-width: 768px) {
		.cards-wrapper {
			grid-template-columns: 1fr;
			gap: 1rem;
			max-width: 400px;
		}

		:global(.attractions-item-card.role-card) {
			min-height: 180px;
		}

		:global(.attractions-item-card.role-card .attractions-item-content) {
			padding: 1rem;
			min-height: 180px;
		}

		:global(.attractions-item-card.role-card .item-title) {
			font-size: 1.1rem;
		}

		:global(.attractions-item-card.role-card .item-description) {
			font-size: 0.8rem;
			display: none;
		}

		:global(.attractions-item-card.role-card .read-more) {
			font-size: 0.75rem;
			padding: 0.4rem 0.8rem;
		}
	}

	.auth-error {
		color: #e74c3c;
		font-size: 0.85rem;
		text-align: center;
		margin-top: 1rem;
		padding: 0.75rem 1rem;
		background: rgba(231, 76, 60, 0.1);
		border-radius: 8px;
		width: 100%;
		max-width: 300px;
	}

	@media (max-width: 640px) {
		.cards-wrapper {
			flex-direction: column;
			align-items: center;
			gap: 1.25rem;
		}

		.role-card {
			max-width: 100%;
			width: 100%;
			padding: 2rem 1.5rem;
		}

		.page-title {
			font-size: 1.8rem;
		}

		.get-started-page {
			padding: 1.5rem 1rem;
		}
	}
</style>


