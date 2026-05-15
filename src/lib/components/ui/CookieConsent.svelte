<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	const CONSENT_KEY = 'vn_cookie_consent';
	const CONSENT_VERSION = '1';

	let visible = false;

	onMount(() => {
		const stored = localStorage.getItem(CONSENT_KEY);
		if (!stored) {
			// Small delay so it doesn't flash immediately on page load
			setTimeout(() => { visible = true; }, 800);
		}
	});

	function accept() {
		localStorage.setItem(CONSENT_KEY, CONSENT_VERSION);
		visible = false;
	}

	function decline() {
		// Store decline decision so we don't keep re-asking
		sessionStorage.setItem(CONSENT_KEY, 'declined');
		visible = false;
	}

	export function hasConsent(): boolean {
		if (!browser) return false;
		return localStorage.getItem(CONSENT_KEY) === CONSENT_VERSION;
	}
</script>

{#if visible}
	<div
		class="consent-backdrop"
		role="dialog"
		aria-modal="true"
		aria-labelledby="consent-title"
		aria-describedby="consent-desc"
	>
		<div class="consent-banner">
			<div class="consent-text">
				<p id="consent-title" class="consent-heading">We use cookies</p>
				<p id="consent-desc" class="consent-body">
					We use a functional session cookie for sign-in and store your language preference in your browser. No tracking or advertising cookies are used.
					<a href="/privacy" class="consent-link">Privacy Policy</a>
				</p>
			</div>
			<div class="consent-actions">
				<button class="btn-decline" type="button" on:click={decline}>Decline</button>
				<button class="btn-accept" type="button" on:click={accept}>Accept</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.consent-backdrop {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 99999;
		padding: 0 1rem;
		padding-bottom: max(1rem, env(safe-area-inset-bottom));
		display: flex;
		justify-content: center;
		pointer-events: none;
	}

	.consent-banner {
		pointer-events: all;
		background: #0f172a;
		color: #f1f5f9;
		border-radius: 14px;
		padding: 1rem 1.25rem;
		max-width: 720px;
		width: 100%;
		display: flex;
		align-items: center;
		gap: 1.5rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}

	.consent-text {
		flex: 1;
		min-width: 0;
	}

	.consent-heading {
		font-weight: 700;
		font-size: 0.95rem;
		margin: 0 0 0.2rem;
		color: #fff;
	}

	.consent-body {
		font-size: 0.825rem;
		color: #94a3b8;
		margin: 0;
		line-height: 1.5;
	}

	.consent-link {
		color: #38bdf8;
		text-decoration: underline;
		margin-left: 0.25rem;
	}

	.consent-actions {
		display: flex;
		gap: 0.75rem;
		flex-shrink: 0;
	}

	.btn-decline,
	.btn-accept {
		padding: 0.55rem 1.1rem;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		border: none;
		min-height: 44px;
		min-width: 80px;
		transition: background 0.15s;
	}

	.btn-decline {
		background: #1e293b;
		color: #94a3b8;
	}

	.btn-decline:hover {
		background: #334155;
		color: #e2e8f0;
	}

	.btn-accept {
		background: #0ea5e9;
		color: #fff;
	}

	.btn-accept:hover {
		background: #0284c7;
	}

	@media (max-width: 520px) {
		.consent-banner {
			flex-direction: column;
			gap: 0.875rem;
		}

		.consent-actions {
			width: 100%;
		}

		.btn-decline,
		.btn-accept {
			flex: 1;
		}
	}
</style>
