<!-- src/lib/components/content/VideoEmbed.svelte (UPGRADED WITH SYNTAX FIX) -->

<script>
    /** @type {string} */
    export let title = 'Embedded Video';

    /** @type {string} */
    export let url = '';

    /**
     * Takes a standard video URL (like youtube.com/watch?v=...) and
     * converts it into the special embeddable URL that works in an iframe.
     * @param {string} originalUrl
     */
    function getEmbedUrl(originalUrl) {
        if (!originalUrl) return null;

        try {
            const urlObj = new URL(originalUrl);

            // Handle YouTube URLs
            if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
                const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
                return `https://www.youtube.com/embed/${videoId}`;
            }

            // Handle Vimeo URLs (as a bonus)
            if (urlObj.hostname.includes('vimeo.com')) {
                const videoId = urlObj.pathname.split('/').pop();
                return `https://player.vimeo.com/video/${videoId}`;
            }
        } catch (e) {
            console.error('Invalid URL for video embed:', originalUrl);
            return null;
        }
        
        return originalUrl;
    }

    $: embedUrl = getEmbedUrl(url);

</script>

<section id="video-section" class="themed-content-block">
    <div class="additional-content-header">
        <h2>{title}</h2>
    </div>

    {#if embedUrl}
        <div class="video-wrapper">
            <!-- THE FIX IS HERE: The invalid comment has been removed from the iframe tag. -->
            <iframe
                src={embedUrl}
                title={title}
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
            ></iframe>
        </div>
    {:else if url}
        <p style="text-align: center; padding: 2rem;">The provided video URL is not valid.</p>
    {/if}
</section>