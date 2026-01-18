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

const ishimContent = `
# The Pulse of the Capital

The Ishim River Promenade is the beating heart of Astana, a vibrant artery that breathes life into the steel-and-glass metropolis. Winding its way through the city, the river divides the capital into two distinct worlds: the historic, soulful Right Bank and the futuristic, ambitious Left Bank. The promenade that lines its shores is more than just a walkway; it is the primary social hub where the city comes to relax, exercise, and celebrate.

Unlike the monumental scale of the government district, the promenade offers a human-scale experience. It is lined with pop-up cafes, street musicians, and lush landscaping, making it the perfect place to feel the true rhythm of local life.

# The Atyrau "Fish" Bridge

The crown jewel of the river is the Atyrau Bridge, a pedestrian marvel gifted to the capital by the Atyrau region. Its design is unmistakable: constructed from 2,500 aluminum scales, the bridge mimics the form of a giant Caspian sturgeon, a symbol of the gifting region.

Walking through it feels like traveling inside a futuristic organism. The "scales" provide shelter from the wind and sun while creating a mesmerizing interplay of light and shadow. At night, the bridge is illuminated in shifting colors, becoming a glowing sculpture that hovers over the dark water. It is widely considered one of the most "Instagrammable" spots in the country.

# A Promenade for All Seasons

Astana is a city of extreme seasons, and the Ishim River adapts to each one. In the summer, the water is alive with boats, catamarans, and river trams taking tourists on scenic cruises. The air is filled with the sound of laughter and music.

In the winter, when temperatures drop and the river freezes solid, it transforms into a massive playground. The ice is cleared to create miles of skating rinks, slides, and cross-country ski tracks. It becomes a winter wonderland where residents brave the cold to enjoy ice fishing or simply walk down the middle of the frozen river, viewing the city from a perspective impossible at any other time of year.

# Bridging Two Eras

The promenade serves as a physical and symbolic bridge between the past and the future. A short walk takes you from the Soviet-era blocks and cozy parks of the old city to the gleaming skyscrapers and high-tech monuments of the new administrative center. It is the best place to witness the rapid evolution of Kazakhstan, standing with one foot in history and the other in tomorrow.
`;

async function renovateIshim() {
    const db = await initFirebase();
    console.log('🚀 Starting Ishim River Promenade Renovation...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const snapshot = await regionsRef.where('title', '==', 'Astana & Nearby').get();

    if (snapshot.empty) {
        console.error('❌ Astana region not found!');
        return;
    }

    const regionDoc = snapshot.docs[0];
    const attractionsRef = regionDoc.ref.collection('attractions');

    // Search for Ishim
    let snap = await attractionsRef.where('title', '>=', 'Ishim').where('title', '<=', 'Ishim\uf8ff').get();

    if (snap.empty) {
        // Try Esil
        snap = await attractionsRef.where('title', '>=', 'Esil').where('title', '<=', 'Esil\uf8ff').get();
    }

    if (snap.empty) {
        console.error('❌ Ishim attraction not found!');
        // Fuzzy
        const all = await attractionsRef.get();
        const found = all.docs.find(d => {
            const t = d.data().title.toLowerCase();
            return (t.includes('ishim') || t.includes('esil') || t.includes('promenade') || t.includes('river'));
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
    console.log(`✅ Found Ishim River: ${doc.data().title} (${doc.id})`);

    await doc.ref.update({
        contentMarkdown: ishimContent,
        lastRenovated: new Date().toISOString()
    });
    console.log('✅ Main content updated to Gold Standard.');
}

renovateIshim().catch(console.error);
