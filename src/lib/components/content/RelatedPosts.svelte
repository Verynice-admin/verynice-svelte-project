<!-- src/lib/components/content/RelatedPosts.svelte (UPDATED WITH REAL-TIME LOGIC) -->

<script>
    // --- [THE FIX IS HERE]: Import Svelte and Firebase modules ---
    import { onMount, onDestroy } from 'svelte';
    import { doc, onSnapshot } from 'firebase/firestore';
    import { db } from '$lib/services/firebase.js';

    /** @type {string} */
    export let title = 'You May Also Be Interested In';

    /** @type {Array<{id: string, title: string, url: string, imageUrl: string, category: string, views: number, likes: number, comments: number}>} */
    export let posts = [];

    // --- [THE FIX IS HERE]: A state variable to hold the live data ---
    // We use a Map for efficient lookups by post ID.
    let liveStats = new Map();

    // --- [THE FIX IS HERE]: An array to hold all our listener cleanup functions ---
    let unsubscribers = [];

    onMount(() => {
        // For each post passed in as a prop...
        posts.forEach(post => {
            if (post && post.id) {
                // ...create a reference to its document in Firestore...
                const postDocRef = doc(db, 'pages', post.id);
                
                // ...and create a real-time listener for it.
                const unsubscribe = onSnapshot(postDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        // Update the map with the latest stats for this specific post
                        liveStats.set(post.id, {
                            views: data.articleViews || 0,
                            likes: data.articleLikes || 0,
                            comments: data.articleComments || 0,
                        });
                        liveStats = liveStats; // Trigger Svelte's reactivity
                    }
                });
                
                // Store the cleanup function so we can call it later
                unsubscribers.push(unsubscribe);
            }
        });
    });

    // When the component is destroyed, clean up all the listeners to prevent memory leaks
    onDestroy(() => {
        unsubscribers.forEach(unsub => unsub());
    });


    // --- Your original helper functions remain completely untouched ---
    function formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num;
    }

    function getGradientOverlay(color1 = 'rgba(0,0,0,0)', color2 = 'rgba(0,0,0,0.8)') {
        return `linear-gradient(to top, ${color2} 20%, ${color1} 80%)`;
    }
</script>

{#if posts && posts.length > 0}
    <section class="themed-content-block">
        <div class="additional-content-header">
            <h2>{title}</h2>
        </div>

        <ul id="vnk-also-interested-container">
            {#each posts as post (post.url)}
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
                                <!-- --- [THE FIX IS HERE]: This section now gets data from the liveStats Map --- -->
                                {#if liveStats.get(post.id) || post.views}
                                <span class="vnk-related-card__stat-item">
                                    <i class="icon-view"></i>
                                    {formatNumber(liveStats.get(post.id)?.views ?? post.views)}
                                </span>
                                {/if}
                                {#if liveStats.get(post.id) || post.likes}
                                <span class="vnk-related-card__stat-item">
                                    <i class="icon-like"></i>
                                    {formatNumber(liveStats.get(post.id)?.likes ?? post.likes)}
                                </span>
                                {/if}
                                {#if liveStats.get(post.id) || post.comments}
                                <span class="vnk-related-card__stat-item">
                                    <i class="icon-comment"></i>
                                    {liveStats.get(post.id)?.comments ?? post.comments}
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
    .vnk-related-card {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        position: relative;
        overflow: hidden;
        border-radius: var(--vnk-border-radius-md);
        aspect-ratio: 16 / 11;
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
        opacity: 0.7; /* Make it slightly transparent */
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
        background-color: rgba(255, 255, 255, 0.7);
        transition: background-color 0.3s ease;
    }

    .vnk-related-card:hover .vnk-related-card__stat-item i.icon-like {
        background-color: var(--vnk-text-accent-color);
    }
    
    .icon-view {
        -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 576 512'%3E%3Cpath fill='black' d='M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 79.7 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-79.7-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80s-80 35.8-80 80s35.8 80 80 80z'/%3E%3C/svg%3E");
        mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 576 512'%3E%3Cpath fill='black' d='M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 79.7 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-79.7-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80s-80 35.8-80 80s35.8 80 80 80z'/%3E%3C/svg%3E");
    }

    .icon-like {
        -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='black' d='M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.4-25.6c-8.1-5.4-17.4-8.9-27.3-10.9v-6.6c15.6-13.5 25-32.5 25-53.7c0-1.5-.1-3-.2-4.5c.9-1.2 1.8-2.4 2.7-3.6c1-.8 2.1-1.6 3.2-2.4c13.2-10.1 21.2-25.2 21.2-41.4c0-2.3-.1-4.6-.4-6.8c.8-1.4 1.5-2.8 2.2-4.2c12.5-26.3 16.8-56.2 14.3-86.4l-2.2-26.8c-5.2-26-30.5-42.9-56.5-37.7zM32 192H96c17.7 0 32 14.3 32 32V448c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32z'/%3E%3C/svg%3E");
        mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='black' d='M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.4-25.6c-8.1-5.4-17.4-8.9-27.3-10.9v-6.6c15.6-13.5 25-32.5 25-53.7c0-1.5-.1-3-.2-4.5c.9-1.2 1.8-2.4 2.7-3.6c1-.8 2.1-1.6 3.2-2.4c13.2-10.1 21.2-25.2 21.2-41.4c0-2.3-.1-4.6-.4-6.8c.8-1.4 1.5-2.8 2.2-4.2c12.5-26.3 16.8-56.2 14.3-86.4l-2.2-26.8c-5.2-26-30.5-42.9-56.5-37.7zM32 192H96c17.7 0 32 14.3 32 32V448c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32z'/%3E%3C/svg%3E");
    }

    .icon-comment {
        -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='black' d='M512 240c0 114.9-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6C73.6 471.1 44.7 480 16 480c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4l0 0 0 0 0 0 0 0 .1-.1zM256 0C114.6 0 0 103.1 0 231c0 45.4 12.1 87.8 33.6 124.8c11.2-8.1 28.2-17.5 48.2-27.5c-4.3-11.7-6.8-24.2-6.8-37.3c0-114.9 114.6-208 256-208s256 93.1 256 208s-114.6 208-256 208c-20.3 0-40-2.5-58.5-7.1c-15.9 12.3-34.9 22.3-54.8 29.8c21.4 8.9 44.5 13.9 68.3 13.9c141.4 0 256-103.1 256-231S397.4 0 256 0z'/%3E%3C/svg%3E");
        mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='black' d='M512 240c0 114.9-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6C73.6 471.1 44.7 480 16 480c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4l0 0 0 0 0 0 0 0 .1-.1zM256 0C114.6 0 0 103.1 0 231c0 45.4 12.1 87.8 33.6 124.8c11.2-8.1 28.2-17.5 48.2-27.5c-4.3-11.7-6.8-24.2-6.8-37.3c0-114.9 114.6-208 256-208s256 93.1 256 208s-114.6 208-256 208c-20.3 0-40-2.5-58.5-7.1c-15.9 12.3-34.9 22.3-54.8 29.8c21.4 8.9 44.5 13.9 68.3 13.9c141.4 0 256-103.1 256-231S397.4 0 256 0z'/%3E%3C/svg%3E");
    }
</style>