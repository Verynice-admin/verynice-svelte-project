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
		title: 'Traditional Clothing & Adornments | Culture | VeryNice',
		description:
			'Discover the Saukele, Chapan, Shapan, and ornate jewelry that define Kazakh traditional dress.'
	},
	mainTitle: 'Traditional Clothing & Adornments',
	headerDescription:
		'From the majestic Saukele bridal headdress to the flowing Chapan robes and intricate silver jewelry — explore the garments that express Kazakh identity, status, and artistry.',
	heroKicker: 'Woven Heritage',
	location: 'Kazakhstan',
	articleViews: 0,
	articleLikes: 0,
	articleComments: 0,
	breadcrumbs: [
		{ label: 'Home', href: '/' },
		{ label: 'Culture', href: '/culture' },
		{ label: 'Traditional Clothing' }
	],
	headerBackgroundPublicId: 'content/pages/heritage/traditionalClothing/traditional-clothing-hero'
};

const FALLBACK_SECTIONS = [
	{
		id: 'shapan',
		order: 1,
		title: 'Shapan (Chapan)',
		description: 'The noble robe that embodies Kazakh elegance and social status.',
		imagePublicId: 'content/pages/heritage/traditionalClothing/shapan',
		contentMarkdown: `The **Shapan** (also spelled Chapan) is a flowing, coat-like garment that serves as the outermost layer of traditional Kazakh attire. Worn by both men and women, it represents the perfect fusion of functionality and aesthetic beauty.`
	},
	{
		id: 'koilek',
		order: 2,
		title: 'Köylek',
		description: 'The foundational dress that forms the base layer of women\'s traditional attire.',
		imagePublicId: 'content/pages/heritage/traditionalClothing/koilek',
		contentMarkdown: `The **Köylek** is the traditional dress that serves as the foundational garment in Kazakh women's clothing. This long, loose-fitting dress is worn as the base layer.`
	},
	{
		id: 'kamzol',
		order: 3,
		title: 'Kamzol',
		description: 'The sleeveless vest that adds color, warmth, and ornamentation.',
		imagePublicId: 'content/pages/heritage/traditionalClothing/kamzol',
		contentMarkdown: `The **Kamzol** is a sleeveless vest worn by women over the Köylek. This garment adds layers of color, warmth, and decorative beauty to the traditional ensemble.`
	},
	{
		id: 'shalbar',
		order: 4,
		title: 'Shalbar',
		description: 'Wide trousers designed for horseback riding and nomadic life.',
		imagePublicId: 'content/pages/heritage/traditionalClothing/shalbar',
		contentMarkdown: `The **Shalbar** are wide, loose-fitting trousers that form an essential part of both men's and women's traditional Kazakh attire. Designed specifically for the nomadic lifestyle.`
	},
	{
		id: 'kupe',
		order: 5,
		title: 'Kupe',
		description: 'A fitted jacket providing structure and warmth with decorative embroidery.',
		imagePublicId: 'content/pages/heritage/traditionalClothing/kupe',
		contentMarkdown: `The **Kupe** is a traditional jacket that provides additional warmth and structure to the Kazakh ensemble. More fitted than the Shapan.`
	},
	{
		id: 'saukele',
		order: 6,
		title: 'Saukele',
		description: 'The majestic bridal headdress, crown of Kazakh wedding attire.',
		imagePublicId: 'content/pages/heritage/traditionalClothing/saukele',
		contentMarkdown: `The **Saukele** stands as the crown jewel of Kazakh costume — a tall, ornate bridal headdress that transforms a young woman into a married lady.`
	},
	{
		id: 'kimeshek',
		order: 7,
		title: 'Kimeshek',
		description: 'The modest headdress of married women, symbolizing dignity and respect.',
		imagePublicId: 'content/pages/heritage/traditionalClothing/kimeshek',
		contentMarkdown: `The **Kimeshek** is the traditional headdress worn by married Kazakh women. Unlike the Saukele, which is reserved for brides.`
	},
	{
		id: 'kalpak',
		order: 8,
		title: 'Kalpak',
		description: 'The distinctive white felt hat, enduring symbol of Kazakh identity.',
		imagePublicId: 'content/pages/heritage/traditionalClothing/kalpak',
		contentMarkdown: `The **Kalpak** is the iconic white felt hat that has become the most recognizable symbol of Kazakh identity.`
	},
	{
		id: 'takiya',
		order: 9,
		title: 'Takiya (Taqiya)',
		description: 'The soft embroidered skullcap for daily wear.',
		imagePublicId: 'content/pages/heritage/traditionalClothing/takiya',
		contentMarkdown: `The **Takiya** (also spelled Taqiya) is a soft, close-fitting cap worn by men for daily activities.`
	},
	{
		id: 'borik',
		order: 10,
		title: 'Borik',
		description: 'The warm fur-lined cap for harsh winter conditions.',
		imagePublicId: 'content/pages/heritage/traditionalClothing/borik',
		contentMarkdown: `The **Borik** is a warm, fur-lined cap designed to protect against the harsh winter conditions.`
	},
	{
		id: 'tymak',
		order: 11,
		title: 'Tymak',
		description: 'The fur hat with ear flaps for extreme cold.',
		imagePublicId: 'content/pages/heritage/traditionalClothing/tymak',
		contentMarkdown: `The **Tymak** is a heavy fur hat designed for the most extreme winter conditions on the Kazakh steppe.`
	},
	{
		id: 'beldemshe',
		order: 12,
		title: 'Beldemshe',
		description: 'The traditional embroidered apron worn by women.',
		imagePublicId: 'content/pages/heritage/traditionalClothing/beldemshe',
		contentMarkdown: `The **Beldemshe** is a traditional embroidered apron worn by Kazakh women over their dresses.`
	},
	{
		id: 'zhelek',
		order: 13,
		title: 'Zhelek (Jelek)',
		description: 'A traditional vest variant with regional variations.',
		imagePublicId: 'content/pages/heritage/traditionalClothing/zhelek',
		contentMarkdown: `The **Zhelek** (also spelled Jelek) is a type of vest similar to the Kamzol but with distinct regional variations.`
	},
	{
		id: 'kasaba',
		order: 14,
		title: 'Kasaba',
		description: 'The traditional men\'s robe for ceremonial occasions.',
		imagePublicId: 'content/pages/heritage/traditionalClothing/kasaba',
		contentMarkdown: `The **Kasaba** is a traditional men's robe worn for ceremonial occasions and important social gatherings.`
	},
	{
		id: 'ichigi',
		order: 15,
		title: 'Ichigi',
		description: 'Traditional embroidered boots for riding and daily wear.',
		imagePublicId: 'content/pages/heritage/traditionalClothing/ichigi',
		contentMarkdown: `The **Ichigi** are traditional Kazakh boots that combine functionality for horseback riding with exquisite decorative craftsmanship.`
	},
	{
		id: 'ton',
		order: 16,
		title: 'Ton',
		description: 'The sheepskin coat for extreme cold protection.',
		imagePublicId: 'content/pages/heritage/traditionalClothing/ton',
		contentMarkdown: `The **Ton** is a heavy sheepskin coat designed for survival in the extreme cold of the Kazakh winter.`
	},
	{
		id: 'qapta',
		order: 17,
		title: 'Qapta (Qaptal)',
		description: 'A traditional coat displaying family craftsmanship.',
		imagePublicId: 'content/pages/heritage/traditionalClothing/qapta',
		contentMarkdown: `The **Qapta** (also spelled Qaptal) is a traditional coat that serves as both practical outerwear and a display of family craftsmanship.`
	},
	{
		id: 'kunikey',
		order: 18,
		title: 'Kunikey',
		description: 'Festive dress for celebrations and special occasions.',
		imagePublicId: 'content/pages/heritage/traditionalClothing/kunikey-koilek',
		contentMarkdown: `The **Kunikey** (often referred to as Kunikey Köylek) is a festive dress worn by women for celebrations, weddings, and other special occasions.`
	}
];

export const load: PageServerLoad = async () => {
	if (!adminDB) {
		return {
			page: FALLBACK_PAGE,
			sections: FALLBACK_SECTIONS
		};
	}

	try {
		const pageRef = adminDB.collection('pages').doc('heritage').collection('articles').doc('traditional-clothing');
		const [pageSnap, sectionsSnap] = await Promise.all([
			pageRef.get(),
			pageRef.collection('sections').orderBy('order', 'asc').get()
		]);

		const page = pageSnap.exists ? serializeDates(pageSnap.data()) : {};

		const sections = sectionsSnap.docs.length
			? sectionsSnap.docs.map((doc) =>
					serializeDates({
						id: doc.id,
						...doc.data()
					})
				)
			: FALLBACK_SECTIONS;

		return {
			page: { ...FALLBACK_PAGE, ...page },
			sections
		};
	} catch (error) {
		console.error('[culture/traditional-clothing] load error', error);
		return {
			page: FALLBACK_PAGE,
			sections: FALLBACK_SECTIONS
		};
	}
};
