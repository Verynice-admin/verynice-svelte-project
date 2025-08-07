<!-- src/lib/components/content/PhotoGallery.svelte (IMPROVED) -->

<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { loadScript } from '$lib/utils/scriptLoader.js';

    /** @type {string} */
    export let title = 'Photo Gallery';
    
    /** @type {Array<{imageUrl: string, thumbnailUrl: string, altText: string, caption: string}>} */
    export let photos = [];

    let galleryContainer;

    onMount(async () => {
        if (browser && photos && photos.length > 0) {
            if (!galleryContainer) {
                console.error("Gallery container element not found on mount.");
                return;
            }
            try {
                // It's good practice to load jQuery first, then the plugin that depends on it.
                await loadScript('https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js');
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/fotorama/4.6.4/fotorama.js');

                if (window.jQuery && window.jQuery.fn.fotorama) {
                    const fotoramaData = photos.map(photo => ({
                        img: photo.imageUrl,
                        thumb: photo.thumbnailUrl,
                        caption: photo.caption,
                        alt: photo.altText
                    }));

                    // Initialize Fotorama with improved options
                    window.jQuery(galleryContainer).fotorama({
                        data: fotoramaData,
                        nav: 'thumbs',
                        allowfullscreen: true,
                        loop: true,
                        width: '100%',
                        ratio: '16/9',
                        thumbheight: 64,
                        // --- ACTION 1: ADD THESE TWO LINES ---
                        fit: 'cover',       // Ensures the main image fills the container
                        thumbfit: 'cover'   // Ensures the thumbnail images fill their container
                    });
                } else {
                    throw new Error("Fotorama function not found on window object.");
                }
            } catch (error) {
                console.error("Failed to initialize photo gallery:", error);
            }
        }
    });
</script>

<svelte:head>
    <!-- It's best practice to include the CSS for the library in the component that uses it -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/fotorama/4.6.4/fotorama.css" />
</svelte:head>

<section class="themed-content-block">
    <div class="additional-content-header">
        <h2>{title}</h2>
    </div>

    {#if photos && photos.length > 0}
        <!-- This div is intentionally left empty. Fotorama will build the gallery here. -->
        <div bind:this={galleryContainer}></div>
    {/if}
</section>