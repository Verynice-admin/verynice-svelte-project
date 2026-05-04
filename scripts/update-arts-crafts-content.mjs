import dotenv from 'dotenv';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();
const cwd = process.cwd();

function readJson(filePath) { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }

function loadServiceAccount() {
  const candidates = [
    path.resolve(cwd, '.secrets/serviceAccountKey.json'),
    path.resolve(cwd, '.secrets/service-account.json'),
    process.env.GOOGLE_APPLICATION_CREDENTIALS ? path.resolve(cwd, process.env.GOOGLE_APPLICATION_CREDENTIALS) : null,
    path.resolve(cwd, 'serviceAccountKey.json'),
    path.resolve(cwd, 'service-account.json')
  ].filter(Boolean);
  for (const candidate of candidates) {
    try { 
      if (fs.existsSync(candidate)) { 
        const data = readJson(candidate); 
        if (typeof data.private_key === 'string' && data.private_key.includes('\\n')) data.private_key = data.private_key.replace(/\\n/g, '\n'); 
        return data; 
      } 
    } catch (e) { 
      // continue
    }
  }
  const jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (jsonStr) {
    let data;
    try { data = JSON.parse(jsonStr); } catch (e) { }
    if (data && typeof data.private_key === 'string' && data.private_key.includes('\\n')) data.private_key = data.private_key.replace(/\\n/g, '\n');
    return data || null;
  }
  return null;
}

const serviceAccount = loadServiceAccount();
if (!serviceAccount) { console.error('No service account'); process.exit(1); }
if (!getApps().length) initializeApp({ credential: cert(serviceAccount), projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id });

const db = getFirestore();
const now = FieldValue.serverTimestamp();

const contentUpdates = {
  'felt-making': {
    contentMarkdown: `Step into a Kazakh yurt on a winter morning, and you'll immediately understand why felt was called "the second skin" of the nomad. Warm, soft, and impossibly durable, felt (kiym) has protected Kazakh families for over two thousand years.

Picture the women of the family gathering in early spring, when the sheep have been sheared. The wool, still carrying the warmth of the animals, gets sorted, washed, and laid out in thin layers on a reed mat. Then comes the magic—hot water poured over the layers, the women's hands working the wool together, rolling it up and walking on it, singing songs that have been passed down through generations.

This isn't just craft; it's ritual. Every step builds bonds between the wool fibers, transforming chaos into unity. The result? A fabric so dense it repels rain, so warm it survives -40°C winters, so versatile it becomes bedding, wall insulation, floor covering, and cradle lining all in one.

What makes Kazakh felt truly extraordinary is the decoration. Enter syrmak—felt transformed into art. Women cut intricate patterns from colored felt and appliquéd them onto blankets, creating geometric universes of ram's horns, sunbursts, and stylized flowers. Western Kazakhs favored bold reds and blacks, while eastern artisans wove dreams in blues and greens. Each region's patterns tell stories of identity, belonging, protection.

Today, these shyrdak carpets hang in museums worldwide, recognized by UNESCO as Intangible Cultural Heritage. But in Kazakhstan, they still grace wedding celebrations, newborn cradles, and family gatherings—continuing a tradition where every stitch connects past to present.`
  },
  'embroidery': {
    contentMarkdown: `In Kazakhstan, a woman's love was measured in stitches. Every embroidered piece—whether a wedding dress, a cradle cover, or a horse blanket—carried the soul of its maker. This is kezde, the art that transformed fabric into storytelling.

Imagine receiving a shapan (traditional coat) from your grandmother. The collar, cuffs, and front panels explode with symbols—ram's horns for strength, pomegranates for fertility, tulips for spring love. These aren't random decorations; they're prayers, blessings, coded messages passed through generations.

The techniques are demanding. Chain stitch flows like river currents for organic patterns. Satin stitch creates smooth, luxurious surfaces for special occasions. Cross-stitch builds geometric precision for protective borders. And goldwork—ah, goldwork is for weddings, funerals, and ceremonies when only the finest will do.

But kezde is disappearing. In the 20th century, machine-made textiles replaced handwork, and young girls stopped learning. Today, master embroiderers are precious rarities, their hands moving with skills that took lifetimes to develop. Yet revival movements are growing. Young Kazakh women are rediscovering their grandmothers' patterns, understanding for the first time why certain symbols matter.

When you visit Kazakhstan, look for kezde in the Almaty museums, in the National Museum in Astana, or—better yet—in the homes of families who still preserve these traditions. Each piece is a conversation across centuries.`
  },
  'leather-woodwork': {
    contentMarkdown: `On the treeless Kazakh steppe, wood was more precious than gold. It came from distant mountains, traded across generations, and when it finally reached the craftsman's hands, it became something extraordinary.

The asi—the turned wooden bowl—typifies this transformation. Carved from apricot or mulberry wood, these vessels held kumis (fermented mare's milk) at celebrations. But look closer: the interior curves are mathematically perfect, designed to keep the sacred drink moving, never stagnant. Every curve served a purpose, every measurement followed tradition.

Leatherwork (uykha) was equally essential. A Kazakh man's status was measured by his saddle—wooden frame wrapped in leather, decorated with silver studs, often featuring intricate embossed patterns. Bridles, whips, boots, storage bags—all carried the marks of skilled artisans whose names may be forgotten but whose craft lives on.

What strikes modern visitors is how these weren't merely functional objects. A shepherd's leather bag carried provisions for survival. A mother's wooden cradle sheltered the future of the tribe. A warrior's saddle proclaimed his courage. Every piece served practical purposes while embodying deeper meanings—protection, prosperity, identity.

Today, you can find these crafts in Almaty's bazaars, in village workshops, and in museum collections. The techniques remain largely unchanged, passed from master to apprentice in the same way they were practiced centuries ago.`
  },
  'metalwork-jewelry': {
    contentMarkdown: `A Kazakh bride wore her wealth—and her protection—on her body. Thirty kilograms of silver could adorn a single wedding ensemble: massive earrings that framed her face, bracelets stacked on both arms, chest ornaments (tumar) containing prayers, belt buckles announcing family status. This wasn't vanity; it was survival.

Silver was the metal of choice because it was believed to repel evil spirits and the evil eye. Turquoise and blue glass—imported from distant lands—were set into silver because blue protected against misfortune. A Kazakh woman wore her jewelry as armor, her adornments as amulets.

The craftsmanship is breathtaking. Kumissi, the master silversmiths, used techniques perfected over centuries: granulation (tiny metal spheres fused to surfaces), filigree (delicate wire patterns), engraving, casting. Each technique required years of apprenticeship, secrets passed from father to son, mother to daughter.

But Kazakh metalwork served daily life too. Samovars for tea, cups (piyala) for hospitality, trays for serving guests—every object was an opportunity for beauty. Even a simple spoon handle might feature intricate engravings telling stories of ancestors.

Visit Astana's museums today, and you'll see pieces that took artisans years to complete. Contemporary designers are reviving these traditions, creating new works that honor ancient techniques while speaking to modern aesthetics. The combination is stunning—centuries of skill meeting contemporary vision.`
  },
  'eagle-hunting': {
    contentMarkdown: `In the Altai Mountains at dawn, a man and an eagle partner for the hunt. This is burkitshi, an ancient tradition dating back 6,000 years—the art of hunting with golden eagles that's become Kazakhstan's cultural icon.

The bond between berkutchi (eagle hunter) and his bird is extraordinary. The hunter selects a young eagle—usually female, as they're larger and more aggressive—raises it from the nest, and trains it for 3-4 years. The eagle lives with the family, becomes part of the household, develops fierce loyalty.

Training is brutal patience. First, the eagle must trust humans (manning). Then comes lure training—dragging prey across the snow, rewarding the eagle for each successful strike. Finally, live hunting with actual prey animals. The hunter must arrive quickly after the kill to reward his bird before it eats everything.

The hunt itself is theater. Mounted on sturdy horses, hunters release their eagles on the open steppe. From above, the eagle spots prey a kilometer away. The stoop—swooping down at 150 kilometers per hour—is breathtaking. Talons exert 500 pounds per square inch, killing instantly.

But this is more than sport. Eagle hunting embodies Kazakh values: patience, partnership with nature, respect for animals, courage. The tradition nearly died in the 20th century, but today it's experiencing renaissance. Annual festivals in Almaty and the Altai celebrate this heritage, and young hunters are learning from the masters. The eagle flies still.`
  }
};

async function updateContent() {
  console.log('Updating arts-crafts content to storytelling style...\n');
  const sectionsRef = db.collection('pages/heritage/articles/arts-crafts/sections');
  const snap = await sectionsRef.get();
  
  for (const doc of snap.docs) {
    const id = doc.id;
    const update = contentUpdates[id];
    if (update) {
      await doc.ref.update({ ...update, updatedAt: now });
      console.log('Updated: ' + id);
    } else {
      console.log('Skipped: ' + id);
    }
  }
  console.log('\nDone!');
}

updateContent().catch(console.error);
