<!-- src/lib/components/content/KeyFacts.svelte (UPDATED WITH NEW LAYOUT) -->
<script>
    /** @type {string} */
    export let title = "Key Facts";
    /** @type {Array<{label: string, value: string}>} */
    export let facts = [];
</script>

<div class="vnk-sidebar-card">
    <div class="additional-content-header">
        <h2 class="key-facts-title">{title}</h2>
    </div>

    {#if facts && facts.length > 0}
        <div class="spec-info">
            <dl class="facts-list">
                {#each facts as fact, i (i)}
                    <div class="fact-item">
                        <dt class="fact-label">{fact.label}</dt>
                        <dd class="fact-value">{fact.value}</dd>
                    </div>
                {/each}
            </dl>
        </div>
    {/if}
</div>

<style>
    /* Main Card Container Styling */
    .vnk-sidebar-card {
        background-color: var(--vnk-card-bg-glass);
        backdrop-filter: blur(12px);
        border: 1px solid var(--vnk-card-border-color);
        border-radius: var(--vnk-border-radius-lg);
        
        /* --- THE FIX (SPACING): Reduced horizontal padding to give text more room --- */
        padding: var(--vnk-spacing-lg) var(--vnk-spacing-md);
        
        box-shadow: var(--vnk-shadow-depth);
    }

    /* Title Styling */
    .key-facts-title {
        color: var(--vnk-text-accent-color);
        text-shadow: var(--vnk-shadow-neon-sm);
        padding-bottom: var(--vnk-spacing-sm);
        margin: 0 0 var(--vnk-spacing-md) 0;
        font-size: 1.25rem;
        font-family: var(--vnk-font-primary);
        border-bottom: 1px solid var(--vnk-card-border-color);
    }
    
    /* Remove default list styling */
    .facts-list {
        margin: 0;
        padding: 0;
    }

    /* Styling for each individual fact row */
    .fact-item {
        /* --- THE FIX (LAYOUT): Changed from a row to a block/column layout --- */
        display: block;
        
        padding-bottom: var(--vnk-spacing-sm);
        margin-bottom: var(--vnk-spacing-sm);
        
        /* Themed separator line */
        border-bottom: 1px dashed rgba(var(--vnk-accent-rgb), 0.2);
    }

    /* Remove the border from the very last fact item */
    .fact-item:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }

    /* Label Styling (e.g., "Capital") */
    .fact-label {
        font-family: var(--vnk-font-secondary);
        font-weight: 500;
        color: var(--vnk-text-secondary-color);
        font-size: 0.9rem; /* Slightly smaller to create hierarchy */
        margin-bottom: 0.25rem; /* Space between label and value */
    }

    /* Value Styling (e.g., "Astana") */
    .fact-value {
        font-family: var(--vnk-font-primary);
        font-weight: 600;
        color: var(--vnk-text-primary-color);
        font-size: 1rem;
        
        /* --- THE FIX (ALIGNMENT): Changed from right to left --- */
        text-align: left;
    }
</style>