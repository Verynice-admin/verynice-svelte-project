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

const alzhirContent = `
# A Solemn Tribute to Innocent Strength

The ALZHIR Memorial Complex, located in the village of Akmol just outside Astana, stands as a haunting and necessary reminder of one of the darkest chapters in Soviet history. The name ALZHIR is a grim acronym for the "Akmolinsk Camp for Wives of Traitors to the Motherland." Unlike other Gulags filled with political dissidents or criminals, this camp was unique and cruel: it imprisoned women whose only "crime" was being the wife, sister, or mother of a man deemed an enemy of the state.

Between 1938 and 1953, over 18,000 women passed through these gates. They were the cream of the intelligentsia—artists, doctors, teachers, and aristocrats—stripped of their names, separated from their children, and forced into hard labor in the harsh steppe winter.

# The Arch of Grief

The entrance to the memorial is marked by the "Arch of Grief" (Arch of Sorrow). This silver, helmet-like structure symbolizes a woman bowing her head in mourning for her lost husband and children. Passing beneath it is a ritual of respect, a physical acknowledgment of the weight of sorrow these women carried.

The path leads to the "Star of Violation," a monument that pierces the ground, representing the destruction of lives and the scarring of the land itself. The complex includes a museum, a restored railway car of the type used to transport the prisoners (often called "Teplushkas"), and a wall of memory engraved with thousands of names.

# The "Algeria" of the Steppe

The prisoners ironically referred to the camp as "Algeria" (a play on the Russian acronym A.L.Zh.I.R.), a bitter joke contrasting their freezing, desolate reality with a warm, exotic land. Life in the camp was a daily battle for survival. The women built their own barracks from adobe bricks in sub-zero temperatures, harvested reeds from the lake, and worked in sewing workshops to produce military uniforms.

Despite the brutal conditions, the camp became a secret hub of culture. Imprisoned opera singers, actresses, and musicians would hold whispered performances in the barracks, maintaining their dignity and humanity through art even when stripped of everything else.

# Stories of the Fallen

The museum houses the personal effects of many famous prisoners, including Aziza Zhubanova (mother of the composer Yerkegali Rakhmadiyev) and Rachel Messerer (mother of the ballerina Maya Plisetskaya). It tells the heartbreaking stories of the "Alzhirians," many of whom did not know the fate of their husbands or the location of their children for decades.

Visiting ALZHIR is an emotional experience. It is not just a museum of repression, but a testament to the incredible resilience of the human spirit. It honors those who preserved their dignity in the face of absolute injustice.
`;

async function renovateAlzhir() {
    const db = await initFirebase();
    console.log('🚀 Starting ALZHIR Memorial Renovation...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const snapshot = await regionsRef.where('title', '==', 'Astana & Nearby').get();

    if (snapshot.empty) {
        console.error('❌ Astana region not found!');
        return;
    }

    const regionDoc = snapshot.docs[0];
    const attractionsRef = regionDoc.ref.collection('attractions');

    // Search for ALZHIR
    let snap = await attractionsRef.where('title', '>=', 'ALZHIR').where('title', '<=', 'ALZHIR\uf8ff').get();

    if (snap.empty) {
        // Try Alzhir title case
        snap = await attractionsRef.where('title', '>=', 'Alzhir').where('title', '<=', 'Alzhir\uf8ff').get();
    }

    if (snap.empty) {
        console.error('❌ ALZHIR attraction not found!');
        // Fuzzy
        const all = await attractionsRef.get();
        const found = all.docs.find(d => {
            const t = d.data().title.toLowerCase();
            return t.includes('alzhir') || t.includes('memorial');
        });

        if (found) {
            console.log(`⚠️ Found fuzzy match: ${found.data().title}`);
            await updateAttraction(found);
        } else {
            console.log('Attraction truly missing.');
        }
        return;
    }

    const doc = snap.docs[0];
    await updateAttraction(doc);
}

async function updateAttraction(doc) {
    console.log(`✅ Found ALZHIR: ${doc.data().title} (${doc.id})`);

    await doc.ref.update({
        contentMarkdown: alzhirContent,
        lastRenovated: new Date().toISOString()
    });
    console.log('✅ Main content updated to Gold Standard.');
}

renovateAlzhir().catch(console.error);
