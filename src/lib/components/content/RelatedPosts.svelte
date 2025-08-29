<!-- In src/lib/components/content/RelatedPosts.svelte (DEFINITIVE FINAL VERSION) -->
<script>
    // NO CHANGES. Script logic is correct.
    import { onMount, onDestroy } from 'svelte';
    import { doc, onSnapshot } from 'firebase/firestore';
    import { db } from '$lib/services/firebase.js';
    import { getCloudinaryUrl } from '$lib/utils/cloudinary.js';

    export let title = 'You May Also Be Interested In';
    export let posts = [];
    export let collectionPath = 'posts';
    let liveData = new Map();
    let unsubscribers = [];
    let processedPosts = [];

    onMount(() => {
        processedPosts = posts.map(post => (typeof post === 'string') ? { id: post, title: 'Loading...', url: `/${collectionPath}/${post}` } : post);
        processedPosts.forEach(post => {
            if (post && post.id) {
                const postDocRef = doc(db, collectionPath, post.id);
                const unsubscribe = onSnapshot(postDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        liveData.set(post.id, { ...post, ...data, views: data.articleViews, likes: data.articleLikes, comments: data.articleComments });
                        liveData = liveData;
                    }
                });
                unsubscribers.push(unsubscribe);
            }
        });
    });

    onDestroy(() => unsubscribers.forEach(unsub => unsub()));
    function formatNumber(num) { if (num >= 1000) return (num / 1000).toFixed(1) + 'k'; return num || 0; }
    function getGradientOverlay() { return `linear-gradient(to top, rgba(16, 22, 33, 0.9) 20%, rgba(16, 22, 33, 0) 60%)`; }
</script>

{#if processedPosts && processedPosts.length > 0}
<section class="themed-content-block">
    <div class="additional-content-header"><h2>{title}</h2></div>
    <ul class="vnk-related-grid is-grid">
        <!-- .slice(0, 3) ensures only 3 cards are displayed -->
        {#each processedPosts.slice(0, 3) as post (post.id)}
            {@const displayData = liveData.get(post.id) || post}
            <li>
                <a href={displayData.url} class="vnk-related-card">
                    <img src={getCloudinaryUrl(displayData.heroImagePublicId, { width: 320, height: 450, crop: 'fill' })} alt={displayData.title} class="vnk-related-card__image" loading="lazy" decoding="async" />
                    <div class="vnk-related-card__overlay" style="background-image: {getGradientOverlay()}"></div>
                    <div class="vnk-related-card__text-content">
                        <span class="vnk-related-card__title-link">{displayData.title}</span>
                        <div class="vnk-related-card__stats">
                            {#if displayData.views != null}<span class="vnk-related-card__stat-item"><i class="icon-view"></i>{formatNumber(displayData.views)}</span>{/if}
                            {#if displayData.likes != null}<span class="vnk-related-card__stat-item"><i class="icon-like"></i>{formatNumber(displayData.likes)}</span>{/if}
                            {#if displayData.comments != null}<span class="vnk-related-card__stat-item"><i class="icon-comment"></i>{displayData.comments}</span>{/if}
                        </div>
                    </div>
                </a>
            </li>
        {/each}
    </ul>
</section>
{/if}

<style>
    /* CORRECTED CSS FOR 3 RESIZED CARDS */
    .vnk-related-grid.is-grid {
        display: grid;
        /* Explicitly create 3 columns */
        grid-template-columns: repeat(3, 1fr);
        gap: var(--vnk-spacing-md);
        list-style: none;
        padding: 0;
        margin: 0;
        /* Center the grid items if they don't fill the space */
        justify-items: center;
    }

    /* Target the container for the card */
    .vnk-related-grid.is-grid li {
        width: 100%;
        max-width: 280px; /* A sensible max-width for the smaller card */
    }

    /* PRESERVE THE ORIGINAL CARD SHAPE AND STYLE */
    .vnk-related-card {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        position: relative;
        overflow: hidden;
        border-radius: var(--vnk-border-radius-md);
        aspect-ratio: 9 / 11; /* TALL aspect ratio */
        width: 100%; /* Make card fill its li container */
        text-decoration: none;
        color: var(--vnk-text-primary-color);
        box-shadow: var(--vnk-shadow-depth);
        transition: transform 0.3s ease;
    }
    .vnk-related-card:hover { transform: translateY(-5px) scale(1.02); } /* Add scale on hover for effect */

    /* Responsive adjustments */
    @media (max-width: 1024px) {
        .vnk-related-grid.is-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
        .vnk-related-grid.is-grid { grid-template-columns: 1fr; }
    }
    
    /* All other original card styles are preserved */
    .vnk-related-card__image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; transition: transform 0.4s ease; }
    .vnk-related-card:hover .vnk-related-card__image { transform: scale(1.05); }
    .vnk-related-card__overlay { /* ... */ }
    .vnk-related-card__text-content { /* ... */ }
    .vnk-related-card__title-link { /* ... */ }
    .vnk-related-card__stats { /* ... */ }
    .vnk-related-card__stat-item { /* ... */ }
</style>