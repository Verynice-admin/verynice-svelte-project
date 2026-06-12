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
		title: 'Yurt & Nomadic Life | Culture | VeryNice',
		description:
			'Discover the romantic purity of Kazakh nomadic life — a world of endless steppes, crystal rivers, and the freedom of the eternal wanderer.'
	},
	mainTitle: 'The Eternal Wanderers: Life Under the Open Sky',
	headerDescription:
		'Long before the smoke of industrial chimneys darkened the horizon, before cobblestone streets became clogged with filth and refuse, the Kazakh people danced with the wind across an unspoiled paradise — living as nature intended, pure and free.',
	heroKicker: 'Pure Freedom',
	location: 'Kazakhstan',
	articleViews: 0,
	articleLikes: 0,
	articleComments: 0,
	breadcrumbs: [
		{ label: 'Home', href: '/' },
		{ label: 'Culture', href: '/culture' },
		{ label: 'Yurt & Nomadic Life' }
	],
	headerBackgroundPublicId: 'content/pages/heritage/yurtNomadiclife/yurt-nomadic-life-hero'
};

const FALLBACK_SECTIONS = [
	{
		id: 'pure-life-steppe',
		order: 1,
		title: 'The Pure Life of the Steppe',
		description: 'How nomadic existence preserved the pristine purity that settled civilizations had long forgotten.',
		imagePublicId: 'content/pages/heritage/yurtNomadiclife/pure',
		contentMarkdown: `Imagine a world where the air you breathe carries no taint of coal smoke, where the water you drink sparkles with mountain purity, where the earth beneath your feet remains unsullied by the accumulated filth of generations. This was the world of the Kazakh nomad — **a life of pristine cleanliness** that stood in glorious contrast to the squalor of settled cities.

While ancient civilizations built their stone monuments and cramped quarters, they also created something else: **disease-ridden streets flowing with refuse**, air thick with the smoke of countless hearth fires, water sources fouled by proximity to waste. The great cities of old — magnificent in their architecture — were death traps of pollution and plague.

But out on the endless steppe, the Kazakh people lived differently. **They were the guardians of purity.** Their homes — the portable yurts — were never places where filth could accumulate. When a family moved, they left nothing behind but footprints in the grass. The wind swept away what little waste they produced. The rain cleansed. The sun purified.

**The diet of the nomad was the diet of the pure.** Fresh meat from healthy animals that had grazed on wild grasses and drunk from crystal springs. No preserved foods rotting in cellars, no stale bread covered in mold. The Kazakh drank directly from rivers that tumbled down from snow-capped peaks, waters so clear you could see the stones shimmering on the bottom.`
	},
	{
		id: 'wanderers-paradise',
		order: 2,
		title: 'Wanderers Through Paradise',
		description: 'Following the eternal rhythm of seasons across landscapes of breathtaking beauty.',
		imagePublicId: 'content/pages/heritage/yurtNomadiclife/free',
		contentMarkdown: `To be a Kazakh nomad was to be **a citizen of paradise** — to wake each morning not to the view of cramped walls and narrow streets, but to the sight of wildflowers dancing in the breeze, of eagles soaring against azure skies, of mountains wearing crowns of eternal snow.

The seasonal migrations were not grueling marches but **sacred journeys through ever-changing beauty**. In spring, they followed the greening grass to alpine meadows carpeted with tulips and poppies. Summer found them in high pastures where the grass grew lush and tall, where their horses grew fat and strong.

**Autumn brought its own magic** — the steppe transformed into a sea of gold and amber, the air sharp and crystalline. And winter, though harsh, had its pristine beauty: endless white plains under pale winter sun, the yurt warm and glowing like a lantern against the snow.

Every move was a discovery, every new campsite a revelation. **They never knew the ennui of the settled**, who look upon the same walls day after day until their souls grow stagnant. The nomad's eyes were always fresh, always drinking in new beauty.`
	},
	{
		id: 'soul-of-freedom',
		order: 3,
		title: 'The Soul Forged in Freedom',
		description: 'How the boundless steppe shaped a people of song, joy, and indomitable spirit.',
		imagePublicId: 'content/pages/heritage/yurtNomadiclife/soul',
		contentMarkdown: `The landscape we inhabit shapes the landscape within. **The Kazakh people, born of boundless horizons and open skies, developed souls as expansive as the steppe itself** — hearts that knew no walls, spirits that could not be contained.

Where the settled peoples of crowded cities learned caution and secrecy, the Kazakhs learned **openness, generosity, and spontaneous joy**. Their hearts were as visible as the endless sky, their emotions as natural and flowing as the rivers they followed.

**Song flowed from them as naturally as breath.** The dombra — that simple, elegant instrument — became the voice of their souls. They sang of love with a passion that would scandalize the buttoned-up city dwellers. They sang of sorrow with a depth that could make stones weep. Music was not entertainment; it was **oxygen for the spirit**.

**They were playful as foals, merry as the bubbling springs.** Their games were tests of strength and skill that celebrated the magnificent bodies that the pure air and healthy food had given them. They could ride before they could walk, could shoot arrows with deadly precision.

And when the time came to fight? **Then the steppe produced warriors of legend.** Men who had grown strong on meat and pure water, whose eyes were sharp from scanning distant horizons. They fought not from greed or cruelty, but from that fierce love of freedom that cannot tolerate chains.`
	},
	{
		id: 'shanyrak-crown',
		order: 4,
		title: 'The Shanyrak — Crown of the Cosmos',
		description: 'The sacred circular opening that connects earth to sky.',
		imagePublicId: 'content/pages/heritage/yurtNomadiclife/shanyrak',
		contentMarkdown: `At the very top of the yurt sits its most sacred element — **the Shanyrak**, a circular wooden wheel with crossed bars radiating from the center like rays of the sun. This is not merely a chimney or skylight; it is the spiritual heart of the nomadic home.

The Shanyrak's pattern represents the cosmos itself — the sun, the stars, and the eternal cycle of life. It serves as a spiritual connection to Tengri, the sky god, and a pathway for prayers to ascend to the heavens. The smoke from the central hearth rises through this opening, carrying the family's blessings upward.

A family's Shanyrak was often passed down through generations as a cherished heirloom. To inherit the Shanyrak was to inherit the family's history, their connection to ancestors, and their place in the cosmic order. Some families would decorate their Shanyrak with intricate carvings and precious metals, transforming it into a work of art that embodied their status and pride.`
	},
	{
		id: 'kerege-lattice',
		order: 5,
		title: 'The Kerege — Living Lattice Walls',
		description: 'The expandable wooden framework that breathes with the wind.',
		imagePublicId: 'content/pages/heritage/yurtNomadiclife/kerege',
		contentMarkdown: `The **Kerege** forms the circular walls of the yurt — an ingenious system of expanding lattice sections crafted from flexible willow or birch. These sections can be compressed like an accordion for transport, then expanded to create living spaces of various sizes.

Each Kerege section consists of thin wooden slats joined by leather thongs at their crossing points, creating a diamond pattern that is both strong and flexible. A skilled family could adjust the size of their yurt based on the season — larger for summer gatherings, smaller for winter warmth.

The lattice pattern serves a practical purpose beyond structure: it allows the walls to **breathe**. Air circulates naturally through the gaps, creating ventilation that keeps the interior comfortable in both the heat of summer and the cold of winter. When covered with felt, these gaps seal just enough to retain warmth while preventing condensation.

The number of Kerege sections determined the size of the yurt — from a modest home of four sections to a grand dwelling of twelve or more. The craftsmanship required to create these interlocking pieces was passed down through generations of master woodworkers.`
	},
	{
		id: 'uyk-poles',
		order: 6,
		title: 'The Uyk — Rays of the Sun',
		description: 'Slender roof poles that create the yurt\'s distinctive dome.',
		imagePublicId: 'content/pages/heritage/yurtNomadiclife/uyk',
		contentMarkdown: `The **Uyk** are the roof poles that radiate from the Shanyrak like sun rays, connecting the cosmic center to the earthly perimeter. These slender beams of willow or birch — numbering from 60 to 150 depending on the yurt's size — create the distinctive dome shape that is both beautiful and functional.

Each Uyk pole slots into the Shanyrak at one end and rests against the Kerege lattice at the other, locked in place by tension and gravity. Their arrangement creates a self-supporting structure of remarkable strength, capable of withstanding the fierce steppe winds that would tear apart conventional buildings.

The length and angle of the Uyk poles determine the height and profile of the yurt. Longer poles create taller, more spacious interiors with steeper roof pitches that shed snow efficiently. Shorter poles produce cozier, more wind-resistant structures suited to exposed locations.

The craftsmanship of the Uyk is deceptively complex — each pole must be straight yet flexible, tapered but strong, lightweight yet durable. Master yurt builders would select and season their wood carefully, knowing that the safety of the family depended on these slender beams.`
	},
	{
		id: 'felt-craft',
		order: 7,
		title: 'Jabu Kiiz — The Art of Felt',
		description: 'Thick felt carpets that transform structure into sanctuary.',
		imagePublicId: 'content/pages/heritage/yurtNomadiclife/jabu-kiiz',
		contentMarkdown: `The **Jabu Kiiz** are the thick felt carpets that cover the floor and walls of the yurt, transforming the wooden framework into a warm, inviting home. Made from sheep's wool that has been beaten, rolled, and pressed until it becomes a durable, insulating fabric, these carpets are masterpieces of functional art.

Creating Jabu Kiiz is a labor-intensive process that begins with shearing sheep in spring. The wool is washed, carded, and arranged in layers, then sprayed with water and rolled tightly. Women would walk on these rolls for hours, pressing the fibers together until they bonded into a thick, durable felt.

The carpets feature traditional patterns in rich colors — geometric shapes representing the mountains, rivers, and celestial bodies that shaped nomadic life. Each region developed its own distinctive motifs: the bold zigzags of the east, the flowing curves of the south, the intricate diamonds of the west.

New Jabu Kiiz were often part of a bride's dowry, representing her skill and the prosperity she brought to the marriage. A family's collection of felt carpets was a measure of their wealth and status, accumulated over generations of careful craftsmanship.`
	},
	{
		id: 'woven-bands',
		order: 8,
		title: 'Baskur and Baqanaq — Woven Bands of Beauty',
		description: 'Decorative and structural elements that encircle the yurt.',
		imagePublicId: 'content/pages/heritage/yurtNomadiclife/baskur',
		contentMarkdown: `Encircling the yurt are the **Baskur** and **Baqanaq** — woven bands that serve both structural and decorative purposes. These intricate textiles, created by skilled craftswomen using techniques passed down through generations, add strength to the structure while creating visual harmony.

The **Baskur** runs along the top of the Kerege walls, helping to secure the Uyk poles and distribute their weight evenly. It features bold geometric patterns in red, black, and white — colors that hold deep symbolic meaning in Kazakh culture. Red represents life and vitality, black symbolizes the earth and protection, and white signifies purity and the sky.

The **Baqanaq** adorns the lower sections of the yurt walls, protecting the base of the felt carpets from wear while adding another layer of beauty. These bands often feature different patterns than the Baskur, creating visual interest and balance.

The weaving of these bands required both technical skill and artistic vision. Each pattern had meaning — the "ram's horn" motif represented strength and fertility, the "wolf's tooth" pattern offered protection, the "mountain peak" design honored the landscapes that sustained nomadic life.`
	},
	{
		id: 'doorway-elements',
		order: 9,
		title: 'Esik and Tundik — The Sacred Doorway',
		description: 'Thresholds and curtains that welcome guests and protect the home.',
		imagePublicId: 'content/pages/heritage/yurtNomadiclife/esik',
		contentMarkdown: `The entrance to a Kazakh yurt is more than a simple door — it is a **sacred threshold** that separates the harsh outer world from the protected sanctuary within. The **Esik** (door frame) and **Tundik** (door curtain) embody the nomadic values of hospitality and protection.

The **Esik** is framed by wooden thresholds that create a formal boundary between outside and inside. Traditional yurt doors face south, away from the prevailing winds, and are often decorated with intricate carvings, bright colors, and protective symbols. Stepping across the Esik, guests enter a space where they are considered sacred and protected by the ancient laws of hospitality.

The **Tundik** hangs at the entrance as a decorative felt curtain, serving both practical and symbolic purposes. It keeps out drafts, dust, and wandering animals while welcoming guests with vibrant patterns. The Tundik represents the boundary between the harsh steppe and the sanctuary within — its designs often featuring protective symbols and blessings for the household.

The saying **"Konak kudaý dyny"** — "The guest is the envoy of God" — guides every aspect of the doorway's design and use. The entrance must be welcoming yet protective, open yet discerning, humble yet dignified. Even the poorest nomad family would ensure their doorway was adorned with the best craftsmanship they could afford.`
	},
	{
		id: 'bindings-straps',
		order: 10,
		title: 'Tuirlyq and Uzyk — The Bonds That Hold',
		description: 'Woven bands and leather straps that give the yurt its strength.',
		imagePublicId: 'content/pages/heritage/yurtNomadiclife/tuirlyq',
		contentMarkdown: `The yurt's strength lies not just in its wooden frame, but in the **web of connections** that bind it together. The **Tuirlyq** (woven tension bands) and **Uzyk** (leather straps) are essential elements that transform individual components into a unified, resilient structure.

The **Tuirlyq** encircles the yurt horizontally, holding the Kerege walls firmly in place and providing the tension that keeps the structure rigid. Made from horsehair or woven wool, these bands must be incredibly strong yet flexible enough to accommodate the yurt's natural movement in the wind. The Tuirlyq represents the strength of family bonds — flexible yet unbreakable, holding everything together through storms and sunshine alike.

The **Uzyk** are leather and woven straps used throughout the yurt's construction and transport. During assembly, they secure the Kerege sections together. When breaking camp, they bind the folded lattice, bundled Uyk poles, and rolled felts into compact loads that can be carried by camels or horses.

In the assembled yurt, the Uzyk become part of the decorative elements — their practical function transformed into aesthetic beauty. Different colors and weaving patterns distinguish the various straps, creating a visual language that experienced nomads could read at a glance.`
	},
	{
		id: 'legacy-eternal',
		order: 11,
		title: 'The Eternal Legacy',
		description: 'Why the nomadic spirit remains the beating heart of Kazakh identity.',
		imagePublicId: 'content/pages/heritage/yurtNomadiclife/etern',
		contentMarkdown: `The world has changed. The industrial revolution came, and with it the comforts and compromises of modern life. Most Kazakhs now live in cities and towns, in apartments with running water and central heating. The yurts that once dotted the steppe are fewer now, clustered at summer pastures or set up for celebrations.

**But the soul remembers.**

Look into the eyes of a modern Kazakh, and you will still see it — that distant gaze that looks beyond concrete walls toward invisible horizons. Listen to their music, and you will hear the wind of the steppe, the rhythm of galloping horses, the cry of eagles. Watch them at celebration, and you will witness the same spontaneous joy, the same generous hospitality, the same fierce pride that animated their ancestors.

**The nomadic spirit is not lost; it is merely sleeping**, waiting in the DNA, in the stories told by grandmothers, in the taste of kumis fermented the old way, in the feeling that comes over a Kazakh when they step out into open country and feel the wind on their face.

The pure life of the nomad — the clean air, the pure water, the healthy food, the constant movement through beauty, the songs that celebrated existence itself — **this was not merely a way of surviving. It was a way of being fully alive.**

**The yurt still stands** — at festivals, at family celebrations, in the hearts of a people who will never forget that they were once the freest people on earth, the eternal wanderers, the children of the endless steppe.`
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
		const pageRef = adminDB.collection('pages').doc('heritage').collection('articles').doc('yurt-nomadic-life');
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
		console.error('[culture/yurt-nomadic-life] load error', error);
		return {
			page: FALLBACK_PAGE,
			sections: FALLBACK_SECTIONS
		};
	}
};
