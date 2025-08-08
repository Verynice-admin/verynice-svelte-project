<!-- src/routes/+page.svelte (FINAL, CORRECTED CONTENT) -->
<script>
    import RelatedPosts from '$lib/components/content/RelatedPosts.svelte';
    import { getCloudinaryUrl } from '$lib/utils/cloudinary.js';
    
    /** @type {import('./$types').PageData} */
    export let data;
</script>

<svelte:head>
    <title>VeryNice.kz — A Travel Portal for True Explorers</title>
    <meta name="description" content={data.homepageContent?.heroSubtitle} />
</svelte:head>

<!-- ======================================================================= -->
<!--                   MAIN PAGE CONTENT STARTS HERE                       -->
<!-- Your existing header and logo from +layout.svelte will appear above this. -->
<!-- ======================================================================= -->

{#if data.homepageContent}
    <!-- 1. Hero Section (Styled like your History page hero) -->
    <div class="section">
        <div class="section-header wrapper">
            <div class="section-header-text" style="align-items: center; text-align: center;">
                <h1>{data.homepageContent.heroTitle}</h1>
                <p class="section-description">{data.homepageContent.heroSubtitle}</p>
                
                <!-- Search Form (as seen on iskatel.com) -->
                <form role="search" method="get" class="search-form" action="/search">
                    <input 
                        class="text" 
                        type="text" 
                        name="q" 
                        placeholder={data.homepageContent.heroSearchPlaceholder || 'Search...'}
                    />
                    <input class="submit" type="submit" value={data.homepageContent.heroSearchButtonText || 'Find'} />
                </form>
            </div>
        </div>
        {#if data.homepageContent.heroBackgroundPublicId}
            <div class="header-background">
                <div class="background-image" style="background-image: url({getCloudinaryUrl(data.homepageContent.heroBackgroundPublicId)})"></div>
            </div>
        {/if}
    </div>

    <!-- 2. Dynamically Rendered Sections -->
    <div class="wrapper">
        {#if data.sections && data.sections.length > 0}
            {#each data.sections as section}
                {#if section.posts && section.posts.length > 0}
                    <section class="content-section">
                        <div class="subheader">
                            <h2 class="section-title">{section.title}</h2>
                            <span class="subheader-line"></span>
                        </div>
                        <!-- Reuse the RelatedPosts component for the slider -->
                        <RelatedPosts posts={section.posts} />
                    </section>
                {/if}
            {/each}
        {/if}
    </div>

{:else if data.error}
    <div class="error-message">
        <h1>Oops! Something went wrong.</h1>
        <p>{data.error}</p>
    </div>
{/if}

<!-- ======================================================================= -->
<!--                   MAIN PAGE CONTENT ENDS HERE                         -->
<!-- Your existing footer from +layout.svelte will appear below this.      -->
<!-- ======================================================================= -->

<style>
    .content-section {
        padding-top: 4rem;
        padding-bottom: 2rem;
    }
    .subheader {
        margin-bottom: var(--vnk-spacing-xl);
        text-align: center;
    }
    .section-title {
        font-size: clamp(1.6rem, 4vw, 2.3rem);
        color: var(--vnk-text-primary-color);
        display: inline-block;
        position: relative;
    }
    .subheader-line {
        display: block;
        margin: var(--vnk-spacing-sm) auto 0;
        width: 80px;
        height: 3px;
        background: var(--vnk-accent-color);
        border-radius: 2px;
    }

    /* Styles for the search form in the hero */
    .search-form {
        display: flex;
        width: 100%;
        max-width: 600px;
        margin-top: var(--vnk-spacing-lg);
    }
    .search-form .text {
        flex-grow: 1;
        background-color: rgba(255, 255, 255, 0.9);
        border: 1px solid transparent;
        color: var(--vnk-bg-gradient-start);
        font-family: var(--vnk-font-secondary);
        font-size: 1.1rem;
        padding: var(--vnk-spacing-md);
        border-radius: var(--vnk-border-radius-sm) 0 0 var(--vnk-border-radius-sm);
    }
     .search-form .text::placeholder {
        color: #555;
     }
    .search-form .submit {
        background-color: var(--vnk-accent-color);
        border: 1px solid var(--vnk-accent-color);
        color: var(--vnk-bg-gradient-start);
        cursor: pointer;
        font-family: var(--vnk-font-primary);
        font-size: 1.1rem;
        font-weight: 700;
        padding: var(--vnk-spacing-md) var(--vnk-spacing-lg);
        text-transform: uppercase;
        border-radius: 0 var(--vnk-border-radius-sm) var(--vnk-border-radius-sm) 0;
        transition: all 0.3s ease;
    }
    .search-form .submit:hover {
        background-color: #39dff8;
    }
    .error-message { text-align: center; padding: 4rem; }
</style>