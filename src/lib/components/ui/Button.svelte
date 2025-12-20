<script>
	/**
	 * @typedef {'primary' | 'secondary' | 'ghost' | 'danger'} Variant
	 * @typedef {'sm' | 'md' | 'lg'} Size
	 */

	/** @type {Variant} */
	export let variant = 'primary';

	/** @type {Size} */
	export let size = 'md';

	export let disabled = false;
	export let loading = false;
	export let type = 'button';
	export let href = undefined;

	$: Component = href ? 'a' : 'button';
	$: componentProps = href ? { href, role: 'button' } : { type, disabled: disabled || loading };
</script>

<svelte:element
	this={Component}
	class="btn btn-{variant} btn-{size}"
	class:loading
	class:disabled
	{...componentProps}
	on:click
>
	{#if loading}
		<span class="spinner" aria-hidden="true"></span>
	{/if}
	<slot />
</svelte:element>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-weight: 500;
		border-radius: 0.5rem;
		transition: all 0.2s ease;
		cursor: pointer;
		border: 1px solid transparent;
		text-decoration: none;
		font-family: inherit;
	}

	/* Sizes */
	.btn-sm {
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
	}

	.btn-md {
		padding: 0.5rem 1rem;
		font-size: 1rem;
		line-height: 1.5rem;
	}

	.btn-lg {
		padding: 0.75rem 1.5rem;
		font-size: 1.125rem;
		line-height: 1.75rem;
	}

	/* Variants */
	.btn-primary {
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		color: white;
		box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
	}

	.btn-primary:hover:not(.disabled):not(.loading) {
		background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
		box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
		transform: translateY(-1px);
	}

	.btn-secondary {
		background: rgba(148, 163, 184, 0.1);
		color: #cbd5e1;
		border-color: rgba(148, 163, 184, 0.2);
	}

	.btn-secondary:hover:not(.disabled):not(.loading) {
		background: rgba(148, 163, 184, 0.2);
		border-color: rgba(148, 163, 184, 0.3);
	}

	.btn-ghost {
		background: transparent;
		color: #cbd5e1;
	}

	.btn-ghost:hover:not(.disabled):not(.loading) {
		background: rgba(148, 163, 184, 0.1);
	}

	.btn-danger {
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
		color: white;
		box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);
	}

	.btn-danger:hover:not(.disabled):not(.loading) {
		background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
		box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
		transform: translateY(-1px);
	}

	/* States */
	.btn.disabled,
	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none !important;
	}

	.btn.loading {
		cursor: wait;
		opacity: 0.7;
	}

	/* Spinner */
	.spinner {
		width: 1em;
		height: 1em;
		border: 2px solid currentColor;
		border-right-color: transparent;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
