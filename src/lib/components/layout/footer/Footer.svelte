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
			{ text: 'Cities', url: '/cities' },
			{ text: 'Attractions', url: '/attractions' },
			{ text: 'History', url: '/history' },
			{ text: 'Food & Drink', url: '/food-drink' },
			{ text: 'Tips', url: '/travel-tips' }
		],
		techMenuLinks: [
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
					{ text: 'Astana', url: '/cities/astana' },
					{ text: 'Almaty', url: '/cities/almaty' },
					{ text: 'Shymkent', url: '/cities/shymkent' },
					{ text: 'Nature', url: '/attractions#nature' }
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

<footer class="footer" aria-label="Site footer">
	<div class="footer-container">
		<div class="footer-content">
			<!-- Brand Section -->
			<div class="footer-brand-section">
				<a href={cfg.brand.homeUrl} class="footer-logo">
					VERYNICE<span class="tld">.&#1082;z</span>
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

			<!-- Links Section (Compact Grid) -->
			<div class="footer-links-matrix">
				<!-- Group 1: Explore -->
				<div class="link-group">
					<h4>Explore</h4>
					<ul>
						{#each cfg.footerMenuLinks as link}
							<li><a href={link.url}>{link.text}</a></li>
						{/each}
					</ul>
				</div>

				<!-- Dynamic Column Groups -->
				{#each cfg.columns as col}
					<div class="link-group">
						<h4>{col.title}</h4>
						<ul>
							{#each col.links as link}
								<li><a href={link.url}>{link.text}</a></li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</div>

		<!-- Compact Bottom Bar -->
		<div class="footer-bottom">
			<div class="copyright">
				{cfg.copyrightTemplate.replace('{year}', new Date().getFullYear())}
			</div>

			{#if cfg.techMenuLinks.length}
				<ul class="legal-links">
					{#each cfg.techMenuLinks as link}
						<li><a href={link.url}>{link.text}</a></li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</footer>

<style>
	.footer {
		background-color: rgb(17, 63, 114);
		color: #e2e8f0;
		padding: 3rem 1.5rem 1.5rem; /* Reduced padding */
		font-family: 'Inter', sans-serif;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
	}

	.footer-container {
		max-width: 1000px; /* Aligned with site layout */
		margin: 0 auto;
	}

	.footer-content {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 3rem;
		margin-bottom: 3rem;
	}

	/* Brand Section */
	.footer-brand-section {
		flex: 0 0 250px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.footer-logo {
		font-size: 1.5rem;
		font-weight: 800;
		color: #fff;
		text-decoration: none;
		letter-spacing: -0.01em;
	}

	.tld {
		color: rgb(125, 210, 251); /* Light Blue */
		font-weight: 400; /* Thinner */
		margin-left: 6px;
	}

	.footer-tagline {
		font-size: 0.95rem; /* Larger */
		color: #e2e8f0; /* Lighter */
		line-height: 1.5;
		margin: 0;
	}

	/* Socials */
	.social-links {
		display: flex;
		gap: 0.75rem;
	}

	.social-btn {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		color: #e2e8f0; /* Lighter */
		transition: color 0.2s;
	}

	.social-btn:hover {
		color: #fff;
	}

	/* Link Matrix */
	.footer-links-matrix {
		flex: 1;
		display: flex;
		justify-content: space-between; /* Spread columns nicely */
		gap: 2rem;
		min-width: 300px;
		flex-wrap: wrap;
	}

	.link-group h4 {
		color: #fff;
		font-size: 1rem; /* Larger */
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 1rem;
		opacity: 1; /* Full opacity */
	}

	.link-group ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.link-group ul li::before,
	.link-group ul li::after {
		content: none !important;
		display: none !important;
	}

	.link-group a {
		color: #e2e8f0; /* Very light gray, high contrast */
		text-decoration: none;
		font-size: 0.95rem; /* Slightly larger */
		transition: color 0.2s;
		font-weight: 400;
	}

	.link-group a:hover {
		color: #fff;
		text-decoration: underline;
	}

	/* Bottom Bar */
	.footer-bottom {
		border-top: 1px solid rgba(255, 255, 255, 0.15);
		padding-top: 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
		font-size: 0.85rem;
		color: #cbd5e1; /* Lighter than before */
	}

	.legal-links {
		display: flex;
		gap: 1.5rem;
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.legal-links a {
		color: #cbd5e1;
		text-decoration: none;
		transition: color 0.2s;
	}

	.legal-links a:hover {
		color: #fff;
	}

	/* Mobile */
	@media (max-width: 768px) {
		.footer-content {
			flex-direction: column;
			gap: 2.5rem;
		}

		.footer-brand-section {
			flex: auto;
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			padding-bottom: 2rem;
		}

		.footer-links-matrix {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 2rem 1rem;
		}

		.footer-bottom {
			flex-direction: column-reverse;
			text-align: center;
		}
	}
</style>
