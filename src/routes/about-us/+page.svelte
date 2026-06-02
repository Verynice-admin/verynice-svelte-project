<script>
	import { onMount } from 'svelte';

	const sections = [
		{ id: 'our-story',   label: 'Our Story' },
		{ id: 'the-mission', label: 'Our Mission' },
		{ id: 'the-borat',   label: 'The Borat Factor' },
		{ id: 'the-team',    label: 'The Team' },
		{ id: 'built-with',  label: 'Built With AI' },
	];

	let activeId = 'our-story';

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

	const boratPhrases = [
		{ phrase: 'Very nice!', context: 'High praise — used for literally everything.' },
		{ phrase: 'Great success!', context: 'The ultimate celebration. We say this every time the site loads.' },
		{ phrase: 'Jagshemash!', context: 'How Borat says "Hello" — basically a good greeting for any situation.' },
		{ phrase: 'Wawaweewa!', context: 'Expression of amazement. Try it next time you see Lake Balkash.' },
		{ phrase: 'High five!', context: "Borat's signature greeting in America. Still confused why it didn't catch on in Almaty." },
		{ phrase: 'Is nice!', context: 'Kazakhstan is nice. The food is nice. The people are nice. Just… nice.' },
	];
</script>

<svelte:head>
	<title>About Us | VeryNice.kz — The Reverse Borat Story</title>
	<meta name="description" content="Learn about VeryNice.kz — the ultimate guide for tourists who came to study Kazakhstan. Created by Azamat Baidildayev and daughter Aliya Askar with the help of AI." />
	<link rel="canonical" href="https://verynice.kz/about-us" />
	<meta property="og:url" content="https://verynice.kz/about-us" />
</svelte:head>

<div class="doc-page">

	<!-- BANNER -->
	<div class="doc-banner about-banner">
		<div class="banner-inner">
			<a href="/" class="back-link">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				Home
			</a>
			<div class="banner-body">
				<div class="doc-type-label">About This Project</div>
				<h1>About <span class="brand-highlight">VeryNice.kz</span></h1>
				<p class="banner-tagline">The Reverse Borat Story — Tourists Who Came to Study Kazakhstan 🇰🇿</p>
				<div class="doc-meta-row">
					<span class="meta-pill">
						<svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<path d="M8 2C5.79 2 4 3.79 4 6c0 3 4 8 4 8s4-5 4-8c0-2.21-1.79-4-4-4z" stroke="currentColor" stroke-width="1.5"/>
							<circle cx="8" cy="6" r="1.25" stroke="currentColor" stroke-width="1.25"/>
						</svg>
						Almaty, Kazakhstan
					</span>
					<span class="meta-pill">🤖 Built with AI</span>
					<span class="meta-pill">💛 Made with love</span>
				</div>
			</div>
		</div>
	</div>

	<!-- NOTICE -->
	<div class="notice-wrapper">
		<div class="notice-inner">
			<div class="notice-box fun-notice">
				<span class="notice-emoji" aria-hidden="true">🎬</span>
				<p>
					<strong>You know Borat? He went to America "to study".</strong>
					We flipped the script — welcome to <em>"Cultural Learnings of Kazakhstan for Make Benefit Glorious Nations of the World!"</em>
					Your guide to the real Kazakhstan, behind the moustache and the green mankini. Spoiler: it's absolutely magnificent.
				</p>
			</div>
		</div>
	</div>

	<!-- MAIN LAYOUT -->
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
		<article class="about-body">

			<!-- OUR STORY -->
			<section id="our-story">
				<h2>Our Story</h2>
				<p>
					It started with a simple question: <em>"Why does every foreigner visiting Kazakhstan
					only know it from a Sacha Baron Cohen comedy?"</em>
				</p>
				<p>
					Kazakhstan is one of the most fascinating, underrated, and genuinely spectacular countries
					on Earth — the world's largest landlocked nation, birthplace of the apple, home of the
					world's first and largest spaceport, and a country that went from Soviet republic to modern
					economic powerhouse in a single generation. None of that made it into Borat's documentary.
				</p>
				<p>
					So we built <strong>VeryNice.kz</strong> — a travel and culture guide that gives
					foreign visitors (and curious locals) the real story: the history, the food, the
					traditions, the cities, and the kind of hospitality that will genuinely make you
					say "Great success!" when your plane finally lands in Almaty.
				</p>
				<div class="story-stat-row">
					<div class="stat-card">
						<span class="stat-num">🌍</span>
						<span class="stat-label">Built for foreign tourists</span>
					</div>
					<div class="stat-card">
						<span class="stat-num">🏔️</span>
						<span class="stat-label">World's largest landlocked country</span>
					</div>
					<div class="stat-card">
						<span class="stat-num">🍎</span>
						<span class="stat-label">Almaty — birthplace of the apple</span>
					</div>
				</div>
			</section>

			<!-- OUR MISSION -->
			<section id="the-mission">
				<h2>Our Mission</h2>
				<p>
					We believe every traveller deserves accurate, engaging, and genuinely useful information
					about the places they visit. That belief shapes everything we do.
				</p>

				<div class="mission-grid">
					<div class="mission-block">
						<div class="mission-icon">🗺️</div>
						<div>
							<strong>Demystify Kazakhstan</strong>
							<p>For tourists who arrive with only Borat-shaped expectations and leave absolutely blown away.</p>
						</div>
					</div>
					<div class="mission-block">
						<div class="mission-icon">🏺</div>
						<div>
							<strong>Celebrate Kazakh Culture</strong>
							<p>The nomadic heritage, the epic landscapes, the traditional dastarkhan feasts, and the warm, generous spirit of the Kazakh people.</p>
						</div>
					</div>
					<div class="mission-block">
						<div class="mission-icon">🔍</div>
						<div>
							<strong>Be Radically Honest</strong>
							<p>We tell you what's great, what's tricky, and what to watch out for. No fluff, no paid-for puff pieces.</p>
						</div>
					</div>
					<div class="mission-block">
						<div class="mission-icon">🤝</div>
						<div>
							<strong>Bridge Cultures</strong>
							<p>Because the more people truly understand Kazakhstan, the more Borat becomes what he always was: a fictional character, not a documentary.</p>
						</div>
					</div>
				</div>

				<p class="mission-closing">
					Think of us as the travel companion you wished you had when you first Googled "Kazakhstan
					tourism" and found mostly yurt pictures and that one scene with the mankini.
				</p>
			</section>

			<!-- THE BORAT FACTOR -->
			<section id="the-borat">
				<h2>The Borat Factor</h2>

				<p>Let's address the elephant — or the horse — in the yurt.</p>
				<p>
					In 2006, Sacha Baron Cohen released <em>Borat: Cultural Learnings of America for
					Make Benefit Glorious Nation of Kazakhstan</em> — a comedy mockumentary in which
					a fictional Kazakhstani journalist named Borat Sagdiyev travels to America to "study"
					its culture. The film was brilliantly funny and absolutely catastrophic for Kazakhstan's
					international image.
				</p>
				<p>
					The Kazakh government was not amused. The people were not amused. But here's the twist
					the internet loves: Sacha Baron Cohen later <strong>donated $500,000 to a charity run
					by actual Kazakhstanis</strong>, flew to the country, and Kazakhstan eventually leaned
					into the joke — the Tourism Board even launched a campaign using the phrase
					<em>"Very Nice"</em>.
				</p>
				<p>
					So we did too. <strong>VeryNice.kz</strong> — the name itself is a nod to Borat's most
					famous phrase, reclaimed proudly. Because Kazakhstan is, genuinely, very nice.
				</p>

				<h3>Borat's Greatest Hits</h3>
				<p class="phrases-intro">
					These phrases went viral. You'll hear tourists trying them. Here's what they actually mean:
				</p>

				<div class="phrases-grid">
					{#each boratPhrases as { phrase, context }}
						<div class="phrase-card">
							<div class="phrase-text">"{phrase}"</div>
							<div class="phrase-context">{context}</div>
						</div>
					{/each}
				</div>

				<div class="real-kz-note">
					<strong>The Real Kazakhstan:</strong> Modern, vibrant, and nothing like the film.
					Almaty has world-class restaurants, a booming tech scene, and mountains that will
					make your Instagram followers extremely jealous. Astana looks like someone designed
					a capital city in a video game — in the best possible way. The people are warm,
					the food is extraordinary, and the landscape is simply unlike anything else on Earth.
				</div>
			</section>

			<!-- THE TEAM -->
			<section id="the-team">
				<h2>The Team</h2>
				<p>
					Every great project starts with people who care. Here's who built VeryNice.kz:
				</p>

				<div class="team-grid">

					<div class="team-card founder">
						<div class="team-avatar" aria-hidden="true">🧔</div>
						<div class="team-info">
							<h3 class="team-name">Azamat Baidildayev</h3>
							<div class="team-role">Founder & Project Lead</div>
							<div class="team-disclaimer">Not the Azamat from the Borat film. Completely different Azamat. A real one.</div>
							<p class="team-bio">
								A proud Kazakhstani and AI amateur who believes that technology, creativity,
								and a good sense of humour can change how the world sees his country.
								Azamat built this platform to give Kazakhstan the international travel guide
								it truly deserves — one that celebrates rather than caricatures.
							</p>
							<p class="team-bio">
								When not wrestling with code at midnight, he's exploring Kazakhstan's hidden
								corners and wondering why the rest of the world is still sleeping on one of
								Central Asia's greatest travel destinations.
							</p>
						</div>
					</div>

					<div class="team-card student">
						<div class="team-avatar" aria-hidden="true">👩‍🎓</div>
						<div class="team-info">
							<h3 class="team-name">Aliya Askar</h3>
							<div class="team-role">Co-Creator & Junior Editor</div>
							<div class="team-badge">NIS FMN Almaty — High School Student</div>
							<p class="team-bio">
								Aliya is the next generation of Kazakhstan's storytellers. A student at
								the <strong>Nazarbayev Intellectual School of Physics, Mathematics and
								Natural Sciences (NIS FMN)</strong> in Almaty, she brings the perspective
								of a young Kazakhstani who knows exactly what tourists get wrong — and
								exactly what they should be raving about.
							</p>
							<p class="team-bio">
								Her contribution: making sure the content passes the most rigorous test
								of all — the "would an actual young person in Kazakhstan cringe at this?"
								quality check. She is Azamat's daughter, and proof that the future of
								Kazakh storytelling is in very capable hands.
							</p>
						</div>
					</div>

				</div>

				<div class="team-footer-note">
					<strong>A family project.</strong> Started at a kitchen table in Almaty, powered
					by curiosity, green tea, and a shared frustration that the world's ninth-largest
					country was still mostly known for a joke. We're fixing that — one page at a time.
				</div>
			</section>

			<!-- BUILT WITH AI -->
			<section id="built-with">
				<h2>Built With AI — Proudly</h2>
				<p>
					Let's be transparent: <strong>VeryNice.kz was built with significant help from AI</strong>.
					The content is researched, shaped, and fact-checked by humans who actually live in and
					love Kazakhstan — but the heavy lifting of coding, structuring, and scaling was done
					in partnership with modern AI tools.
				</p>
				<p>
					We're what you might call <em>AI amateurs</em> — not engineers with CS degrees, not
					a Silicon Valley startup, just a father and daughter in Almaty who figured out that
					you no longer need a team of fifty developers to build something meaningful on the internet.
				</p>
				<div class="ai-philosophy">
					<h3>Why we're not hiding it</h3>
					<p>
						The travel and culture information on this site is curated, reviewed, and verified
						by real people with real knowledge of Kazakhstan. AI helped us build faster and
						smarter — it didn't replace the human judgment, local knowledge, or genuine
						passion behind every article.
					</p>
					<p>
						We think that's the right way to use these tools: as amplifiers of human expertise,
						not replacements for it. And if Borat taught us anything, it's that when you don't
						have the full story, you end up looking very silly.
					</p>
					<p class="ai-tagline">
						<strong>Great success!</strong> — We have the full story. Come explore Kazakhstan. 🇰🇿
					</p>
				</div>

				<div class="contact-cta">
					<h3>Say Hello</h3>
					<p>
						Have a question, a correction, or just want to say <em>"Jagshemash"</em>?
						We genuinely love hearing from travellers, Kazakhstan enthusiasts, and anyone
						who watched Borat and then actually visited the country.
					</p>
					<a href="/contact" class="cta-btn">Contact Us</a>
				</div>
			</section>

		</article>
	</div>
</div>

<style>
	.doc-page {
		min-height: 100vh;
		background: #fff;
		color: #1a1a2e;
		font-family: 'Inter', system-ui, sans-serif;
	}

	/* BANNER */
	.about-banner {
		background: linear-gradient(135deg, #0f172a 0%, #1a1a3a 50%, #0a2a1a 100%);
		padding: 3rem 1.5rem 2.5rem;
	}

	.banner-inner {
		max-width: 900px;
		margin: 0 auto;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		color: rgba(255,255,255,0.55);
		text-decoration: none;
		font-size: 0.85rem;
		margin-bottom: 1.5rem;
		transition: color 0.2s;
	}
	.back-link:hover { color: #fff; }

	.banner-body { color: #fff; }

	.doc-type-label {
		display: inline-block;
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #86efac;
		background: rgba(134,239,172,0.12);
		padding: 0.2rem 0.6rem;
		border-radius: 4px;
		margin-bottom: 0.75rem;
	}

	.banner-body h1 {
		font-size: clamp(1.9rem, 4vw, 2.9rem);
		font-weight: 800;
		line-height: 1.15;
		margin: 0 0 0.5rem;
		color: #fff;
	}

	.brand-highlight { color: #ffd700; }

	.banner-tagline {
		font-size: 1rem;
		color: rgba(255,255,255,0.72);
		margin: 0 0 1rem;
		font-style: italic;
	}

	.doc-meta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.meta-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.75rem;
		color: rgba(255,255,255,0.6);
		background: rgba(255,255,255,0.07);
		border: 1px solid rgba(255,255,255,0.12);
		padding: 0.2rem 0.55rem;
		border-radius: 20px;
	}

	/* NOTICE */
	.notice-wrapper {
		background: #f0fdf4;
		border-bottom: 1px solid #bbf7d0;
		padding: 1rem 1.5rem;
	}

	.notice-inner { max-width: 900px; margin: 0 auto; }

	.notice-box {
		display: flex;
		align-items: flex-start;
		gap: 0.85rem;
	}

	.fun-notice {
		padding: 0.85rem 1.1rem;
		color: #14532d;
	}

	.notice-emoji {
		font-size: 1.3rem;
		flex-shrink: 0;
		margin-top: 0.1rem;
	}

	.notice-box p {
		margin: 0;
		line-height: 1.65;
		font-size: 0.92rem;
	}

	/* MAIN LAYOUT */
	.doc-layout {
		max-width: 900px;
		margin: 0 auto;
		padding: 3rem 1.5rem 6rem;
		display: grid;
		grid-template-columns: 170px 1fr;
		gap: 3.5rem;
		align-items: start;
	}

	/* TOC */
	.toc-sidebar {
		position: sticky;
		top: 4.5rem;
	}

	.toc-inner {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		padding: 1rem;
	}

	.toc-heading {
		font-size: 0.63rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.09em;
		color: #94a3b8;
		margin: 0 0 0.6rem;
	}

	.toc-list {
		list-style: none;
		list-style-type: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.toc-list li {
		list-style: none;
		list-style-type: none;
	}

	.toc-list li::before,
	.toc-list li::marker {
		display: none !important;
		content: none !important;
	}

	.toc-list li a {
		display: block;
		font-size: 0.78rem;
		color: #1e40af;
		text-decoration: none;
		padding: 0.3rem 0.55rem;
		border-radius: 5px;
		transition: all 0.15s;
		border-left: 2px solid transparent;
		line-height: 1.4;
		font-weight: 500;
	}

	.toc-list li.active a,
	.toc-list li a:hover {
		color: #1e3a8a;
		background: #eff6ff;
		border-left-color: #ffd700;
	}

	/* ARTICLE BODY */
	.about-body section {
		margin-bottom: 4rem;
		padding-bottom: 3rem;
		border-bottom: 1px solid #f1f5f9;
	}
	.about-body section:last-child { border-bottom: none; margin-bottom: 0; }

	.about-body h2 {
		font-size: 1.55rem;
		font-weight: 700;
		color: #0f172a;
		margin: 0 0 1.25rem;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid #ffd700;
		display: inline-block;
	}

	.about-body h3 {
		font-size: 1.05rem;
		font-weight: 600;
		color: #1e293b;
		margin: 2rem 0 0.75rem;
	}

	.about-body p {
		color: #374151;
		line-height: 1.85;
		margin-bottom: 1.1rem;
		font-size: 0.975rem;
	}

	/* STORY STATS */
	.story-stat-row {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
		flex-wrap: wrap;
	}

	.stat-card {
		flex: 1 1 140px;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 1.1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.45rem;
		text-align: center;
	}

	.stat-num { font-size: 1.6rem; }

	.stat-label {
		font-size: 0.73rem;
		font-weight: 600;
		color: #475569;
		line-height: 1.35;
	}

	/* MISSION GRID (no bullets) */
	.mission-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin: 1.5rem 0;
	}

	.mission-block {
		display: flex;
		gap: 0.9rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 1.1rem 1.2rem;
		align-items: flex-start;
	}

	.mission-icon {
		font-size: 1.4rem;
		flex-shrink: 0;
		margin-top: 0.1rem;
	}

	.mission-block strong {
		display: block;
		font-size: 0.9rem;
		font-weight: 700;
		color: #0f172a;
		margin-bottom: 0.3rem;
	}

	.mission-block p {
		font-size: 0.85rem;
		color: #64748b;
		line-height: 1.6;
		margin: 0;
	}

	.mission-closing {
		font-style: italic;
		color: #64748b !important;
		margin-top: 0.5rem;
	}

	/* BORAT PHRASES */
	.phrases-intro {
		color: #64748b;
		font-size: 0.88rem;
		font-style: italic;
		margin-bottom: 1.1rem;
	}

	.phrases-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
		gap: 0.8rem;
		margin-bottom: 1.75rem;
	}

	.phrase-card {
		background: #0f172a;
		border-radius: 10px;
		padding: 1rem 1.15rem;
		border-left: 3px solid #ffd700;
	}

	.phrase-text {
		font-size: 1rem;
		font-weight: 700;
		color: #ffd700;
		margin-bottom: 0.4rem;
		font-style: italic;
	}

	.phrase-context {
		font-size: 0.78rem;
		color: rgba(255,255,255,0.72);
		line-height: 1.55;
	}

	.real-kz-note {
		background: #f0fdf4;
		border: 1px solid #bbf7d0;
		border-left: 4px solid #16a34a;
		border-radius: 10px;
		padding: 1.1rem 1.3rem;
		font-size: 0.9rem;
		color: #14532d;
		line-height: 1.7;
		margin-top: 1.25rem;
	}

	/* TEAM */
	.team-grid {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin: 1.75rem 0;
	}

	.team-card {
		display: flex;
		gap: 1.4rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 14px;
		padding: 1.6rem;
		align-items: flex-start;
	}

	.team-card.founder { border-left: 4px solid #ffd700; }
	.team-card.student { border-left: 4px solid #86efac; }

	.team-avatar {
		font-size: 2.4rem;
		width: 58px;
		height: 58px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #fff;
		border-radius: 50%;
		border: 1px solid #e2e8f0;
		flex-shrink: 0;
	}

	.team-info { flex: 1; min-width: 0; }

	.team-name {
		font-size: 1.1rem;
		font-weight: 700;
		color: #0f172a;
		margin: 0 0 0.25rem;
	}

	.team-role {
		font-size: 0.73rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #94a3b8;
		margin-bottom: 0.5rem;
	}

	.team-disclaimer {
		font-size: 0.78rem;
		color: #92400e;
		background: #fffbeb;
		border: 1px solid #fde68a;
		border-radius: 5px;
		padding: 0.25rem 0.65rem;
		display: inline-block;
		margin-bottom: 0.85rem;
	}

	.team-badge {
		font-size: 0.78rem;
		color: #065f46;
		background: #d1fae5;
		border-radius: 5px;
		padding: 0.25rem 0.65rem;
		display: inline-block;
		margin-bottom: 0.85rem;
		font-weight: 600;
	}

	.team-bio {
		font-size: 0.9rem;
		color: #475569;
		line-height: 1.7;
		margin-bottom: 0.6rem;
	}

	.team-footer-note {
		background: #1e293b;
		color: rgba(255,255,255,0.82);
		border-radius: 12px;
		padding: 1.1rem 1.35rem;
		font-size: 0.9rem;
		line-height: 1.65;
	}

	.team-footer-note strong { color: #ffd700; }

	/* AI SECTION */
	.ai-philosophy {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 1.4rem 1.6rem;
		margin: 1.5rem 0;
	}

	.ai-philosophy h3 { margin-top: 0; color: #0f172a; }

	.ai-tagline {
		margin-bottom: 0 !important;
		font-size: 1rem !important;
		color: #0f172a !important;
		font-weight: 500;
	}

	/* CONTACT CTA */
	.contact-cta {
		background: linear-gradient(135deg, #0f172a, #1e3a5f);
		color: #fff;
		border-radius: 14px;
		padding: 2rem 2.25rem;
		text-align: center;
		margin-top: 2rem;
	}

	.contact-cta h3 {
		color: #ffd700;
		font-size: 1.3rem;
		margin-top: 0;
		margin-bottom: 0.75rem;
	}

	.contact-cta p {
		color: rgba(255,255,255,0.78) !important;
		font-size: 0.92rem;
		margin-bottom: 1.4rem;
	}

	.cta-btn {
		display: inline-block;
		background: #ffd700;
		color: #0f172a;
		font-weight: 700;
		font-size: 0.92rem;
		padding: 0.7rem 1.9rem;
		border-radius: 8px;
		text-decoration: none;
		transition: transform 0.2s, background 0.2s;
	}

	.cta-btn:hover {
		background: #ffe44d;
		transform: translateY(-2px);
	}

	/* RESPONSIVE */
	@media (max-width: 720px) {
		.doc-layout {
			grid-template-columns: 1fr;
			gap: 1.5rem;
			padding: 2rem 1rem 5rem;
		}

		.toc-sidebar { position: static; }

		.toc-list {
			flex-direction: row;
			flex-wrap: wrap;
			gap: 0.25rem;
		}

		.toc-list li a {
			border-left: none;
			border-bottom: 2px solid transparent;
			font-size: 0.73rem;
		}

		.toc-list li.active a,
		.toc-list li a:hover {
			border-left-color: transparent;
			border-bottom-color: #ffd700;
		}

		.mission-grid {
			grid-template-columns: 1fr;
		}

		.team-card { flex-direction: column; }

		.phrases-grid { grid-template-columns: 1fr 1fr; }

		.story-stat-row { gap: 0.75rem; }
	}

	@media (max-width: 420px) {
		.phrases-grid { grid-template-columns: 1fr; }
	}
</style>
