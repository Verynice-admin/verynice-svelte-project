<script>
	import { onMount } from 'svelte';

	const sections = [
		{ id: 's1',  label: '1. Acceptance of Terms' },
		{ id: 's2',  label: '2. Eligibility' },
		{ id: 's3',  label: '3. Description of Service' },
		{ id: 's4',  label: '4. Language & Translation' },
		{ id: 's5',  label: '5. Account Registration' },
		{ id: 's6',  label: '6. Business Listings' },
		{ id: 's7',  label: '7. User-Generated Content' },
		{ id: 's8',  label: '8. Content Moderation' },
		{ id: 's9',  label: '9. AI-Generated Content' },
		{ id: 's10', label: '10. Editorial Voice & Satire' },
		{ id: 's11', label: '11. Intellectual Property' },
		{ id: 's12', label: '12. Advertising & Affiliates' },
		{ id: 's13', label: '13. Cookies & Tracking' },
		{ id: 's14', label: '14. Personal Data & Privacy' },
		{ id: 's15', label: '15. Disputes & Governing Law' },
		{ id: 's16', label: '16. Third-Party Links' },
		{ id: 's17', label: '17. Disclaimers' },
		{ id: 's18', label: '18. Limitation of Liability' },
		{ id: 's19', label: '19. Indemnification' },
		{ id: 's20', label: '20. Force Majeure' },
		{ id: 's21', label: '21. Prohibited Conduct' },
		{ id: 's22', label: '22. Changes to Terms' },
		{ id: 's23', label: '23. General Provisions' },
		{ id: 's24', label: '24. Contact' },
		{ id: 's25', label: '25. Kazakh Summary / Қазақша' }
	];

	let activeId = 's1';

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeId = entry.target.id;
						break;
					}
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
	<title>Terms of Use | VeryNice.kz</title>
	<meta name="description" content="Terms of Use for VeryNice.kz — rules governing use of the Kazakhstan travel guide platform, including user accounts, business listings, advertising, and personal data." />
	<meta name="robots" content="noindex, follow" />
	<link rel="canonical" href="https://verynice.kz/terms" />
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
				<h1>Terms of Use</h1>
				<div class="doc-meta-row">
					<span class="meta-pill">
						<svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
							<path d="M5 1v4M11 1v4M2 7h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
						</svg>
						Last updated: 16 May 2026
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
						Governing law: Kazakhstan
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
					The legally binding version of these Terms is in <strong>Kazakh</strong> per
					Law No. 7-I and Law No. 18-VIII — see <a href="#s25">§25</a>.
					The English text is a convenience translation only.
					These Terms also contain a <strong>Limitation of Liability</strong> clause (§18) and
					<strong>Dispute Resolution</strong> provisions (§15). Please read them carefully.
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
				<h2>1. Acceptance of Terms</h2>
				<p>
					By accessing or using <strong>VeryNice.kz</strong> (the "Site" or "Platform"), you agree
					to be bound by these Terms of Use ("Terms"), our Privacy Policy, and our Cookie Policy,
					all incorporated here by reference. If you do not agree, you must not use the Site.
				</p>
				<p>
					These Terms form a legally binding agreement between you and the individual operator of
					VeryNice.kz ("we", "us", or "our"), reachable at
					<a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>.
				</p>
				<div class="callout callout-neutral">
					<strong>Operator identity and commercial status.</strong> The Site is currently operated
					by a private individual. The Site generates revenue through advertising and affiliate
					commissions, which may constitute commercial activity under Kazakhstan law. The operator
					is in the process of completing registration as an Individual Entrepreneur (ИП) or
					equivalent legal entity under the Law of the Republic of Kazakhstan. These Terms will be
					updated with full registered entity details upon completion of that registration. Full
					legal identity details are available on written request to
					<a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>.
				</div>
				<div class="callout callout-info">
					<strong>Electronic contract — Law No. 370-II (ҚР Электрондық сауда туралы Заңы).</strong>
					By accessing or using VeryNice.kz, you enter into a valid electronic contract governed
					by the Law of the Republic of Kazakhstan No. 370-II "On Electronic Commerce" (October
					2003, as amended). These Terms constitute the full text of that electronic contract. In
					accordance with Law No. 7-I "On Languages in the Republic of Kazakhstan," the
					<strong>Kazakh-language version</strong> of these Terms (provided in Section 25) is the
					authoritative text of this electronic contract for all purposes under Kazakhstan law.
				</div>
			</section>

			<!-- ── 2 ─────────────────────────────────────────────────────── -->
			<section id="s2">
				<h2>2. Eligibility</h2>
				<dl class="term-list">
					<dt>2.1 Minimum age — general</dt>
					<dd>You must be at least <strong>13 years of age</strong> to use the Site. Users under 18 represent that they have the permission of a parent or legal guardian.</dd>

					<dt>2.2 Minimum age — EEA and UK users</dt>
					<dd>
						For users in the European Economic Area (EEA) or United Kingdom, the minimum age for
						providing independent consent to personal data processing is <strong>16 years</strong>
						under Article 8 of the GDPR (Regulation (EU) 2016/679), unless the applicable national
						law of your Member State sets a lower age (minimum 13). If you are between 13 and the
						applicable consent age in your country, you must have the <strong>explicit written
						consent of a parent or legal guardian</strong> before creating an account or submitting
						any personal data. If you are unsure of the applicable age in your country, please
						consult the relevant national data protection authority.
					</dd>

					<dt>2.3 Business accounts</dt>
					<dd>If you are registering a Business Account, you represent that you have full legal authority to bind the business entity you represent.</dd>

					<dt>2.4 Additional rights — EEA and UK</dt>
					<dd>Users located in the EEA or United Kingdom have additional data protection rights described in our Privacy Policy and in Section 14 of these Terms.</dd>
				</dl>
			</section>

			<!-- ── 3 ─────────────────────────────────────────────────────── -->
			<section id="s3">
				<h2>3. Description of Service</h2>
				<p>VeryNice.kz is an informational travel guide covering Kazakhstan's destinations, culture, cuisine, hotels, restaurants, attractions, and travel logistics. The Site provides:</p>
				<ul>
					<li>Editorial destination guides and travel articles</li>
					<li>Hotel, restaurant, and tourism supplier listings</li>
					<li>User comment and review functionality</li>
					<li>Business listing registration for tourism-related suppliers</li>
				</ul>
				<p>The Site is provided free of charge to individual users. Business listing services may be subject to separate commercial terms communicated at the time of registration.</p>
				<div class="callout callout-warning">
					<strong>Important — Platform status: not a travel agent or booking intermediary.</strong>
					VeryNice.kz is an <em>informational directory and content platform only</em>. It is
					<strong>not</strong> a travel agent, tour operator, booking intermediary, travel
					management company, or package travel organiser within the meaning of any applicable
					law. The Site does not enter into any contractual relationship between you and any
					listed hotel, restaurant, tour operator, guide, or other supplier. Any booking,
					transaction, or agreement made with a third party found through or linked from the Site
					is solely between you and that third party. VeryNice.kz is not a party to any such
					agreement and accepts no responsibility for its performance or outcome.
				</div>
				<div class="callout callout-neutral">
					<strong>Kazakhstan Law No. 210-IV — "On Tourist Activities in the RK."</strong>
					VeryNice.kz does not hold and is not required to hold a licence as a tour operator
					(<em>туроператор</em>) or travel agent (<em>туристік агент</em>) under the Law of the
					Republic of Kazakhstan No. 210-IV "On Tourist Activities in the Republic of Kazakhstan"
					(13 June 2001, as amended). Publishing editorial travel content and displaying
					third-party business listings are not regulated tourist activities under that Law.
					Users should obtain all travel and booking services directly from licensed tour
					operators and travel agents.
				</div>
				<div class="callout callout-neutral">
					<strong>Mass Media registration — Kazakhstan legislation on mass media.</strong>
					Under Kazakhstan's legislation on mass media, websites publishing regular editorial
					content for a mass audience may be subject to registration requirements as electronic
					mass media (электрондық бұқаралық ақпарат құралдары). VeryNice.kz publishes
					editorial travel content and is assessing its registration obligations under the
					applicable mass media legislation of the Republic of Kazakhstan. The operator will
					complete any applicable registration and update these Terms accordingly.
				</div>
			</section>

			<!-- ── 4 ─────────────────────────────────────────────────────── -->
			<section id="s4">
				<h2>4. Language and Authoritative Version</h2>
				<div class="callout callout-warning">
					<strong>Ресми тіл — ҚАЗАҚША · Authoritative Language: KAZAKH.</strong>
					In accordance with the Law of the Republic of Kazakhstan No. 7-I "On Languages in the
					Republic of Kazakhstan" (11 November 1997, as amended) and Article 8 of the Law of
					the Republic of Kazakhstan No. 18-VIII "On Online Platforms and Online Advertising"
					(2023), the <strong>primary and authoritative language</strong> of these Terms and all
					legal documents on VeryNice.kz is <strong>Kazakh (Қазақша)</strong>.
					Law No. 7-I establishes Kazakh as the state language of the Republic of Kazakhstan and
					requires contracts and official documents concluded in Kazakhstan to be prepared in the
					state language (Article 8 of Law No. 7-I).
					<br><br>
					In the event of any inconsistency, ambiguity, or conflict between the Kazakh version
					and any other language version of these Terms,
					<strong>the Kazakh version prevails unconditionally and without exception.</strong>
					For any legal proceedings in the courts of the Republic of Kazakhstan, only the
					Kazakh version shall be treated as the authoritative binding text, in accordance with
					Article 14 of the Code of Civil Procedure of the Republic of Kazakhstan. The full
					Kazakh-language version is provided in <a href="#s25">Section 25</a>.
				</div>
				<dl class="term-list">
					<dt>4.1 Russian (Русский)</dt>
					<dd>Russian is provided as the second official language of the Republic of Kazakhstan
					in accordance with Article 7(2) of the Constitution of the Republic of Kazakhstan and
					Article 5 of Law No. 7-I, which permits official use of Russian on equal grounds with
					Kazakh in state organisations. A Russian-language version of these Terms will be
					published on the Site. In any dispute, the Kazakh version remains authoritative over
					the Russian version.</dd>

					<dt>4.2 English</dt>
					<dd>The English version of these Terms is a <strong>convenience translation</strong>
					provided for the benefit of international users only. It is a translation of the Kazakh
					authoritative text and does <strong>not</strong> constitute a legally binding document
					for purposes of any dispute, claim, or legal proceedings within the Republic of
					Kazakhstan. International users outside Kazakhstan may rely on the English version
					for informational purposes, subject in all cases to the Kazakh version prevailing.</dd>

					<dt>4.3 AI-assisted translations</dt>
					<dd>Non-Kazakh versions of Site editorial content are produced using artificial
					intelligence translation tools. While we strive for accuracy, AI translations may
					contain errors, omissions, or cultural inaccuracies and are provided for convenience
					only. The Kazakh version remains authoritative in all cases.</dd>
				</dl>
			</section>

			<!-- ── 5 ─────────────────────────────────────────────────────── -->
			<section id="s5">
				<h2>5. Account Registration and Third-Party Authentication</h2>
				<dl class="term-list">
					<dt>5.1 How to register</dt>
					<dd>You may create an account using third-party OAuth credentials (e.g., Google, Apple, or other supported providers — "Third-Party Authentication Providers"). Direct email/password registration may also be offered in future.</dd>

					<dt>5.2 Third-party data sharing</dt>
					<dd>When you authenticate via a Third-Party Provider, that provider shares certain profile information (typically your name and email address) with us. Your use of those providers is governed by their own terms and privacy policies, which you remain solely responsible for.</dd>

					<dt>5.3 Account security</dt>
					<dd>You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. Notify us immediately at <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a> if you suspect unauthorised use.</dd>

					<dt>5.4 Accurate information</dt>
					<dd>You agree to provide accurate, current, and complete information at registration and to keep your profile up to date.</dd>

					<dt>5.5 One account per person</dt>
					<dd>Creating multiple accounts to circumvent moderation decisions or these Terms is prohibited.</dd>

					<dt>5.6 Suspension and termination</dt>
					<dd>We may suspend or terminate accounts that violate these Terms, subject to the complaint process in Section 15.</dd>
				</dl>
			</section>

			<!-- ── 6 ─────────────────────────────────────────────────────── -->
			<section id="s6">
				<h2>6. Business Listings and Supplier Accounts</h2>
				<dl class="term-list">
					<dt>6.1 Who may register</dt>
					<dd>Hotels, restaurants, tour operators, and other tourism-related businesses may register a Business Account to manage their listing on the Site.</dd>

					<dt>6.2 Verification — Kazakhstan businesses</dt>
					<dd>Businesses registered in Kazakhstan may be required to provide their 12-digit Business Identification Number (BIN / БСН — for legal entities) or Individual Identification Number (IIN / ЖСН — for individual entrepreneurs), as issued by the Committee of State Revenues (Мемлекеттік кірістер комитеті) of the Ministry of Finance of the Republic of Kazakhstan or via <a href="https://egov.kz" target="_blank" rel="noopener noreferrer">egov.kz</a>, together with any other documentation sufficient to verify legal status and the right to operate in the relevant sector.</dd>

					<dt>6.3 Verification — foreign businesses</dt>
					<dd>Non-Kazakhstan businesses may provide equivalent business registration documentation from their jurisdiction, including company registration number, VAT/tax registration, or equivalent government-issued identification.</dd>

					<dt>6.4 Accuracy and responsibility</dt>
					<dd>Business Account holders are solely responsible for the accuracy, completeness, legality, and currency of all submitted listing information — descriptions, pricing, contact details, images, licence/permit status, and availability. VeryNice.kz does not verify, audit, or warrant the accuracy of any listing.</dd>

					<dt>6.5 Prohibited listings</dt>
					<dd>The following are not permitted: illegal services; fraudulent or misleading listings; listings by entities operating without legally required licences or permits under Kazakhstan law; listings that infringe third-party intellectual property rights.</dd>

					<dt>6.6 No accreditation or endorsement</dt>
					<dd>Listing on VeryNice.kz does not constitute accreditation, quality certification, safety inspection, or endorsement of any kind. Users must conduct their own due diligence before engaging with any listed supplier.</dd>

					<dt>6.7 Removal</dt>
					<dd>We reserve the right to remove or delist any Business Account where we receive credible reports of fraud, illegal conduct, safety concerns, consumer harm, or breach of these Terms. Disputed removals may be appealed under Section 15.</dd>

					<dt>6.8 User reviews of businesses</dt>
					<dd>Reviews submitted by individual users are independent opinions and do not represent the editorial views of VeryNice.kz.</dd>
				</dl>
			</section>

			<!-- ── 7 ─────────────────────────────────────────────────────── -->
			<section id="s7">
				<h2>7. User-Generated Content</h2>
				<dl class="term-list">
					<dt>7.1 Licence grant</dt>
					<dd>By submitting comments, reviews, ratings, photographs, or other content ("User Content"), you grant VeryNice.kz a worldwide, non-exclusive, royalty-free, sublicensable, and transferable licence to use, reproduce, distribute, display, and adapt your User Content for the purposes of operating, promoting, and improving the Site.</dd>

					<dt>7.2 Your warranties</dt>
					<dd>You represent and warrant that: (a) you own or have all necessary rights to submit the User Content; (b) the User Content does not infringe any third-party intellectual property, privacy, or personality rights; and (c) the User Content is truthful and not misleading.</dd>

					<dt>7.3 Prohibited User Content</dt>
					<dd>
						<p>You must not submit content that:</p>
						<ul>
							<li>is false, deceptive, or misleading</li>
							<li>contains hate speech or discrimination based on race, ethnicity, religion, gender, sexual orientation, disability, or nationality</li>
							<li>constitutes harassment, threats, or abuse</li>
							<li>is sexually explicit or involves minors in any harmful way</li>
							<li>promotes or facilitates illegal activities</li>
							<li>infringes third-party intellectual property rights</li>
							<li>constitutes spam, bulk posting, or unsolicited commercial messages</li>
							<li>discloses personal information of third parties without their consent</li>
							<li>contains malware, viruses, or other harmful code</li>
						</ul>
					</dd>

					<dt>7.4 Reviews</dt>
					<dd>Reviews must reflect genuine personal experiences. Fake reviews, reviews by employees about their own employer's listing, and incentivised reviews without clear disclosure are prohibited.</dd>
				</dl>
			</section>

			<!-- ── 8 ─────────────────────────────────────────────────────── -->
			<section id="s8">
				<h2>8. Content Moderation</h2>
				<p>All User Content is subject to moderation — before or after publication — using a combination of AI-assisted and human review. We reserve the right to remove, edit, or refuse to publish any User Content without prior notice.</p>
				<div class="callout callout-info">
					<strong>Platform immunity — Law No. 18-VIII Art. 11.</strong>
					Under Article 11 of the Law of the Republic of Kazakhstan No. 18-VIII "On Online
					Platforms and Online Advertising" (2023), the Platform is not liable for third-party
					content — including user reviews, comments, and business listings — where the Platform
					did not initiate the content, select the recipient, or modify its substance. This
					statutory immunity is not waived by the moderation activity described in this section.
					Upon receiving a valid, sufficiently substantiated takedown notice, the Platform will
					act expeditiously to remove or disable access to the reported content.
				</div>
				<div class="callout callout-info">
					<strong>Reporting.</strong> If you believe User Content violates these Terms or applicable law, report it to <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>. We will provide a reasoned response within <strong>20 calendar days</strong> of receipt, in accordance with Article 9 of Kazakhstan Law No. 18-VIII.
				</div>
				<p><strong>Appeals.</strong> If your content is removed, you may submit an appeal to <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>. We will review appeals on a reasonable-efforts basis.</p>
			</section>

			<!-- ── 9 ─────────────────────────────────────────────────────── -->
			<section id="s9">
				<h2>9. AI-Generated and AI-Assisted Content</h2>
				<p>
					Some editorial content on the Site is generated or substantially assisted by artificial
					intelligence tools. AI-generated content may contain inaccuracies, outdated information,
					or cultural misrepresentations. It is provided for informational purposes only and
					<strong>does not constitute professional advice</strong> of any kind — including legal,
					medical, financial, visa, or safety advice.
				</p>
				<p>Where content is primarily AI-generated, we endeavour to label it as such. The absence of a label does not guarantee content is exclusively human-authored.</p>
				<div class="callout callout-neutral">
					<strong>EU AI Act — forward-looking compliance.</strong> The EU Artificial Intelligence
					Act (Regulation (EU) 2024/1689), which entered into force in August 2024 with phased
					application through 2025–2027, imposes transparency and labelling obligations on
					AI-generated and AI-manipulated content under Article 50. We intend to implement
					machine-readable labelling of AI-generated content in compliance with Article 50 as
					applicable obligations come into effect for platforms serving EU users.
				</div>
			</section>

			<!-- ── 10 ─────────────────────────────────────────────────────── -->
			<section id="s10">
				<h2>10. Editorial Voice, Pop Culture References, and Satire</h2>
				<p>
					VeryNice.kz may reference international pop culture and well-known media portrayals of
					Kazakhstan — including references to the <em>Borat</em> film franchise — for the
					purposes of user engagement and cultural contextualisation.
				</p>
				<div class="callout callout-neutral">
					<strong>Important.</strong> Such references are for entertainment and engagement only. They do not represent the editorial position of VeryNice.kz. The Site's core mission is to showcase the authentic history, culture, people, cuisine, and natural beauty of Kazakhstan accurately and respectfully. We acknowledge and respect the sensitivities of Kazakhstani citizens regarding certain international media portrayals of their country.
				</div>
				<p>If you believe any content is disrespectful or offensive, please contact <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>.</p>
			</section>

			<!-- ── 11 ─────────────────────────────────────────────────────── -->
			<section id="s11">
				<h2>11. Intellectual Property</h2>
				<p>All editorial content, design elements, logos, trademarks, and source code on the Site are owned by VeryNice.kz or its licensors, protected under the Law of the Republic of Kazakhstan No. 6-II "On Copyright and Related Rights" (as amended, together with any successor legislation currently in force) and applicable international copyright treaties.</p>
				<p>You may not reproduce, distribute, publicly display, or create derivative works from Site content without prior written permission, except as expressly permitted by law. Photographs served via Cloudinary or other third-party providers may carry separate licensing restrictions.</p>
				<p><strong>Copyright / takedown requests.</strong> Send a notice to <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a> identifying the infringing material, your contact information, and a statement of your rights.</p>
				<p><strong>Feedback.</strong> Any ideas or suggestions you provide may be used by us freely and without compensation.</p>
			</section>

			<!-- ── 12 ─────────────────────────────────────────────────────── -->
			<section id="s12">
				<h2>12. Advertising, Sponsored Content, and Affiliate Links</h2>
				<dl class="term-list">
					<dt>12.1 Advertising</dt>
					<dd>The Site displays third-party advertisements. Advertisements are not endorsements of the advertised products or services.</dd>

					<dt>12.2 Labelling (Kazakhstan law)</dt>
					<dd>All paid advertising and sponsored content is labelled as "Sponsored", "Advertisement", "Ad", or an equivalent marker, in accordance with the Law of the Republic of Kazakhstan No. 508-II "On Advertising" (as amended) and Law No. 18-VIII "On Online Platforms and Online Advertising" (2023).</dd>

					<dt>12.3 Affiliate links</dt>
					<dd>The Site contains affiliate links to booking platforms, tour operators, and travel services. If you click an affiliate link and make a purchase, we may receive a commission at no additional cost to you. Affiliate links are identified where practicable.</dd>

					<dt>12.4 Editorial independence</dt>
					<dd>Commercial relationships do not influence our editorial content or ratings.</dd>

					<dt>12.5 Prices and availability</dt>
					<dd>Prices and availability shown via third-party links are controlled by those third parties and may differ at the time of booking. Always verify current terms directly on the relevant platform before making any booking or purchase.</dd>
				</dl>
			</section>

			<!-- ── 13 ─────────────────────────────────────────────────────── -->
			<section id="s13">
				<h2>13. Cookies and Tracking Technologies</h2>
				<p>The Site uses cookies and similar tracking technologies for essential functionality, analytics (Google Analytics / GA4), and advertising personalisation. On your first visit, you will be presented with a cookie consent banner. Essential cookies cannot be disabled as they are necessary for the Site to function. Non-essential cookies (analytics, advertising) require your opt-in consent and may be declined or withdrawn at any time through the cookie preference centre.</p>
				<p>Third-party advertising partners may use cookies to serve personalised advertisements. You may opt out via industry opt-out tools (e.g., YourAdChoices, NAI opt-out). For full details see our Cookie Policy.</p>
			</section>

			<!-- ── 14 ─────────────────────────────────────────────────────── -->
			<section id="s14">
				<h2>14. Personal Data and Privacy</h2>
				<p>We collect and process personal data in accordance with the Law of the Republic of Kazakhstan No. 94-V "On Personal Data and their Protection" (as amended, including the July 2024 amendments) and, where applicable, the EU General Data Protection Regulation (GDPR 2016/679) and other applicable data protection laws.</p>

				<div class="callout callout-info">
					<strong>Data processing principles — Law No. 94-V, Article 5.</strong>
					Personal data is processed in accordance with the following principles set out in
					Article 5 of Law No. 94-V: (a) <strong>lawfulness</strong> — processing has a
					legitimate legal basis; (b) <strong>limited purpose</strong> — data is collected
					for specific, defined purposes only; (c) <strong>proportionality</strong> — only
					data necessary for the stated purpose is collected; (d) <strong>accuracy</strong>
					— data is kept accurate and up to date; (e) <strong>security</strong> — appropriate
					technical and organisational measures are in place; (f)
					<strong>confidentiality</strong> — data is not disclosed to unauthorised persons.
				</div>

				<dl class="term-list">
					<dt>14.1 Consent mechanism (KZ Law No. 94-V)</dt>
					<dd>Where personal data processing is based on consent under Kazakhstan law, consent is obtained through the account registration process (tick-box confirmation), cookie consent banner, or other explicit opt-in mechanism at the point of collection. You may withdraw consent at any time as described in clause 14.4.</dd>

					<dt>14.2 Legal bases for processing (GDPR — EEA/UK users)</dt>
					<dd>For users in the EEA or UK, personal data is processed on the following legal bases as applicable: (a) <strong>performance of a contract</strong> — account management and service delivery; (b) <strong>legitimate interests</strong> — site security, fraud prevention, and analytics; (c) <strong>consent</strong> — marketing communications and non-essential cookies; (d) <strong>legal obligation</strong> — tax records, regulatory reporting, and breach notification. Full details per processing activity are specified in our <a href="/privacy">Privacy Policy</a>.</dd>

					<dt>14.3 Data localisation (KZ)</dt>
					<dd>The operator is evaluating and implementing data localisation compliance for "restricted personal data" under Law No. 94-V, Article 17. Our current primary infrastructure providers (Google Firebase, Vercel) operate data centres globally, including outside the Republic of Kazakhstan. Until data routing to Kazakhstan-located servers is confirmed for all restricted personal data categories, such data transfers are subject to the cross-border transfer notification procedure under Article 18 of Law No. 94-V. Current compliance status is set out in full in our <a href="/privacy#s10">Privacy Policy §10</a>.</dd>

					<dt>14.4 Right to withdraw consent</dt>
					<dd>Where processing is based on consent, you may withdraw that consent at any time without affecting the lawfulness of processing carried out before withdrawal. To withdraw: (a) use the cookie preference centre on the Site; or (b) email <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a> specifying the consent you are withdrawing.</dd>

					<dt>14.5 Data retention</dt>
					<dd>Personal data is retained for as long as your account remains active, and for a maximum of <strong>3 years</strong> after account deletion or your last interaction with the Site, unless a longer period is required by applicable law (e.g., accounting records under Kazakhstan tax law may require retention for up to 5 years). Specific retention periods per data category are set out in our Privacy Policy.</dd>

					<dt>14.6 Your rights</dt>
					<dd>Under applicable law you may have the right to: access your personal data; rectify inaccurate data; request erasure ("right to be forgotten"); restrict processing; data portability; and object to processing. To exercise any right, contact <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>. We will respond within 30 days (GDPR) or within the timeframe required by applicable KZ law.</dd>

					<dt>14.7 Breach notification</dt>
					<dd>In the event of a personal data security breach, we will notify the Committee for Information Security of the Ministry of Digital Development, Innovations and Aerospace Industry of the Republic of Kazakhstan within <strong>72 hours</strong> of becoming aware of the breach, in accordance with the amended Law No. 94-V (amendments effective 1 July 2024), and will notify affected data subjects where required</dd>

					<dt>14.8 Children</dt>
					<dd>We do not knowingly collect personal data from children under 13. Contact <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a> immediately if you believe a child under 13 has provided personal data through the Site.</dd>
				</dl>
				<p>Full details of data collection, purposes, and your rights are in our <a href="/privacy">Privacy Policy</a>.</p>
			</section>

			<!-- ── 15 ─────────────────────────────────────────────────────── -->
			<section id="s15">
				<h2>15. Complaints and Dispute Resolution</h2>
				<dl class="term-list">
					<dt>15.1 Informal resolution</dt>
					<dd>We encourage you to contact us first at <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>. We will provide a substantive response within <strong>20 calendar days</strong> in accordance with Article 9 of Law No. 18-VIII.</dd>

					<dt>15.2 Governing law and authoritative language in proceedings</dt>
					<dd>These Terms are governed by the laws of the Republic of Kazakhstan. In accordance
					with Law No. 7-I "On Languages in the Republic of Kazakhstan" and Article 14 of the
					Code of Civil Procedure of the Republic of Kazakhstan, court proceedings are conducted
					in Kazakh (or Russian). In any legal proceedings before courts of the Republic of
					Kazakhstan, the <strong>Kazakh-language version of these Terms shall be submitted as
					the sole authoritative text</strong>. The English-language version shall not be
					submitted as primary evidence in Kazakhstan court proceedings and shall not be relied
					upon to contradict or vary the Kazakh version.</dd>

					<dt>15.3 Jurisdiction — competent courts</dt>
					<dd>
						Subject to clauses 15.4 and 15.5 below, disputes shall be referred to the
						competent courts of Almaty, Republic of Kazakhstan, determined as follows:
						<br><br>
						<strong>Consumer and individual claims:</strong> Алматы қалалық соты (Almaty City
						Court) or the relevant district court of Almaty, in accordance with the Code of
						Civil Procedure of the Republic of Kazakhstan.
						<br>
						<strong>Commercial and business-to-business disputes:</strong> Алматы
						мамандандырылған ауданаралық экономикалық соты (Almaty Specialised Inter-District
						Economic Court), in accordance with Article 27 of the Code of Civil Procedure of
						the Republic of Kazakhstan.
					</dd>

					<dt>15.4 EU and EEA consumers — jurisdiction carve-out</dt>
					<dd>Notwithstanding clause 15.3, if you are a consumer habitually resident in the European Union or European Economic Area, you retain the right to bring proceedings before the courts of your country of habitual residence under EU Regulation No. 1215/2012 (Brussels I Recast) and applicable consumer protection law. You may not be required to litigate exclusively in Kazakhstan courts.</dd>

					<dt>15.5 UK consumers</dt>
					<dd>If you are a consumer habitually resident in the United Kingdom, you retain the right to bring proceedings before UK courts in accordance with applicable UK consumer protection legislation.</dd>

					<dt>15.6 Alternative Dispute Resolution (ADR) — EU/EEA</dt>
					<dd>
						In accordance with EU Directive 2013/11/EU on alternative dispute resolution and EU
						Regulation No. 524/2013 on online dispute resolution, EU consumers may access the
						European Commission's Online Dispute Resolution (ODR) platform at
						<a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>.
						We are not currently registered with a specific accredited ADR body but will engage
						in good faith with any ADR process initiated through the ODR platform.
					</dd>

					<dt>15.7 Kazakhstan mediation</dt>
					<dd>For Kazakhstan-based disputes, mediation may be pursued through the Kazakhstan Chamber of Mediators or other accredited mediation centres prior to court proceedings, in accordance with the Law of the Republic of Kazakhstan "On Mediation" (No. 401-IV).</dd>

					<dt>15.8 Data protection complaints</dt>
					<dd>If you are located in the EEA or UK, you have the right to lodge a complaint with your local data protection supervisory authority at any time, regardless of any other dispute resolution process.</dd>

					<dt>15.9 Consumer rights</dt>
					<dd>Nothing in these Terms limits your statutory rights as a consumer under any applicable mandatory law.</dd>
				</dl>
			</section>

			<!-- ── 16 ─────────────────────────────────────────────────────── -->
			<section id="s16">
				<h2>16. Third-Party Links and Services</h2>
				<p>The Site links to third-party websites and services. We are not responsible for their content, accuracy, privacy practices, or availability. Inclusion of a link is not an endorsement. Third-Party Authentication Providers (e.g., Google) operate under their own terms of service and privacy policies.</p>
			</section>

			<!-- ── 17 ─────────────────────────────────────────────────────── -->
			<section id="s17">
				<h2>17. Disclaimers and Accuracy of Information</h2>
				<p>The Site and its content are provided on an <strong>"as is" and "as available"</strong> basis without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or accuracy. Nothing on the Site constitutes legal, medical, financial, safety, or visa advice.</p>

				<dl class="term-list">
					<dt>17.1 Visa, immigration, and entry requirements</dt>
					<dd>
						Visa requirements, entry conditions, border crossing rules, permit requirements, and
						immigration regulations for Kazakhstan and other countries change frequently and with
						little or no notice, and may differ by nationality, travel history, passport type, and
						current geopolitical conditions. Information on this Site regarding visas and entry
						requirements is provided for <strong>general guidance only</strong> and must
						<strong>not</strong> be relied upon as a substitute for official advice.
						<br><br>
						Before any international travel, independently verify all visa, entry, and permit
						requirements through: the official embassy or consulate of your destination country;
						the Ministry of Foreign Affairs of the Republic of Kazakhstan
						(<a href="https://www.gov.kz/memleket/entities/mfa" target="_blank" rel="noopener noreferrer">mfa.gov.kz</a>);
						or a licensed immigration adviser or travel agent.
						<br><br>
						<strong>The operator accepts no liability for denied entry, deportation, detention,
						financial loss, or any other consequence arising from reliance on visa or immigration
						information published on this Site.</strong>
					</dd>

					<dt>17.2 Personal safety and physical risk</dt>
					<dd>
						Kazakhstan includes regions with extreme climate conditions (temperatures ranging from
						−40°C in winter to +45°C in summer), high-altitude terrain, remote wilderness areas,
						and locations with limited emergency services or medical infrastructure. The Site may
						feature content about adventure tourism, trekking, mountain activities, steppe travel,
						and winter sports. Such activities carry inherent physical risks including serious
						injury, illness, and death.
						<br><br>
						The Site does not assess, inspect, certify, or warrant the safety standards of any
						destination, activity, route, or supplier listed. You are solely responsible for
						independently assessing the physical risks of any activity and for taking appropriate
						precautions. <strong>The operator accepts no liability for personal injury, illness,
						or death arising from participation in any activity referenced or suggested on
						the Site.</strong>
					</dd>

					<dt>17.3 Tour operators, guides, and suppliers — no agency</dt>
					<dd>
						As stated in Section 3, VeryNice.kz is an informational directory and is not a travel
						agent, tour operator, or booking intermediary. Listing a supplier on this Site does
						not mean the supplier has been vetted, inspected, licensed, or approved by
						VeryNice.kz. Any claim, dispute, injury, financial loss, or other harm arising from
						your engagement with a listed supplier is a matter solely between you and that
						supplier. VeryNice.kz has no contractual relationship with you in respect of any
						supplier transaction.
					</dd>

					<dt>17.4 Travel insurance</dt>
					<dd>
						<strong>The operator strongly recommends that all travellers to Kazakhstan and the
						Central Asia region obtain comprehensive travel insurance before departure</strong>,
						including cover for: emergency medical treatment and evacuation; cancellation and
						curtailment; personal liability; lost or stolen property; and adventure or extreme
						sports activities where applicable. Failure to obtain adequate travel insurance is
						your sole responsibility. VeryNice.kz accepts no liability for losses that would
						have been covered by appropriate insurance.
					</dd>

					<dt>17.5 Health, medical, and dietary risks</dt>
					<dd>
						Some regions of Kazakhstan present health risks including altitude sickness
						(particularly in Almaty and mountain areas above 2,000m), foodborne illness, and
						waterborne pathogens. Access to specialist medical care may be limited in remote
						areas. Consult a qualified travel medicine specialist or your physician before
						travelling, particularly if you have pre-existing medical conditions.
						<br><br>
						Food and drink content on this Site is provided for discovery and enjoyment purposes
						only and does not account for individual dietary restrictions, food allergies,
						intolerances, or medical conditions. <strong>The operator accepts no liability for
						any illness, allergic reaction, or medical event arising from consumption of food
						or drink at any establishment listed or described on the Site.</strong>
					</dd>

					<dt>17.6 Currency, pricing, and financial information</dt>
					<dd>
						Prices shown on the Site or via affiliated third-party platforms are indicative only
						and may be expressed in Kazakhstani Tenge (KZT), US Dollars (USD), Euros (EUR), or
						other currencies. Exchange rates fluctuate and actual costs in your home currency may
						differ materially from those displayed. The operator accepts no responsibility for
						pricing discrepancies, exchange rate losses, hidden charges, or fees applied by your
						bank or payment provider.
					</dd>

					<dt>17.7 General accuracy</dt>
					<dd>
						Opening hours, prices, contact details, seasonal availability, and other operational
						information change frequently. We strive for accuracy but cannot guarantee that all
						information is current. Always verify critical operational details directly with the
						relevant establishment before visiting.
					</dd>
				</dl>
			</section>

			<!-- ── 18 ─────────────────────────────────────────────────────── -->
			<section id="s18">
				<h2>18. Limitation of Liability</h2>
				<div class="callout callout-warning">
					To the maximum extent permitted by applicable law, VeryNice.kz and its operator shall
					not be liable for: (a) any indirect, incidental, special, consequential, or punitive
					damages; (b) loss of profits, revenue, data, or business opportunities; (c) personal
					injury or property damage arising from use of or reliance on the Site; or (d) errors
					or inaccuracies in travel information, AI-generated content, or translated content.
				</div>
				<p>Nothing in these Terms limits liability for: death or personal injury caused by negligence; fraud or fraudulent misrepresentation; or any liability that cannot be excluded or limited under applicable mandatory law.</p>
				<p><strong>EU and UK consumers.</strong> For consumers in the EEA or UK, nothing in this Section excludes or restricts liability that cannot be excluded under Directive 93/13/EEC on unfair contract terms, the Consumer Rights Directive (2011/83/EU), the UK Consumer Rights Act 2015, or equivalent mandatory consumer protection legislation.</p>
				<p><strong>Kazakhstan consumers.</strong> For consumers in Kazakhstan, nothing in this Section excludes liability that cannot be excluded under the Law of the Republic of Kazakhstan No. 274-IV "On Consumer Protection" (as amended).</p>
			</section>

			<!-- ── 19 ─────────────────────────────────────────────────────── -->
			<section id="s19">
				<h2>19. Indemnification</h2>
				<p>You agree to indemnify and hold harmless VeryNice.kz and its operator from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising from: (a) your use of the Site in breach of these Terms; (b) User Content you submit; (c) your wilful violation of these Terms; or (d) your infringement of third-party rights.</p>
				<p><strong>Consumer limitation.</strong> This indemnification obligation does not apply to claims arising from ordinary personal use of the Site by individual consumers, to the extent that applicable consumer protection law — including the Law of the Republic of Kazakhstan No. 274-IV "On Consumer Protection" and EU consumer protection directives — renders such an obligation unfair or unenforceable.</p>
			</section>

			<!-- ── 20 ─────────────────────────────────────────────────────── -->
			<section id="s20">
				<h2>20. Force Majeure</h2>
				<p>We shall not be liable for failure or delay in performance caused by circumstances that are extraordinary and unavoidable, consistent with Article 401 of the Civil Code of the Republic of Kazakhstan, including: acts of God; war, armed conflict, or terrorism; civil unrest or government action; epidemics or pandemics; internet or telecommunications infrastructure outages; earthquake, flood, or other natural disasters. The affected party shall notify the other as soon as reasonably practicable and shall use reasonable efforts to mitigate the impact.</p>
			</section>

			<!-- ── 21 ─────────────────────────────────────────────────────── -->
			<section id="s21">
				<h2>21. Prohibited Conduct</h2>
				<p>You agree not to:</p>
				<ul>
					<li>scrape, crawl, or data-mine the Site without our prior written permission</li>
					<li>use automated tools to create accounts, post content, or interact with the Site in bulk</li>
					<li>attempt to gain unauthorised access to any part of the Site or its infrastructure</li>
					<li>reverse engineer, decompile, or disassemble any software forming part of the Site</li>
					<li>use the Site in a way that violates any applicable law or regulation</li>
					<li>impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
					<li>interfere with or disrupt the integrity or performance of the Site or its underlying systems</li>
				</ul>
				<div class="callout callout-neutral">
					<strong>Kazakhstan cybersecurity law.</strong> Unauthorised access to the Site's
					information systems may constitute an offence under the Law of the Republic of
					Kazakhstan No. 418-V "On Informatization" (2015) and/or the Criminal Code of the
					Republic of Kazakhstan (Article 205 — unlawful access to computer information). The
					operator reserves the right to refer any such conduct to the relevant authorities.
				</div>
			</section>

			<!-- ── 22 ─────────────────────────────────────────────────────── -->
			<section id="s22">
				<h2>22. Changes to These Terms</h2>
				<p>We may update these Terms at any time. We will provide at least <strong>30 days' notice</strong> of material changes via a prominent notice on the Site and/or by email to registered users. Continued use after the effective date constitutes acceptance of the revised Terms. To stop using the Site and request account deletion, contact <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>.</p>
			</section>

			<!-- ── 23 ─────────────────────────────────────────────────────── -->
			<section id="s23">
				<h2>23. General Provisions</h2>
				<p><strong>Severability.</strong> If any provision of these Terms is found unenforceable, it shall be limited to the minimum extent necessary, and the remaining provisions shall remain in full force.</p>
				<p><strong>Entire agreement.</strong> These Terms, together with the Privacy Policy and Cookie Policy, constitute the entire agreement between you and VeryNice.kz regarding your use of the Site.</p>
				<p><strong>Waiver.</strong> Our failure to enforce any right or provision shall not constitute a waiver of that right or provision.</p>
				<p><strong>Assignment.</strong> You may not assign your rights or obligations under these Terms without our prior written consent. We may assign our rights to a successor entity, provided that the successor entity assumes all obligations under these Terms.</p>
				<p><strong>Limitation of actions.</strong> Under Articles 177–178 of the Civil Code of the Republic of Kazakhstan: the general limitation period for contractual and tortious claims is <strong>three (3) years</strong> from the date the claimant knew or ought to have known of the alleged violation (Article 177 KZ Civil Code). Claims related to the protection of honour, dignity, or business reputation carry a reduced limitation period of <strong>one (1) year</strong> (Article 178 KZ Civil Code). No claim of any kind arising from or related to use of the Site may be brought after the expiry of the applicable limitation period under Kazakhstan law or any other mandatory applicable jurisdiction. Claims brought outside the applicable limitation period are time-barred, regardless of the nature of the claim or the legal theory asserted.</p>
				<div class="callout callout-neutral">
					<strong>Law No. 18-VIII — Legal Representative threshold.</strong> Under Article 12 of
					the Law of the Republic of Kazakhstan No. 18-VIII, if the Site's average daily audience
					from Kazakhstan exceeds <strong>100,000 users</strong>, the operator is required to
					appoint and register a legal representative in Kazakhstan with the Ministry of Digital
					Development, Innovations and Aerospace Industry. The operator will comply with this
					requirement upon reaching that threshold and will update these Terms accordingly.
				</div>
			</section>

			<section id="s24">
				<h2>24. Contact</h2>
				<div class="contact-card">
					<div class="contact-logo" aria-hidden="true">VN</div>
					<div>
						<p class="contact-name">VeryNice.kz</p>
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
							Response within 20 calendar days (required by Law No. 18-VIII)
						</p>
					</div>
				</div>
			</section>

			<!-- ── 25. KAZAKH SUMMARY ─────────────────────────────────────── -->
			<section id="s25" class="kz-section">
				<div class="kz-flag-bar" aria-hidden="true">
					<span class="kz-stripe kz-blue"></span>
					<span class="kz-stripe kz-yellow"></span>
				</div>
				<h2>25. Шарттардың қысқаша мазмұны (Қазақша)</h2>
				<p class="kz-subtitle">
					<strong>Ресми, міндетті нұсқасы — Қазақша.</strong>
					ҚР № 7-I «ҚР тіл туралы» Заңы мен № 18-VIII Заңының 8-бабы бойынша осы Шарттардың
					ресми тілі — қазақша. Ағылшынша нұсқасы халықаралық пайдаланушылар үшін ыңғайлылық
					мақсатында ғана берілген — ол заңды күші бар нұсқа болып табылмайды.
					Толық нұсқасы төменде берілген.
				</p>
				<ul class="kz-list" lang="kk">
					<li><strong>Платформа:</strong> VeryNice.kz — Қазақстан бойынша ақпараттық саяхат нұсқаулығы. Сайт саяхат агенті, тур операторы немесе брондау делдалы болып табылмайды.</li>
					<li><strong>Операторды анықтау:</strong> Сайтты жеке тұлға басқарады. Оператор Қазақстан Республикасының заңнамасына сәйкес жеке кәсіпкер (ЖК) ретінде тіркелу үстінде.</li>
					<li><strong>Тіркелу жасы:</strong> Жалпы пайдаланушылар үшін ең төменгі жас — 13 жас. ЕЭА елдеріндегі пайдаланушылар үшін дербес деректерді өңдеуге келісім беру жасы — 16 жас (немесе қолданылатын ұлттық заңда белгіленген төмен жас).</li>
					<li><strong>Тіркелу:</strong> Пайдаланушылар Google немесе басқа OAuth провайдерлері арқылы тіркеле алады. Бизнес тіркелгілері БСН/ЖСН растауды талап етеді.</li>
					<li><strong>Мазмұн:</strong> Сайтта жасанды интеллект жасаған мазмұн бар. Бұл мазмұн тек ақпараттық мақсатта берілген және кәсіби кеңес болып табылмайды. Виза туралы ақпарат ресми дереккөздер арқылы тексерілуі тиіс.</li>
					<li><strong>Жарнама:</strong> Барлық жарнамалық және демеушілік мазмұн тиісті белгімен белгіленеді (№ 508-II және № 18-VIII Заңдарға сәйкес). Сайт серіктестік сілтемелерін пайдаланады.</li>
					<li><strong>Жеке деректер:</strong> Деректер ҚР «Дербес деректер және оларды қорғау туралы» Заңына (№ 94-V, 2024 жылғы өзгерістермен) сәйкес өңделеді. Қазақстандық пайдаланушылардың деректері аумақ ішінде сақталады. Келісімді кез келген уақытта кері қайтарып алуға болады.</li>
					<li><strong>Деректерді сақтау мерзімі:</strong> Жеке деректер тіркелгі жойылғаннан кейін ең көбі 3 жыл сақталады.</li>
					<li><strong>Шағымдар:</strong> Шағымдарға 20 күнтізбелік күн ішінде жауап беріледі (№ 18-VIII Заңның 9-бабы). Байланыс: <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a></li>
					<li><strong>Балама дауларды шешу:</strong> ЕО/ЕЭА пайдаланушылары ODR платформасына жүгіне алады: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a></li>
					<li><strong>Жауапкершілік:</strong> Сайт мазмұны «бар күйінде» ұсынылады. Жанама шығындар үшін жауапкершілік заңда рұқсат етілген шегінде шектеледі. ҚР «Тұтынушылардың құқықтарын қорғау туралы» Заңы (№ 274-IV) бойынша тұтынушылардың заңды құқықтары сақталады.</li>
					<li><strong>Дауларды шешу:</strong> Қазақстан Республикасының заңнамасы қолданылады; Алматы соттары юрисдикция органы болып табылады. ЕО/ЕЭА тұтынушылары өз еліндегі сотқа жүгіне алады.</li>
					<li><strong>Толық нұсқасы:</strong> Осы Шарттардың толық қазақша нұсқасы сұрау бойынша <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a> мекенжайы арқылы қолжетімді.</li>
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
							<h2 class="kz-doc-title">Пайдалану Шарттары</h2>
						</div>
						<div class="kz-doc-meta">
							<span>Соңғы жаңарту: 16 мамыр 2026 ж.</span>
							<span>Нұсқа 2.0</span>
						</div>
					</div>
					<p class="kz-doc-note">
						ҚР № 7-I «ҚР тіл туралы» Заңы мен «Онлайн-платформалар және онлайн-жарнама
						туралы» ҚР № 18-VIII Заңының 8-бабына сәйкес дайындалған ресми нұсқа.
						<strong>Осы қазақша нұсқасы осы Шарттардың ресми және міндетті мәтіні болып
						табылады.</strong> Қазақша нұсқасы ағылшынша нұсқасынан барлық жағдайда
						және шартсыз басым болады. Қазақстан Республикасының соттарында тек осы
						қазақша мәтін міндетті дәлел ретінде қабылданады.
					</p>
				</div>

				<!-- ══ Қазақша мазмұны ══ -->
				<div class="kz-toc">
					<p class="kz-toc-heading">Мазмұны (Қазақша)</p>
					<div class="kz-toc-grid">
						<a href="#kz-s1">1. Шарттарды қабылдау</a>
						<a href="#kz-s2">2. Пайдалану критерийлері</a>
						<a href="#kz-s3">3. Қызмет сипаттамасы</a>
						<a href="#kz-s4">4. Тіл және ресми нұсқасы</a>
						<a href="#kz-s5">5. Тіркелгіні тіркеу</a>
						<a href="#kz-s6">6. Бизнес тізімдер</a>
						<a href="#kz-s7">7. Пайдаланушы мазмұны</a>
						<a href="#kz-s8">8. Мазмұнды модерациялау</a>
						<a href="#kz-s9">9. ЖИ мазмұн</a>
						<a href="#kz-s10">10. Редакциялық бағыт</a>
						<a href="#kz-s11">11. Зияткерлік меншік</a>
						<a href="#kz-s12">12. Жарнама және серіктестік</a>
						<a href="#kz-s13">13. Cookie файлдары</a>
						<a href="#kz-s14">14. Жеке деректер</a>
						<a href="#kz-s15">15. Шағымдар мен даулар</a>
						<a href="#kz-s16">16. Үшінші тарап сілтемелері</a>
						<a href="#kz-s17">17. Жауапкершіліктен бас тарту</a>
						<a href="#kz-s18">18. Жауапкершілікті шектеу</a>
						<a href="#kz-s19">19. Өтемақы</a>
						<a href="#kz-s20">20. Форс-мажор</a>
						<a href="#kz-s21">21. Тыйым салынған іс-әрекеттер</a>
						<a href="#kz-s22">22. Шарттарды өзгерту</a>
						<a href="#kz-s23">23. Жалпы ережелер</a>
						<a href="#kz-s24">24. Байланыс</a>
					</div>
				</div>

				<!-- §1 -->
				<section id="kz-s1" class="kz-section-item">
					<h3>1. Шарттарды қабылдау</h3>
					<p><strong>VeryNice.kz</strong> сайтына (бұдан әрі — «Сайт» немесе «Платформа») кіру
					немесе пайдалану арқылы сіз осы Пайдалану шарттарымен («Шарттар»), Құпиялылық
					саясатымен және Cookie саясатымен келісесіз; аталған құжаттардың барлығы осы
					сілтеме арқылы Шарттардың ажырамас бөлігі болып табылады. Егер сіз келіспесеңіз,
					Сайтты пайдаланбауыңыз тиіс.</p>
					<p>Осы Шарттар сіз бен VeryNice.kz жеке операторы (бұдан әрі — «біз», «бізді» немесе
					«біздің») арасындағы заңды күші бар міндетті келісімді қалыптастырады.
					Байланыс: <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a></p>
					<div class="callout callout-neutral">
						<strong>Оператордың жеке басы және коммерциялық мәртебесі.</strong>
						Сайт қазіргі уақытта жеке тұлғамен басқарылады. Сайт жарнама және серіктестік
						комиссиялары арқылы кіріс табады, бұл Қазақстан Республикасының заңнамасы бойынша
						коммерциялық қызмет болып табылуы мүмкін. Оператор жеке кәсіпкер (ЖК) немесе
						баламалы заңды тұлға ретінде тіркелу үдерісінде; тіркеу аяқталғаннан кейін осы
						Шарттар жаңартылады. Заңды жеке басты анықтайтын толық деректер жазбаша сұрау
						бойынша <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>
						мекенжайы арқылы ұсынылады.
					</div>
				</section>

				<!-- §2 -->
				<section id="kz-s2" class="kz-section-item">
					<h3>2. Пайдалану критерийлері</h3>
					<dl class="term-list">
						<dt>2.1 Жалпы ең төменгі жас</dt>
						<dd>Сайтты пайдалану үшін сізге кемінде <strong>13 жас</strong> болуы тиіс.
						18 жасқа толмаған пайдаланушылар ата-анасының немесе заңды өкілінің рұқсаты
						бар екендігін растайды.</dd>

						<dt>2.2 ЕЭА және Ұлыбритания пайдаланушылары үшін ең төменгі жас</dt>
						<dd>ЕЭА немесе Ұлыбритания пайдаланушылары үшін дербес деректерді өңдеуге
						өздігінен келісім беру жасы ЖТҚР 8-бабы (Регламент (ЕО) 2016/679) бойынша
						<strong>16 жасты</strong> құрайды, егер сіздің мүше мемлекетіңіздің ұлттық
						заңнамасы төменгі жасты белгілемесе (ең аз — 13 жас). 13 жастан ел
						заңнамасында белгіленген келісім жасына дейінгі пайдаланушылардың тіркелгі
						ашуы немесе жеке деректер беруі үшін ата-ана немесе заңды өкіл жазбаша
						келісімінің болуы міндетті.</dd>

						<dt>2.3 Бизнес тіркелгілері</dt>
						<dd>Бизнес тіркелгісін тіркеген жағдайда, сіз өкілдік ететін заңды тұлғаны
						байланыстыруға толық заңды өкілеттігіңіз барлығын растайсыз.</dd>

						<dt>2.4 Қосымша құқықтар — ЕЭА және Ұлыбритания</dt>
						<dd>ЕЭА немесе Ұлыбританиядағы пайдаланушылар Құпиялылық саясатында және
						14-бөлімде сипатталған қосымша деректерді қорғау құқықтарына ие.</dd>
					</dl>
				</section>

				<!-- §3 -->
				<section id="kz-s3" class="kz-section-item">
					<h3>3. Қызмет сипаттамасы</h3>
					<p>VeryNice.kz — Қазақстанның туристік бағыттарын, мәдениетін, тағам мәдениетін,
					қонақ үйлерін, мейрамханаларын, тартымды орындарын және саяхат логистикасын
					қамтитын ақпараттық саяхат нұсқаулығы. Сайт мыналарды ұсынады:</p>
					<ul>
						<li>Редакциялық бағыт нұсқаулықтары мен саяхат мақалалары</li>
						<li>Қонақ үй, мейрамхана және туристік жеткізуші тізімдері</li>
						<li>Пайдаланушы пікірлері мен бағалауларының функционалдығы</li>
						<li>Туристік жеткізушілерді бизнес тізімге тіркеу</li>
					</ul>
					<p>Сайт жеке пайдаланушылар үшін тегін ұсынылады. Бизнес тізімге тіркелу
					қызметтері тіркелу кезінде мәлімделетін жеке коммерциялық шарттарға сәйкес
					жүзеге асырылуы мүмкін.</p>
					<div class="callout callout-warning">
						<strong>Маңызды — Платформаның мәртебесі: саяхат агенті немесе брондау делдалы
						емес.</strong> VeryNice.kz — <em>тек ақпараттық анықтамалық және мазмұн
						платформасы</em>. Ол саяхат агенті, тур оператор, брондау делдалы, саяхат
						менеджмент компаниясы немесе пакеттік саяхат ұйымдастырушысы болып табылмайды.
						Сайт сіз бен тізімдегі кез келген қонақ үй, мейрамхана, тур оператор,
						нұсқаушы немесе өзге жеткізуші арасында ешқандай шарттық қатынас орнатпайды.
						Сайт арқылы немесе Сайтта берілген сілтеме бойынша үшінші тараппен жасалған
						кез келген брондау, мәміле немесе келісім тек сіз бен сол үшінші тарап
						арасында жасалады.
					</div>
					<div class="callout callout-neutral">
						<strong>ҚР № 210-IV Заңы — «ҚР туристік қызмет туралы».</strong>
						VeryNice.kz ҚР 2001 жылғы 13 маусымдағы № 210-IV «Қазақстан Республикасындағы
						туристік қызмет туралы» Заңына (өзгерістерімен) сәйкес туроператор немесе
						туристік агент лицензиясын алмаған және алуға міндетті емес. Редакциялық
						саяхат мазмұнын жариялау және үшінші тараптардың бизнес тізімдерін орналастыру
						аталған Заң бойынша реттелетін туристік қызмет болып табылмайды. Пайдаланушылар
						барлық саяхат қызметтерін тікелей лицензияланған туроператорлар мен
						туристік агенттерден алуы тиіс.
					</div>
				</section>

				<!-- §4 -->
				<section id="kz-s4" class="kz-section-item">
					<h3>4. Тіл және ресми нұсқасы</h3>
					<div class="callout callout-warning">
						<strong>Ресми тіл — ҚАЗАҚША.</strong>
						ҚР № 7-I «Қазақстан Республикасындағы тіл туралы» Заңына (1997 жылғы
						11 қараша, өзгерістерімен) және ҚР № 18-VIII Заңының 8-бабына сәйкес осы
						Шарттардың және Сайттағы барлық заңды құжаттардың негізгі және
						<strong>ресми тілі — қазақша</strong>. № 7-I Заңы қазақ тілін
						Қазақстан Республикасының мемлекеттік тілі ретінде белгілейді және
						Қазақстанда жасалатын шарттар мен ресми құжаттардың мемлекеттік тілде
						жасалуын талап етеді (№ 7-I Заңының 8-бабы).
						<br><br>
						Қазақша нұсқа мен кез келген өзге тілдегі нұсқа арасындағы сәйкессіздік,
						түсініксіздік немесе қайшылық орын алған жағдайда,
						<strong>қазақша нұсқасы шартсыз және ерексіз басым болады</strong>.
						Қазақстан Республикасының Азаматтық іс жүргізу кодексінің 14-бабына сәйкес
						ҚР соттарындағы кез келген сот ісі жүргізуде тек осы қазақша нұсқасы
						міндетті мәтін ретінде қарастырылады.
					</div>
					<dl class="term-list">
						<dt>4.1 Орысша (Русский)</dt>
						<dd>Орыс тілі ҚР Конституциясының 7-бабы 2-тармағы мен № 7-I Заңының
						5-бабына сәйкес екінші ресми тіл ретінде ұсынылады. Кез келген дауда
						қазақша нұсқасы орысша нұсқадан басым болады.</dd>
						<dt>4.2 Ағылшынша (English)</dt>
						<dd>Ағылшынша нұсқа халықаралық пайдаланушылардың ыңғайы үшін ғана берілген
						аударма болып табылады. Қазақстан Республикасы соттарының юрисдикциясы
						шеңберіндегі кез келген дау, талап немесе сот ісі жүргізу мақсатында
						ағылшынша нұсқасы заңды күші бар құжат болып табылмайды және ол қазақша
						нұсқасына қайшы мәнде пайдаланыла алмайды.</dd>
						<dt>4.3 ЖИ аудармасы</dt>
						<dd>Сайт мазмұнының қазақшадан өзге тілдердегі нұсқалары жасанды интеллект
						аударма құралдарымен жасалады. Қазақша нұсқасы барлық жағдайда ресми
						болып табылады.</dd>
					</dl>
				</section>

				<!-- §5 -->
				<section id="kz-s5" class="kz-section-item">
					<h3>5. Тіркелгіні тіркеу және үшінші тарап аутентификациясы</h3>
					<dl class="term-list">
						<dt>5.1 Тіркелу тәсілі</dt>
						<dd>Тіркелгіні үшінші тараптың OAuth тіркелгі деректері арқылы (мысалы,
						Google, Apple немесе өзге қолдау көрсетілетін провайдерлер —
						«Үшінші тарап аутентификация провайдерлері») жасауға болады. Болашақта
						электрондық пошта/құпиясөз арқылы тікелей тіркелу де ұсынылуы мүмкін.</dd>

						<dt>5.2 Деректер алмасу</dt>
						<dd>Үшінші тарап провайдері арқылы аутентификация жасаған кезде, сол провайдер
						белгілі бір профиль ақпаратын (әдетте атыңыз бен электрондық пошта
						мекенжайыңыз) бізге береді. Аталған провайдерлерді пайдалану олардың жеке
						шарттары мен құпиялылық саясатымен реттеледі.</dd>

						<dt>5.3 Тіркелгі қауіпсіздігі</dt>
						<dd>Тіркелгі деректерінің құпиялылығын және тіркелгіде жүргізілетін барлық
						іс-әрекеттің жауапкершілігін сіз өзіңіз көтересіз. Рұқсатсыз кіру
						күдікті болса, дереу
						<a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>
						мекенжайына хабарлаңыз.</dd>

						<dt>5.4 Дәл ақпарат</dt>
						<dd>Тіркелу кезінде дәл, өзекті және толық ақпарат беруге және профильді
						жаңартып отыруға міндеттенесіз.</dd>

						<dt>5.5 Бір тіркелгі ережесі</dt>
						<dd>Модерация шешімдерін немесе осы Шарттарды айналып өту мақсатында
						бірнеше тіркелгі жасауға тыйым салынады.</dd>

						<dt>5.6 Тіркелгіні тоқтата тұру және тоқтату</dt>
						<dd>Осы Шарттарды бұзатын тіркелгілер 15-бөлімдегі шағым тетігіне сәйкес
						тоқтатыла тұруы немесе тоқтатылуы мүмкін.</dd>
					</dl>
				</section>

				<!-- §6 -->
				<section id="kz-s6" class="kz-section-item">
					<h3>6. Бизнес тізімдер және жеткізуші тіркелгілері</h3>
					<dl class="term-list">
						<dt>6.1 Тіркелу құқығы бар субъектілер</dt>
						<dd>Қонақ үйлер, мейрамханалар, тур операторлар және өзге туристік
						бағыттағы бизнес субъектілер Сайттағы тізімдерін басқару үшін Бизнес
						тіркелгісін тіркей алады.</dd>

						<dt>6.2 Тексеру — Қазақстандық бизнес субъектілер</dt>
						<dd>Қазақстанда тіркелген бизнес субъектілерден Мемлекеттік кіріс комитеті
						немесе <a href="https://egov.kz" target="_blank" rel="noopener noreferrer">egov.kz</a>
						арқылы берілген 12 таңбалы Бизнесті сәйкестендіру нөмірі (БСН) немесе жеке
						кәсіпкерлер үшін Жеке сәйкестендіру нөмірі (ЖСН) және заңды мәртебені
						растайтын өзге құжаттар талап етілуі мүмкін.</dd>

						<dt>6.3 Тексеру — шетелдік бизнес субъектілер</dt>
						<dd>Қазақстандан тыс тіркелген бизнес субъектілер тіршілік ету еліндегі
						баламалы тіркеу құжаттарын — компания тіркеу нөмірін, ҚҚС/салық тіркеу
						куәлігін немесе баламалы үкіметтік сәйкестендіру құжаттарын ұсына алады.</dd>

						<dt>6.4 Дәлдік және жауапкершілік</dt>
						<dd>Бизнес тіркелгі иелері ұсынылған барлық тізім ақпаратының — сипаттамалар,
						баға, байланыс деректері, суреттер, лицензия/рұқсат мәртебесі және
						қолжетімділік — дәлдігі, толықтығы, заңдылығы мен өзектілігі үшін жалғыз
						жауап береді. VeryNice.kz тізімдердің дәлдігін тексермейді немесе
						кепілдік бермейді.</dd>

						<dt>6.5 Тыйым салынған тізімдер</dt>
						<dd>Мыналарға рұқсат берілмейді: заңсыз қызметтер; алаяқтық немесе
						жаңылыстыратын тізімдер; Қазақстан заңнамасы бойынша талап етілетін
						лицензиялар немесе рұқсаттарсыз жұмыс істейтін субъектілер; үшінші
						тараптардың зияткерлік меншік құқықтарын бұзатын тізімдер.</dd>

						<dt>6.6 Аккредиттеу немесе мақұлдаудың жоқтығы</dt>
						<dd>VeryNice.kz-та тізімге енгізілу кез келген аккредиттеу, сапа
						сертификаттауы, қауіпсіздікті тексеру немесе мақұлдауды білдірмейді.
						Пайдаланушылар кез келген тізімде берілген жеткізушімен іскерлік
						байланысқа шатпас бұрын тиісті тексеру жүргізуі тиіс.</dd>

						<dt>6.7 Тізімнен шығару</dt>
						<dd>Алаяқтық, заңсыз іс-әрекет, қауіпсіздік мәселелері, тұтынушыларға зиян
						немесе осы Шарттарды бұзу туралы сенімді хабарламалар алынған жағдайда
						кез келген Бизнес тіркелгісін тізімнен шығаруға немесе жоюға
						құқықты сақтаймыз.</dd>

						<dt>6.8 Бизнес субъектілер туралы пайдаланушы пікірлері</dt>
						<dd>Жеке пайдаланушылар ұсынған пікірлер — тәуелсіз пікірлер болып
						табылады және VeryNice.kz редакциялық ұстанымын білдірмейді.</dd>
					</dl>
				</section>

				<!-- §7 -->
				<section id="kz-s7" class="kz-section-item">
					<h3>7. Пайдаланушы жасаған мазмұн</h3>
					<dl class="term-list">
						<dt>7.1 Лицензия беру</dt>
						<dd>Пікірлер, бағалаулар, рейтингтер, суреттер немесе өзге мазмұн
						(«Пайдаланушы мазмұны») жіберу арқылы сіз VeryNice.kz-ға Сайтты
						пайдалану, жылжыту және жетілдіру мақсатында аталған мазмұнды
						пайдалануға, көбейтуге, таратуға, көрсетуге және бейімдеуге дүниежүзілік,
						айрықша емес, роялтисіз, сублицензияланатын және беруге болатын
						лицензия бересіз.</dd>

						<dt>7.2 Кепілдіктер</dt>
						<dd>Пайдаланушы мазмұнын жіберу арқылы сіз мыналарды растайсыз және
						кепіл бересіз: (а) мазмұнды жіберуге қажетті барлық құқыққа ие
						екеніңізді; (б) мазмұн үшінші тараптардың зияткерлік меншік, жекелік
						немесе жеке бейне құқықтарын бұзбайтындығын; (в) мазмұн шындыққа сай
						және жаңылыстырмайтындығын.</dd>

						<dt>7.3 Тыйым салынған мазмұн</dt>
						<dd>
							<p>Мыналарды қамтитын мазмұнды жіберуге болмайды:</p>
							<ul>
								<li>жалған, алдаушы немесе жаңылыстыратын мазмұн</li>
								<li>нәсіл, этнос, дін, жыныс, жыныстық бағдар, мүгедектік немесе
								ұлтына негізделген өшпенділік сөзі немесе кемсіту</li>
								<li>қудалау, қорқыту немесе зорлық-зомбылық</li>
								<li>жыныстық сипаттағы немесе кәмелетке толмағандарға зиянды мазмұн</li>
								<li>заңсыз іс-әрекеттерді насихаттайтын немесе жеңілдететін мазмұн</li>
								<li>үшінші тараптардың зияткерлік меншік құқықтарын бұзатын мазмұн</li>
								<li>спам, жаппай жіберу немесе рұқсатсыз коммерциялық хабарлар</li>
								<li>келісімсіз үшінші тараптардың жеке деректерін ашатын мазмұн</li>
								<li>зиянды бағдарламалық қамтылым, вирустар немесе өзге зиянды код</li>
							</ul>
						</dd>

						<dt>7.4 Пікірлер</dt>
						<dd>Пікірлер шынайы жеке тәжірибені бейнелеуі тиіс. Жалған пікірлер,
						жұмыс берушінің тізімі туралы оның қызметкерлері жазған пікірлер және
						нақты ашылмаған ынталандыруы бар пікірлерге тыйым салынады.</dd>
					</dl>
				</section>

				<!-- §8 -->
				<section id="kz-s8" class="kz-section-item">
					<h3>8. Мазмұнды модерациялау</h3>
					<p>Барлық Пайдаланушы мазмұны — жарияланғанға дейін немесе кейін — ЖИ
					мен адам бірлесіп модерациялауға жатады. Кез келген Пайдаланушы мазмұнын
					алдын ала ескертусіз жоюға, өңдеуге немесе жариялаудан бас тартуға
					құқықты сақтаймыз.</p>
					<div class="callout callout-info">
						<strong>Платформаның иммунитеті — № 18-VIII Заңының 11-бабы.</strong>
						ҚР 2023 жылғы № 18-VIII «Онлайн-платформалар және онлайн-жарнама туралы»
						Заңының 11-бабына сәйкес, Платформа мазмұнды бастамаған, алушыны таңдамаған
						немесе мазмұнды өзгертпеген жағдайда үшінші тараптардың мазмұны —
						пайдаланушы пікірлері, түсініктемелер мен бизнес тізімдері — үшін
						жауапкершілік көтермейді. Бұл заңды иммунитет жоғарыдағы модерациялау
						қызметімен жойылмайды. Жарамды, дәлелденген алып тастау туралы хабарлама
						алынған соң мазмұнды тез арада жоямыз немесе оған қолжетімділікті
						шектейміз.
					</div>
					<div class="callout callout-info">
						<strong>Хабарлау.</strong> Пайдаланушы мазмұны осы Шарттарды немесе
						қолданылатын заңнаманы бұзады деп санасаңыз,
						<a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>
						мекенжайына хабарлаңыз. ҚР № 18-VIII Заңының 9-бабына сәйкес алынған
						күннен бастап <strong>20 күнтізбелік күн</strong> ішінде дәлелді жауап
						береміз.
					</div>
					<p><strong>Шағым жасау.</strong> Мазмұныңыз жойылса,
					<a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>
					мекенжайы арқылы шағым жасай аласыз. Шағымдарды мүмкіндік шегінде
					қарастырамыз.</p>
				</section>

				<!-- §9 -->
				<section id="kz-s9" class="kz-section-item">
					<h3>9. Жасанды интеллект жасаған және ЖИ-қолдаулы мазмұн</h3>
					<p>Сайттағы кейбір редакциялық мазмұн жасанды интеллект құралдарымен
					жасалған немесе оның қомақты көмегімен дайындалған. ЖИ жасаған мазмұн
					дәлсіздіктер, ескірген ақпарат немесе мәдени жаңсақ берілімдер қамтуы
					мүмкін. Ол тек ақпараттық мақсатта ұсынылады және <strong>кез келген
					кәсіби кеңес болып табылмайды</strong> — соның ішінде заңдық, медициналық,
					қаржылық, виза немесе қауіпсіздік кеңесі ретінде қарастырылмауы тиіс.</p>
					<p>Мазмұн негізінен ЖИ жасаған болса, оны тиісті белгімен белгілеуге
					тырысамыз. Белгінің болмауы мазмұнның толықтай адам авторлығымен
					жазылғанына кепілдік бермейді.</p>
					<div class="callout callout-neutral">
						<strong>ЕО ЖИ Заңы — болашаққа арналған сәйкестік.</strong>
						2024 жылдың тамызында күшіне енген ЕО Жасанды интеллект Заңы
						(Регламент (ЕО) 2024/1689) 2025–2027 жылдар аралығында кезең-кезеңмен
						қолданылады. Аталған Регламенттің 50-бабы ЖИ жасаған мазмұнды машина
						оқи алатын форматта таңбалауды талап етеді. ЕО пайдаланушыларына
						қатысты міндеттер күшіне ене салысымен осы талапты орындауды жоспарлаймыз.
					</div>
				</section>

				<!-- §10 -->
				<section id="kz-s10" class="kz-section-item">
					<h3>10. Редакциялық бағыт, бұқаралық мәдениет сілтемелері және сатира</h3>
					<p>VeryNice.kz халықаралық бұқаралық мәдениетке және Қазақстанның белгілі
					медиа бейнелеулеріне — соның ішінде <em>Бoрат</em> фильм франшизасына —
					пайдаланушылардың қызығушылығын арттыру және мәдени мәнмәтін беру
					мақсатында сілтеме жасауы мүмкін.</p>
					<div class="callout callout-neutral">
						<strong>Маңызды.</strong> Мұндай сілтемелер тек ойын-сауық пен
						қатысуды арттыру мақсатында ғана жасалады. Олар VeryNice.kz
						редакциялық ұстанымын білдірмейді. Сайттың негізгі миссиясы —
						Қазақстанның шынайы тарихын, мәдениетін, халқын, тағам мәдениеті
						мен табиғи сұлулығын дәл және сыйластықпен таныстыру. Қазақстан
						азаматтарының халықаралық медиадағы кейбір бейнелерге деген
						сезімталдығын мойындаймыз және құрметтейміз.
					</div>
					<p>Кез келген мазмұнды дөрекі немесе қорлаушы деп санасаңыз,
					<a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>
					мекенжайына хабарлаңыз.</p>
				</section>

				<!-- §11 -->
				<section id="kz-s11" class="kz-section-item">
					<h3>11. Зияткерлік меншік</h3>
					<p>Сайттағы барлық редакциялық мазмұн, дизайн элементтері, логотиптер,
					тауар белгілері және бастапқы код ҚР «Авторлық құқық және сабақтас
					құқықтар туралы» № 6-II Заңымен (өзгерістерімен) және халықаралық
					авторлық құқық шарттарымен қорғалатын VeryNice.kz немесе оның лицензия
					берушілерінің меншігі болып табылады.</p>
					<p>Алдын ала жазбаша рұқсатсыз Сайт мазмұнын көбейтуге, таратуға,
					жарыққа шығаруға немесе туынды жұмыстар жасауға болмайды, заңмен
					тікелей рұқсат етілген жағдайларды (мысалы, пікір немесе білім беру
					мақсатында әділ пайдалану) қоспағанда.</p>
					<p><strong>Авторлық құқықты бұзу туралы хабарлаулар.</strong>
					Зияткерлік меншік құқықтарыңыздың бұзылды деп санасаңыз,
					<a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>
					мекенжайына бұзушылық материалды, байланыс деректерін және
					құқықтарыңыздың мәлімдемесін қамтитын хабарлама жіберіңіз.</p>
				</section>

				<!-- §12 -->
				<section id="kz-s12" class="kz-section-item">
					<h3>12. Жарнама, демеушілік мазмұн және серіктестік сілтемелер</h3>
					<dl class="term-list">
						<dt>12.1 Жарнама</dt>
						<dd>Сайтта үшінші тарап жарнамалары орналастырылады. Жарнамалар
						жарнамаланатын өнімдер немесе қызметтер ұсынымы болып табылмайды.</dd>

						<dt>12.2 Таңбалау (Қазақстан заңнамасы)</dt>
						<dd>Барлық ақылы жарнама мен демеушілік мазмұн ҚР № 508-II «Жарнама
						туралы» Заңына (өзгерістерімен) және № 18-VIII Заңға сәйкес
						«Демеушілік», «Жарнама», «Жарн.» немесе баламалы белгімен
						белгіленеді.</dd>

						<dt>12.3 Серіктестік сілтемелер</dt>
						<dd>Сайтта брондау платформаларына, тур операторларға және саяхат
						қызметтеріне серіктестік сілтемелер бар. Серіктестік сілтемені
						басып сатып алу жасасаңыз, сізге қосымша шығын туғызбастан
						комиссия алуымыз мүмкін. Серіктестік сілтемелер мүмкіндік
						болғанша белгіленеді.</dd>

						<dt>12.4 Редакциялық тәуелсіздік</dt>
						<dd>Коммерциялық қатынастар редакциялық мазмұнымызға немесе
						рейтингтерімізге әсер етпейді.</dd>

						<dt>12.5 Бағалар мен қолжетімділік</dt>
						<dd>Үшінші тарап сілтемелері арқылы көрсетілген бағалар мен
						қолжетімділік сол үшінші тараптардың бақылауында болады. Кез
						келген брондау немесе сатып алу жасамас бұрын тиісті платформада
						ағымдағы шарттарды тікелей тексеріңіз.</dd>
					</dl>
				</section>

				<!-- §13 -->
				<section id="kz-s13" class="kz-section-item">
					<h3>13. Cookie файлдары және бақылау технологиялары</h3>
					<p>Сайт негізгі функционалдылық, аналитика (Google Analytics / GA4) және
					жарнаманы дербестендіру үшін cookie файлдары мен осыған ұқсас бақылау
					технологияларын пайдаланады. Алғашқы кіруде барлық cookie файлдарын
					қабылдауға, параметрлерді реттеуге немесе маңызды емес cookie
					файлдарынан бас тартуға мүмкіндік беретін cookie келісім баннері
					ұсынылады. Маңызды cookie файлдарын өшіруге болмайды, өйткені олар
					Сайттың жұмысы үшін қажет. Маңызды емес cookie файлдарын (аналитика,
					жарнама) cookie параметрлер орталығы арқылы кез келген уақытта кері
					қайтарып алуға болады.</p>
					<p>Үшінші тарап жарнама серіктестері дербесті жарнама көрсету үшін
					cookie файлдарын пайдалануы мүмкін. YourAdChoices немесе NAI
					секілді салалық бас тарту құралдары арқылы дербестелген жарнамадан
					бас тартуға болады. Толық ақпарат — Cookie саясатында.</p>
				</section>

				<!-- §14 -->
				<section id="kz-s14" class="kz-section-item">
					<h3>14. Жеке деректер және құпиялылық</h3>
					<p>Жеке деректер ҚР № 94-V «Дербес деректер және оларды қорғау туралы»
					Заңына (2024 жылдың шілдедегі өзгерістерімен) және қолданылатын жағдайда
					ЕО ЖТҚР (Регламент (ЕО) 2016/679) мен өзге қолданылатын деректерді
					қорғау заңнамасына сәйкес жиналады және өңделеді.</p>
					<dl class="term-list">
						<dt>14.1 Келісім тетігі (ҚР № 94-V Заңы)</dt>
						<dd>Қазақстан заңнамасы бойынша жеке деректерді өңдеу келісімге
						негізделген жағдайда, келісім тіркелгіні тіркеу кезінде (флажок
						белгілеу), cookie келісім баннері немесе жинау кезіндегі өзге
						айқын қосылу тетігі арқылы алынады.</dd>

						<dt>14.2 Өңдеудің заңды негіздері (ЖТҚР — ЕЭА/Ұлыбритания пайдаланушылары)</dt>
						<dd>ЕЭА немесе Ұлыбритания пайдаланушылары үшін жеке деректер
						қолданылатын жағдайда мынадай заңды негіздер бойынша өңделеді:
						(а) <strong>шартты орындау</strong> — тіркелгіні басқару және
						қызметті ұсыну; (б) <strong>заңды мүдде</strong> — Сайт
						қауіпсіздігі, алаяқтықтың алдын алу және аналитика;
						(в) <strong>келісім</strong> — маркетингтік хабарламалар және
						маңызды емес cookie файлдары; (г) <strong>заңды міндет</strong>
						— салықтық есептер, реттеуші есептілік және бұзылу туралы
						хабарлама. Өңдеу қызметі бойынша толық мәліметтер
						<a href="/privacy">Құпиялылық саясатында</a> берілген.</dd>

						<dt>14.3 Деректерді жергіліктендіру (Қазақстан)</dt>
						<dd>№ 94-V Заңы бойынша «шектеулі жеке деректер» санатына жататын
						Қазақстан пайдаланушыларының жеке деректері Қазақстан Республикасы
						аумағындағы серверлерде сақталады.</dd>

						<dt>14.4 Келісімді кері қайтарып алу құқығы</dt>
						<dd>Өңдеу келісімге негізделген жерде, кері қайтарып алуға дейін
						жүзеге асырылған өңдеудің заңдылығына нұқсан келтірместен, кез
						келген уақытта келісімнен бас тартуға болады. Бас тарту тәсілі:
						(а) Сайттағы cookie параметрлер орталығын пайдалану; немесе
						(б) <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>
						мекенжайына бас тартылатын келісімді нақтылай отырып хат жіберу.</dd>

						<dt>14.5 Деректерді сақтау мерзімі</dt>
						<dd>Жеке деректер тіркелгіңіз белсенді болған кезде және тіркелгіні
						жойғаннан немесе Сайтпен соңғы байланысқаннан кейін <strong>ең
						көбі 3 жыл</strong> сақталады, қолданылатын заңнама ұзағырақ
						мерзімді талап ететін жағдайларды (мысалы, Қазақстан салық
						заңнамасы бойынша бухгалтерлік жазбалар — 5 жылға дейін)
						қоспағанда.</dd>

						<dt>14.6 Деректер субъектісінің құқықтары</dt>
						<dd>Қолданылатын заңнамаға сәйкес сізде мыналарға құқық болуы мүмкін:
						жеке деректерге қол жеткізу; дәлсіз деректерді түзету; деректерді
						жою («ұмытылу құқығы»); өңдеуді шектеу; деректерді тасымалдау;
						өңдеуге қарсы болу. Осы құқықтарды жүзеге асыру үшін
						<a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>
						мекенжайына хабарласыңыз. ЖТҚР бойынша 30 күн ішінде, ҚР
						заңнамасы бойынша белгіленген мерзімде жауап береміз.</dd>

						<dt>14.7 Бұзылу туралы хабарлама</dt>
						<dd>Жеке деректер қауіпсіздігінің бұзылуы орын алған жағдайда
						Қазақстан Республикасы Цифрлық даму, инновациялар және ғарыш
						өнеркәсібі министрлігіне заңда белгіленген мерзімде (2024 жылдың
						1 шілдесінен бастап қолданылатын) хабарлаймыз; ЖТҚР 34-бабы
						талап еткен жағдайда зардап шеккен тұлғаларға да хабарлаймыз.</dd>

						<dt>14.8 Балалар</dt>
						<dd>13 жасқа толмаған балалардан біле тұрып жеке деректер
						жинамаймыз. Бұған қайшы жағдай орын алды деп санасаңыз, дереу
						<a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>
						мекенжайына хабарласыңыз.</dd>
					</dl>
					<p>Деректер жинау, мақсаттар және құқықтарыңыз туралы толық ақпарат —
					<a href="/privacy">Құпиялылық саясатында</a>.</p>
				</section>

				<!-- §15 -->
				<section id="kz-s15" class="kz-section-item">
					<h3>15. Шағымдар және дауларды шешу</h3>
					<dl class="term-list">
						<dt>15.1 Алдымен бейресми шешу</dt>
						<dd>Алдымен
						<a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>
						мекенжайы арқылы бізбен байланысуды ұсынамыз. № 18-VIII Заңының
						9-бабына сәйкес <strong>20 күнтізбелік күн</strong> ішінде мазмұнды
						жауап береміз.</dd>

						<dt>15.2 Қолданылатын заң</dt>
						<dd>Осы Шарттарға Қазақстан Республикасының заңнамасы қолданылады.</dd>

						<dt>15.3 Юрисдикция — құзыретті соттар</dt>
						<dd>
							15.4 және 15.5-тармақтарға сәйкес, даулар Алматы қаласының
							мынадай құзыретті соттарына беріледі:
							<br><br>
							<strong>Тұтынушылық және жеке талаптар:</strong> ҚР Азаматтық іс
							жүргізу кодексіне сәйкес Алматы қалалық соты немесе Алматының
							тиісті аудандық соты.
							<br>
							<strong>Коммерциялық және заңды тұлғалар арасындағы даулар:</strong>
							ҚР АІЖ кодексінің 27-бабына сәйкес Алматы мамандандырылған
							ауданаралық экономикалық соты.
						</dd>

						<dt>15.4 ЕО және ЕЭА тұтынушылары — юрисдикция бойынша ерекше
						шарт</dt>
						<dd>15.3-тармаққа қарамастан, ЕО немесе ЕЭА-да тұрақты тұратын
						тұтынушылар ЕО № 1215/2012 Регламенті (Брюссель I Нұсқасы) және
						қолданылатын тұтынушыларды қорғау заңнамасы бойынша тұрақты
						тұратын еліндегі соттарда талап қоюға құқылы. Мұндай тұтынушылар
						тек Қазақстан соттарында ғана іс жүргізуге міндетті
						болмайды.</dd>

						<dt>15.5 Ұлыбритания тұтынушылары</dt>
						<dd>Ұлыбританияда тұрақты тұратын тұтынушылар қолданылатын
						Ұлыбритания тұтынушыларын қорғау заңнамасына сәйкес Ұлыбритания
						соттарында талап қоюға құқылы.</dd>

						<dt>15.6 Балама дауларды шешу (БДШ) — ЕО/ЕЭА</dt>
						<dd>ЕО Директиві 2013/11/ЕО мен № 524/2013 Регламентіне (онлайн
						дауларды шешу) сәйкес ЕО тұтынушылары Еуропалық Комиссияның онлайн
						дауларды шешу платформасына жүгіне алады:
						<a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>.
						Қазіргі уақытта белгілі бір аккредитацияланған БДШ органымен
						тіркелмесек те, ODR платформасы арқылы басталған кез келген БДШ
						үдерісіне адал ниетпен қатысамыз.</dd>

						<dt>15.7 Қазақстандық медиация</dt>
						<dd>Қазақстандық даулар үшін «Медиация туралы» ҚР Заңына
						(№ 401-IV) сәйкес сот талқылауына дейін Қазақстан медиаторлар
						палатасы немесе өзге аккредитацияланған медиация орталықтары
						арқылы медиацияға жүгінуге болады.</dd>

						<dt>15.8 Деректерді қорғау жөніндегі шағымдар</dt>
						<dd>ЕЭА немесе Ұлыбританияда болсаңыз, өзге дауларды шешу
						үдерісіне қарамастан, кез келген уақытта жергілікті деректерді
						қорғау бақылаушы органына шағым жасауға құқығыңыз бар.</dd>

						<dt>15.9 Тұтынушылардың құқықтары</dt>
						<dd>Осы Шарттардың ешқандай ережесі тұтынушыны қолданылатын
						міндетті заңнама бойынша заңдық тұтынушылық құқықтарынан
						айырмайды.</dd>
					</dl>
				</section>

				<!-- §16 -->
				<section id="kz-s16" class="kz-section-item">
					<h3>16. Үшінші тараптардың сілтемелері мен қызметтері</h3>
					<p>Сайт үшінші тарап веб-сайттары мен қызметтеріне сілтемелер береді.
					Олардың мазмұны, дәлдігі, құпиялылық тәжірибесі немесе қолжетімділігі
					үшін жауап бермейміз. Сілтеменің болуы ұсыным болып табылмайды.
					Үшінші тарап аутентификация провайдерлері (мысалы, Google) жеке шарттары
					мен құпиялылық саясаты бойынша жұмыс істейді.</p>
				</section>

				<!-- §17 -->
				<section id="kz-s17" class="kz-section-item">
					<h3>17. Жауапкершіліктен бас тарту және ақпарат дәлдігі</h3>
					<p>Сайт пен оның мазмұны кез келген тіпті болмашы кепілдіктерсіз, соның
					ішінде сатымдылық, белгілі бір мақсатқа сәйкестік немесе дәлдік
					кепілдіктерінсіз «бар күйінде» және «қолжетімді болған кезде» ұсынылады.
					Сайтта ешнәрсе заңдық, медициналық, қаржылық, қауіпсіздік немесе
					виза кеңесі болып табылмайды.</p>
					<dl class="term-list">
						<dt>17.1 Виза, иммиграция және кіру талаптары</dt>
						<dd>
							Қазақстан мен өзге елдерге кіру үшін қажетті виза талаптары, шекара
							бекеттерінен өту ережелері, рұқсат талаптары мен иммиграция
							ережелері жиі және кенеттен өзгеруі мүмкін; олар азаматтыққа,
							саяхат тарихына, паспорт түріне және геосаяси жағдайға байланысты
							ерекшеленуі мүмкін. Сайттағы виза мен кіруге қатысты ақпарат тек
							<strong>жалпы бағдарлама үшін ғана</strong> ұсынылады және ресми
							кеңестің орнын баса алмайды.
							<br><br>
							Кез келген халықаралық сапардан бұрын мыналар арқылы барлық виза,
							кіру және рұқсат талаптарын өз бетіңізше тексеріңіз: тағайындалған
							еліңіздің ресми елшілігі немесе консулдығы; ҚР Сыртқы істер
							министрлігі
							(<a href="https://www.gov.kz/memleket/entities/mfa" target="_blank" rel="noopener noreferrer">mfa.gov.kz</a>);
							немесе лицензиясы бар иммиграция кеңесшісі.
							<br><br>
							<strong>Оператор осы Сайтта жарияланған виза немесе иммиграция
							ақпаратына сенуден туындаған кіруден бас тарту, депортация,
							ұстап алу, қаржылық шығын немесе кез келген өзге зардап
							үшін ешқандай жауапкершілік қабылдамайды.</strong>
						</dd>

						<dt>17.2 Жеке қауіпсіздік және дене тәні қауіптері</dt>
						<dd>
							Қазақстанда қысы −40°С-ден жазы +45°С-ге дейін жететін экстремалды
							климат жағдайлары бар аймақтар, биік таулы жер бедерлері, алыс
							далалық аймақтар және жедел медициналық немесе авариялық қызметке
							қол жеткізу шектеулі орындар бар. Сайт шытырман саяхат туризмі,
							тау шаңғысы, тауда серуендеу, дала сапарлары және қысқы спорт
							туралы мазмұн ұсынуы мүмкін. Мұндай іс-шаралар ауыр дене жарақаты,
							ауру және өлім қаупін туғызады.
							<br><br>
							Сайт тізімдегі ешбір бағыттың, іс-шараның, маршруттың немесе
							жеткізушінің қауіпсіздік стандарттарын бағаламайды, тексермейді,
							сертификаттамайды немесе кепілдік бермейді. Іс-шаралардың дене
							тәніне туғызатын қауіпті бағалау және тиісті сақтық шараларын
							қолдану — жалғыз сіздің жауапкершілігіңіз.
							<strong>Оператор Сайтта ұсынылған іс-шараларды орындаудан
							туындаған дене жарақаты, ауру немесе өлім үшін ешқандай
							жауапкершілік қабылдамайды.</strong>
						</dd>

						<dt>17.3 Тур операторлар мен жеткізушілер — агенттіктің жоқтығы</dt>
						<dd>3-бөлімде айтылғандай, VeryNice.kz ақпараттық анықтамалық болып
						табылады және саяхат агенті, тур оператор немесе брондау делдалы
						болып табылмайды. Тізімдегі жеткізушімен байланысқаннан туындаған
						кез келген талап, дау, жарақат, қаржылық шығын немесе өзге зиян
						тек сіз бен сол жеткізуші арасындағы мәселе болып табылады.
						VeryNice.kz жеткізушімен мәміле жасауда сізбен ешқандай шарттық
						қатынаста болмайды.</dd>

						<dt>17.4 Саяхат сақтандыруы</dt>
						<dd>
							<strong>Оператор Қазақстанға және Орталық Азия аймағына баратын
							барлық саяхатшыларға жолға шыққанға дейін жан-жақты саяхат
							сақтандыруын ресімдеуді қатты ұсынады</strong>, соның ішінде
							мыналарды жабатын: шұғыл медициналық жәрдем және эвакуация;
							жолаушылықты болдырмау және қысқарту; жеке материалдық жауапкершілік;
							жоғалған немесе ұрланған мүлік; қолданыстағы болса, шытырман
							немесе экстремалды спорт іс-шаралары. Тиісті саяхат сақтандыруын
							алмау — тек сіздің жауапкершілігіңіз.
						</dd>

						<dt>17.5 Денсаулық, медициналық және тағамдық тәуекелдер</dt>
						<dd>
							Қазақстанның кейбір аймақтарында биіктік ауруы (Алматы мен
							2000 м-ден жоғары таулы аймақтарда), тамақ арқылы берілетін
							аурулар мен су арқылы таралатын қоздырғыштар тәуекелі болуы
							мүмкін. Алыс аймақтарда мамандандырылған медициналық жәрдемге
							қол жеткізу шектеулі болуы мүмкін. Алдын ала бар аурулары
							барлар жолға шыққанға дейін дәрігермен немесе саяхат медицинасы
							маманымен кеңессін.
							<br><br>
							Сайттағы тамақ пен сусын мазмұны тек қызықтыру мақсатында
							ұсынылады; жеке тамақтану шектеулерін, тамаққа аллергиясын,
							төзімсіздікті немесе медициналық жағдайларды ескермейді.
							<strong>Оператор Сайтта тізімделген немесе сипатталған
							мекемедегі тамақ пен сусынды тұтынудан туындаған ауру,
							аллергиялық реакция немесе медициналық оқиға үшін ешқандай
							жауапкершілік қабылдамайды.</strong>
						</dd>

						<dt>17.6 Валюта, баға және қаржылық ақпарат</dt>
						<dd>Сайтта немесе серіктестік үшінші тарап платформаларында
						көрсетілген бағалар бағдарлық болып табылады және ҚЖТ, АҚШ
						долларымен, еуромен немесе өзге валютамен белгіленуі мүмкін.
						Айырбас бағамдары өзгеріп тұрады; сіздің ана валютаңыздағы нақты
						шығындар көрсетілгеннен едәуір ерекшеленуі мүмкін. Оператор
						баға сәйкессіздіктері, айырбас бағамы шығындары немесе банкіңіз
						алатын комиссиялар үшін жауапкершілік қабылдамайды.</dd>

						<dt>17.7 Жалпы дәлдік</dt>
						<dd>Жұмыс уақыты, бағалар, байланыс деректері, маусымдық
						қолжетімділік және өзге операциялық ақпарат жиі өзгеруі мүмкін.
						Дәлдікке ұмтылсақ та, барлық ақпараттың өзекті екенін кепілдіктей
						алмаймыз. Баруды жоспарлаудан бұрын маңызды операциялық деректерді
						тікелей тиісті мекемемен тексеріңіз.</dd>
					</dl>
				</section>

				<!-- §18 -->
				<section id="kz-s18" class="kz-section-item">
					<h3>18. Жауапкершілікті шектеу</h3>
					<div class="callout callout-warning">
						Қолданылатын заңнамада рұқсат етілген ең жоғарғы шегінде VeryNice.kz
						және оның операторы мыналар үшін жауапты болмайды: (а) кез келген
						жанама, кездейсоқ, ерекше, салдарлы немесе жазалаушы шығындар;
						(б) пайда, кіріс, деректер немесе іскерлік мүмкіндіктерді жоғалту;
						(в) Сайтты пайдаланудан немесе оның мазмұнына сенуден туындаған
						дене жарақаты немесе мүлікке зиян; (г) саяхат ақпаратындағы,
						ЖИ жасаған мазмұндағы немесе аударылған мазмұндағы қателіктер
						немесе дәлсіздіктер.
					</div>
					<p>Осы Шарттардың ешқандай ережесі мыналар үшін жауапкершілікті
					шектемейді: немқұрайлылықтан туындаған өлім немесе дене жарақаты;
					алдау немесе алдаушы жаңсақтық; қолданылатын міндетті заңнама
					бойынша алынып тасталуы немесе шектелуі мүмкін емес жауапкершілік.</p>
					<p><strong>ЕО және Ұлыбритания тұтынушылары.</strong> Осы бөлімнің
					ешқандай ережесі Директива 93/13/ЕО (әділетсіз шарттар), Тұтынушы
					құқықтары Директивасы (2011/83/ЕО), Ұлыбритания 2015 жылғы
					Тұтынушы құқықтары туралы Заңы немесе баламалы міндетті тұтынушыларды
					қорғау заңнамасы бойынша алынып тасталуы мүмкін емес жауапкершілікті
					алып тастамайды.</p>
					<p><strong>Қазақстан тұтынушылары.</strong> ҚР № 274-IV
					«Тұтынушылардың құқықтарын қорғау туралы» Заңы (өзгерістерімен)
					бойынша алынып тасталуы мүмкін емес жауапкершілік сақталады.</p>
				</section>

				<!-- §19 -->
				<section id="kz-s19" class="kz-section-item">
					<h3>19. Өтемақы</h3>
					<p>Мыналардан туындаған кез келген талаптар, міндеттемелер, шығындар,
					залалдар, шығыстар (негізделген заң ақысын қоса) бойынша VeryNice.kz
					және оның операторын зиянсыз ұстауға және өтемақы төлеуге
					міндеттенесіз: (а) осы Шарттарды бұза отырып Сайтты пайдалануыңыз;
					(б) жіберген Пайдаланушы мазмұныңыз; (в) Шарттарды қасақана бұзуыңыз;
					(г) үшінші тараптардың құқықтарын бұзуыңыз.</p>
					<p><strong>Тұтынушылар үшін шектеу.</strong> Аталған өтемақы міндеті
					жеке тұтынушылардың Сайтты қалыпты пайдалануынан туындаған талаптарға
					қатысты қолданылмайды; бұл ережені ҚР № 274-IV Заңы немесе ЕО
					тұтынушыларды қорғау директивалары әділетсіз немесе орындалмайтын деп
					таныған жағдайда да осылай.</p>
				</section>

				<!-- §20 -->
				<section id="kz-s20" class="kz-section-item">
					<h3>20. Форс-мажор (Еңсерілмес күш жағдайлары)</h3>
					<p>ҚР Азаматтық кодексінің 401-бабына сәйкес төтенше және еңсерілмес
					мән-жайлар туғызған орындалмаушылық немесе кешіктіруден туындаған зиян
					үшін жауапты болмаймыз. Мұндай мән-жайларға мыналар жатады: табиғат
					апаттары; соғыс, қарулы қақтығыс немесе терроризм; азаматтық тәртіпсіздік
					немесе үкімет шаралары; індет немесе пандемия; интернет немесе
					телекоммуникациялық инфрақұрылым үзілістері; жер сілкінісі, су тасқыны
					немесе өзге табиғи апаттар. Зардап шеккен тарап мүмкіндігінше тезірек
					хабарлауы және салдарды жұмсарту үшін ақылға қонымды күш жұмсауы тиіс.</p>
				</section>

				<!-- §21 -->
				<section id="kz-s21" class="kz-section-item">
					<h3>21. Тыйым салынған іс-әрекеттер</h3>
					<p>Мыналарға тыйым салынады:</p>
					<ul>
						<li>алдын ала жазбаша рұқсатсыз Сайтты парсерлеу, тарап жүру немесе
						деректерді жинау</li>
						<li>тіркелгі жасау, мазмұн жариялау немесе Сайтпен жаппай өзара
						іс-қимыл жасау үшін автоматтандырылған құралдарды пайдалану</li>
						<li>Сайттың немесе оның инфрақұрылымының кез келген бөліміне рұқсатсыз
						кіруге әрекет ету</li>
						<li>Сайттың кез келген бағдарламалық қамтылымын кері жобалау,
						шифрын ашу немесе бөлшектеу</li>
						<li>Сайтты қолданылатын заң немесе ережені бұза отырып пайдалану</li>
						<li>кез келген тұлға немесе ұйымды немесе олармен байланысты жалған
						бейнелеу</li>
						<li>Сайттың немесе оның жүйелерінің тұтастығы немесе жұмысына кедергі
						жасау немесе бұзу</li>
					</ul>
					<div class="callout callout-neutral">
						<strong>Қазақстан киберқауіпсіздік заңнамасы.</strong> Сайттың
						ақпараттық жүйелеріне рұқсатсыз кіру ҚР № 418-V «Ақпараттандыру
						туралы» Заңы (2015 ж.) және/немесе ҚР Қылмыстық кодексінің
						205-бабы (компьютерлік ақпаратқа заңсыз кіру) бойынша құқық
						бұзушылық болып саналуы мүмкін. Оператор мұндай іс-әрекеттерді
						тиісті органдарға жеткізу құқығын сақтайды.
					</div>
				</section>

				<!-- §22 -->
				<section id="kz-s22" class="kz-section-item">
					<h3>22. Шарттарды өзгерту</h3>
					<p>Осы Шарттарды кез келген уақытта жаңартуға құқылымыз. Маңызды
					өзгерістер туралы Сайтта ерекше хабарлама орналастыру және/немесе
					тіркелген пайдаланушыларға электрондық пошта арқылы жіберу арқылы
					кемінде <strong>30 күн</strong> бұрын ескертеміз. Күшіне ену
					күнінен кейін Сайтты пайдалануды жалғастыру — өзгертілген Шарттарды
					қабылдауды білдіреді. Сайтты пайдалануды тоқтату және тіркелгіні
					жою үшін <a href="mailto:contact.azamat@gmail.com">contact.azamat@gmail.com</a>
					мекенжайына хабарласыңыз.</p>
				</section>

				<!-- §23 -->
				<section id="kz-s23" class="kz-section-item">
					<h3>23. Жалпы ережелер</h3>
					<p><strong>Бөліктілік.</strong> Осы Шарттардың кез келген ережесі
					орындалмайтын деп танылса, ол қажетті ең аз деңгейге дейін шектеледі;
					қалған ережелер толық күшінде қалады.</p>
					<p><strong>Толық келісім.</strong> Осы Шарттар, Құпиялылық саясаты
					және Cookie саясатымен бірге сіз бен VeryNice.kz арасында Сайтты
					пайдалануға қатысты толық келісімді қалыптастырады.</p>
					<p><strong>Бас тарту.</strong> Кез келген құқықты немесе ережені орындамауымыз
					сол құқықтан немесе ережеден бас тарту болып табылмайды.</p>
					<p><strong>Цессия.</strong> Осы Шарттар бойынша құқықтар мен міндеттемелерді
					алдын ала жазбаша келісімімізсіз беруге болмайды. Жалғастырушы субъект
					осы Шарттардың барлық міндеттемелерін қабылдаған жағдайда өз
					құқықтарымызды беруге болады.</p>
					<p><strong>Талап қою мерзімі.</strong> ҚР Азаматтық кодексінің 177–178-баптарына
					сәйкес: шарттық және деликтік талаптар бойынша жалпы талап қою мерзімі —
					бұзушылық туралы білген немесе білуі тиіс болған күннен бастап
					<strong>үш (3) жыл</strong> (АК 177-бабы). Ар-намыс, қадір-қасиет немесе іскерлік
					беделді қорғауға байланысты талаптар бойынша қысқартылған мерзім —
					<strong>бір (1) жыл</strong> қолданылады (АК 178-бабы). Сайтты пайдаланудан
					туындайтын немесе онымен байланысты кез келген талап осы мерзімдер өткеннен
					кейін қабылданбайды.</p>
					<div class="callout callout-neutral">
						<strong>№ 18-VIII Заңы — Заңды өкіл шегі.</strong> № 18-VIII Заңының
						12-бабы бойынша Сайттың Қазақстандағы орташа тәуліктік аудиториясы
						<strong>100 000 пайдаланушыдан</strong> асқан жағдайда, оператор
						Цифрлық даму, инновациялар және ғарыш өнеркәсібі министрлігінде
						Қазақстандағы заңды өкілді тіркеуі тиіс. Оператор аталған шекке
						жеткенде осы талапты орындайды.
					</div>
				</section>

				<!-- §24 -->
				<section id="kz-s24" class="kz-section-item">
					<h3>24. Байланыс</h3>
					<div class="contact-card">
						<div class="contact-logo" aria-hidden="true">VN</div>
						<div>
							<p class="contact-name">VeryNice.kz</p>
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
								Жауап беру мерзімі — 20 күнтізбелік күн (№ 18-VIII Заңның 9-бабы)
							</p>
						</div>
					</div>
				</section>
			</div>
			<!-- ══ END KAZAKH TRANSLATION ════════════════════════════════════ -->

			<footer class="doc-footer">
				<p>© 2026 VeryNice.kz. All rights reserved. This document was last reviewed on 16 May 2026.</p>
				<nav class="footer-links" aria-label="Legal pages">
					<a href="/privacy">Privacy Policy</a>
					<span aria-hidden="true">·</span>
					<a href="/terms" aria-current="page">Terms of Use</a>
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
		box-shadow: inset 0 4px 0 #113f72;
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

	.back-link:hover {
		color: #fff;
	}

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

	.notice-icon {
		flex-shrink: 0;
		margin-top: 0.1rem;
	}

	.notice-box p {
		margin: 0;
	}

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

	.toc-list li {
		list-style: none !important;
	}

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
		background: #eff6ff;
		color: #113f72;
		font-weight: 600;
		padding-left: 0.75rem;
		box-shadow: inset 3px 0 0 #113f72;
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

	.legal-body section:first-child {
		padding-top: 0;
	}

	.legal-body section + section {
		border-top: 1px solid #f1f5f9;
	}

	.legal-body h2 {
		font-family: var(--vnk-font-primary, 'Outfit', sans-serif);
		font-size: 1.05rem !important;
		font-weight: 700;
		color: #0f172a;
		margin: 0 0 1rem;
		letter-spacing: -0.01em;
	}

	.legal-body p {
		font-size: 0.9rem;
		color: #475569;
		line-height: 1.8;
		margin: 0 0 0.75rem;
	}

	.legal-body p:last-child {
		margin-bottom: 0;
	}

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

	.legal-body strong {
		color: #1e293b;
		font-weight: 600;
	}

	.legal-body a {
		color: #0369a1;
		text-decoration: underline;
		text-decoration-color: rgba(3, 105, 161, 0.3);
		text-underline-offset: 3px;
		transition: color 0.15s;
	}

	.legal-body a:hover {
		color: #0284c7;
	}

	/* ── Definition list (term/clause pairs) ─────────────────────────── */
	.term-list {
		margin: 0.5rem 0 0;
	}

	.term-list dt {
		font-size: 0.825rem;
		font-weight: 700;
		color: #1e293b;
		margin: 1.1rem 0 0.2rem;
		padding-left: 0.75rem;
		border-left: 3px solid #113f72;
	}

	.term-list dt:first-child {
		margin-top: 0;
	}

	.term-list dd {
		font-size: 0.9rem;
		color: #475569;
		line-height: 1.75;
		margin: 0 0 0 1rem;
		padding: 0.4rem 0 0 0.5rem;
	}

	.term-list dd p {
		margin: 0 0 0.4rem;
	}

	.term-list dd ul {
		margin: 0.3rem 0;
	}

	/* ── Callouts ─────────────────────────────────────────────────────── */
	.callout {
		border-radius: var(--vnk-border-radius-sm, 0.5rem);
		padding: 0.875rem 1rem;
		font-size: 0.875rem;
		line-height: 1.7;
		margin: 0.875rem 0;
	}

	.callout strong {
		display: block;
		margin-bottom: 0.2rem;
	}

	.callout-info {
		background: #eff6ff;
		border-left: 3px solid #113f72;
		color: #1e3a5f;
	}

	.callout-info strong { color: #113f72; }

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

	/* ── Kazakh section ────────────────────────────────────────────────── */
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

	.kz-section-item:first-child {
		padding-top: 0;
	}

	.kz-section-item + .kz-section-item {
		border-top: 1px solid #f1f5f9;
	}

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

	.footer-links a {
		color: #64748b;
		text-decoration: none;
	}

	.footer-links a:hover {
		color: #0369a1;
	}

	.footer-links a[aria-current='page'] {
		color: #0369a1;
		font-weight: 600;
	}

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

		.toc-inner {
			display: none; /* hide on tablet/mobile for simplicity */
		}
	}

	@media (max-width: 640px) {
		.banner-inner {
			padding: 1.25rem 1rem 1.5rem;
		}

		.legal-body {
			padding: 1.75rem 1.25rem;
			border-radius: var(--vnk-border-radius-md, 0.75rem);
		}

		.kz-section {
			padding: 1.25rem 1rem;
		}

		.contact-card {
			flex-direction: column;
		}

		.kz-doc-header {
			padding: 0 1.25rem 1.25rem;
		}

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
