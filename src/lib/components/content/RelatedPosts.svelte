<!-- src/lib/components/content/RelatedPosts.svelte (UPDATED TO USE CENTRAL CLOUDINARY UTILITY) -->

<script>
    import { onMount, onDestroy } from 'svelte';
    import { doc, onSnapshot } from 'firebase/firestore';
    import { db } from '$lib/services/firebase.js';
    // --- THIS IS THE KEY CHANGE ---
    // Import the central utility function.
    import { getCloudinaryUrl } from '$lib/utils/cloudinary.js';

    /** @type {string} */
    export let title = 'You May Also Be Interested In';

    /** @type {Array<any>} */
    export let posts = [];
    
    /** @type {'posts' | 'pages'} */
    export let collectionPath = 'posts';

    let liveData = new Map();
    let unsubscribers = [];
    let processedPosts = [];

    onMount(() => {
        processedPosts = posts.map(post => {
            if (typeof post === 'string') {
                return { id: post, title: 'Loading...', url: `/${collectionPath}/${post}` };
            }
            return post;
        });

        processedPosts.forEach(post => {
            if (post && post.id) {
                const postDocRef = doc(db, collectionPath, post.id);
                
                const unsubscribe = onSnapshot(postDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        liveData.set(post.id, {
                            ...post,
                            ...data,
                            // Ensure stat fields have consistent names
                            views: data.articleViews,
                            likes: data.articleLikes,
                            comments: data.articleComments,
                        });
                        liveData = liveData; // Trigger Svelte's reactivity
                    }
                });
                
                unsubscribers.push(unsubscribe);
            }
        });
    });

    onDestroy(() => {
        unsubscribers.forEach(unsub => unsub());
    });

    function formatNumber(num) {
        if (num === null || num === undefined) return 0;
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num;
    }

    function getGradientOverlay(color1 = 'rgba(0,0,0,0)', color2 = 'rgba(0,0,0,0.8)') {
        return `linear-gradient(to top, ${color2} 20%, ${color1} 80%)`;
    }
</script>

{#if processedPosts && processedPosts.length > 0}
    <section class="themed-content-block">
        <div class="additional-content-header">
            <h2>{title}</h2>
        </div>

        <ul id="vnk-also-interested-container" class="vnk-related-grid">
            {#each processedPosts as post (post.id)}
                {@const displayData = liveData.get(post.id) || post}
                <li>
                    <a href={displayData.url} class="vnk-related-card">
                        <!-- --- THIS IS THE KEY CHANGE --- -->
                        <!-- The src attribute now calls the imported getCloudinaryUrl utility -->
                        <img 
                            src={getCloudinaryUrl(displayData.heroImagePublicId, { width: 320, height: 450, crop: 'fill' })} 
                            alt={displayData.title} 
                            class="vnk-related-card__image"
                            loading="lazy"
                            decoding="async"
                        />
                        <div class="vnk-related-card__overlay" style="background-image: {getGradientOverlay()}"></div>
                        
                        <div class="vnk-related-card__text-content">
                            {#if displayData.category}
                                <span class="vnk-related-card__meta-info">{displayData.category}</span>
                            {/if}
                            <span class="vnk-related-card__title-link">{displayData.title}</span>
                            
                            <div class="vnk-related-card__stats">
                                {#if displayData.views !== undefined}
                                <span class="vnk-related-card__stat-item">
                                    <i class="icon-view"></i>
                                    {formatNumber(displayData.views)}
                                </span>
                                {/if}
                                {#if displayData.likes !== undefined}
                                <span class="vnk-related-card__stat-item">
                                    <i class="icon-like"></i>
                                    {formatNumber(displayData.likes)}
                                </span>
                                {/if}
                                {#if displayData.comments !== undefined}
                                <span class="vnk-related-card__stat-item">
                                    <i class="icon-comment"></i>
                                    {displayData.comments}
                                </span>
                                {/if}
                            </div>
                        </div>
                    </a>
                </li>
            {/each}
        </ul>
    </section>
{/if}

<!-- Your entire <style> block is completely untouched -->
<style>
    #vnk-also-interested-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: var(--vnk-spacing-md);
        list-style: none;
        padding: 0;
        margin: 0;
    }
    .vnk-related-card {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        position: relative;
        overflow: hidden;
        border-radius: var(--vnk-border-radius-md);
        aspect-ratio: 9 / 11;
        text-decoration: none;
        color: var(--vnk-text-primary-color);
        box-shadow: var(--vnk-shadow-depth);
        transition: transform 0.3s ease;
    }
    .vnk-related-card:hover {
        transform: translateY(-5px);
    }
    .vnk-related-card__image {
        position: absolute;
        top: 0; left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 1;
        transition: transform 0.4s ease;
    }
    .vnk-related-card:hover .vnk-related-card__image {
        transform: scale(1.05);
    }
    .vnk-related-card__overlay {
        position: absolute;
        top: 0; left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
    }
    .vnk-related-card__text-content {
        position: relative;
        z-index: 3;
        padding: var(--vnk-spacing-md);
    }
    .vnk-related-card__meta-info {
        font-size: 0.8em;
        font-weight: 700;
        color: var(--vnk-text-primary-color);
        opacity: 0.7;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: var(--vnk-spacing-xs);
    }
    .vnk-related-card__title-link {
        font-size: 1.1em;
        font-weight: 700;
        color: #fff;
        line-height: 1.3;
        margin-bottom: var(--vnk-spacing-sm);
        text-decoration: none;
        text-shadow: 0 1px 3px rgba(0,0,0,0.5);
    }
    .vnk-related-card:hover .vnk-related-card__title-link {
        color: var(--vnk-text-accent-color);
    }
    .vnk-related-card__stats {
        display: flex;
        flex-wrap: wrap;
        gap: var(--vnk-spacing-md);
        align-items: center;
        font-size: 0.85em;
        color: #fff;
        opacity: 0.9;
        text-shadow: 0 1px 2px rgba(0,0,0,0.7);
    }
    .vnk-related-card__stat-item {
        display: flex;
        align-items: center;
        gap: var(--vnk-spacing-xs);
    }
    .vnk-related-card__stat-item i {
        display: inline-block;
        width: 16px;
        height: 16px;
        background-color: currentColor;
    }
    /* ... your icon styles ... */
</style>