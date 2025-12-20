<!-- src/lib/components/content/KeyFacts.svelte (UPDATED WITH NEW LAYOUT) -->
<script lang="ts">
	export let title: string = 'Key Facts';
	export let facts:
		| Array<{ label: string; value: unknown }>
		| Record<string, unknown>
		| null
		| undefined = [];

	export let railLeft = false;
	export let sidebarWidth = 280;
	export let gutter = 24;
	export let stickTop = 16;
	export let embedded = false;

	$: items = Array.isArray(facts)
		? facts.filter(
				(f): f is { label: string; value: unknown } => !!f && typeof (f as any).label === 'string'
			)
		: facts && typeof facts === 'object'
			? Object.entries(facts).map(([label, value]) => ({ label, value }))
			: [];

	const fmt = (v: unknown): string =>
		v == null
			? '—'
			: typeof v === 'boolean'
				? v
					? 'Yes'
					: 'No'
				: Array.isArray(v)
					? v.map((x) => (x == null ? '—' : String(x))).join(', ')
					: typeof v === 'object'
						? JSON.stringify(v)
						: String(v);
</script>

<div
	id={embedded ? undefined : 'key-facts'}
	class:vnk-sidebar-card={!embedded}
	class:vnk-rail-left={railLeft && !embedded}
	style={railLeft && !embedded
		? `--kf-sidebar-w:${sidebarWidth}px; --kf-gutter:${gutter}px; --kf-top:${stickTop}px;`
		: ''}
>
	{#if !embedded}
		<div class="additional-content-header">
			<h2 class="key-facts-title">{title}</h2>
		</div>
	{/if}

	{#if items.length}
		<dl class="facts-list">
			{#each items as fact, i (i)}
				<div class="fact-item">
					<dt class="fact-label">{fact.label}</dt>
					<dd class="fact-value">{fmt(fact.value)}</dd>
				</div>
			{/each}
		</dl>
	{:else}
		<div class="kf-empty">No key facts</div>
	{/if}

	<div class="kf-footer">
		<p>Want more facts?</p>
		<a href="#faq" class="kf-btn">Go to FAQ</a>
	</div>
</div>

<style>
	.vnk-sidebar-card {
		background-color: var(--vnk-card-bg-glass, rgba(255, 255, 255, 0.82));
		backdrop-filter: blur(12px) saturate(150%);
		-webkit-backdrop-filter: blur(12px) saturate(150%);
		border: 1px solid var(--vnk-card-border-color, rgba(0, 0, 0, 0.08));
		border-radius: 16px;
		padding: 16px 14px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
		color: var(--vnk-text-primary-color, #1c1c1e);
	}
	.vnk-rail-left {
		width: var(--kf-sidebar-w, 280px);
		margin-left: calc(-1 * (var(--kf-sidebar-w, 280px) + var(--kf-gutter, 24px)));
		position: sticky;
		top: var(--kf-top, 16px);
	}
	@media (max-width: 900px) {
		.vnk-rail-left {
			position: static;
			margin-left: 0;
			width: auto;
			margin-bottom: 16px;
		}
	}
	@media (prefers-color-scheme: dark) {
		.vnk-sidebar-card {
			background-color: rgba(28, 28, 30, 0.72);
			border-color: rgba(255, 255, 255, 0.08);
			color: #f2f2f7;
		}
	}
	.key-facts-title {
		color: var(--vnk-text-accent-color, #0a84ff);
		padding-bottom: 8px;
		margin: 0 0 12px 0;
		font-size: 1.1rem;
		border-bottom: 1px solid var(--vnk-card-border-color, rgba(0, 0, 0, 0.08));
	}
	.facts-list {
		margin: 0;
		padding: 0;
	}
	.fact-item {
		padding-bottom: 8px;
		margin-bottom: 8px;
		border-bottom: 1px dashed
			color-mix(in srgb, var(--vnk-text-accent-color, #0a84ff) 25%, transparent);
	}
	.fact-item:last-child {
		border-bottom: none;
		margin-bottom: 0;
		padding-bottom: 0;
	}
	.fact-label {
		font-weight: 600;
		color: #636366;
		font-size: 0.9rem;
		margin-bottom: 4px;
	}
	.kf-empty {
		font-size: 0.9rem;
		color: #636366;
	}

	.kf-footer {
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid var(--vnk-card-border-color, rgba(0, 0, 0, 0.08));
		text-align: center;
	}

	.kf-footer p {
		font-size: 0.85rem;
		color: #636366;
		margin: 0 0 0.5rem 0;
		font-weight: 500;
	}

	.kf-btn {
		display: inline-block;
		background: #3498db;
		color: white;
		text-decoration: none;
		font-weight: 600;
		font-size: 0.85rem;
		padding: 0.5rem 1rem;
		border-radius: 99px;
		transition: all 0.2s;
	}

	.kf-btn:hover {
		background: #2980b9;
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3);
		color: white;
	}
</style>
