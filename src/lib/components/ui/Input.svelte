<script>
	export let type = 'text';
	export let value = '';
	export let placeholder = '';
	export let label = '';
	export let error = '';
	export let disabled = false;
	export let required = false;
	export let id = `input-${Math.random().toString(36).substr(2, 9)}`;
</script>

<div class="input-wrapper">
	{#if label}
		<label for={id} class="input-label">
			{label}
			{#if required}
				<span class="required">*</span>
			{/if}
		</label>
	{/if}

	<input
		{id}
		{type}
		{placeholder}
		{disabled}
		{required}
		{value}
		class:error
		on:input={(e) => {
			value = e.currentTarget.value;
		}}
		on:change
		on:focus
		on:blur
	/>

	{#if error}
		<span class="error-message">{error}</span>
	{/if}
</div>

<style>
	.input-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.input-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #e2e8f0;
	}

	.required {
		color: #ef4444;
	}

	input {
		width: 100%;
		padding: 0.75rem 1rem;
		font-size: 1rem;
		line-height: 1.5rem;
		color: #e2e8f0;
		background: rgba(30, 41, 59, 0.5);
		border: 1px solid rgba(148, 163, 184, 0.2);
		border-radius: 0.5rem;
		transition: all 0.2s ease;
		font-family: inherit;
	}

	input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	input.error {
		border-color: #ef4444;
	}

	input.error:focus {
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
	}

	.error-message {
		font-size: 0.875rem;
		color: #ef4444;
	}

	input::placeholder {
		color: rgba(203, 213, 225, 0.5);
	}
</style>
