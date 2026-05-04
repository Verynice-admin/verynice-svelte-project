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
    } catch (e) { }
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
  'keste-embroidery': {
    contentMarkdown: `Receive a shapan—a traditional Kazakh coat—from your grandmother, and you receive more than fabric. Run your fingers over the collar, cuffs, and front panels, and you'll feel centuries of meaning woven into every stitch. This is keste, the art that transformed cloth into storytelling.

The symbols speak. Ram's horns curve across the chest—strength, prosperity, masculine power passed from father to son. Pomegranates bloom near the hem—fertility, abundance, the hope that daughters will bear many children. Tulips grace the shoulders—spring, beauty, young love. Every motif carries meaning, every color tells a story.

But keste is fading. In the rush of the 20th century, machine-made textiles replaced handwork. Young girls traded needles for keyboards, and the patterns their great-great-grandmothers knew began disappearing. Today, master embroiderers are rare treasures, their hands moving with skills that took lifetimes to master.

Yet revival is coming. Young Kazakh women are returning to their roots, asking grandmothers to teach what was almost lost. They're discovering that those "just decorative" patterns are actually prayers, blessings, coded messages about who they are and where they came from.

Visit Almaty's museums, the National Museum in Astana, or better yet, the homes of families still preserving these traditions. Each piece is a conversation across centuries, a thread connecting you to the women who came before.`
  },
  'jewelry': {
    contentMarkdown: `A Kazakh bride walked toward her new life bearing thirty kilograms of silver on her body. This wasn't vanity—it was survival. Every piece protected against evil spirits, proclaimed family wealth, connected her to ancestors.

The metals told stories. Silver repelled the evil eye. Turquoise—imported from distant mountains—kept misfortune at bay. Each stone was a prayer, each ornament a shield.

The pieces mattered. Massive syrga earrings framed her face for all to see. Stacked bilezik bracelets announced prosperity. The tumar at her chest held prayers written on paper, protection for the journey ahead. Saukele—headdresses heavy with silver coins—swayed with every step, announcing her worth.

The craftsman behind each piece was a magician. Kumissi, the master silversmiths, spent years learning secrets passed through generations. Filigree created lace-like patterns from silver wire. Granulation fused tiny spheres to surfaces. Engraving told stories in metal.

Today, these treasures live in museums. But in bazaars and workshops, the tradition continues. Contemporary designers blend ancient techniques with modern aesthetics, creating pieces that honor ancestors while speaking to today. When you see Kazakh silver, you're seeing centuries of skill, belief, and beauty—worn, treasured, preserved.`
  },
  'traditional-crafts': {
    contentMarkdown: `On the wind-scoured Kazakh steppe, wood was rarer than gold. It arrived from distant mountains, traded across generations, treasured when it finally reached a craftsman's hands.

A wooden bowl wasn't merely a bowl. The asi—carved from apricot or mulberry—held kumis at celebrations. But those curves were mathematics in motion, designed to keep the sacred fermented mare's milk moving, never stagnant, always alive.

Leather told similar stories. A man's saddle proclaimed his status—wooden frame wrapped in leather, studded with silver, embossed with family patterns. His bridle, his boots, his storage bags all carried marks of artisans whose names time forgot but whose craft endures.

But the besik—the cradle—represents the pinnacle. Carved from willow or birch, hung with leather straps and wooden beads, decorated with patterns meant to protect the infant within, this wasn't just baby furniture. It was the first home of the next generation, built by hands that shaped identity from the moment life began.

Today, find these crafts in Almaty's bazaars, village workshops, museum collections. The techniques haven't changed—they're passed the same way they were centuries ago, master to apprentice, hand to hand, generation to generation.`
  }
};

async function updateContent() {
  console.log('Updating remaining arts-crafts content...\n');
  const sectionsRef = db.collection('pages/heritage/articles/arts-crafts/sections');
  const snap = await sectionsRef.get();
  
  for (const doc of snap.docs) {
    const id = doc.id;
    const update = contentUpdates[id];
    if (update) {
      await doc.ref.update({ ...update, updatedAt: now });
      console.log('Updated: ' + id);
    }
  }
  console.log('\nDone!');
}

updateContent().catch(console.error);
