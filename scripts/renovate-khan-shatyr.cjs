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

const khanShatyrContent = `
# A Masterpiece of Sustainable Engineering

The Khan Shatyr Entertainment Center is widely recognized as one of the most audacious architectural projects in modern history. Designed by the renowned British architect Lord Norman Foster of Foster + Partners, this colossal structure holds the title of the world's tallest tensile structure from an elliptical base. Rising 150 meters (490 feet) into the skyline, its distinctive tilted cone shape pays homage to the traditional Kazakh yurt, reimagined on a monumental scale for the 21st century.

What makes Khan Shatyr truly revolutionary is its envelope. The entire structure is clad in a three-layer Ethylene Tetrafluoroethylene (ETFE) cushion system. This transparent, lightweight material is not only durable and self-cleaning but also provides exceptional thermal insulation. Suspended by a complex network of steel cables from a central tripod, this "breathing" skin allows natural sunlight to flood the interior while rigorously protecting visitors from the harsh external elements. It is a triumph of engineering that seemingly defies the laws of traditional construction.

# The "Eternal Summer": Defying the Steppe Climate

Astana is the second-coldest capital city in the world, with winter temperatures often plummeting below -35°C (-31°F) and summer highs reaching +35°C (+95°F). The primary mission of Khan Shatyr was to create a climate-controlled oasis that remains impervious to these extreme fluctuations. Inside this transparent tent, a constant, comfortable microclimate is maintained year-round, typically hovering between 15°C and 30°C.

This feat is achieved through a sophisticated passive and active climate control system. In the freezing winter, warm air currents are directed up the inner surface of the ETFE fabric to prevent ice formation and condensation. In the summer, vents at the apex of the structure can be opened to induce natural stack-effect ventilation, releasing hot air and keeping the interior cool. This "Eternal Summer" allows residents and tourists to escape the biting steppe winds and enjoy a vibrant social life in a garden-like atmosphere, regardless of the season.

# Sky Beach Club: A Tropical Paradise in the North

One of the most surreal experiences Khan Shatyr offers is the Sky Beach Club, located on the uppermost terrace of the complex. Here, thousands of miles from the nearest ocean, visitors can relax on a sandy beach featuring authentic white sand imported directly from the Maldives. The tropical zone maintains a balmy temperature of 35°C, creating a convincing illusion of a seaside resort.

The beach club features a heated pool with artificial waves, allowing for a swimming experience that mimics the ocean. Surrounded by lush greenery and bathed in the natural light filtering through the transparent roof, it provides a stark and delightful contrast to the snowy landscape often visible just outside the translucent walls. It is a favorite retreat for locals seeking a holiday atmosphere without leaving the city limits.

# A "City Within a City"

Khan Shatyr is more than just a shopping mall; it is conceptually a "city within a city." The vast internal space, covering over 100,000 square meters, is organized to replicate an urban environment with streets, squares, and parks. It houses a boating river that winds through the complex, a mini-golf course, and a 38-meter drop tower for thrill-seekers.

The layout encourages exploration, with tiered terraces lined with cafes, restaurants, and international retail brands. As a social hub, it hosts concerts, cultural events, and public gatherings, functioning as a covered town square for the capital. The sheer scale and variety of amenities ensure that a visit to Khan Shatyr is not just a shopping trip, but a full-day excursion into a futuristic, climate-defying world.
`;

async function renovateKhanShatyr() {
    const db = await initFirebase();
    console.log('🚀 Starting Khan Shatyr Renovation...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const snapshot = await regionsRef.where('title', '==', 'Astana & Nearby').get();

    if (snapshot.empty) {
        console.error('❌ Astana region not found!');
        return;
    }

    const regionDoc = snapshot.docs[0];
    const attractionsRef = regionDoc.ref.collection('attractions');

    // Search for Khan Shatyr
    const snap = await attractionsRef.where('title', '>=', 'Khan Shatyr').where('title', '<=', 'Khan Shatyr\uf8ff').get();

    if (snap.empty) {
        console.error('❌ Khan Shatyr attraction not found!');

        // Fuzzy search attempt if exact match fails
        const all = await attractionsRef.get();
        const found = all.docs.find(d => d.data().title.toLowerCase().includes('shatyr'));
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
    console.log(`✅ Found Khan Shatyr: ${doc.data().title} (${doc.id})`);

    // Update the Main Content
    await doc.ref.update({
        contentMarkdown: khanShatyrContent,
        lastRenovated: new Date().toISOString()
    });
    console.log('✅ Main content updated to Gold Standard.');
}

renovateKhanShatyr().catch(console.error);
