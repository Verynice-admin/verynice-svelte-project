const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { readFileSync, existsSync } = require('node:fs');
const { resolve } = require('node:path');

function loadServiceAccount() {
  const secretsPaths = [
    resolve('.secrets/serviceAccountKey.json'),
    resolve('.secrets/service-account.json')
  ];

  for (const secretsPath of secretsPaths) {
    try {
      if (existsSync(secretsPath)) {
        const sa = JSON.parse(readFileSync(secretsPath, 'utf8'));
        if (typeof sa.private_key === 'string' && sa.private_key.includes('\\n')) {
          sa.private_key = sa.private_key.replace(/\\n/g, '\n');
        }
        return sa;
      }
    } catch (error) {
      console.log(`Could not load from ${secretsPath}`);
    }
  }
  return null;
}

// Yurt Nomadic Life Article
const yurtNomadicLifePage = {
  seo: {
    title: 'Yurt & Nomadic Life | Culture | VeryNice',
    description: 'Discover the romantic purity of Kazakh nomadic life — a world of endless steppes, crystal rivers, and the freedom of the eternal wanderer.'
  },
  mainTitle: 'The Eternal Wanderers: Life Under the Open Sky',
  headerDescription: 'Long before the smoke of industrial chimneys darkened the horizon, before cobblestone streets became clogged with filth and refuse, the Kazakh people danced with the wind across an unspoiled paradise — living as nature intended, pure and free.',
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

const yurtNomadicLifeSections = [
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
    description: "Slender roof poles that create the yurt's distinctive dome.",
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

// Arts & Crafts Article
const artsCraftsPage = {
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
  headerBackgroundPublicId: 'content/site/backgrounds/attractions-hero'
};

const artsCraftsSections = [
  {
    id: 'felt-making',
    order: 1,
    title: 'Felt-making (Syrmak)',
    description: 'The foundation of Kazakh crafts, transforming sheep wool into dense, beautiful fabric.',
    imagePublicId: 'content/site/backgrounds/attractions-hero',
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
    imagePublicId: 'content/site/backgrounds/attractions-hero',
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
    imagePublicId: 'content/site/backgrounds/attractions-hero',
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
    imagePublicId: 'content/site/backgrounds/attractions-hero',
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
    imagePublicId: 'content/site/backgrounds/attractions-hero',
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

// Traditions & Customs Article
const traditionsCustomsPage = {
  seo: { title: 'Traditions, Customs & Social Life | Culture | VeryNice', description: 'Discover Kazakh hospitality, ceremonies, and the social customs that bind communities together.' },
  mainTitle: 'Traditions, Customs & Social Life',
  headerDescription: 'Kazakh social customs revolve around hospitality, respect for elders, and community bonds — values essential for survival on the steppe.',
  heroKicker: 'Living Traditions',
  location: 'Kazakhstan',
  articleViews: 0,
  articleLikes: 0,
  articleComments: 0,
  breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Culture', href: '/culture' }, { label: 'Traditions & Customs' }],
  headerBackgroundPublicId: 'content/site/backgrounds/attractions-hero'
};

const traditionsCustomsSections = [
  {
    id: 'konakasy',
    order: 1,
    title: 'Konakasy (Hospitality)',
    description: 'The sacred tradition that makes guests messengers from God.',
    imagePublicId: 'content/site/backgrounds/attractions-hero',
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
    imagePublicId: 'content/site/backgrounds/attractions-hero',
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
    description: "Celebrating a child's first steps by cutting the symbolic ties that bind their legs.",
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
    imagePublicId: 'content/site/backgrounds/attractions-hero',
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

// Mythology & Folklore Article
const mythologyFolklorePage = {
  seo: { title: 'Mythology, Folklore & Beliefs | Culture | VeryNice', description: 'Explore Kazakh epic heroes, the winged Tulpar horse, spirits of the steppe, and ancient shamanic traditions.' },
  mainTitle: 'Mythology, Folklore & Beliefs',
  headerDescription: 'Kazakh spiritual life blends ancient Turkic shamanism, Islam, and folk beliefs, creating a rich tapestry of stories, spirits, and cosmic understanding.',
  heroKicker: 'Ancient Tales',
  location: 'Kazakhstan',
  articleViews: 0,
  articleLikes: 0,
  articleComments: 0,
  breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Culture', href: '/culture' }, { label: 'Mythology & Folklore' }],
  headerBackgroundPublicId: 'content/site/backgrounds/attractions-hero'
};

const mythologyFolkloreSections = [
  {
    id: 'tengri',
    order: 1,
    title: 'Tengri and the Sky God',
    description: 'The ancient religion centered on the eternal blue sky.',
    imagePublicId: 'content/site/backgrounds/attractions-hero',
    contentMarkdown: `The ancient Kazakh religion centered on **Tengri** — the eternal blue sky, source of all life, and supreme deity. This belief system, known as **Tengrianism**, shaped nomadic spirituality for millennia before the arrival of Islam.

**The Sky God (Kök Tengri)** — Tengri is not a god in the anthropomorphic sense but rather the infinite sky itself — ever-present, all-seeing, and eternal. The sky's color, its vastness, and its changeable nature reflected Tengri's moods and messages. Clear blue skies indicated divine favor, while storms expressed displeasure.

**The Shaman (Baqsy/Qam)** — The shaman served as mediator between humans and the spiritual realm. Through drumming, chanting, and trance, the Baqsy:
- **Healed illnesses** — By identifying and removing spiritual causes
- **Predicted the future** — Reading signs in nature and communicating with spirits
- **Led ceremonies** — Ensuring proper relations with the divine
- **Traveled between worlds** — Journeying to the upper and lower realms in trance

**Sacred Sites (Jer-Subı)** — The landscape itself was alive with sacred power:
- **Mountains** — Homes of powerful spirits, requiring offerings before crossing
- **Springs and rivers** — Sources of life and purification
- **Lone trees** — Often sacred, tied with ribbons and cloth offerings
- **Rock formations** — Believed to be petrified giants or spirit dwellings

**Rituals and Offerings** —
- **Sprinkling kumis** — To the sky and earth before drinking
- **Tying ribbons** — On sacred trees as prayers
- **Stone piles (Obo)** — Built and circled for blessings at mountain passes
- **Animal sacrifices** — For major ceremonies and healing rituals

**Syncretism with Islam** — Many Tengrian beliefs merged with Islamic practice. The sky remained sacred, saints replaced local spirits, and shamanic healing continued alongside Islamic medicine. This blend created the unique Kazakh spiritual worldview.`
  },
  {
    id: 'epic-heroes',
    order: 2,
    title: 'Epic Heroes',
    description: 'The superhuman warriors who protect their people in tales thousands of verses long.',
    imagePublicId: 'content/site/backgrounds/attractions-hero',
    contentMarkdown: `Kazakh epic poetry preserves the deeds of legendary heroes (**Batırlar**) who embody the virtues of strength, courage, loyalty, and wisdom. These epics, some stretching over 200,000 lines, are performed by bards (**Zhyraus**) who memorize and transmit these sacred histories.

**Manas** — The greatest of all Turkic epics, shared between Kazakhs and Kyrgyz, tells of Manas the Magnificent and his descendants who united warring tribes against invaders. The epic blends history with myth, featuring:
- **Manas's birth** — Foretold by dreams and marked by miracles
- **His campaigns** — Uniting 40 tribes into the Kyrgyz-Kazakh nation
- **His death** — By treachery, followed by his son Semetey's revenge
- **His legacy** — The continuation through 47 generations in the full epic cycle

**Koblandy** — A Kazakh national hero whose epic recounts:
- **His miraculous conception** — Born to parents who prayed for a son
- **His impossible tasks** — Overcoming challenges to win his bride
- **His battles** — Defeating giants, monsters, and enemy armies
- **His tragic death** — Killed by betrayal, mourned by the nation

**Alpamys** — This hero's story features:
- **Early strength** — Performing superhuman feats as a child
- **Exile and return** — Betrayed by his brothers, returning to reclaim his honor
- **Seven trials** — Overcoming supernatural challenges
- **Reconciliation** — Forgiving his brothers and restoring family unity

**Common Themes** — All epics share:
- **The hero's exceptional birth** — Marked by prophecy and miracles
- **A magical horse** — The Tulpar, winged and able to speak
- **Faithful companions** — Warriors who follow the hero to death
- **The evil sorcerer** — An antagonist using dark magic
- **The restoration of order** — The hero bringing peace and justice`
  },
  {
    id: 'tulpar',
    order: 3,
    title: 'The Tulpar — Winged Horse of Legend',
    description: 'The mythical steed embodying speed, beauty, and the connection between earth and sky.',
    imagePublicId: 'content/site/backgrounds/attractions-hero',
    contentMarkdown: `The **Tulpar** is the winged horse of Kazakh mythology — a creature of impossible beauty, supernatural speed, and profound spiritual significance. More than a mere mount, the Tulpar represents the ideal partnership between human and nature, earth and sky.

**Physical Description** — The Tulpar is described in poetry and epic song:
- **Golden coat** — Shining like the sun, with mane and tail of silver
- **Wings** — Feathered like an eagle's, folded along the flanks when not in flight
- **Eyes** — Seeing for leagues, piercing through deception and darkness
- **Speed** — Faster than the wind, able to cross the steppe in a single day
- **Intelligence** — Able to speak, advise its rider, and make moral choices

**Symbolism** — The Tulpar embodies multiple layers of meaning:
- **The soul's journey** — Carrying the hero between worlds
- **National identity** — The nomadic spirit that cannot be contained
- **Divine blessing** — Only the worthy receive a Tulpar as companion
- **Freedom** — The ability to transcend earthly limitations
- **Loyalty** — Standing by the hero even unto death

**In Epic Poetry** — Every major hero has a Tulpar steed:
- **Manas's Akkulak** — The Gray White horse that carried him to victory
- **Koblandy's Karasher** — The Black Lion, fierce and loyal
- **Alpamys's Bayshobar** — The Wonder Horse who spoke wisdom

**Modern Presence** — The Tulpar remains a powerful symbol:
- **National emblem** — Appearing on the presidential seal
- **Monuments** — Giant Tulpar statues in cities across Kazakhstan
- **Art and jewelry** — The winged horse adorns everything from paintings to pendants
- **Sports teams** — Named after this legendary creature
- **Space program** — The first Kazakh satellite was named Tulpar`
  },
  {
    id: 'spirits-nature',
    order: 4,
    title: 'Spirits of Nature',
    description: 'The supernatural beings that inhabit the wild places of the steppe.',
    imagePublicId: 'content/site/backgrounds/attractions-hero',
    contentMarkdown: `The Kazakh worldview is populated by spirits (**Jin**) and supernatural beings that inhabit the landscape. Understanding these entities and maintaining proper relations with them was essential for safety and prosperity.

**Jinn and Peri** —
- **Jinn** — Spirits of wild places, neither inherently good nor evil. They could help or harm humans depending on how they were treated. Respectful behavior toward nature kept Jinn placated.
- **Peri** — Beautiful fairy-like spirits associated with water, flowers, and pure places. They could bestow blessings on humans but also punish those who desecrated their domains.

**Ubur (Ancestor Spirits)** — The spirits of deceased family members continued to influence the living:
- **Protection** — Watching over descendants and warning of danger
- **Judgment** — Displeasure shown through misfortune or illness
- **Communication** — Contacted through dreams and rituals
- **Demands** — Expecting proper funeral rites and ongoing remembrance

**Yer-Su (Spirits of Place)** — Every significant location had a spirit:
- **Mountain spirits** — Powerful, requiring offerings before crossing
- **Water spirits** — Giving life but dangerous if disrespected
- **Forest spirits** — Guardians of the trees and animals
- **Steppe spirits** — The vast open spaces held their own entities

**Zhaqsy and Zhaman (Good and Evil Forces)** — The universe contains constant interaction between opposing forces:
- **Zhaqsy** — Beneficent powers supporting life and prosperity
- **Zhaman** — Destructive forces causing illness and misfortune
- **Balance** — Maintained through proper rituals and moral behavior
- **Protection** — Amulets, prayers, and good deeds ward off evil

**Protective Practices** —
- **Blue beads** — Against evil eye
- **Prayers before journeys** — Asking permission from Yer-Su
- **Respectful behavior in wild places** — Not polluting or desecrating
- **Honoring ancestors** — Keeping their memory alive`
  },
  {
    id: 'folk-medicine',
    order: 5,
    title: 'Folk Medicine and Healing',
    description: 'Traditional healing combining herbs, bonesetting, and spiritual practices.',
    imagePublicId: 'content/site/backgrounds/attractions-hero',
    contentMarkdown: `Kazakh folk medicine represents a sophisticated system developed over centuries of nomadic life. Combining herbal knowledge, manipulative therapy, and spiritual practices, traditional healers addressed both physical and supernatural causes of illness.

**The Darvish** — Wandering holy persons who brought blessings and healing:
- **Spiritual healing** — Through prayers and laying on of hands
- **Herbal knowledge** — Collecting and prescribing medicinal plants
- **Divination** — Identifying spiritual causes of illness
- **Protection** — Creating amulets and talismans

**Tawba (Ritual Prayers)** — Specific prayers for protection and healing:
- **Against evil eye** — When someone has looked with envy
- **For safe journey** — Before traveling
- **For recovery** — During illness
- **For prosperity** — During hardship

**Herbal Medicine** — Kazakh healers knew hundreds of medicinal plants:
- **St. John's Wort** — For depression and wounds
- **Yarrow** — To stop bleeding and reduce fever
- **Chamomile** — For digestive issues and calming
- **Sage** — For throat and respiratory conditions
- **Thyme** — As an antiseptic and cough remedy
- **Wild rose** — For vitamin C and immune support

**Bonesetting (Sınıqsha)** — Specialists in treating fractures and dislocations:
- **Manipulation** — Realigning bones through skilled touch
- **Splinting** — Using wood and leather for support
- **Massage** — Treating muscle injuries and chronic pain
- **Preventive care** — Advice on posture and movement

**Spiritual Healing** — When illness was believed to have supernatural causes:
- **Shamanic journey** — The Baqsy traveling to find lost soul parts
- **Extraction** — Removing spiritual intrusions causing illness
- **Restoration** — Returning balance between patient and spirit world
- **Protection rituals** — Preventing recurrence

**Modern Integration** — Many Kazakhs combine traditional and modern medicine, visiting doctors for serious conditions while using folk remedies for minor ailments and spiritual healing when conventional medicine fails.`
  }
];

async function seedArticle(db, articleId, pageData, sections, articleName) {
  try {
    const docRef = db.collection('pages').doc('heritage').collection('articles').doc(articleId);
    await docRef.set({
      ...pageData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log(`✓ Created ${articleName} article`);

    const sectionsRef = docRef.collection('sections');
    for (const section of sections) {
      await sectionsRef.doc(section.id).set({
        order: section.order,
        title: section.title,
        description: section.description,
        imagePublicId: section.imagePublicId,
        contentMarkdown: section.contentMarkdown,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`  ✓ Created section: ${section.id}`);
    }
    console.log('');
  } catch (error) {
    console.error(`Error seeding ${articleName}:`, error);
    throw error;
  }
}

async function seedAllArticles() {
  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    console.error('Could not load service account. Make sure .secrets/serviceAccountKey.json exists');
    process.exit(1);
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
  }

  const db = getFirestore();

  try {
    console.log('Seeding heritage articles to Firebase...\n');

    await seedArticle(db, 'yurt-nomadic-life', yurtNomadicLifePage, yurtNomadicLifeSections, 'Yurt & Nomadic Life');
    await seedArticle(db, 'arts-crafts', artsCraftsPage, artsCraftsSections, 'Arts & Crafts');
    await seedArticle(db, 'traditions-customs', traditionsCustomsPage, traditionsCustomsSections, 'Traditions & Customs');
    await seedArticle(db, 'mythology-folklore', mythologyFolklorePage, mythologyFolkloreSections, 'Mythology & Folklore');

    console.log('✅ All heritage articles seeded successfully!');
    console.log('\nFirebase paths created:');
    console.log('  - pages > heritage > articles > yurt-nomadic-life');
    console.log('  - pages > heritage > articles > arts-crafts');
    console.log('  - pages > heritage > articles > traditions-customs');
    console.log('  - pages > heritage > articles > mythology-folklore');
    console.log('  - pages > heritage > articles > kazakh-melodies (already created)');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedAllArticles();
