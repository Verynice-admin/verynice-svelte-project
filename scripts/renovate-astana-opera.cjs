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

const operaContent = `
# A Temple of High Art

The Astana Opera is not merely a theater; it is a monumental temple dedicated to the performing arts. Opened in 2013, it is widely recognized as the third-largest opera house in the world. Its architecture is a stunning revival of classical Greco-Roman style, featuring a massive colonnade that evokes the grandeur of the Parthenon. However, upon closer inspection, the details—such as the sculptures of nomads and national ornaments—reveal its distinctly Kazakh soul.

Perched atop the roof is a bronze quadriga driven by the Saka queen Tomiris, symbolizing the fearless spirit of the nation leading the way in cultural excellence.

# World-Class Acoustics

The heart of the opera house is its Main Hall, which seats 1,250 guests. Designed by Italian acoustic masters, the hall's geometry is modeled after iconic 19th-century Italian theaters like La Scala. The result is a sonic environment of absolute purity, where a whisper on stage can be heard in the back row without amplification.

Every material was chosen for its acoustic properties, from the specific wood of the floor to the intricate plasterwork on the balconies. The hall is a horseshoe shape, creating an intimate connection between the performers and the audience despite the grand scale.

# The Hall of Mirrors and Crystal

Entering the foyer is an experience in itself. The space is a wash of marble, gold leaf, and light. Dominating the center is a breathtaking Bohemian crystal chandelier weighing 1.6 tons. The walls are adorned with hand-painted murals depicting the varied landscapes of Kazakhstan, from the Charyn Canyon to the lakes of Burabay, grounding the European architectural form in the local geography.

# A Global Cultural Hub

Since its opening, the Astana Opera has hosted some of the most prestigious companies in the world, including La Scala, the San Carlo, and the Mariinsky Theatre. Its stage machinery is among the most advanced on the planet, capable of handling complex, multi-level set changes instantly. Whether you are seeing a classical ballet like "Swan Lake" or a national opera like "Birzhan and Sara," the production quality is rivaled only by a handful of theaters worldwide.
`;

async function renovateOpera() {
    const db = await initFirebase();
    console.log('🚀 Starting Astana Opera Renovation...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const snapshot = await regionsRef.where('title', '==', 'Astana & Nearby').get();

    if (snapshot.empty) {
        console.error('❌ Astana region not found!');
        return;
    }

    const regionDoc = snapshot.docs[0];
    const attractionsRef = regionDoc.ref.collection('attractions');

    // Search for Astana Opera
    let snap = await attractionsRef.where('title', '>=', 'Astana Opera').where('title', '<=', 'Astana Opera\uf8ff').get();

    if (snap.empty) {
        console.error('❌ Astana Opera attraction not found!');
        // Fuzzy
        const all = await attractionsRef.get();
        const found = all.docs.find(d => {
            const t = d.data().title.toLowerCase();
            return (t.includes('opera') && t.includes('astana'));
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
    console.log(`✅ Found Opera: ${doc.data().title} (${doc.id})`);

    // Update the Main Content
    await doc.ref.update({
        contentMarkdown: operaContent,
        lastRenovated: new Date().toISOString()
    });
    console.log('✅ Main content updated to Gold Standard.');
}

renovateOpera().catch(console.error);
