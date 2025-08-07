<!-- src/lib/ui-elements/BackToTop.svelte -->
<script>
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import { fade } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';

    let isVisible = false;
    let progress = 0; // For circular progress indicator

    function handleScroll() {
        isVisible = window.scrollY > 300;
    }

    function scrollToTop() {
        const start = window.scrollY;
        const duration = 1000; // Slower scroll (1 second)
        const startTime = performance.now();
        
        // Circular progress animation
        const progressInterval = setInterval(() => {
            progress += 100 / (duration / 16.67); // Increment for 60fps
            if (progress >= 100) clearInterval(progressInterval);
        }, 16.67);
        
        function animateScroll(time) {
            const elapsed = time - startTime;
            const percent = Math.min(elapsed / duration, 1);
            const eased = cubicOut(percent);
            
            window.scrollTo(0, start - start * eased);
            
            if (percent < 1) {
                requestAnimationFrame(animateScroll);
            } else {
                progress = 0; // Reset progress
            }
        }
        
        requestAnimationFrame(animateScroll);
    }

    onMount(() => {
        if (browser) {
            window.addEventListener('scroll', handleScroll, { passive: true });
        }
    });

    onDestroy(() => {
        if (browser) {
            window.removeEventListener('scroll', handleScroll);
        }
    });
</script>

{#if isVisible}
<button
    id="back-to-top"
    on:click={scrollToTop}
    aria-label="Back to top"
    transition:fade={{ duration: 300 }}
>
    <div class="back-to-top-inner">
        <!-- Circular progress background -->
        <svg class="progress-circle" viewBox="0 0 50 50">
            <!-- Background circle -->
            <circle cx="25" cy="25" r="20" stroke="var(--circle-bg)" stroke-width="3" fill="none" />
            <!-- Progress circle -->
            <circle cx="25" cy="25" r="20" stroke="var(--circle-progress)" 
                    stroke-width="3" fill="none" stroke-dasharray="125.6" 
                    stroke-dashoffset={125.6 - (progress * 1.256)} />
        </svg>
        
        <!-- Up arrow icon -->
        <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 3l-9 9h6v9h6v-9h6z" />
        </svg>
    </div>
</button>
{/if}

<style>
    :root {
        --accent-color: #3a6ea5;
        --accent-hover: #2a4d76;
        --circle-bg: rgba(255, 255, 255, 0.2);
        --circle-progress: rgba(255, 255, 255, 0.8);
    }
    
    #back-to-top {
        position: fixed;
        z-index: 1000;
        left: var(--spacing-lg, 1.5rem);
        bottom: var(--spacing-lg, 1.5rem);
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: var(--accent-color);
        color: white;
        border: none;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        overflow: hidden;
    }
    
    #back-to-top:hover {
        background: var(--accent-hover);
        transform: translateY(-4px) scale(1.05);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.15);
    }
    
    #back-to-top:active {
        transform: translateY(-2px) scale(0.98);
    }
    
    .back-to-top-inner {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .progress-circle {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
        transition: opacity 0.3s ease;
    }
    
    .arrow-icon {
        width: 24px;
        height: 24px;
        fill: white;
        transition: transform 0.3s ease;
    }
    
    #back-to-top:hover .arrow-icon {
        transform: translateY(-3px);
    }
    
    /* Animation for initial appearance */
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    #back-to-top {
        animation: pulse 2s ease-in-out 0.5s;
    }
</style>