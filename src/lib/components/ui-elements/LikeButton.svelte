<!-- src/lib/ui-elements/LikeButton.svelte -->
<script>
    import { doc, updateDoc, increment } from 'firebase/firestore';
    import { db } from '$lib/services/firebase.js';

    export let postId = '';
    export let initialLikes = 0;

    let isDisabled = false; // Prevents multiple clicks
    let likedInSession = false; // Tracks if the user has liked in this session

    async function handleLike() {
        if (isDisabled || likedInSession || !postId) return;

        isDisabled = true;
        
        try {
            const pageDocRef = doc(db, 'pages', postId);
            await updateDoc(pageDocRef, {
                articleLikes: increment(1)
            });
            likedInSession = true; // Mark as liked for this session
        } catch (error) {
            console.error("Failed to update like count:", error);
            isDisabled = false; // Re-enable button on error
        }
    }
</script>

<div class="like-container">
    <button id="like-button" on:click={handleLike} disabled={isDisabled || likedInSession} class:voted={likedInSession}>
        <span class="icon-like"></span>
    </button>
    <span class="like-count">{initialLikes.toLocaleString()}</span>
</div>

<style>
    .like-container {
        display: flex;
        align-items: center;
        gap: var(--vnk-spacing-sm);
    }
    #like-button {
        /* Your existing button styles */
        background-color: rgba(var(--vnk-accent-rgb), 0.15);
        color: var(--vnk-text-accent-color);
        border: 1px solid var(--vnk-accent-color);
        border-radius: var(--vnk-border-radius-sm);
        padding: var(--vnk-spacing-sm);
        transition: all 0.3s ease;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    #like-button:hover:not(:disabled) {
        background-color: var(--vnk-accent-color);
        color: var(--vnk-bg-gradient-start);
        box-shadow: var(--vnk-shadow-neon-md);
        transform: translateY(-2px);
    }
    #like-button.voted {
        background-color: var(--vnk-accent-color);
        color: var(--vnk-bg-gradient-start);
        cursor: default;
    }
    #like-button:disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }
    .like-count {
        /* Style inherited from AuthorInfo */
    }
</style>