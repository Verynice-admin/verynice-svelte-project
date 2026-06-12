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
		title: 'Arts, Crafts & Material Culture | Culture | VeryNice',
		description: 'Discover Kazakh felt-making, embroidery, eagle hunting, and traditional crafts that transform steppe resources into objects of beauty.'
	},
	mainTitle: 'Arts, Crafts & Material Culture',
	headerDescription: 'Kazakh material culture reflects the resources of the steppe — wool, leather, wood, and metals transformed into objects of beauty and utility.',
	heroKicker: 'Crafted Heritage',
	location: 'Kazakhstan',
	articleViews: 0,
	articleLikes: 0,
	articleComments: 0,
	breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Culture', href: '/culture' }, { label: 'Arts & Crafts' }],
	headerBackgroundPublicId: 'content/pages/destinations/Turkistan_Shymkent/khoja-ahmed-yasawi-mausoleum/khoja-ahmed-yasawi-mausoleum-01'
};

const FALLBACK_SECTIONS = [
	{
		id: 'felt-making',
		order: 1,
		title: 'Felt-making (Syrmak)',
		description: 'The foundation of Kazakh crafts, transforming sheep wool into dense, beautiful fabric.',
		imagePublicId: 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-01',
		contentMarkdown: `Felt-making is the foundation of Kazakh crafts, with techniques passed down through generations of women who transformed raw sheep wool into the functional and decorative materials that defined nomadic life.

**The Process** — Creating felt involves several stages:
1. **Shearing and cleaning** — Wool is collected and washed to remove dirt and oils
2. **Carding** — Fibers are aligned using special combs to create fluffy layers
3. **Layering** — Wool is arranged in crisscrossing layers for strength
4. **Wetting and rolling** — Hot water and soap help fibers bind as the wool is rolled tightly
5. **Fulling** — Hours of rolling, beating, and working the wool creates dense, durable felt

**Syrmak (Appliqué Felt)** — This decorative technique involves cutting colored felt into geometric shapes and stitching them onto a base fabric. Common motifs include ram's horns, sunbursts, stylized flowers, and protective symbols. Each region developed distinct color palettes — western Kazakhs favored bold reds and blacks, while eastern artisans preferred blues and greens.

**Tektireme (Pile Rugs)** — Similar to oriental carpets, these feature raised patterns created by knotting wool around warp threads. Tektireme served as floor coverings and wall insulation, with complex designs indicating family history and tribal affiliation.

**Practical Applications** — Felt was essential for yurt coverings (**Uï kïzï**), floor carpets (**Keleme**), saddle blankets, clothing insulation, and storage bags. The famous **Shyrdak** patterned felts are now recognized by UNESCO as Intangible Cultural Heritage.`
	},
	{
		id: 'embroidery',
		order: 2,
		title: 'Embroidery (Kezde)',
		description: 'Intricate needlework adorning clothing, wall hangings, and accessories.',
		imagePublicId: 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-02',
		contentMarkdown: `Kazakh embroidery (**Kezde**) transforms simple fabrics into works of art. Women adorned everything from wedding dresses to horse blankets with intricate needlework, each stitch carrying cultural meaning and protective symbolism.

**Techniques** — Kazakh embroiderers mastered several methods:
- **Chain stitch** — Creates flowing lines perfect for organic motifs
- **Satin stitch** — Fills areas with smooth, glossy texture
- **Cross-stitch** — Forms geometric patterns with mathematical precision
- **Goldwork** — Uses metal threads for ceremonial pieces

**Symbolic Motifs** — Every pattern carried meaning:
- **Ram's horns (Koshkar mūyiz)** — Strength, prosperity, and masculine energy
- **Pomegranate (Anar)** — Fertility, family abundance, and many children
- **Sun (Kün)** — Life, warmth, and divine blessing
- **Tulip (Qyzghalaq)** — Beauty, spring, and young love
- **Scorpion (Shayaq)** — Protection against evil eye and misfortune
- **Eagle's wing (Bürkit qanaty)** — Power and spiritual elevation

**Regional Styles** — Each region developed distinctive embroidery traditions:
- **Western Kazakhstan** — Bold, large-scale patterns with strong contrasts
- **Eastern regions** — Finer, more delicate work with floral emphasis
- **Southern areas** — Influenced by Uzbek and Kyrgyz neighbors, featuring brighter colors
- **Northern steppes** — Geometric precision with protective symbolism

**Ceremonial Pieces** — Wedding garments received the most elaborate embroidery, with a bride's dowry including dozens of embroidered items representing thousands of hours of work.`
	},
	{
		id: 'leather-woodwork',
		order: 3,
		title: 'Leather and Woodwork',
		description: 'Saddles, bridles, carved bowls, and the implements of nomadic life.',
		imagePublicId: 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-03',
		contentMarkdown: `Leather and wood were essential materials for nomadic life, crafted into everything from horse equipment to household items. Kazakh artisans developed sophisticated techniques to create durable, beautiful objects that served both practical and status purposes.

**Leatherworking** — The **Uykha** (leatherworker) was a respected specialist who created:
- **Saddles (Er)** — Wooden frames covered with leather, often decorated with silver studs and embroidery
- **Bridles and reins (Qamshy, Uzengi)** — Intricately tooled leather with metal fittings
- **Whips (Kamcha)** — Both functional tools and status symbols, with elaborate silver handles
- **Storage containers (Ayak)** — Leather bags for keeping food, water, and valuables
- **Boots (Etik)** — High leather footwear designed for horseback riding

**Woodcraft** — Wood was precious on the treeless steppe, often obtained through trade. Skilled carvers created:
- **Asi bowls** — Turned wood vessels for serving kumis and other drinks
- **Spoons and utensils** — Carved from birch, willow, or imported woods
- **Furniture** — Low tables, chests, and storage boxes with geometric carvings
- **Musical instruments** — Dombra bodies, Kobyz frames, and drum shells
- **Yurt components** — The Shanyrak, door frames, and Kerege lattices required precise woodworking

**Decoration Techniques** — Leather was often tooled with heated stamps to create raised patterns. Wood was carved, burned, or inlaid with bone and metal. Both materials were frequently combined — a wooden bowl might have leather straps, while a leather saddle featured carved wooden elements.`
	},
	{
		id: 'metalwork-jewelry',
		order: 4,
		title: 'Metalwork and Jewelry',
		description: 'Silver craftsmanship creating tea sets, bridal jewelry, and protective amulets.',
		imagePublicId: 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-04',
		contentMarkdown: `Kazakh metalworkers (**Kumisşi**) transformed silver, copper, and gold into objects of extraordinary beauty. Their creations ranged from everyday utensils to elaborate bridal jewelry, each piece reflecting the owner's status and carrying protective symbolism.

**Silver Jewelry** — Kazakh silversmiths created an extensive repertoire:
- **Bilezik (bracelets)** — Worn in multiples, often featuring protective eye motifs
- **Syrga (earrings)** — Large, dangling designs that framed the face
- **Sholpy (rings)** — Featuring animal and geometric symbols
- **Tumar (amulet holders)** — Small containers worn on the chest for prayers and blessed materials
- **Belt buckles** — Elaborate silver pieces displaying family emblems
- **Hair ornaments** — Combs, pins, and diadems for special occasions

**Tea Sets and Utensils** — Hospitality required beautiful serving ware:
- **Samovars and kettles** — For preparing tea
- **Cups and bowls (Piyala)** — Often with decorative holders
- **Trays** — For serving guests
- **Spoons and ladles** — With decorated handles

**Protective Symbolism** — Metalwork often incorporated protective elements:
- **Blue stones** — Turquoise and blue glass against evil eye
- **Inscriptions** — Prayers and Quranic verses
- **Animal motifs** — Ram's horns, eagle feathers, and wolf symbols
- **Geometric patterns** — Complex designs believed to trap negative energy

**Techniques** — Artisans used hammering, casting, engraving, filigree, and granulation. Many techniques were family secrets passed from master to apprentice over generations.`
	},
	{
		id: 'eagle-hunting',
		order: 5,
		title: 'Eagle Hunting (Burkitshi)',
		description: 'The ancient tradition of training golden eagles for cooperative hunting.',
		imagePublicId: 'content/pages/destinations/Almaty_nearby/besshatyr-scythian-mounds/besshatyr-scythian-mounds-01',
		contentMarkdown: `Eagle hunting (**Burkitshi**) represents one of humanity's most remarkable partnerships with wildlife. For centuries, Kazakh hunters in the Altai mountains have trained golden eagles to hunt foxes, hares, and even wolves, creating a bond that transcends species.

**The Berkutchi** — The eagle hunter is a respected figure who dedicates years to mastering the craft. Training begins with selecting a young eagle (usually female, as they're larger and more aggressive) from the nest. The bird lives with the hunter's family, becoming a member of the household.

**Training Process** — Training an eagle takes 3-4 years of daily work:
- **Imprinting** — The young eagle bonds with the hunter
- **Manning** — The bird becomes comfortable with human presence
- **Lure training** — Eagles learn to chase dragged prey
- **Live hunting** — Graduated release on actual prey animals
- **Recapture** — Eagles return to the hunter's glove after the hunt

**The Hunt** — Mounted on sturdy horses, hunters release their eagles to spot prey from above. The eagle stoops at incredible speed, using talons that exert hundreds of pounds of pressure per square inch to kill instantly. The hunter must arrive quickly to secure the catch and reward the bird.

**Equipment** — Specialized gear includes:
- **Leather glove (Müyiz)** — Thick protection for the hunter's arm
- **Hood (Tumara)** — Leather cap that calms the eagle
- **Anklets and jesses** — Leather straps for secure handling
- **Perch (Qaraq)** — Portable stand for the eagle

**Cultural Significance** — Eagle hunting embodies Kazakh values of patience, partnership with nature, and respect for animals. The tradition continues today, with annual festivals in the Altai region celebrating this unique heritage.`
	}
];

export const load: PageServerLoad = async () => {
	if (!adminDB) {
		return { page: FALLBACK_PAGE, sections: FALLBACK_SECTIONS };
	}

	try {
		const pageRef = adminDB.collection('pages').doc('heritage').collection('articles').doc('arts-crafts');
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
		console.error('[culture/arts-crafts] load error', error);
		return { page: FALLBACK_PAGE, sections: FALLBACK_SECTIONS };
	}
};
