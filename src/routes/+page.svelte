<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { getCloudinaryUrl } from '$lib/utils/cloudinary';
	import RelatedPosts from '$components/features/content/RelatedPosts.svelte';
	import VideoEmbed from '$components/features/content/VideoEmbed.svelte';

	/** @type {import('./$types').PageData} */
	export let data;
	$: ({ homepage, sliders } = data);

	let scrollY = 0;
	let innerWidth = 0;

	$: heroImageUrl = homepage?.heroImagePublicId
		? getCloudinaryUrl(homepage.heroImagePublicId, {
				width: 2200,
				crop: 'fill',
				quality: 'auto:best'
			})
		: getCloudinaryUrl(
				'content/pages/destinations/Turkistan_Shymkent/sairam-ugam-national-park/sairam-ugam-national-park-01',
				{ width: 2200, crop: 'fill' }
			);

	$: featuredImageUrl = homepage?.featuredDestination?.imagePublicId
		? getCloudinaryUrl(homepage.featuredDestination.imagePublicId, { width: 1200, crop: 'fill' })
		: '';

	function handleSearch(e) {
		const formData = new FormData(e.target);
		const q = formData.get('q');
		if (q) window.location.href = `/search?q=${encodeURIComponent(q.toString())}`;
	}
</script>

<svelte:window bind:scrollY bind:innerWidth />

<svelte:head>
	<title>{homepage?.title || 'VeryNice.kz | Discover Kazakhstan'}</title>
	<meta name="description" content={homepage?.metaDescription} />
</svelte:head>

<!-- PREMIUM HERO SECTION -->
<section id="homepage-hero" class="hero-premium">
	<div class="hero-bg-container">
		<div
			class="hero-bg-image"
			style="background-image: url({heroImageUrl}); transform: translateY({scrollY * 0.4}px)"
		></div>
		<div class="hero-overlay"></div>
	</div>

	<div class="hero-content wrapper">
		<div class="hero-text-box" in:fly={{ y: 30, duration: 1000, delay: 200 }}>
			<span class="hero-kicker">Experience the Pristine</span>
			<h1>{homepage?.heroTitle || 'Kazakhstan: The Great Steppe'}</h1>
			<p class="hero-lead">{homepage?.heroSubtitle || 'Your professional guide to Central Asia'}</p>

			<div class="hero-search-glass">
				<form on:submit|preventDefault={handleSearch} class="premium-search-form">
					<div class="search-input-wrapper">
						<i class="icon-search"></i>
						<input type="text" name="q" placeholder="Where do you want to go?" required />
					</div>
					<button type="submit" class="btn-primary-neon">Discover</button>
				</form>
				<div class="search-suggestions">
					<span>Popular:</span>
					<a href="/destinations/charyn-canyon">Charyn Canyon</a>
					<a href="/destinations/astana-city">Astana</a>
					<a href="/destinations/kolsai-lakes">Kolsai Lakes</a>
				</div>
			</div>
		</div>
	</div>

	{#if homepage?.stats}
		<div class="hero-stats-bar wrapper" in:fade={{ delay: 800 }}>
			{#each homepage.stats as stat}
				<div class="stat-item">
					<span class="stat-value">{stat.value}</span>
					<span class="stat-label">{stat.label}</span>
				</div>
			{/each}
		</div>
	{/if}
</section>

<!-- WELCOME SECTION -->
<section class="welcome-section wrapper section-padding relative">
	<!-- Background accent -->
	<div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
		<div
			class="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full"
		></div>
	</div>

	<div class="welcome-grid relative z-10">
		<div class="welcome-content">
			<h2 class="section-title-premium gradient-text">Welcome to Central Asia's<br />Hidden Gem</h2>
			<p class="section-text-large">
				Kazakhstan is a land of extremes and unexpected beauty. Whether you are seeking the urban
				energy of Almaty, the spiritual depth of ancient mausoleums, or the silence of high-altitude
				lakes, our curated guides provide everything you need for the perfect journey.
			</p>
			<div class="welcome-features-premium">
				<div class="feature-tag-premium">
					<div class="icon-box">
						<i class="icon-check"></i>
					</div>
					<div class="feature-text">
						<strong>Verified Guides</strong>
						<span>Trusted Experts</span>
					</div>
				</div>
				<div class="feature-tag-premium">
					<div class="icon-box">
						<i class="icon-camera"></i>
					</div>
					<div class="feature-text">
						<strong>4K Photography</strong>
						<span>Visual Immersion</span>
					</div>
				</div>
				<div class="feature-tag-premium">
					<div class="icon-box">
						<i class="icon-globe"></i>
					</div>
					<div class="feature-text">
						<strong>Cultural Depth</strong>
						<span>Authentic Stories</span>
					</div>
				</div>
			</div>
		</div>
		<div class="welcome-video-teaser">
			{#if homepage?.featuredVideoUrl}
				<VideoEmbed title="Experience Kazakhstan" url={homepage.featuredVideoUrl} />
			{/if}
		</div>
	</div>
</section>

<!-- FEATURED DESTINATION (BOSZHIRA OR CHARYN) -->
{#if homepage?.featuredDestination}
	<section class="featured-impact-section">
		<div class="featured-bg" style="background-image: url({featuredImageUrl})"></div>
		<div class="wrapper">
			<div class="featured-card-glass" in:fly={{ x: -50, duration: 800 }}>
				<span class="card-badge">Featured Destination</span>
				<h3>{homepage.featuredDestination.title}</h3>
				<p>{homepage.featuredDestination.description}</p>
				<a href={`/destinations/${homepage.featuredDestination.id}`} class="btn-outline-white">
					Explore Journey
				</a>
			</div>
		</div>
	</section>
{/if}

<!-- CATEGORY EXPLORER -->
<section class="category-explorer-section section-padding">
	<div class="wrapper">
		<h2 class="section-title-premium centered">Discovery Categories</h2>

		<div class="sliders-stack">
			{#each Object.entries(sliders || {}) as [key, items]}
				{#if items.length > 0}
					<div class="slider-row-wrapper" in:fade>
						<RelatedPosts
							title={key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
							posts={items}
							collectionPath="destinations"
							titleUrl={`/destinations#${key}`}
						/>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</section>

<!-- PREMIUM NEWSLETTER SECTION -->
<section class="newsletter-section">
	<div class="newsletter-bg-glow"></div>
	<div class="wrapper relative z-10">
		<div class="newsletter-card-premium">
			<div class="newsletter-text-content">
				<span class="newsletter-badge">Monthly Digest</span>
				<h2>{homepage?.newsletterTitle || 'The Definitive Kazakhstan Guide'}</h2>
				<p>
					{homepage?.newsletterSubtitle ||
						'Join 15,000+ travelers receiving exclusive hidden gems, cultural deep-dives, and seasonal planning tips.'}
				</p>
			</div>
			<div class="newsletter-action">
				<form
					class="premium-input-group"
					on:submit|preventDefault={() => alert('Welcome to the inner circle!')}
				>
					<div class="input-wrapper">
						<i class="icon-mail"></i>
						<input type="email" placeholder="Enter your email address" required />
					</div>
					<button type="submit" class="btn-glow-gold">Subscribe</button>
				</form>
				<p class="newsletter-micro">No spam. Unsubscribe anytime.</p>
			</div>
		</div>
	</div>
</section>

<!-- IMMERSIVE HISTORY SECTION -->
<section class="history-promo-section">
	<div
		class="history-bg-parallax"
		style={`background-image: url("${getCloudinaryUrl('content/pages/destinations/Turkistan_Shymkent/khoja-ahmed-yasawi-mausoleum/mausoleum-01', { width: 2000, height: 1200, crop: 'fill', gravity: 'center', quality: 'auto:best' })}");`}
	></div>
	<div class="history-overlay-gradient"></div>

	<div class="wrapper history-content-wrapper">
		<div class="history-content-centered">
			<span class="section-kicker-gold">Timeless Heritage</span>
			<h2>Thousands of Years<br />of Living History</h2>
			<p>
				From the sacred spiritual center of Turkistan to the ancient petroglyphs of Tamgaly Tas.
				Walk the path of the Golden Man and discover the legends of the Great Steppe.
			</p>
			<a href="/history" class="btn-outline-gold-large">
				<span>Explore History</span>
				<i class="icon-arrow-right"></i>
			</a>
		</div>
	</div>
</section>

<style>
	/* PREMIUM HOME PAGE STYLES */

	:global(body) {
		background: #0f172a !important; /* Force darker theme for homepage */
		color: #f8fafc !important;
	}

	.section-padding,
	.newsletter-section {
		padding: clamp(6rem, 12vw, 10rem) 0;
	}

	.wrapper {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	/* HERO */
	.hero-premium {
		position: relative;
		height: 100vh;
		min-height: 800px;
		display: flex;
		flex-direction: column;
		justify-content: flex-start; /* Moved from center to top-bias */
		padding-top: 25vh; /* Push content down to ideal visual center-top */
		overflow: hidden;
		background: #000;
	}

	.hero-bg-container {
		position: absolute;
		inset: 0;
		z-index: 1;
	}

	.hero-bg-image {
		width: 100%;
		height: 120%; /* For parallax */
		background-size: cover;
		background-position: center;
		filter: brightness(0.9);
		will-change: transform;
	}

	.hero-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to bottom, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.6) 100%);
	}

	.hero-content {
		position: relative;
		z-index: 10;
		width: 100%;
	}

	.hero-text-box {
		max-width: 800px;
		/* margin-bottom to create space for stats if needed, or handled by padding */
	}

	.hero-kicker {
		display: block;
		font-family: 'Outfit', sans-serif;
		text-transform: uppercase;
		letter-spacing: 0.3em;
		color: var(--vnk-accent-color);
		font-weight: 700;
		margin-bottom: 1.5rem;
		font-size: 0.9rem;
	}

	.hero-text-box h1 {
		font-family: 'Outfit', sans-serif;
		font-size: clamp(3rem, 7vw, 6rem);
		font-weight: 900;
		line-height: 1;
		margin-bottom: 2rem;
		letter-spacing: -0.04em;
		color: #fff;
		text-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
	}

	.hero-lead {
		font-size: clamp(1.1rem, 1.5vw, 1.4rem);
		line-height: 1.6;
		color: #cbd5e1;
		margin-bottom: 3.5rem;
		max-width: 600px;
	}

	/* SEARCH GLASS */
	.hero-search-glass {
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		padding: 1.5rem;
		border-radius: 24px;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
		max-width: 700px;
		margin-bottom: 4rem; /* Additional space below search */
	}

	.premium-search-form {
		display: flex;
		gap: 1rem;
	}

	.search-input-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		background: rgba(15, 23, 42, 0.4);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 14px;
		padding: 0 1.25rem;
		color: #fff;
	}

	.search-input-wrapper input {
		background: transparent;
		border: none;
		color: #fff;
		width: 100%;
		padding: 1rem 0;
		font-size: 1.1rem;
		outline: none;
	}

	.btn-primary-neon {
		background: var(--vnk-accent-color);
		color: #0f111a;
		padding: 1rem 2.5rem;
		border-radius: 14px;
		font-weight: 800;
		font-family: 'Outfit', sans-serif;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		cursor: pointer;
		white-space: nowrap;
	}

	.btn-primary-neon:hover {
		transform: translateY(-2px);
		box-shadow: 0 0 20px rgba(6, 182, 212, 0.6);
		background: #fff;
	}

	.search-suggestions {
		margin-top: 1rem;
		display: flex;
		gap: 1rem;
		font-size: 0.85rem;
		color: #94a3b8;
		padding-left: 0.5rem;
	}

	.search-suggestions a {
		color: #fff;
		opacity: 0.7;
		transition: opacity 0.2s;
	}

	.search-suggestions a:hover {
		opacity: 1;
		text-decoration: underline;
	}

	/* STATS BAR */
	.hero-stats-bar {
		position: absolute;
		bottom: 15%; /* Lifted significantly up from bottom */
		left: 0;
		right: 0;
		z-index: 10;
		display: flex;
		justify-content: flex-start;
		gap: clamp(2rem, 5vw, 6rem);
	}

	.stat-item {
		display: flex;
		flex-direction: column;
	}

	.stat-value {
		font-family: 'Outfit', sans-serif;
		font-size: 2.5rem;
		font-weight: 900;
		color: #fff;
		line-height: 1;
	}

	.stat-label {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--vnk-accent-color);
		margin-top: 0.5rem;
		font-weight: 700;
	}

	/* WELCOME */
	.welcome-grid {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: 6rem;
		align-items: center;
	}

	.section-title-premium {
		font-family: 'Outfit', sans-serif;
		font-size: clamp(2.5rem, 4vw, 3.5rem);
		font-weight: 900;
		letter-spacing: -0.03em;
		margin-bottom: 2rem;
		color: #fff;
		line-height: 1.1;
	}

	.section-title-premium.centered {
		text-align: center;
		margin-bottom: 5rem;
	}

	.section-text-large {
		font-size: 1.25rem;
		line-height: 1.7;
		color: #94a3b8;
		margin-bottom: 3rem;
	}

	.welcome-features {
		display: flex;
		flex-wrap: wrap;
		gap: 2rem;
	}

	.feature-tag {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: #fff;
		font-weight: 600;
	}

	.feature-tag i {
		color: var(--vnk-accent-color);
	}

	.welcome-video-teaser {
		border-radius: 32px;
		overflow: hidden;
		box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	/* FEATURED IMPACT */
	.featured-impact-section {
		position: relative;
		height: 70vh;
		min-height: 600px;
		display: flex;
		align-items: center;
		overflow: hidden;
	}

	.featured-bg {
		position: absolute;
		inset: 0;
		background-size: cover;
		background-position: center;
		filter: brightness(0.6);
	}

	.featured-card-glass {
		position: relative;
		z-index: 10;
		max-width: 500px;
		background: rgba(15, 23, 42, 0.7);
		backdrop-filter: blur(25px);
		-webkit-backdrop-filter: blur(25px);
		padding: 3rem;
		border-radius: 32px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.card-badge {
		background: var(--vnk-accent-color);
		color: #000;
		padding: 0.4rem 1rem;
		border-radius: 30px;
		font-size: 0.75rem;
		font-weight: 800;
		text-transform: uppercase;
		display: inline-block;
		margin-bottom: 1.5rem;
	}

	.featured-card-glass h3 {
		font-family: 'Outfit', sans-serif;
		font-size: 3rem;
		font-weight: 900;
		margin-bottom: 1.5rem;
		color: #fff;
	}

	.featured-card-glass p {
		color: #cbd5e1;
		line-height: 1.6;
		margin-bottom: 2.5rem;
		font-size: 1.1rem;
	}

	.btn-outline-white {
		border: 2px solid #fff;
		color: #fff;
		padding: 0.8rem 2rem;
		border-radius: 12px;
		font-weight: 700;
		transition: all 0.3s;
		display: inline-block;
	}

	.btn-outline-white:hover {
		background: #fff;
		color: #000;
		text-decoration: none !important;
	}

	/* CATEGORY EXPLORER */
	.sliders-stack {
		display: flex;
		flex-direction: column;
		gap: 6rem;
	}

	/* PREMIUM NEWSLETTER */
	.newsletter-section {
		background: #0b1120;
		position: relative;
		overflow: hidden;
	}

	.newsletter-bg-glow {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100%;
		height: 100%;
		background: radial-gradient(circle at center, rgba(34, 211, 238, 0.08) 0%, transparent 70%);
		z-index: 1;
	}

	.newsletter-card-premium {
		/* Glassmorphism Ultra */
		background: linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9));
		backdrop-filter: blur(40px);
		-webkit-backdrop-filter: blur(40px);
		border: 1px solid rgba(255, 255, 255, 0.08); /* Subtle border */
		padding: 5rem 4rem;
		border-radius: 40px;
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: 5rem;
		align-items: center;
		box-shadow:
			0 40px 80px -20px rgba(0, 0, 0, 0.5),
			inset 0 1px 1px rgba(255, 255, 255, 0.1);
	}

	.newsletter-badge {
		display: inline-block;
		font-size: 0.75rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: #22d3ee;
		background: rgba(34, 211, 238, 0.1);
		padding: 0.5rem 1rem;
		border-radius: 100px;
		margin-bottom: 2rem;
		border: 1px solid rgba(34, 211, 238, 0.2);
	}

	.newsletter-text-content h2 {
		font-family: 'Outfit', sans-serif;
		font-size: clamp(2.5rem, 4vw, 3.5rem);
		font-weight: 900;
		color: #fff;
		margin-bottom: 1.5rem;
		line-height: 1.1;
		letter-spacing: -0.02em;
	}

	.newsletter-text-content p {
		color: #94a3b8;
		font-size: 1.2rem;
		line-height: 1.7;
		max-width: 500px;
	}

	.premium-input-group {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.input-wrapper {
		display: flex;
		align-items: center;
		background: rgba(15, 23, 42, 0.6);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 20px;
		padding: 0 1.5rem;
		height: 70px;
		transition: all 0.3s;
	}

	.input-wrapper:focus-within {
		border-color: #22d3ee;
		box-shadow: 0 0 0 4px rgba(34, 211, 238, 0.15);
		background: rgba(30, 41, 59, 1);
	}

	.input-wrapper input {
		background: transparent;
		border: none;
		color: #fff;
		width: 100%;
		font-size: 1.2rem;
		padding-left: 1rem;
		outline: none;
	}

	.btn-glow-gold {
		background: linear-gradient(135deg, #fbbf24, #d97706);
		color: #0f172a;
		font-size: 1.1rem;
		padding: 1.2rem;
		border-radius: 20px;
		border: none;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 10px 30px -10px rgba(245, 158, 11, 0.5);
	}

	.btn-glow-gold:hover {
		transform: translateY(-3px);
		box-shadow: 0 20px 40px -10px rgba(245, 158, 11, 0.7);
		filter: brightness(1.1);
	}

	.newsletter-micro {
		font-size: 0.85rem;
		color: #64748b;
		margin-top: 1rem;
		text-align: center;
	}

	/* IMMERSIVE HISTORY */
	.history-promo-section {
		height: 85vh; /* Taller for impact */
		min-height: 600px;
		position: relative;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.history-bg-parallax {
		position: absolute;
		inset: 0;
		background-size: cover;
		background-position: center;
		transform: scale(1.1); /* Pre-scale for potential parallax effect */
	}

	.history-overlay-gradient {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			180deg,
			rgba(15, 23, 42, 0.1) 0%,
			rgba(15, 23, 42, 0.8) 60%,
			#0f172a 100%
		);
		z-index: 1;
	}

	.history-content-wrapper {
		position: relative;
		z-index: 10;
		width: 100%;
	}

	.history-content-centered {
		max-width: 800px;
		margin: 0 auto;
		text-align: center;
	}

	.section-kicker-gold {
		display: inline-block;
		font-family: 'Outfit', sans-serif;
		font-size: 1rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.3em;
		color: #fbbf24;
		margin-bottom: 2rem;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
	}

	.history-content-centered h2 {
		font-family: 'Outfit', sans-serif;
		font-size: clamp(3rem, 6vw, 5.5rem);
		font-weight: 900;
		line-height: 1;
		margin-bottom: 2.5rem;
		color: #fff;
		text-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
	}

	.history-content-centered p {
		font-size: 1.5rem;
		color: #e2e8f0;
		line-height: 1.6;
		margin-bottom: 4rem;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
	}

	.btn-outline-gold-large {
		display: inline-flex;
		align-items: center;
		gap: 1rem;
		border: 2px solid rgba(251, 191, 36, 0.5);
		color: #fbbf24;
		padding: 1.2rem 3rem;
		border-radius: 100px; /* Pill shape */
		font-size: 1.1rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
		background: rgba(0, 0, 0, 0.2);
	}

	.btn-outline-gold-large:hover {
		background: #fbbf24;
		color: #000;
		border-color: #fbbf24;
		box-shadow: 0 0 40px rgba(251, 191, 36, 0.4);
		transform: translateY(-2px);
		text-decoration: none;
	}

	/* MOBILE ADAPTATIONS */
	@media (max-width: 1024px) {
		.welcome-grid,
		.newsletter-card-premium {
			grid-template-columns: 1fr;
			gap: 3rem;
			padding: 3rem;
			text-align: center;
		}

		.newsletter-text-content p {
			margin: 0 auto;
		}

		.hero-stats-bar {
			display: none;
		}
	}

	@media (max-width: 600px) {
		.hero-text-box h1 {
			font-size: 3rem;
		}

		.btn-primary-neon {
			padding: 1rem 1.5rem;
		}

		.featured-card-glass,
		.newsletter-glass-card {
			padding: 2rem;
			margin: 0 1rem;
		}

		.section-padding {
			padding: 4rem 0;
		}

		.glass-input-form {
			flex-direction: column;
		}

		.glass-input-form input {
			padding: 1rem;
		}
	}
	/* NEW PREMIUM WELCOME STYLES (Moved from duplicate block) */
	.gradient-text {
		background: linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		text-fill-color: transparent;
		/* Fallback */
		color: #fff;
		filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.1));
	}

	.welcome-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: clamp(4rem, 8vw, 8rem);
		align-items: center;
		padding: 2rem 0;
	}

	.welcome-content {
		max-width: 600px; /* Constrain width for readability and aesthetic */
	}

	.welcome-features-premium {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); /* Grid for better spacing */
		gap: 1.5rem;
		margin-top: 3rem;
	}

	.feature-tag-premium {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		background: rgba(30, 41, 59, 0.6); /* Lighter, bluish dark */
		border: 1px solid rgba(255, 255, 255, 0.1);
		padding: 1.25rem 1.5rem;
		border-radius: 20px;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		backdrop-filter: blur(10px);
	}

	.feature-tag-premium:hover {
		background: rgba(30, 41, 59, 0.9);
		transform: translateY(-5px);
		border-color: rgba(34, 211, 238, 0.5);
		box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
	}

	.icon-box {
		width: 56px;
		height: 56px;
		background: linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(34, 211, 238, 0.05));
		border: 1px solid rgba(34, 211, 238, 0.2);
		color: #22d3ee;
		border-radius: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		box-shadow: 0 0 20px rgba(34, 211, 238, 0.1);
	}

	.feature-text {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.feature-text strong {
		color: #fff;
		font-family: 'Outfit', sans-serif;
		font-size: 1.15rem;
		font-weight: 700;
		letter-spacing: 0.02em;
	}

	.feature-text span {
		color: #94a3b8;
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 600;
	}

	/* Adjust video teaser to float nicely */
	.welcome-video-teaser {
		box-shadow:
			0 20px 50px -12px rgba(0, 0, 0, 0.5),
			0 0 0 1px rgba(255, 255, 255, 0.1);
		border-radius: 32px;
		overflow: hidden;
		transform: perspective(1000px) rotateY(-2deg);
		transition: transform 0.5s ease;
	}

	.welcome-video-teaser:hover {
		transform: perspective(1000px) rotateY(0deg);
	}
</style>
