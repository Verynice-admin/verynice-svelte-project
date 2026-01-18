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

const grandMosqueContent = `
# A New Wonder of the Islamic World

Inaugurated in 2022, the Astana Grand Mosque has instantly asserted itself as a titan of religious architecture. It is officially the largest mosque in Central Asia and one of the largest in the world. The sheer scale is difficult to comprehend until witnessed in person: the total capacity of the complex reaches an astounding 235,000 worshippers, with the main prayer hall alone accommodating 30,000 people.

The mosque's footprint spans 57,000 square meters, topped by a blue main dome that rises 83.2 meters high with a diameter of 62 meters—the largest of its specific construction type globally. Four towering minarets flank the structure, each soaring to 130 meters, symbolizing the spiritual elevation of the faith. It is not just a place of worship; it is a monumental statement of modern Kazakhstan's cultural and spiritual identity.

# Record-Breaking Artistry in Every Detail

The interior of the Astana Grand Mosque is a gallery of world records and unparalleled craftsmanship. Upon entering, visitors pass through one of the world’s tallest wooden doors, a 12.4-meter masterpiece carved from dense Iroko wood, weighing 1.5 tons. Inside, the floor is covered by the largest handmade carpet in the world. Woven by 1,000 artisans using 80 tons of New Zealand wool, this intricate Kazakh ornamental rug covers over 15,000 square meters and features a massive 70-meter medallion at its heart.

Above, the main dome holds another marvel: a crystal chandelier of colossal proportions. With a diameter of 27 meters and a weight of 27 tons, it is composed of over 1.3 million individual crystals. In total, the mosque's five chandeliers utilize more than 3 million crystals, creating a glittering canopy of light that transforms the prayer hall into a celestial space.

# The Qibla Wall: A Mosaic of 25 Million Crystals

Perhaps the most breathtaking feature is the Qibla wall, which faces Mecca. Unlike traditional painted or tiled walls, this masterpiece is set with 25 million colored glass crystals. It is illuminated from within, causing the 99 names of Allah inscribed upon it to glow with a divine, golden light. This wall alone spans 100 meters in length and 22 meters in height, creating a shimmering horizon that captivates every visitor.

# A Beacon of Faith and Tourism

The mosque was designed to be welcoming to all, not just worshippers. One of the minarets features an elevator that whisks visitors up to an observation terrace 110 meters above the ground, offering a unique perspective of the city and the mosque's own sprawling architecture.

Surrounding the main structure is a sprawling park and courtyard system that allows for huge gatherings during religious festivals. The combination of deep spiritual significance, record-breaking statistics, and breathtaking beauty makes the Astana Grand Mosque an essential stop for any traveler, offering a profound insight into the modern spirit of the Silk Road.
`;

async function renovateGrandMosque() {
    const db = await initFirebase();
    console.log('🚀 Starting Astana Grand Mosque Renovation...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const snapshot = await regionsRef.where('title', '==', 'Astana & Nearby').get();

    if (snapshot.empty) {
        console.error('❌ Astana region not found!');
        return;
    }

    const regionDoc = snapshot.docs[0];
    const attractionsRef = regionDoc.ref.collection('attractions');

    // Search for Astana Grand Mosque
    // Try multiple name variations
    let snap = await attractionsRef.where('title', '>=', 'Astana Grand Mosque').where('title', '<=', 'Astana Grand Mosque\uf8ff').get();

    if (snap.empty) {
        console.log('Searching for "Grand Mosque of Astana"...');
        snap = await attractionsRef.where('title', '>=', 'Grand Mosque').where('title', '<=', 'Grand Mosque\uf8ff').get();
    }

    if (snap.empty) {
        console.error('❌ Astana Grand Mosque attraction not found via query!');
        // Fuzzy search
        const all = await attractionsRef.get();
        const found = all.docs.find(d => {
            const t = d.data().title.toLowerCase();
            return (t.includes('grand mosque') || t.includes('largest mosque')) && !t.includes('hazrat');
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
    console.log(`✅ Found Mosque: ${doc.data().title} (${doc.id})`);

    await doc.ref.update({
        contentMarkdown: grandMosqueContent,
        lastRenovated: new Date().toISOString()
    });
    console.log('✅ Main content updated to Gold Standard.');
}

renovateGrandMosque().catch(console.error);
