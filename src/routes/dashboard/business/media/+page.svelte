<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/firebase';
	import { onAuthStateChanged } from 'firebase/auth';

	let loading = true;

	onMount(() => {
		if (!auth) { goto('/get-started'); return; }
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (!firebaseUser) { goto('/get-started'); return; }
			loading = false;
		});
		return () => unsubscribe();
	});
</script>

<svelte:head>
	<title>Media Library — VERYNICE.kz</title>
</svelte:head>

<div class="media-page">
	<header class="page-header">
		<h1>Media Library</h1>
		<p>Manage your business photos and videos</p>
	</header>

	{#if loading}
		<div class="loading"><div class="spinner"></div></div>
	{:else}
		<div class="upload-section">
			<button class="upload-btn">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
					<polyline points="17 8 12 3 7 8"></polyline>
					<line x1="12" y1="3" x2="12" y2="15"></line>
				</svg>
				Upload Media
			</button>
			<p class="upload-hint">Upload photos and videos for your listings (Cloudinary integration coming soon)</p>
		</div>

		<div class="empty-state">
			<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
				<circle cx="8.5" cy="8.5" r="1.5"></circle>
				<polyline points="21 15 16 10 5 21"></polyline>
			</svg>
			<h2>No media files yet</h2>
			<p>Upload photos and videos to use in your listings</p>
		</div>
	{/if}
</div>

<style>
	.media-page { max-width: 1000px; }
	.page-header { margin-bottom: 2rem; }
	.page-header h1 { font-size: 1.75rem; color: #0a1e3c; margin-bottom: 0.5rem; }
	.page-header p { color: #666; }
	.loading { display: flex; justify-content: center; padding: 4rem; }
	.spinner { width: 40px; height: 40px; border: 3px solid #f0f0f0; border-top-color: #0a1e3c; border-radius: 50%; animation: spin 0.8s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }
	.upload-section { margin-bottom: 2rem; }
	.upload-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: #E8A44A; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; }
	.upload-btn:hover { background: #d69440; }
	.upload-hint { margin-top: 0.5rem; font-size: 0.85rem; color: #6b7280; }
	.empty-state { text-align: center; padding: 4rem 2rem; background: white; border-radius: 12px; }
	.empty-state svg { color: #d1d5db; margin-bottom: 1rem; }
	.empty-state h2 { color: #374151; margin-bottom: 0.5rem; }
	.empty-state p { color: #6b7280; }
</style>
