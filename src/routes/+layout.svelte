<!-- src/routes/+layout.svelte (FINAL, DEFINITIVE LOGO PATH) -->

<script>
    import "../styles/styles.css";
    import SearchOverlay from '$lib/components/search/SearchOverlay.svelte';
    import BackToTop from '$lib/components/ui-elements/BackToTop.svelte';
    
    /** @type {import('./$types').LayoutData} */
    export let data;

    let isSearchActive = false;

    $: copyrightText = data.footerConfig?.copyrightTemplate
        ? data.footerConfig.copyrightTemplate.replace('{year}', new Date().getFullYear())
        : `© ${new Date().getFullYear()} All Rights Reserved.`;
</script>

<svelte:head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&family=Roboto:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">
</svelte:head>

{#if data.headerConfig}
    <header class="header">
        <div class="header-inner">
            <a href="/" class="header-item header-logo" aria-label="Back to homepage">
                <!-- [THE FIX IS HERE]: The path is now the simplest possible. -->
                <img src="/logo.svg" alt="VeryNice.kz Logo" width="209" height="27" />
            </a>
            <nav class="header-item header-menu" aria-label="Main menu">
                <ul>
                    {#each data.headerConfig.menuLinks as link}
                        <li><a href={link.url}>{link.text}</a></li>
                    {/each}
                </ul>
            </nav>
            <div class="header-item header-buttons">
                <div class="header-search">
                    <span 
                        class="icon-search search-open" 
                        on:click={() => isSearchActive = true}
                        on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') isSearchActive = true }}
                        role="button" 
                        tabindex="0" 
                        aria-label="Open Search"
                    ></span>
                </div>
            </div>
        </div>
    </header>
{/if}

<main>
    <slot />
</main>

{#if data.footerConfig}
    <footer class="footer">
        <div class="footer-wrapper">
            <div class="footer-top">
                <div class="footer-inner">
                     <!-- [THE FIX IS HERE]: The path is now the simplest possible. -->
                    <a href="/"><img src="/logo.svg" alt="VeryNice.kz Logo" loading="lazy" decoding="async" /></a>
                </div>
                <div class="footer-inner">
                    <nav class="footer-menu">
                        <ul> {#each data.footerConfig.footerMenuLinks as link}<li><a href={link.url}>{link.text}</a></li>{/each} </ul>
                    </nav>
                </div>
            </div>
            <div class="footer-bottom">
                <div class="footer-inner"><span>{copyrightText}</span></div>
                <div class="footer-inner">
                    <nav class="footer-techmenu">
                        <ul> {#each data.footerConfig.techMenuLinks as link}<li><a href={link.url}>{link.text}</a></li>{/each} </ul>
                    </nav>
                </div>
            </div>
        </div>
    </footer>
{/if}

<SearchOverlay bind:isActive={isSearchActive} />

<BackToTop />