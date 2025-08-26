<!-- In src/routes/+page.svelte (NOW USING THE CENTRAL UTILITY) -->
<script>
  import RelatedPosts from '$lib/components/content/RelatedPosts.svelte';
  import VideoEmbed from '$lib/components/content/VideoEmbed.svelte';
  // Correctly import the central utility
  import { getCloudinaryUrl } from '$lib/utils/cloudinary.js';

  /** @type {import('./$types').PageData} */
  export let data;
  
  const { homepage, sliders } = data;

  // Use the central utility to build the hero image URL
  const heroImageUrl = getCloudinaryUrl(homepage.heroImagePublicId, {
    width: 1920,
    crop: 'fill',
    gravity: 'center'
  });
</script>

<svelte:head>
  <title>{homepage.title}</title>
  <meta name="description" content={homepage.metaDescription} />
</svelte:head>

<div class="section" id="page-hero-section">
    <div class="section-header wrapper">
        <div class="section-header-text">
            <h1>{homepage.heroTitle}</h1>
            <p class="section-description">{homepage.heroSubtitle}</p>
            <form role="search" method="get" class="search-form" action="/search">
                <input class="text" type="text" name="q" placeholder="Search for places, attractions..." />
                <input class="submit" type="submit" value="Find" />
            </form>
        </div>
    </div>
    <div class="header-background">
        <div class="background-image" style="background-image: url({heroImageUrl})"></div>
    </div>
</div>

<div class="wrapper article">
    <div class="main-column-content">
        {#if sliders.newPosts?.length > 0}
          <RelatedPosts title="Latest Articles" posts={sliders.newPosts} collectionPath="posts" />
        {/if}
        {#if homepage.featuredVideoUrl}
            <VideoEmbed title="Featured Video" url={homepage.featuredVideoUrl} />
        {/if}
        {#if sliders.attractionsPosts?.length > 0}
          <RelatedPosts title="Top Attractions" posts={sliders.attractionsPosts} collectionPath="posts" />
        {/if}
        <!-- ... and so on for other sliders -->
    </div>
</div>

<style>
    /* --- Homepage Hero Search Form --- */
    .search-form {
        display: flex;
        max-width: 600px;
        margin: 2rem auto 0;
        box-shadow: var(--vnk-shadow-depth);
    }

    .search-form .text {
        flex-grow: 1;
        background-color: rgba(var(--vnk-accent-rgb), .05);
        border: 1px solid var(--vnk-card-border-color);
        color: var(--vnk-text-primary-color);
        font-family: var(--vnk-font-secondary);
        font-size: 1.1rem;
        outline: 0;
        padding: var(--vnk-spacing-md);
        border-radius: var(--vnk-border-radius-sm) 0 0 var(--vnk-border-radius-sm);
        transition: border-color .3s ease, box-shadow .3s ease;
    }

    .search-form .text::placeholder {
        color: var(--vnk-text-secondary-color);
        opacity: 1;
    }

    .search-form .text:focus {
        border-color: var(--vnk-accent-color);
        box-shadow: var(--vnk-shadow-neon-sm);
    }

    .search-form .submit {
        border: none;
        cursor: pointer;
        transition: background-color 0.3s ease;
        padding: 0 var(--vnk-spacing-xl);
        font-size: 1.1rem;
        font-weight: 700;
        font-family: var(--vnk-font-primary);
        background-color: var(--vnk-accent-color);
        color: var(--vnk-text-primary-color);
        border-radius: 0 var(--vnk-border-radius-sm) var(--vnk-border-radius-sm) 0;
    }

    .search-form .submit:hover {
        background-color: #08d9f9;
    }

    /* --- Responsive styles for mobile phones --- */
    @media (max-width: 768px) {
        .search-form {
            flex-direction: column;
            gap: 1rem;
        }
        
        .search-form .text {
            border-radius: var(--vnk-border-radius-sm);
            text-align: center;
        }
        
        .search-form .submit {
            border-radius: var(--vnk-border-radius-sm);
            padding: var(--vnk-spacing-md);
        }
    }
</style>