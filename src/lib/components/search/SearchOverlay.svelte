<!-- src/lib/components/search/SearchOverlay.svelte (CORRECTED) -->

<script>
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';

    export let isActive = false;
    let searchInput;

    function close() {
        isActive = false;
    }

    // This is the keyboard handler for the close button
    function handleCloseKeydown(event) {
        // We check if the key is 'Enter' or 'Space'
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault(); // Prevent default action (like scrolling)
            close();
        }
    }

    // This is the global keyboard handler for the 'Escape' key
    function handleGlobalKeydown(event) {
        if (event.key === 'Escape') {
            close();
        }
    }

    onMount(() => {
        if (browser) {
            window.addEventListener('keydown', handleGlobalKeydown);
        }
    });

    onDestroy(() => {
        if (browser) {
            window.removeEventListener('keydown', handleGlobalKeydown);
        }
    });

    // Focus the input when the overlay becomes active
    $: if (browser && isActive && searchInput) {
        setTimeout(() => searchInput.focus(), 100);
    }
</script>

<div class="search" class:active={isActive} role="dialog" aria-modal="true">
    <div class="search-close-wrapper">
        <!-- 
          FIX: The on:keydown event now calls our new handler function.
          This is the correct Svelte syntax.
        -->
        <span 
            class="search-close" 
            on:click={close} 
            on:keydown={handleCloseKeydown}
            role="button" 
            tabindex="0" 
            aria-label="Close Search"
        >×</span>
    </div>
    <div class="search-wrapper">
        <form class="search-form" action="/search" method="get">
            <label for="search-form-q" class="visually-hidden">Search for:</label>
            <input 
                type="search" 
                id="search-form-q" 
                name="q" 
                class="search-field" 
                placeholder="Search..."
                bind:this={searchInput}
            >
            <button type="submit" class="search-submit">
                <span class="icon-search" aria-hidden="true"></span>
                <span class="visually-hidden">Submit Search</span>
            </button>
        </form>
    </div>
</div>  