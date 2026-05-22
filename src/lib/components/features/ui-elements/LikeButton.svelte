<!-- src/lib/ui-elements/LikeButton.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { getFirestore } from '$lib/firebase';

	export let likes: number = 0;
	export let postId: string;
	export let collectionPath: string = 'pages';

	let fs: any = null;
	let currentLikes = likes;
	let pending = false;
	let hasLiked = false;

	const storageKey = () => `liked_${collectionPath}_${postId}`;

	onMount(async () => {
		if (!browser) return;
		fs = await getFirestore();
		try {
			hasLiked = localStorage.getItem(storageKey()) === '1';
		} catch {
			// localStorage unavailable (private browsing, storage blocked) â€” allow like
		}
	});

	async function like() {
		if (!browser || !fs || !postId || pending || hasLiked) return;
		pending = true;
		try {
			const { doc, updateDoc, increment } = await import('firebase/firestore');
			const ref = doc(fs, collectionPath, postId);
			await updateDoc(ref, { articleLikes: increment(1) });
			currentLikes += 1;
			hasLiked = true;
			try {
				localStorage.setItem(storageKey(), '1');
			} catch {
				// localStorage write failed â€” in-memory hasLiked still prevents double-tap
			}
		} finally {
			pending = false;
		}
	}
</script>

<button on:click={like} disabled={pending || hasLiked} aria-live="polite" aria-label="Like this article">
	ðŸ”¥ {currentLikes}
</button>

<style>
	button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		border: 1px solid rgba(255, 255, 255, 0.3);
		background: rgb(3, 122, 255);
		padding: 0.5rem 1.25rem;
		border-radius: 999px; /* Pill shape */
		font-family: 'Inter', sans-serif;
		font-size: 0.95rem;
		font-weight: 600;
		color: #ffffff;
		transition: all 0.2s ease;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}
	button:hover:not(:disabled) {
		background: rgb(0, 100, 220);
		transform: translateY(-1px);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
		color: #ffffff;
		border-color: rgba(255, 255, 255, 0.5);
	}
	button:active:not(:disabled) {
		transform: translateY(0);
	}
	button:disabled {
		opacity: 0.6;
		cursor: default;
	}
</style>
