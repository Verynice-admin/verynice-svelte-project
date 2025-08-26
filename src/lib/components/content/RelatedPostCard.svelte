<!-- In src/lib/components/content/RelatedPostCard.svelte (UPGRADED) -->

<script>
    import { onMount, onDestroy } from 'svelte';
    import { doc, getDoc, onSnapshot } from 'firebase/firestore';
    import { db } from '$lib/services/firebase.js';

    /** @type {object | string} */
    export let post;
    /** @type {'posts' | 'pages'} */
    export let collectionPath = 'posts';
    export let formatNumber = (num) => num;
    export let getGradientOverlay = () => '';

    let postData = null;
    let isLoading = true;
    let error = null;
    let unsubscribe = () => {};

    onMount(async () => {
        let postId;
        if (typeof post === 'object' && post !== null) {
            postData = post;
            postId = post.id;
        } else if (typeof post === 'string') {
            postId = post;
        } else {
            error = "Invalid post data provided.";
            isLoading = false;
            return;
        }

        if (!postId) {
            // This case handles full objects from the seeder that might not have an `id` field yet.
            // We assume the object is complete and won't set up a listener.
            if (postData) {
                isLoading = false;
                return;
            }
            error = "No post ID found.";
            isLoading = false;
            return;
        }

        if (!postData) {
            try {
                const docRef = doc(db, collectionPath, postId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    postData = { id: docSnap.id, ...docSnap.data() };
                } else {
                    error = "Post not found.";
                }
            } catch (e) {
                error = "Could not load post.";
            }
        }

        if (postData) {
            const postDocRef = doc(db, collectionPath, postId);
            unsubscribe = onSnapshot(postDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    postData = { ...postData, ...docSnap.data() };
                }
            });
        }
        
        isLoading = false;
    });

    onDestroy(() => {
        unsubscribe();
    });

    $: imageUrl = postData?.heroImagePublicId
        ? `https://res.cloudinary.com/verynice/image/upload/c_fill,w_320,h_450,q_auto,f_auto/${postData.heroImagePublicId}`
        : '';
        
    $: url = postData?.id ? `/${collectionPath}/${postData.id}` : '#';

</script>

{#if isLoading}
    <li class="vnk-related-card--loading"></li>
{:else if postData}
    <li>
        <a href={url} class="vnk-related-card">
            <img 
                src={imageUrl} 
                alt={postData.title} 
                class="vnk-related-card__image"
                loading="lazy"
                decoding="async"
            />
            <div class="vnk-related-card__overlay" style="background-image: {getGradientOverlay()}"></div>
            
            <div class="vnk-related-card__text-content">
                {#if postData.category}
                    <span class="vnk-related-card__meta-info">{postData.category}</span>
                {/if}
                <span class="vnk-related-card__title-link">{postData.title}</span>
                
                <div class="vnk-related-card__stats">
                    {#if postData.articleViews !== undefined}
                    <span class="vnk-related-card__stat-item">
                        <i class="icon-view"></i>
                        {formatNumber(postData.articleViews)}
                    </span>
                    {/if}
                    {#if postData.articleLikes !== undefined}
                    <span class="vnk-related-card__stat-item">
                        <i class="icon-like"></i>
                        {formatNumber(postData.articleLikes)}
                    </span>
                    {/if}
                    {#if postData.articleComments !== undefined}
                    <span class="vnk-related-card__stat-item">
                        <i class="icon-comment"></i>
                        {postData.articleComments}
                    </span>
                    {/if}
                </div>
            </div>
        </a>
    </li>
{:else}
    <li class="vnk-related-card--error">
        <p>{error || 'Could not load post.'}</p>
    </li>
{/if}

<style>
    .vnk-related-card--loading, .vnk-related-card--error {
        background-color: var(--background-color-darker);
        border: 1px solid var(--border-color);
        border-radius: var(--vnk-border-radius-lg);
        min-height: 400px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary-color);
    }
</style>