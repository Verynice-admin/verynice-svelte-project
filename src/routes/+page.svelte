<!-- src/routes/+page.svelte (CLEANED AND CORRECTED) -->
<script>
    // This file is for the homepage of your site.
    // It imports data passed from its corresponding +page.js file.
    
    /** @type {import('./$types').PageData} */
    export let data;
</script>

<svelte:head>
    <title>Welcome to VeryNice</title>
    <meta name="description" content="Homepage for the VeryNice project." />
</svelte:head>

<div class="wrapper">
    <section style="text-align: center; padding: 8rem 0; min-height: 60vh; display: flex; flex-direction: column; justify-content: center;">
        <h1>Welcome to the "VeryNice" Website</h1>
        <p style="font-size: 1.2rem; color: var(--vnk-text-secondary-color);">This is the homepage for your project.</p>
        <p style="margin-top: 2rem;">
            <a href="/history" style="color: var(--vnk-accent-color); text-decoration: underline;">
                Click here to view the /history page you are working on.
            </a>
        </p>
    </section>
</div>