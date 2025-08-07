<!-- src/lib/components/content/VideoEmbed.svelte (FINAL AND CORRECTED) -->

<script>
    /** @type {string} */
    export let title = 'Embedded Video';

    /** @type {string} */
    export let url = '';
</script>

<!-- 
    THE FIX: We wrap the iframe in the containers that your CSS is looking for.
    - .themed-content-block gives it the nice border and background.
    - #video-section is the specific ID for styling.
    - .video-wrapper is the crucial aspect-ratio container.
-->
<section id="video-section" class="themed-content-block">
    <div class="additional-content-header">
        <h2>{title}</h2>
    </div>

    {#if url}
        <div class="video-wrapper">
            <iframe
                src={url}
                title={title}
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
            ></iframe>
        </div>
    {/if}
</section>