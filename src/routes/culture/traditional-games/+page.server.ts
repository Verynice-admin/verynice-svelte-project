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
	headerBackgroundPublicId: 'content/pages/heritage/traditionalGames/baigeAlamanBaige'
};

const FALLBACK_SECTIONS = [
	{ id: 'kokpar', order: 1, title: 'Kokpar', description: 'The most thrilling Kazakh sport.', imagePublicId: 'content/pages/heritage/traditionalGames/kokpar', contentMarkdown: 'Kokpar is the most thrilling Kazakh sport.' },
	{ id: 'audaryspak', order: 2, title: 'Audaryspak', description: 'Wrestling on horseback.', imagePublicId: 'content/pages/heritage/traditionalGames/audaryspak', contentMarkdown: 'Audaryspak combines wrestling and horsemanship.' },
	{ id: 'kyzkuu', order: 3, title: 'Kyz Kuu', description: 'The romantic chase game.', imagePublicId: 'content/pages/heritage/traditionalGames/kyzKuu', contentMarkdown: 'Kyz Kuu is a beloved Kazakh traditional game.' },
	{ id: 'kazakh-kures', order: 4, title: 'Kazakh Kures', description: 'Traditional wrestling.', imagePublicId: 'content/pages/heritage/traditionalGames/kazakshaKures', contentMarkdown: 'Kures is one of the oldest sports in Central Asia.' },
	{ id: 'togyzkumalak', order: 5, title: 'Togyzkumalak', description: 'The game of 41 stones.', imagePublicId: 'content/pages/heritage/traditionalGames/togyzkumalak', contentMarkdown: 'Togyzkumalak is a traditional board game.' },
	{ id: 'assyk-atu', order: 6, title: 'Ashyk Aty', description: 'Bone game of champions.', imagePublicId: 'content/pages/heritage/traditionalGames/assykAtu', contentMarkdown: 'Ashyk Aty is played with sheep ankle bones.' },
	{ id: 'er-enish', order: 7, title: 'Er Enish', description: 'Fight for the sash.', imagePublicId: 'content/pages/heritage/traditionalGames/erEnish', contentMarkdown: 'Er Enish is a test of strength.' },
	{ id: 'altybakan', order: 8, title: 'Altybakan', description: 'The six-goal game.', imagePublicId: 'content/pages/heritage/traditionalGames/altybakan', contentMarkdown: 'Altybakan is a traditional team sport.' },
	{ id: 'bese-tas', order: 9, title: 'Bese Tas', description: 'Five stones game.', imagePublicId: 'content/pages/heritage/traditionalGames/besTas', contentMarkdown: 'Bese Tas is a dexterity game.' },
	{ id: 'buerkuet-salu', order: 10, title: 'Bürküt Salu', description: 'Eagle raising.', imagePublicId: 'content/pages/heritage/traditionalGames/bürkütSalu', contentMarkdown: 'Bürküt Salu is an ancient tradition.' },
	{ id: 'arqan-tartys', order: 11, title: 'Arqan Tartys', description: 'Tug-of-war.', imagePublicId: 'content/pages/heritage/traditionalGames/arqanTartys', contentMarkdown: 'Arqan Tartys is a test of team strength.' },
	{ id: 'baige', order: 12, title: 'Baige', description: 'Traditional horse racing.', imagePublicId: 'content/pages/heritage/traditionalGames/baigeAlamanBaige', contentMarkdown: 'Baige tests endurance across the steppe.' },
	{ id: 'tenge-alu', order: 13, title: 'Tenge Alu', description: 'Picking up coins.', imagePublicId: 'content/pages/heritage/traditionalGames/teńgeIluKumealu', contentMarkdown: 'Tenge Alu tests riding skills.' }
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
