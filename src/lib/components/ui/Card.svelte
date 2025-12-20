<script>
	export let glass = false;
	export let padding = 'md';
	export let hover = false;
</script>

<div
	class="card"
	class:glass
	class:hover
	class:padding-sm={padding === 'sm'}
	class:padding-lg={padding === 'lg'}
>
	{#if $$slots.header}
		<div class="card-header">
			<slot name="header" />
		</div>
	{/if}

	<div class="card-content">
		<slot />
	</div>

	{#if $$slots.footer}
		<div class="card-footer">
			<slot name="footer" />
		</div>
	{/if}
</div>

<style>
	.card {
		background: rgba(30, 41, 59, 0.5);
		border: 1px solid rgba(148, 163, 184, 0.1);
		border-radius: 1rem;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.card.glass {
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.card.hover:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
		border-color: rgba(59, 130, 246, 0.3);
	}

	.card-header {
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid rgba(148, 163, 184, 0.1);
		font-weight: 600;
		color: #e2e8f0;
	}

	.card-content {
		padding: 1.5rem;
		color: #cbd5e1;
	}

	.card.padding-sm .card-content {
		padding: 1rem;
	}

	.card.padding-lg .card-content {
		padding: 2rem;
	}

	.card-footer {
		padding: 1rem 1.5rem;
		border-top: 1px solid rgba(148, 163, 184, 0.1);
		background: rgba(15, 23, 42, 0.3);
	}
</style>
