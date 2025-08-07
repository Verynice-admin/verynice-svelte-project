<!-- src/lib/components/content/Comments.svelte (FINAL, WITH "SHOW LESS" FUNCTIONALITY) -->
<script>
    import { onMount, onDestroy } from 'svelte';
    import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
    import { db } from '$lib/services/firebase.js';

    export let postId = '';

    const INITIAL_VISIBLE_COUNT = 3;

    let allComments = [];
    let visibleCommentCount = INITIAL_VISIBLE_COUNT;
    
    $: visibleComments = allComments.slice(0, visibleCommentCount);

    let unsubscribe = () => {};
    let newCommentText = '';
    let isSubmitting = false;
    let error = '';

    onMount(() => {
        if (!postId) return;
        const commentsQuery = query(collection(db, `pages/${postId}/comments`), orderBy('createdAt', 'desc'));
        unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
            allComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        });
    });

    onDestroy(() => {
        unsubscribe();
    });

    async function handleSubmit() {
        if (!newCommentText.trim() || !postId) return;
        isSubmitting = true;
        error = '';
        try {
            const commentsCollectionRef = collection(db, `pages/${postId}/comments`);
            await addDoc(commentsCollectionRef, {
                text: newCommentText,
                author: "Anonymous User",
                createdAt: serverTimestamp()
            });
            const pageDocRef = doc(db, 'pages', postId);
            await updateDoc(pageDocRef, { articleComments: increment(1) });
            newCommentText = '';
        } catch (err) {
            console.error("Error submitting comment:", err);
            error = "Failed to post comment. Please try again.";
        } finally {
            isSubmitting = false;
        }
    }

    function showAllComments() {
        visibleCommentCount = allComments.length;
    }

    // --- [THE FIX IS HERE]: A new function to reset the view ---
    function showLessComments() {
        visibleCommentCount = INITIAL_VISIBLE_COUNT;
    }
</script>

<section class="themed-content-block">
    <div class="additional-content-header">
        <h2>Comments ({allComments.length})</h2>
    </div>

    <div class="comments-list">
        {#if allComments.length > 0}
            {#each visibleComments as comment}
                <div class="comment-item">
                    <p class="comment-author">{comment.author}</p>
                    <p class="comment-text">{comment.text}</p>
                </div>
            {/each}
        {:else}
            <p class="no-comments-text">Be the first to leave a comment!</p>
        {/if}
    </div>

    <!-- --- [THE FIX IS HERE]: Logic to toggle between the two buttons --- -->
    <!-- This container only appears if there are more comments than the initial count -->
    {#if allComments.length > INITIAL_VISIBLE_COUNT}
        <div class="load-more-container">
            {#if visibleCommentCount > INITIAL_VISIBLE_COUNT}
                <!-- If all comments are visible, show the "Show Less" button -->
                <button class="load-more-button" on:click={showLessComments}>
                    Show Less
                </button>
            {:else}
                <!-- Otherwise, show the "Show all" button -->
                <button class="load-more-button" on:click={showAllComments}>
                    Show all {allComments.length} comments
                </button>
            {/if}
        </div>
    {/if}

    <form class="comment-form" on:submit|preventDefault={handleSubmit}>
        <h4>Leave a Comment</h4>
        <textarea
            bind:value={newCommentText}
            placeholder="Write your comment here..."
            disabled={isSubmitting}
            required
        ></textarea>
        <button type="submit" class="vnk-button" disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
        {#if error}
            <p class="error-message">{error}</p>
        {/if}
    </form>
</section>

<style>
    /* All existing styles are unchanged */
    .comments-list { margin-bottom: var(--vnk-spacing-xl); }
    .comment-item {
        background-color: var(--vnk-card-bg);
        border-radius: var(--vnk-border-radius-md);
        padding: var(--vnk-spacing-md);
        margin-bottom: var(--vnk-spacing-md);
        border: 1px solid var(--vnk-card-border-color);
    }
    .comment-author { font-weight: 700; color: var(--vnk-text-primary-color); margin-bottom: var(--vnk-spacing-xs); }
    .comment-text { color: var(--vnk-text-secondary-color); }
    .no-comments-text { color: var(--vnk-text-secondary-color); }
    .comment-form { margin-top: var(--vnk-spacing-xl); }
    .comment-form h4 { font-size: 1.1rem; color: var(--vnk-text-primary-color); margin-bottom: var(--vnk-spacing-sm); }
    .comment-form textarea {
        width: 100%;
        min-height: 100px;
        background-color: rgba(var(--vnk-bg-gradient-end-rgb), 0.5);
        border: 1px solid var(--vnk-card-border-color);
        border-radius: var(--vnk-border-radius-sm);
        color: var(--vnk-text-primary-color);
        padding: var(--vnk-spacing-sm);
        font-family: inherit;
        font-size: 1rem;
        margin-bottom: var(--vnk-spacing-md);
    }
    .vnk-button {
        background-color: var(--vnk-accent-color);
        border: 1px solid var(--vnk-accent-color);
        color: var(--vnk-bg-gradient-start);
        cursor: pointer;
        font-family: var(--vnk-font-primary);
        font-size: 1rem;
        font-weight: 700;
        padding: var(--vnk-spacing-sm) var(--vnk-spacing-lg);
        border-radius: var(--vnk-border-radius-sm);
        text-transform: uppercase;
        transition: all 0.3s ease;
    }
    .vnk-button:hover:not(:disabled) {
        background-color: #39dff8;
        box-shadow: var(--vnk-shadow-neon-md);
    }
    .vnk-button:disabled { opacity: 0.6; cursor: not-allowed; }
    .error-message { color: var(--vnk-error-color); margin-top: var(--vnk-spacing-sm); }
    .load-more-container {
        text-align: center;
        margin-bottom: var(--vnk-spacing-xl);
    }
    .load-more-button {
        background-color: transparent;
        color: var(--vnk-text-accent-color);
        border: 1px solid var(--vnk-card-border-color);
        font-family: var(--vnk-font-primary);
        font-weight: 600;
        padding: var(--vnk-spacing-sm) var(--vnk-spacing-lg);
        border-radius: var(--vnk-border-radius-sm);
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .load-more-button:hover {
        background-color: var(--vnk-card-border-color);
        color: var(--vnk-text-primary-color);
    }
</style>