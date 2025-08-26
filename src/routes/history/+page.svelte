<!-- src/routes/history/+page.svelte (UPDATED TO USE CENTRAL UTILITIES) -->

<script>
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import { doc, onSnapshot } from 'firebase/firestore';
    import { db } from '$lib/services/firebase.js';

    // --- THIS IS THE IMPROVEMENT ---
    // We now import the central, reusable function instead of defining it locally.
    import { getCloudinaryUrl } from '$lib/utils/cloudinary.js';
    
    import KeyFacts from '$lib/components/content/KeyFacts.svelte';
    import AuthorInfo from '$lib/components/content/AuthorInfo.svelte';
    import VideoEmbed from '$lib/components/content/VideoEmbed.svelte';
    import PhotoGallery from '$lib/components/content/PhotoGallery.svelte';
    import RelatedPosts from '$lib/components/content/RelatedPosts.svelte';
    import AsideToc from '$lib/components/navigation/AsideToc.svelte';
    import TimeWeather from '$lib/features/time-weather/TimeWeather.svelte';
    import BackToTop from '$lib/components/ui-elements/BackToTop.svelte';
    import Comments from '$lib/components/content/Comments.svelte';
    import Map from '$lib/components/content/Map.svelte';
    
    /** @type {import('./$types').PageData} */
    export let data;

    let pageData = data.page;
    $: pageData = data.page;

    let unsubscribe = () => {};

    onMount(() => {
        if (browser && data.page) {
            const pageDocRef = doc(db, 'pages', 'historyPage');
            unsubscribe = onSnapshot(pageDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    pageData = { ...pageData, ...docSnap.data() };
                }
            });
        }
    });

    onDestroy(() => {
        unsubscribe();
    });

    // The local getCloudinaryUrl function has been removed.
</script>

<svelte:head>
    <title>{pageData?.seo?.title || 'History | VeryNice'}</title>
    <meta name="description" content={pageData?.seo?.description || 'Learn about the rich history of Kazakhstan.'}>
    <meta name="keywords" content={pageData?.seo?.keywords}>
</svelte:head>


{#if pageData}
    <div class="section" id="page-hero-section">
        <div class="section-header wrapper">
            <nav aria-label="Breadcrumb">
                <span><a href="/">Home</a></span><span>»</span><span>History</span>
            </nav>
            <div class="section-header-content-row">
                <div class="section-header-text">
                    <h1 itemprop="headline">{pageData.mainTitle}</h1>
                    <p class="section-description" itemprop="description">{pageData.headerDescription}</p>
                    <div class="post-info">
                        {#if pageData.location}<div class="post-info-inner"><span class="icon-location" aria-hidden="true"></span><div class="post-info-content">{pageData.location}</div></div>{/if}
                        {#if pageData.articleViews}<div class="post-info-inner"><span class="icon-view" aria-hidden="true"></span><div class="post-info-content">{pageData.articleViews.toLocaleString()}</div></div>{/if}
                        {#if pageData.articleComments !== undefined}<div class="post-info-inner"><span class="icon-comment" aria-hidden="true"></span><div class="post-info-content">{pageData.articleComments.toLocaleString()}</div></div>{/if}
                        {#if pageData.articleLikes !== undefined}<div class="post-info-inner"><span class="icon-like" aria-hidden="true"></span><div class="post-info-content">{pageData.articleLikes.toLocaleString()}</div></div>{/if}
                    </div>
                </div>
                <div class="section-header-toc">
                    <h2 class="visually-hidden">Page Sections (Hero)</h2>
                    <div class="toc-wrapper">
                        {#each data.sections as section}
                            <div class="toc-item"><a href="#{section.sectionId}">{section.title}</a></div>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
        {#if pageData.headerBackgroundPublicId}
            <div class="header-background">
                <!-- This now calls the imported helper function -->
                <div class="background-image" style="background-image: url({getCloudinaryUrl(pageData.headerBackgroundPublicId, { width: 1920, crop: 'fill' })})" aria-label={pageData.headerBackgroundImageAriaLabel}></div>
            </div>
        {/if}
    </div>

    <article class="wrapper article" itemprop="mainEntity" itemscope itemtype="https://schema.org/Article">
        
        <aside class="vnk-time-weather-sidebar additional-content vnk-sidebar-card">
          <TimeWeather />
        </aside>

        <div class="main-column-content">
            <main class="content-section" itemprop="articleBody">
                {#each data.sections as section (section.id)}
                    <section id={section.sectionId} class="history-section-spacing" aria-labelledby={section.id + '-title'}>
                        <h2 id={section.id + '-title'} class="history-section-title">{section.title}</h2>
                        <div class="prose">{@html section.contentHTML}</div>
                        {#if section.images && section.images.length > 0}
                            <div class="section-images">
                                {#each section.images as image (image.publicId)}
                                    <figure>
                                        <img src={getCloudinaryUrl(image.publicId)} alt={image.alt} loading="lazy" decoding="async">
                                        <figcaption>{image.captionName} ({image.captionSource})</figcaption>
                                    </figure>
                                {/each}
                            </div>
                        {/if}
                    </section>
                {/each}
            </main>
            
            {#if pageData.videoUrl}
                <VideoEmbed title={pageData.videoTitle} url={pageData.videoUrl} />
            {/if}

            {#if pageData.mapCoordinates}
                <Map title="Location on Map" coordinates={pageData.mapCoordinates} />
            {/if}

            {#if pageData.faqSection}
                <section class="themed-content-block">
                    <div class="additional-content-header">
                        <h2>{pageData.faqTitle || 'Frequently Asked Questions'}</h2>
                    </div>
                    <div class="faq-list">
                        {#each pageData.faqSection as faqItem}
                            <details class="faq-item">
                                <summary>{faqItem.question}</summary>
                                <div class="faq-answer">{@html faqItem.answer}</div>
                            </details>
                        {/each}
                    </div>
                </section>
            {/if}

            <AuthorInfo 
                author={data.author} 
                labels={pageData.labels} 
                engagementData={{likes: pageData.articleLikes}} 
                postId="historyPage"
            />
            
            {#if pageData.photoGallery}
                <PhotoGallery title={pageData.photoGalleryTitle} photos={pageData.photoGallery} />
            {/if}
            
            <Comments postId="historyPage" />

            {#if pageData.relatedPosts}
                 <!-- Your correct implementation is preserved -->
                 <RelatedPosts 
                    title={pageData.relatedPostsTitle} 
                    posts={pageData.relatedPosts}
                    collectionPath="pages"
                />
            {/if}
        </div>
        
        <aside class="additional-content spec">
            {#if pageData.keyFacts}
                <KeyFacts title={pageData.keyFactsTitle} facts={pageData.keyFacts} />
            {/if}
        </aside>

    </article>

    <div class="additional-block">
        <AsideToc sections={data.sections} />
        <BackToTop />
    </div>

{:else if data.error}
    <div class="error-message">
        <h1>Oops! Something went wrong.</h1>
        <p>{data.error}</p>
    </div>
{/if}

<!-- Your entire <style> block is preserved and untouched -->
<style>
    /* Scoped styles for this page only */
    .section-images {
        margin: var(--vnk-spacing-lg) 0;
        display: grid;
        gap: var(--vnk-spacing-md);
    }
    .section-images figure {
        margin: 0;
        padding: 0;
    }
    .section-images img {
        display: block;
        width: 100%;
        height: auto;
        border-radius: var(--vnk-border-radius-md);
        box-shadow: var(--vnk-shadow-depth);
    }
    .section-images figcaption {
        display: block;
        margin-top: var(--vnk-spacing-sm);
        text-align: center;
        font-size: 0.9em;
        font-style: italic;
        color: var(--vnk-text-secondary-color);
        line-height: 1.5;
        padding: 0 var(--vnk-spacing-sm);
    }
    .faq-list {
        display: flex;
        flex-direction: column;
        gap: var(--vnk-spacing-sm);
    }
    .faq-item {
        border-bottom: 1px solid var(--vnk-card-border-color);
        padding-bottom: var(--vnk-spacing-sm);
    }
    .faq-item:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }
    summary {
        color: var(--vnk-text-primary-color);
        font-size: 1.1rem;
        font-weight: 600;
        padding: var(--vnk-spacing-sm) 35px var(--vnk-spacing-sm) 0;
        cursor: pointer;
        list-style: none;
        position: relative;
        transition: color 0.3s ease;
    }
    summary::-webkit-details-marker { display: none; }
    summary:hover, .faq-item[open] > summary { color: var(--vnk-text-accent-color); }
    summary::after { content: '+'; position: absolute; right: 0; top: 50%; transform: translateY(-50%); font-size: 1.5rem; color: var(--vnk-text-accent-color); transition: transform 0.2s ease-in-out; font-weight: 300; }
    .faq-item[open] > summary::after { transform: translateY(-50%) rotate(45deg); }
    .faq-item[open] > summary { margin-bottom: var(--vnk-spacing-md); }
    .faq-answer { color: var(--vnk-text-secondary-color); padding: 0 0 0 var(--vnk-spacing-xs); line-height: 1.7; }
    .faq-answer :global(img) { display: block; max-width: 100%; height: auto; margin: var(--vnk-spacing-md) auto; border-radius: var(--vnk-border-radius-md); box-shadow: var(--vnk-shadow-depth); }
    .error-message { text-align: center; padding: var(--vnk-spacing-xl); margin: var(--vnk-spacing-xl) auto; max-width: 600px; background: var(--vnk-card-bg); border-radius: var(--vnk-border-radius-lg); }
    .prose :global(img) {
        display: block;
        width: 100%;
        max-height: 500px;
        aspect-ratio: 16 / 9;
        object-fit: cover;
        margin: var(--vnk-spacing-lg) 0;
        border-radius: var(--vnk-border-radius-md);
        box-shadow: var(--vnk-shadow-depth);
    }
</style>