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
  console.error('[add] No service account found.');
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

const clothingSections = [
  {
    id: 'shapan',
    order: 1,
    title: 'Shapan (Chapan)',
    description: 'The noble robe that embodies Kazakh elegance and social status.',
    imagePublicId: 'content/pages/heritage/traditionalClothing/shapan',
    contentMarkdown: `The **Shapan** (also spelled Chapan) is a flowing, coat-like garment that serves as the outermost layer of traditional Kazakh attire. Worn by both men and women, it represents the perfect fusion of functionality and aesthetic beauty that defines Kazakh clothing philosophy.

**Design and Construction** — The Shapan features a loose, comfortable cut that allows freedom of movement essential for the nomadic lifestyle. It typically opens at the front and extends to the knees or below. The garment is constructed with velvet, brocade, or heavy silk for summer wear, while winter versions are lined with sheepskin, fur, or quilted cotton for warmth against the harsh steppe winters.

**Social Significance** — The quality of fabric and richness of decoration immediately indicated the wearer's social standing:
- **Common people**: Simple cotton with minimal embroidery
- **Middle class**: Velvet with silver thread patterns
- **Wealthy and noble**: Silk with gold thread, precious stones, and complex geometric designs

**Embroidery Patterns** — The collar, cuffs, and front opening are adorned with elaborate embroidery featuring protective and symbolic motifs: ram's horns for strength, sunbursts for prosperity, tulips for beauty, and geometric patterns representing the eternal cycle of life. Each family developed distinctive patterns that became their visual signature.`
  },
  {
    id: 'koilek',
    order: 2,
    title: 'Köylek',
    description: 'The foundational dress that forms the base layer of women\'s traditional attire.',
    imagePublicId: 'content/pages/heritage/traditionalClothing/koilek',
    contentMarkdown: `The **Köylek** is the traditional dress that serves as the foundational garment in Kazakh women's clothing. This long, loose-fitting dress is worn as the base layer, with other garments like the Kamzol and Shapan layered over it.

**Construction** — Traditionally sewn from white or light-colored cotton or silk, the Köylek features a straight, flowing cut that reaches the ankles. The dress has long sleeves and a high neckline. The cut is deliberately loose to allow air circulation during hot summers while providing comfort during daily activities.

**Decorative Elements** — While the base Köylek is often plain, ceremonial versions feature exquisite embroidery at the collar, cuffs, and hem. The embroidery uses silk threads in vibrant colors, with patterns passed down through generations of craftswomen.

**Cultural Significance** — The Köylek represents purity and modesty. For young women, wearing a pristine white Köylek was a mark of honor. The garment also serves as a canvas for displaying family craftsmanship, with each region developing distinctive decorative styles. The **Kunikey Köylek** is a festive version worn during celebrations and weddings, featuring richer fabrics and more elaborate decoration.`
  },
  {
    id: 'kamzol',
    order: 3,
    title: 'Kamzol',
    description: 'The sleeveless vest that adds color, warmth, and ornamentation.',
    imagePublicId: 'content/pages/heritage/traditionalClothing/kamzol',
    contentMarkdown: `The **Kamzol** is a sleeveless vest worn by women over the Köylek. This garment adds layers of color, warmth, and decorative beauty to the traditional ensemble, while allowing freedom of movement for daily tasks.

**Design Features** — The Kamzol is typically hip-length or waist-length, with a fitted cut that flatters the figure. It is sleeveless by design, allowing the embroidered sleeves of the Köylek underneath to remain visible. The front panels and back are heavily embroidered, making the Kamzol one of the most decorative elements of Kazakh women's clothing.

**Materials and Decoration** — Made from velvet, brocade, or silk, the Kamzol showcases the finest embroidery work. The front panels feature dense patterns using gold and silver threads, while the back often displays a large central motif. Common designs include floral patterns, geometric shapes, and protective symbols.

**Everyday vs. Ceremonial** — Women owned multiple Kamzols for different occasions. Simple cotton versions with minimal decoration served for daily work, while elaborate silk versions with gold embroidery were reserved for celebrations, weddings, and visits to honored guests. The number and quality of a woman's Kamzols were indicators of her family's prosperity.`
  },
  {
    id: 'shalbar',
    order: 4,
    title: 'Shalbar',
    description: 'Wide trousers designed for horseback riding and nomadic life.',
    imagePublicId: 'content/pages/heritage/traditionalClothing/shalbar',
    contentMarkdown: `The **Shalbar** are wide, loose-fitting trousers that form an essential part of both men's and women's traditional Kazakh attire. Designed specifically for the nomadic lifestyle, these trousers provide comfort and functionality for horseback riding and daily activities.

**Design for Riding** — The Shalbar features an exceptionally wide cut through the hips and legs, tapering to fit into high boots. This design allows riders to spread their legs comfortably across the saddle while preventing chafing during long hours on horseback. The trousers are gathered at the waist with a drawstring or fabric belt.

**Materials** — Summer Shalbar are made from lightweight cotton or silk in white or light colors, while winter versions use heavier wool or are lined with soft materials for warmth. The fabric must be durable enough to withstand the rigors of nomadic life.

**Gender Differences** — Men's Shalbar are typically wider and plainer, designed purely for function. Women's versions may feature decorative embroidery at the cuffs or along the outer seams, visible when the hem is lifted slightly while walking or dancing.`
  },
  {
    id: 'kupe',
    order: 5,
    title: 'Kupe',
    description: 'A fitted jacket providing structure and warmth with decorative embroidery.',
    imagePublicId: 'content/pages/heritage/traditionalClothing/kupe',
    contentMarkdown: `The **Kupe** is a traditional jacket that provides additional warmth and structure to the Kazakh ensemble. More fitted than the Shapan, the Kupe offers a tailored silhouette while maintaining the decorative traditions of Kazakh clothing.

**Construction** — The Kupe features a more structured cut than the loose Shapan, with defined shoulders and a closer fit to the body. It typically extends to the hips and may have long sleeves or be sleeveless depending on the specific regional style. The jacket opens at the front and is secured with ties, buttons, or decorative clasps.

**Decoration** — As with other Kazakh garments, the Kupe serves as a canvas for embroidery. The seams, edges, and front opening are adorned with patterns using silk or metallic threads. The back may feature a large central motif, while the cuffs display intricate designs.

**Function and Fashion** — The Kupe bridges the gap between the purely functional base layers and the ceremonial outer garments. It provides additional warmth during transitional weather while maintaining an elegant appearance suitable for social gatherings.`
  },
  {
    id: 'saukele',
    order: 6,
    title: 'Saukele',
    description: 'The majestic bridal headdress, crown of Kazakh wedding attire.',
    imagePublicId: 'content/pages/heritage/traditionalClothing/saukele',
    contentMarkdown: `The **Saukele** stands as the crown jewel of Kazakh costume — a tall, ornate bridal headdress that transforms a young woman into a married lady. This magnificent piece represents the pinnacle of Kazakh decorative arts and carries deep cultural significance.

**Symbolism and Meaning** — The Saukele symbolizes the transition from maidenhood to married life. Its impressive height and rich ornamentation displayed family wealth and social status. The veil attached to the headdress covered the bride's face and was lifted only during the wedding ceremony, marking her new identity as a married woman.

**Construction** — The base is typically velvet or felt, mounted on a wooden or leather frame that maintains the distinctive tall shape. Skilled artisans embroidered patterns using gold and silver thread, then adorned the surface with coral, pearls, silver coins, and semi-precious stones like turquoise — materials brought by caravan traders along the Silk Road.

**Regional Variations** — Each region developed distinct styles:
- **Western Kazakhstan**: Conical heights with elaborate silverwork
- **Eastern Kazakhstan**: Rounded forms with intricate beadwork
- **Central regions**: Balanced proportions combining elements
- **Southern regions**: Influenced by neighboring traditions with distinctive tassels`
  },
  {
    id: 'kimeshek',
    order: 7,
    title: 'Kimeshek',
    description: 'The modest headdress of married women, symbolizing dignity and respect.',
    imagePublicId: 'content/pages/heritage/traditionalClothing/kimeshek',
    contentMarkdown: `The **Kimeshek** is the traditional headdress worn by married Kazakh women. Unlike the Saukele, which is reserved for brides, the Kimeshek is part of everyday married life, symbolizing a woman's new status and demonstrating modesty and dignity.

**Design and Purpose** — The Kimeshek covers the hair and sometimes part of the face, in accordance with traditional modesty customs. It consists of a cap-like base with fabric panels that drape down the back and sides. The headdress is designed to be practical for daily work while maintaining the wearer's dignity.

**Decoration** — While more modest than the Saukele, the Kimeshek still features beautiful embroidery and decorative elements. The visible portions are adorned with patterns that indicate the wearer's age, region, and family background. Silver ornaments, coins, and beads add subtle decoration that catches the light.

**Life Stages** — Different styles of Kimeshek indicated different stages of a woman's life. Young married women wore more decorative versions, while older women chose simpler, more practical designs. The transition from the bridal Saukele to the married woman's Kimeshek was an important rite of passage.`
  },
  {
    id: 'kalpak',
    order: 8,
    title: 'Kalpak',
    description: 'The distinctive white felt hat, enduring symbol of Kazakh identity.',
    imagePublicId: 'content/pages/heritage/traditionalClothing/kalpak',
    contentMarkdown: `The **Kalpak** is the iconic white felt hat that has become the most recognizable symbol of Kazakh identity. Still worn today by men of all ages, this distinctive headgear represents the deep connection between the Kazakh people and their nomadic heritage.

**Construction** — The Kalpak is made from white felt, a material perfectly suited to the nomadic lifestyle. Felt provides excellent insulation — keeping the head warm in winter and cool in summer — while being durable and water-resistant. The hat has a distinctive shape: a high, tapered crown with a soft brim that curves slightly upward.

**Symbolism** — The white color symbolizes purity, peace, and the bright sky over the steppe. The height of the crown represents dignity and pride. Wearing the Kalpak is a statement of ethnic identity and cultural pride, transcending social class and region.

**Traditional Significance** — In Kazakh culture, a man's Kalpak was treated with great respect. It was considered improper to throw or drop a Kalpak, and the hat was never worn indoors in the presence of elders. When greeting honored guests, removing and placing the Kalpak over the heart was a sign of deep respect.`
  },
  {
    id: 'takiya',
    order: 9,
    title: 'Takiya (Taqiya)',
    description: 'The soft embroidered skullcap for daily wear.',
    imagePublicId: 'content/pages/heritage/traditionalClothing/takiya',
    contentMarkdown: `The **Takiya** (also spelled Taqiya) is a soft, close-fitting cap worn by men for daily activities. More practical than the formal Kalpak, the Takiya provides comfort and protection while allowing the wearer to work, pray, and move freely.

**Design** — The Takiya is a skullcap that fits snugly on the head, made from soft materials like quilted cotton or fine felt. Unlike the tall Kalpak, the Takiya sits close to the scalp and does not have a brim. This makes it practical for wearing under other headgear or during physical labor.

**Decoration** — Despite its practical nature, the Takiya is often beautifully decorated with embroidery. The top and sides feature geometric patterns, floral motifs, or protective symbols worked in silk or metallic threads. The quality of decoration varied with the wearer's means and the occasion.

**Usage** — The Takiya serves as everyday headwear, suitable for work around the yurt, herding animals, or casual social gatherings. It is also worn as a base layer under the Kalpak or other hats in cold weather, providing an extra layer of warmth.`
  },
  {
    id: 'borik',
    order: 10,
    title: 'Borik',
    description: 'The warm fur-lined cap for harsh winter conditions.',
    imagePublicId: 'content/pages/heritage/traditionalClothing/borik',
    contentMarkdown: `The **Borik** is a warm, fur-lined cap designed to protect against the harsh winter conditions of the Kazakh steppe. This practical headgear combines functionality with the decorative traditions of Kazakh craftsmanship.

**Construction** — The Borik features a rounded crown made from felt or heavy cloth, lined with fur from sheep, fox, or other animals. The fur lining provides exceptional warmth, while the outer layer protects against wind and snow. Some designs include ear flaps that can be lowered for additional protection in extreme cold.

**Decoration** — While primarily functional, the Borik still displays Kazakh decorative arts. The outer surface may be embroidered with patterns, and the fur trim around the edge adds both warmth and visual appeal. Higher-quality Boriks featured finer furs and more elaborate decoration.

**Seasonal Use** — The Borik is reserved for winter wear, when temperatures on the steppe can drop dramatically. It is particularly valued by herders and others who spend long hours outdoors in cold weather, providing essential protection while maintaining cultural identity.`
  },
  {
    id: 'tymak',
    order: 11,
    title: 'Tymak',
    description: 'The fur hat with ear flaps for extreme cold.',
    imagePublicId: 'content/pages/heritage/traditionalClothing/tymak',
    contentMarkdown: `The **Tymak** is a heavy fur hat designed for the most extreme winter conditions on the Kazakh steppe. With its distinctive ear flaps and thick fur construction, the Tymak provides maximum protection against freezing temperatures and biting winds.

**Design Features** — The Tymak features a rounded crown covered in fur, with large ear flaps that can be tied up when not needed or lowered to protect the ears and neck from cold. The flaps are also fur-lined, providing multiple layers of insulation. Some designs include a visor to shield the eyes from snow glare.

**Materials** — High-quality Tymaks use the finest furs — sheep, fox, wolf, or even sable — with the fur worn on the outside for maximum warmth. The interior is lined with soft materials for comfort during extended wear. The quality of fur indicated the wearer's social status.

**Regional Variations** — Different regions developed distinct Tymak styles based on local climate conditions and available materials. Northern regions, with harsher winters, produced heavier Tymaks with more extensive fur coverage, while southern variations were somewhat lighter.`
  },
  {
    id: 'beldemshe',
    order: 12,
    title: 'Beldemshe',
    description: 'The traditional embroidered apron worn by women.',
    imagePublicId: 'content/pages/heritage/traditionalClothing/beldemshe',
    contentMarkdown: `The **Beldemshe** is a traditional embroidered apron worn by Kazakh women over their dresses. This decorative garment serves both practical and aesthetic purposes, protecting the clothing underneath while displaying beautiful needlework.
n
**Design and Function** — The Beldemshe is worn at the waist, covering the front of the dress from the waist to below the knees. It protects the dress from stains and wear during daily work, particularly cooking and household tasks. The apron ties at the back with fabric straps.

**Embroidery** — The Beldemshe is renowned for its exquisite embroidery. The front panel displays dense patterns worked in silk threads, featuring floral motifs, geometric designs, and protective symbols. The lower edge often has a decorative fringe or additional embroidery.

**Cultural Significance** — A woman's skill in embroidery was often judged by her Beldemshe. Young women would spend months creating elaborately decorated aprons as part of their dowry. The quality of the needlework demonstrated the woman's patience, skill, and suitability for marriage.`
  },
  {
    id: 'zhelek',
    order: 13,
    title: 'Zhelek (Jelek)',
    description: 'A traditional vest variant with regional variations.',
    imagePublicId: 'content/pages/heritage/traditionalClothing/zhelek',
    contentMarkdown: `The **Zhelek** (also spelled Jelek) is a type of vest similar to the Kamzol but with distinct regional variations in cut and decoration. Worn by both men and women depending on the region, the Zhelek adds an additional layer of warmth and beauty to traditional attire.

**Regional Styles** — Different regions developed unique Zhelek styles:
- **Western Kazakhstan**: Longer, coat-like versions with heavy embroidery
- **Eastern regions**: Shorter, more fitted cuts with beadwork decoration
- **Southern areas**: Influenced by neighboring cultures with distinct collar styles

**Construction** — The Zhelek is typically made from velvet or heavy silk, quilted for warmth. Unlike the Kamzol, some Zhelek designs feature sleeves or partial sleeves. The front opening may be secured with ties, buttons, or decorative clasps.

**Decoration** — The Zhelek showcases regional embroidery styles, with patterns varying significantly between areas. Common motifs include animal figures, geometric patterns, and stylized floral designs. The collar and hem receive particular attention in the decoration.`
  },
  {
    id: 'kasaba',
    order: 14,
    title: 'Kasaba',
    description: 'The traditional men\'s robe for ceremonial occasions.',
    imagePublicId: 'content/pages/heritage/traditionalClothing/kasaba',
    contentMarkdown: `The **Kasaba** is a traditional men's robe worn for ceremonial occasions and important social gatherings. Longer and more formal than everyday garments, the Kasaba represents masculine dignity and social standing.

**Design** — The Kasaba features a long, loose cut that extends to the ankles. It has long sleeves and opens at the front, typically worn over trousers and a shirt. The robe is designed to convey an impression of dignity and authority.

**Materials and Colors** — Made from high-quality fabrics like velvet, wool, or heavy silk, the Kasaba is typically in dark colors — deep blue, black, brown, or dark green. These somber tones convey seriousness and respect appropriate for ceremonial wear.

**Decoration** — While more restrained than women's clothing, the Kasaba features decorative embroidery on the chest, collar, and cuffs. Silver thread patterns are common, with designs representing strength, prosperity, and masculine energy. The quality of the embroidery indicates the wearer's status.`
  },
  {
    id: 'ichigi',
    order: 15,
    title: 'Ichigi',
    description: 'Traditional embroidered boots for riding and daily wear.',
    imagePublicId: 'content/pages/heritage/traditionalClothing/ichigi',
    contentMarkdown: `The **Ichigi** are traditional Kazakh boots that combine functionality for horseback riding with exquisite decorative craftsmanship. These high boots are essential footwear for the nomadic lifestyle.

**Design for Riding** — The Ichigi features a high shaft that extends up the calf, protecting the leg while riding. The toe is slightly upturned, allowing it to hook easily into stirrups. The sole is made from durable leather, sometimes reinforced for extended wear.

**Embroidery** — The most distinctive feature of Ichigi is the elaborate embroidery on the shaft. Using silk and metallic threads, artisans create intricate patterns that are visible when the wearer is seated on horseback. These designs feature geometric patterns, protective symbols, and stylized natural forms.

**Construction** — The boots are made from soft leather that molds to the wearer's feet over time. The interior is lined for comfort, and the construction allows flexibility for walking while maintaining structure for riding. Quality Ichigi are waterproofed to handle various weather conditions.`
  },
  {
    id: 'ton',
    order: 16,
    title: 'Ton',
    description: 'The sheepskin coat for extreme cold protection.',
    imagePublicId: 'content/pages/heritage/traditionalClothing/ton',
    contentMarkdown: `The **Ton** is a heavy sheepskin coat designed for survival in the extreme cold of the Kazakh winter. This essential garment demonstrates the practical wisdom of nomadic people in adapting to their environment.

**Construction** — The Ton is made from the pelts of sheep, with the wool worn on the inside for maximum insulation. The exterior is typically the leather side of the sheepskin, sometimes decorated with embroidery or appliqué. The coat is heavy and substantial, providing protection against even the most severe winter conditions.

**Design Features** — The Ton features a loose cut that allows for layering of clothing underneath. It typically has long sleeves and extends to the knees or below. The coat fastens at the front with ties or buttons, and some designs include a high collar to protect the neck.

**Regional Variations** — Northern regions, with harsher winters, produce heavier Tons with thicker wool, while southern regions have lighter versions. Some areas decorate the exterior with leather appliqué work, creating distinctive patterns that identify the wearer's region.`
  },
  {
    id: 'qapta',
    order: 17,
    title: 'Qapta (Qaptal)',
    description: 'A traditional coat displaying family craftsmanship.',
    imagePublicId: 'content/pages/heritage/traditionalClothing/qapta',
    contentMarkdown: `The **Qapta** (also spelled Qaptal) is a traditional coat that serves as both practical outerwear and a display of family craftsmanship. Worn by both men and women, this garment features distinctive regional embroidery patterns.

**Design** — The Qapta is a mid-length coat with long sleeves, designed to be worn over other clothing. It has a fitted cut that provides warmth while allowing freedom of movement. The coat opens at the front and is secured with ties, buttons, or decorative clasps.

**Embroidery** — The Qapta is renowned for the embroidery that covers the chest, back, and sleeves. Each family developed distinctive patterns passed down through generations, making the Qapta a wearable display of family heritage. The embroidery uses silk and metallic threads in elaborate designs.

**Materials** — Made from sturdy fabrics like wool, heavy cotton, or velvet, the Qapta is designed to withstand daily wear. The interior may be lined for additional warmth. Ceremonial versions use finer materials like silk with gold thread embroidery.`
  },
  {
    id: 'kunikey',
    order: 18,
    title: 'Kunikey',
    description: 'Festive dress for celebrations and special occasions.',
    imagePublicId: 'content/pages/heritage/traditionalClothing/kunikey-koilek',
    contentMarkdown: `The **Kunikey** (often referred to as Kunikey Köylek) is a festive dress worn by women for celebrations, weddings, and other special occasions. This elaborate garment represents the height of Kazakh decorative arts in clothing.

**Design and Decoration** — The Kunikey is based on the traditional Köylek dress but elevated with the finest materials and most elaborate decoration. Made from silk, velvet, or brocade in rich colors, the dress features extensive embroidery covering the collar, cuffs, hem, and bodice.

**Embroidery** — The embroidery on a Kunikey represents months of skilled handwork. Using gold and silver threads, pearls, beads, and precious stones, artisans create intricate patterns featuring floral motifs, geometric designs, and symbolic elements. Each region has distinctive styles, with some areas known for particular techniques.

**Occasions** — The Kunikey is reserved for life's most important moments — weddings, the birth of children, major celebrations, and visits to honored guests. A woman's Kunikey was often her most valuable possession, carefully preserved and passed down to daughters. The quality and beauty of the Kunikey reflected the family's status and the woman's skill as a needleworker.`
  }
];

async function addSections() {
  console.log('[add] Adding clothing sections to Firebase...\n');
  
  const articleRef = db.collection('pages').doc('heritage').collection('articles').doc('traditional-clothing');
  
  // Delete old sections first
  const oldSections = await articleRef.collection('sections').listDocuments();
  for (const doc of oldSections) {
    await doc.delete();
  }
  console.log(`[add] Deleted ${oldSections.length} old sections`);
  
  // Add new sections
  for (const section of clothingSections) {
    const { id, ...data } = section;
    await articleRef.collection('sections').doc(id).set({
      ...data,
      updatedAt: now,
      createdAt: now
    });
    console.log(`[add] Created section: ${id} - ${section.title}`);
  }
  
  console.log('\n[add] Done! Created 18 clothing sections');
}

addSections().catch(err => {
  console.error('[add] Error:', err);
  process.exit(1);
});
