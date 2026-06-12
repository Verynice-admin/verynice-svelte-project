<script lang="ts">
	let name = '';
	let email = '';
	let subject = '';
	let message = '';
	let status: 'idle' | 'sending' | 'sent' | 'error' = 'idle';

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		status = 'sending';

		// Build mailto link as a fallback (no server-side email handler yet)
		const body = encodeURIComponent(`Name: ${name}\n\nMessage:\n${message}`);
		const sub = encodeURIComponent(subject || 'VeryNice.kz contact form');
		window.location.href = `mailto:headquarters.mailbox@gmail.com?subject=${sub}&body=${body}`;
		status = 'sent';
	}
</script>

<svelte:head>
	<title>Contact Us | VeryNice.kz</title>
	<meta name="description" content="Get in touch with the VeryNice.kz team — Kazakhstan travel guide." />
	<link rel="canonical" href="https://verynice.kz/contact" />
	<meta property="og:url" content="https://verynice.kz/contact" />
</svelte:head>

<main id="main-content" class="contact-page">
	<div class="contact-container">
		<header class="contact-header">
			<a href="/" class="back-link" aria-label="Back to home">← Home</a>
			<h1>Contact Us</h1>
			<p class="subtitle">Questions, feedback, or partnership enquiries — we'd love to hear from you.</p>
		</header>

		<div class="contact-grid">
			<section class="contact-form-section">
				<form class="contact-form" on:submit={handleSubmit} novalidate>
					<div class="form-group">
						<label for="contact-name">Your name</label>
						<input
							id="contact-name"
							type="text"
							bind:value={name}
							placeholder="Azamat Bagatov"
							autocomplete="name"
							required
						/>
					</div>

					<div class="form-group">
						<label for="contact-email">Email address</label>
						<input
							id="contact-email"
							type="email"
							bind:value={email}
							placeholder="you@example.com"
							autocomplete="email"
							required
						/>
					</div>

					<div class="form-group">
						<label for="contact-subject">Subject</label>
						<input
							id="contact-subject"
							type="text"
							bind:value={subject}
							placeholder="Travel tip, partnership, correction…"
						/>
					</div>

					<div class="form-group">
						<label for="contact-message">Message</label>
						<textarea
							id="contact-message"
							bind:value={message}
							rows="6"
							placeholder="Tell us what's on your mind…"
							required
						></textarea>
					</div>

					<button type="submit" class="submit-btn" disabled={status === 'sending'}>
						{status === 'sending' ? 'Opening email client…' : 'Send Message'}
					</button>

					{#if status === 'sent'}
						<p class="status-msg success">Your email client should have opened. If not, email us directly at <a href="mailto:headquarters.mailbox@gmail.com">headquarters.mailbox@gmail.com</a>.</p>
					{:else if status === 'error'}
						<p class="status-msg error">Something went wrong. Please email us directly at <a href="mailto:headquarters.mailbox@gmail.com">headquarters.mailbox@gmail.com</a>.</p>
					{/if}
				</form>
			</section>

			<aside class="contact-info">
				<div class="info-card">
					<h2>Get in touch</h2>
					<dl>
						<dt>Email</dt>
						<dd><a href="mailto:headquarters.mailbox@gmail.com">headquarters.mailbox@gmail.com</a></dd>

						<dt>Response time</dt>
						<dd>Usually within 1–3 business days</dd>

						<dt>Topics we can help with</dt>
						<dd>
							<ul>
								<li>Destination corrections or additions</li>
								<li>Press and media enquiries</li>
								<li>Business listings and partnerships</li>
								<li>General travel questions about Kazakhstan</li>
								<li>Privacy or data requests</li>
							</ul>
						</dd>
					</dl>
				</div>

				<div class="info-card legal-links">
					<h2>Legal</h2>
					<ul>
						<li><a href="/privacy">Privacy Policy</a></li>
						<li><a href="/terms">Terms of Use</a></li>
					</ul>
				</div>
			</aside>
		</div>
	</div>
</main>

<style>
	.contact-page {
		background: #f8fafc;
		min-height: 100vh;
		padding: 2rem 1rem 4rem;
	}

	.contact-container {
		max-width: 1000px;
		margin: 0 auto;
	}

	.contact-header {
		margin-bottom: 2.5rem;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		color: #0ea5e9;
		text-decoration: none;
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	.back-link:hover { text-decoration: underline; }

	.contact-header h1 {
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 800;
		color: #0f172a;
		margin: 0.25rem 0 0.5rem;
	}

	.subtitle {
		color: #64748b;
		font-size: 1rem;
		margin: 0;
	}

	.contact-grid {
		display: grid;
		grid-template-columns: 1fr 340px;
		gap: 2rem;
		align-items: start;
	}

	@media (max-width: 768px) {
		.contact-grid {
			grid-template-columns: 1fr;
		}
	}

	.contact-form-section {
		background: #fff;
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
	}

	.form-group {
		margin-bottom: 1.25rem;
	}

	label {
		display: block;
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
		margin-bottom: 0.4rem;
	}

	input,
	textarea {
		width: 100%;
		padding: 0.65rem 0.875rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.95rem;
		color: #0f172a;
		background: #fff;
		transition: border-color 0.15s;
		box-sizing: border-box;
		font-family: inherit;
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: #0ea5e9;
		box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
	}

	textarea { resize: vertical; }

	.submit-btn {
		width: 100%;
		padding: 0.85rem;
		background: #0ea5e9;
		color: #fff;
		font-size: 1rem;
		font-weight: 700;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		transition: background 0.15s;
		min-height: 48px;
	}

	.submit-btn:hover:not(:disabled) { background: #0284c7; }
	.submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

	.status-msg {
		margin-top: 1rem;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		font-size: 0.9rem;
	}

	.status-msg.success {
		background: #dcfce7;
		color: #166534;
	}

	.status-msg.error {
		background: #fee2e2;
		color: #991b1b;
	}

	.info-card {
		background: #fff;
		border-radius: 16px;
		padding: 1.75rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
		margin-bottom: 1.25rem;
	}

	.info-card h2 {
		font-size: 1.1rem;
		font-weight: 700;
		color: #0f172a;
		margin: 0 0 1rem;
	}

	dl dt {
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: #94a3b8;
		margin-top: 1rem;
	}

	dl dd {
		margin: 0.25rem 0 0;
		color: #475569;
		font-size: 0.9rem;
	}

	dl dd a {
		color: #0ea5e9;
		text-decoration: none;
	}

	dl dd a:hover { text-decoration: underline; }

	dl dd ul {
		margin: 0.35rem 0;
		padding-left: 1.25rem;
	}

	dl dd li {
		font-size: 0.875rem;
		margin-bottom: 0.2rem;
	}

	.legal-links ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.legal-links li { margin-bottom: 0.5rem; }

	.legal-links a {
		color: #0ea5e9;
		text-decoration: none;
		font-size: 0.9rem;
	}

	.legal-links a:hover { text-decoration: underline; }
</style>
