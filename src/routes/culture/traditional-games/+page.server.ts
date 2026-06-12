import { adminDB } from '$lib/server/firebaseAdmin';
import type { PageServerLoad } from './$types';

function serializeDates(obj: any): any {
	if (!obj || typeof obj !== 'object') return obj;
	if (Array.isArray(obj)) return obj.map((item) => serializeDates(item));
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

const FALLBACK_PAGE = {
	seo: {
		title: 'Traditional Games & Sports | Heritage | VeryNice',
		description:
			'Discover Kokpar, Audaryspak, Kyz Kuu and other ancient Kazakh games that test strength, skill, and courage.'
	},
	mainTitle: 'Traditional Games & Sports',
	headerDescription:
		'From the thrilling Kokpar to the playful Kyz Kuu — experience the ancient sports that forged the Kazakh warrior spirit and continue to captivate audiences today.',
	heroKicker: 'Warrior Traditions',
	location: 'Kazakhstan',
	articleViews: 0,
	articleLikes: 0,
	articleComments: 0,
	breadcrumbs: [
		{ label: 'Home', href: '/' },
		{ label: 'Heritage', href: '/culture' },
		{ label: 'Traditional Games' }
	],
	headerBackgroundPublicId: 'content/pages/destinations/Almaty_nearby/altyn-emel-national-park/altyn-emel-national-park-01'
};

const FALLBACK_SECTIONS = [
	{ id: 'kokpar', order: 1, title: 'Kokpar', description: 'The most thrilling Kazakh sport.', imagePublicId: 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-01', contentMarkdown: 'Kokpar is the most thrilling Kazakh sport.' },
	{ id: 'audaryspak', order: 2, title: 'Audaryspak', description: 'Wrestling on horseback.', imagePublicId: 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-02', contentMarkdown: 'Audaryspak combines wrestling and horsemanship.' },
	{ id: 'kyzkuu', order: 3, title: 'Kyz Kuu', description: 'The romantic chase game.', imagePublicId: 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-03', contentMarkdown: 'Kyz Kuu is a beloved Kazakh traditional game.' },
	{ id: 'kazakh-kures', order: 4, title: 'Kazakh Kures', description: 'Traditional wrestling.', imagePublicId: 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-04', contentMarkdown: 'Kures is one of the oldest sports in Central Asia.' },
	{ id: 'togyzkumalak', order: 5, title: 'Togyzkumalak', description: 'The game of 41 stones.', imagePublicId: 'content/pages/destinations/Almaty_nearby/besshatyr-scythian-mounds/besshatyr-scythian-mounds-01', contentMarkdown: 'Togyzkumalak is a traditional board game.' },
	{ id: 'assyk-atu', order: 6, title: 'Ashyk Aty', description: 'Bone game of champions.', imagePublicId: 'content/pages/destinations/Almaty_nearby/besshatyr-scythian-mounds/besshatyr-scythian-mounds-02', contentMarkdown: 'Ashyk Aty is played with sheep ankle bones.' },
	{ id: 'er-enish', order: 7, title: 'Er Enish', description: 'Fight for the sash.', imagePublicId: 'content/pages/destinations/Almaty_nearby/zenkov-cathedral/zenkov-cathedral-01', contentMarkdown: 'Er Enish is a test of strength.' },
	{ id: 'altybakan', order: 8, title: 'Altybakan', description: 'The six-goal game.', imagePublicId: 'content/pages/destinations/Almaty_nearby/zenkov-cathedral/zenkov-cathedral-02', contentMarkdown: 'Altybakan is a traditional team sport.' },
	{ id: 'bese-tas', order: 9, title: 'Bese Tas', description: 'Five stones game.', imagePublicId: 'content/pages/destinations/Almaty_nearby/central-state-museum/central-state-museum-01', contentMarkdown: 'Bese Tas is a dexterity game.' },
	{ id: 'buerkuet-salu', order: 10, title: 'Bürküt Salu', description: 'Eagle raising.', imagePublicId: 'content/pages/destinations/Almaty_nearby/central-state-museum/central-state-museum-02', contentMarkdown: 'Bürküt Salu is an ancient tradition.' },
	{ id: 'arqan-tartys', order: 11, title: 'Arqan Tartys', description: 'Tug-of-war.', imagePublicId: 'content/pages/destinations/Almaty_nearby/panfilov-park/panfilov-park-01', contentMarkdown: 'Arqan Tartys is a test of team strength.' },
	{ id: 'baige', order: 12, title: 'Baige', description: 'Traditional horse racing.', imagePublicId: 'content/pages/destinations/Almaty_nearby/panfilov-park/panfilov-park-02', contentMarkdown: 'Baige tests endurance across the steppe.' },
	{ id: 'tenge-alu', order: 13, title: 'Tenge Alu', description: 'Picking up coins.', imagePublicId: 'content/pages/destinations/Almaty_nearby/altyn-emel-national-park/altyn-emel-national-park-01', contentMarkdown: 'Tenge Alu tests riding skills.' }
];

export const load: PageServerLoad = async () => {
	if (!adminDB) {
		return { page: FALLBACK_PAGE, sections: FALLBACK_SECTIONS };
	}

	try {
		const pageRef = adminDB.collection('pages').doc('heritage').collection('articles').doc('traditionalGames');
		const [pageSnap, sectionsSnap] = await Promise.all([
			pageRef.get(),
			pageRef.collection('sections').orderBy('order', 'asc').get()
		]);

		const page = pageSnap.exists ? serializeDates(pageSnap.data()) : {};
		const sections = sectionsSnap.docs.length
			? sectionsSnap.docs.map((doc) => serializeDates({ id: doc.id, ...doc.data() }))
			: FALLBACK_SECTIONS;

		return { page: { ...FALLBACK_PAGE, ...page }, sections };
	} catch (error) {
		console.error('[culture/traditional-games] load error', error);
		return { page: FALLBACK_PAGE, sections: FALLBACK_SECTIONS };
	}
};
