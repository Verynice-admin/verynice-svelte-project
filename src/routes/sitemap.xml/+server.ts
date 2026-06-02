import type { RequestHandler } from './$types';
import { adminDB } from '$lib/server/firebaseAdmin';

const SITE = 'https://verynice.kz';

// Static routes with accurate lastmod dates — update this date when the page content changes.
// Using a real date (rather than today) prevents false cache-freshness signals to crawlers.
const STATIC_ROUTES: { path: string; priority: string; changefreq: string; lastmod: string }[] = [
	{ path: '/', priority: '1.0', changefreq: 'daily',   lastmod: '2026-05-01' },
	{ path: '/history', priority: '0.9', changefreq: 'weekly',  lastmod: '2026-05-01' },
	{ path: '/destinations', priority: '0.9', changefreq: 'weekly',  lastmod: '2026-05-01' },
	{ path: '/culture', priority: '0.8', changefreq: 'weekly',  lastmod: '2026-05-01' },
	{ path: '/culture/traditions-customs', priority: '0.7', changefreq: 'monthly', lastmod: '2026-04-01' },
	{ path: '/culture/arts-crafts', priority: '0.7', changefreq: 'monthly', lastmod: '2026-04-01' },
	{ path: '/culture/kazakh-melodies', priority: '0.7', changefreq: 'monthly', lastmod: '2026-04-01' },
	{ path: '/culture/mythology-folklore', priority: '0.7', changefreq: 'monthly', lastmod: '2026-04-01' },
	{ path: '/culture/traditional-clothing', priority: '0.7', changefreq: 'monthly', lastmod: '2026-04-01' },
	{ path: '/culture/traditional-games', priority: '0.7', changefreq: 'monthly', lastmod: '2026-04-01' },
	{ path: '/culture/yurt-nomadic-life', priority: '0.7', changefreq: 'monthly', lastmod: '2026-04-01' },
	{ path: '/food-drink', priority: '0.8', changefreq: 'weekly',  lastmod: '2026-05-01' },
	{ path: '/food-drink/signature-dishes', priority: '0.7', changefreq: 'monthly', lastmod: '2026-04-01' },
	{ path: '/food-drink/traditional-dastarkhan', priority: '0.7', changefreq: 'monthly', lastmod: '2026-04-01' },
	{ path: '/food-drink/silk-road-noodles', priority: '0.7', changefreq: 'monthly', lastmod: '2026-04-01' },
	{ path: '/food-drink/tea-house-courtyard', priority: '0.7', changefreq: 'monthly', lastmod: '2026-04-01' },
	{ path: '/food-drink/international-tastes', priority: '0.7', changefreq: 'monthly', lastmod: '2026-04-01' },
	{ path: '/tips', priority: '0.8', changefreq: 'weekly',  lastmod: '2026-05-01' },
	{ path: '/tips/best-time-to-visit', priority: '0.7', changefreq: 'monthly', lastmod: '2026-04-01' },
	{ path: '/tips/visa-entry-requirements', priority: '0.7', changefreq: 'monthly', lastmod: '2026-04-01' },
	{ path: '/tips/safety-general-precautions', priority: '0.7', changefreq: 'monthly', lastmod: '2026-04-01' },
	{ path: '/tips/getting-there-around', priority: '0.7', changefreq: 'monthly', lastmod: '2026-04-01' },
	{ path: '/tips/money-costs-tips', priority: '0.7', changefreq: 'monthly', lastmod: '2026-04-01' },
	{ path: '/about-borat', priority: '0.5', changefreq: 'monthly', lastmod: '2026-04-01' },
	{ path: '/about-us', priority: '0.4', changefreq: 'yearly',  lastmod: '2026-01-01' },
	{ path: '/reviews', priority: '0.5', changefreq: 'weekly',  lastmod: '2026-05-01' },
	{ path: '/contact', priority: '0.4', changefreq: 'yearly',  lastmod: '2026-01-01' },
	{ path: '/privacy', priority: '0.3', changefreq: 'yearly',  lastmod: '2026-05-17' },
	{ path: '/terms', priority: '0.3', changefreq: 'yearly',  lastmod: '2026-01-01' },
];

function url(path: string, priority: string, changefreq: string, lastmod: string): string {
	return `  <url>
    <loc>${SITE}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export const GET: RequestHandler = async () => {
	const urls: string[] = STATIC_ROUTES.map((r) => url(r.path, r.priority, r.changefreq, r.lastmod));

	// Fetch all destination slugs from Firestore
	if (adminDB) {
		try {
			const attractionsSnap = await adminDB.collectionGroup('attractions').limit(5000).get();
			const seen = new Set<string>();

			for (const doc of attractionsSnap.docs) {
				const data = doc.data();
				const slug: string = (data.slug || doc.id || '').toLowerCase().replace(/_/g, '-').trim();
				if (slug && !seen.has(slug)) {
					seen.add(slug);
					const lastmod: string =
						data.updatedAt?.toDate?.()?.toISOString?.()?.split('T')[0] ?? '2026-05-01';
					urls.push(url(`/destinations/${slug}`, '0.6', 'weekly', lastmod));
				}
			}
		} catch {
			// Firestore unavailable — sitemap still works with static routes
		}
	}

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=3600'
		}
	});
};
