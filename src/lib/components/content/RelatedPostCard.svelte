<!-- src/lib/components/content/RelatedPostCard.svelte (NEW COMPONENT) -->
<script>
    import { onMount, onDestroy } from 'svelte';
    import { doc, onSnapshot } from 'firebase/firestore';
    import { db } from '$lib/services/firebase.js';

    /** @type {any} */
    export let post;

    // Internal state for live updates, initialized with static data
    let liveStats = {
        views: post.views || 0,
        likes: post.likes || 0,
        comments: post.comments || 0
    };

    let unsubscribe = () => {};

    onMount(() => {
        if (!post || !post.id) {
            console.warn("RelatedPostCard is missing a post object with an ID.", post);
            return;
        }

        const postDocRef = doc(db, 'pages', post.id);
        unsubscribe = onSnapshot(postDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                liveStats = {
                    views: data.articleViews || 0,
                    likes: data.articleLikes || 0,
                    comments: data.articleComments || 0,
                };
            }
        });
    });

    onDestroy(() => {
        unsubscribe();
    });

    // Helper functions are now passed down from the parent
    export let formatNumber = (num) => num;
    export let getGradientOverlay = () => '';

</script>

<!-- This HTML is a direct copy from your RelatedPosts.svelte file -->
<li>
    <a href={post.url} class="vnk-related-card">
        <img 
            src={post.imageUrl} 
            alt={post.title} 
            class="vnk-related-card__image"
            loading="lazy"
            decoding="async"
        />
        <div class="vnk-related-card__overlay" style="background-image: {getGradientOverlay()}"></div>
        
        <div class="vnk-related-card__text-content">
            {#if post.category}
                <span class="vnk-related-card__meta-info">{post.category}</span>
            {/if}
            <span class="vnk-related-card__title-link">{post.title}</span>
            
            <div class="vnk-related-card__stats">
                <!-- This section now uses the 'liveStats' variable -->
                {#if liveStats.views !== undefined}
                <span class="vnk-related-card__stat-item">
                    <i class="icon-view"></i>
                    {formatNumber(liveStats.views)}
                </span>
                {/if}
                {#if liveStats.likes !== undefined}
                <span class="vnk-related-card__stat-item">
                    <i class="icon-like"></i>
                    {formatNumber(liveStats.likes)}
                </span>
                {/if}
                {#if liveStats.comments !== undefined}
                <span class="vnk-related-card__stat-item">
                    <i class="icon-comment"></i>
                    {liveStats.comments}
                </span>
                {/if}
            </div>
        </div>
    </a>
</li>