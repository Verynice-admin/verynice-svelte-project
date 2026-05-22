<script>
	import { onMount } from 'svelte';

	const sections = [
		{ id: 's1',  label: '1. About This Policy' },
		{ id: 's2',  label: '2. Data Controller' },
		{ id: 's3',  label: '3. Data We Collect' },
		{ id: 's4',  label: '4. Legal Bases (GDPR)' },
		{ id: 's5',  label: '5. Cookies & Tracking' },
		{ id: 's6',  label: '6. Third-Party Services' },
		{ id: 's7',  label: '7. Advertising & Affiliates' },
		{ id: 's8',  label: '8. AI Services' },
		{ id: 's9',  label: '9. Storage & Security' },
		{ id: 's10', label: '10. Data Localisation (KZ)' },
		{ id: 's11', label: '11. Data Retention' },
		{ id: 's12', label: '12. Sharing Your Data' },
		{ id: 's13', label: '13. International Transfers' },
		{ id: 's14', label: '14. Your Rights' },
		{ id: 's15', label: '15. Rights — EEA & UK' },
		{ id: 's16', label: '16. Rights — Kazakhstan' },
		{ id: 's17', label: '17. Children\'s Privacy' },
		{ id: 's18', label: '18. Breach Notification' },
		{ id: 's19', label: '19. Policy Changes' },
		{ id: 's20', label: '20. Contact & Complaints' },
		{ id: 's21', label: '21. Kazakh / Қазақша' },
	];

	let activeId = 's1';

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) { activeId = entry.target.id; break; }
				}
			},
			{ rootMargin: '-20% 0px -70% 0px', threshold: 0 }
		);
		sections.forEach(({ id }) => {
			const el = document.getElementById(id);
			if (el) observer.observe(el);
		});
		return () => observer.disconnect();
	});
</script>

<svelte:head>
	<title>Privacy Policy | VeryNice.kz</title>
	<meta name="description" content="Privacy Policy for VeryNice.kz — how we collect, use, protect, and share personal data under Kazakhstan Law No. 94-V, GDPR, and UK GDPR." />
	<meta name="robots" content="noindex, follow" />
	<link rel="canonical" href="https://verynice.kz/privacy" />
</svelte:head>

<div class="doc-page">

	<!-- ── BANNER ─────────────────────────────────────────────────────── -->
	<div class="doc-banner">
		<div class="banner-inner">
			<a href="/" class="back-link">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				Home
			</a>
			<div class="banner-body">
				<div class="doc-type-label">Legal Document</div>
				<h1>Privacy Policy</h1>
				<div class="doc-meta-row">
					<span class="meta-pill">
						<svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
							<path d="M5 1v4M11 1v4M2 7h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
						</svg>
						Last updated: 17 May 2026
					</span>
					<span class="meta-pill">
						<svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
							<path d="M8 5v3.5l2 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
						</svg>
						Version 2.0
					</span>
					<span class="meta-pill">
						<svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<path d="M8 2C5.79 2 4 3.79 4 6c0 3 4 8 4 8s4-5 4-8c0-2.21-1.79-4-4-4z" stroke="currentColor" stroke-width="1.5"/>
							<circle cx="8" cy="6" r="1.25" stroke="currentColor" stroke-width="1.25"/>
						</svg>
						GDPR · KZ Law No. 94-V
					</span>
				</div>
			</div>
		</div>
	</div>

	<!-- ── IMPORTANT NOTICE ───────────────────────────────────────────── -->
	<div class="notice-wrapper">
		<div class="notice-inner">
			<div class="notice-box">
				<svg class="notice-icon" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
					<path d="M10 2L2 17h16L10 2z" stroke="#92400e" stroke-width="1.5" stroke-linejoin="round"/>
					<path d="M10 8v4M10 14.5v.5" stroke="#92400e" stroke-width="1.75" stroke-linecap="round"/>
				</svg>
				<p>
					<strong>Ресми тіл — Қазақша · Authoritative language: KAZAKH.</strong>
					The legally binding version of this Policy is in Kazakh per Law No. 7-I —
					see <a href="#s21">§21</a>. English is a convenience translation only.
					This Policy also covers <strong>cookies</strong> (§5),
					<strong>Google Analytics</strong> (§6), <strong>advertising</strong> (§7), and
					<strong>AI processing</strong> (§8). Withdraw cookie consent at any time via the
					preference centre. Rights requests: <a href="#s14">§14–§16</a>.
				</p>
			</div>
		</div>
	</div>

	<!-- ── MAIN LAYOUT ────────────────────────────────────────────────── -->
	<div class="doc-layout">

		<!-- TOC sidebar -->
		<aside class="toc-sidebar" aria-label="Table of contents">
			<div class="toc-inner">
				<p class="toc-heading">Contents</p>
				<nav>
					<ul class="toc-list">
						{#each sections as s}
							<li class:active={activeId === s.id}>
								<a href="#{s.id}">{s.label}</a>
							</li>
						{/each}
					</ul>
				</nav>
			</div>
		</aside>

		<!-- Document body -->
		<article class="legal-body">

			<!-- ── 1 ─────────────────────────────────────────────────────── -->
			<section id="s1">
				<h2>1. About This Policy</h2>
				<p>
					This Privacy Policy explains how <strong>VeryNice.kz</strong> ("we", "us", "our") collects,
					uses, stores, shares, and protects your personal data when you visit or interact with the
					Site. It applies to:
				</p>
				<ul>
					<li>browsing the Site without an account</li>
					<li>creating an account and signing in</li>
					<li>posting comments or reviews</li>
					<li>registering or managing a Business Account</li>
					<li>using any interactive or AI-powered features</li>
				</ul>
				<p>
					This Policy should be read alongside our <a href="/terms">Terms of Use</a> and Cookie
					Policy. The Terms of Use govern your use of the Site. In the event of any inconsistency
					between this Policy and the Terms, this Policy prevails on data protection matters.
				</p>
				<div class="callout callout-warning">
					<strong>Ресми тіл — ҚАЗАҚША · Authoritative Language: KAZAKH.</strong>
					In accordance with the Law of the Republic of Kazakhstan No. 7-I "On Languages in
					the Republic of Kazakhstan" (11 November 1997, as amended) and Article 8 of Law
					No. 18-VIII (2023), the <strong>primary and authoritative language</strong> of this
					Privacy Policy is <strong>Kazakh (Қазақша)</strong>. In the event of any
					inconsistency between the Kazakh version and any other language version,
					<strong>the Kazakh version prevails unconditionally.</strong> For any legal
					proceedings in the courts of the Republic of Kazakhstan, only the Kazakh version
					shall be treated as the authoritative binding text. The full Kazakh-language version
					is provided in <a href="#s21">Section 21</a>.
				</div>
				<p>
					Russian is provided as the second official language of the Republic of Kazakhstan per
					Article 7(2) of the Constitution and Article 5 of Law No. 7-I. The English version is
					a convenience translation for international users and does not constitute a legally
					binding document for purposes of any proceedings in Kazakhstan.
				</p>
			</section>

			<!-- ── 2 ─────────────────────────────────────────────────────── -->
			<section id="s2">
				<h2>2. Data Controller</h2>
				<p>
					The data controller for personal data processed through VeryNice.kz is the individual
					operator of the Site, reachable at
					<a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>.
				</p>
				<div class="callout callout-neutral">
					<strong>Operator identity and registration status.</strong> The Site is currently operated
					by a private individual. The operator is in the process of registering as an Individual
					Entrepreneur (ЖК / ИП) under the laws of the Republic of Kazakhstan. Under Kazakhstan
					Law No. 94-V, the operator acts as the <em>owner of the personal data database</em>
					(оператор дербес деректер базасының иесі). Upon completion of IE registration, this
					Policy will be updated with the full registered entity name and BIN/IIN. Full legal
					identity details are available on written request to
					<a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>.
				</div>
				<div class="callout callout-info">
					<strong>EU/EEA — Article 27 GDPR Representative.</strong> We have not yet appointed a
					formal EU representative under Article 27 of the GDPR. We are responsive to data
					protection enquiries at the email above. If our processing activities require a formal
					Article 27 representative, one will be appointed and this Policy updated accordingly.
				</div>
				<div class="callout callout-warning">
					<strong>Personal data database registration — Law No. 94-V, Article 19
					(ДБ тіркеу — № 94-V Заңының 19-бабы).</strong>
					Under Article 19 of the Law of the Republic of Kazakhstan No. 94-V "On Personal Data
					and their Protection" (as amended), the <em>owner of a personal data database</em>
					containing personal data of Kazakhstan citizens must notify and register the database
					with the <strong>Committee for Information Security of the Ministry of Digital
					Development, Innovations and Aerospace Industry (MDDIA)</strong> prior to commencing
					processing. The operator is actively completing this registration as a matter of priority. Processing personal data of Kazakhstan citizens without completing Article 19 registration constitutes a violation of Law No. 94-V. The operator will update this Policy immediately upon receiving the registration reference number from MDDIA. Users in Kazakhstan may verify registration status by contacting
					<a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>.
				</div>
			</section>

			<!-- ── 3 ─────────────────────────────────────────────────────── -->
			<section id="s3">
				<h2>3. Personal Data We Collect</h2>
				<div class="callout callout-info">
					<strong>Purpose limitation — Law No. 94-V, Article 6.</strong>
					Personal data is collected only for specific, explicit, and legitimate purposes and
					is not processed in a manner incompatible with those purposes (Law No. 94-V,
					Art. 6). We collect only the minimum data necessary for each stated purpose
					(data minimisation). The purpose of each collection is stated in the relevant
					sub-section below. Data collected for one purpose will not be repurposed for an
					incompatible use without fresh legal basis or your prior consent.
				</div>
				<dl class="term-list">
					<dt>3.1 Account and authentication data</dt>
					<dd>
						When you sign in using Google OAuth (or other future Third-Party Authentication Providers),
						that provider shares with us: your display name, email address, and profile photo URL.
						We store in our database (Firebase Firestore): your provider user ID, email address,
						display name, account role (traveller / business), and account creation timestamp.
						We do not receive or store passwords — your credentials remain solely with your chosen provider.
					</dd>

					<dt>3.2 User-generated content (comments and reviews)</dt>
					<dd>
						When you post a comment or review: the comment/review text; your display name (optional —
						you may post anonymously); your user ID if signed in; and the submission timestamp.
						Your IP address is also captured in server logs (see §3.5) for abuse prevention.
					</dd>

					<dt>3.3 Business account data</dt>
					<dd>
						When you register a Business Account: business name, type, and description; contact
						details (phone, email, address); Business Identification Number (BIN / БСН) or IIN / ЖСН
						where provided for verification; business location and operating hours; images and media
						you upload; and pricing information.
					</dd>

					<dt>3.4 Analytics data (with your consent)</dt>
					<dd>
						If you consent to analytics cookies, Google Analytics 4 (GA4) collects: pages visited
						and engagement events; time on page; approximate geolocation (country/city, derived from
						anonymised IP); device type, operating system, and browser; referring URL; and IP address
						(sent to Google, anonymised before storage by GA4). You can withdraw consent at any time
						via the cookie preference centre.
					</dd>

					<dt>3.5 Advertising data (with your consent)</dt>
					<dd>
						If you consent to advertising cookies, third-party advertising networks may collect:
						advertising identifiers, ad impressions and clicks, approximate location, browsing
						behaviour within the Site, and pseudonymous device fingerprint data. See <a href="#s7">§7</a>
						for details and opt-out options.
					</dd>

					<dt>3.6 Server and infrastructure logs</dt>
					<dd>
						Our hosting provider (Vercel) automatically logs: your IP address, HTTP request metadata
						(URL, method, status code, referrer, user agent), and request timestamps. These logs are
						controlled by Vercel per their own privacy policy (typically retained for 30 days). We do
						not actively access these logs except to investigate security incidents or technical issues.
					</dd>

					<dt>3.7 Language preference</dt>
					<dd>
						Your chosen language is stored in your browser's <code>localStorage</code>. This data
						never leaves your device and is not transmitted to our servers.
					</dd>

					<dt>3.8 What we do NOT collect</dt>
					<dd>
						<ul>
							<li>Payment card or banking data — no payments are processed on the Site</li>
							<li>Government-issued ID numbers from general users (only BIN/IIN from Business Account holders)</li>
							<li>Precise GPS-level geolocation — we do not request device location permissions</li>
							<li>Sensitive personal data — we do not knowingly or intentionally collect health, biometric, or political data through our systems. Note: user-generated content (comments, reviews) submitted by users may incidentally contain restricted personal data categories (see §3.9); such content is subject to our content moderation process.</li>
						</ul>
					</dd>

					<dt>3.9 Restricted personal data — Kazakhstan Law No. 94-V, Article 8
					(Шектеулі дербес деректер)</dt>
					<dd>
						Kazakhstan Law No. 94-V Article 8 designates certain categories of personal data as
						<strong>"restricted personal data" (шектеулі дербес деректер)</strong>, which require
						explicit written consent and heightened protection. Restricted categories include:
						racial or ethnic origin; political opinions; religious or philosophical beliefs;
						membership of political parties or religious organisations; criminal convictions or
						offences; health or medical information; and sexual orientation or sex life.
						<br><br>
						<strong>We do not knowingly request or collect restricted personal data</strong>
						from users of VeryNice.kz. If you believe you have inadvertently submitted restricted
						personal data through the Site (for example, through a comment or review), please
						contact us immediately at
						<a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a> so that we
						can arrange its secure and verified deletion in accordance with Article 21 of
						Law No. 94-V.
					</dd>
				</dl>
			</section>

			<!-- ── 4 ─────────────────────────────────────────────────────── -->
			<section id="s4">
				<h2>4. Legal Bases for Processing (GDPR)</h2>
				<p>
					For users in the EEA and United Kingdom, we process personal data on the following legal
					bases under Article 6 of the GDPR (Regulation (EU) 2016/679):
				</p>
				<div class="data-table-wrap">
					<table class="data-table">
						<thead>
							<tr>
								<th>Processing activity</th>
								<th>Legal basis</th>
								<th>Article 6</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Account registration and management</td>
								<td>Performance of contract</td>
								<td>Art. 6(1)(b)</td>
							</tr>
							<tr>
								<td>Publishing and moderating comments</td>
								<td>Legitimate interest (platform operation)</td>
								<td>Art. 6(1)(f)</td>
							</tr>
							<tr>
								<td>Business listing management</td>
								<td>Performance of contract</td>
								<td>Art. 6(1)(b)</td>
							</tr>
							<tr>
								<td>Google Analytics 4 (analytics cookies)</td>
								<td>Consent — opt-in via cookie banner</td>
								<td>Art. 6(1)(a)</td>
							</tr>
							<tr>
								<td>Advertising/targeting cookies</td>
								<td>Consent — opt-in via cookie banner</td>
								<td>Art. 6(1)(a)</td>
							</tr>
							<tr>
								<td>Essential session cookies (Firebase)</td>
								<td>Legitimate interest (strictly necessary)</td>
								<td>Art. 6(1)(f)</td>
							</tr>
							<tr>
								<td>Server logs / security monitoring</td>
								<td>Legitimate interest (security, abuse prevention)</td>
								<td>Art. 6(1)(f)</td>
							</tr>
							<tr>
								<td>AI content moderation</td>
								<td>Legitimate interest (safety, platform integrity)</td>
								<td>Art. 6(1)(f)</td>
							</tr>
							<tr>
								<td>Legal compliance and rights requests</td>
								<td>Legal obligation</td>
								<td>Art. 6(1)(c)</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p>
					Where processing is based on consent, you may withdraw that consent at any time without
					affecting the lawfulness of processing carried out before withdrawal. To withdraw: use
					the cookie preference centre, or email
					<a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>.
				</p>
			</section>

			<!-- ── 5 ─────────────────────────────────────────────────────── -->
			<section id="s5">
				<h2>5. Cookies and Tracking Technologies</h2>

				<p>
					On your first visit, a cookie consent banner lets you accept all cookies, customise
					preferences by category, or reject all non-essential cookies. You can change your
					preferences at any time via the cookie preference centre on the Site.
				</p>

				<h3>5.1 Essential cookies (cannot be disabled)</h3>
				<div class="data-table-wrap">
					<table class="data-table">
						<thead><tr><th>Cookie</th><th>Provider</th><th>Purpose</th><th>Expiry</th></tr></thead>
						<tbody>
							<tr><td><code>__session</code></td><td>Firebase / Google</td><td>User authentication session token — keeps you signed in</td><td>Session</td></tr>
							<tr><td><code>FIREBASE_APPCHECK_TOKEN</code></td><td>Firebase / Google</td><td>App Check token to prevent API abuse</td><td>Session</td></tr>
						</tbody>
					</table>
				</div>

				<h3>5.2 Analytics cookies (consent required)</h3>
				<div class="data-table-wrap">
					<table class="data-table">
						<thead><tr><th>Cookie</th><th>Provider</th><th>Purpose</th><th>Expiry</th></tr></thead>
						<tbody>
							<tr><td><code>_ga</code></td><td>Google Analytics 4</td><td>Distinguishes unique users across sessions</td><td>2 years</td></tr>
							<tr><td><code>_ga_XXXXXXXX</code></td><td>Google Analytics 4</td><td>Maintains session state for GA4</td><td>2 years</td></tr>
							<tr><td><code>_gid</code></td><td>Google Analytics 4</td><td>Session-level user distinction</td><td>24 hours</td></tr>
						</tbody>
					</table>
				</div>
				<p>
					Additional opt-out: install the
					<a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>.
				</p>

				<h3>5.3 Advertising and targeting cookies (consent required)</h3>
				<p>
					Third-party advertising networks (which may include Google AdSense) set cookies when you
					consent. The specific cookies vary by active network and are listed in the cookie preference
					centre. Opt-out options:
				</p>
				<ul>
					<li>Cookie preference centre on this Site</li>
					<li>YourAdChoices: <a href="https://youradchoices.com" target="_blank" rel="noopener noreferrer">youradchoices.com</a></li>
					<li>NAI opt-out: <a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer">optout.networkadvertising.org</a></li>
					<li>Google ad settings: <a href="https://myaccount.google.com/ad-settings" target="_blank" rel="noopener noreferrer">myaccount.google.com/ad-settings</a></li>
				</ul>

				<h3>5.4 localStorage (not a cookie)</h3>
				<p>
					We store your language preference in browser <code>localStorage</code> under the key
					<code>language_preference</code>. This data is never transmitted to our servers and is
					erased when you clear your browser's site data.
				</p>
			</section>

			<!-- ── 6 ─────────────────────────────────────────────────────── -->
			<section id="s6">
				<h2>6. Third-Party Services and Sub-Processors</h2>
				<p>
					We share personal data with the following third-party services acting as data processors
					on our behalf. Each is bound by appropriate data protection agreements and processes
					data only for the purposes described.
				</p>
				<div class="data-table-wrap">
					<table class="data-table">
						<thead>
							<tr>
								<th>Service</th>
								<th>Purpose</th>
								<th>Data received</th>
								<th>Location</th>
								<th>Safeguard</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td><strong>Firebase Authentication</strong> (Google LLC)</td>
								<td>User authentication</td>
								<td>User ID, email, display name</td>
								<td>USA</td>
								<td>SCCs / DPF</td>
							</tr>
							<tr>
								<td><strong>Firebase Firestore</strong> (Google LLC)</td>
								<td>Database — users, comments, listings</td>
								<td>Account data, comment text, business data</td>
								<td>USA</td>
								<td>SCCs / DPF</td>
							</tr>
							<tr>
								<td><strong>Vercel Inc.</strong></td>
								<td>Hosting and edge deployment</td>
								<td>IP address, request logs</td>
								<td>USA / global edge</td>
								<td>SCCs</td>
							</tr>
							<tr>
								<td><strong>Cloudinary Ltd.</strong></td>
								<td>Image hosting and optimisation</td>
								<td>Image files (no personal data unless images contain identifiable persons)</td>
								<td>USA</td>
								<td>SCCs</td>
							</tr>
							<tr>
								<td><strong>Groq Inc.</strong></td>
								<td>AI translation and content moderation</td>
								<td>Content text (pseudonymised — no user identifiers attached)</td>
								<td>USA</td>
								<td>DPA / SCCs</td>
							</tr>
							<tr>
								<td><strong>Google Gemini / Vertex AI</strong> (Google LLC)</td>
								<td>AI translation services</td>
								<td>Content text</td>
								<td>USA / EU</td>
								<td>SCCs / DPF</td>
							</tr>
							<tr>
								<td><strong>OpenRouter Inc.</strong></td>
								<td>AI model routing</td>
								<td>Content text</td>
								<td>USA</td>
								<td>DPA / SCCs</td>
							</tr>
							<tr>
								<td><strong>Google Analytics 4</strong> (Google LLC)</td>
								<td>Usage analytics (consent required)</td>
								<td>Usage data, anonymised IP, device info</td>
								<td>USA</td>
								<td>DPF / SCCs</td>
							</tr>
							<tr>
								<td><strong>Open-Meteo</strong></td>
								<td>Weather data for Almaty widget</td>
								<td>City name only — no personal data</td>
								<td>Switzerland / EU</td>
								<td>N/A (no personal data)</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p>
					<strong>SCCs</strong> = EU Standard Contractual Clauses (EC Decision 2021/914).
					<strong>DPF</strong> = EU-US Data Privacy Framework.
					<strong>DPA</strong> = Data Processing Agreement.
					Copies of applicable transfer safeguards are available on request at
					<a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>.
				</p>
			</section>

			<!-- ── 7 ─────────────────────────────────────────────────────── -->
			<section id="s7">
				<h2>7. Advertising, Sponsored Content, and Affiliate Links</h2>
				<dl class="term-list">
					<dt>7.1 Display advertising</dt>
					<dd>
						The Site displays third-party advertisements. When you consent to advertising cookies,
						advertising networks may collect pseudonymous identifiers and serve personalised ads
						based on your browsing behaviour. Advertisements are not endorsements of the advertised
						products or services.
					</dd>

					<dt>7.2 Sponsored content</dt>
					<dd>
						All paid advertising and sponsored content is clearly labelled as "Sponsored",
						"Advertisement", or equivalent, in accordance with Kazakhstan Law No. 508-II
						"On Advertising" and Law No. 18-VIII "On Online Platforms and Online Advertising" (2023).
						Commercial relationships do not influence editorial content or ratings.
					</dd>

					<dt>7.3 Affiliate links</dt>
					<dd>
						The Site contains affiliate links to booking platforms and travel services. If you click
						an affiliate link and make a purchase, we may receive a commission at no additional cost
						to you. No personal data about you is shared with affiliated third parties via our links —
						any data you provide to those sites is governed by their own privacy policies.
					</dd>

					<dt>7.4 How to opt out of personalised advertising</dt>
					<dd>
						<ul>
							<li>Cookie preference centre on this Site</li>
							<li>YourAdChoices — <a href="https://youradchoices.com" target="_blank" rel="noopener noreferrer">youradchoices.com</a></li>
							<li>NAI — <a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer">optout.networkadvertising.org</a></li>
							<li>Google ad settings — <a href="https://myaccount.google.com/ad-settings" target="_blank" rel="noopener noreferrer">myaccount.google.com/ad-settings</a></li>
						</ul>
					</dd>
				</dl>
			</section>

			<!-- ── 8 ─────────────────────────────────────────────────────── -->
			<section id="s8">
				<h2>8. AI Translation and Content Moderation</h2>
				<dl class="term-list">
					<dt>8.1 AI translation</dt>
					<dd>
						Non-English versions of Site content are produced using AI translation services
						(currently Groq, Google Gemini, and/or OpenRouter-routed models). When translation
						is invoked, the text content is sent to the AI service. We do not attach your personal
						data to translation requests. AI translations may contain errors or inaccuracies and
						are provided for convenience only — the English version is authoritative.
					</dd>

					<dt>8.2 AI content moderation</dt>
					<dd>
						User-submitted content (comments, reviews) may be processed by AI tools to detect
						material that violates our Terms of Use (hate speech, spam, illegal content). Comment
						text is sent to the AI service; we do not attach your email or other identifying data
						to moderation requests. Moderation decisions may also be reviewed by human moderators.
					</dd>

					<dt>8.3 EU AI Act compliance</dt>
					<dd>
						The EU Artificial Intelligence Act (Regulation (EU) 2024/1689) entered into force in
						August 2024 with obligations phasing in through 2025–2027. Under Article 50, we intend
						to implement machine-readable labelling of AI-generated content as applicable obligations
						come into effect for platforms serving EU users. This Policy will be updated accordingly.
					</dd>
				</dl>
			</section>

			<!-- ── 9 ─────────────────────────────────────────────────────── -->
			<section id="s9">
				<h2>9. Data Storage and Security</h2>
				<p>User data is stored in:</p>
				<ul>
					<li><strong>Google Firebase</strong> (Firestore and Authentication) — Google Cloud infrastructure</li>
					<li><strong>Vercel Edge Network</strong> — for server-rendered pages and API functions</li>
				</ul>
				<p>Security measures in place include:</p>
				<ul>
					<li>Transport Layer Security (TLS / HTTPS) on all connections</li>
					<li>Firebase Authentication with secure HTTP-only session tokens</li>
					<li>Role-based access controls on the Firestore database</li>
					<li>No storage of payment data on our systems</li>
					<li>Regular review of third-party service security posture</li>
				</ul>
				<div class="callout callout-neutral">
					<strong>Legal security obligation — Law No. 94-V, Article 17.</strong>
					The operator implements technical and organisational measures to protect personal data
					from unlawful or accidental access, destruction, modification, blocking, copying,
					distribution, and other unlawful actions, in accordance with Article 17 of Law No. 94-V
					"On Personal Data and their Protection." While we implement reasonable measures, no
					internet-based system can guarantee absolute security. In the event of a personal data
					breach, we will act in accordance with <a href="#s18">§18</a>.
				</div>
			</section>

			<!-- ── 10 ─────────────────────────────────────────────────────── -->
			<section id="s10">
				<h2>10. Data Localisation — Kazakhstan</h2>
				<p>
					Article 17 of the Law of the Republic of Kazakhstan No. 94-V "On Personal Data and their
					Protection" (as amended, including the July 2024 amendments) requires that personal data
					of individuals in Kazakhstan falling within the category of "restricted personal data"
					(жеке сипаттағы деректер) be collected, processed, and stored on servers physically
					located in the territory of the Republic of Kazakhstan.
				</p>
				<div class="callout callout-warning">
					<strong>Current compliance status.</strong> Our primary infrastructure providers (Google
					Firebase, Vercel) are US-headquartered and operate data centres globally. We are actively
					reviewing our data localisation obligations under Law No. 94-V and will update this section
					as we achieve compliance with applicable server-location requirements. Until compliant
					local server routing is confirmed, cross-border transfers are subject to the notification
					procedure in <a href="#s13">§13</a>.
				</div>
				<p>
					Users in Kazakhstan with specific concerns about the localisation of their personal data
					may contact us at <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>.
				</p>
			</section>

			<!-- ── 11 ─────────────────────────────────────────────────────── -->
			<section id="s11">
				<h2>11. Data Retention</h2>
				<div class="data-table-wrap">
					<table class="data-table">
						<thead>
							<tr><th>Data type</th><th>Retention period</th><th>Basis</th></tr>
						</thead>
						<tbody>
							<tr>
								<td>Account data (user profile, email)</td>
								<td>Duration of active account + <strong>3 years</strong> after deletion or last login</td>
								<td>Legitimate interest / legal obligation</td>
							</tr>
							<tr>
								<td>Comments and reviews</td>
								<td>Duration of publication; deleted on account deletion request or takedown notice</td>
								<td>Legitimate interest</td>
							</tr>
							<tr>
								<td>Business account data (BIN/IIN, listing info)</td>
								<td>Duration of active listing + <strong>3 years</strong> after account closure</td>
								<td>Contract / KZ tax law (up to 5 years for accounting records)</td>
							</tr>
							<tr>
								<td>Google Analytics data</td>
								<td>Up to <strong>26 months</strong> (GA4 default setting)</td>
								<td>Consent</td>
							</tr>
							<tr>
								<td>Essential session cookies</td>
								<td>Session duration (cleared on sign-out)</td>
								<td>Strictly necessary</td>
							</tr>
							<tr>
								<td>Server logs (Vercel)</td>
								<td>~<strong>30 days</strong> per Vercel policy</td>
								<td>Legitimate interest</td>
							</tr>
							<tr>
								<td>Language preference (localStorage)</td>
								<td>Until you clear browser site data</td>
								<td>Legitimate interest</td>
							</tr>
							<tr>
								<td>Data relating to legal claims</td>
								<td>Duration of active claim + applicable limitation period</td>
								<td>Legitimate interest / legal obligation</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p>
					When retention periods expire, we securely delete or anonymise the relevant data unless
					a longer period is required by applicable law.
				</p>
			</section>

			<!-- ── 12 ─────────────────────────────────────────────────────── -->
			<section id="s12">
				<h2>12. Sharing Your Data</h2>
				<div class="callout callout-info">
					<strong>We do not sell personal data.</strong> We do not share personal data with third
					parties for their own marketing or commercial profiling purposes.
				</div>
				<p>We share data only in the following circumstances:</p>
				<dl class="term-list">
					<dt>12.1 With sub-processors</dt>
					<dd>As listed in <a href="#s6">§6</a>, for the purposes described, under data processing agreements.</dd>

					<dt>12.2 If required by law</dt>
					<dd>In response to a lawful court order, regulatory requirement, or other mandatory legal
					obligation — including requirements of the Ministry of Digital Development, Innovations
					and Aerospace Industry of the Republic of Kazakhstan.</dd>

					<dt>12.3 Business continuity</dt>
					<dd>In the event of a sale, merger, or restructuring of the operator's business, to a
					successor entity that assumes all data protection obligations under this Policy. You will
					be notified of any such transfer.</dd>

					<dt>12.4 With your explicit consent</dt>
					<dd>In any other circumstances, only with your prior written consent.</dd>
				</dl>
				<p>
					<strong>Public content.</strong> Comments and reviews you post on the Site are visible to
					all visitors and should be treated as public. If you wish to have a public comment removed,
					contact <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>.
				</p>
			</section>

			<!-- ── 13 ─────────────────────────────────────────────────────── -->
			<section id="s13">
				<h2>13. International Data Transfers</h2>
				<p>
					Most of our sub-processors are located in the United States. Data is transferred to the
					US and other countries under the following safeguards:
				</p>
				<dl class="term-list">
					<dt>13.1 EEA and UK users (GDPR / UK GDPR)</dt>
					<dd>
						<ul>
							<li><strong>Google</strong> (Firebase, GA4, Gemini): EU-US Data Privacy Framework (DPF) and Standard Contractual Clauses (Module 2: Controller to Processor, EC Decision 2021/914)</li>
							<li><strong>Vercel</strong>: Standard Contractual Clauses (EC Decision 2021/914)</li>
							<li><strong>Cloudinary</strong>: Standard Contractual Clauses</li>
							<li><strong>Groq / OpenRouter</strong>: Data Processing Agreements incorporating SCCs or equivalent safeguards</li>
						</ul>
					</dd>

					<dt>13.2 Kazakhstan users (Law No. 94-V)</dt>
					<dd>
						Cross-border transfer of personal data of Kazakhstan residents requires notification
						to the Committee for Information Security of MDDIA under Article 18 of Law No. 94-V.
						<strong>This notification must be submitted and acknowledged by MDDIA
						before the first cross-border transfer of any category of personal data
						commences.</strong> We submit the required Article 18 notification to MDDIA
						prior to initiating any relevant cross-border data transfer. Where "restricted
						personal data" (Law No. 94-V, Art. 8) is involved, data localisation requirements
						apply and cross-border transfer of such data may require separate written consent
						from the data subject (see <a href="#s10">§10</a>).
					</dd>
				</dl>
				<p>
					You may request a copy of the relevant transfer safeguards by emailing
					<a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>.
				</p>
			</section>

			<!-- ── 14 ─────────────────────────────────────────────────────── -->
			<section id="s14">
				<h2>14. Your Rights (All Users)</h2>
				<p>Regardless of your location, you may at any time:</p>
				<dl class="term-list">
					<dt>Access</dt>
					<dd>Request confirmation of whether we hold personal data about you, and receive a copy.</dd>

					<dt>Rectification</dt>
					<dd>Request correction of inaccurate or incomplete personal data.</dd>

					<dt>Erasure</dt>
					<dd>Request deletion of your personal data (subject to legal retention obligations).</dd>

					<dt>Withdraw consent</dt>
					<dd>Withdraw any consent you have given at any time, without affecting prior lawful processing.
					Use the cookie preference centre for cookie consent, or email us for other consent.</dd>

					<dt>Account deletion</dt>
					<dd>Request deletion of your account and all associated personal data. We will process
					the deletion within 30 days and confirm by email.</dd>
				</dl>
				<p>
					To exercise any right: email <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>
					with your name, account email, and a description of your request. We will respond within
					<strong>30 calendar days</strong> (GDPR) or within <strong>10 working days</strong>
					for access requests under Kazakhstan Law No. 94-V.
				</p>
			</section>

			<!-- ── 15 ─────────────────────────────────────────────────────── -->
			<section id="s15">
				<h2>15. Additional Rights — EEA and UK (GDPR / UK GDPR)</h2>
				<p>If you are located in the EEA or United Kingdom, in addition to the rights in <a href="#s14">§14</a>, you have:</p>
				<dl class="term-list">
					<dt>15.1 Right to restriction of processing</dt>
					<dd>Request that we restrict processing of your data while a dispute is under review.</dd>

					<dt>15.2 Right to data portability</dt>
					<dd>Receive your data in a structured, commonly used, machine-readable format (where processing
					is based on consent or contract and carried out by automated means).</dd>

					<dt>15.3 Right to object</dt>
					<dd>Object to processing based on legitimate interests. We will cease unless we can demonstrate
					compelling legitimate grounds that override your interests.</dd>

					<dt>15.4 Rights related to automated decision-making</dt>
					<dd>We do not make solely automated decisions that produce legal or similarly significant
					effects on individuals.</dd>

					<dt>15.5 Right to lodge a complaint with a supervisory authority</dt>
					<dd>
						You have the right at any time to lodge a complaint with the data protection authority
						in your country of residence. Key authorities:
						<ul>
							<li><strong>UK</strong>: Information Commissioner's Office (ICO) — <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a></li>
							<li><strong>Germany</strong>: BfDI — <a href="https://www.bfdi.bund.de" target="_blank" rel="noopener noreferrer">bfdi.bund.de</a></li>
							<li><strong>France</strong>: CNIL — <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">cnil.fr</a></li>
							<li><strong>Netherlands</strong>: AP — <a href="https://www.autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer">autoriteitpersoonsgegevens.nl</a></li>
							<li><strong>All EEA authorities</strong>: <a href="https://www.edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener noreferrer">edpb.europa.eu</a></li>
						</ul>
					</dd>
				</dl>
			</section>

			<!-- ── 16 ─────────────────────────────────────────────────────── -->
			<section id="s16">
				<h2>16. Additional Rights — Kazakhstan (Law No. 94-V)</h2>
				<p>
					Under the Law of the Republic of Kazakhstan No. 94-V "On Personal Data and their Protection"
					(as amended, including the July 2024 amendments), data subjects in Kazakhstan have:
				</p>
				<dl class="term-list">
					<dt>16.1 Right to access</dt>
					<dd>Obtain information about whether and how your personal data is processed, and receive a copy within 10 working days of request.</dd>

					<dt>16.2 Right to rectification</dt>
					<dd>Require correction of inaccurate or incomplete personal data.</dd>

					<dt>16.3 Right to deletion (блокирование/жою)</dt>
					<dd>Require deletion of your personal data where it is no longer necessary for the original purpose, consent has been withdrawn, or processing is unlawful.</dd>

					<dt>16.4 Right to restriction</dt>
					<dd>Require that processing be suspended pending resolution of a dispute or verification of accuracy.</dd>

					<dt>16.5 Right to object to processing for marketing</dt>
					<dd>Object at any time to processing of your data for direct marketing purposes; we will cease such processing immediately.</dd>

					<dt>16.6 Supervisory authority</dt>
					<dd>
						Complaints regarding personal data processing may be submitted to the
						<strong>Committee for Information Security of the Ministry of Digital Development,
						Innovations and Aerospace Industry of the Republic of Kazakhstan (MDDIA)</strong>.
						The Committee for Information Security of MDDIA is reachable via the official portal at
						<a href="https://www.gov.kz/memleket/entities/mdi" target="_blank" rel="noopener noreferrer">gov.kz/memleket/entities/mdi</a>
						or at <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a> for assistance locating the correct submission procedure.
					</dd>
				</dl>
			</section>

			<!-- ── 17 ─────────────────────────────────────────────────────── -->
			<section id="s17">
				<h2>17. Children's Privacy</h2>
				<dl class="term-list">
					<dt>17.1 General minimum age</dt>
					<dd>
						We do not knowingly collect personal data from children under <strong>13 years of age</strong>.
						If we discover that a child under 13 has provided personal data, we will delete it promptly.
					</dd>

					<dt>17.2 EEA and UK users</dt>
					<dd>
						For users in the EEA and United Kingdom, the minimum age for providing independent
						consent to personal data processing is <strong>16 years</strong> under Article 8 of
						the GDPR, unless the applicable national law of the user's Member State sets a lower
						age (minimum 13). If a user is between 13 and the applicable consent age in their
						country, the explicit written consent of a parent or legal guardian is required before
						the user creates an account or submits any personal data.
					</dd>

					<dt>17.3 Parental or guardian report</dt>
					<dd>
						If you are a parent or guardian and believe your child under the applicable consent age
						has used the Site without your knowledge, please contact us immediately at
						<a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a> so that we can
						take appropriate action, including account deletion and data erasure.
					</dd>
				</dl>
			</section>

			<!-- ── 18 ─────────────────────────────────────────────────────── -->
			<section id="s18">
				<h2>18. Data Breach Notification</h2>
				<dl class="term-list">
					<dt>18.1 Kazakhstan (Law No. 94-V)</dt>
					<dd>
						In the event of a personal data security breach, we will notify the
						<strong>Committee for Information Security of MDDIA</strong> within
						<strong>72 hours</strong> of becoming aware of the breach, in accordance
						with the amended Law No. 94-V (amendments effective 1 July 2024). Where the
						breach is likely to result in a significant risk to data subjects, affected
						Kazakhstan users will also be notified without undue delay.
					</dd>

					<dt>18.2 EEA and UK (GDPR / UK GDPR)</dt>
					<dd>
						If a breach is likely to result in a risk to the rights and freedoms of individuals,
						we will notify the competent supervisory authority within <strong>72 hours</strong> of
						becoming aware. Where the breach is likely to result in a <em>high risk</em> to
						individuals, we will notify affected data subjects without undue delay, in accordance
						with Article 34 of the GDPR.
					</dd>

					<dt>18.3 Incident response</dt>
					<dd>
						We maintain documented procedures for responding to security incidents and personal data
						breaches, including containment, assessment, notification, and post-incident review.
					</dd>
				</dl>
			</section>

			<!-- ── 19 ─────────────────────────────────────────────────────── -->
			<section id="s19">
				<h2>19. Changes to This Policy</h2>
				<p>
					We may update this Privacy Policy at any time. We will provide at least <strong>30 days'
					notice</strong> of material changes via a prominent notice on the Site and/or by email to
					registered users. The revised Policy will be identified by an updated "Last updated" date
					at the top of this page. Continued use of the Site after the effective date of a revised
					Policy constitutes your acceptance of those changes.
				</p>
				<p>
					To stop using the Site and request account deletion, contact
					<a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>.
				</p>
			</section>

			<!-- ── 20 ─────────────────────────────────────────────────────── -->
			<section id="s20">
				<h2>20. Contact and Supervisory Authority Complaints</h2>
				<div class="contact-card">
					<div class="contact-logo" aria-hidden="true">VN</div>
					<div>
						<p class="contact-name">VeryNice.kz — Data Privacy</p>
						<p class="contact-detail">
							<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
								<path d="M1 5l7 5 7-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
							</svg>
							<a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>
						</p>
						<p class="contact-detail">
							<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
								<path d="M8 5v3.5l2 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
							</svg>
							Response within 30 calendar days (GDPR) · 10 working days (KZ Law No. 94-V)
						</p>
					</div>
				</div>
				<p>
					If you are not satisfied with our response, you have the right to lodge a complaint
					directly with your supervisory authority:
				</p>
				<ul>
					<li><strong>Kazakhstan</strong>: Committee for Information Security, MDDIA</li>
					<li><strong>EEA</strong>: your national data protection authority (see <a href="#s15">§15.5</a>)</li>
					<li><strong>UK</strong>: Information Commissioner's Office — <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a></li>
				</ul>
			</section>

			<!-- ── 21. KAZAKH SUMMARY ─────────────────────────────────────── -->
			<section id="s21" class="kz-section">
				<div class="kz-flag-bar" aria-hidden="true">
					<span class="kz-stripe kz-blue"></span>
					<span class="kz-stripe kz-yellow"></span>
				</div>
				<h2>21. Құпиялылық саясатының қысқаша мазмұны (Қазақша)</h2>
				<p class="kz-subtitle">
					Summary in Kazakh — required by Article 8, Law No. 18-VIII (2023).
					A full Kazakh translation follows below.
				</p>
				<ul class="kz-list" lang="kk">
					<li><strong>Деректер бақылаушысы:</strong> VeryNice.kz жеке операторы. Байланыс: <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>. Оператор ЖК ретінде тіркелу үстінде.</li>
					<li><strong>Жинайтын деректер:</strong> Тіркелгі деректері (Google OAuth), пікірлер мен пайдаланушы мазмұны, бизнес тіркелгі деректері, аналитика (келісіммен), жарнама деректері (келісіммен), сервер журналдары.</li>
					<li><strong>Cookie файлдары:</strong> Маңызды (Firebase сессиясы), аналитикалық (Google Analytics 4 — келісім талап етіледі), жарнамалық (келісім талап етіледі). Cookie параметрлер орталығы арқылы басқаруға болады.</li>
					<li><strong>Деректерді өңдеудің заңды негіздері (ЖТҚР):</strong> Шарт (тіркелгі), заңды мүдде (қауіпсіздік, модерация), келісім (аналитика, жарнама).</li>
					<li><strong>Үшінші тараптар:</strong> Google Firebase, Vercel, Cloudinary, Groq, Google Gemini, OpenRouter, Google Analytics 4. Деректер АҚШ-қа SCС/DPF арқылы беріледі.</li>
					<li><strong>Деректерді жергіліктендіру:</strong> ҚР № 94-V Заңы, 17-бап — Қазақстандық пайдаланушылардың шектеулі дербес деректері Қазақстан аумағындағы серверлерде сақталуы тиіс. Сәйкестікке қол жеткізілуде.</li>
					<li><strong>Сақтау мерзімі:</strong> Тіркелгі деректері — жойғаннан кейін 3 жыл. Сервер журналдары — шамамен 30 күн (Vercel саясаты бойынша).</li>
					<li><strong>Деректерді бермейміз:</strong> Жеке деректерді сатпаймыз. Маркетинг мақсатында үшінші тараптармен бөліспейміз.</li>
					<li><strong>Халықаралық берулер:</strong> № 94-V Заңының 18-бабы бойынша ЦДИҒМ-ге хабарланады.</li>
					<li><strong>Құқықтарыңыз (ҚР № 94-V):</strong> Қол жеткізу (10 жұмыс күні), түзету, жою, шектеу, маркетингке қарсылық білдіру. <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a></li>
					<li><strong>Балалар:</strong> 13 жасқа толмаған балалардан деректер жинамаймыз. ЕЭА пайдаланушылары үшін — 16 жас (немесе ұлттық заңнамада белгіленген төменгі жас).</li>
					<li><strong>Бұзылу туралы хабарлама:</strong> ЦДИҒМ-ге — 2024 жылдың 1 шілдесінен бастап қолданылатын мерзімде; ЖТҚР 34-бабы бойынша зардап шеккен тұлғаларға.</li>
					<li><strong>Шағымдар:</strong> ЦДИҒМ Ақпараттық қауіпсіздік комитетіне шағым жасауға болады.</li>
				</ul>
			</section>

			<!-- ══════════════════════════════════════════════════════════════
			     ТОЛЫҚ ҚАЗАҚША НҰСҚАСЫ — FULL KAZAKH TRANSLATION
			     Professional translation · Кәсіби аударма
			══════════════════════════════════════════════════════════════ -->
			<div class="kz-full-doc" lang="kk">
				<div class="kz-doc-header">
					<div class="kz-flag-bar kz-flag-bar--wide" aria-hidden="true">
						<span class="kz-stripe kz-blue"></span>
						<span class="kz-stripe kz-yellow"></span>
					</div>
					<div class="kz-doc-title-row">
						<div>
							<p class="kz-doc-type">Заңды құжат · Қазақша ресми нұсқасы</p>
							<h2 class="kz-doc-title">Құпиялылық Саясаты</h2>
						</div>
						<div class="kz-doc-meta">
							<span>Соңғы жаңарту: 17 мамыр 2026 ж.</span>
							<span>Нұсқа 2.0</span>
						</div>
					</div>
					<p class="kz-doc-note">
						ҚР № 7-I «ҚР тіл туралы» Заңы мен «Онлайн-платформалар және онлайн-жарнама туралы»
						ҚР № 18-VIII Заңының 8-бабына сәйкес дайындалған ресми нұсқа.
						<strong>Осы қазақша нұсқасы осы Құпиялылық саясатының ресми және міндетті мәтіні
						болып табылады.</strong> Қазақша нұсқасы ағылшынша нұсқасынан барлық жағдайда
						және шартсыз басым болады. Қазақстан Республикасының соттарында тек осы қазақша
						мәтін міндетті дәлел ретінде қабылданады.
					</p>
				</div>

				<!-- ══ Қазақша мазмұны ══ -->
				<div class="kz-toc">
					<p class="kz-toc-heading">Мазмұны (Қазақша)</p>
					<div class="kz-toc-grid">
						<a href="#kz-s1">1. Осы саясат туралы</a>
						<a href="#kz-s2">2. Деректер бақылаушысы</a>
						<a href="#kz-s3">3. Жинайтын деректер</a>
						<a href="#kz-s4">4. Заңды негіздер (ДҚНР)</a>
						<a href="#kz-s5">5. Cookie және бақылау</a>
						<a href="#kz-s6">6. Үшінші тарап қызметтері</a>
						<a href="#kz-s7">7. Жарнама және серіктестік</a>
						<a href="#kz-s8">8. ЖИ қызметтері</a>
						<a href="#kz-s9">9. Сақтау және қауіпсіздік</a>
						<a href="#kz-s10">10. Деректерді жергілікте сақтау</a>
						<a href="#kz-s11">11. Деректерді сақтау мерзімі</a>
						<a href="#kz-s12">12. Деректерді бөлісу</a>
						<a href="#kz-s13">13. Халықаралық тасымалдар</a>
						<a href="#kz-s14">14. Сіздің құқықтарыңыз</a>
						<a href="#kz-s15">15. ЕЭА және Ұлыбритания</a>
						<a href="#kz-s16">16. Қазақстан құқықтары</a>
						<a href="#kz-s17">17. Балалардың жеке өмірі</a>
						<a href="#kz-s18">18. Бұзушылық туралы хабарлау</a>
						<a href="#kz-s19">19. Саясатты өзгерту</a>
						<a href="#kz-s20">20. Байланыс және шағымдар</a>
					</div>
				</div>

				<!-- §1 KZ -->
				<section id="kz-s1" class="kz-section-item">
					<h3>1. Осы саясат туралы</h3>
					<div class="callout callout-warning">
						<strong>Ресми тіл — ҚАЗАҚША.</strong>
						ҚР № 7-I «ҚР тіл туралы» Заңы мен № 18-VIII Заңының 8-бабына сәйкес осы
						Құпиялылық саясатының ресми тілі — қазақша. Осы қазақша нұсқасы заңды күші
						бар міндетті мәтін болып табылады. Ағылшынша нұсқасы халықаралық
						пайдаланушылардың ыңғайы үшін ғана берілген аударма.
					</div>
					<p>Осы Құпиялылық саясаты <strong>VeryNice.kz</strong> («біз», «бізді», «біздің»)
					Сайтқа кіру немесе оны пайдалану кезінде жеке деректеріңізді қалай жинайтынын,
					пайдаланатынын, сақтайтынын, бөлісетінін және қорғайтынын түсіндіреді.
					Саясат мынадай жағдайларға қолданылады:</p>
					<ul>
						<li>тіркелгісіз Сайтқа кіру</li>
						<li>тіркелгі жасау және кіру</li>
						<li>пікірлер немесе бағалаулар жіберу</li>
						<li>Бизнес тіркелгісін тіркеу немесе басқару</li>
						<li>кез келген интерактивті немесе ЖИ-мүмкіндіктерін пайдалану</li>
					</ul>
					<p>Осы Саясат <a href="/terms">Пайдалану шарттарымен</a> және Cookie саясатымен бірге
					оқылуы тиіс. Деректерді қорғауға қатысты мәселелерде осы Саясат басым болады.</p>
				</section>

				<!-- §2 KZ -->
				<section id="kz-s2" class="kz-section-item">
					<h3>2. Деректер бақылаушысы</h3>
					<p>VeryNice.kz арқылы өңделетін жеке деректердің бақылаушысы — Сайттың жеке операторы.
					Байланыс: <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a></p>
					<div class="callout callout-neutral">
						<strong>Оператордың жеке басы және тіркелу мәртебесі.</strong>
						Сайт қазіргі уақытта жеке тұлғамен басқарылады. Оператор ҚР заңнамасы бойынша
						жеке кәсіпкер (ЖК) ретінде тіркелу үдерісінде. ҚР № 94-V Заңы бойынша оператор
						<em>дербес деректер базасының иесі</em> болып табылады. ЖК тіркеу аяқталғаннан кейін
						осы Саясат жаңартылады.
					</div>
					<div class="callout callout-info">
						<strong>ЕО/ЕЭА — ЖТҚР 27-бабы бойынша өкіл.</strong>
						ЖТҚР 27-бабы бойынша ресми ЕО өкілі тағайындалмаған. Деректерді қорғауға қатысты
						сұрауларға жоғарыда берілген электрондық пошта арқылы жауап береміз. Ресми өкіл
						тағайындалуы қажет болған жағдайда осы Саясат жаңартылады.
					</div>
				</section>

				<!-- §3 KZ -->
				<section id="kz-s3" class="kz-section-item">
					<h3>3. Жинайтын жеке деректер</h3>
					<div class="callout callout-info">
						<strong>Мақсатты шектеу — № 94-V Заңының 6-бабы.</strong>
						Жеке деректер тек нақты, айқын және заңды мақсаттар үшін жиналады және
						осы мақсаттармен үйлеспейтін тәсілмен өңделмейді (№ 94-V Заңының 6-бабы).
						Деректердің ең аз қажетті мөлшері ғана жиналады (деректерді барынша
						азайту принципі). Жинаудың мақсаты тиісті тармақта көрсетілген. Бір мақсат
						үшін жиналған деректер жаңа заңды негізсіз немесе алдын ала келісімсіз
						басқа мақсатта пайдаланылмайды.
					</div>
					<dl class="term-list">
						<dt>3.1 Тіркелгі және аутентификация деректері</dt>
						<dd>Google OAuth арқылы кіргенде, провайдер: атыңызды, электрондық пошта
						мекенжайыңызды және профиль суретіңізді береді. Дерекқорда сақтайтынымыз:
						провайдер пайдаланушы идентификаторы, электрондық пошта мекенжайы, атыңыз,
						тіркелгі рөлі (саяхатшы / бизнес) және тіркелу уақыты. Пароль сақталмайды.</dd>

						<dt>3.2 Пайдаланушы мазмұны (пікірлер мен бағалаулар)</dt>
						<dd>Пікір немесе бағалау жіберу кезінде: пікір/бағалау мәтіні; атыңыз
						(міндетті емес — анонимді жариялауға болады); тіркелген болсаңыз пайдаланушы
						идентификаторы; жіберу уақыты. IP-мекенжайыңыз сервер журналдарында (§3.6)
						теріс пайдалануды болдырмау мақсатында сақталады.</dd>

						<dt>3.3 Бизнес тіркелгі деректері</dt>
						<dd>Бизнес тіркелгісін тіркеу кезінде: бизнес атауы, түрі және сипаттамасы;
						байланыс деректері; тексеру мақсатында БСН/ЖСН; орналасқан жері мен жұмыс
						уақыты; жүктелген суреттер мен медиа; баға ақпараты.</dd>

						<dt>3.4 Аналитика деректері (келісіммен)</dt>
						<dd>Аналитикалық cookie файлдарына келісім берген жағдайда, Google Analytics 4
						(GA4) мыналарды жинайды: кірілген беттер мен оқиғалар; шамалы геоорналасу
						(анонимделген IP негізінде ел/қала деңгейінде); құрылғы түрі, ОЖ мен браузер;
						сілтеме URL; IP-мекенжай (Google-ға жіберіледі, GA4 анонимдейді).</dd>

						<dt>3.5 Жарнама деректері (келісіммен)</dt>
						<dd>Жарнамалық cookie файлдарына келісім берсеңіз, үшінші тарап жарнама
						желілері: жарнама идентификаторларын, жарнама өсірмелері мен басулары,
						шамалы орналасу және псевдонимделген құрылғы деректерін жинауы мүмкін.</dd>

						<dt>3.6 Сервер және инфрақұрылым журналдары</dt>
						<dd>Хостинг провайдері (Vercel) автоматты түрде мыналарды журналдайды:
						IP-мекенжай, HTTP сұраныс метадеректері, уақыт белгілері. Бұл журналдар
						Vercel саясаты бойынша (~30 күн) сақталады.</dd>

						<dt>3.7 Тіл параметрі</dt>
						<dd>Тіл параметрі браузердің <code>localStorage</code> жадында сақталады.
						Бұл деректер серверлерге жіберілмейді.</dd>
					</dl>
				</section>

				<!-- §4 KZ -->
				<section id="kz-s4" class="kz-section-item">
					<h3>4. Өңдеудің заңды негіздері (ЖТҚР)</h3>
					<p>ЕЭА және Ұлыбритания пайдаланушылары үшін жеке деректер ЖТҚР 6-бабы бойынша
					мынадай заңды негіздерде өңделеді:</p>
					<dl class="term-list">
						<dt>Шартты орындау (6(1)(б))</dt>
						<dd>Тіркелгіні тіркеу және басқару; бизнес тізім қызметтері.</dd>
						<dt>Заңды мүдде (6(1)(е))</dt>
						<dd>Пікірлерді жариялау және модерациялау; сервер журналдары мен қауіпсіздік;
						ЖИ мазмұнды модерациялау; маңызды session cookie файлдары.</dd>
						<dt>Келісім (6(1)(а))</dt>
						<dd>Google Analytics 4 аналитикалық cookie файлдары; жарнамалық/мақсатты
						cookie файлдары. Кез келген уақытта кері қайтарып алуға болады.</dd>
						<dt>Заңды міндет (6(1)(в))</dt>
						<dd>Заңды сақтау талаптары; деректер субъектісінің сұрауларына жауап беру.</dd>
					</dl>
				</section>

				<!-- §5 KZ -->
				<section id="kz-s5" class="kz-section-item">
					<h3>5. Cookie файлдары және бақылау технологиялары</h3>
					<p>Алғашқы кіруде барлық cookie файлдарын қабылдауға, параметрлерді санат бойынша
					реттеуге немесе маңызды емес cookie файлдарынан бас тартуға мүмкіндік беретін
					cookie келісім баннері ұсынылады.</p>
					<dl class="term-list">
						<dt>5.1 Маңызды cookie файлдары (өшіруге болмайды)</dt>
						<dd><code>__session</code> (Firebase/Google) — пайдаланушы аутентификация сессиясы;
						<code>FIREBASE_APPCHECK_TOKEN</code> — API теріс пайдалануын болдырмау.</dd>
						<dt>5.2 Аналитикалық cookie файлдары (келісім талап етіледі)</dt>
						<dd>Google Analytics 4: <code>_ga</code>, <code>_ga_XXXXX</code>, <code>_gid</code>.
						Google Analytics Opt-out браузер қондырмасы арқылы бас тартуға болады.</dd>
						<dt>5.3 Жарнамалық cookie файлдары (келісім талап етіледі)</dt>
						<dd>Үшінші тарап жарнама желілері. Бас тарту: cookie параметрлер орталығы,
						YourAdChoices, NAI, Google жарнама параметрлері.</dd>
						<dt>5.4 LocalStorage (cookie файлы емес)</dt>
						<dd><code>language_preference</code> кілті — серверлерге жіберілмейді, браузер
						деректерін тазалаған кезде жойылады.</dd>
					</dl>
				</section>

				<!-- §6 KZ -->
				<section id="kz-s6" class="kz-section-item">
					<h3>6. Үшінші тарап қызметтері мен кіші өңдеушілер</h3>
					<p>Жеке деректерді деректерді өңдеу туралы тиісті келісімдер негізінде
					мынадай үшінші тараптармен бөлісеміз:</p>
					<dl class="term-list">
						<dt>Firebase Authentication / Firestore (Google LLC)</dt>
						<dd>Пайдаланушы аутентификациясы және дерекқоры. АҚШ. Қорғау: СШТ / DPF.</dd>
						<dt>Vercel Inc.</dt>
						<dd>Хостинг және шеткі орналастыру. АҚШ / ғаламдық шеткі. Қорғау: СШТ.</dd>
						<dt>Cloudinary Ltd.</dt>
						<dd>Суреттерді хостингтеу және оңтайландыру. АҚШ. Қорғау: СШТ.</dd>
						<dt>Groq Inc. / OpenRouter Inc.</dt>
						<dd>ЖИ аударма және мазмұнды модерациялау. АҚШ. Қорғау: ДӨК / СШТ.</dd>
						<dt>Google Gemini / Vertex AI (Google LLC)</dt>
						<dd>ЖИ аударма қызметтері. АҚШ/ЕО. Қорғау: СШТ / DPF.</dd>
						<dt>Google Analytics 4 (Google LLC)</dt>
						<dd>Пайдалану аналитикасы (келісіммен). АҚШ. Қорғау: DPF / СШТ.</dd>
						<dt>Open-Meteo</dt>
						<dd>Ауа-райы деректері (тек қала атауы — жеке деректер жоқ). Швейцария/ЕО.</dd>
					</dl>
					<p><em>СШТ = Стандартты шарттық талаптар (ЕК 2021/914 шешімі).
					DPF = ЕО-АҚШ деректер құпиялылығы шеңбері.
					ДӨК = Деректерді өңдеу келісімі.</em></p>
				</section>

				<!-- §7 KZ -->
				<section id="kz-s7" class="kz-section-item">
					<h3>7. Жарнама, демеушілік мазмұн және серіктестік сілтемелер</h3>
					<dl class="term-list">
						<dt>7.1 Дисплейлік жарнама</dt>
						<dd>Жарнамалық cookie файлдарына келісім берген кезде, жарнама желілері
						псевдонимделген идентификаторларды жинап, дербесті жарнама ұсынуы мүмкін.
						Жарнамалар жарнамаланатын өнімдердің ұсынымы болып табылмайды.</dd>
						<dt>7.2 Демеушілік мазмұн</dt>
						<dd>Барлық ақылы жарнама мен демеушілік мазмұн ҚР № 508-II және № 18-VIII
						Заңдарына сәйкес тиісті белгімен белгіленеді.</dd>
						<dt>7.3 Серіктестік сілтемелер</dt>
						<dd>Серіктестік сілтемені басып сатып алу жасасаңыз, комиссия алуымыз мүмкін.
						Осы сілтемелер арқылы жеке деректеріңіз үшінші тараптармен бөліспейміз.</dd>
						<dt>7.4 Дербесті жарнамадан бас тарту</dt>
						<dd>Cookie параметрлер орталығы, YourAdChoices, NAI, Google жарнама параметрлері.</dd>
					</dl>
				</section>

				<!-- §8 KZ -->
				<section id="kz-s8" class="kz-section-item">
					<h3>8. ЖИ аударма және мазмұнды модерациялау</h3>
					<dl class="term-list">
						<dt>8.1 ЖИ аударма</dt>
						<dd>Сайт мазмұнының өзге тілдердегі нұсқалары ЖИ аударма қызметтері
						(Groq, Google Gemini, OpenRouter) арқылы жасалады. Аударма сұрауларына
						жеке деректер тіркелмейді.</dd>
						<dt>8.2 ЖИ мазмұнды модерациялау</dt>
						<dd>Пайдаланушы мазмұны (пікірлер, бағалаулар) Пайдалану шарттарын бұзуды
						анықтау үшін ЖИ құралдарымен өңделуі мүмкін. Модерация сұрауларына
						электрондық пошта тіркелмейді.</dd>
						<dt>8.3 ЕО ЖИ Заңына сәйкестік</dt>
						<dd>ЕО ЖИ Заңы (Регламент (ЕО) 2024/1689) бойынша 50-баптың міндеттері
						күшіне ене салысымен ЖИ жасаған мазмұнды машина оқи алатын форматта
						таңбалауды жоспарлаймыз.</dd>
					</dl>
				</section>

				<!-- §9 KZ -->
				<section id="kz-s9" class="kz-section-item">
					<h3>9. Деректерді сақтау және қауіпсіздік</h3>
					<p>Пайдаланушы деректері Google Firebase (Firestore және Authentication) мен
					Vercel Edge Network-та сақталады. Қауіпсіздік шаралары:</p>
					<ul>
						<li>Барлық байланыстарда TLS/HTTPS шифрлау</li>
						<li>Firebase Authentication арқылы қауіпсіз сессия токендері</li>
						<li>Firestore дерекқорына рөлге негізделген қол жеткізу бақылауы</li>
						<li>Жүйелерде төлем деректерін сақтамаймыз</li>
					</ul>
					<div class="callout callout-neutral">
						<strong>Абсолютті қауіпсіздікке кепілдік жоқ.</strong> Интернет жүйелері
						абсолютті қауіпсіздікті кепілдіктей алмайды. Деректер бұзушылығы орын
						алған жағдайда §18-бапта белгіленген тәртіппен әрекет етеміз.
					</div>
				</section>

				<!-- §10 KZ -->
				<section id="kz-s10" class="kz-section-item">
					<h3>10. Деректерді жергіліктендіру — Қазақстан</h3>
					<p>ҚР № 94-V «Дербес деректер және оларды қорғау туралы» Заңының 17-бабына
					(2024 жылдың шілдедегі өзгерістерімен) сәйкес Қазақстан аумағындағы
					«шектеулі дербес деректер» санатына жататын деректер ҚР аумағындағы серверлерде
					жиналуы, өңделуі және сақталуы тиіс.</p>
					<div class="callout callout-warning">
						<strong>Ағымдағы сәйкестік мәртебесі.</strong> Негізгі инфрақұрылым
						провайдерлеріміз (Google Firebase, Vercel) АҚШ-та тіркелген. № 94-V Заңы
						бойынша деректерді жергіліктендіру міндеттерімізді белсенді түрде
						қарастырып жатырмыз. Сервер орналасуы талаптарына сәйкестікке қол
						жеткізілгенге дейін, шекарадан тыс берулер §13-бапта сипатталған
						хабарлама рәсіміне сәйкес жүзеге асырылады.
					</div>
				</section>

				<!-- §11 KZ -->
				<section id="kz-s11" class="kz-section-item">
					<h3>11. Деректерді сақтау мерзімі</h3>
					<dl class="term-list">
						<dt>Тіркелгі деректері</dt>
						<dd>Тіркелгі белсенді болған кезде + жойғаннан немесе соңғы кіруден кейін <strong>3 жыл</strong>.</dd>
						<dt>Пікірлер мен бағалаулар</dt>
						<dd>Жариялану мерзімі; тіркелгіні жою сұрауында немесе алып тастау туралы хабарламада жойылады.</dd>
						<dt>Бизнес тіркелгі деректері (БСН/ЖСН)</dt>
						<dd>Белсенді тізім мерзімі + жабылғаннан кейін <strong>3 жыл</strong> (бухгалтерлік жазбалар — ҚР салық заңнамасы бойынша 5 жылға дейін).</dd>
						<dt>Google Analytics деректері</dt>
						<dd>GA4 әдепкі параметрлері бойынша <strong>26 айға дейін</strong>.</dd>
						<dt>Маңызды session cookie файлдары</dt>
						<dd>Сессия ұзақтығы (шыққан кезде тазаланады).</dd>
						<dt>Сервер журналдары (Vercel)</dt>
						<dd>Vercel саясаты бойынша шамамен <strong>30 күн</strong>.</dd>
					</dl>
				</section>

				<!-- §12 KZ -->
				<section id="kz-s12" class="kz-section-item">
					<h3>12. Деректеріңізді бөлісу</h3>
					<div class="callout callout-info">
						<strong>Жеке деректерді сатпаймыз.</strong> Маркетингтік немесе коммерциялық
						профилдеу мақсатында деректерді үшінші тараптармен бөліспейміз.
					</div>
					<p>Деректер тек мына жағдайларда бөлісіледі:</p>
					<dl class="term-list">
						<dt>12.1 Кіші өңдеушілермен</dt>
						<dd>§6-да тізімделгендермен — сипатталған мақсаттар үшін, деректерді өңдеу келісімдері негізінде.</dd>
						<dt>12.2 Заңды талап бойынша</dt>
						<dd>Сот шешімі, ЦДИҒМ реттеу талабы немесе өзге міндетті заңды міндеттеме негізінде.</dd>
						<dt>12.3 Іскерлік жалғастырушылық</dt>
						<dd>Оператордың бизнесін сату, бірігу немесе қайта құрылымдау жағдайында осы Саясаттың барлық міндеттемелерін қабылдайтын мирасқор субъектіге.</dd>
						<dt>12.4 Ашық келісіммен</dt>
						<dd>Кез келген өзге жағдайда — тек жазбаша алдын ала келісіміңізбен.</dd>
					</dl>
					<p><strong>Жариялық мазмұн.</strong> Сайтта жариялаған пікірлер барлық
					келушілерге қолжетімді. Жою сұрауы үшін:
					<a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a></p>
				</section>

				<!-- §13 KZ -->
				<section id="kz-s13" class="kz-section-item">
					<h3>13. Халықаралық деректер беру</h3>
					<p>Кіші өңдеушілеріміздің басым бөлігі АҚШ-та орналасқан. Деректер беру мынадай
					қорғаулар арқылы жүзеге асырылады:</p>
					<dl class="term-list">
						<dt>ЕЭА және Ұлыбритания пайдаланушылары (ЖТҚР / Ұлыбритания ЖТҚР)</dt>
						<dd>Google: DPF және СШТ (2 модуль). Vercel: СШТ (ЕК 2021/914 шешімі).
						Cloudinary: СШТ. Groq/OpenRouter: ДӨК + СШТ.</dd>
						<dt>Қазақстан пайдаланушылары (№ 94-V Заңы)</dt>
						<dd>ҚР азаматтарының жеке деректерінің шекарадан тыс берілуі № 94-V Заңының
						18-бабы бойынша ЦДИҒМ Ақпараттық қауіпсіздік комитетіне хабарланады.
						<strong>Бұл хабарлама шекарадан тыс берудің бірінші рет жүзеге асырылуынан
						<em>бұрын</em> тапсырылуы және ЦДИҒМ тарапынан расталуы тиіс.</strong>
						Тиісті шекарадан тыс деректер беруді бастамас бұрын 18-бапқа сәйкес
						хабарлама жібереміз. «Шектеулі дербес деректер» (№ 94-V Заңының 8-бабы)
						болған жағдайда жергіліктендіру талаптары қолданылады және мұндай деректерді
						шетелге беруге деректер субъектісінің жазбаша келісімі талап етілуі мүмкін
						(§10).</dd>
					</dl>
				</section>

				<!-- §14 KZ -->
				<section id="kz-s14" class="kz-section-item">
					<h3>14. Деректер субъектісінің құқықтары (барлық пайдаланушылар)</h3>
					<p>Орналасқан жерінізге қарамастан, кез келген уақытта:</p>
					<dl class="term-list">
						<dt>Қол жеткізу</dt>
						<dd>Жеке деректеріңіздің өңделетіні туралы растауды және олардың көшірмесін сұрауға болады.</dd>
						<dt>Түзету</dt>
						<dd>Дәлсіз немесе толық емес жеке деректерді түзетуді талап етуге болады.</dd>
						<dt>Жою</dt>
						<dd>Жеке деректеріңізді жоюды сұрауға болады (заңды сақтау міндеттемелеріне сәйкес).</dd>
						<dt>Келісімді кері қайтарып алу</dt>
						<dd>Cookie параметрлер орталығы немесе электрондық пошта арқылы кез келген уақытта келісімнен бас тартуға болады.</dd>
						<dt>Тіркелгіні жою</dt>
						<dd>Тіркелгіні және барлық байланысты жеке деректерді жоюды сұрауға болады. 30 күн ішінде өңделеді.</dd>
					</dl>
					<p>Жүгіну: <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a><br>
					Жауап беру мерзімі: ЖТҚР бойынша <strong>30 күнтізбелік күн</strong> /
					ҚР № 94-V Заңы бойынша <strong>10 жұмыс күні</strong>.</p>
				</section>

				<!-- §15 KZ -->
				<section id="kz-s15" class="kz-section-item">
					<h3>15. ЕЭА және Ұлыбритания пайдаланушыларының қосымша құқықтары (ЖТҚР)</h3>
					<dl class="term-list">
						<dt>15.1 Өңдеуді шектеу құқығы</dt>
						<dd>Дауды шешу барысында деректерді өңдеуді тоқтата тұруды сұрауға болады.</dd>
						<dt>15.2 Деректерді тасымалдау құқығы</dt>
						<dd>Деректеріңізді машина оқи алатын форматта алуға болады.</dd>
						<dt>15.3 Қарсылық білдіру құқығы</dt>
						<dd>Заңды мүдде негізіндегі өңдеуге қарсылық білдіруге болады.</dd>
						<dt>15.4 Бақылаушы органға шағым жасау құқығы</dt>
						<dd>Тұрақты тұратын еліңіздегі деректерді қорғау органына кез келген уақытта
						шағым жасауға болады: Ұлыбритания — ICO (ico.org.uk); барлық ЕЭА органдары —
						edpb.europa.eu.</dd>
					</dl>
				</section>

				<!-- §16 KZ -->
				<section id="kz-s16" class="kz-section-item">
					<h3>16. Қазақстан пайдаланушыларының қосымша құқықтары (№ 94-V Заңы)</h3>
					<p>ҚР № 94-V «Дербес деректер және оларды қорғау туралы» Заңы (2024 жылдың
					шілдедегі өзгерістерімен) бойынша Қазақстандағы деректер субъектілері:</p>
					<dl class="term-list">
						<dt>16.1 Қол жеткізу</dt>
						<dd>Сұрау берілген күннен бастап <strong>10 жұмыс күні</strong> ішінде ақпарат алуға болады.</dd>
						<dt>16.2 Түзету</dt>
						<dd>Дәлсіз немесе толық емес деректерді түзетуді талап ету.</dd>
						<dt>16.3 Жою</dt>
						<dd>Мақсатты орындағаннан кейін, келісім кері қайтарылғаннан кейін немесе заңсыз өңдеу жағдайында жоюды талап ету.</dd>
						<dt>16.4 Шектеу</dt>
						<dd>Дауды шешу немесе дәлдікті тексеру кезінде өңдеуді тоқтата тұруды талап ету.</dd>
						<dt>16.5 Маркетингке қарсылық</dt>
						<dd>Тікелей маркетинг мақсатында деректерді өңдеуге қарсылық білдіру — дереу тоқтатылады.</dd>
						<dt>16.6 Бақылаушы орган</dt>
						<dd>ҚР ЦДИҒМ Ақпараттық қауіпсіздік комитетіне шағым жасауға болады.</dd>
					</dl>
				</section>

				<!-- §17 KZ -->
				<section id="kz-s17" class="kz-section-item">
					<h3>17. Балалардың жеке деректерін қорғау</h3>
					<dl class="term-list">
						<dt>17.1 Жалпы ең төменгі жас</dt>
						<dd>13 жасқа толмаған балалардан біле тұрып жеке деректер жинамаймыз.
						Мұндай жағдай орын алды деп санасаңыз, дереу
						<a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>
						мекенжайына хабарласыңыз.</dd>
						<dt>17.2 ЕЭА және Ұлыбритания пайдаланушылары</dt>
						<dd>ЖТҚР 8-бабы бойынша дербес деректерді өңдеуге өздігінен келісім беру
						жасы — <strong>16 жас</strong> (немесе ұлттық заңнамада белгіленген
						төменгі жас, ең аз — 13 жас). 13 жастан келісім жасына дейінгі
						пайдаланушылар үшін ата-ана немесе заңды өкіл жазбаша келісімі міндетті.</dd>
					</dl>
				</section>

				<!-- §18 KZ -->
				<section id="kz-s18" class="kz-section-item">
					<h3>18. Деректер бұзушылығы туралы хабарлама</h3>
					<dl class="term-list">
						<dt>18.1 Қазақстан (№ 94-V Заңы)</dt>
						<dd>Жеке деректер қауіпсіздігінің бұзылуы кезінде ҚР ЦДИҒМ-ге
						2024 жылдың 1 шілдесінен бастап қолданылатын мерзімде хабарлаймыз.</dd>
						<dt>18.2 ЕЭА және Ұлыбритания (ЖТҚР)</dt>
						<dd>Бұзушылық жеке тұлғалар үшін тәуекел туғызуы ықтимал болса, тиісті
						бақылаушы органға <strong>72 сағат</strong> ішінде хабарлаймыз. Жоғары
						тәуекел жағдайында ЖТҚР 34-бабы бойынша зардап шеккен тұлғаларға
						кідіріссіз хабарлаймыз.</dd>
					</dl>
				</section>

				<!-- §19 KZ -->
				<section id="kz-s19" class="kz-section-item">
					<h3>19. Саясатты өзгерту</h3>
					<p>Осы Саясатты кез келген уақытта жаңартуға құқылымыз. Маңызды өзгерістер туралы
					Сайтта ерекше хабарлама орналастыру және/немесе тіркелген пайдаланушыларға
					электрондық пошта арқылы жіберу арқылы кемінде <strong>30 күн</strong> бұрын
					ескертеміз. Өзгертілген саясатты қолданатын күннен кейін Сайтты пайдалануды
					жалғастыру жаңа Саясатты қабылдауды білдіреді.</p>
				</section>

				<!-- §20 KZ -->
				<section id="kz-s20" class="kz-section-item">
					<h3>20. Байланыс және шағымдар</h3>
					<div class="contact-card">
						<div class="contact-logo" aria-hidden="true">VN</div>
						<div>
							<p class="contact-name">VeryNice.kz — Деректер құпиялылығы</p>
							<p class="contact-detail">
								<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
									<rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
									<path d="M1 5l7 5 7-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
								</svg>
								<a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>
							</p>
							<p class="contact-detail">
								<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
									<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
									<path d="M8 5v3.5l2 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
								</svg>
								Жауап беру мерзімі — 30 күнтізбелік күн (ЖТҚР) · 10 жұмыс күні (№ 94-V Заңы)
							</p>
						</div>
					</div>
					<p>Жауабымызбен қанағаттанбасаңыз:</p>
					<ul>
						<li><strong>Қазақстан:</strong> ЦДИҒМ Ақпараттық қауіпсіздік комитеті</li>
						<li><strong>ЕЭА:</strong> тұрақты тұратын елдің деректерді қорғау органы (§15.5)</li>
						<li><strong>Ұлыбритания:</strong> ICO — ico.org.uk</li>
					</ul>
				</section>
			</div>
			<!-- ══ END KAZAKH TRANSLATION ════════════════════════════════════ -->

			<footer class="doc-footer">
				<p>© 2026 VeryNice.kz. All rights reserved. This document was last reviewed on 17 May 2026.</p>
				<nav class="footer-links" aria-label="Legal pages">
					<a href="/privacy" aria-current="page">Privacy Policy</a>
					<span aria-hidden="true">·</span>
					<a href="/terms">Terms of Use</a>
					<span aria-hidden="true">·</span>
					<a href="/contact">Contact</a>
				</nav>
			</footer>
		</article>
	</div>
</div>

<style>
	/* ── Page shell ──────────────────────────────────────────────────── */
	:global(html) {
		scroll-behavior: smooth;
	}

	.doc-page {
		background: #f1f5f9;
		min-height: 100vh;
		font-family: var(--vnk-font-secondary, 'Inter', sans-serif);
	}

	/* ── Banner ──────────────────────────────────────────────────────── */
	/* NOTE: intentionally a <div>, not <header> — global layout.css forces
	   header { background: transparent !important } which would override this */
	.doc-banner {
		background: #0f172a !important;
		color: #fff;
		padding: 0;
		box-shadow: inset 0 4px 0 #0e7490;
	}

	.banner-inner {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1.5rem 2rem 2rem;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		color: rgba(255, 255, 255, 0.6);
		font-family: var(--vnk-font-secondary, 'Inter', sans-serif);
		font-size: 0.825rem;
		font-weight: 500;
		text-decoration: none;
		letter-spacing: 0.02em;
		transition: color 0.15s;
		margin-bottom: 1.25rem;
	}

	.back-link:hover { color: #fff; }

	.doc-type-label {
		display: inline-block;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: #94a3b8;
		margin-bottom: 0.5rem;
	}

	.banner-body h1 {
		font-family: var(--vnk-font-primary, 'Outfit', sans-serif);
		font-size: clamp(1.75rem, 4vw, 2.75rem);
		font-weight: 800;
		color: #fff;
		margin: 0 0 1rem;
		line-height: 1.15;
		letter-spacing: -0.02em;
	}

	.doc-meta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.meta-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 999px;
		padding: 0.3rem 0.75rem;
		font-size: 0.75rem;
		color: #cbd5e1;
		letter-spacing: 0.01em;
	}

	/* ── Notice bar ──────────────────────────────────────────────────── */
	.notice-wrapper {
		background: #fefce8;
		border-bottom: 1px solid #fde68a;
	}

	.notice-inner {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.notice-box {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.875rem 0;
		font-size: 0.85rem;
		color: #78350f;
		line-height: 1.55;
	}

	.notice-icon { flex-shrink: 0; margin-top: 0.1rem; }
	.notice-box p { margin: 0; }

	/* ── Layout ──────────────────────────────────────────────────────── */
	.doc-layout {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2.5rem 2rem 5rem;
		display: grid;
		grid-template-columns: 240px 1fr;
		gap: 2.5rem;
		align-items: start;
	}

	/* ── TOC Sidebar ─────────────────────────────────────────────────── */
	.toc-sidebar {
		position: sticky;
		top: calc(var(--vnk-header-height, 70px) + 1.5rem);
		max-height: calc(100vh - var(--vnk-header-height, 70px) - 3rem);
		overflow-y: auto;
		scrollbar-width: thin;
	}

	.toc-inner {
		background: #fff;
		border: 1px solid #e2e8f0;
		border-radius: var(--vnk-border-radius-md, 0.75rem);
		padding: 1.25rem 1rem;
	}

	.toc-heading {
		font-family: var(--vnk-font-primary, 'Outfit', sans-serif);
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #94a3b8;
		margin: 0 0 0.75rem 0.25rem;
	}

	.toc-list {
		list-style: none !important;
		margin: 0;
		padding: 0;
	}

	.toc-list li { list-style: none !important; }

	.toc-list li a {
		display: block;
		padding: 0.3rem 0.5rem;
		border-radius: 6px;
		font-size: 0.78rem;
		color: #64748b;
		text-decoration: none;
		line-height: 1.4;
		transition: background 0.12s, color 0.12s;
	}

	.toc-list li a:hover {
		background: #f1f5f9;
		color: #0f172a;
	}

	.toc-list li.active a {
		background: #ecfeff;
		color: #0e7490;
		font-weight: 600;
		padding-left: 0.75rem;
		box-shadow: inset 3px 0 0 #0e7490;
	}

	/* ── Legal body ──────────────────────────────────────────────────── */
	.legal-body {
		background: #fff;
		border: 1px solid #e2e8f0;
		border-radius: var(--vnk-border-radius-lg, 1rem);
		padding: 3rem 3.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 20px rgba(0, 0, 0, 0.04);
		min-width: 0;
	}

	/* ── Section styles ──────────────────────────────────────────────── */
	.legal-body section {
		padding-top: 2.5rem;
		margin-bottom: 0;
	}

	.legal-body section:first-child { padding-top: 0; }
	.legal-body section + section { border-top: 1px solid #f1f5f9; }

	.legal-body h2 {
		font-family: var(--vnk-font-primary, 'Outfit', sans-serif);
		font-size: 1.05rem !important;
		font-weight: 700;
		color: #0f172a;
		margin: 0 0 1rem;
		letter-spacing: -0.01em;
	}

	.legal-body h3 {
		font-family: var(--vnk-font-primary, 'Outfit', sans-serif);
		font-size: 0.9rem !important;
		font-weight: 700;
		color: #1e293b;
		margin: 1.25rem 0 0.5rem;
	}

	.legal-body p {
		font-size: 0.9rem;
		color: #475569;
		line-height: 1.8;
		margin: 0 0 0.75rem;
	}

	.legal-body p:last-child { margin-bottom: 0; }

	.legal-body ul {
		list-style: none;
		margin: 0.5rem 0 0.75rem;
		padding-left: 1.4rem;
	}

	.legal-body li {
		font-size: 0.9rem;
		color: #475569;
		line-height: 1.7;
		margin-bottom: 0.4rem;
	}

	.legal-body strong { color: #1e293b; font-weight: 600; }

	.legal-body a {
		color: #0369a1;
		text-decoration: underline;
		text-decoration-color: rgba(3, 105, 161, 0.3);
		text-underline-offset: 3px;
		transition: color 0.15s;
	}

	.legal-body a:hover { color: #0284c7; }

	code {
		background: #f1f5f9;
		padding: 0.1em 0.4em;
		border-radius: 4px;
		font-size: 0.82em;
		font-family: 'Courier New', Courier, monospace;
		color: #0f172a;
	}

	/* ── Definition list ─────────────────────────────────────────────── */
	.term-list { margin: 0.5rem 0 0; }

	.term-list dt {
		font-size: 0.825rem;
		font-weight: 700;
		color: #1e293b;
		margin: 1.1rem 0 0.2rem;
		padding-left: 0.75rem;
		border-left: 3px solid #0e7490;
	}

	.term-list dt:first-child { margin-top: 0; }

	.term-list dd {
		font-size: 0.9rem;
		color: #475569;
		line-height: 1.75;
		margin: 0 0 0 1rem;
		padding: 0.4rem 0 0 0.5rem;
	}

	.term-list dd p { margin: 0 0 0.4rem; }
	.term-list dd ul { margin: 0.3rem 0; }

	/* ── Callouts ─────────────────────────────────────────────────────── */
	.callout {
		border-radius: var(--vnk-border-radius-sm, 0.5rem);
		padding: 0.875rem 1rem;
		font-size: 0.875rem;
		line-height: 1.7;
		margin: 0.875rem 0;
	}

	.callout strong { display: block; margin-bottom: 0.2rem; }

	.callout-info {
		background: #ecfeff;
		border-left: 3px solid #0e7490;
		color: #164e63;
	}

	.callout-info strong { color: #0e7490; }

	.callout-warning {
		background: #fff7ed;
		border-left: 3px solid #c2410c;
		color: #431407;
	}

	.callout-warning strong { color: #c2410c; }

	.callout-neutral {
		background: #f8fafc;
		border-left: 3px solid #64748b;
		color: #334155;
	}

	.callout-neutral strong { color: #334155; }

	/* ── Data tables ─────────────────────────────────────────────────── */
	.data-table-wrap {
		overflow-x: auto;
		margin: 0.75rem 0;
		border-radius: var(--vnk-border-radius-sm, 0.5rem);
		border: 1px solid #e2e8f0;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.83rem;
		min-width: 480px;
	}

	.data-table th {
		background: #f8fafc;
		font-family: var(--vnk-font-primary, 'Outfit', sans-serif);
		font-weight: 700;
		font-size: 0.75rem;
		color: #475569;
		text-align: left;
		padding: 0.6rem 0.9rem;
		border-bottom: 1px solid #e2e8f0;
		white-space: nowrap;
	}

	.data-table td {
		padding: 0.6rem 0.9rem;
		color: #475569;
		border-bottom: 1px solid #f1f5f9;
		vertical-align: top;
		line-height: 1.55;
	}

	.data-table tr:last-child td { border-bottom: none; }
	.data-table tr:hover td { background: #f8fafc; }

	/* ── Contact card ─────────────────────────────────────────────────── */
	.contact-card {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: var(--vnk-border-radius-md, 0.75rem);
		padding: 1.25rem 1.5rem;
		margin-top: 0.75rem;
	}

	.contact-logo {
		width: 44px;
		height: 44px;
		border-radius: 10px;
		background: #0f172a;
		color: #fff;
		font-family: var(--vnk-font-primary, 'Outfit', sans-serif);
		font-weight: 800;
		font-size: 0.85rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		letter-spacing: 0.02em;
	}

	.contact-name {
		font-family: var(--vnk-font-primary, 'Outfit', sans-serif);
		font-weight: 700;
		font-size: 0.95rem;
		color: #0f172a;
		margin: 0 0 0.4rem !important;
	}

	.contact-detail {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.85rem;
		color: #64748b;
		margin: 0.2rem 0 !important;
	}

	/* ── Kazakh summary section ──────────────────────────────────────── */
	.kz-section {
		background: #f8fafc;
		border-radius: var(--vnk-border-radius-md, 0.75rem);
		padding: 1.75rem;
		margin-top: 1.5rem;
		border: 1px solid #e2e8f0;
		overflow: hidden;
	}

	.kz-flag-bar {
		display: flex;
		height: 5px;
		border-radius: 999px;
		overflow: hidden;
		margin-bottom: 1.25rem;
		gap: 2px;
	}

	.kz-stripe { flex: 1; border-radius: 999px; }
	.kz-blue   { background: #00AFCA; }
	.kz-yellow { background: #F2C832; }

	.kz-section :global(h2),
	.kz-section h2 {
		font-size: 1rem !important;
		margin-top: 0 !important;
		padding-top: 0 !important;
		border-top: none !important;
		margin-bottom: 0.3rem !important;
	}

	.kz-subtitle {
		font-size: 0.78rem !important;
		color: #94a3b8 !important;
		margin-bottom: 1rem !important;
		font-style: italic;
	}

	.kz-list {
		padding-left: 1.25rem;
		margin: 0;
	}

	.kz-list li {
		font-size: 0.875rem;
		color: #475569;
		line-height: 1.7;
		margin-bottom: 0.5rem;
	}

	/* ── Kazakh full translation document ──────────────────────────────── */
	.kz-full-doc {
		margin-top: 3rem;
		border-top: 2px solid #e2e8f0;
		padding-top: 2.5rem;
	}

	.kz-doc-header {
		background: #0f172a;
		border-radius: var(--vnk-border-radius-md, 0.75rem);
		padding: 0 1.75rem 1.75rem;
		margin-bottom: 2rem;
		overflow: hidden;
	}

	.kz-flag-bar--wide {
		height: 6px;
		border-radius: 0;
		margin-left: -1.75rem;
		margin-right: -1.75rem;
		margin-bottom: 1.5rem;
		gap: 0;
	}

	.kz-doc-title-row {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.kz-doc-type {
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: #94a3b8;
		margin: 0 0 0.5rem;
	}

	.kz-doc-title {
		font-family: var(--vnk-font-primary, 'Outfit', sans-serif) !important;
		font-size: clamp(1.5rem, 3vw, 2.25rem) !important;
		font-weight: 800 !important;
		color: #fff !important;
		margin: 0 !important;
		letter-spacing: -0.02em;
		line-height: 1.15;
		border-top: none !important;
		padding-top: 0 !important;
	}

	.kz-doc-meta {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.25rem;
		font-size: 0.73rem;
		color: #94a3b8;
		text-align: right;
	}

	.kz-doc-note {
		font-size: 0.8rem !important;
		color: #94a3b8 !important;
		line-height: 1.65;
		margin: 1.25rem 0 0 !important;
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.05);
		border-left: 3px solid #00AFCA;
		border-radius: 0 0.375rem 0.375rem 0;
	}

	.kz-section-item {
		padding-top: 2.5rem;
		margin-bottom: 0;
	}

	.kz-section-item:first-child { padding-top: 0; }
	.kz-section-item + .kz-section-item { border-top: 1px solid #f1f5f9; }

	.kz-section-item h3 {
		font-family: var(--vnk-font-primary, 'Outfit', sans-serif);
		font-size: 1.05rem !important;
		font-weight: 700;
		color: #0f172a;
		margin: 0 0 1rem;
		letter-spacing: -0.01em;
	}

	/* ── Document footer ──────────────────────────────────────────────── */
	.doc-footer {
		border-top: 1px solid #f1f5f9;
		margin-top: 2.5rem;
		padding-top: 1.5rem;
		text-align: center;
	}

	.doc-footer p {
		font-size: 0.78rem !important;
		color: #94a3b8 !important;
		margin-bottom: 0.5rem !important;
	}

	.footer-links {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.78rem;
		color: #94a3b8;
	}

	.footer-links a { color: #64748b; text-decoration: none; }
	.footer-links a:hover { color: #0369a1; }
	.footer-links a[aria-current='page'] { color: #0369a1; font-weight: 600; }

	/* ── Responsive ──────────────────────────────────────────────────── */
	@media (max-width: 1024px) {
		.doc-layout {
			grid-template-columns: 1fr;
			padding: 1.5rem 1rem 4rem;
			gap: 1.5rem;
		}

		.toc-sidebar {
			position: static;
			max-height: none;
		}

		.toc-inner { display: none; }
	}

	@media (max-width: 640px) {
		.banner-inner { padding: 1.25rem 1rem 1.5rem; }

		.legal-body {
			padding: 1.75rem 1.25rem;
			border-radius: var(--vnk-border-radius-md, 0.75rem);
		}

		.kz-section { padding: 1.25rem 1rem; }

		.contact-card { flex-direction: column; }

		.kz-doc-header { padding: 0 1.25rem 1.25rem; }

		.kz-flag-bar--wide {
			margin-left: -1.25rem;
			margin-right: -1.25rem;
		}

		.kz-doc-title-row {
			flex-direction: column;
			align-items: flex-start;
		}

		.kz-doc-meta {
			align-items: flex-start;
			text-align: left;
		}

		.data-table-wrap { border-radius: 0.375rem; }
	}

	/* ── Kazakh TOC ─────────────────────────────────────────────────── */
	.kz-toc {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: var(--vnk-border-radius-md, 0.75rem);
		padding: 1.25rem 1.5rem;
		margin: 1rem 0 2rem;
	}
	.kz-toc-heading {
		font-family: var(--vnk-font-primary, 'Outfit', sans-serif);
		font-size: 0.7rem !important;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #94a3b8 !important;
		margin: 0 0 0.75rem;
	}
	.kz-toc-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 0.1rem 0.5rem;
	}
	.kz-toc-grid a {
		display: block;
		font-size: 0.78rem;
		color: #64748b !important;
		text-decoration: none !important;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		line-height: 1.4;
		transition: color 0.12s, background 0.12s;
	}
	.kz-toc-grid a:hover {
		color: #0f172a !important;
		background: #f1f5f9;
	}
</style>
