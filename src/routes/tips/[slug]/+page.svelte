<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { getCloudinaryUrl } from '$lib/utils/cloudinary';
	import { processContent } from '$lib/utils/markdown';
	import { sanitizeHTML } from '$lib/utils/sanitize';

	export let data;

	const { tip, page: pageData } = data;

	// Tab state for Best Time page
	let activeTab = 'seasons';
	
	// Tab state for Money page
	let moneyTab = 'currency';
	// Tab state for Safety page
	let safetyTab = 'overview';
	// Tab state for Visa page
	let visaTab = 'types';
	// Country selection for visa checker
	let selectedNationality = '';
	const nationalities = [
		{ code: 'eu', name: 'EU Member States', visaType: 'free', stay: '30 days' },
		{ code: 'us', name: 'United States', visaType: 'free', stay: '30 days' },
		{ code: 'uk', name: 'United Kingdom', visaType: 'free', stay: '30 days' },
		{ code: 'ca', name: 'Canada', visaType: 'free', stay: '30 days' },
		{ code: 'au', name: 'Australia', visaType: 'free', stay: '30 days' },
		{ code: 'jp', name: 'Japan', visaType: 'free', stay: '30 days' },
		{ code: 'kr', name: 'South Korea', visaType: 'free', stay: '30 days' },
		{ code: 'sg', name: 'Singapore', visaType: 'free', stay: '30 days' },
		{ code: 'tr', name: 'Turkey', visaType: 'free', stay: '30 days' },
		{ code: 'ae', name: 'United Arab Emirates', visaType: 'free', stay: '30 days' },
		{ code: 'ch', name: 'Switzerland / Norway / Iceland', visaType: 'free', stay: '30 days' },
		{ code: 'br', name: 'Brazil / Argentina / Mexico', visaType: 'free', stay: '30 days' },
		{ code: 'mn', name: 'Mongolia', visaType: 'free', stay: '30 days' },
		{ code: 'ua', name: 'Ukraine / Georgia / Azerbaijan', visaType: 'free', stay: '30 days' },
		{ code: 'my', name: 'Malaysia', visaType: 'free', stay: '30 days' },
		{ code: 'ru', name: 'Russia (CIS)', visaType: 'cis', stay: 'Unlimited' },
		{ code: 'by', name: 'Belarus (CIS)', visaType: 'cis', stay: 'Unlimited' },
		{ code: 'kg', name: 'Kyrgyzstan (CIS)', visaType: 'cis', stay: 'Unlimited' },
		{ code: 'uz', name: 'Uzbekistan (CIS)', visaType: 'cis', stay: '30 days' },
		{ code: 'tj', name: 'Tajikistan (CIS)', visaType: 'cis', stay: '30 days' },
		{ code: 'am', name: 'Armenia (CIS)', visaType: 'cis', stay: '30 days' },
		{ code: 'cn', name: 'China', visaType: 'evisa', stay: '30 days', fee: '~$35' },
		{ code: 'in', name: 'India', visaType: 'evisa', stay: '30 days', fee: '~$40' },
		{ code: 'za', name: 'South Africa', visaType: 'evisa', stay: '30 days', fee: '~$35' },
		{ code: 'sa', name: 'Saudi Arabia / Gulf states', visaType: 'evisa', stay: '30 days', fee: '~$30' },
		{ code: 'vn', name: 'Vietnam / Thailand / Indonesia', visaType: 'evisa', stay: '30 days', fee: '~$35' },
		{ code: 'ng', name: 'Nigeria / Ghana / Kenya', visaType: 'evisa', stay: '30 days', fee: '~$50-80' },
		{ code: 'pk', name: 'Pakistan / Bangladesh', visaType: 'evisa', stay: '30 days', fee: '~$40' },
		{ code: 'ir', name: 'Iran', visaType: 'evisa', stay: '30 days', fee: '~$35' },
		{ code: 'other', name: 'Other Country', visaType: 'check', stay: 'Check' }
	];
	function getVisaInfo(code) {
		return nationalities.find(n => n.code === code) || { name: 'Unknown', visaType: 'check', stay: 'Check' };
	}
	
	const tabs = [
		{ id: 'seasons', label: 'By Season' },
		{ id: 'regions', label: 'By Region' },
		{ id: 'activities', label: 'By Activity' },
		{ id: 'events', label: 'Festivals' }
	];

	// Data driven from Firestore (tip.*) with hardcoded fallback
	const months      = tip.months   || [
		{ label: 'Jan', temp: -10, height: 16, quality: 2, color: '#B5D4F4', type: 'cold', desc: 'Cold, short days' },
		{ label: 'Feb', temp: -8,  height: 16, quality: 2, color: '#B5D4F4', type: 'cold', desc: 'Cold, skiing season' },
		{ label: 'Mar', temp: 4,   height: 28, quality: 4, color: '#C0DD97', type: 'transitional', desc: 'Nowruz, spring begins' },
		{ label: 'Apr', temp: 14,  height: 46, quality: 5, color: '#97C459', type: 'good', desc: 'Blooming, pleasant' },
		{ label: 'May', temp: 22,  height: 64, quality: 5, color: '#38BC7D', type: 'best', desc: 'Best - green valleys' },
		{ label: 'Jun', temp: 29,  height: 80, quality: 5, color: '#38BC7D', type: 'best', desc: 'Best - long days' },
		{ label: 'Jul', temp: 33,  height: 88, quality: 3, color: '#F0997B', type: 'hot',  desc: 'Hot, peak season' },
		{ label: 'Aug', temp: 31,  height: 84, quality: 3, color: '#F0997B', type: 'hot',  desc: 'Hot, summer vibes' },
		{ label: 'Sep', temp: 21,  height: 68, quality: 5, color: '#38BC7D', type: 'best', desc: 'Best - fall colors' },
		{ label: 'Oct', temp: 10,  height: 46, quality: 4, color: '#C0DD97', type: 'good', desc: 'Golden autumn' },
		{ label: 'Nov', temp: -1,  height: 26, quality: 2, color: '#85B7EB', type: 'transitional', desc: 'Getting cold' },
		{ label: 'Dec', temp: -8,  height: 16, quality: 2, color: '#B5D4F4', type: 'cold', desc: 'Winter, holidays' }
	];
	const seasons     = tip.seasons  || [];
	const regions     = tip.regions  || [];
	const festivals   = tip.festivals || [];

	// Tab state for Transport page
	let transportTab = 'flying';
	
	const transportTabs = [
		{ id: 'flying', label: 'Flying In' },
		{ id: 'trains', label: 'Trains' },
		{ id: 'domestic', label: 'Domestic Flights' },
		{ id: 'cities', label: 'Within Cities' },
		{ id: 'road', label: 'Road Trips' }
	];

	// Transport data — driven from Firestore (tip.*) with hardcoded fallback
	const airports = tip.airports || [
		{ code: 'ALA', name: 'Almaty', city: 'Almaty', distance: '15 km', taxi: '~2,500 KZT (~$5)', airlines: ['Air Astana', 'Turkish Airlines', 'Emirates', 'Lufthansa', 'flydubai', 'FlyArystan', 'Pegasus'], highlight: 'Most connections' },
		{ code: 'NQZ', name: 'Astana', city: 'Astana', distance: '17 km', taxi: '~3,000 KZT (~$6)', airlines: ['Air Astana', 'Turkish Airlines', 'Air Arabia', 'FlyArystan', 'SCAT'], highlight: 'New Terminal 2 (2024)' }
	];
	const otherAirports   = tip.otherAirports   || [
		{ code: 'GUW', name: 'Atyrau',    best: 'Oil hub, Moscow/Dubai' },
		{ code: 'CIT', name: 'Shymkent', best: 'Southern gateway' },
		{ code: 'AKX', name: 'Aktobe',   best: 'Western KZ, Russia' },
		{ code: 'SCO', name: 'Aktau',    best: 'Mangystau, Caspian' }
	];
	const trainRoutes     = tip.trainRoutes     || [
		{ from: 'Almaty', to: 'Astana',   duration: '12-20 hours', price: '8,000–15,000 KZT (~$17–32)' },
		{ from: 'Almaty', to: 'Shymkent', duration: '15-18 hours', price: '6,000–12,000 KZT (~$13–25)' },
		{ from: 'Astana', to: 'Shymkent', duration: '20-24 hours', price: '10,000–18,000 KZT (~$21–38)' }
	];
	const domesticRoutes  = tip.domesticRoutes  || [
		{ from: 'Almaty', to: 'Astana',   duration: '1.5 hours', price: '15,000–30,000 KZT (~$32–63)' },
		{ from: 'Almaty', to: 'Shymkent', duration: '1 hour',    price: '12,000–25,000 KZT (~$25–53)' },
		{ from: 'Astana', to: 'Shymkent', duration: '1.5 hours', price: '15,000–28,000 KZT (~$32–59)' }
	];
	const cities          = tip.cities          || [
		{ name: 'Almaty', features: ['Metro - 1 line', 'Buses/Trolleybuses', 'Yandex Go dominant', 'Bolt available in Almaty', 'inDrive budget option'], icon: '🏙️' },
		{ name: 'Astana', features: ['LRT (newly launched) — city light rail', 'Extensive bus network', 'Yandex Go & inDrive', 'New city, wide sidewalks', 'Modern infrastructure'], icon: '🏗️' }
	];
	const tips            = tip.transportTips   || [
		'Download Yandex Go and Yandex Maps before arrival — more accurate than Google in Kazakhstan',
		'Get a local SIM (Kcell/Activ or Beeline) at the airport — essential for apps and navigation',
		'Book trains at tickets.kz — English available, book early for overnight routes',
		'Use FlyArystan for budget domestic flights — saves time over long train journeys',
		'Keep cash (KZT) for rural areas, national parks, and minibuses'
	];

	const defaultPage = {
		seo: {
			title: 'Travel Tip | VeryNice',
			description: 'Essential travel tip for your Kazakhstan adventure.'
		},
		mainTitle: 'Travel Tip',
		headerDescription: 'Essential travel information for Kazakhstan.',
		heroKicker: 'Travel Tip',
		location: 'Kazakhstan',
		articleViews: 0,
		articleLikes: 0,
		articleComments: 0,
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Travel Tips', href: '/tips' }
		],
		headerBackgroundPublicId: 'site/backgrounds/attractions-hero'
	};

	let resolvedPage = { ...defaultPage, ...(pageData ?? {}) };

	const fallbackBreadcrumbs = [
		{ label: 'Home', href: '/' },
		{ label: 'Travel Tips', href: '/tips' }
	];

	const breadcrumbs = (pageData?.breadcrumbs && pageData.breadcrumbs.length > 0)
		? pageData.breadcrumbs.map((c: any) => ({
				label: c.label ?? c.title ?? '',
				href: c.href ?? c.url ?? null
			}))
		: fallbackBreadcrumbs;

	const getHeroImage = () => {
		const publicId =
			tip?.image?.publicId ||
			tip?.imagePublicId ||
			tip?.publicId ||
			resolvedPage?.headerBackgroundPublicId ||
			'site/backgrounds/attractions-hero';
		return getCloudinaryUrl(publicId, {
			width: 2200,
			height: 1200,
			crop: 'fill',
			gravity: 'auto',
			quality: 'auto:good',
			fetch_format: 'auto'
		});
	};

	let windowWidth = 1200;

	onMount(() => {
		document.body.classList.add('premium-theme-page');
		return () => document.body.classList.remove('premium-theme-page');
	});
</script>

<svelte:window bind:innerWidth={windowWidth} />

<svelte:head>
	<title>{tip?.seo?.title || resolvedPage?.seo?.title || 'Travel Tip | VeryNice'}</title>
	<meta name="description" content={tip?.seo?.description || resolvedPage?.seo?.description || 'Essential travel tip for Kazakhstan.'} />
	<link rel="canonical" href="https://verynice.kz/tips/{page.params.slug}" />
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://verynice.kz/tips/{page.params.slug}" />
	<meta property="og:title" content={tip?.seo?.title || resolvedPage?.seo?.title || 'Travel Tip | VeryNice'} />
	<meta property="og:description" content={tip?.seo?.description || resolvedPage?.seo?.description || 'Essential travel tip for Kazakhstan.'} />
	<meta property="og:image" content="https://verynice.kz/assets/og-cover.jpg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={tip?.seo?.title || resolvedPage?.seo?.title || 'Travel Tip | VeryNice'} />
	<meta name="twitter:description" content={tip?.seo?.description || resolvedPage?.seo?.description || 'Essential travel tip for Kazakhstan.'} />
</svelte:head>

{#if tip}
	<section id="page-hero-section" class="section" style="min-height: 100vh !important; height: 100vh !important;">
		<div class="section-header wrapper">
			<nav aria-label="Breadcrumb" class="breadcrumb-modern">
				<ol class="breadcrumb-modern__list">
					{#each breadcrumbs as crumb, index}
						<li class="breadcrumb-modern__item">
							{#if crumb.href && index !== breadcrumbs.length - 1}
								<a class="breadcrumb-modern__link" href={crumb.href}>{crumb.label}</a>
							{:else}
								<span class="breadcrumb-modern__current" aria-current="page">{crumb.label}</span>
							{/if}
							{#if index < breadcrumbs.length - 1}
								<span class="breadcrumb-modern__divider" aria-hidden="true"></span>
							{/if}
						</li>
					{/each}
				</ol>
			</nav>
			<div class="section-header-content-row">
				<div class="section-header-text">
					{#if resolvedPage?.heroKicker}
						<span class="hero-kicker">{resolvedPage.heroKicker}</span>
					{/if}
					<h1 itemprop="headline">{tip.title || resolvedPage.mainTitle}</h1>
					{#if tip.description}
						<p class="section-description" itemprop="description">{tip.description}</p>
					{/if}
					<div class="post-info" role="group" aria-label="Article statistics">
						{#if resolvedPage.location}
							<div class="post-info-inner" aria-label="Location: {resolvedPage.location}">
								<span class="icon-location" aria-hidden="true"></span>
								<div class="post-info-content">{resolvedPage.location}</div>
							</div>
						{/if}
						{#if resolvedPage.articleViews > 0}
							<div class="post-info-inner" aria-label="{resolvedPage.articleViews} views">
								<span class="icon-view" aria-hidden="true"></span>
								<div class="post-info-content">{resolvedPage.articleViews.toLocaleString()}</div>
							</div>
						{/if}
						{#if resolvedPage.articleLikes > 0}
							<div class="post-info-inner" aria-label="{resolvedPage.articleLikes} likes">
								<span class="icon-like" aria-hidden="true"></span>
								<div class="post-info-content">{resolvedPage.articleLikes.toLocaleString()}</div>
							</div>
						{/if}
						{#if resolvedPage.articleComments > 0}
							<div class="post-info-inner" aria-label="{resolvedPage.articleComments} comments">
								<span class="icon-comment" aria-hidden="true"></span>
								<div class="post-info-content">{resolvedPage.articleComments.toLocaleString()}</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
		<div
			class="header-background"
			role="img"
			aria-label={tip?.title || 'Travel tip background'}
			style={`--hero-bg-url: url("${getHeroImage()}")`}
		><div class="background-image"></div></div>
	</section>

	<div class="content-container">
		<div class="content-wrapper">
			<article class="tip-content">
				{#if tip.id === 'best-time-to-visit'}
					<!-- Interactive Best Time to Visit Tabs -->
					<p class="lead-text">Kazakhstan spans 2.7 million km² — roughly the size of Western Europe, making it the ninth-largest country on Earth. Its vast territories encompass wildly varying climates, from the snow-capped peaks of Tian Shan in the southeast rising to 7,000m, to the sun-scorched Caspian desert plains in the west sitting below sea level. This geographical diversity creates remarkable temperature extremes: summer heat can reach 45°C in the deserts while winter plummets to -40°C in the northern steppes, a swing of nearly 85°C across the calendar year. The country's nine distinct climate zones mean thoughtful packing is essential: breathable layers for mountain treks in Medeu and Shymbulak, sun protection and hydration for camel treks through Mangystau's moonscape valleys, and serious winter insulation for Astana's bone-chilling cold. Whether you're chasing wildflowers in the alpine meadows of Kolsai Lakes, witnessing golden eagles dive at the annual festival, or bathing in natural hot springs near Almaty, timing your visit to the right season transforms the experience entirely.</p>

					<div class="highlight-box">
						<p><strong>Key Takeaway:</strong> <strong>May–June</strong> and <strong>September</strong> are the universally best months.</p>
					</div>

					<!-- Month Temperature Chart -->
					<h3>Temperature Overview</h3>
					<div class="month-grid">
						{#each months as m}
							<div class="month-col">
								<span class="month-label">{m.label}</span>
								<div class="month-bar" class:best={m.type === 'best'} style="height: {m.height}px; background: {m.color};"></div>
								<span class="month-temp">{m.temp}°</span>
								<span class="month-desc">{m.desc}</span>
							</div>
						{/each}
					</div>

					<!-- Tab Navigation -->
					<div class="tab-bar">
						{#each tabs as tab}
							<button class="tab-btn" class:active={activeTab === tab.id} on:click={() => activeTab = tab.id}>
								{tab.label}
							</button>
						{/each}
					</div>

					<!-- Tab Panels -->
					{#if activeTab === 'seasons'}
						<div class="tab-panel">
							<div class="season-cards">
								{#each seasons as season}
									<div class="season-card" class:best={season.best}>
										{#if season.badge}
											<div class="best-badge">{season.badge}</div>
										{/if}
										<div class="season-header">
											<div class="season-icon">{season.icon}</div>
											<div>
												<div class="season-name">{season.name}</div>
												<div class="season-months">{season.months}</div>
											</div>
										</div>
										<div class="season-temp" style="color: {season.color}">{season.range}</div>
										<p class="season-desc">{season.desc}</p>
										<ul class="season-pros">
											{#each season.pros as pro}
												<li>
													<div class="pro-dot" class:dot-green={pro.type === 'good'} class:dot-red={pro.type === 'bad'}></div>
													{pro.text}
												</li>
											{/each}
										</ul>
									</div>
								{/each}
							</div>
						</div>
					{:else if activeTab === 'regions'}
						<div class="tab-panel">
							<div class="region-intro">
								<p>Kazakhstan spans 2.7 million km² — climate varies wildly across regions.</p>
							</div>
							<table class="region-table">
								<thead>
									<tr>
										<th>Region</th>
										<th>Best Time</th>
										<th>Spring</th>
										<th>Summer</th>
										<th>Autumn</th>
										<th>Winter</th>
									</tr>
								</thead>
								<tbody>
									{#each regions as r}
										<tr>
											<td>
												<strong>{r.name}</strong>
												<span class="region-desc">{r.desc}</span>
											</td>
											<td class="best-time">{r.best}</td>
											<td>{'⭐'.repeat(r.spring)}</td>
											<td>{'⭐'.repeat(r.summer)}</td>
											<td>{'⭐'.repeat(r.autumn)}</td>
											<td>{'⭐'.repeat(r.winter)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else if activeTab === 'activities'}
						<div class="tab-panel">
							<div class="activity-grid">
								<div class="activity-card"><span class="activity-icon">🏔️</span><h4>Trekking</h4><p>May–Oct</p></div>
								<div class="activity-card"><span class="activity-icon">⛷️</span><h4>Skiing</h4><p>Dec–Mar</p></div>
								<div class="activity-card"><span class="activity-icon">🏜️</span><h4>Canyons</h4><p>Apr–Jun, Sep–Oct</p></div>
								<div class="activity-card"><span class="activity-icon">🦅</span><h4>Eagle Festivals</h4><p>Sep–Oct</p></div>
								<div class="activity-card"><span class="activity-icon">🚴</span><h4>Cycling</h4><p>May–Sep</p></div>
								<div class="activity-card"><span class="activity-icon">🏊</span><h4>Swimming</h4><p>Jun–Aug</p></div>
								<div class="activity-card"><span class="activity-icon">📸</span><h4>Photography</h4><p>May–Jun, Sep–Oct</p></div>
								<div class="activity-card"><span class="activity-icon">🐎</span><h4>Horse Riding</h4><p>May–Oct</p></div>
								<div class="activity-card"><span class="activity-icon">🌿</span><h4>Nomad Camps</h4><p>Jun–Aug</p></div>
								<div class="activity-card"><span class="activity-icon">🦅</span><h4>Falconry</h4><p>Sep–Nov</p></div>
								<div class="activity-card"><span class="activity-icon">🎿</span><h4>Snow Sports</h4><p>Dec–Feb</p></div>
								<div class="activity-card"><span class="activity-icon">♨️</span><h4>Hot Springs</h4><p>Year-round</p></div>
							</div>
						</div>
					{:else if activeTab === 'events'}
						<div class="tab-panel">
							<div class="festival-intro">
								<p>Experience Kazakhstan's rich cultural traditions throughout the year.</p>
							</div>
							<table class="festival-table">
								<thead>
									<tr><th>Month</th><th>Festival</th><th>Description</th><th>Location</th></tr>
								</thead>
								<tbody>
									{#each festivals as f}
										<tr>
											<td><strong>{f.month}</strong></td>
											<td class="festival-name">{f.name}</td>
											<td>{f.desc}</td>
											<td>{f.location}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}

					<div class="pro-tips">
						<h3>Pro Tips</h3>
						<ol>
							<li><strong>Book ahead</strong> for May–June & September</li>
							<li><strong>Astana is coldest</strong> — can hit -35°C</li>
							<li><strong>Mangystau</strong> best in spring/autumn</li>
							<li><strong>Shymbulak</strong> opens Dec–March</li>
						</ol>
					</div>
				{:else if tip.id === 'getting-there-around'}
					<!-- Transport Guide Tabs -->
					<p class="lead-text">Two international hubs, a vast rail network, domestic flights, shared taxis, and modern ride-hailing — Kazakhstan has more transport options than most travellers expect. From budget-friendly trains crossing the steppe to direct flights connecting Almaty with Istanbul, Dubai, and Frankfurt, getting around this vast country is easier than you think.</p>

					<div class="quick-facts">
						<div class="fact-item"><strong>2</strong> int'l airports</div>
						<div class="fact-item"><strong>16</strong> domestic airports</div>
						<div class="fact-item"><strong>15,000 km</strong> rail network</div>
						<div class="fact-item"><strong>~$0.50/L</strong> petrol (~220 KZT)</div>
					</div>

					<!-- Transport Tab Navigation -->
					<div class="tab-bar">
						{#each transportTabs as tab}
							<button class="tab-btn" class:active={transportTab === tab.id} on:click={() => transportTab = tab.id}>
								{tab.label}
							</button>
						{/each}
					</div>

					<!-- Transport Tab Panels -->
					{#if transportTab === 'flying'}
						<div class="tab-panel">
							<h3>Primary International Gateways</h3>
							<div class="airport-grid">
								{#each airports as airport}
									<div class="airport-card">
										<div class="airport-header">
											<span class="airport-code">{airport.code}</span>
												<h4>{airport.name}</h4>
										</div>
										<p class="airport-highlight">{airport.highlight}</p>
										<div class="airport-details">
											<div class="detail-row"><span>Distance</span><span>{airport.distance} to city</span></div>
											<div class="detail-row"><span>Taxi</span><span>{airport.taxi}</span></div>
										</div>
										<div class="airlines-section">
											<h5>Airlines:</h5>
											<p>{airport.airlines.join(', ')}</p>
										</div>
									</div>
								{/each}
							</div>

							<h4>Other Airports</h4>
							<div class="other-airports">
								{#each otherAirports as a}
									<div class="other-airport-item">
									<span class="oa-code">{a.code}</span>
									<span class="oa-name">{a.name}</span>
									<span class="oa-best">{a.best}</span>
								</div>
								{/each}
							</div>

							<div class="warning-box">
								<p><strong>Visa Tip:</strong> 65+ nationalities get visa-free entry (30 days). Check evisa.mfa.gov.kz for e-Visa.</p>
							</div>
						</div>
					{:else if transportTab === 'trains'}
						<div class="tab-panel">
							<h3>Train Network (KTZ)</h3>
							<p>Kazakhstan's rail network is extensive and affordable. Book via tickets.kz</p>
							<table class="route-table">
								<thead><tr><th>Route</th><th>Duration</th><th>Price (KZT)</th></tr></thead>
								<tbody>
									{#each trainRoutes as r}
										<tr><td>{r.from} → {r.to}</td><td>{r.duration}</td><td>{r.price}</td></tr>
									{/each}
								</tbody>
							</table>
							<div class="pro-tips">
								<h4>Train Tips</h4>
								<ul>
									<li>Book via tickets.kz — English available</li>
									<li>Overnight trains save accommodation</li>
									<li>Second class is comfortable</li>
									<li>Bring your own food and water</li>
								</ul>
							</div>
						</div>
					{:else if transportTab === 'domestic'}
						<div class="tab-panel">
							<h3>Domestic Flights</h3>
							<div class="airlines-grid">
								<div class="airline-card"><strong>Air Astana</strong><span>Premium full-service</span></div>
								<div class="airline-card"><strong>FlyArystan</strong><span>Budget carrier</span></div>
								<div class="airline-card"><strong>SCAT Airlines</strong><span>Regional routes</span></div>
							</div>
							<table class="route-table">
								<thead><tr><th>Route</th><th>Duration</th><th>Price (KZT)</th></tr></thead>
								<tbody>
									{#each domesticRoutes as r}
										<tr><td>{r.from} → {r.to}</td><td>{r.duration}</td><td>{r.price}</td></tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else if transportTab === 'cities'}
						<div class="tab-panel">
							<h3>Within Cities</h3>
							<div class="city-grid">
								{#each cities as city}
									<div class="city-card">
										<h4>{city.icon} {city.name}</h4>
										<ul>
											{#each city.features as f}
												<li>{f}</li>
											{/each}
										</ul>
									</div>
								{/each}
							</div>
						</div>
					{:else if transportTab === 'road'}
						<div class="tab-panel">
							<h3>Road Trips</h3>
							<div class="road-info">
								<div class="road-item"><strong>IDP</strong> recommended alongside national licence</div>
								<div class="road-item"><strong>Traffic</strong> Right-hand side</div>
								<div class="road-item"><strong>Petrol</strong> ~$0.50/litre (~220 KZT)</div>
								<div class="road-item"><strong>Roads</strong> Good in cities, variable outside; SUV recommended for mountains</div>
							</div>
							<div class="pro-tips">
								<h4>Car Rental</h4>
								<ul>
									<li>Available at airports and cities</li>
								<li>Requirements: Passport, license, credit card</li>
								<li>Age: Usually 21+ (sometimes 23+)</li>
								<li>SUV recommended for mountain roads</li>
								</ul>
							</div>
						</div>
					{/if}

					<div class="pro-tips">
						<h3>Transport Pro Tips</h3>
						<ol>
							{#each tips as tip}
								<li>{tip}</li>
							{/each}
						</ol>
					</div>
				{:else if tip.id === 'money-costs-tips'}
					<p class="lead-text">Your Wallet in Kazakhstan — One of Central Asia's most affordable destinations — but knowing where cash is king, where cards work, and what things actually cost will save you money and hassle from day one.</p>

					<div class="quick-facts">
						<div class="fact-item"><strong>KZT</strong>Currency</div>
						<div class="fact-item"><strong>$25+</strong>Daily budget</div>
						<div class="fact-item"><strong>Cash</strong>Essential</div>
						<div class="fact-item"><strong>ATMs</strong>Widely available</div>
					</div>

					<div class="tab-bar">
						<button class="tab-btn" class:active={moneyTab === 'currency'} on:click={() => moneyTab = 'currency'}>Currency</button>
						<button class="tab-btn" class:active={moneyTab === 'budget'} on:click={() => moneyTab = 'budget'}>Budget</button>
						<button class="tab-btn" class:active={moneyTab === 'costs'} on:click={() => moneyTab = 'costs'}>Costs</button>
						<button class="tab-btn" class:active={moneyTab === 'paying'} on:click={() => moneyTab = 'paying'}>Paying</button>
						<button class="tab-btn" class:active={moneyTab === 'practical'} on:click={() => moneyTab = 'practical'}>Practical</button>
					</div>

					{#if moneyTab === 'currency'}
						<div class="tab-panel">
							<h3>Exchange Rates</h3>
							<p class="rate-note">Always check live rates — the tenge fluctuates. Use <strong>kurs.kz</strong>, Google, XE.com, or your bank app before you travel. Rates above are approximate.</p>
							<table class="price-table"><thead><tr><th>Currency</th><th>Rate (approx)</th><th>Notes</th></tr></thead><tbody><tr><td>🇺🇸 USD → KZT</td><td>~470–490</td><td>1 USD ≈ 475 KZT (check live)</td></tr><tr><td>🇪🇺 EUR → KZT</td><td>~510–530</td><td>1 EUR ≈ 520 KZT (check live)</td></tr><tr><td>🇬🇧 GBP → KZT</td><td>~600–620</td><td>1 GBP ≈ 610 KZT (check live)</td></tr><tr><td>🇷🇺 RUB → KZT</td><td>~5–6</td><td>1 RUB ≈ 5.5 KZT (volatile)</td></tr><tr><td>🇨🇳 CNY → KZT</td><td>~65–70</td><td>1 CNY ≈ 67 KZT (check live)</td></tr></tbody></table>
							<h3>Where to Exchange</h3>
							<table class="price-table"><thead><tr><th>Method</th><th>Rate Quality</th><th>Notes</th></tr></thead><tbody><tr><td>Exchange booths (obmennik)</td><td>Best rates</td><td>Everywhere in cities — compare a few before exchanging</td></tr><tr><td>Bank branch exchange</td><td>Good rates</td><td>Reliable and official — slower but trustworthy</td></tr><tr><td>ATM withdrawal</td><td>Decent</td><td>Kaspi, Halyk, ForteBank ATMs. Check foreign card fees.</td></tr><tr><td>Airport exchange</td><td>Below average</td><td>Only change enough for taxi/SIM on arrival</td></tr><tr><td>Hotel desk</td><td>Poor rates</td><td>Last resort only</td></tr></tbody></table>
							<div class="warning-box"><p><strong>Pro tip:</strong> USD and EUR are the most widely accepted foreign currencies at exchange booths. Bring crisp, undamaged bills — booths may refuse old, torn, or marked notes.</p></div>
						</div>
					{:else if moneyTab === 'budget'}
						<div class="tab-panel">
							<h3>Daily Budget</h3>
							<div class="budget-grid"><div class="budget-card budget-backpacker"><h4>Backpacker</h4><div class="budget-price">$25–40<span>/day</span></div><ul><li>Hostel dorm: 3,000–5,000 KZT</li><li>Food: 2,000–4,000 KZT</li><li>Transport: 500–1,000 KZT</li><li>Activities: Mostly free sights</li></ul></div><div class="budget-card budget-midrange"><h4>Mid-range</h4><div class="budget-price">$60–120<span>/day</span></div><ul><li>3-star hotel: 15,000–30,000 KZT</li><li>Restaurants: 5,000–10,000 KZT</li><li>App taxis: 2,000–4,000 KZT</li><li>Tours + entrance fees</li></ul></div><div class="budget-card budget-luxury"><h4>Comfort / Luxury</h4><div class="budget-price">$150–300+<span>/day</span></div><ul><li>4–5 star: 40,000–100,000 KZT</li><li>Fine dining: 15,000–30,000 KZT</li><li>Rental car / transfers</li><li>Private guides, heli-tours</li></ul></div></div>
							<div class="pro-tips"><h4>Great value destination</h4><p>Kazakhstan is significantly cheaper than Western Europe or East Asia at comparable quality levels. A mid-range hotel that would cost $250 in London runs $60–80 in Almaty.</p></div>
						</div>
					{:else if moneyTab === 'costs'}
						<div class="tab-panel">
							<h3>Cost Comparison at a Glance</h3>
							<table class="price-table"><thead><tr><th>Item</th><th>KZT</th><th>USD</th></tr></thead><tbody><tr><td>Espresso / coffee</td><td>600–900</td><td>$1.20–1.80</td></tr><tr><td>Local beer (bar)</td><td>800–1,500</td><td>$1.60–3.00</td></tr><tr><td>Street food / samsa</td><td>200–400</td><td>$0.40–0.80</td></tr><tr><td>Restaurant meal (mid)</td><td>3,000–6,000</td><td>$6–12</td></tr><tr><td>Shymkent laghman (café)</td><td>1,200–1,800</td><td>$2.40–3.60</td></tr><tr><td>1L bottled water</td><td>150–300</td><td>$0.30–0.60</td></tr><tr><td>City taxi (app, 5km)</td><td>600–1,200</td><td>$1.20–2.40</td></tr><tr><td>Metro ride (Almaty)</td><td>100</td><td>$0.20</td></tr><tr><td>Petrol (1 litre)</td><td>~220</td><td>~$0.44</td></tr></tbody></table>
							<h3>Food & Drink</h3>
							<table class="price-table"><thead><tr><th>Item</th><th>Price (KZT)</th><th>USD</th></tr></thead><tbody><tr><td>Samsa (pastry, street stall)</td><td>200–350</td><td>$0.40–0.70</td></tr><tr><td>Shashlik (grilled skewer)</td><td>500–900</td><td>$1–1.80</td></tr><tr><td>Laghman or plov (café)</td><td>1,200–1,800</td><td>$2.40–3.60</td></tr><tr><td>Beshbarmak (traditional restaurant)</td><td>3,000–6,000</td><td>$6–12</td></tr><tr><td>3-course dinner (mid restaurant)</td><td>5,000–10,000</td><td>$10–20</td></tr><tr><td>Fine dining, main course</td><td>8,000–20,000</td><td>$16–40</td></tr><tr><td>Espresso / cappuccino</td><td>600–1,000</td><td>$1.20–2</td></tr><tr><td>Local beer (0.5L, bar)</td><td>800–1,500</td><td>$1.60–3</td></tr></tbody></table>
							<h3>Accommodation</h3>
							<table class="price-table"><thead><tr><th>Type</th><th>Price (KZT)</th><th>USD</th></tr></thead><tbody><tr><td>Hostel dorm bed</td><td>3,000–5,000</td><td>$6–10</td></tr><tr><td>Budget guesthouse (private room)</td><td>6,000–10,000</td><td>$12–20</td></tr><tr><td>3-star hotel (Almaty)</td><td>15,000–30,000</td><td>$30–60</td></tr><tr><td>4-star hotel (Almaty)</td><td>30,000–60,000</td><td>$60–120</td></tr><tr><td>5-star hotel (Astana/Almaty)</td><td>60,000–150,000</td><td>$120–300</td></tr><tr><td>Yurt stay (nature camps)</td><td>8,000–18,000</td><td>$16–36</td></tr></tbody></table>
							<h3>Activities & Sights</h3>
							<table class="price-table"><thead><tr><th>Activity</th><th>Price (KZT)</th><th>USD</th></tr></thead><tbody><tr><td>Shymbulak ski day pass</td><td>8,000–15,000</td><td>$16–30</td></tr><tr><td>Charyn Canyon entry</td><td>1,000–1,500</td><td>$2–3</td></tr><tr><td>Kolsai Lakes entry</td><td>500–1,000</td><td>$1–2</td></tr><tr><td>Museum entry (average)</td><td>500–2,000</td><td>$1–4</td></tr><tr><td>Day tour from Almaty</td><td>15,000–25,000</td><td>$30–50</td></tr><tr><td>Private guide (full day)</td><td>20,000–50,000</td><td>$40–100</td></tr></tbody></table>
						</div>
					{:else if moneyTab === 'paying'}
						<div class="tab-panel">
							<h3>How to Pay in Kazakhstan</h3>
							<div class="payment-grid"><div class="payment-card"><h4>Cash (KZT)</h4><ul><li>Essential — always carry some</li><li>Works everywhere without exception</li><li>Markets, taxis, rural areas, small cafés</li><li>Small bills useful — 1,000 and 2,000 KZT notes</li><li>Keep 10,000–20,000 KZT cash reserve at all times</li></ul></div><div class="payment-card"><h4>Debit / Credit Cards</h4><ul><li>Widely accepted in cities</li><li>Visa and Mastercard work in hotels, malls, restaurants</li><li>Contactless payments increasingly common</li><li>Inform your bank before travelling</li><li>Foreign cards may not work at all ATMs — test early</li><li>Amex rarely accepted outside luxury hotels</li></ul></div><div class="payment-card"><h4>Kaspi Pay / QR Pay</h4><ul><li>Locals' favourite — useful for visitors too</li><li>Kaspi Bank app dominates local payments</li><li>QR codes at almost every shop and café</li><li>If staying long-term, open a Kaspi account</li><li>Requires a KZ phone number and passport</li></ul></div><div class="payment-card"><h4>ATMs</h4><ul><li>Best way to get KZT cash</li><li>Halyk Bank, Kaspi, ForteBank ATMs most reliable</li><li>Available in all cities and airports 24/7</li><li>Withdraw larger amounts — some charge per transaction</li><li>Rural and mountain areas: cash only, no ATMs</li></ul></div></div>
							<h3>Tipping Culture</h3>
							<table class="price-table"><thead><tr><th>Service</th><th>Expected?</th><th>Amount</th></tr></thead><tbody><tr><td>Restaurant (sit-down)</td><td>Appreciated</td><td>5–10% if service was good</td></tr><tr><td>Café / fast casual</td><td>Not expected</td><td>Round up if you like</td></tr><tr><td>App taxi (Yandex Go)</td><td>Optional</td><td>Round up or in-app tip</td></tr><tr><td>Tour guide / driver</td><td>Yes — standard</td><td>10–15% or 2,000–5,000 KZT/day (~$4–10)</td></tr><tr><td>Hotel porter</td><td>Appreciated</td><td>200–500 KZT per bag (~$0.40–1)</td></tr><tr><td>Spa / massage</td><td>Appreciated</td><td>10% is generous and welcome</td></tr></tbody></table>
						</div>
					{:else if moneyTab === 'practical'}
						<div class="tab-panel">
							<h3>Essential Practicalities</h3>
							<div class="practical-grid"><div class="practical-card"><h4>SIM Cards & Mobile Data</h4><p>Buy Kcell/Activ or Beeline at the airport on arrival — both have airport kiosks. A SIM with 10–20GB data costs 1,000–3,000 KZT (~$2–6). Coverage is excellent in cities; patchy in mountains and steppe. Roaming is expensive — always get a local SIM. Download apps and maps before heading into remote areas.</p></div><div class="practical-card"><h4>Electricity & Plugs</h4><p>220V / 50Hz. Type C and F plugs (European round 2-pin). UK and US travellers need an adaptor. Power cuts are rare in cities but more common in rural guesthouses — bring a power bank.</p></div><div class="practical-card"><h4>Time Zones</h4><p>Kazakhstan spans 2 time zones: UTC+5 (Almaty, Shymkent, most of the country) and UTC+6 (Astana and east). No daylight saving. Plan calls and connections accordingly.</p></div><div class="practical-card"><h4>Health & Pharmacies</h4><p>Pharmacies (apteka) are everywhere and well-stocked. No mandatory vaccinations, but Hepatitis A and typhoid recommended. Tap water: safe to drink in Almaty and Astana, but most locals drink bottled. High altitude — acclimatise if trekking.</p></div><div class="practical-card"><h4>Internet & VPN</h4><p>Wi-Fi is fast and free in most hotels, cafés, and restaurants. Some foreign websites and apps may be slower or restricted. A VPN (installed before arrival) is useful and used widely by locals and expats alike.</p></div><div class="practical-card"><h4>Language</h4><p>Kazakh and Russian are official. Russian is widely spoken across all cities and generations. English is growing fast in Almaty and Astana, especially among younger people and hospitality staff. Learn a few Russian phrases — locals light up when you try.</p></div><div class="practical-card"><h4>Safety</h4><p>Kazakhstan is generally safe for travellers. Petty theft exists in crowded markets — use a money belt. Avoid informal taxis. Political demonstrations are rare but avoid large crowds if they occur. Night-time in city centres is safe; rural areas are hospitable and low-crime.</p></div><div class="practical-card"><h4>Travel Insurance</h4><p>Essential. Public hospitals are basic — private clinics in Almaty and Astana are modern and affordable. Mountain rescue and helicopter evacuation can be very expensive without cover. Ensure your policy covers adventure activities if trekking or skiing.</p></div></div>
							<h3>Emergency Numbers</h3>
							<table class="price-table"><thead><tr><th>Service</th><th>Number</th><th>Notes</th></tr></thead><tbody><tr><td>Police</td><td>102</td><td>Politsiya</td></tr><tr><td>Ambulance</td><td>103</td><td>Skoraya pomoshch</td></tr><tr><td>Fire service</td><td>101</td><td>Pozharnaya sluzhba</td></tr><tr><td>Single emergency number</td><td>112</td><td>All services (like 911)</td></tr><tr><td>Mountain rescue (Almaty)</td><td>+7 727 279-88-02</td><td>KazSpas search & rescue</td></tr></tbody></table>
							<div class="pro-tips"><h4>Pro Tips</h4><ol><li>Carry cash in KZT at all times — markets, national parks, village homestays, and minibuses are cash-only</li><li>USD / EUR as backup — hard currency exchange booths are everywhere. Crisp, clean bills are your best backup</li><li>Notify your bank before travelling — transactions from Kazakhstan can trigger fraud alerts</li><li>Haggle at bazaars — not at shops. Green Bazaar (Almaty) and Kok Bazaar (Shymkent) expect negotiation</li><li>Dress modestly at religious sites — mosques and mausoleums require covered shoulders and legs</li><li>Download Google Translate offline — Russian Cyrillic is everywhere, camera translation is a game-changer</li></ol></div>
						</div>
					{/if}
				{:else if tip.id === 'safety-general-precautions'}
					<p class="lead-text">Kazakhstan is one of Central Asia's safest destinations — but every traveller deserves clear, honest guidance. Emergency numbers, tourist hotlines, hospital contacts, and the scams to avoid, all in one place.</p>

					<div class="quick-facts">
						<div class="fact-item"><strong>Low</strong>Risk level</div>
						<div class="fact-item"><strong>112</strong>Emergency</div>
						<div class="fact-item"><strong>1414</strong>Tourist hotline</div>
						<div class="fact-item"><strong>24/7</strong>English support</div>
					</div>

					<div class="tab-bar">
						<button class="tab-btn" class:active={safetyTab === 'overview'} on:click={() => safetyTab = 'overview'}>Overview</button>
						<button class="tab-btn" class:active={safetyTab === 'contacts'} on:click={() => safetyTab = 'contacts'}>Contacts</button>
						<button class="tab-btn" class:active={safetyTab === 'health'} on:click={() => safetyTab = 'health'}>Health</button>
						<button class="tab-btn" class:active={safetyTab === 'scams'} on:click={() => safetyTab = 'scams'}>Scams</button>
						<button class="tab-btn" class:active={safetyTab === 'embassies'} on:click={() => safetyTab = 'embassies'}>Embassies</button>
						<button class="tab-btn" class:active={safetyTab === 'tips'} on:click={() => safetyTab = 'tips'}>Safety Tips</button>
					</div>

					{#if safetyTab === 'overview'}
						<div class="tab-panel">
							<h3>Safety Overview</h3>
							<p>Kazakhstan consistently ranks as one of the safest countries in Central Asia. Violent crime against tourists is rare. The main risks are petty theft in crowded areas, unofficial taxi scams, and common travel health issues.</p>
							<h4>Risk Levels by Category</h4>
							<table class="price-table"><thead><tr><th>Category</th><th>Risk Level</th><th>Notes</th></tr></thead><tbody><tr><td>Violent crime</td><td>Very low</td><td>Almaty and Astana city centres are safe at night</td></tr><tr><td>Political unrest</td><td>Low</td><td>Avoid any protests if they occur</td></tr><tr><td>Petty theft</td><td>Moderate</td><td>Use a money belt in bazaars and markets</td></tr><tr><td>Taxi scams</td><td>Moderate</td><td>Always use Yandex Go or inDrive apps</td></tr><tr><td>Road safety</td><td>Moderate</td><td>Aggressive driving common, avoid night driving</td></tr><tr><td>Mountain hazards</td><td>Moderate–High</td><td>Register with KazSpas before backcountry trips</td></tr><tr><td>Terrorism</td><td>Low</td><td>Attacks targeting tourists extremely rare</td></tr><tr><td>Natural disasters</td><td>Low–Moderate</td><td>Earthquake zone, extreme winter cold</td></tr></tbody></table>
							<div class="warning-box"><p><strong>Bottom line:</strong> Millions of tourists visit Kazakhstan safely each year. Apply the same common sense you would in any major city.</p></div>
						</div>
					{:else if safetyTab === 'contacts'}
						<div class="tab-panel">
							<h3>Emergency & Official Services</h3>
							<table class="price-table"><thead><tr><th>Service</th><th>Number</th><th>Notes</th></tr></thead><tbody><tr><td>🆘 All emergencies</td><td>112</td><td>24/7 · English available</td></tr><tr><td>🚓 Police (Politsiya)</td><td>102</td><td>Crime, theft, accidents · 24/7</td></tr><tr><td>🚑 Ambulance (Skoraya)</td><td>103</td><td>Medical emergencies · 24/7</td></tr><tr><td>🚒 Fire service</td><td>101</td><td>Fire, gas leaks · 24/7</td></tr><tr><td>⛽ Gas emergency</td><td>104</td><td>Gas leaks and explosions</td></tr><tr><td>🌐 Tourist helpline</td><td>1414</td><td>English/Kazakh/Russian · 24/7 · free call</td></tr><tr><td>🏔️ Mountain rescue (KazSpas)</td><td>+7 727 279-88-02</td><td>Almaty-based search & rescue</td></tr><tr><td>🏔️ KazSpas Astana</td><td>+7 717 244-95-11</td><td>Astana-based rescue coordination</td></tr></tbody></table>
							<h3>Tourist Support — 24/7</h3>
							<div class="payment-grid"><div class="payment-card"><h4>National Tourist Helpline</h4><ul><li>Kazakh Tourism · 24/7</li><li>Free call from any KZ number</li><li>English, Russian, Kazakh support</li><li><strong>1414</strong></li></ul></div><div class="payment-card"><h4>Visit Kazakhstan</h4><ul><li>Official tourism information</li><li>Destination guides</li><li>Travel advisories</li><li>visitkazakhstan.kz</li></ul></div><div class="payment-card"><h4>Ministry of Foreign Affairs</h4><ul><li>Consular assistance</li><li>Lost passport support</li><li>Visa extensions</li><li>mfa.gov.kz</li></ul></div><div class="payment-card"><h4>KazSpas — Mountain Rescue</h4><ul><li>Trekking registration</li><li>Helicopter rescue</li><li>+7 727 279-88-02</li><li>kazspas.kz</li></ul></div></div>
						</div>
					{:else if safetyTab === 'health'}
						<div class="tab-panel">
							<h3>Health Essentials</h3>
							<div class="practical-grid"><div class="practical-card"><h4>Vaccinations</h4><p>No mandatory vaccines. Recommended: Hepatitis A & B, Typhoid, routine boosters. Rabies for rural trips. Consult doctor 6–8 weeks before travel.</p></div><div class="practical-card"><h4>Water & Food Safety</h4><p>Tap water safe in Almaty/Astana but most drink bottled. Rural: always bottled or boiled water. Street food safe at busy stalls.</p></div><div class="practical-card"><h4>Altitude Sickness</h4><p>Almaty at 700–900m is fine. Tian Shan treks reach 3,000–4,000m+ where altitude sickness is real. Ascend gradually, stay hydrated, descend if symptoms worsen.</p></div><div class="practical-card"><h4>Extreme Cold (Winter)</h4><p>Astana can reach −40°C in January. Frostbite risk within minutes. Layer up: thermal base, insulated mid-layer, windproof outer. Cover all extremities.</p></div><div class="practical-card"><h4>Heat & Sun (Summer)</h4><p>Mangystau hits 42°C+ in July–August. Wear sunscreen, hat, light clothing. Carry extra water — dehydration risk high on desert tours.</p></div><div class="practical-card"><h4>Insects & Ticks</h4><p>Tick-borne encephalitis risk spring–autumn in forested areas. Use DEET, wear long sleeves, check for ticks. TBE vaccine recommended for extended mountain trips.</p></div></div>
							<h4>Private Hospitals — Almaty</h4>
							<table class="price-table"><thead><tr><th>Hospital</th><th>Type</th><th>Phone</th><th>English?</th></tr></thead><tbody><tr><td>Interteach Clinic</td><td>Private</td><td>+7 727 258-07-07</td><td>Yes</td></tr><tr><td>Mediker Family</td><td>Private</td><td>+7 727 350-00-50</td><td>Yes</td></tr><tr><td>Rixos Hospital</td><td>Premium</td><td>+7 727 311-00-00</td><td>Yes</td></tr></tbody></table>
							<h4>Private Hospitals — Astana</h4>
							<table class="price-table"><thead><tr><th>Hospital</th><th>Type</th><th>Phone</th></tr></thead><tbody><tr><td>NU Medical Centre</td><td>Premium</td><td>+7 717 270-88-00</td></tr><tr><td>JK Hospital</td><td>General</td><td>+7 717 225-04-04</td></tr></tbody></table>
							<div class="warning-box"><p><strong>Travel insurance is essential.</strong> Helicopter rescue can cost $30,000–$100,000+ without cover. Ensure policy covers adventure activities.</p></div>
						</div>
					{:else if safetyTab === 'scams'}
						<div class="tab-panel">
							<h3>Common Scams & How to Avoid</h3>
							<div class="payment-grid"><div class="payment-card"><h4>Unofficial Taxis</h4><ul><li>Quote low fares (500–1,000 KZT)</li><li>Then demand 5,000–15,000 KZT</li><li><strong>Fix:</strong> Use Yandex Go or inDrive</li></ul></div><div class="payment-card"><h4>Exchange Scams</h4><ul><li>Street changers short-change you</li><li>Or give counterfeit notes</li><li><strong>Fix:</strong> Use official exchange booths</li></ul></div><div class="payment-card"><h4>Fake Police</h4><ul><li>Posing as plainclothes police</li><li>Ask to check documents</li><li><strong>Fix:</strong> Real police show badge</li></ul></div><div class="payment-card"><h4>Bar Scams</h4><ul><li>Befriended at venues</li><li>Bill for thousands appears</li><li><strong>Fix:</strong> Check prices first</li></ul></div><div class="payment-card"><h4>Unregistered Housing</h4><ul><li>Guesthouses skip registration</li><li>Legal issues at departure</li><li><strong>Fix:</strong> Confirm on check-in</li></ul></div><div class="payment-card"><h4>Photo Restrictions</h4><ul><li>Government buildings prohibited</li><li>Military sites, airports</li><li><strong>Fix:</strong> Ask permission first</li></ul></div></div>
							<div class="warning-box"><p><strong>If scammed:</strong> Call 112 or tourist helpline <strong>1414</strong> (English). Note taxi plate or description.</p></div>
						</div>
					{:else if safetyTab === 'embassies'}
						<div class="tab-panel">
							<h3>Foreign Embassies in Astana</h3>
							<table class="price-table"><thead><tr><th>Country</th><th>Address</th><th>Phone</th></tr></thead><tbody><tr><td>🇺🇸 United States</td><td>Rakhymzhan Koshkarbayev Ave 3</td><td>+7 717 270-21-00</td></tr><tr><td>🇬🇧 United Kingdom</td><td>6 Kosmonavtov St</td><td>+7 717 255-62-00</td></tr><tr><td>🇩🇪 Germany</td><td>Kosmonavtov 62</td><td>+7 717 279-52-00</td></tr><tr><td>🇫🇷 France</td><td>Kosmonavtov 62</td><td>+7 717 279-08-00</td></tr><tr><td>🇨🇦 Canada</td><td>Kosmonavtov 10</td><td>+7 717 247-58-00</td></tr><tr><td>🇮🇳 India</td><td>Diplomatic Town</td><td>+7 717 279-64-25</td></tr></tbody></table>
							<h3>Government Travel Advisories</h3>
							<table class="price-table"><thead><tr><th>Country</th><th>Rating</th></tr></thead><tbody><tr><td>🇺🇸 USA</td><td>Level 1 — Exercise normal precautions</td></tr><tr><td>🇬🇧 UK</td><td>Generally safe</td></tr><tr><td>🇦🇺 Australia</td><td>Exercise normal safety</td></tr><tr><td>🇨🇦 Canada</td><td>Take normal security precautions</td></tr></tbody></table>
							<div class="pro-tips"><h4>Register your travel</h4><p>US: STEP (step.state.gov) · UK: FCDO · AU: Smartraveller. These alert you to safety updates.</p></div>
						</div>
					{:else if safetyTab === 'tips'}
						<div class="tab-panel">
							<h3>Top 12 Safety Tips</h3>
							<ol class="tips-list"><li><strong>Save 112 and 1414</strong> — Emergency and tourist helpline</li><li><strong>Only use app taxis</strong> — Yandex Go or inDrive, never street hails</li><li><strong>Register treks with KazSpas</strong> — +7 727 279-88-02 before backcountry</li><li><strong>Keep document copies</strong> — Email scans, store separately</li><li><strong>Beware bazaars</strong> — Pickpocket territory, use money belt</li><li><strong>Avoid night driving</strong> — Poorly lit rural roads</li><li><strong>Dress modestly</strong> — At mosques and mausoleums</li><li><strong>Get travel insurance</strong> — Helicopter rescue is expensive</li><li><strong>Register with embassy</strong> — STEP, FCDO, or Smartraveller</li><li><strong>Prepare for weather</strong> — 42°C summer, −40°C winter</li><li><strong>Carry power bank</strong> — Phone is essential</li><li><strong>No restricted photos</strong> — Government/military sites</li></ol>
							<div class="warning-box"><p><strong>Kazakhstan is welcoming and safe.</strong> Preparation and common sense are your best travel companions.</p></div>
						</div>
					{/if}
				{:else if tip.id === 'airport-taxi-guide'}
					<p class="lead-text">Kazakhstan's three main international airports — Almaty (ALA), Astana (NQZ), and Shymkent (CIT) — all have reliable official taxi services. Here's everything you need to know to get from the airport to your hotel safely and without overpaying.</p>

					<div class="quick-facts">
						<div class="fact-item"><strong>3</strong>int'l airports</div>
						<div class="fact-item"><strong>Yandex Go</strong>recommended app</div>
						<div class="fact-item"><strong>₸2,000–8,000</strong>~$4–17 city ride</div>
						<div class="fact-item"><strong>24/7</strong>taxi availability</div>
					</div>

					<h3>Almaty International Airport (ALA)</h3>
					<p>Almaty's airport is 13 km northeast of the city centre. Journey time: 20–40 min depending on traffic.</p>
					<table class="price-table">
						<thead><tr><th>Option</th><th>KZT</th><th>USD</th><th>Notes</th></tr></thead>
						<tbody>
							<tr><td>Yandex Go / inDrive</td><td>₸2,500–4,500</td><td>~$5–9</td><td>Best value, meter-based, no negotiation needed</td></tr>
							<tr><td>Official airport taxi (yellow)</td><td>₸5,000–8,000</td><td>~$10–17</td><td>Fixed zone pricing, available at arrivals exit</td></tr>
							<tr><td>Bolt</td><td>₸2,000–4,000</td><td>~$4–8</td><td>Available in Almaty, check app for availability</td></tr>
							<tr><td>Bus 79 / 86</td><td>₸150–200</td><td>~$0.30–0.40</td><td>Slowest option, runs to city centre</td></tr>
						</tbody>
					</table>

					<h3>Astana International Airport (NQZ)</h3>
					<p>Astana's airport is 17 km south of the city centre. Journey time: 20–35 min.</p>
					<table class="price-table">
						<thead><tr><th>Option</th><th>KZT</th><th>USD</th><th>Notes</th></tr></thead>
						<tbody>
							<tr><td>Yandex Go</td><td>₸2,000–4,000</td><td>~$4–8</td><td>Most reliable, available immediately</td></tr>
							<tr><td>Official airport taxi</td><td>₸5,000–7,000</td><td>~$10–15</td><td>Available at arrivals, negotiate upfront</td></tr>
							<tr><td>LRT (light rail)</td><td>₸80–200</td><td>~$0.15–0.40</td><td>Newly launched — check current route coverage</td></tr>
							<tr><td>City bus 10</td><td>₸80–150</td><td>~$0.15–0.30</td><td>Runs to city, slower but very cheap</td></tr>
						</tbody>
					</table>

					<h3>Shymkent International Airport (CIT)</h3>
					<table class="price-table">
						<thead><tr><th>Option</th><th>KZT</th><th>USD</th><th>Notes</th></tr></thead>
						<tbody>
							<tr><td>Yandex Go</td><td>₸1,500–3,000</td><td>~$3–6</td><td>Cheapest and fastest to book</td></tr>
							<tr><td>Airport taxi booth</td><td>₸4,000–5,000</td><td>~$8–10</td><td>Fixed rates, reliable</td></tr>
						</tbody>
					</table>

					<div class="highlight-box">
						<p><strong>Top Tip:</strong> Download <strong>Yandex Go</strong> before you land. It works at all three airports, shows the price upfront, and eliminates any negotiation. Works with international cards.</p>
					</div>

					<h3>Car Rental</h3>
					<p>All major airports have international car rental counters (Hertz, Avis, Europcar, and local operators). Prices start from ~$30/day for a compact car. An international driving permit is required alongside your national licence.</p>
					<table class="price-table">
						<thead><tr><th>Company</th><th>Airports</th><th>Starting Price/Day</th></tr></thead>
						<tbody>
							<tr><td>Hertz</td><td>ALA, NQZ</td><td>~$35</td></tr>
							<tr><td>Avis</td><td>ALA, NQZ</td><td>~$30</td></tr>
							<tr><td>Europcar</td><td>ALA</td><td>~$28</td></tr>
							<tr><td>Local operators</td><td>All airports</td><td>~$20–25</td></tr>
						</tbody>
					</table>

					<div class="pro-tips">
						<h4>Pro Tips</h4>
						<ol>
							<li><strong>Ignore touts</strong> — Unsolicited offers inside the terminal are almost always overpriced. Walk out to the official taxi zone or use your app.</li>
							<li><strong>Agree price before entering</strong> — If not using an app, always settle the fare before you get in.</li>
							<li><strong>Have small bills</strong> — Drivers often claim they have no change. Have ₸500–1,000 notes ready.</li>
							<li><strong>Share your route</strong> — Use the app's "share trip" feature so someone knows your journey.</li>
							<li><strong>Hotels can arrange transfers</strong> — Many mid-range and above hotels offer airport pick-up for ~$15–25. Worth it for late-night arrivals.</li>
						</ol>
					</div>

				{:else if tip.id === 'visa-entry-requirements'}
					<p class="lead-text">One of Central Asia's most open visa policies — 70+ countries enter visa-free. Find your exact requirements, e-Visa steps, border crossings, embassy contacts, and what to do if something goes wrong.</p>

					<div class="quick-facts">
						<div class="fact-item"><strong>70+</strong>visa-free</div>
						<div class="fact-item"><strong>120+</strong>e-Visa countries</div>
						<div class="fact-item"><strong>30 days</strong>max stay</div>
						<div class="fact-item"><strong>$30-80</strong>e-Visa fee</div>
					</div>

					<!-- Visa Checker -->
					<div class="visa-checker">
						<h3>Visa Requirement Checker</h3>
						<select bind:value={selectedNationality} class="country-select">
							<option value="">— Select your nationality —</option>
							{#each nationalities as nat}
								<option value={nat.code}>{nat.name}</option>
							{/each}
						</select>
						{#if selectedNationality}
							{@const info = getVisaInfo(selectedNationality)}
							<div class="visa-result">
								{#if info.visaType === 'free'}
									<div class="visa-badge visa-free">✅ Visa-Free</div>
									<p><strong>Max stay:</strong> {info.stay}</p>
									<p><strong>Requirements:</strong> Valid passport (3 months+), no application needed</p>
								{:else if info.visaType === 'cis'}
									<div class="visa-badge visa-cis">🛂 CIS Agreement</div>
									<p><strong>Max stay:</strong> {info.stay}</p>
									<p><strong>Requirements:</strong> National ID card accepted, right to live and work</p>
								{:else if info.visaType === 'evisa'}
									<div class="visa-badge visa-evisa">📝 e-Visa Required</div>
									<p><strong>Max stay:</strong> {info.stay}</p>
									<p><strong>Fee:</strong> {info.fee} USD</p>
									<p><strong>Apply at:</strong> evisa.mfa.gov.kz</p>
								{:else}
									<div class="visa-badge visa-check">⚠️ Check Requirements</div>
									<p>Please check with the nearest Kazakhstan embassy</p>
								{/if}
							</div>
						{/if}
					</div>

					<div class="tab-bar">
						<button class="tab-btn" class:active={visaTab === 'types'} on:click={() => visaTab = 'types'}>Visa Types</button>
						<button class="tab-btn" class:active={visaTab === 'bycountry'} on:click={() => visaTab = 'bycountry'}>By Country</button>
						<button class="tab-btn" class:active={visaTab === 'evisa'} on:click={() => visaTab = 'evisa'}>e-Visa Guide</button>
						<button class="tab-btn" class:active={visaTab === 'documents'} on:click={() => visaTab = 'documents'}>Documents</button>
						<button class="tab-btn" class:active={visaTab === 'points'} on:click={() => visaTab = 'points'}>Entry Points</button>
						<button class="tab-btn" class:active={visaTab === 'whatif'} on:click={() => visaTab = 'whatif'}>What If…</button>
						<button class="tab-btn" class:active={visaTab === 'embassies'} on:click={() => visaTab = 'embassies'}>Embassies</button>
					</div>

					{#if visaTab === 'types'}
						<div class="tab-panel">
							<h3>Entry Categories at a Glance</h3>
							<div class="payment-grid"><div class="payment-card"><h4>Visa-Free</h4><ul><li><strong>70+ nationalities</strong></li><li>No application needed</li><li>Valid passport required (3 months+)</li><li>Extendable in-country</li><li><strong>Max stay: 30 days</strong></li></ul></div><div class="payment-card"><h4>e-Visa</h4><ul><li><strong>120+ nationalities</strong></li><li>Apply at evisa.mfa.gov.kz</li><li>Processing: 5–7 business days</li><li>Single entry, valid 90 days</li><li><strong>Fee: $30–80 USD</strong></li></ul></div><div class="payment-card"><h4>CIS Entry</h4><ul><li><strong>Russia, Belarus, Kyrgyzstan</strong></li><li>Tajikistan, Uzbekistan, Armenia</li><li>National ID card accepted</li><li>Right to live and work</li><li><strong>No visa, no fee</strong></li></ul></div><div class="payment-card"><h4>Consular Visa</h4><ul><li><strong>Required nationalities</strong></li><li>Apply at KZ embassy</li><li>Single or multiple entry</li><li>Tourist, business, transit</li><li><strong>Processing: 5–15 days</strong></li></ul></div></div>
							<h4>For Longer Stays</h4>
							<table class="price-table"><thead><tr><th>Type</th><th>Duration</th><th>Notes</th></tr></thead><tbody><tr><td>Long-term Visa</td><td>1–5 years</td><td>Work, study, family — apply through employer/university</td></tr><tr><td>Transit Visa</td><td>72 hrs</td><td>Required if transiting by land</td></tr></tbody></table>
							<div class="pro-tips"><h4>Most travellers from developed countries enter visa-free</h4><p>If you're from the EU, UK, USA, Canada, Australia, Japan, or South Korea — simply show up with a valid passport. No application, no fee, no stress.</p></div>
						</div>
					{:else if visaTab === 'bycountry'}
						<div class="tab-panel">
							<h3>Visa-Free Countries (30-day entry)</h3>
							<table class="price-table"><thead><tr><th>Country / Region</th><th>Entry type</th><th>Max stay</th><th>Passport validity</th></tr></thead><tbody><tr><td>🇪🇺 All EU member states</td><td>Visa-free</td><td>30 days</td><td>3 months+</td></tr><tr><td>🇺🇸 United States</td><td>Visa-free</td><td>30 days</td><td>3 months+</td></tr><tr><td>🇬🇧 United Kingdom</td><td>Visa-free</td><td>30 days</td><td>3 months+</td></tr><tr><td>🇨🇦 Canada</td><td>Visa-free</td><td>30 days</td><td>3 months+</td></tr><tr><td>🇦🇺 Australia</td><td>Visa-free</td><td>30 days</td><td>3 months+</td></tr><tr><td>🇯🇵 Japan</td><td>Visa-free</td><td>30 days</td><td>3 months+</td></tr><tr><td>🇰🇷 South Korea</td><td>Visa-free</td><td>30 days</td><td>3 months+</td></tr><tr><td>🇸🇬 Singapore</td><td>Visa-free</td><td>30 days</td><td>3 months+</td></tr><tr><td>🇹🇷 Turkey</td><td>Visa-free</td><td>30 days</td><td>3 months+</td></tr><tr><td>🇦🇪 UAE</td><td>Visa-free</td><td>30 days</td><td>3 months+</td></tr><tr><td>🇨🇭 Switzerland / Norway / Iceland</td><td>Visa-free</td><td>30 days</td><td>3 months+</td></tr><tr><td>🇧🇷 Brazil / Argentina / Mexico</td><td>Visa-free</td><td>30 days</td><td>3 months+</td></tr><tr><td>🇲🇳 Mongolia</td><td>Visa-free</td><td>30 days</td><td>3 months+</td></tr><tr><td>🇺🇦 Ukraine / Georgia / Azerbaijan</td><td>Visa-free</td><td>30 days</td><td>3 months+</td></tr><tr><td>🇲🇾 Malaysia</td><td>Visa-free</td><td>30 days</td><td>3 months+</td></tr></tbody></table>
							<h3>CIS Agreements (Special Status)</h3>
							<table class="price-table"><thead><tr><th>Country</th><th>Entry type</th><th>Max stay</th><th>ID card?</th></tr></thead><tbody><tr><td>🇷🇺 Russia</td><td>CIS agreement</td><td>Unlimited</td><td>Yes</td></tr><tr><td>🇧🇾 Belarus</td><td>CIS agreement</td><td>Unlimited</td><td>Yes</td></tr><tr><td>🇰🇬 Kyrgyzstan</td><td>CIS agreement</td><td>Unlimited</td><td>Yes</td></tr><tr><td>🇺🇿 Uzbekistan</td><td>CIS agreement</td><td>30 days</td><td>Yes</td></tr><tr><td>🇹🇯 Tajikistan</td><td>CIS agreement</td><td>30 days</td><td>Yes</td></tr><tr><td>🇦🇲 Armenia</td><td>CIS agreement</td><td>30 days</td><td>Yes</td></tr></tbody></table>
							<h3>e-Visa Eligible Countries</h3>
							<table class="price-table"><thead><tr><th>Country</th><th>Entry type</th><th>Max stay</th><th>Approx fee</th></tr></thead><tbody><tr><td>🇨🇳 China</td><td>e-Visa</td><td>30 days</td><td>~$35 USD</td></tr><tr><td>🇮🇳 India</td><td>e-Visa</td><td>30 days</td><td>~$40 USD</td></tr><tr><td>🇿🇦 South Africa</td><td>e-Visa</td><td>30 days</td><td>~$35 USD</td></tr><tr><td>🇸🇦 Saudi Arabia / Gulf states</td><td>e-Visa</td><td>30 days</td><td>~$30 USD</td></tr><tr><td>🇻🇳 Vietnam / Thailand / Indonesia</td><td>e-Visa</td><td>30 days</td><td>~$35 USD</td></tr><tr><td>🇳🇬 Nigeria / Ghana / Kenya</td><td>e-Visa</td><td>30 days</td><td>~$50–80 USD</td></tr><tr><td>🇵🇰 Pakistan / Bangladesh</td><td>e-Visa</td><td>30 days</td><td>~$40 USD</td></tr><tr><td>🇮🇷 Iran</td><td>e-Visa</td><td>30 days</td><td>~$35 USD</td></tr></tbody></table>
							<div class="warning-box"><p><strong>Always verify before travelling.</strong> Visa policies change. Check the official portal at evisa.mfa.gov.kz or your nearest Kazakhstan embassy.</p></div>
						</div>
					{:else if visaTab === 'evisa'}
						<div class="tab-panel">
							<h3>How to Apply for Kazakhstan e-Visa</h3>
							<ol class="tips-list"><li><strong>Go to the official e-Visa portal</strong> — Only use: evisa.mfa.gov.kz. Avoid third-party sites that charge extra.</li><li><strong>Create an account</strong> — You'll need a valid email address. The system will send a confirmation link.</li><li><strong>Fill in the application form</strong> — Personal details, passport info, travel dates, purpose of visit (Tourism/Business/Transit).</li><li><strong>Upload required documents</strong> — Passport photo page scan · Passport-size photo · Proof of onward travel · Hotel booking confirmation.</li><li><strong>Pay the visa fee online</strong> — Fee: ~$30–80 USD depending on nationality. Paid by Visa/Mastercard. Non-refundable.</li><li><strong>Wait for processing</strong> — 5 to 7 business days. Apply at least 10–14 days before departure.</li><li><strong>Download and print your approved e-Visa</strong> — Present it at the port of entry alongside your passport.</li><li><strong>Arrive and present your documents</strong> — Hand over passport + printed e-Visa + return ticket if asked.</li></ol>
							<h3>Key e-Visa Details</h3>
							<table class="price-table"><thead><tr><th>Detail</th><th>Value</th><th>Notes</th></tr></thead><tbody><tr><td>Validity period</td><td>90 days</td><td>Must enter within 90 days of approval</td></tr><tr><td>Max stay</td><td>30 days</td><td>Counted from entry stamp date</td></tr><tr><td>Entry type</td><td>Single entry</td><td>Exits and re-entries require new e-Visa</td></tr><tr><td>Processing time</td><td>5–7 business days</td><td>Apply 10–14 days ahead as buffer</td></tr><tr><td>Fee</td><td>$30–80 USD</td><td>Depends on nationality</td></tr><tr><td>Extendable?</td><td>No</td><td>Must exit and reapply</td></tr></tbody></table>
							<div class="warning-box"><p><strong>Common rejection reasons:</strong> Mismatched passport details · blurry photo upload · expired passport · applying too close to travel date · inconsistent travel dates. Double-check everything before submitting.</p></div>
						</div>
					{:else if visaTab === 'documents'}
						<div class="tab-panel">
							<h3>What to Bring at the Border</h3>
							<div class="practical-grid"><div class="practical-card"><h4>Valid Passport</h4><p>Must be valid for at least 3 months beyond intended departure. Damaged passports may be rejected. Carry it on your person — not in checked luggage.</p></div><div class="practical-card"><h4>Visa / e-Visa</h4><p>Printed e-Visa PDF or consular visa stamp. Visa-free nationals don't need this. CIS nationals may use national ID cards.</p></div><div class="practical-card"><h4>Return / Onward Ticket</h4><p>Border officers may ask for proof you intend to leave. A printed or digital return flight/booking is sufficient.</p></div><div class="practical-card"><h4>Accommodation</h4><p>First night's hotel booking confirmation. Useful if questioned at the border.</p></div><div class="practical-card"><h4>Prescription Meds</h4><p>If carrying prescription medication, bring the original prescription. Controlled substances require advance permission from customs.</p></div><div class="practical-card"><h4>Travel Insurance</h4><p>Not mandatory but strongly recommended. Print or save your insurance certificate and emergency contact.</p></div></div>
							<h3>Registration (Propiska) Requirement</h3>
							<table class="price-table"><thead><tr><th>Stay Duration</th><th>Registration?</th><th>Who Does It?</th></tr></thead><tbody><tr><td>Under 30 days (visa-free)</td><td>Not required</td><td>Covered automatically</td></tr><tr><td>Hotel stay (any length)</td><td>Auto-registered</td><td>Hotel registers you on check-in</td></tr><tr><td>Airbnb / private home</td><td>Required within 3 days</td><td>Host files with migration</td></tr><tr><td>30+ days (any)</td><td>Mandatory within 3 days</td><td>Host or employer files</td></tr></tbody></table>
							<div class="warning-box"><p><strong>Don't skip registration</strong> if staying 30+ days. Unregistered stays can result in fines (up to 50,000 KZT / ~$105) and exit complications.</p></div>
						</div>
					{:else if visaTab === 'points'}
						<div class="tab-panel">
							<h3>International Airports</h3>
							<table class="price-table"><thead><tr><th>Airport</th><th>Code</th><th>City</th><th>e-Visa?</th></tr></thead><tbody><tr><td>Almaty International</td><td>ALA</td><td>Almaty</td><td>Yes</td></tr><tr><td>Astana International</td><td>NQZ</td><td>Astana</td><td>Yes</td></tr><tr><td>Shymkent International</td><td>CIT</td><td>Shymkent</td><td>Yes</td></tr><tr><td>Aktau International</td><td>SCO</td><td>Aktau</td><td>Yes</td></tr><tr><td>Atyrau International</td><td>GUW</td><td>Atyrau</td><td>Yes</td></tr><tr><td>Ust-Kamenogorsk</td><td>UKK</td><td>East KZ</td><td>Verify</td></tr></tbody></table>
							<h3>Land Border Crossings</h3>
							<table class="price-table"><thead><tr><th>Country</th><th>Crossing Name</th><th>Status</th><th>Notes</th></tr></thead><tbody><tr><td>🇺🇿 Uzbekistan</td><td>Chernyaevka / Jibek Joly</td><td>Open</td><td>Most popular southern crossing</td></tr><tr><td>🇰🇬 Kyrgyzstan</td><td>Kordai</td><td>Open</td><td>Busiest crossing</td></tr><tr><td>🇨🇳 China</td><td>Khorgos (Horgos)</td><td>Verify</td><td>Major Silk Road crossing</td></tr><tr><td>🇨🇳 China</td><td>Dostyk (Druzhba)</td><td>Verify</td><td>Trans-Siberian rail route</td></tr><tr><td>🇷🇺 Russia</td><td>Petropavl / Troitsk</td><td>Verify</td><td>Multiple crossings</td></tr><tr><td>🇹🇲 Turkmenistan</td><td>Farab / Sary Yazy</td><td>Restricted</td><td>Turkmenistan visa required</td></tr></tbody></table>
							<div class="pro-tips"><h4>Caspian Sea Entry</h4><p>Aktau port connects to Azerbaijan (Baku) and Russia by ferry. Ferries depart when full, not on schedule. Allow 1–3 days flexibility. e-Visa accepted at Aktau port.</p></div>
						</div>
					{:else if visaTab === 'whatif'}
						<div class="tab-panel">
							<h3>Common Problem Situations</h3>
							<div class="practical-grid"><div class="practical-card"><h4>Visa Expires While in Kazakhstan</h4><p>Go immediately to the nearest Migration Service Office (UMiR). You can apply for a short extension. Overstaying is fineable (50,000–200,000 KZT / ~$105–420) and can result in an entry ban.</p></div><div class="practical-card"><h4>Denied Entry at Border</h4><p>Ask for the specific reason in writing. You have the right to contact your embassy. Common reasons: passport validity issues, previous overstay, missing documents. Do not argue aggressively.</p></div><div class="practical-card"><h4>Lost Passport Inside Kazakhstan</h4><p>1. File a police report (call 102). 2. Contact your embassy for Emergency Travel Document. 3. Notify Migration Service. Don't try to exit without documentation.</p></div><div class="practical-card"><h4>⏳ Want to Stay Longer Than 30 Days?</h4><p>Options: 1. Exit and re-enter — go to Kyrgyzstan or Uzbekistan for a day trip. 2. Apply for long-term visa via employer/educational institution.</p></div><div class="practical-card"><h4>e-Visa Rejected?</h4><p>Reapply fixing the reason (mismatched details, bad photo, inconsistent dates). You can also apply through a Kazakhstan consulate in person. Fees are non-refundable.</p></div><div class="practical-card"><h4>Stopped by Police?</h4><p>You must carry your passport (or certified copy) at all times. Show documents calmly. If you feel intimidated, ask for badge number and call 112.</p></div><div class="practical-card"><h4>Emergency Medical Care?</h4><p>Yes — emergency care cannot be refused. However, bills can be significant. Always have travel insurance covering emergency hospitalization and repatriation.</p></div><div class="practical-card"><h4>Want to Work in Kazakhstan?</h4><p>Tourist/visa-free entry does not permit work. Working without a permit is illegal and can result in deportation and entry ban. Employer must apply for work permit through Ministry of Labour.</p></div></div>
							<div class="warning-box"><p><strong>Migration Service Office (UMiR):</strong> mia.gov.kz · <strong>Tourist helpline:</strong> 1414 (English, 24/7)</p></div>
						</div>
					{:else if visaTab === 'embassies'}
						<div class="tab-panel">
							<h3>Kazakhstan Embassies Worldwide</h3>
							<table class="price-table"><thead><tr><th>Country</th><th>Address</th><th>Phone</th></tr></thead><tbody><tr><td>🇺🇸 Washington D.C.</td><td>1401 16th St NW, Washington, DC 20036</td><td>+1 202 232-5488</td></tr><tr><td>🇬🇧 London</td><td>33 Thurloe Square, London SW7 2SD</td><td>+44 20 7581-4646</td></tr><tr><td>🇩🇪 Berlin</td><td>Nordendstraße 14–15, 13156 Berlin</td><td>+49 30 470-0711</td></tr><tr><td>🇫🇷 Paris</td><td>59 rue Pierre Charron, 75008 Paris</td><td>+33 1 4561-5200</td></tr><tr><td>🇨🇳 Beijing</td><td>9 Dongzhimenwai Dajie, Chaoyang District</td><td>+86 10 6532-6182</td></tr><tr><td>🇮🇳 New Delhi</td><td>61/1 Poorvi Marg, Vasant Vihar, New Delhi</td><td>+91 11 4166-1016</td></tr><tr><td>🇹🇷 Ankara</td><td>Kelebek Sokak 94, Gaziosmanpaşa, Ankara</td><td>+90 312 446-1000</td></tr><tr><td>🇦🇪 Abu Dhabi</td><td>Villa 19, St 11, Al-Khalidiyah, Abu Dhabi</td><td>+971 2 665-5136</td></tr></tbody></table>
							<h3>Official Government Portals</h3>
							<table class="price-table"><thead><tr><th>Service</th><th>Website</th><th>Purpose</th></tr></thead><tbody><tr><td>e-Visa application</td><td>evisa.mfa.gov.kz</td><td>Apply for and track e-Visa</td></tr><tr><td>Ministry of Foreign Affairs</td><td>mfa.gov.kz</td><td>Embassy locator, consular info</td></tr><tr><td>Migration Service (UMiR)</td><td>mvd-dp.gov.kz</td><td>Extensions, registration, long-term</td></tr><tr><td>Tourism portal</td><td>visitkazakhstan.kz</td><td>Travel advice, tour operators</td></tr></tbody></table>
							<div class="pro-tips"><h4>Pro Tips</h4><ol><li><strong>Apply for e-Visa early</strong> — Processing is 5–7 days, apply 2 weeks ahead minimum</li><li><strong>Only use official e-Visa portal</strong> — evisa.mfa.gov.kz is free beyond the visa fee</li><li><strong>Check passport validity</strong> — Must be valid for 3+ months beyond departure</li><li><strong>Register with your government</strong> — US: STEP · UK: FCDO · AU: Smartraveller</li><li><strong>Plan your 30-day window</strong> — The clock starts on entry, build 2–3 day buffer</li><li><strong>Confirm host will register you</strong> — Hotels do automatically, Airbnbs may not</li></ol></div>
						</div>
					{/if}
				{:else if tip.contentHTML}
					<div class="prose">
						{@html sanitizeHTML(tip.contentHTML)}
					</div>
				{:else if tip.content}
					<div class="prose">
						{@html processContent(tip.content, 'auto')}
					</div>
				{:else}
					<p class="no-content">Content coming soon.</p>
				{/if}
			</article>
		</div>
	</div>

	{#if windowWidth <= 1023}
		<nav class="mobile-bottom-nav-local" aria-label="Mobile navigation">
			<a href="/" aria-label="Home"><i class="fa fa-home" aria-hidden="true"></i></a>
		</nav>
	{/if}
{/if}

<style>
	.content-container {
		position: relative;
		z-index: 2;
		margin-top: -2rem;
		padding-top: 2rem;
	}

	.content-wrapper {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem min(2rem, 4vw);
	}

	.tip-content {
		background: #fff;
		border-radius: 16px;
		padding: 2.5rem;
		box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
		color: #1e293b;
	}

	/* Base typography */
	.tip-content :global(p) {
		font-size: 1.0625rem;
		line-height: 1.8;
		color: #374151;
		margin: 0 0 1.25rem;
		hyphens: none;
		word-break: normal;
	}

	.tip-content :global(li) {
		font-size: 1.0125rem;
		line-height: 1.75;
		color: #374151;
		hyphens: none;
		word-break: normal;
	}

	.tip-content :global(td),
	.tip-content :global(th) {
		color: #1e293b;
	}

	/* Heading hierarchy */
	.tip-content :global(h2) {
		font-family: 'Outfit', sans-serif;
		font-size: 1.5rem;
		font-weight: 800;
		color: #0f172a;
		margin: 2.75rem 0 0.875rem;
		letter-spacing: -0.025em;
		line-height: 1.25;
		padding-bottom: 0.6rem;
		border-bottom: 2px solid #f1f5f9;
	}

	.tip-content :global(h3) {
		font-family: 'Outfit', sans-serif;
		font-size: 1.2rem;
		font-weight: 700;
		color: #0f172a;
		margin: 2.25rem 0 0.75rem;
		letter-spacing: -0.015em;
		line-height: 1.3;
	}

	.tip-content :global(h4) {
		font-size: 1rem;
		font-weight: 700;
		color: #1e293b;
		margin: 1.75rem 0 0.5rem;
		letter-spacing: -0.01em;
	}

	.tip-content :global(h5),
	.tip-content :global(h6) {
		font-size: 0.9375rem;
		font-weight: 600;
		color: #334155;
		margin: 1.25rem 0 0.4rem;
	}

	.tip-content :global(strong) {
		color: #0f172a;
		font-weight: 700;
	}

	.tip-content :global(a) {
		color: #0284c7;
		text-decoration: underline;
		text-underline-offset: 3px;
		text-decoration-color: rgba(2,132,199,0.35);
	}

	.tip-content :global(a:hover) {
		color: #0369a1;
		text-decoration-color: #0369a1;
	}

	.tip-content :global(.prose) {
		color: var(--vnk-text-primary-color, #1a1a2e);
		font-size: 1.05rem;
		line-height: 1.8;
	}

	.tip-content :global(.prose h2) {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 2rem 0 1rem;
		color: var(--vnk-text-primary-color, #1a1a2e);
	}

	.tip-content :global(.prose h3) {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 1.5rem 0 0.75rem;
		color: var(--vnk-text-primary-color, #1a1a2e);
	}

	.tip-content :global(.prose p) {
		margin: 0 0 1rem;
	}

	.tip-content :global(.prose ul),
	.tip-content :global(.prose ol) {
		margin: 0 0 1rem;
		padding-left: 1.5rem;
	}

	.tip-content :global(.prose li) {
		margin-bottom: 0.5rem;
	}

	.tip-content :global(.prose strong) {
		color: var(--vnk-text-primary-color, #1a1a2e);
		font-weight: 600;
	}

	.tip-content :global(.prose a) {
		color: var(--vnk-accent-color, #e74c3c);
		text-decoration: underline;
	}

	.tip-content :global(.prose a:hover) {
		text-decoration: none;
	}

	.no-content {
		text-align: center;
		color: var(--vnk-text-secondary-color, #64748b);
		padding: 2rem;
	}

	.mobile-bottom-nav-local {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #fff;
		border-top: 1px solid #eee;
		padding: 0.75rem;
		display: flex;
		justify-content: center;
		z-index: 100;
	}

	/* Quick Stats Grid */
	.tip-content :global(.quick-stats-grid) {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.75rem;
		margin: 1rem 0;
	}

	.tip-content :global(.stat-card) {
		background: #fff;
		border-radius: 10px;
		padding: 0.85rem;
		text-align: center;
		border: 1px solid #e8edf2;
	}

	.tip-content :global(.stat-label) {
		display: block;
		font-size: 0.72rem;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 0.25rem;
	}

	.tip-content :global(.stat-value) {
		display: block;
		font-size: 1rem;
		font-weight: 700;
		color: #0f172a;
	}

	/* Airport Showcase */
	.tip-content :global(.airport-showcase) {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		margin: 1rem 0;
	}

	.tip-content :global(.airport-hero-card) {
		background: #fff;
		border-radius: 12px;
		padding: 1.1rem;
		border: 1px solid #e8edf2;
		position: relative;
	}

	.tip-content :global(.airport-hero-card.main) {
		border-left: 3px solid #0284c7;
	}

	.tip-content :global(.airport-hero-card.capital) {
		border-left: 3px solid #d97706;
	}

	.tip-content :global(.airport-badge) {
		display: inline-block;
		font-size: 0.68rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #64748b;
		font-weight: 600;
		margin-bottom: 0.35rem;
	}

	.tip-content :global(.airport-hero-card h3) {
		font-size: 1.5rem;
		font-weight: 700;
		color: #0284c7;
		margin: 0;
		line-height: 1;
	}

	.tip-content :global(.airport-hero-card.capital h3) {
		color: #d97706;
	}

	.tip-content :global(.airport-hero-card h4) {
		font-size: 0.9rem;
		color: #0f172a;
		margin: 0.3rem 0 0.2rem;
		font-weight: 600;
	}

	.tip-content :global(.airport-location) {
		font-size: 0.8rem;
		color: #64748b;
		margin: 0 0 0.6rem;
	}

	.tip-content :global(.airport-stats) {
		border-top: 1px solid #f1f5f9;
		padding-top: 0.6rem;
	}

	.tip-content :global(.airport-stat) {
		display: flex;
		justify-content: space-between;
		padding: 0.3rem 0;
		font-size: 0.82rem;
		border-bottom: 1px solid #f8fafc;
	}

	.tip-content :global(.airport-stat:last-child) {
		border-bottom: none;
	}

	.tip-content :global(.airport-stat .stat-label) {
		color: #64748b;
	}

	.tip-content :global(.airport-stat .stat-value) {
		font-weight: 600;
		color: #0f172a;
	}

	/* Other Airports */
	.tip-content :global(.other-airports) {
		margin: 0.75rem 0 1rem;
		background: #f8fafc;
		border-radius: 10px;
		padding: 0.75rem 1rem;
		border: 1px solid #e8edf2;
	}

	.tip-content :global(.other-airport-item) {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		padding: 0.4rem 0;
		border-bottom: 1px solid #f1f5f9;
		font-size: 0.82rem;
	}

	.tip-content :global(.other-airport-item:last-child) {
		border-bottom: none;
	}

	.tip-content :global(.other-airport-row) {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		padding: 0.4rem 0;
		border-bottom: 1px solid #f1f5f9;
		font-size: 0.82rem;
	}

	.tip-content :global(.other-airport-row:last-child) {
		border-bottom: none;
	}

	.tip-content :global(.oa-code),
	.tip-content :global(.airport-code-small) {
		font-weight: 700;
		color: #0f172a;
		min-width: 38px;
		font-size: 0.85rem;
	}

	.tip-content :global(.oa-name),
	.tip-content :global(.airport-name) {
		font-weight: 600;
		color: #334155;
		min-width: 90px;
	}

	.tip-content :global(.oa-best),
	.tip-content :global(.airport-desc) {
		color: #64748b;
		font-size: 0.8rem;
	}

	/* Transport Options */
	.tip-content :global(.transport-tabs) {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
		margin: 1rem 0;
	}

	.tip-content :global(.transport-option) {
		background: #fff;
		border-radius: 12px;
		padding: 1rem;
		border: 1px solid #e8edf2;
		text-align: left;
	}

	.tip-content :global(.transport-icon) {
		display: block;
		font-size: 1.25rem;
		margin-bottom: 0.5rem;
	}

	.tip-content :global(.transport-option h4) {
		font-size: 0.875rem;
		color: #0f172a;
		margin: 0 0 0.35rem;
		font-weight: 700;
	}

	.tip-content :global(.transport-option p) {
		font-size: 0.8rem;
		color: #475569;
		margin: 0;
		line-height: 1.55;
	}

	/* Routes Grid */
	.tip-content :global(.routes-grid) {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		margin: 1rem 0;
	}

	.tip-content :global(.route-card) {
		background: #fff;
		border-radius: 12px;
		padding: 1rem;
		border: 1px solid #e8edf2;
	}

	.tip-content :global(.route-header) {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid #f1f5f9;
	}

	.tip-content :global(.route-from),
	.tip-content :global(.route-to) {
		font-size: 0.82rem;
		font-weight: 700;
		color: #0f172a;
	}

	.tip-content :global(.route-arrow) {
		font-size: 0.8rem;
		color: #94a3b8;
	}

	.tip-content :global(.route-details) {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
		padding: 0.5rem;
		background: #f8fafc;
		border-radius: 6px;
	}

	.tip-content :global(.route-city) {
		display: block;
		font-size: 0.78rem;
		font-weight: 600;
		color: #0f172a;
	}

	.tip-content :global(.route-distance) {
		display: block;
		font-size: 0.75rem;
		color: #64748b;
	}

	.tip-content :global(.route-options) {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.tip-content :global(.route-option) {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem 0.5rem;
		background: #f8fafc;
		border-radius: 6px;
		font-size: 0.8rem;
	}

	.tip-content :global(.option-icon) {
		font-size: 0.85rem;
		width: 18px;
		text-align: center;
	}

	.tip-content :global(.option-time) {
		flex: 1;
		font-size: 0.78rem;
		font-weight: 500;
		color: #334155;
	}

	.tip-content :global(.option-price) {
		font-size: 0.78rem;
		color: #16a34a;
		font-weight: 600;
	}

	/* Visa Grid */
	.tip-content :global(.visa-intro) {
		margin-bottom: 1rem;
	}

	.tip-content :global(.visa-intro p) {
		font-size: 0.875rem;
		color: #374151;
		line-height: 1.6;
	}

	.tip-content :global(.visa-grid) {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		margin: 1rem 0;
	}

	.tip-content :global(.visa-card) {
		background: #fff;
		border-radius: 12px;
		padding: 1rem;
		border: 1px solid #e8edf2;
	}

	.tip-content :global(.visa-card.premium) {
		border-color: #38BC7D;
		background: #fafffe;
	}

	.tip-content :global(.visa-badge) {
		display: block;
		font-size: 0.85rem;
		margin-bottom: 0.35rem;
	}

	.tip-content :global(.visa-card h4) {
		font-size: 0.875rem;
		color: #0f172a;
		margin: 0 0 0.4rem;
		font-weight: 700;
	}

	.tip-content :global(.visa-status) {
		display: inline-block;
		background: #38BC7D;
		color: white;
		padding: 0.2rem 0.55rem;
		border-radius: 100px;
		font-size: 0.7rem;
		font-weight: 600;
		margin-bottom: 0.35rem;
	}

	.tip-content :global(.visa-card:not(.premium) .visa-status) {
		background: #6366f1;
	}

	.tip-content :global(.visa-detail) {
		font-size: 0.82rem;
		color: #475569;
		margin: 0;
		line-height: 1.55;
	}

	/* Border Status Tags */
	.tip-content :global(.status-open) {
		display: inline-block;
		background: #dcfce7;
		color: #166534;
		padding: 0.2rem 0.55rem;
		border-radius: 100px;
		font-size: 0.72rem;
		font-weight: 600;
	}

	.tip-content :global(.status-verify) {
		display: inline-block;
		background: #fef3c7;
		color: #92400e;
		padding: 0.2rem 0.55rem;
		border-radius: 100px;
		font-size: 0.72rem;
		font-weight: 600;
	}

	/* Final Tip */
	.tip-content :global(.final-tip) {
		background: #f0f9ff;
		border-left: 3px solid #0284c7;
		border-radius: 0 10px 10px 0;
		padding: 1rem 1.25rem;
		margin: 1.5rem 0;
		font-size: 0.9rem;
		color: #0c4a6e;
		line-height: 1.65;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.tip-content :global(.quick-stats-grid) {
			grid-template-columns: repeat(2, 1fr);
		}

		.tip-content :global(.airport-showcase) {
			grid-template-columns: 1fr;
		}

		.tip-content :global(.transport-tabs) {
			grid-template-columns: 1fr;
		}

		.tip-content :global(.routes-grid) {
			grid-template-columns: 1fr;
		}

		.tip-content :global(.visa-grid) {
			grid-template-columns: 1fr;
		}
	}

	.tip-content :global(.pro-tips) {
		background: #f0fdf4;
		border-left: 3px solid #10b981;
		border-radius: 0 10px 10px 0;
		padding: 1.125rem 1.25rem;
		margin: 1.75rem 0;
	}

	.tip-content :global(.pro-tips h3),
	.tip-content :global(.pro-tips h4) {
		color: #065f46;
		margin-top: 0;
		margin-bottom: 0.75rem;
		font-size: 0.9375rem;
		font-weight: 700;
	}

	.tip-content :global(.pro-tips p) {
		margin: 0;
		color: #14532d;
		font-size: 0.9375rem;
		line-height: 1.65;
	}

	.tip-content :global(.pro-tips ol) {
		margin-bottom: 0;
		padding-left: 1.25rem;
	}

	.tip-content :global(.pro-tips li) {
		margin-bottom: 0.6rem;
		color: #14532d;
		line-height: 1.65;
		font-size: 0.9375rem;
	}

	.tip-content :global(.pro-tips li:last-child) {
		margin-bottom: 0;
	}

	.tip-content :global(.pro-tips li strong) {
		color: #047857;
	}

	.tip-content :global(.step-list) {
		counter-reset: step-counter;
		list-style: none;
		padding: 0;
		margin: 1.5rem 0;
	}

	.tip-content :global(.step-list li) {
		counter-increment: step-counter;
		position: relative;
		padding-left: 3.5rem;
		margin-bottom: 1.5rem;
	}

	.tip-content :global(.step-list li::before) {
		content: counter(step-counter);
		position: absolute;
		left: 0;
		top: 0;
		width: 2.5rem;
		height: 2.5rem;
		background: var(--vnk-accent-color, #e74c3c);
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 1.1rem;
	}

	.tip-content :global(.app-card) {
		background: #fff;
		border: 1px solid #e8edf2;
		border-radius: 16px;
		padding: 1.5rem;
		margin: 1rem 0;
	}

	.tip-content :global(.app-cards-container) {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
		margin: 2rem 0;
	}

	.tip-content :global(.app-cards-container .app-card) {
		margin: 0;
	}

	.tip-content :global(.app-card h3) {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 1.25rem;
		font-weight: 700;
		color: #0f172a;
	}

	.tip-content :global(.app-card ul) {
		margin-bottom: 0;
		font-size: 0.95rem;
		line-height: 1.7;
		padding-left: 0;
		list-style: none;
	}

	.tip-content :global(.app-card li) {
		margin-bottom: 0.5rem;
		padding-left: 1.25rem;
		position: relative;
	}

	.tip-content :global(.app-card li::before) {
		content: "✓";
		position: absolute;
		left: 0;
		color: #10b981;
		font-weight: 600;
	}

	.tip-content :global(.emoji-icon) {
		font-size: 1.5rem;
	}

	.tip-content :global(.highlight-box) {
		background: #f0f9ff;
		border-left: 3px solid #0284c7;
		border-radius: 0 10px 10px 0;
		padding: 1rem 1.25rem;
		margin: 1.75rem 0;
	}

	.tip-content :global(.highlight-box p) {
		margin: 0;
		font-size: 0.9875rem;
		line-height: 1.65;
		color: #0c4a6e;
	}

	.tip-content :global(.highlight-box strong) {
		color: #0369a1;
		font-weight: 700;
	}

	.tip-content :global(.warning-box) {
		background: #fffbeb;
		border-left: 3px solid #f59e0b;
		border-radius: 0 10px 10px 0;
		padding: 1rem 1.25rem;
		margin: 1.75rem 0;
	}

	.tip-content :global(.warning-box p) {
		margin: 0;
		color: #78350f;
		font-size: 0.9875rem;
		line-height: 1.65;
	}

	.tip-content :global(.tips-list) {
		padding-left: 0;
		margin: 1.25rem 0;
		list-style: none;
		counter-reset: tips;
	}

	.tip-content :global(.tips-list li) {
		counter-increment: tips;
		margin-bottom: 1rem;
		line-height: 1.7;
		color: #374151;
		padding-left: 2.5rem;
		position: relative;
		font-size: 1rem;
	}

	.tip-content :global(.tips-list li::before) {
		content: counter(tips);
		position: absolute;
		left: 0;
		top: 0.05em;
		width: 1.65rem;
		height: 1.65rem;
		background: #38BC7D;
		color: #fff;
		font-size: 0.75rem;
		font-weight: 700;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tip-content :global(.tips-list li strong) {
		color: #0f172a;
		font-weight: 700;
	}

	/* Visa Checker Styles */
	.tip-content :global(.visa-checker) {
		background: #f8fafc;
		border: 1px solid #e8edf2;
		border-radius: 16px;
		padding: 1.5rem;
		margin: 1.5rem 0;
	}

	.tip-content :global(.visa-checker h3) {
		margin: 0 0 1rem;
		font-size: 1.05rem;
		color: #0f172a;
	}

	.tip-content :global(.country-select) {
		width: 100%;
		padding: 0.75rem 1rem;
		font-size: 1rem;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		background: white;
		color: #334155;
		cursor: pointer;
		margin-bottom: 1rem;
	}

	.tip-content :global(.country-select:focus) {
		outline: none;
		border-color: #38BC7D;
		box-shadow: 0 0 0 3px rgba(56, 188, 125, 0.12);
	}

	.tip-content :global(.visa-result) {
		background: white;
		border-radius: 10px;
		padding: 1.25rem;
		border: 1px solid #f1f5f9;
		text-align: left;
	}

	.tip-content :global(.visa-result p) {
		margin: 0.5rem 0;
		color: #475569;
		font-size: 0.95rem;
	}

	.tip-content :global(.visa-badge) {
		display: inline-block;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-weight: 600;
		font-size: 1rem;
		margin-bottom: 0.5rem;
	}

	.tip-content :global(.visa-free) {
		background: #dcfce7;
		color: #166534;
	}

	.tip-content :global(.visa-evisa) {
		background: #fef3c7;
		color: #92400e;
	}

	.tip-content :global(.visa-cis) {
		background: #e0e7ff;
		color: #3730a3;
	}

	.tip-content :global(.visa-check) {
		background: #fee2e2;
		color: #991b1b;
	}

	.tip-content :global(.options-table) {
		margin: 1.5rem 0;
	}

	.tip-content :global(.tips-grid) {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
		margin: 1.5rem 0;
	}

	.tip-content :global(.tip-card) {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		padding: 1rem;
		position: relative;
	}

	.tip-content :global(.tip-number) {
		display: inline-block;
		background: var(--vnk-accent-color, #e74c3c);
		color: white;
		font-weight: 700;
		font-size: 0.75rem;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		margin-bottom: 0.5rem;
	}

	.tip-content :global(.tip-card h4) {
		font-size: 0.95rem;
		margin: 0 0 0.5rem;
		color: #1e293b;
	}

	.tip-content :global(.tip-card p) {
		font-size: 0.8rem;
		color: #64748b;
		margin: 0;
		line-height: 1.4;
	}

	/* Transport Page Styling */
	.tip-content :global(.transport-grid) {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		margin: 1.5rem 0;
	}

	.tip-content :global(.airport-grid) {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		margin: 1rem 0;
	}

	/* Airlines Grid */
	.tip-content :global(.airlines-grid) {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
		margin: 1rem 0;
	}

	.tip-content :global(.airline-card) {
		background: white;
		border: 1px solid #e8edf2;
		border-radius: 10px;
		padding: 0.85rem 1rem;
		text-align: left;
	}

	.tip-content :global(.airline-card strong) {
		display: block;
		font-size: 0.875rem;
		color: #0f172a;
		margin-bottom: 0.2rem;
	}

	.tip-content :global(.airline-card span) {
		font-size: 0.78rem;
		color: #64748b;
	}

	/* City Grid */
	.tip-content :global(.city-grid) {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		margin: 1rem 0;
	}

	.tip-content :global(.city-card) {
		background: white;
		border: 1px solid #e8edf2;
		border-radius: 12px;
		padding: 1.1rem;
	}

	.tip-content :global(.city-card h4) {
		font-size: 0.95rem;
		color: #0f172a;
		margin: 0 0 0.6rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #f1f5f9;
	}

	.tip-content :global(.city-card ul) {
		margin: 0;
		padding-left: 0;
		list-style: none;
		font-size: 0.82rem;
		color: #475569;
		line-height: 1.55;
	}

	.tip-content :global(.city-card li) {
		margin-bottom: 0.3rem;
		padding-left: 0.85rem;
		position: relative;
	}

	.tip-content :global(.city-card li::before) {
		content: "·";
		position: absolute;
		left: 0;
		color: #94a3b8;
	}

	/* Road Info */
	.tip-content :global(.road-info) {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		margin: 1rem 0;
	}

	.tip-content :global(.road-item) {
		background: #f8fafc;
		border: 1px solid #f1f5f9;
		border-radius: 10px;
		padding: 0.85rem;
		font-size: 0.82rem;
		color: #475569;
		line-height: 1.5;
	}

	.tip-content :global(.road-item strong) {
		color: #0f172a;
		display: block;
		margin-bottom: 0.2rem;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	/* Quick Facts Section */
	.tip-content :global(.quick-facts) {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.75rem;
		margin: 1rem 0 1.5rem;
		padding: 1rem;
		background: #f8fafc;
		border-radius: 12px;
		border: 1px solid #e8edf2;
	}

	.tip-content :global(.fact-item) {
		text-align: center;
		padding: 0.75rem 0.5rem;
		background: white;
		border-radius: 8px;
		font-size: 0.8rem;
		color: #475569;
		border: 1px solid #f1f5f9;
	}

	.tip-content :global(.fact-item strong) {
		display: block;
		font-size: 1.1rem;
		color: #0f172a;
		font-weight: 700;
		margin-bottom: 0.25rem;
	}

	/* Price Table */
	.tip-content :global(.price-table) {
		margin: 1rem 0;
		border-collapse: collapse;
		width: 100%;
		font-size: 0.85rem;
		background: #fff;
		border-radius: 10px;
		overflow: hidden;
		border: 1px solid #e2e8f0;
	}

	.tip-content :global(.price-table thead) {
		background: #f8fafc;
		border-bottom: 2px solid #e2e8f0;
	}

	.tip-content :global(.price-table th) {
		color: #475569;
		font-weight: 600;
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.7rem 1rem;
		text-align: left;
	}

	.tip-content :global(.price-table td) {
		padding: 0.6rem 1rem;
		color: #334155;
		border-bottom: 1px solid #f1f5f9;
		line-height: 1.45;
	}

	.tip-content :global(.price-table tbody tr:last-child td) {
		border-bottom: none;
	}

	.tip-content :global(.price-table tbody tr:hover) {
		background-color: #fafbfc;
	}

	/* Budget Grid */
	.tip-content :global(.budget-grid) {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin: 1rem 0;
	}

	.tip-content :global(.budget-card) {
		background: white;
		border: 1px solid #e8edf2;
		border-radius: 14px;
		padding: 1.25rem;
		text-align: left;
	}

	.tip-content :global(.budget-card h4) {
		font-size: 0.9rem;
		font-weight: 700;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 0.5rem;
	}

	.tip-content :global(.budget-price) {
		font-size: 1.5rem;
		font-weight: 700;
		color: #0f172a;
		margin-bottom: 0.75rem;
		line-height: 1;
	}

	.tip-content :global(.budget-price span) {
		font-size: 0.75rem;
		font-weight: 400;
		color: #94a3b8;
	}

	.tip-content :global(.budget-card ul) {
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 0.82rem;
		color: #475569;
		border-top: 1px solid #f1f5f9;
		padding-top: 0.75rem;
	}

	.tip-content :global(.budget-card li) {
		margin-bottom: 0.35rem;
		padding-left: 0.9rem;
		position: relative;
	}

	.tip-content :global(.budget-card li::before) {
		content: "·";
		position: absolute;
		left: 0;
		color: #94a3b8;
	}

	/* Payment Grid */
	.tip-content :global(.payment-grid) {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.75rem;
		margin: 1rem 0;
	}

	.tip-content :global(.payment-card) {
		background: white;
		border: 1px solid #e8edf2;
		border-radius: 12px;
		padding: 1rem;
	}

	.tip-content :global(.payment-card h4) {
		font-size: 0.82rem;
		font-weight: 700;
		color: #0f172a;
		margin: 0 0 0.6rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #f1f5f9;
	}

	.tip-content :global(.payment-card ul) {
		margin: 0;
		padding-left: 0;
		list-style: none;
		font-size: 0.82rem;
		color: #475569;
		line-height: 1.55;
	}

	.tip-content :global(.payment-card li) {
		margin-bottom: 0.3rem;
		padding-left: 0.85rem;
		position: relative;
	}

	.tip-content :global(.payment-card li::before) {
		content: "·";
		position: absolute;
		left: 0;
		color: #94a3b8;
	}

	/* Practical Grid */
	.tip-content :global(.practical-grid) {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.75rem;
		margin: 1rem 0;
	}

	.tip-content :global(.practical-card) {
		background: white;
		border: 1px solid #e8edf2;
		border-radius: 12px;
		padding: 1rem;
	}

	.tip-content :global(.practical-card h4) {
		font-size: 0.82rem;
		font-weight: 700;
		color: #0f172a;
		margin: 0 0 0.5rem;
		padding-bottom: 0.45rem;
		border-bottom: 1px solid #f1f5f9;
	}

	.tip-content :global(.practical-card p) {
		margin: 0;
		font-size: 0.82rem;
		color: #475569;
		line-height: 1.6;
	}

	.tip-content :global(.rate-note) {
		font-size: 0.875rem;
		color: #64748b;
		margin-bottom: 1rem;
		line-height: 1.6;
	}

	.tip-content :global(.airport-card) {
		background: #fff;
		border: 1px solid #e8edf2;
		border-radius: 12px;
		padding: 1.25rem;
	}

	.tip-content :global(.airport-card h3),
	.tip-content :global(.airport-card h4) {
		color: #0f172a;
		margin: 0 0 0.5rem;
		font-size: 1rem;
		font-weight: 700;
	}

	.tip-content :global(.airport-header) {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.tip-content :global(.airport-code) {
		background: #1e293b;
		color: white;
		font-weight: 700;
		padding: 0.45rem 0.9rem;
		border-radius: 7px;
		display: inline-block;
		font-size: 0.95rem;
		letter-spacing: 0.5px;
	}

	.tip-content :global(.airport-details) {
		background: #f8fafc;
		border-radius: 8px;
		padding: 0.75rem;
		margin: 0.75rem 0;
	}

	.tip-content :global(.detail-row) {
		display: flex;
		justify-content: space-between;
		padding: 0.4rem 0;
		border-bottom: 1px solid #e2e8f0;
		font-size: 0.8rem;
	}

	.tip-content :global(.detail-row:last-child) {
		border-bottom: none;
	}

	.tip-content :global(.detail-row span:first-child) {
		color: #64748b;
		font-weight: 500;
	}

	.tip-content :global(.detail-row span:last-child) {
		color: #0f172a;
		font-weight: 600;
	}

	.tip-content :global(.airport-highlight) {
		color: #475569;
		font-size: 0.85rem;
		margin-bottom: 0.5rem;
		line-height: 1.4;
	}

	.tip-content :global(.airlines-section) {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #e2e8f0;
	}

	.tip-content :global(.airlines-section h5) {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: #64748b;
		margin: 0 0 0.5rem;
		font-weight: 600;
	}

	.tip-content :global(.airlines-section p) {
		font-size: 0.85rem;
		color: #334155;
		margin: 0;
		line-height: 1.5;
	}

	.tip-content :global(.airport-detail) {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
		border-bottom: 1px solid #e2e8f0;
		font-size: 0.9rem;
	}

	.tip-content :global(.airport-detail:last-child) {
		border-bottom: none;
	}

	.tip-content :global(.airlines-list) {
		margin-top: 1rem;
		font-size: 0.85rem;
		color: #64748b;
	}
	.tip-content :global(.activity-grid) {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.75rem;
		margin: 1.5rem 0;
	}

	.tip-content :global(.activity-card) {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		padding: 1rem;
		text-align: center;
	}

	.tip-content :global(.activity-icon) {
		display: block;
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.tip-content :global(.activity-card h4) {
		margin: 0 0 0.25rem;
		font-size: 0.9rem;
		color: #1e293b;
	}

	.tip-content :global(.activity-card p) {
		margin: 0;
		font-size: 0.8rem;
		color: #64748b;
	}

	.tip-content :global(.region-table),
	.tip-content :global(.festival-table),
	.tip-content :global(table) {
		margin: 1rem 0;
		border-collapse: collapse;
		width: 100%;
		font-size: 0.85rem;
		background: #fff;
		border-radius: 10px;
		overflow: hidden;
		border: 1px solid #e2e8f0;
	}

	.tip-content :global(.region-table thead),
	.tip-content :global(.festival-table thead),
	.tip-content :global(table thead) {
		background: #f8fafc;
		border-bottom: 2px solid #e2e8f0;
	}

	.tip-content :global(.region-table th),
	.tip-content :global(.festival-table th),
	.tip-content :global(table th) {
		color: #475569 !important;
		font-weight: 600;
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.7rem 1rem;
		text-align: left;
		border: none;
	}

	.tip-content :global(.region-table td),
	.tip-content :global(.festival-table td),
	.tip-content :global(table td) {
		font-size: 0.85rem;
		padding: 0.65rem 1rem;
		color: #334155;
		border-bottom: 1px solid #f1f5f9;
		line-height: 1.45;
	}

	.tip-content :global(.region-table tbody tr),
	.tip-content :global(.festival-table tbody tr),
	.tip-content :global(table tbody tr) {
		transition: background-color 0.15s ease;
	}

	.tip-content :global(.region-table tbody tr:hover),
	.tip-content :global(.festival-table tbody tr:hover),
	.tip-content :global(table tbody tr:hover) {
		background-color: #fafbfc;
	}

	.tip-content :global(.region-table tbody tr:last-child td),
	.tip-content :global(.festival-table tbody tr:last-child td),
	.tip-content :global(table tbody tr:last-child td) {
		border-bottom: none;
	}

	/* Tab Interface Styles */
	.tip-content :global(.tab-bar) {
		display: flex;
		gap: 4px;
		overflow-x: auto;
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
		background: #f1f5f9;
		border-radius: 12px;
		padding: 4px;
		margin: 1.25rem 0 1rem;
	}

	.tip-content :global(.tab-bar::-webkit-scrollbar) {
		display: none;
	}

	.tip-content :global(.tab-btn) {
		flex-shrink: 0;
		padding: 7px 14px;
		border: none;
		background: transparent;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.82rem;
		color: #64748b;
		transition: background 0.15s, color 0.15s;
		font-weight: 500;
		white-space: nowrap;
		line-height: 1.4;
	}

	.tip-content :global(.tab-btn:hover) {
		background: rgba(255,255,255,0.6);
		color: #334155;
	}

	.tip-content :global(.tab-btn.active) {
		background: #fff;
		color: #0f172a;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
		font-weight: 600;
	}

	.tip-content :global(.tab-panel) {
		animation: fadeIn 0.3s ease;
		padding: 0.25rem 0;
	}

	.tip-content :global(.tab-panel h3) {
		font-size: 1rem;
		color: #1e293b;
		margin: 0 0 0.75rem;
		padding-bottom: 0.4rem;
		border-bottom: 2px solid #e2e8f0;
	}

	.tip-content :global(.tab-panel h4) {
		font-size: 0.9rem;
		color: #334155;
		margin: 0.75rem 0 0.5rem;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(5px); }
		to { opacity: 1; transform: translateY(0); }
	}

	/* Month Grid Chart */
	.tip-content :global(.month-grid) {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		gap: 4px;
		align-items: flex-end;
		margin: 1.5rem 0;
		padding: 1rem 0;
	}

	.tip-content :global(.month-col) {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}

	.tip-content :global(.month-label) {
		font-size: 0.75rem;
		color: #64748b;
		font-weight: 500;
	}

	.tip-content :global(.month-bar) {
		width: 100%;
		border-radius: 4px;
		min-height: 8px;
		transition: transform 0.2s;
	}

	.tip-content :global(.month-bar.best) {
		border: 2px solid #1D9E75;
	}

	.tip-content :global(.month-bar:hover) {
		transform: scaleY(1.1);
	}

	.tip-content :global(.month-temp) {
		font-size: 0.7rem;
		color: #94a3b8;
	}

	.tip-content :global(.month-desc) {
		font-size: 0.6rem;
		color: #94a3b8;
		text-align: center;
		margin-top: 2px;
	}

	/* Season Cards */
	.tip-content :global(.season-cards) {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.25rem;
		margin: 1.25rem 0;
	}

	.tip-content :global(.season-card) {
		border: 1px solid #e8edf2;
		border-radius: 16px;
		padding: 1.5rem;
		position: relative;
		background: #fff;
		text-align: left;
	}

	.tip-content :global(.season-card.best) {
		border-color: #38BC7D;
		background: #fafffe;
	}

	.tip-content :global(.best-badge) {
		position: absolute;
		top: -11px;
		left: 16px;
		background: #38BC7D;
		color: #fff;
		font-size: 0.6rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 3px 10px;
		border-radius: 100px;
	}

	.tip-content :global(.season-header) {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		margin-bottom: 0.5rem;
	}

	.tip-content :global(.season-icon) {
		font-size: 1.75rem;
		line-height: 1;
	}

	.tip-content :global(.season-name) {
		font-size: 1.05rem;
		font-weight: 700;
		color: #0f172a;
		line-height: 1.2;
	}

	.tip-content :global(.season-months) {
		font-size: 0.8rem;
		color: #64748b;
		margin-top: 1px;
	}

	.tip-content :global(.season-temp) {
		font-size: 0.9rem;
		font-weight: 600;
		margin: 0.5rem 0 0.75rem;
		letter-spacing: 0.01em;
	}

	.tip-content :global(.season-desc) {
		font-size: 0.9rem;
		color: #374151;
		margin-bottom: 1rem;
		line-height: 1.65;
		text-align: left;
	}

	.tip-content :global(.season-highlights) {
		background: rgba(0,0,0,0.03);
		border-radius: 8px;
		padding: 0.75rem;
		margin-top: 0.75rem;
	}

	.tip-content :global(.season-highlights h5) {
		font-size: 0.75rem;
		margin: 0 0 0.4rem;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
	}

	.tip-content :global(.season-highlights ul) {
		margin: 0;
		padding-left: 1rem;
		font-size: 0.82rem;
		color: #475569;
	}

	.tip-content :global(.season-highlights li) {
		margin-bottom: 0.25rem;
	}

	.tip-content :global(.season-pros) {
		list-style: none;
		padding: 0;
		margin: 0;
		border-top: 1px solid #f1f5f9;
		padding-top: 0.75rem;
	}

	.tip-content :global(.season-pros li) {
		display: flex;
		align-items: flex-start;
		gap: 0.55rem;
		font-size: 0.875rem;
		color: #374151;
		margin-bottom: 0.45rem;
		line-height: 1.45;
		text-align: left;
	}

	.tip-content :global(.season-pros li:last-child) {
		margin-bottom: 0;
	}

	.tip-content :global(.pro-dot) {
		flex-shrink: 0;
		margin-top: 3px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
		font-weight: 700;
		line-height: 1;
	}

	.tip-content :global(.dot-green) {
		background: #dcfce7;
		color: #16a34a;
	}

	.tip-content :global(.dot-green::after) {
		content: "✓";
	}

	.tip-content :global(.dot-red) {
		background: #fee2e2;
		color: #dc2626;
	}

	.tip-content :global(.dot-red::after) {
		content: "−";
	}

	/* Region table styling */
	.tip-content :global(.region-intro),
	.tip-content :global(.festival-intro) {
		margin-bottom: 1rem;
		color: #64748b;
	}

	.tip-content :global(.region-table th),
	.tip-content :global(.festival-table th) {
		color: #475569 !important;
		font-weight: 600;
		font-size: 0.7rem;
		background: transparent;
	}

	.tip-content :global(.region-table td),
	.tip-content :global(.festival-table td) {
		font-size: 0.85rem;
		padding: 0.65rem 1rem;
		color: #334155;
	}

	.tip-content :global(.region-desc) {
		display: block;
		font-size: 0.7rem;
		color: #94a3b8;
		font-weight: normal;
	}

	.tip-content :global(.best-time) {
		font-size: 0.7rem;
		color: #10b981;
		font-weight: 600;
	}

	.tip-content :global(.festival-name) {
		font-weight: 600;
		color: #1e293b;
		font-size: 0.85rem;
	}

	.tip-content :global(.region-table),
	.tip-content :global(.festival-table) {
		font-size: 0.8rem;
	}

	.tip-content :global(.lead-text) {
		font-size: 1.125rem;
		font-weight: 400;
		line-height: 1.8;
		color: #475569;
		margin: 0 0 2rem;
		padding: 0;
		background: none;
		border: none;
		border-radius: 0;
	}

	.tip-content :global(.airport-table) {
		margin: 1.5rem 0;
	}

	.tip-content :global(.airport-table thead th) {
		background: #f8fafc !important;
		color: #475569 !important;
	}

	@media (max-width: 768px) {

		/* ── Wrapper & article card ── */
		.content-wrapper {
			padding: 0.5rem !important;
		}

		.tip-content {
			padding: 1.25rem 1rem !important;
			border-radius: 12px !important;
			box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06) !important;
		}

		/* ── Typography ── */
		.tip-content :global(p),
		.tip-content :global(li) {
			font-size: 1rem !important;
			line-height: 1.72 !important;
		}

		.tip-content :global(p) {
			margin-bottom: 1rem !important;
		}

		.tip-content :global(h2) {
			font-size: 1.3rem !important;
			margin: 2rem 0 0.7rem !important;
		}

		.tip-content :global(h3) {
			font-size: 1.1rem !important;
			margin: 1.5rem 0 0.5rem !important;
		}

		.tip-content :global(h4) {
			font-size: 0.95rem !important;
			margin: 1.1rem 0 0.35rem !important;
		}

		.tip-content :global(.lead-text) {
			font-size: 1rem !important;
			line-height: 1.72 !important;
			margin-bottom: 1.5rem !important;
		}

		/* ── Quick Facts: 2×2 ── */
		.tip-content :global(.quick-facts) {
			grid-template-columns: repeat(2, 1fr) !important;
			gap: 0.5rem !important;
			padding: 0.65rem !important;
		}

		.tip-content :global(.fact-item) {
			padding: 0.65rem 0.4rem !important;
			font-size: 0.75rem !important;
			hyphens: none !important;
			word-break: normal !important;
		}

		.tip-content :global(.fact-item strong) {
			font-size: 1.05rem !important;
		}

		/* ── Month temperature chart: horizontal scroll ── */
		.tip-content :global(.month-grid) {
			display: flex !important;
			overflow-x: auto !important;
			gap: 6px !important;
			padding: 0.5rem 0 0.75rem !important;
			scrollbar-width: none !important;
			-webkit-overflow-scrolling: touch !important;
			align-items: flex-end !important;
		}

		.tip-content :global(.month-col) {
			flex: 0 0 44px !important;
			min-width: 44px !important;
		}

		.tip-content :global(.month-label) {
			font-size: 0.62rem !important;
		}

		.tip-content :global(.month-temp) {
			font-size: 0.58rem !important;
		}

		.tip-content :global(.month-desc) {
			display: none !important;
		}

		/* ── Tab bar: compact on mobile ── */
		.tip-content :global(.tab-bar) {
			gap: 3px !important;
			padding: 3px !important;
			margin: 1rem 0 0.75rem !important;
		}

		.tip-content :global(.tab-btn) {
			font-size: 0.78rem !important;
			padding: 6px 11px !important;
		}

		.tip-content :global(.tab-panel) {
			padding: 0.5rem 0 !important;
		}

		/* ── Season cards: single column ── */
		.tip-content :global(.season-cards) {
			grid-template-columns: 1fr !important;
			gap: 1rem !important;
		}

		.tip-content :global(.season-card) {
			padding: 1.25rem !important;
		}

		.tip-content :global(.season-desc) {
			font-size: 0.9rem !important;
		}

		.tip-content :global(.season-pros li) {
			font-size: 0.85rem !important;
		}

		/* ── Activity grid: 2 columns ── */
		.tip-content :global(.activity-grid) {
			grid-template-columns: repeat(2, 1fr) !important;
			gap: 0.6rem !important;
		}

		/* ── Airport / city grids: single column ── */
		.tip-content :global(.airport-grid),
		.tip-content :global(.city-grid) {
			grid-template-columns: 1fr !important;
		}

		/* ── Airlines grid: 2 columns ── */
		.tip-content :global(.airlines-grid) {
			grid-template-columns: repeat(2, 1fr) !important;
		}

		/* ── Payment / practical grids: 2 columns ── */
		.tip-content :global(.payment-grid),
		.tip-content :global(.practical-grid) {
			grid-template-columns: repeat(2, 1fr) !important;
			gap: 0.6rem !important;
		}

		.tip-content :global(.payment-card),
		.tip-content :global(.practical-card) {
			padding: 0.85rem !important;
			border-radius: 10px !important;
		}

		.tip-content :global(.payment-card h4),
		.tip-content :global(.practical-card h4) {
			font-size: 0.82rem !important;
			margin: 0 0 0.35rem !important;
		}

		.tip-content :global(.payment-card p),
		.tip-content :global(.practical-card p),
		.tip-content :global(.payment-card li),
		.tip-content :global(.practical-card li) {
			font-size: 0.78rem !important;
			line-height: 1.5 !important;
		}

		/* ── Budget grid: single column ── */
		.tip-content :global(.budget-grid) {
			grid-template-columns: 1fr !important;
		}

		/* ── Road info: 2 columns ── */
		.tip-content :global(.road-info) {
			grid-template-columns: repeat(2, 1fr) !important;
		}

		/* ── Tips grid (4col → 2col) ── */
		.tip-content :global(.tips-grid) {
			grid-template-columns: repeat(2, 1fr) !important;
		}

		/* ── App cards: single column ── */
		.tip-content :global(.app-cards-container) {
			grid-template-columns: 1fr !important;
			gap: 1rem !important;
		}

		/* ── All tables: horizontal scroll ── */
		.tip-content :global(table),
		.tip-content :global(.price-table),
		.tip-content :global(.region-table),
		.tip-content :global(.festival-table),
		.tip-content :global(.route-table) {
			display: block !important;
			overflow-x: auto !important;
			-webkit-overflow-scrolling: touch !important;
			max-width: 100% !important;
			white-space: nowrap !important;
			font-size: 0.82rem !important;
			margin: 1rem 0 !important;
		}

		.tip-content :global(table th),
		.tip-content :global(table td) {
			white-space: normal !important;
			min-width: 80px !important;
			padding: 0.55rem 0.75rem !important;
		}

		/* ── Callout boxes ── */
		.tip-content :global(.highlight-box),
		.tip-content :global(.warning-box) {
			padding: 0.85rem 1rem !important;
		}

		.tip-content :global(.highlight-box p),
		.tip-content :global(.warning-box p) {
			font-size: 0.9rem !important;
			line-height: 1.6 !important;
		}

		.tip-content :global(.pro-tips) {
			padding: 1rem !important;
		}

		.tip-content :global(.pro-tips li) {
			font-size: 0.88rem !important;
			line-height: 1.55 !important;
		}

		/* ── Numbered tips list ── */
		.tip-content :global(.tips-list li) {
			font-size: 0.9rem !important;
			line-height: 1.6 !important;
			padding-left: 2.25rem !important;
			margin-bottom: 0.85rem !important;
		}

		.tip-content :global(.tips-list li::before) {
			width: 1.5rem !important;
			height: 1.5rem !important;
			font-size: 0.7rem !important;
		}

		/* ── Visa checker ── */
		.tip-content :global(.visa-checker) {
			padding: 1rem !important;
		}

		.tip-content :global(.country-select) {
			font-size: 1rem !important;
			padding: 0.65rem 0.85rem !important;
		}

		/* ── Visa result: left-aligned on mobile ── */
		.tip-content :global(.visa-result) {
			text-align: left !important;
		}

		/* ── Quick stats: 2 cols ── */
		.tip-content :global(.quick-stats-grid) {
			grid-template-columns: repeat(2, 1fr) !important;
		}

		/* ── Airport showcase: 1 col ── */
		.tip-content :global(.airport-showcase) {
			grid-template-columns: 1fr !important;
		}

		/* ── Transport tabs: 1 col ── */
		.tip-content :global(.transport-tabs) {
			grid-template-columns: 1fr !important;
		}

		/* ── Routes grid: 1 col ── */
		.tip-content :global(.routes-grid) {
			grid-template-columns: 1fr !important;
		}

		/* ── Visa grid: 1 col ── */
		.tip-content :global(.visa-grid) {
			grid-template-columns: 1fr !important;
		}

	}
</style>
