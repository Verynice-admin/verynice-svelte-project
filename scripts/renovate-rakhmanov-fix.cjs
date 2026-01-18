const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initFirebase() {
    if (admin.apps.length) return admin.firestore();
    let sa;
    if (fs.existsSync(path.resolve('.secrets/serviceAccountKey.json'))) {
        sa = JSON.parse(fs.readFileSync(path.resolve('.secrets/serviceAccountKey.json'), 'utf8'));
    }
    if (!sa) throw new Error('No service account');
    admin.initializeApp({ credential: admin.credential.cert(sa) });
    return admin.firestore();
}

const rakhmanovContent = `
# The Healing Heart of the Altai

Hidden deep within the wild, pristine forests of the Altai Mountains, Rakhmanov Springs (Rakhmanovskie Klyuchi) is a legendary sanctuary of healing and peace. Located at an altitude of 1,760 meters, the springs are fed by thermal waters that bubble up from the earth at a comfortable 34–42°C. The water is rich in radon, nitrogen, and silicic acid, a potent cocktail believed to cure ailments of the spine, skin, and nervous system.

But it is not just the water that heals. The air here is thin and incredibly pure, filled with the scent of cedar and pine. The valley is cradled by snow-capped peaks, creating a microclimate that feels completely cut off from the stress of the modern world.

# The Legend of the Wounded Deer

Local folklore tells of a hunter named Rakhmanov who, back in 1763, was tracking a wounded maral (a large Siberian deer). He followed the blood train for miles until he saw the animal limp into a cloud of steam rising from the ground. To his amazement, the deer emerged from the water shortly after, its wounds miraculously closed and its strength restored, bounding away up the mountain.

Suffering from rheumatism himself, the hunter bathed in the same waters. After two weeks, his pain vanished. He spread the word of the "living water," and the springs have borne his name ever since.

# In the Shadow of Belukha

The springs lie in the shadow of the majestic Mount Belukha, the highest peak in the Altai and Siberia (4,506 m). Known as "Muztau" (Ice Mountain) to locals, it is shrouded in mysticism. Many believe it to be the entrance to the mythical kingdom of Shambhala.

The energy of the place is palpable. Pilgrims and tourists alike trek to nearby vantage points to catch a glimpse of Belukha's double-headed summit, believing that simply seeing the mountain brings spiritual cleansing. The "Arasan" resort located at the springs offers a comfortable base for exploring this sacred landscape, blending medical treatments with the raw power of nature.
`;

async function renovateRakhmanovFix() {
    const db = await initFirebase();
    console.log('🚀 Starting Rakhmanov Springs Renovation FIX...');

    const destinationsPageRef = db.collection('pages').doc('destinationsPage');
    const articlesRef = destinationsPageRef.collection('articles');

    // Explicitly check East Kazakhstan first
    const snapshot = await articlesRef.where('title', '==', 'East Kazakhstan').get();

    let regionDoc = null;
    if (!snapshot.empty) {
        regionDoc = snapshot.docs[0];
        console.log(`Found region: ${regionDoc.data().title}`);
    } else {
        console.log('East Kazakhstan region not found by exact name, checking all...');
        const allRegions = await articlesRef.get();
        // Just loop all
        for (const r of allRegions.docs) {
            const attractionsRef = r.ref.collection('attractions');
            const s = await attractionsRef.where('title', '>=', 'Rakhmanov').where('title', '<=', 'Rakhmanov\uf8ff').get();
            if (!s.empty) {
                await updateAttraction(s.docs[0], r.data().title);
                return;
            }
        }
        console.error('❌ Rakhmanov attraction truly missing in scan.');
        return;
    }

    if (regionDoc) {
        const attractionsRef = regionDoc.ref.collection('attractions');
        let snap = await attractionsRef.where('title', '>=', 'Rakhmanov').where('title', '<=', 'Rakhmanov\uf8ff').get();

        if (snap.empty) {
            console.log('Checking fuzzy in East Kaz...');
            const all = await attractionsRef.get();
            const found = all.docs.find(d => d.data().title.toLowerCase().includes('rakhmanov'));
            if (found) {
                await updateAttraction(found, regionDoc.data().title);
            } else {
                console.error('❌ Rakhmanov not found in East Kazakhstan.');
            }
        } else {
            await updateAttraction(snap.docs[0], regionDoc.data().title);
        }
    }
}

async function updateAttraction(doc, regionTitle) {
    console.log(`✅ Found Springs in [${regionTitle}]: ${doc.data().title} (${doc.id})`);

    await doc.ref.update({
        contentMarkdown: rakhmanovContent,
        lastRenovated: new Date().toISOString()
    });
    console.log('✅ Main content updated to Gold Standard.');
}

renovateRakhmanovFix().catch(console.error);
