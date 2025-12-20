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
  👍 {currentLikes}
</button>

<style>
  button {
    display: inline-flex;
    align-items: center;
    gap: .35rem;
    cursor: pointer;
    border: 1px solid var(--border-color, #ccc);
    background: var(--btn-bg, #fff);
    padding: 0.35rem 0.7rem;
    border-radius: 6px;
    font: inherit;
    color: var(--text-color, #222);
    transition: background .18s, transform .15s;
  }
  button:hover:not(:disabled) {
    background: var(--btn-hover, #f5f5f5);
  }
  button:disabled {
    opacity: 0.65;
    cursor: default;
  }
</style>