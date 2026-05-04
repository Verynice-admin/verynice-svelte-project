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

const PUBLIC_ID_BASE = 'content/pages/foodDrinks/internationalTastes';
const MAIN_HERO_PUBLIC_ID = `${PUBLIC_ID_BASE}/tom_yam`;
const LEGACY_HERO_PUBLIC_IDS = new Set([
	`${PUBLIC_ID_BASE}/hero`,
	'content/pages/foodDrinks/internationalTastes/hero'
]);

function resolveInternationalHeroPublicId(value: any): string {
	if (typeof value !== 'string' || !value.trim()) {
		console.warn('[InternationalTastes] Empty hero public ID, using fallback:', MAIN_HERO_PUBLIC_ID);
		return MAIN_HERO_PUBLIC_ID;
	}
	const v = value.trim();
	const vLower = v.toLowerCase();
	if (LEGACY_HERO_PUBLIC_IDS.has(v)) {
		console.log('[InternationalTastes] Redirecting legacy hero ID to new image:', v, '->', MAIN_HERO_PUBLIC_ID);
		return MAIN_HERO_PUBLIC_ID;
	}
	if (vLower.endsWith('/hero') || vLower.endsWith('/hero.jpg') || vLower.endsWith('/hero.jpeg') || vLower.endsWith('/hero.png')) {
		console.log('[InternationalTastes] Redirecting generic hero path to new image:', v, '->', MAIN_HERO_PUBLIC_ID);
		return MAIN_HERO_PUBLIC_ID;
	}
	return v;
}

const FALLBACK_PAGE = {
	seo: {
		title: 'International Tastes | VeryNice',
		description: 'Explore the international flavors found across Kazakhstan.'
	},
	mainTitle: 'International Tastes of Kazakhstan',
	headerDescription:
		'From East Asian noodles to Mediterranean mezze, discover the global flavors that define the modern Kazakh dining scene.',
	heroKicker: 'World of Flavors',
	location: 'Kazakhstan',
	articleViews: 0,
	articleLikes: 0,
	articleComments: 0,
	breadcrumbs: [
		{ label: 'Home', href: '/' },
		{ label: 'Food & Drinks', href: '/food-drink' },
		{ label: 'International Tastes' }
	],
	headerBackgroundPublicId: MAIN_HERO_PUBLIC_ID
};

const FALLBACK_CATEGORIES = [
	{
		id: 'japan',
		title: 'Japan',
		description: 'Sushi bars, ramen shops, and izakaya-inspired favorites.',
		order: 1
	},
	{
		id: 'korea',
		title: 'Korea',
		description: 'Fermented, spicy, and crispy favorites from Korean kitchens.',
		order: 2
	},
	{
		id: 'china',
		title: 'China',
		description: 'Noodles, stir-fries, and classic Chinese comfort dishes.',
		order: 3
	},
	{
		id: 'thailand',
		title: 'Thailand',
		description: 'Bright, sweet, sour, and spicy Thai flavors.',
		order: 4
	},
	{
		id: 'taiwan',
		title: 'Taiwan',
		description: 'Bubble tea and Taiwanese street classics.',
		order: 5
	},
	{
		id: 'italy',
		title: 'Italy',
		description: 'Pasta, pizza, and Italian cafe staples.',
		order: 6
	},
	{
		id: 'france',
		title: 'France',
		description: 'Bistro classics and elegant French comfort food.',
		order: 7
	},
	{
		id: 'usa',
		title: 'USA',
		description: 'American comfort food and diner staples.',
		order: 8
	},
	{
		id: 'mexico',
		title: 'Mexico',
		description: 'Bold, fresh Mexican street food.',
		order: 9
	},
	{
		id: 'middle-east',
		title: 'Turkey & Middle East',
		description: 'Grilled meats, breads, and mezze favorites.',
		order: 10
	},
	{
		id: 'central-asia',
		title: 'Central Asia',
		description: 'Hearty Silk Road dishes shared across the region.',
		order: 11
	},
	{
		id: 'eastern-europe',
		title: 'Eastern Europe',
		description: 'Slavic comfort dishes and bakery classics.',
		order: 12
	},
	{
		id: 'caucasus',
		title: 'Caucasus',
		description: 'Georgian specialties with rich doughs and spices.',
		order: 13
	},
	{
		id: 'mediterranean',
		title: 'Mediterranean',
		description: 'Fresh salads and sunlit flavors from the Med.',
		order: 14
	}
];

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
	japan: 'A Japanese favorite that is easy to find in Kazakh cities.',
	korea: 'A Korean specialty loved for bold flavors.',
	china: 'A Chinese classic popular across local menus.',
	thailand: 'A Thai dish known for sweet, sour, and spicy balance.',
	taiwan: 'A Taiwanese street classic that has become a cafe staple.',
	italy: 'An Italian staple served in restaurants and cafes.',
	france: 'A French classic with timeless appeal.',
	usa: 'An American comfort favorite found everywhere.',
	mexico: 'A Mexican street-food icon.',
	'middle-east': 'A Middle Eastern or Turkish staple found in city eateries.',
	'central-asia': 'A Central Asian dish with Silk Road roots.',
	'eastern-europe': 'An Eastern European comfort classic.',
	caucasus: 'A Caucasus specialty with rich doughs and spices.',
	mediterranean: 'A Mediterranean dish centered on fresh ingredients.'
};

const FALLBACK_DISHES = [
	{ id: 'sushi', title: 'Sushi', category: 'japan', order: 1 },
	{ id: 'ramen', title: 'Ramen', category: 'japan', order: 2 },
	{ id: 'teriyaki-dishes', title: 'Teriyaki Dishes', category: 'japan', order: 3 },

	{ id: 'bibimbap', title: 'Bibimbap', category: 'korea', order: 4 },
	{ id: 'kimchi', title: 'Kimchi', category: 'korea', order: 5 },
	{ id: 'korean-fried-chicken', title: 'Korean Fried Chicken', category: 'korea', order: 6 },

	{ id: 'chinese-fried-rice', title: 'Chinese Fried Rice', category: 'china', order: 7 },
	{
		id: 'chinese-sweet-and-sour-chicken',
		title: 'Chinese Sweet and Sour Chicken',
		category: 'china',
		order: 8
	},
	{ id: 'wok-noodles', title: 'Wok Noodles', category: 'china', order: 9 },
	{ id: 'dumplings', title: 'Dumplings', category: 'china', order: 10 },

	{ id: 'pad-thai', title: 'Pad Thai', category: 'thailand', order: 11 },
	{ id: 'tom_yam', title: 'Tom Yam', category: 'thailand', order: 12 },

	{ id: 'bubble-tea', title: 'Bubble Tea', category: 'taiwan', order: 13 },

	{ id: 'pizza', title: 'Pizza', category: 'italy', order: 14 },
	{ id: 'pasta', title: 'Pasta', category: 'italy', order: 15 },
	{ id: 'risotto', title: 'Risotto', category: 'italy', order: 16 },
	{ id: 'tiramisu', title: 'Tiramisu', category: 'italy', order: 17 },
	{ id: 'coffee-espresso-based', title: 'Coffee (Espresso-Based)', category: 'italy', order: 18 },

	{ id: 'croissant', title: 'Croissant', category: 'france', order: 19 },
	{ id: 'creme-brulee', title: 'Creme Brulee', category: 'france', order: 20 },
	{ id: 'quiche', title: 'Quiche', category: 'france', order: 21 },
	{ id: 'ratatouille', title: 'Ratatouille', category: 'france', order: 22 },

	{ id: 'burger', title: 'Burger', category: 'usa', order: 23 },
	{ id: 'hot-dog', title: 'Hot Dog', category: 'usa', order: 24 },
	{ id: 'fried-chicken', title: 'Fried Chicken', category: 'usa', order: 25 },
	{ id: 'steak', title: 'Steak', category: 'usa', order: 26 },
	{ id: 'milkshakes', title: 'Milkshakes', category: 'usa', order: 27 },
	{ id: 'cheesecake', title: 'Cheesecake', category: 'usa', order: 28 },
	{ id: 'ice-cream', title: 'Ice Cream', category: 'usa', order: 29 },
	{ id: 'caesar-salad', title: 'Caesar Salad', category: 'usa', order: 30 },

	{ id: 'tacos', title: 'Tacos', category: 'mexico', order: 31 },
	{ id: 'burritos', title: 'Burritos', category: 'mexico', order: 32 },

	{ id: 'kebab', title: 'Kebab', category: 'middle-east', order: 33 },
	{ id: 'doner', title: 'Doner', category: 'middle-east', order: 34 },
	{ id: 'shawarma', title: 'Shawarma', category: 'middle-east', order: 35 },
	{ id: 'lahmacun', title: 'Lahmacun', category: 'middle-east', order: 36 },
	{ id: 'pide', title: 'Pide', category: 'middle-east', order: 37 },
	{ id: 'falafel', title: 'Falafel', category: 'middle-east', order: 38 },
	{ id: 'hummus', title: 'Hummus', category: 'middle-east', order: 39 },
	{ id: 'dolma', title: 'Dolma', category: 'middle-east', order: 40 },
	{ id: 'baklava', title: 'Baklava', category: 'middle-east', order: 41 },

	{ id: 'plov', title: 'Plov', category: 'central-asia', order: 42 },
	{ id: 'lagman', title: 'Lagman', category: 'central-asia', order: 43 },
	{ id: 'manty', title: 'Manty', category: 'central-asia', order: 44 },
	{ id: 'samsa', title: 'Samsa', category: 'central-asia', order: 45 },
	{ id: 'shashlyk', title: 'Shashlyk', category: 'central-asia', order: 46 },

	{ id: 'borsch', title: 'Borsch', category: 'eastern-europe', order: 47 },
	{ id: 'blini', title: 'Blini', category: 'eastern-europe', order: 48 },
	{ id: 'draniki', title: 'Draniki', category: 'eastern-europe', order: 49 },
	{ id: 'pelmeni', title: 'Pelmeni', category: 'eastern-europe', order: 50 },
	{ id: 'vareniki', title: 'Vareniki', category: 'eastern-europe', order: 51 },
	{ id: 'syrniki', title: 'Syrniki', category: 'eastern-europe', order: 52 },
	{ id: 'olivier-salad', title: 'Olivier Salad', category: 'eastern-europe', order: 53 },
	{ id: 'solyanka', title: 'Solyanka', category: 'eastern-europe', order: 54 },
	{ id: 'cutlet', title: 'Cutlet', category: 'eastern-europe', order: 55 },
	{ id: 'medovik', title: 'Medovik', category: 'eastern-europe', order: 56 },
	{ id: 'napoleon-cake', title: 'Napoleon Cake', category: 'eastern-europe', order: 57 },

	{ id: 'khachapuri', title: 'Khachapuri', category: 'caucasus', order: 58 },
	{ id: 'khinkali', title: 'Khinkali', category: 'caucasus', order: 59 },

	{ id: 'greek-salad', title: 'Greek Salad', category: 'mediterranean', order: 60 }
].map((dish) => ({
	...dish,
	description: CATEGORY_DESCRIPTIONS[dish.category] || 'A popular international favorite.',
	publicId: `${PUBLIC_ID_BASE}/${dish.id}`
}));

export const load: PageServerLoad = async () => {
	let page = FALLBACK_PAGE;
	let categories = FALLBACK_CATEGORIES;
	let dishes = FALLBACK_DISHES;

	if (adminDB) {
		try {
			// Data is stored inside pages/food-drink
			const pageRef = adminDB.collection('pages').doc('food-drink');

			const pageSnap = await pageRef.get();

			// Process page data (international tastes metadata is stored as fields on food-drink)
			if (pageSnap.exists) {
				const pageData = serializeDates(pageSnap.data());
				page = {
					...FALLBACK_PAGE,
					mainTitle: pageData.internationalTastesTitle || FALLBACK_PAGE.mainTitle,
					headerDescription: pageData.internationalTastesDescription || FALLBACK_PAGE.headerDescription,
					heroKicker: pageData.internationalTastesHeroKicker || FALLBACK_PAGE.heroKicker,
					headerBackgroundPublicId: resolveInternationalHeroPublicId(
						pageData.internationalTastesHeroPublicId || FALLBACK_PAGE.headerBackgroundPublicId
					),
					articleViews: pageData.articleViews || 0,
					articleLikes: pageData.articleLikes || 0,
					articleComments: pageData.articleComments || 0
				};
			}

			// Try to load categories - only use if they have the proper structure
			try {
				const categoriesSnap = await pageRef.collection('internationalTastesCategories').get();
				if (!categoriesSnap.empty) {
					const loadedCategories = categoriesSnap.docs.map((doc) =>
						serializeDates({ id: doc.id, ...doc.data() })
					);
					if (loadedCategories.length > 0 && loadedCategories[0].title && loadedCategories[0].order !== undefined) {
						categories = loadedCategories.sort((a, b) => (a.order || 0) - (b.order || 0));
						console.log(`[international-tastes] Loaded ${categories.length} categories from Firebase`);
					}
				}
			} catch (catErr) {
				console.log('[international-tastes] Categories not found in Firebase, using fallback');
			}

			// Try to load dishes - only use if they have the proper structure
			try {
				const dishesSnap = await pageRef.collection('internationalTastes').get();
				if (!dishesSnap.empty) {
					const loadedDishes = dishesSnap.docs.map((doc) =>
						serializeDates({ id: doc.id, ...doc.data() })
					);
					if (loadedDishes.length > 0 && loadedDishes[0].category && loadedDishes[0].order !== undefined) {
						dishes = loadedDishes.sort((a, b) => (a.order || 0) - (b.order || 0));
						console.log(`[international-tastes] Loaded ${dishes.length} dishes from Firebase`);
					} else {
						console.log('[international-tastes] Firebase dishes missing category/order fields, using fallback');
					}
				}
			} catch (dishErr) {
				console.log('[international-tastes] Dishes not found in Firebase, using fallback');
			}
		} catch (err) {
			console.error('[international-tastes] Error loading from Firebase, using fallback:', err);
		}
	}

	return {
		page,
		categories,
		dishes
	};
};
