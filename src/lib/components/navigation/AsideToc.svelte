<!-- src/lib/components/navigation/AsideToc.svelte (IMPROVED VISIBILITY LOGIC) -->

<script>
    import { onMount } from 'svelte';
    import { throttle } from '$lib/utils/domHelpers.js';

    // Props
    export let sections = [];

    // --- Internal State ---
    let isVisible = false; // This reactive variable will control visibility
    let currentSectionId = '';

    // --- DOM Element Bindings ---
    let heroElement; // <-- UPDATED: We'll now look for the hero element
    let targetToHideElement;
    
    const handleScroll = () => {
        // Find the hero element once if it doesn't exist.
        if (!heroElement) {
            heroElement = document.getElementById('page-hero-section');
            if (!heroElement) return; // Exit if hero not found yet
        }

        const heroRect = heroElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // --- UPDATED LOGIC TO SHOW/HIDE THE ENTIRE TOC ---
        // Show the TOC only if the bottom of the hero section is above the top of the viewport.
        // This means the hero is completely scrolled out of view.
        isVisible = heroRect.bottom < 0;

        // --- Logic to highlight the current section (unchanged) ---
        let bestCandidate = '';
        const threshold = viewportHeight / 3;
        for (const section of sections) {
            const el = document.getElementById(section.sectionId);
            if (el) {
                const rect = el.getBoundingClientRect();
                // If the top of the section is above the threshold, it's a candidate
                if (rect.top < threshold) {
                    bestCandidate = section.sectionId;
                }
            }
        }
        currentSectionId = bestCandidate;
    };

    const throttledScrollHandler = throttle(handleScroll, 100);

    onMount(() => {
        // Find the element to hide on mount
        targetToHideElement = document.querySelector('.additional-content.spec');
        // Run initial check
        handleScroll();
    });

    // Handle hover effects to hide the Key Facts sidebar
    function handleMouseEnter() {
        if (targetToHideElement) targetToHideElement.style.opacity = '0';
    }
    function handleMouseLeave() {
        if (targetToHideElement) targetToHideElement.style.opacity = '1';
    }
</script>

<!-- Listen to window events directly in the markup -->
<svelte:window on:scroll={throttledScrollHandler} />

<!-- The 'visible' class is now reactively applied based on the isVisible variable -->
<aside 
    class="aside-toc" 
    class:visible={isVisible}
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
>
    <div class="toc-wrapper">
        {#each sections as section (section.id)}
            <div class="toc-item" class:current={currentSectionId === section.sectionId}>
                <a href="#{section.sectionId}">{section.title}</a>
            </div>
        {/each}
    </div>
</aside>