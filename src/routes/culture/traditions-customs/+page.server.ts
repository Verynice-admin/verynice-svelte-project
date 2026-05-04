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
	seo: { title: 'Traditions, Customs & Social Life | Culture | VeryNice', description: 'Discover Kazakh hospitality, ceremonies, and the social customs that bind communities together.' },
	mainTitle: 'Traditions, Customs & Social Life',
	headerDescription: 'Kazakh social customs revolve around hospitality, respect for elders, and community bonds — values essential for survival on the steppe.',
	heroKicker: 'Living Traditions',
	location: 'Kazakhstan',
	articleViews: 0,
	articleLikes: 0,
	articleComments: 0,
	breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Culture', href: '/culture' }, { label: 'Traditions & Customs' }],
	headerBackgroundPublicId: 'home/content/pages/heritage/traditionsCustoms/mainTraditionsCustomsSocialLife'
};

const FALLBACK_SECTIONS = [
	{
		id: 'konakasy',
		order: 1,
		title: 'Konakasy (Hospitality)',
		description: 'The sacred tradition that makes guests messengers from God.',
		imagePublicId: 'home/content/pages/heritage/traditionsCustoms/shashu',
		contentMarkdown: `**Konakasy** — the Kazakh tradition of hospitality — is not merely good manners; it is a sacred obligation rooted in the practical realities and spiritual beliefs of nomadic life. The ancient saying *"The guest is a messenger from God"* reflects the deep reverence for anyone who crosses the threshold.

**The Host's Duty** — A Kazakh host must provide:
- **The best food available** — Even if the family has little, guests receive the finest portions
- **Comfortable seating** — The honored **Tör** position is offered to esteemed visitors
- **Attentive care** — Constant attention to the guest's needs without being intrusive
- **Protection** — A guest is under the host's protection, with their safety guaranteed

**The Guest's Role** — Guests are expected to:
- **Accept what is offered** — Refusing food or drink can insult the host
- **Offer blessings** — Guests pray for the family's prosperity
- **Share news** — Travelers bring information from other regions
- **Show appreciation** — Leaving a bit of food shows satisfaction and abundance

**Konakasy in Practice** — When a guest arrives, the host immediately begins preparations. Tea is the first offering, followed by light snacks (**baursak**, dried fruit). If the guest stays longer, a full meal is served. The host personally serves the guest, ensuring their bowl is never empty. Even unexpected guests must be welcomed warmly.

**Modern Context** — While urban Kazakhs may not follow every traditional rule, the spirit of Konakasy remains strong. Visitors to Kazakh homes can expect generous hospitality, with hosts taking genuine pleasure in caring for their guests.`
	},
	{
		id: 'besikke-salu',
		order: 2,
		title: 'Besikke Salu — Welcoming Newborns',
		description: 'The ceremony that celebrates new life and places the baby in the cradle for the first time.',
		imagePublicId: 'home/content/pages/heritage/traditionsCustoms/BesikkeSalu',
		contentMarkdown: `**Besikke Salu** is the joyous ceremony that welcomes a newborn into the family and community. This tradition celebrates the continuation of the family line and asks for blessings on the child's future.

**The Besik (Cradle)** — The Kazakh cradle is a masterpiece of practical design. Its wooden frame rocks gently, while adjustable straps secure the baby safely. A hole in the bottom allows for easy cleaning, and the elevated design protects infants from drafts and animals. The cradle is often decorated with protective amulets and beautiful textiles.

**The Ceremony** — When a baby is ready to leave the mother's constant care (usually around 40 days), the Besikke Salu is held:
- **Preparation** — The cradle is prepared with fresh bedding and decorations
- **Gathering** — Family and friends arrive with gifts for the baby
- **Prayers** — An elder leads prayers for the child's health and prosperity
- **First placement** — The mother places the baby in the cradle for the first time
- **Celebration** — Feasting, music, and dancing follow

**Symbolic Elements** —
- **Specially chosen bedding** — Often including items from both parents' families
- **Protective items** — Amulets against evil eye are placed near the cradle
- **Blessed water** — Used to gently wash the baby's face
- **Kumis offering** — A drop of kumis symbolizes health and vitality

**Gifts and Blessings** — Guests bring practical gifts (clothing, blankets, silver charms) and offer blessings. The most respected elder present gives the child their first formal blessing, setting the tone for their future character.`
	},
	{
		id: 'tusau-keser',
		order: 3,
		title: 'Tüsau Keser — First Steps Ceremony',
		description: 'Celebrating a child\'s first steps by cutting the symbolic ties that bind their legs.',
		imagePublicId: 'content/site/backgrounds/attractions-hero',
		contentMarkdown: `**Tüsau Keser** marks one of childhood's most important milestones — the first steps toward independence. This ceremony cuts the symbolic ties (black and white threads wrapped around the child's legs) that represent the bond between infant and mother, allowing the child to walk freely into their future.

**The Symbolic Ties** — Before the ceremony, black and white threads are loosely wrapped around the child's ankles. These represent:
- **The black thread** — The earthly ties and potential difficulties in life
- **The white thread** — Purity, protection, and the mother's care
- **Together** — The necessary bond that must be gently released for growth

**The Ceremony** —
1. **Gathering** — Family and friends assemble, with respected elders taking honored positions
2. **The cutter** — A successful, respected person (often with many children) is chosen to cut the ties
3. **The cutting** — Using special scissors, the cutter severs the threads while saying blessings
4. **First steps** — The child walks between two rows of guests who offer candy and coins
5. **Feasting** — A celebration follows with traditional foods

**The Race** — Often, two children of similar age race after the ceremony. The one who walks or runs fastest is playfully predicted to succeed in life. This lighthearted competition adds joy to the proceedings.

**Blessings for the Future** — Elders offer specific wishes:
- Walk confidently through life
- Meet good people on your path
- Overcome obstacles with strength
- Return home safely from all journeys

**Modern Celebrations** — While urban families may simplify the ceremony, many still honor this tradition, recognizing the importance of marking developmental milestones and connecting children to their heritage.`
	},
	{
		id: 'betashar',
		order: 4,
		title: 'Betashar — Unveiling the Bride',
		description: 'The wedding tradition of lifting the bride\'s veil and welcoming her to her new family.',
		imagePublicId: 'content/site/backgrounds/attractions-hero',
		contentMarkdown: `**Betashar** is the dramatic wedding ceremony where the bride's face covering is lifted for the first time in her new home, marking her official transition from daughter to wife and welcoming her into her husband's family.

**The Veil** — The bride wears a beautiful veil (**Jelek**) throughout the wedding festivities. This covering:
- **Protects her** — From evil eye during the vulnerable transition
- **Symbolizes modesty** — Her beauty is revealed only to her new family
- **Represents mystery** — The groom's family eagerly awaits seeing their new daughter

**The Ceremony** —
1. **Arrival** — The bride arrives at her new home, still veiled
2. **Gathering** — Female relatives and friends form a circle around her
3. **Betashar Zhyr** — Women sing traditional songs with instructions and blessings for married life
4. **The unveiling** — A respected female relative (often the groom's mother) lifts the veil
5. **Presentation** — The bride shows her face to the gathered family
6. **Acceptance** — The new family welcomes her with gifts and embraces

**The Songs (Betashar Zhyr)** — These traditional songs:
- **Instruct the bride** — How to be a good wife, daughter-in-law, and mother
- **Bless the union** — Prayers for fertility, prosperity, and happiness
- **Tell stories** — Of great women from history and legend
- **Teach values** — The importance of patience, hard work, and family loyalty

**Gifts and Blessings** — The new family presents the bride with jewelry, clothing, and household items. Each gift symbolizes their acceptance and their hopes for her future in the family.

**Modern Adaptations** — While many urban weddings have simplified Betashar, the core elements — the veil, the songs, the unveiling, and the welcome — remain essential parts of Kazakh wedding celebrations.`
	},
	{
		id: 'respect-elders',
		order: 5,
		title: 'Respect for Elders (Aksakal)',
		description: 'The foundation of Kazakh social order honoring age, wisdom, and experience.',
		imagePublicId: 'home/content/pages/heritage/traditionsCustoms/RespectforElders',
		contentMarkdown: `Respect for elders (**Aksakal** — literally "white-bearded") forms the foundation of Kazakh social order. This reverence for age and experience shaped everything from family dynamics to community governance.

**The Aksakal Council** — In traditional communities, respected elders formed councils that:
- **Resolved disputes** — Judging conflicts between families or individuals
- **Made community decisions** — Where to pasture, when to move, how to respond to threats
- **Preserved traditions** — Ensuring customs were passed to younger generations
- **Dispensed wisdom** — Offering advice on everything from marriage to business

**Family Hierarchy** — Within families, age determined status:
- **Grandparents** — Held ultimate authority and received the best of everything
- **Parents** — Managed daily affairs but deferred to their own parents
- **Children** — Served elders, seeking their blessing for major decisions
- **Youngest members** — Learned by serving and observing

**Daily Practices** —
- **Seating** — Elders receive the honored position (Tör) in any gathering
- **Serving order** — Food and drink are offered to elders first
- **Language** — Special respectful forms of address are used
- **Consultation** — Major decisions require elder input and blessing
- **Care** — The young are obligated to care for aging family members

**The Blessing (Bata)** — An elder's blessing carries spiritual weight. Before journeys, marriages, or important ventures, young people bow to receive the elder's **Bata** — prayers for success and protection.

**Modern Relevance** — While formal Aksakal councils have diminished, respect for elders remains central to Kazakh identity. Young people still seek elder blessings, offer seats to older passengers, and care for aging parents. This reverence connects modern Kazakhs to generations past.`
	}
];

export const load: PageServerLoad = async () => {
	if (!adminDB) {
		return { page: FALLBACK_PAGE, sections: FALLBACK_SECTIONS };
	}

	try {
		const pageRef = adminDB.collection('pages').doc('heritage').collection('articles').doc('traditions-customs');
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
		console.error('[culture/traditions-customs] load error', error);
		return { page: FALLBACK_PAGE, sections: FALLBACK_SECTIONS };
	}
};
