import { adminDB } from '$lib/server/firebaseAdmin';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Serialize Firestore Timestamps to ISO strings for client-side
function serializeDates(obj: any): any {
	if (!obj || typeof obj !== 'object') return obj;
	if (Array.isArray(obj)) {
		return obj.map((item) => serializeDates(item));
	}
	const out: any = {};
	for (const k of Object.keys(obj)) {
		const v = obj[k];
		if (v && typeof v.toDate === 'function') {
			out[k] = v.toDate().toISOString();
		} else if (v && typeof v === 'object' && !Array.isArray(v)) {
			if (typeof v.latitude === 'number' && typeof v.longitude === 'number') {
				out[k] = { lat: v.latitude, lng: v.longitude };
			} else {
				out[k] = serializeDates(v);
			}
		} else {
			out[k] = v;
		}
	}
	return out;
}

const TIP_SLUG_MAPPING: Record<string, string> = {
	'best-time-to-visit': 'best-time-to-visit',
	'visa-entry-requirements': 'visa-entry-requirements',
	'safety-general-precautions': 'safety-general-precautions',
	'getting-there-around': 'getting-there-around',
	'getting-around': 'getting-there-around', // fallback for old/invalid links
	'airport-taxi-guide': 'airport-taxi-guide',
	'money-costs-tips': 'money-costs-tips'
};

const DEFAULT_PAGE = {
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
	headerBackgroundPublicId: 'content/pages/destinations/Almaty_nearby/kolsai-lakes/kolsai-lakes-01'
};

export const load: PageServerLoad = async ({ params }) => {
	if (!adminDB) {
		console.error('[tips/:slug] Firebase Admin has not been initialized.');
		throw error(500, 'Server database connection failed.');
	}

	const { slug } = params;
	const tipId = TIP_SLUG_MAPPING[slug] || slug;

	try {
		// Fetch tip from pages/travelTipsPage/tips/{slug}
		const tipRef = adminDB.collection('pages').doc('travelTipsPage').collection('tips').doc(tipId);
		const tipSnap = await tipRef.get();

		if (!tipSnap.exists) {
			console.warn(`[tips/:slug] Tip not found: ${tipId}`);
			throw error(404, 'Travel tip not found');
		}

		const tip = serializeDates({ id: tipSnap.id, ...tipSnap.data() });

		// Fetch the parent page for breadcrumbs
		const pageRef = adminDB.collection('pages').doc('travelTipsPage');
		const pageSnap = await pageRef.get();
		const pageData = pageSnap.exists ? serializeDates(pageSnap.data()) : DEFAULT_PAGE;

		return {
			tip,
			page: {
				...DEFAULT_PAGE,
				...pageData,
				breadcrumbs: [
					{ label: 'Home', href: '/' },
					{ label: 'Travel Tips', href: '/tips' },
					{ label: tip.title || 'Travel Tip' }
				]
			}
		};
	} catch (err: any) {
		if (err.status === 404) {
			throw err;
		}
		console.error('[tips/:slug] Error loading tip:', err);
		throw error(500, 'Failed to load travel tip');
	}
};
