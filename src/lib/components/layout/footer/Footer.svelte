<script>
	export let footerConfig = {};

	const arr = (v) => (Array.isArray(v) ? v : []);
	const sanitizeLinks = (list, fallback = []) =>
		arr(list ?? fallback)
			.map((link) => ({
				text: String(link?.text ?? link?.label ?? '').trim(),
				url: String(link?.url ?? link?.href ?? '#').trim()
			}))
			.filter((link) => link.text && link.url);

	// Social Icons Map
	const ICONS = {
		IG: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
		YT: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>`,
		TT: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>`
	};

	const DEFAULT = {
		brand: {
			siteName: 'VeryNice.kz',
			homeUrl: '/',
			logoUrl: '', // Default to text if no logo
			logoAlt: 'VeryNice.kz',
			tagline: 'Discover the heart of Central Asia.',
			description:
				'Your ultimate guide to the history, culture, and hidden gems of Kazakhstan. From the steppes to the cities, we cover it all.'
		},
		title: 'Explore', // Helper title for the primary menu
		footerMenuLinks: [
			{ text: 'Cities', url: '/destinations' },
			{ text: 'History', url: '/history' },
			{ text: 'Destinations', url: '/destinations' },
			{ text: 'Food & Drink', url: '/food-drink' },
			{ text: 'Tips', url: '/travel-tips' }
		],
		techMenuLinks: [
			{ text: 'About Us', url: '/about-us' },
			{ text: 'Privacy Policy', url: '/privacy' },
			{ text: 'Terms of Use', url: '/terms' },
			{ text: 'Contact', url: '/contact' }
		],
		social: [
			{ text: 'Instagram', url: 'https://www.instagram.com', icon: 'IG' },
			{ text: 'YouTube', url: 'https://www.youtube.com', icon: 'YT' },
			{ text: 'TikTok', url: 'https://www.tiktok.com', icon: 'TT' }
		],
		columns: [
			{
				title: 'Destinations',
				links: [
					{ text: 'Astana', url: '/destinations/astana' },
					{ text: 'Almaty', url: '/destinations/almaty' }
				]
			},
			{
				title: 'Useful Info',
				links: [
					{ text: 'Itineraries', url: '/travel-tips/itineraries' },
					{ text: 'Weather', url: '/travel-tips/weather' },
					{ text: 'Transport', url: '/travel-tips/transport' },
					{ text: 'Visas', url: '/travel-tips/visas' }
				]
			}
		],
		copyrightTemplate: '© {year} VeryNice.kz. All rights reserved.'
	};

	const sanitizeColumns = (columns) =>
		arr(columns ?? DEFAULT.columns)
			.map((column) => ({
				title: String(column?.title ?? '').trim(),
				links: sanitizeLinks(column?.links)
			}))
			.filter((column) => column.title || column.links.length);

	const sanitizeSocial = (social) =>
		arr(social ?? DEFAULT.social)
			.map((item) => ({
				text: String(item?.text ?? '').trim(),
				url: String(item?.url ?? '#').trim(),
				icon: String(item?.icon ?? item?.text?.slice(0, 2) ?? '').trim()
			}))
			.filter((item) => item.text && item.url);

	$: cfg = {
		...DEFAULT,
		...(footerConfig ?? {}),
		brand: {
			...DEFAULT.brand,
			...(footerConfig?.brand ?? {})
		},
		footerMenuLinks: sanitizeLinks(footerConfig?.footerMenuLinks, DEFAULT.footerMenuLinks),
		techMenuLinks: sanitizeLinks(footerConfig?.techMenuLinks, DEFAULT.techMenuLinks),
		social: sanitizeSocial(footerConfig?.social),
		columns: sanitizeColumns(footerConfig?.columns)
	};
</script>

<footer id="footer" class="footer" aria-label="Site footer">
	<div class="footer-container">
		<div class="footer-content">
			<!-- Brand Section -->
			<div class="footer-brand-section">
				<a
					href={cfg.brand.homeUrl}
					class="footer-logo notranslate"
					data-no-ai-translate
					translate="no"
				>
					VERYNICE<span class="logo-dot">.</span><span class="tld">kz</span>
					<span class="sun-container">
						<span class="sun-glow"></span>
						<span class="samruk-wrapper">
							<span class="samruk"></span>
						</span>
					</span>
				</a>
				<p class="footer-tagline">{cfg.brand.tagline}</p>

				{#if cfg.social.length}
					<div class="social-links">
						{#each cfg.social as social}
							<a
								href={social.url}
								target="_blank"
								rel="noopener noreferrer"
								class="social-btn"
								aria-label={social.text}
							>
								{#if ICONS[social.icon]}
									{@html ICONS[social.icon]}
								{:else}
									<span>{social.icon}</span>
								{/if}
							</a>
						{/each}
					</div>
				{/if}
			</div>

		</div>

		<!-- Bottom Bar -->
		<div class="footer-bottom">
			<div class="footer-bottom-inner">
				<a href="/about-us" class="bottom-link">About Us</a>
				{#each cfg.techMenuLinks as link}
					<span class="sep" aria-hidden="true">·</span>
					<a href={link.url} class="bottom-link">{link.text}</a>
				{/each}
				<span class="sep" aria-hidden="true">·</span>
				<button
					type="button"
					class="bottom-link cookie-pref-btn"
					on:click={() => window.dispatchEvent(new CustomEvent('openCookiePreferences'))}
				>Cookie Preferences</button>
			</div>
			<div class="copyright">
				{cfg.copyrightTemplate.replace('{year}', new Date().getFullYear())}
			</div>
		</div>
	</div>
</footer>

<style>
.footer {
  		background-color: #000000;
		color: #fff;
		padding: 0.5rem 1rem;
		font-family: 'Inter', sans-serif;
		border-top: none;
		text-align: center;
	}

	.footer-container {
		max-width: 100%;
		margin: 0 auto;
	}

	.footer-content {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	/* Brand Section */
	.footer-brand-section {
		flex: 0 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.footer-logo {
		font-size: 1rem;
		font-weight: 800;
		color: #fff !important;
		text-decoration: none;
		letter-spacing: -0.01em;
		display: inline-flex;
		align-items: center;
		white-space: nowrap;
	}

	.logo-dot {
		display: inline-block;
		color: #ffd700;
		font-size: 1.5em;
		line-height: 0;
		vertical-align: middle;
		margin-left: 6px;
		margin-right: 1px;
		position: relative;
		top: -0.05em;
	}
	.tld {
		color: #fff; /* White */
		font-weight: 400; /* Thinner */
		/* margin-left: 6px; removed */
		text-transform: lowercase; /* Ensure kz is lowercase */
	}

	/* Animated Sun & Birds */
	.sun-container {
		display: inline-flex;
		align-items: center;
		position: relative;
		vertical-align: middle;
		margin-left: 0.12em;
	}

	.sun-glow {
		display: inline-block;
		width: 0.8em; /* Scaled up */
		height: 0.8em;
		background: radial-gradient(circle, #daa520 0%, #b8860b 50%, rgba(218, 165, 32, 0) 100%);
		border-radius: 50%;
		position: relative;
		top: -0.45em;
		pointer-events: none;
		animation: sun-shimmer 4s infinite ease-in-out;
		filter: blur(1px);
	}

	.samruk-wrapper {
		position: absolute;
		top: -0.1em;
		left: 0.05em;
		pointer-events: none;
		animation: soar-arc 5s infinite ease-in-out alternate;
		z-index: 2;
	}

	.samruk {
		display: block;
		width: 0.7em; /* Scaled back for elegance */
		height: 0.35em;
		background: #ffff00; /* Reverted to bright yellow */
		clip-path: path('M0,0 C5,3 10,5 15,0 C20,5 25,3 30,0 L15,3 L0,0');
		opacity: 1;
		filter: drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.5));
		animation: flap 0.4s infinite alternate ease-in-out;
	}

	@keyframes flap {
		0% {
			transform: scaleY(1);
		}
		100% {
			transform: scaleY(0.4);
		}
	}

	@keyframes soar-arc {
		0% {
			/* Start position */
			transform: translate(0.05em, 0.5em) rotate(-20deg) scale(1);
			opacity: 1;
		}
		100% {
			/* End position - no longer fades or shrinks */
			transform: translate(0.65em, 0.1em) rotate(0deg) scale(0.9);
			opacity: 1;
		}
	}

	@keyframes sun-shimmer {
		0%,
		100% {
			transform: scale(0.85);
			opacity: 0.7;
			box-shadow: 0 0 15px #daa520;
			filter: blur(1px) brightness(1.2);
		}
		50% {
			transform: scale(1.1);
			opacity: 1;
			box-shadow:
				0 0 45px #daa520,
				0 0 90px #b8860b,
				0 0 120px rgba(218, 165, 32, 0.5);
			filter: blur(2px) brightness(1.5);
		}
	}

	.footer-tagline {
		color: #fff;
		line-height: 1.2;
		margin: 0;
		display: none;
	}

	/* Socials */
	.social-links {
		display: flex;
		justify-content: center;
		gap: 0.25rem;
	}

	.social-btn {
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		transition: color 0.2s;
	}

	.social-btn:hover {
		color: #fff;
	}

	/* Link Matrix */
	.footer-links-matrix {
		flex: 0 0 auto;
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		min-width: auto;
		flex-wrap: wrap;
	}

	.link-group h4 {
		color: #fff !important;
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin-bottom: 0.15rem;
		opacity: 1;
	}

	.link-group ul {
		list-style: none;
		list-style-type: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.link-group ul li {
		list-style: none;
		list-style-type: none;
	}

	.link-group ul li::before,
	.link-group ul li::after {
		content: none !important;
		display: none !important;
	}

	.link-group ul li::marker {
		display: none !important;
		content: none !important;
	}

	.link-group a {
		color: #fff !important;
		text-decoration: none;
		font-size: 0.6rem;
		transition: color 0.2s;
		font-weight: 400;
	}

	.link-group a:hover {
		color: #fff;
		text-decoration: underline;
	}

	/* Bottom Bar */
	.footer-bottom {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		padding-top: 0.25rem;
	}

	.footer-bottom-inner {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.4rem;
		font-size: 0.72rem;
	}

	.copyright {
		color: rgba(255,255,255,0.55);
		font-size: 0.68rem;
		white-space: nowrap;
	}

	.sep {
		color: rgba(255,255,255,0.3);
		font-size: 0.65rem;
	}

	.bottom-link {
		color: #fff !important;
		text-decoration: none;
		white-space: nowrap;
		transition: opacity 0.15s;
		font-size: 0.72rem;
	}

	.bottom-link:hover {
		opacity: 0.75;
		text-decoration: underline;
	}

	/* Cookie preferences button inherits bottom-link styles but resets button defaults */
	.cookie-pref-btn {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		font-family: inherit;
	}

	/* Mobile */
	@media (max-width: 768px) {
		.footer {
			padding: 0.5rem 0.5rem;
			padding-bottom: calc(6rem + max(0px, env(safe-area-inset-bottom)));
		}

		.footer-content {
			flex-direction: column;
			gap: 0.5rem;
		}

		.footer-brand-section {
			flex: auto;
			border-bottom: none;
			padding-bottom: 0.5rem;
		}

		.footer-bottom-inner {
			justify-content: center;
		}
	}
</style>
