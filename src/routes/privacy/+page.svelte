<svelte:head>
	<title>Privacy Policy | VeryNice.kz</title>
	<meta name="description" content="Privacy Policy for VeryNice.kz — how we collect, use, and protect your personal data." />
	<meta name="robots" content="noindex, follow" />
	<link rel="canonical" href="https://verynice.kz/privacy" />
</svelte:head>

<main id="main-content" class="legal-page">
	<div class="legal-container">
		<header class="legal-header">
			<a href="/" class="back-link" aria-label="Back to home">← Home</a>
			<h1>Privacy Policy</h1>
			<p class="last-updated">Last updated: 15 May 2026</p>
		</header>

		<article class="legal-content prose">
			<section>
				<h2>1. Who We Are</h2>
				<p>VeryNice.kz ("we", "us", "our") is a Kazakhstan travel guide and information platform. Our website is located at <a href="https://verynice.kz">https://verynice.kz</a>. For data-related enquiries, contact us at <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>.</p>
			</section>

			<section>
				<h2>2. Data We Collect</h2>
				<h3>2.1 Data you provide directly</h3>
				<ul>
					<li><strong>Comments:</strong> If you post a comment, we store your display name (optional) and comment text in our database (Firebase Firestore). No account or email address is required.</li>
					<li><strong>Authentication:</strong> If you sign in with Google, we receive your name, email address, and profile photo from Google. We store only your user ID, email, and chosen role (traveller / business).</li>
				</ul>
				<h3>2.2 Data collected automatically</h3>
				<ul>
					<li><strong>Language preference:</strong> Stored in your browser's <code>localStorage</code>. Never sent to our servers.</li>
					<li><strong>Session cookies:</strong> Firebase Authentication sets a secure HTTP-only session cookie (<code>__session</code>) when you sign in. It expires when you sign out or after the session timeout.</li>
					<li><strong>Server logs:</strong> Our hosting provider (Vercel) may log your IP address and request metadata for security and operational purposes. We do not control or actively read these logs.</li>
				</ul>
				<h3>2.3 What we do NOT collect</h3>
				<ul>
					<li>We do not use advertising trackers or third-party analytics pixels.</li>
					<li>We do not sell or share your data with third parties for marketing purposes.</li>
				</ul>
			</section>

			<section>
				<h2>3. How We Use Your Data</h2>
				<table>
					<thead><tr><th>Purpose</th><th>Legal basis (GDPR)</th></tr></thead>
					<tbody>
						<tr><td>Displaying public comments</td><td>Legitimate interest</td></tr>
						<tr><td>Authenticating signed-in users</td><td>Contract (service delivery)</td></tr>
						<tr><td>Remembering your language preference</td><td>Legitimate interest / consent</td></tr>
						<tr><td>AI moderation of comments</td><td>Legitimate interest (safety)</td></tr>
					</tbody>
				</table>
			</section>

			<section>
				<h2>4. Third-Party Services</h2>
				<ul>
					<li><strong>Firebase / Google Cloud</strong> — Authentication and database. <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">Firebase Privacy Policy</a></li>
					<li><strong>Cloudinary</strong> — Image hosting and optimisation. <a href="https://cloudinary.com/privacy" target="_blank" rel="noopener noreferrer">Cloudinary Privacy Policy</a></li>
					<li><strong>Vercel</strong> — Hosting and edge deployment. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel Privacy Policy</a></li>
					<li><strong>Groq / Google Gemini / OpenRouter</strong> — AI translation and content moderation. User comment text is sent to these services for processing; no personally identifiable information is attached.</li>
					<li><strong>Open-Meteo</strong> — Weather data (city name query only, no personal data).</li>
				</ul>
			</section>

			<section>
				<h2>5. Data Retention</h2>
				<p>Public comments are retained indefinitely unless you contact us to request deletion. Authenticated user accounts can be deleted on request. Language preferences are stored locally in your browser and are erased when you clear site data.</p>
			</section>

			<section>
				<h2>6. Your Rights (GDPR)</h2>
				<p>If you are located in the European Economic Area, you have the right to: access, rectify, erase, or port your personal data; withdraw consent at any time; and lodge a complaint with your local supervisory authority. To exercise these rights, email us at <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>.</p>
			</section>

			<section>
				<h2>7. Cookies</h2>
				<p>We use only functional cookies (Firebase session cookie) and browser <code>localStorage</code> (language preference). No marketing or tracking cookies are set. You can clear site data at any time via your browser settings.</p>
			</section>

			<section>
				<h2>8. Changes to This Policy</h2>
				<p>We may update this Privacy Policy from time to time. Material changes will be announced on the website. The "Last updated" date at the top of this page reflects the most recent revision.</p>
			</section>

			<section>
				<h2>9. Contact</h2>
				<p>Questions or requests: <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a></p>
			</section>
		</article>
	</div>
</main>

<style>
	.legal-page {
		background: #f8fafc;
		min-height: 100vh;
		padding: 2rem 1rem 4rem;
	}

	.legal-container {
		max-width: 820px;
		margin: 0 auto;
	}

	.legal-header {
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

	.back-link:hover {
		text-decoration: underline;
	}

	.legal-header h1 {
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 800;
		color: #0f172a;
		margin: 0.25rem 0 0.5rem;
	}

	.last-updated {
		color: #64748b;
		font-size: 0.875rem;
		margin: 0;
	}

	.legal-content {
		background: #fff;
		border-radius: 16px;
		padding: 2.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
		color: #1e293b;
		line-height: 1.75;
	}

	.legal-content h2 {
		font-size: 1.25rem;
		font-weight: 700;
		color: #0f172a;
		margin: 2rem 0 0.75rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e2e8f0;
	}

	.legal-content h2:first-child {
		margin-top: 0;
		padding-top: 0;
		border-top: none;
	}

	.legal-content h3 {
		font-size: 1rem;
		font-weight: 600;
		color: #334155;
		margin: 1.25rem 0 0.5rem;
	}

	.legal-content p,
	.legal-content li {
		color: #475569;
		font-size: 0.95rem;
	}

	.legal-content ul {
		padding-left: 1.5rem;
		margin: 0.5rem 0 1rem;
	}

	.legal-content li {
		margin-bottom: 0.4rem;
	}

	.legal-content a {
		color: #0ea5e9;
		text-decoration: underline;
	}

	.legal-content table {
		width: 100%;
		border-collapse: collapse;
		margin: 1rem 0;
		font-size: 0.9rem;
	}

	.legal-content th,
	.legal-content td {
		text-align: left;
		padding: 0.6rem 0.75rem;
		border: 1px solid #e2e8f0;
	}

	.legal-content th {
		background: #f1f5f9;
		font-weight: 600;
		color: #0f172a;
	}

	code {
		background: #f1f5f9;
		padding: 0.1em 0.4em;
		border-radius: 4px;
		font-size: 0.875em;
	}
</style>
