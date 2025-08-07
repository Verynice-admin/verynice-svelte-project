<!-- src/lib/components/content/AuthorInfo.svelte (UPDATED TO BE REAL-TIME) -->

<script>
    import { onMount, onDestroy } from 'svelte';
    import { doc, onSnapshot } from 'firebase/firestore';
    import { db } from '$lib/services/firebase.js';
    import LikeButton from '$lib/components/ui-elements/LikeButton.svelte';
    import SocialShare from '$lib/components/ui-elements/SocialShare.svelte';

    /** @type {any} */
    export let author = null;
    /** @type {any} */
    export let labels = {};
    /** @type {any} */
    export let engagementData = {};
    /** @type {string} */
    export let postId = 'unknown';

    // --- NEW: A reactive variable to hold live data ---
    let liveEngagementData = { ...engagementData };
    let unsubscribe = () => {};

    // --- NEW: onMount lifecycle function ---
    onMount(() => {
        if (!postId) return;
        
        // Listen for real-time updates to the document
        const pageDocRef = doc(db, 'pages', postId);
        unsubscribe = onSnapshot(pageDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // Update our live variable whenever the data changes in Firestore
                liveEngagementData = {
                    views: data.articleViews || 0,
                    comments: data.articleComments || 0,
                    likes: data.articleLikes || 0,
                };
            }
        });
    });

    // --- NEW: onDestroy lifecycle function ---
    onDestroy(() => {
        // Unsubscribe from the listener when the component is removed
        unsubscribe();
    });


    function getCloudinaryUrl(publicId, options = 'w_60,h_60,c_fill,g_face,q_auto,f_auto') {
        const cloudName = "verynice";
        return `https://res.cloudinary.com/${cloudName}/image/upload/${options}/${publicId}`;
    }
</script>

<section class="themed-content-block">
    <div class="author-info-grid">
        
        {#if author}
            <div class="author-block">
                <h4>{labels.authorSectionTitle || 'Author of the article'}</h4>
                <div class="author-details">
                    <img 
                        src={getCloudinaryUrl(author.authorImagePublicId)} 
                        alt={author.ariaLabelForImage || `Photo of ${author.name}`}
                        class="author-photo" 
                        width="60" 
                        height="60"
                        loading="lazy" 
                    >
                    <div class="author-text">
                        <p class="author-name-display">{author.name}</p>
                        <p class="author-description-display">{author.description}</p>
                    </div>
                </div>
            </div>
        {/if}

        <div class="engagement-block">
            <h4>{labels.engagementTitle || 'Enjoyed the article?'}</h4>
            <!-- UPDATED: Pass the *live* like count to the LikeButton -->
            <LikeButton initialLikes={liveEngagementData.likes} {postId} />
        </div>
        
        <SocialShare title={labels.shareTitle || 'Share with friends!'} />

    </div>
</section>

<!-- (Your existing <style> block remains completely unchanged) -->
<style>
    .author-info-grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: flex-start;
        gap: var(--vnk-spacing-xl);
    }
    .author-block, .engagement-block, :global(.share-block) {
        flex: 1;
        min-width: 220px;
    }
    h4 {
        font-size: 0.9em;
        font-family: var(--vnk-font-primary);
        color: var(--vnk-text-secondary-color);
        margin-bottom: var(--vnk-spacing-sm);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 600;
    }
    .author-details {
        display: flex;
        align-items: center;
        gap: var(--vnk-spacing-md);
    }
    .author-photo {
        border-radius: var(--vnk-border-radius-md);
        border: 2px solid var(--vnk-accent-color);
        box-shadow: var(--vnk-shadow-neon-sm);
        height: 60px;
        width: 60px;
        object-fit: cover;
        flex-shrink: 0;
    }
    .author-name-display {
        color: var(--vnk-text-primary-color);
        font-size: 1.1em;
        font-weight: 700;
        margin: 0 0 4px 0;
    }
    .author-description-display {
        color: var(--vnk-text-secondary-color);
        font-size: 0.9em;
        line-height: 1.5;
        margin: 0;
    }
</style>