<script>
    /** @type {import('./$types').PageData} */
    export let data;

    // --- FIX: Define the correct order for regions ---
    const regionOrder = [
        'Almaty & Nearby',
        'Astana',
        'Turkistan & South',
        'Mangystau & Caspian West',
        'East Kazakhstan / Altai',
        'Central Kazakhstan',
        'Northern Steppe & Lakes',
        'Remote / Specialized'
    ];

    // This reactive block now groups AND sorts the data
    $: sortedRegions = (() => {
        if (!data.tips || data.tips.length === 0) {
            return [];
        }

        // 1. Group tips by region
        const grouped = data.tips.reduce((acc, tip) => {
            const region = tip.region || 'Uncategorized';
            if (!acc[region]) acc[region] = [];
            acc[region].push(tip);
            return acc;
        }, {});

        // 2. Sort tips within each region by tier (Tier 1 first)
        for (const region in grouped) {
            grouped[region].sort((a, b) => a.tier - b.tier);
        }

        // 3. Sort the regions themselves based on our predefined order
        return Object.entries(grouped).sort(([regionA], [regionB]) => {
            const indexA = regionOrder.indexOf(regionA);
            const indexB = regionOrder.indexOf(regionB);
            // Handle regions that might not be in our list
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    })();
</script>

<svelte:head>
    <title>Travel Tips for Kazakhstan</title>
    <meta name="description" content="Your essential guide for traveling in Kazakhstan, grouped by region and importance." />
</svelte:head>

<div class="page-container">
    <header class="page-header">
        <h1>Travel Tips & Attractions</h1>
        <p>An organized guide to Kazakhstan's highlights, grouped by region and ranked by traveler popularity to help you plan your perfect trip.</p>
    </header>

    {#if sortedRegions.length > 0}
        <div class="regions-list">
            <!-- FIX: Loop over the new 'sortedRegions' variable -->
            {#each sortedRegions as [region, tips]}
                <section class="region-section">
                    <h2 class="region-title">{region}</h2>
                    
                    <div class="tips-list">
                        <!-- Then, loop through the TIPS within that region -->
                        {#each tips as tip (tip.id)}
                            <a href="/tips/{tip.id}" class="tip-item">
                                <div class="tier-indicator tier-{tip.tier}">
                                    <span>TIER</span>
                                    <strong>{tip.tier}</strong>
                                </div>
                                <div class="tip-content">
                                    <h3 class="tip-title">{tip.title}</h3>
                                    <p class="tip-description">{tip.shortDescription}</p>
                                </div>
                            </a>
                        {/each}
                    </div>
                </section>
            {/each}
        </div>
    {:else if data.error}
        <p class="error-message">{data.error}</p>
    {:else}
        <p>Loading travel tips...</p>
    {/if}
</div>

<style>
    .page-container {
        max-width: 900px;
        margin: 0 auto;
        padding: var(--vnk-spacing-xl) var(--vnk-spacing-md);
        font-family: var(--vnk-font-secondary);
    }

    .page-header {
        text-align: center;
        margin-bottom: var(--vnk-spacing-xxl);
    }

    .page-header h1 {
        font-family: var(--vnk-font-primary);
        font-size: 2.8rem;
        color: var(--vnk-text-accent-color);
        margin-bottom: var(--vnk-spacing-sm);
    }

    .page-header p {
        font-size: 1.1rem;
        color: var(--vnk-text-secondary-color);
        max-width: 650px;
        margin: 0 auto;
    }

    .region-section {
        margin-bottom: var(--vnk-spacing-xxl);
    }

    .region-title {
        font-family: var(--vnk-font-primary);
        font-size: 1.8rem;
        color: var(--vnk-text-primary-color);
        padding-bottom: var(--vnk-spacing-sm);
        border-bottom: 2px solid var(--vnk-accent-color);
        margin-bottom: var(--vnk-spacing-lg);
    }

    .tips-list {
        display: flex;
        flex-direction: column;
        gap: var(--vnk-spacing-md);
    }

    .tip-item {
        display: flex;
        align-items: flex-start;
        gap: var(--vnk-spacing-md);
        padding: var(--vnk-spacing-md);
        background-color: var(--vnk-card-bg);
        border-radius: var(--vnk-border-radius-md);
        border: 1px solid var(--vnk-card-border-color);
        text-decoration: none;
        transition: background-color 0.2s ease, border-color 0.2s ease;
    }

    .tip-item:hover {
        background-color: rgba(var(--vnk-accent-rgb), 0.05);
        border-color: rgba(var(--vnk-accent-rgb), 0.3);
    }

    .tier-indicator {
        flex-shrink: 0;
        width: 60px;
        height: 60px;
        border-radius: var(--vnk-border-radius-sm);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-family: var(--vnk-font-primary);
        line-height: 1;
    }

    .tier-indicator span {
        font-size: 0.7rem;
        opacity: 0.8;
    }

    .tier-indicator strong {
        font-size: 1.5rem;
        font-weight: 700;
    }

    /* Tier-specific colors */
    .tier-1 { background-color: var(--vnk-accent-color); }
    .tier-2 { background-color: #5a8b8b; } /* A muted teal */
    .tier-3 { background-color: #777; } /* A neutral gray */

    .tip-content {
        flex-grow: 1;
    }

    .tip-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--vnk-text-primary-color);
        margin: 0 0 0.25rem 0;
    }

    .tip-description {
        font-size: 0.95rem;
        color: var(--vnk-text-secondary-color);
        margin: 0;
        line-height: 1.5;
    }
</style>