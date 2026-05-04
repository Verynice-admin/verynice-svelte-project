/* eslint-disable no-console */
const admin = require('firebase-admin');

if (!admin.apps.length) {
	admin.initializeApp();
}

const db = admin.firestore();

const pageDoc = {
	seo: {
		title: 'Silk Road Noodles | VeryNice',
		description:
			'Hand-pulled lagman in Kazakhstan: regional styles, broth logic, stir-fry variants, ingredients, and where travelers can taste the best versions.'
	},
	mainTitle: 'Silk Road Noodles',
	headerDescription:
		'A traveler-focused guide to lagman in Kazakhstan: hand-pulled noodle craft, broth science, regional identities, and the social ritual of sharing a steaming bowl.',
	heroKicker: 'Silk Road Flavor Route',
	location: 'Kazakhstan',
	breadcrumbs: [
		{ label: 'Home', href: '/' },
		{ label: 'Food & Drinks', href: '/food-drink' },
		{ label: 'Silk Road Noodles' }
	],
	headerBackgroundPublicId: 'content/pages/foodDrinks/silkRoadNoodles/hero',
	updatedAt: admin.firestore.FieldValue.serverTimestamp()
};

const sections = [
	{
		id: 'lagman-quick-guide',
		title: 'Lagman Quick Guide',
		description: 'The core idea in one minute: noodle pull, sauce base, and style choice.',
		imagePublicId: 'content/pages/foodDrinks/silkRoadNoodles/originsAndKazakhstanIdentity',
		contentHTML:
			'<p>Lagman in Kazakhstan is about <strong>one dough, many outcomes</strong>. The same hand-pulled noodle can become a brothy bowl, a glossy stir-fry, or a dry-fried plate depending on liquid level, wok time, and seasoning balance.</p><p>For travelers, start by choosing texture first: soupy and warming, saucy and balanced, or dry and concentrated. Then adjust spice level and meat type. Kazakhstan is especially strong at making these variations clear and consistent.</p>',
		order: 1
	},
	{
		id: 'suyru-lagman',
		title: 'Suyru Lagman (Suyuq, Brothy)',
		description: 'The classic soupy version with long noodles and aromatic broth.',
		imagePublicId: 'content/pages/foodDrinks/silkRoadNoodles/handPulledCraftAndNoodleTexture',
		contentHTML:
			'<p><strong>Suyru lagman</strong> is the comfort benchmark: hand-pulled noodles in a generous, savory broth with beef or lamb, tomato, pepper, onion, and herbs. The broth should be flavorful but not greasy, with visible vegetable freshness.</p><p>Best for first-time visitors and cold weather days. If you want a safe first order, this is it. Ask for medium spice and observe noodle elasticity, that is the quality signal.</p>',
		order: 2
	},
	{
		id: 'guyru-lagman',
		title: 'Guyru Lagman (Stir-Fried with Sauce)',
		description: 'Less broth, more wok aroma, richer glaze on each strand.',
		imagePublicId: 'content/pages/foodDrinks/silkRoadNoodles/brothAndSauceArchitecture',
		contentHTML:
			'<p><strong>Guyru lagman</strong> sits between soup and dry-fry. It is cooked in a wok with a concentrated sauce so noodles are coated, glossy, and aromatic. You still get moisture, but not a full bowl of broth.</p><p>This variation is ideal if you want stronger caramelized flavor and more pepper-garlic character. In strong kitchens, the sauce clings to noodles instead of pooling at the bottom.</p>',
		order: 3
	},
	{
		id: 'qovurma-lagman',
		title: 'Qovurma Lagman (Dry-Fried)',
		description: 'The intense version: minimal liquid, maximum concentration.',
		imagePublicId: 'content/pages/foodDrinks/silkRoadNoodles/coreIngredientsAndSeasonalVariations',
		contentHTML:
			'<p><strong>Qovurma lagman</strong> is the drier branch of the family. Noodles are fried with meat and vegetables until sauce reduces and flavor becomes dense and direct. It eats more like a wok noodle plate than a soup dish.</p><p>Choose this if you prefer bold savory notes and less liquid. It pairs well with hot tea and fresh salad, especially at lunch.</p>',
		order: 4
	},
	{
		id: 'boso-lagman',
		title: 'Boso Lagman (Pan-Fried Noodle Style)',
		description: 'Noodles are briefly pan-fried for toasted edges and extra bite.',
		imagePublicId: 'content/pages/foodDrinks/silkRoadNoodles/majorVariantsTravelersShouldKnow',
		contentHTML:
			'<p><strong>Boso lagman</strong> uses pre-cooked noodles that are quickly pan-fried before saucing. The result is a slight crust and chewy interior, giving more textural contrast than standard lagman.</p><p>Ask for this when you want a more snack-like, street-food feel. Good boso keeps noodle strands separate, not clumped or oily.</p>',
		order: 5
	},
	{
		id: 'ganpan-style-lagman',
		title: 'Ganpan-Style Lagman (Sauce-Heavy Plate)',
		description: 'Thicker sauce, stronger spice, and deeper pepper-forward profile.',
		imagePublicId: 'content/pages/foodDrinks/silkRoadNoodles/howToEatLagmanLikeLocal',
		contentHTML:
			'<p>Some kitchens serve lagman close to <strong>ganpan</strong> logic: thick, glossy sauce, stronger chili, and high aromatic intensity. The noodle remains central, but sauce drives the experience.</p><p>Ideal for travelers who enjoy spicy Chinese-Central Asian crossover flavors. If sensitive to heat, ask for mild before ordering.</p>',
		order: 6
	},
	{
		id: 'vegetarian-lagman',
		title: 'Vegetarian and Mushroom Lagman',
		description: 'Modern urban variation with no meat but full lagman structure.',
		imagePublicId: 'content/pages/foodDrinks/silkRoadNoodles/bestRegionsAndVenueSignals',
		contentHTML:
			'<p>In Almaty and Astana, many restaurants now offer <strong>vegetarian lagman</strong> with mushrooms, peppers, tomato, garlic, and herbs. The best versions keep hand-pulled noodles and proper wok sequencing, not just vegetable soup poured over pasta.</p><p>This is a strong option for travelers avoiding meat while still tasting the lagman format and spice profile.</p>',
		order: 7
	},
	{
		id: 'regional-ordering-map',
		title: 'Regional Ordering Map: What to Choose',
		description: 'Simple traveler rule-set for picking the right variation quickly.',
		imagePublicId: 'content/pages/foodDrinks/silkRoadNoodles/whyTravelersLoveIt',
		contentHTML:
			'<p>Use this quick map: choose <strong>Suyru</strong> for first try and comfort, <strong>Guyru</strong> for wok aroma and medium sauce, <strong>Qovurma</strong> for dry and intense flavor, and <strong>Boso</strong> for extra texture.</p><p>In Shymkent and southern cities, expect stronger spice and bolder seasoning. In Almaty, you will usually find a wider spectrum from mild to hot and easier customization.</p>',
		order: 8
	}
];

async function seedPage() {
	const pageRef = db.doc('content/pages/foodDrinks/silkRoadNoodles');
	await pageRef.set(pageDoc, { merge: true });

	const sectionWrites = sections.map((section) => {
		const ref = db.doc(`content/pages/foodDrinks/silkRoadNoodles/sections/${section.id}`);
		return ref.set(
			{
				...section,
				updatedAt: admin.firestore.FieldValue.serverTimestamp()
			},
			{ merge: true }
		);
	});
	await Promise.all(sectionWrites);
}

async function updateFoodDrinkCards() {
	const cardPatch = {
		id: 'silk-road-noodles',
		title: 'Silk Road Noodles',
		description: 'Hand-pulled lagman, regional variations, and Silk Road flavor craft.',
		href: '/food-drink/silk-road-noodles',
		slug: 'silk-road-noodles',
		route: '/food-drink/silk-road-noodles',
		updatedAt: admin.firestore.FieldValue.serverTimestamp()
	};

	const knownTargets = [
		'content/pages/foodDrinks/cardMap/silk-road-noodles',
		'content/pages/foodDrinks/cardMap/silkRoadNoodles',
		'content/pages/foodDrinks/home/cards/silk-road-noodles',
		'content/pages/foodDrinks/landing/cards/silk-road-noodles'
	];

	await Promise.all(knownTargets.map((path) => db.doc(path).set(cardPatch, { merge: true })));
}

async function main() {
	await seedPage();
	await updateFoodDrinkCards();
	console.log('Seeded Silk Road Noodles page and card metadata in Firestore.');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
