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

const PUBLIC_ID_BASE = 'content/pages/foodDrinks/traditionalDastarkhan';

const FALLBACK_PAGE = {
	seo: {
		title: 'Traditional Dastarkhan | Food & Drinks | VeryNice',
		description:
			'An advanced guide to the Kazakh dastarkhan: ritual etiquette, symbolic serving order, tea choreography, and ceremonial table culture.'
	},
	mainTitle: 'Traditional Kazakh Dastarkhan',
	headerDescription:
		'The full etiquette architecture of the dastarkhan, from honored seating and tabak tartu to tea rhythm, seasonal feasts, and modern urban revival.',
	heroKicker: 'Table of Hospitality',
	location: 'Kazakhstan',
	articleViews: 0,
	articleLikes: 0,
	articleComments: 0,
	breadcrumbs: [
		{ label: 'Home', href: '/' },
		{ label: 'Food & Drinks', href: '/food-drink' },
		{ label: 'Traditional Dastarkhan' }
	],
	headerBackgroundPublicId: `${PUBLIC_ID_BASE}/hero`
};

const FALLBACK_SECTIONS = [
	{
		id: 'ethos-of-hosting',
		order: 1,
		title: 'Ethos of Hosting',
		description: 'In Kazakh culture, the table is a moral space before it is a menu.',
		imagePublicId: `${PUBLIC_ID_BASE}/sections/ethos-of-hosting`,
		contentMarkdown:
			`The **dastarkhan** is not simply a spread of dishes. It is an ethical performance of care in which the host demonstrates attentiveness, memory, and restraint. A respected host notices who arrived first, who is older, who is visiting from afar, and who should be greeted through food rather than words.

In this framework, abundance is measured by balance. A table can be rich, yet still feel coarse if service is rushed. A table can be simple, yet still feel noble if each guest is welcomed with precision and warmth. This is why Kazakh families often describe a successful gathering through the atmosphere of the table, not only through what was eaten.

Even iconic foods such as **beshbarmak**, **kazy**, or fresh **baursak** gain their full meaning only inside this etiquette logic. The ritual of offering, refilling, and sequencing is what turns food into tradition.`
	},
	{
		id: 'seating-hierarchy',
		order: 2,
		title: 'Seating Hierarchy and Social Geometry',
		description: 'Placement around the dastarkhan communicates rank, respect, and relationship.',
		imagePublicId: `${PUBLIC_ID_BASE}/sections/seating-hierarchy`,
		contentMarkdown:
			`Traditional seating is deliberate. The most honored position is not ornamental; it marks the person whose presence dignifies the gathering. Elders, spiritual authorities, or senior guests are placed where service reaches them first and where conversation naturally centers around them.

Family members occupy supportive positions according to responsibility. Those managing the flow of dishes and tea remain close to the service axis. Younger relatives learn by observation, carrying bowls, watching timing, and absorbing the table language that cannot be taught through instruction alone.

This spatial discipline allows the meal to unfold without friction. Service becomes legible, and everyone understands who should be addressed first, who receives ceremonial cuts, and who leads the emotional tone of the gathering.`
	},
	{
		id: 'serving-order',
		order: 3,
		title: 'Serving Order and Tabak Tartu',
		description: 'The prestige of the dastarkhan is expressed through sequence, not speed.',
		imagePublicId: `${PUBLIC_ID_BASE}/sections/serving-order`,
		contentMarkdown:
			`A classic dastarkhan does not present all dishes at once. It opens with stabilizing gestures, most often tea and light accompaniments, then moves toward its ceremonial center where meat and broth define the emotional peak of the meal.

The most important mechanism is **tabak tartu**, the structured distribution of meat cuts according to guest status and context. In this moment, familiar dishes from the signature canon become ritual instruments. **Beshbarmak** anchors shared identity, while **kazy**, **shuzhuk**, and **zhaya** operate as signals of honor and seriousness. **Sorpa** restores rhythm and prepares the table for longer conversation.

What outsiders sometimes read as “just serving” is, in fact, a public grammar of respect. The order in which a plate arrives can carry as much meaning as the ingredients on it.`
	},
	{
		id: 'tea-ritual',
		order: 4,
		title: 'Tea Ritual and Conversational Rhythm',
		description: 'Tea is the tempo system of the table, regulating pace and emotional tone.',
		imagePublicId: `${PUBLIC_ID_BASE}/sections/tea-ritual`,
		contentMarkdown:
			`Tea service in Kazakh hosting is an art of timing. Small pours are intentional: they invite continued attention, repeated contact, and a quieter cadence of care. Each refill is a social checkpoint where comfort is reassessed without interruption.

The tea horizon usually carries **baursak**, dried fruit, nuts, and sweets, but the key element is choreography. Service slows when conversation deepens, accelerates when guests arrive, and pauses when ceremonial speech is being offered. This dynamic pacing is one reason the dastarkhan can sustain long gatherings without fatigue.

Fermented drinks such as **kymyz**, **shubat**, and **ayran** may appear according to region and season, yet tea remains the most universal medium of welcome and continuity.`
	},
	{
		id: 'speech-and-etiquette',
		order: 5,
		title: 'Speech Etiquette, Bata, and Table Conduct',
		description: 'Respect is performed through speech discipline as much as through eating.',
		imagePublicId: `${PUBLIC_ID_BASE}/sections/speech-and-etiquette`,
		contentMarkdown:
			`A refined guest listens before speaking, accepts hospitality without theatrical refusal, and follows elder-first cues in both food and conversation. At a traditional table, manners are interpreted as character rather than style.

The verbal summit of many gatherings is **bata**, the blessing speech that seals gratitude, intention, and collective dignity. Bata is never ornamental; it formalizes the moral purpose of the meal and binds the social moment into memory.

In this setting, rushing, interrupting service order, or treating the table as a private plate experience is considered a breakdown of form. Proper conduct means joining the shared rhythm rather than asserting personal tempo.`
	},
	{
		id: 'ceremonial-contexts',
		order: 6,
		title: 'Ceremonial Contexts Across Life Events',
		description: 'The dastarkhan adapts to weddings, births, memorials, and seasonal festivals.',
		imagePublicId: `${PUBLIC_ID_BASE}/sections/ceremonial-contexts`,
		contentMarkdown:
			`The same etiquette architecture appears in different ceremonial moods. Wedding-related gatherings expand the meat program and lengthen the tea horizon to honor alliances between families. Birth celebrations emphasize continuity and blessing, often placing elder women at the center of ritual authority.

Memorial tables are usually more restrained in tone, yet no less precise in service order. Respectful pacing, measured speech, and carefully sequenced offerings become the language of remembrance.

During **Nauryz**, symbolic foods such as **nauryz kozhe** reinforce renewal, but the underlying code does not change. The table still communicates order, gratitude, and collective dignity.`
	},
	{
		id: 'modern-practice',
		order: 7,
		title: 'Modern Urban Dastarkhan and Cultural Revival',
		description: 'Contemporary venues reinterpret tradition while preserving ceremonial logic.',
		imagePublicId: `${PUBLIC_ID_BASE}/sections/modern-practice`,
		contentMarkdown:
			`In Almaty and Astana, contemporary restaurants are rebuilding dastarkhan culture through design, pacing, and narrative service. Plating may look modern, yet the underlying sequence often mirrors classical protocol: honor first, center service, then extended tea.

Chefs increasingly frame signature dishes through story. **Beshbarmak** may arrive with commentary on regional style; **kazy** may be introduced as ceremonial meat rather than a generic sausage; tea service may be staged to recover the old rhythm of attention. This translation work helps younger urban audiences reconnect with table meaning.

The strongest modern examples do not reduce tradition to decoration. They preserve the core principle that hospitality is a disciplined cultural act, and that the table is where memory, hierarchy, and generosity become visible.`
	}
];

const EXPECTED_SECTION_IDS = new Set(FALLBACK_SECTIONS.map((section) => section.id));

export const load: PageServerLoad = async () => {
	let page = FALLBACK_PAGE;
	let sections = FALLBACK_SECTIONS;

	if (adminDB) {
		try {
			const pageRef = adminDB.collection('pages').doc('food-drink');
			const pageSnap = await pageRef.get();

			if (pageSnap.exists) {
				const pageData = serializeDates(pageSnap.data());
				page = {
					...FALLBACK_PAGE,
					mainTitle: pageData.traditionalDastarkhanTitle || FALLBACK_PAGE.mainTitle,
					headerDescription:
						pageData.traditionalDastarkhanDescription || FALLBACK_PAGE.headerDescription,
					heroKicker: pageData.traditionalDastarkhanHeroKicker || FALLBACK_PAGE.heroKicker,
					headerBackgroundPublicId:
						pageData.traditionalDastarkhanHeroPublicId || FALLBACK_PAGE.headerBackgroundPublicId,
					articleViews: pageData.articleViews || 0,
					articleLikes: pageData.articleLikes || 0,
					articleComments: pageData.articleComments || 0
				};
			}

			try {
				const sectionsSnap = await pageRef
					.collection('traditionalDastarkhanSections')
					.orderBy('order', 'asc')
					.get();
				if (!sectionsSnap.empty) {
					const loadedSections = sectionsSnap.docs
						.map((doc) => serializeDates({ id: doc.id, ...doc.data() }))
						.filter(
							(item) =>
								EXPECTED_SECTION_IDS.has(item.id) &&
								item.title &&
								(item.contentMarkdown || item.contentHTML)
						);

					if (loadedSections.length > 0) {
						sections = loadedSections.sort((a, b) => (a.order || 0) - (b.order || 0));
						console.log(
							`[traditional-dastarkhan] Loaded ${sections.length} sections from Firebase`
						);
					}
				}
			} catch {
				console.log('[traditional-dastarkhan] Sections not found in Firebase, using fallback');
			}
		} catch (err) {
			console.error('[traditional-dastarkhan] Error loading from Firebase, using fallback:', err);
		}
	}

	return {
		page,
		sections
	};
};
