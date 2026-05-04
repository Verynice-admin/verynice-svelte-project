/**
 * Seed Art & Crafts Page to Firebase
 * Target: home/content/pages/heritage/artandcrafts
 */

import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

dotenv.config();

const cwd = process.cwd();

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadServiceAccount() {
  const candidates = [
    path.resolve(cwd, '.secrets/serviceAccountKey.json'),
    path.resolve(cwd, '.secrets/service-account.json'),
    process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? path.resolve(cwd, process.env.GOOGLE_APPLICATION_CREDENTIALS)
      : null,
    path.resolve(cwd, 'serviceAccountKey.json'),
    path.resolve(cwd, 'service-account.json')
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        const data = readJson(candidate);
        if (typeof data.private_key === 'string' && data.private_key.includes('\\n')) {
          data.private_key = data.private_key.replace(/\\n/g, '\n');
        }
        return data;
      }
    } catch (error) {
      // Try next candidate
    }
  }

  const jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (typeof data.private_key === 'string' && data.private_key.includes('\\n')) {
        data.private_key = data.private_key.replace(/\\n/g, '\n');
      }
      return data;
    } catch (error) {
      // ignore
    }
  }

  return null;
}

const serviceAccount = loadServiceAccount();
if (!serviceAccount) {
  console.error('[seed] No service account found.');
  console.error('[seed] Place serviceAccountKey.json in .secrets/ or set GOOGLE_APPLICATION_CREDENTIALS.');
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id
  });
}

const db = getFirestore();
const now = FieldValue.serverTimestamp();

// Page metadata - using home/content/pages path
const pageData = {
  id: 'cultureArtAndCrafts',
  mainTitle: 'Art & Crafts',
  headerDescription: 'Discover the rich traditions of Kazakh arts and crafts — from intricate embroidery (keste) and silver jewelry to felt-making and the ancient art of eagle hunting.',
  heroKicker: 'Handcrafted Heritage',
  location: 'Kazakhstan',
  articleViews: 0,
  articleLikes: 0,
  articleComments: 0,
  headerBackgroundPublicId: 'home/content/pages/heritage/artandcrafts/hero/main',
  breadcrumbs: [
    { label: 'Home', href: '/' },
    { label: 'Culture', href: '/culture' },
    { label: 'Art & Crafts' }
  ],
  seo: {
    title: 'Art & Crafts | Culture | VeryNice',
    description: 'Explore Kazakh traditional arts and crafts — keste embroidery, silver jewelry, felt-making, and eagle hunting heritage.'
  },
  updatedAt: now,
  createdAt: now
};

// Sections based on uploaded image categories
const sections = [
  {
    id: 'keste-embroidery',
    order: 1,
    title: 'Keste — Traditional Embroidery',
    description: 'The intricate art of Kazakh embroidery that tells stories through thread.',
    imagePublicId: 'home/content/pages/heritage/artandcrafts/keste/decorative',
    contentMarkdown: `**Keste** is the traditional Kazakh embroidery art that transforms fabric into storytelling canvases. Every stitch carries meaning — patterns of protection, prosperity, and identity woven into garments, cradle covers, and ceremonial pieces.

**History and Significance** — Keste dates back centuries to the nomadic traditions of Central Asia. Originally created by women, these embroidered works adorned yurt interiors, wedding garments, and funeral shrouds. Each pattern was passed down through generations, with mothers teaching daughters the symbolic meanings of every motif.

**Materials and Techniques** — Traditional Keste uses silk, wool, and cotton threads on velvet, wool, or leather bases. Modern versions incorporate synthetic threads while maintaining traditional patterns. The embroidery features:

- **Geometric patterns** — Diamonds, triangles, and zigzags representing mountains, rivers, and steppe landscapes
- **Ram's horn (mūiiz)** — Symbol of strength and prosperity
- **Sun (kün)** — Life, light, and divine blessing
- **Tulip (lale)** — Beauty, youth, and spring

**Regional Variations** — Different Kazakh tribes developed distinct styles:
- **Kipchak**: Bold geometric patterns with contrasting colors
- **Naiman**: Delicate floral motifs
- **Argyn**: Intricate small patterns with silver thread accents

**Contemporary Keste** — Today, Keste experiences a renaissance. Artisans combine traditional techniques with modern designs, creating pieces for both ceremonial use and art galleries. The craft has been recognized as an Intangible Cultural Heritage of Kazakhstan.`
  },
  {
    id: 'jewelry',
    order: 2,
    title: 'Kazakh Jewelry — Silver Artistry',
    description: 'Ornate silver pieces that combine beauty with protective symbolism.',
    imagePublicId: 'home/content/pages/heritage/artandcrafts/jewelry/art',
    contentMarkdown: `Kazakh jewelry is more than decoration — it is a wearable art form combining silver craftsmanship with ancient symbolism. Each piece carries protective properties and displays family wealth and status.

**Traditional Materials** — Kazakh jewelers worked primarily with silver, often combining it with:
- **Coral** — Imported via Silk Road traders, symbolizing life force
- **Turquoise** — The sacred stone of the steppe, representing sky and water
- **Pearls** — Brought from distant lands, symbolizing purity
- **Carnelian** — Red stone for protection and vitality

**Iconic Pieces**:
- **Syrga** (Earrings) — Large, dangling designs that frame the face
- **Bilezik** (Bracelets) — Worn in multiples, featuring protective symbols
- **Sholpy** (Rings) — Often with ram's horn or sun motifs
- **Tumar** (Amulet Container) — Silver box holding protective prayers
- **Kazakh Saukele ornaments** — The iconic bride headdress adorned with silver coins

**Craftsmanship** — Traditional Kazakh silversmiths (**Kümіsшы**) used techniques passed through generations:
- Filigree work creating delicate wire patterns
- Granulationtiny silver spheres soldered to surfaces
- Chasing — hammer techniques creating raised designs
- Engraving with traditional motifs

**Symbolic Motifs**:
- Ram's horns — Strength, masculinity, prosperity
- Sun — Light, divine blessing, eternal life
- Pomegranate — Fertility, abundance
- Scorpion — Protection against evil eye
- Eight-pointed star — Harmony of universe`
  },
  {
    id: 'felt-making',
    order: 3,
    title: 'Felt Making — Syrmak Tradition',
    description: 'The ancient craft of creating felt from wool — the foundation of nomadic life.',
    imagePublicId: 'home/content/pages/heritage/artandcrafts/felt-making/syrmak',
    contentMarkdown: `Felt (**Kiym**) is perhaps the most essential craft of nomadic culture. This non-woven fabric, made from wool through heat, moisture, and pressure, provided warmth, comfort, and shelter for Kazakh nomads.

**The Syrmak Process** — Creating felt is a labor-intensive process:
1. **Wool shearing** — Collected from sheep in spring
2. **Cleaning and carding** — Removing debris and aligning fibers
3. **Layering** — Stacking thin wool layers in alternating directions
4. **Wetting and rolling** — Adding hot water and rolling to mat fibers
5. **Fulling** — Walking or pressing to interlock fibers
6. **Drying** — Stretching and drying the finished felt

**Products Made from Felt**:
- **Shyrdak** — Decorative felt rugs with appliquéd patterns
- **Tusk** — White felt for wedding ceremonies
- **Koshma** — Thick felt for winter insulation
- **Yurt covering** — Layered felt for weatherproofing
- **Cradle covers** — Soft bedding for infants
- **Clothing accessories** — Hats, boots, vests

**Traditional Patterns** — Felt products feature colorful appliquéd designs:
- **Alasha** — Repeated geometric patterns
- **Kamber** — Stylized tulip motif for beauty
- **Kyzdar basy** — "Girls' heads" — abstract female form patterns
- **Shynyrau** — Dragon or snake motifs for protection

**Cultural Significance** — Felt was so important that special ceremonies accompanied its creation. Young girls learned felt-making as essential life skills, and a woman's craftsmanship determined her family's reputation. Today, Kazakh felt art is exported worldwide as unique cultural expression.`
  },
  {
    id: 'traditional-crafts',
    order: 4,
    title: 'Traditional Crafts — Wood, Leather & Metal',
    description: 'The practical arts that supported nomadic life and created beautiful everyday objects.',
    imagePublicId: 'home/content/pages/heritage/artandcrafts/crafts/hand',
    contentMarkdown: `Beyond embroidery, jewelry, and felt, Kazakh craftspeople mastered working with wood, leather, and metal to create essential nomadic implements and beautiful decorative objects.

**Woodworking** — Nomadic life required portable, durable wooden items:
- **Saba** — Wooden bowls for eating and serving
- **Keres** — Wooden cups with decorative inlays
- **Dombra bodies** — Carved from apricot, mulberry, or pine wood
- **Kuyik** — Wooden spoons and utensils
- **Kerege** — Latticework panels for yurt walls

**Leatherwork** — Leather was essential for:
- **Footwear** — Soft leather boots (Etik) for summer
- **Belts** — Intricately carved with family patterns
- **Karbas** — Riding whips with leather lashes
- **Cases and bags** — For storing and transporting goods
- **Bow cases** — Leather protection for composite bows

**Metalwork** — Blacksmiths (**Demchi**) held respected positions in communities:
- **Horseshoes and nails** — Essential for mounted life
- **Cooking vessels** — Cauldrons and griddles
- **Tools** — Knives, axes, needles
- **Decorative elements** — Saddle ornaments, bridle bits

**The Besik Tradition** — The **Besik** (cradle) represents the pinnacle of Kazakh woodcarving. Carved from soft willow or birch, these cradles feature:
- Intricate carved patterns on headboards
- Hanging wooden beads for infant entertainment
- Leather straps for suspension
- Decorative painted elements

**Contemporary Crafts** — Traditional crafts continue today, with artisans combining ancient techniques with modern designs. Workshops in Almaty, Astana, and regional centers produce authentic items for both local use and export.`
  },
  {
    id: 'eagle-hunting',
    order: 5,
    title: 'Eagle Hunting — Burkitshi Tradition',
    description: 'The ancient partnership between hunters and golden eagles.',
    imagePublicId: 'home/content/pages/heritage/artandcrafts/eagle-hunting/hunter',
    contentMarkdown: `**Burkitshi** — the art of hunting with golden eagles — represents one of Kazakhstan's most iconic cultural traditions. This ancient practice dates back over 6,000 years to the nomadic tribes of Central Asia.

**The Golden Eagle** — Golden eagles (**Aquila chrysaetos**) are trained for hunting due to their:
- Exceptional vision — spotting prey from miles away
- Powerful build — capable of taking down large game
- Loyalty — forming strong bonds with their handlers
- Speed — diving at up to 150 mph

**Training Process** — Becoming a **Burkitshi** requires years of dedication:
1. **Selecting chicks** — Eagles are taken from nests at 30-40 days old
2. ** imprinting** — The chick bonds with its human handler
3. **Basic training** — Learning to return to the handler
4. **Hunting training** — Practicing with prey
5. **Advanced techniques** — Working in cooperation with horses

**Hunting Techniques** — Traditional eagle hunting involves:
- **Fox hunting** — The primary quarry, providing fur for winter
- **Wolf hunting** — Requires multiple eagles working together
- **Saiga antelope** — Once common, now endangered
- **Hare and ground squirrels** — Smaller game for training

**The Burkitshi Master** — Elite eagle hunters held honored positions in Kazakh society. Famous masters like **Talgat Turluk** and **Askar Yessenbekov** became national celebrities, their skills celebrated in films and documentaries.

**Modern Eagle Hunting** — Today, eagle hunting faces challenges:
- Declining wolf populations
- Conservation concerns
- Modern lifestyle changes

However, efforts to preserve this tradition continue through:
- National festivals (e.g., Kazakhstan Eagle Festival in Almaty region)
- Cultural preservation programs
- Eco-tourism initiatives
- International recognition as intangible heritage

**Equipment** — The Burkitshi uses specialized equipment:
- **Kazakh saddle** — Deep seat for stability during pursuits
- **Kazakh bow** — Composite construction for power
- **Leather gauntlets** — Protective gloves for eagle perching
- **Kuyde** — Fox-skin hood for the eagle`
  }
];

async function seed() {
  console.log('[seed] Starting Art & Crafts seed...');
  
  // Create page document
  const pageRef = db.collection('pages').doc('cultureArtAndCrafts');
  await pageRef.set(pageData);
  console.log('[seed] Created page: cultureArtAndCrafts');

  // Clear existing sections
  const sectionsRef = pageRef.collection('sections');
  const existingSections = await sectionsRef.get();
  for (const doc of existingSections.docs) {
    await doc.ref.delete();
  }
  console.log('[seed] Cleared existing sections');

  // Add new sections
  for (const section of sections) {
    const sectionData = {
      ...section,
      updatedAt: now,
      createdAt: now
    };
    await sectionsRef.doc(section.id).set(sectionData);
    console.log(`[seed] Created section: ${section.id}`);
  }

  console.log('\n[seed] ========================================');
  console.log('[seed] ART & CRAFTS PAGE SEEDED SUCCESSFULLY');
  console.log('[seed] ========================================');
  console.log('[seed] Page ID: cultureArtAndCrafts');
  console.log(`[seed] Sections created: ${sections.length}`);
  console.log('[seed] Header image:', pageData.headerBackgroundPublicId);
}

seed().catch(err => {
  console.error('[seed] Error:', err);
  process.exit(1);
});
