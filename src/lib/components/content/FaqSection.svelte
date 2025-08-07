<!-- src/lib/components/content/FaqSection.svelte (NEW COMPONENT) -->

<script>
    /** @type {string} */
    export let title = 'Frequently Asked Questions';

    /** @type {Array<{question: string, answer: string}>} */
    export let items = [];
</script>

<section class="themed-content-block">
    <div class="additional-content-header">
        <h2>{title}</h2>
    </div>

    {#if items && items.length > 0}
        <div class="faq-list">
            {#each items as item (item.question)}
                <details class="faq-item">
                    <summary class="faq-question">{item.question}</summary>
                    <div class="faq-answer">
                        <!-- {@html} renders the answer HTML from your database -->
                        {@html item.answer}
                    </div>
                </details>
            {/each}
        </div>
    {/if}
</section>

<style>
    /* Scoped CSS - only applies to this component */
    .faq-list {
        display: flex;
        flex-direction: column;
        gap: var(--vnk-spacing-sm);
    }

    .faq-item {
        border-bottom: 1px solid var(--vnk-card-border-color);
        padding-bottom: var(--vnk-spacing-sm);
    }

    .faq-item:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }

    .faq-question {
        color: var(--vnk-text-primary-color);
        font-size: 1.1rem;
        font-weight: 600;
        padding: var(--vnk-spacing-sm) 35px var(--vnk-spacing-sm) 0;
        cursor: pointer;
        list-style: none; /* Hide default triangle marker */
        position: relative;
        transition: color 0.3s ease;
    }
    .faq-question::-webkit-details-marker {
        display: none;
    }

    .faq-question:hover,
    .faq-item[open] > .faq-question {
        color: var(--vnk-text-accent-color);
    }

    /* Custom expand/collapse icon */
    .faq-question::after {
        content: '+';
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        font-size: 1.5rem;
        color: var(--vnk-text-accent-color);
        transition: transform 0.2s ease-in-out;
        font-weight: 300;
    }

    /* Change icon to a cross when open */
    .faq-item[open] > .faq-question::after {
        transform: translateY(-50%) rotate(45deg);
    }
    
    .faq-item[open] > .faq-question {
        margin-bottom: var(--vnk-spacing-md);
    }
    
    .faq-answer {
        color: var(--vnk-text-secondary-color);
        padding: 0 0 0 var(--vnk-spacing-xs);
        line-height: 1.7;
    }

    /* 
      THE FIX FOR IMAGES: This uses Svelte's :global() modifier to style
      any <img> tag that appears inside our .faq-answer div.
    */
    .faq-answer :global(img) {
        display: block;
        max-width: 100%;
        height: auto;
        margin: var(--vnk-spacing-md) auto; /* Centers the image and adds space */
        border-radius: var(--vnk-border-radius-md);
        box-shadow: var(--vnk-shadow-depth);
    }
</style>