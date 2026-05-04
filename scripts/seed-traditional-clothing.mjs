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

// Page metadata
const pageData = {
  id: 'cultureTraditionalClothing',
  mainTitle: 'Traditional Clothing & Adornments',
  headerDescription: 'From the majestic Saukele bridal headdress to the flowing Chapan robes and intricate silver jewelry — explore the garments that express Kazakh identity, status, and artistry.',
  heroKicker: 'Woven Heritage',
  location: 'Kazakhstan',
  articleViews: 0,
  articleLikes: 0,
  articleComments: 0,
  headerBackgroundPublicId: 'content/pages/heritage/traditionalClothing/traditional-clothing-hero',
  breadcrumbs: [
    { label: 'Home', href: '/' },
    { label: 'Culture', href: '/culture' },
    { label: 'Traditional Clothing' }
  ],
  seo: {
    title: 'Traditional Clothing & Adornments | Culture | VeryNice',
    description: 'Discover the Saukele, Chapan, Shapan, and ornate jewelry that define Kazakh traditional dress.'
  },
  updatedAt: now,
  createdAt: now
};

// Sections
const sections = [
  {
    id: 'saukele',
    order: 1,
    title: 'The Saukele — Crown of the Bride',
    description: 'The tall, ornate bridal headdress that symbolizes the transition to married life.',
    imagePublicId: 'content/pages/heritage/traditionalClothing/saukele',
    contentMarkdown: `The **Saukele** stands as the crown jewel of Kazakh costume — a tall, ornate bridal headdress that transforms a young woman into a married lady. Decorated with coral, pearls, silver coins, and semi-precious stones, each Saukele represents months of meticulous craftsmanship.

**Symbolism and Meaning** — The Saukele symbolizes the transition from maidenhood to married life. Its height and ornamentation displayed family wealth and social status. The veil attached to the headdress was lifted only during the wedding ceremony, marking the bride's new identity.

**Regional Variations** — Each region developed distinct styles:
- **Western Kazakhstan**: Conical heights with elaborate silverwork
- **Eastern Kazakhstan**: Rounded forms with more beadwork
- **Central regions**: Balanced proportions combining elements from east and west
- **Southern regions**: Influenced by Uzbek and Kyrgyz traditions with distinctive tufts and tassels

**Materials and Construction** — The base is typically velvet or felt, mounted on a wooden or leather frame. Skilled artisans embroidered patterns using gold and silver thread, then adorned the surface with imported coral, pearls, and turquoise — materials brought by caravan traders along the Silk Road.`
  },
  {
    id: 'chapan-shapan',
    order: 2,
    title: 'Chapan and Shapan — Noble Robes',
    description: 'Flowing outerwear that provides warmth and displays social rank through fabric and ornamentation.',
    imagePublicId: 'content/pages/heritage/traditionalClothing/shapan',
    contentMarkdown: `The **Chapan** and **Shapan** are flowing robes worn by both men and women as outerwear. These garments embody the Kazakh principle that clothing should be both functional for nomadic life and beautiful as an expression of cultural identity.

**Construction and Materials** — Made from velvet, heavy cotton, or silk for summer, and lined with sheepskin or fur for winter warmth. The Shapan is typically longer and more formal than the Chapan, worn during ceremonies and important gatherings.

**Social Significance** — The quality of fabric and elaborateness of embroidery directly indicated social rank:
- **Common people**: Simple cotton with minimal decoration
- **Wealthy families**: Velvet with silver thread embroidery
- **Nobility and leaders**: Silk with gold thread, precious stones, and complex geometric patterns

**Embroidery Patterns** — The cuffs, collar, and front opening feature elaborate embroidery with symbolic motifs: ram's horns for strength, sunbursts for prosperity, and stylized tulips for beauty. Each pattern carried protective meanings and family identifiers.`
  },
  {
    id: 'kamzol-kulde',
    order: 3,
    title: "Kamzol and Kūlde — Women's Ensemble",
    description: "Sleeveless vests and quilted coats that complete the traditional women's wardrobe.",
    imagePublicId: 'content/pages/heritage/traditionalClothing/kamzol',
    contentMarkdown: `Women's traditional dress consists of multiple layers, with the **Kamzol** (sleeveless vest) and **Kūlde** (quilted coat) as essential components worn over the base dress (**Kóylek**).

**The Kamzol** — This sleeveless embroidered vest adds color, warmth, and ornamentation. Made from velvet or brocade, it features intricate embroidery on the front panels and back. The Kamzol's cut flatters the figure while allowing freedom of movement for daily tasks and dancing.

**The Kūlde** — A warm quilted coat essential for surviving harsh winters. The quilting technique creates pockets of air that trap body heat. The exterior displays family patterns passed through generations, making each Kūlde a wearable family history.

**Everyday vs. Ceremonial** — Simple cotton versions served for daily work, while silk and velvet versions with gold embroidery were reserved for celebrations, weddings, and visits to honored guests. The number and quality of a woman's Kamzols and Kūldes indicated her family's prosperity.`
  },
  {
    id: 'jewelry-ornaments',
    order: 4,
    title: 'Jewelry and Ornaments — Silver and Symbolism',
    description: 'Protective and decorative pieces that complete the ensemble with cultural meaning.',
    imagePublicId: 'content/pages/heritage/traditionalClothing/kimeshek',
    contentMarkdown: `Kazakh silver jewelry holds both protective and decorative significance. Each piece carries symbolic meaning, with motifs passed down through generations of silversmiths.

**Key Pieces**:
- **Bilezik** (bracelets) — Worn in multiples on both wrists, featuring protective symbols
- **Syrga** (earrings) — Large, dangling designs that frame the face and display family wealth
- **Sholpy** (rings) — Often featuring ram's horns or sun motifs for strength and prosperity
- **Tumar** (amulet holder) — A small silver container worn on the chest, holding prayers or blessed materials for protection
- **Belts and buckles** — Silver belts with elaborate buckles displaying family emblems

**Symbolic Motifs**:
- **Ram's horns** — Strength, prosperity, and masculine energy
- **Sun** — Light, life, and divine blessing
- **Pomegranate** — Fertility and family abundance
- **Tulips** — Beauty and the arrival of spring
- **Scorpions** — Protection against evil eye

**Craftsmanship** — Kazakh silversmiths (**Kumisşi**) worked with high-grade silver, creating pieces that were both beautiful and believed to have healing properties. The art was traditionally passed from master to apprentice, with each region developing distinctive styles.`
  },
  {
    id: 'mens-clothing',
    order: 5,
    title: "Men's Traditional Dress",
    description: 'Functional and dignified garments for nomadic life and ceremonial occasions.',
    imagePublicId: 'content/pages/heritage/traditionalClothing/kalpak',
    contentMarkdown: `Men's traditional Kazakh clothing balanced the demands of nomadic life — horseback riding, hunting, and herding — with the dignity expected of warriors and hosts.

**The Shapan for Men** — Longer and looser than women's versions, men's Shapans allowed freedom of movement on horseback. Dark colors (blue, black, brown) were preferred, with embroidery concentrated on the chest and cuffs. Winter versions were heavily padded and fur-lined.

**Trousers and Boots** — Wide trousers (**Shalbar**) tucked into high leather boots (**Etik**) designed for riding. The boots featured curved toes that hooked into stirrups, with intricate embroidery on the shaft visible when seated.

**Headwear** — Men wore various hats indicating status and season:
- **Takiya** — A soft, embroidered skullcap for daily wear
- **Börik** — A fur-lined cap for winter
- **Kalpak** — The distinctive white felt hat, still worn today as a symbol of Kazakh identity

**The Kamcha** — The horsewhip served as both tool and status symbol. Elaborate silver and leather whips indicated the owner's rank and were proudly displayed at gatherings.`
  }
];

async function seed() {
  console.log('[seed] Starting Traditional Clothing seed...');
  
  // Create page document
  const pageRef = db.collection('pages').doc('cultureTraditionalClothing');
  await pageRef.set(pageData);
  console.log('[seed] Created page: cultureTraditionalClothing');
  
  // Create sections subcollection
  for (const section of sections) {
    const { id, ...data } = section;
    await pageRef.collection('sections').doc(id).set({
      ...data,
      updatedAt: now,
      createdAt: now
    });
    console.log(`[seed] Created section: ${id}`);
  }
  
  console.log('[seed] Done!');
  process.exit(0);
}

seed().catch(err => {
  console.error('[seed] Error:', err);
  process.exit(1);
});
