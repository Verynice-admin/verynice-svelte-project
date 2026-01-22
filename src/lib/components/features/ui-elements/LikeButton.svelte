<!-- src/lib/ui-elements/LikeButton.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { getFirestore } from '$lib/firebaseApp';

	export let likes: number = 0;
	export let postId: string;
	export let collectionPath: string = 'pages';

	let fs: any = null;
	let currentLikes = likes;
	let pending = false;

	onMount(async () => {
		if (!browser) return;
		fs = await getFirestore();
	});

	async function like() {
		if (!browser || !fs || !postId) return;
		if (pending) return;
		pending = true;
		try {
			const { doc, updateDoc, increment } = await import('firebase/firestore');
			const ref = doc(fs, collectionPath, postId);
			await updateDoc(ref, { articleLikes: increment(1) });
			currentLikes += 1;
		} finally {
			pending = false;
		}
	}
</script>

<button on:click={like} disabled={pending} aria-live="polite">
	🔥 {currentLikes}
</button>

<style>
	button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		border: 1px solid rgba(0, 0, 0, 0.08);
		background: #ffffff;
		padding: 0.5rem 1.25rem;
		border-radius: 999px; /* Pill shape */
		font-family: 'Inter', sans-serif;
		font-size: 0.95rem;
		font-weight: 600;
		color: #475569; /* Slate 600 */
		transition: all 0.2s ease;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}
	button:hover:not(:disabled) {
		background: #f8fafc;
		transform: translateY(-1px);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);
		color: #0f172a; /* Darker on hover */
		border-color: rgba(0, 0, 0, 0.12);
	}
	button:active:not(:disabled) {
		transform: translateY(0);
	}
	button:disabled {
		opacity: 0.6;
		cursor: default;
	}
</style>
