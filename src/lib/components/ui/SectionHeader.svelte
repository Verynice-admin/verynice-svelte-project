<script>
	export let title = '';
	export let subtitle = '';
	export let center = true;
</script>

<div class="section-header" class:center>
	{#if title}
		<h1 class="title">{title}</h1>
	{/if}
	{#if subtitle}
		<p class="subtitle">{subtitle}</p>
	{/if}
</div>

<style>
	.section-header {
		margin-bottom: 3rem;
	}

	.section-header.center {
		text-align: center;
	}

	.title {
		font-family: 'Inter', sans-serif;
		font-size: clamp(2.5rem, 5vw, 3.5rem);
		font-weight: 800;
		letter-spacing: -0.02em;
		color: var(--vnk-text-heading-color, #2c3e50);
		margin: 0 0 1rem;
		background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		display: inline-block;
	}

	.subtitle {
		font-family: 'Inter', sans-serif;
		font-size: 1.25rem;
		color: #555;
		margin: 0 auto;
		max-width: 600px;
		line-height: 1.6;
	}

	@media (max-width: 768px) {
		.section-header {
			margin-bottom: 2rem;
			padding: 0 1rem;
		}

		.title {
			font-size: 2rem;
		}

		.subtitle {
			font-size: 1rem;
		}
	}
</style>
