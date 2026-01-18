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

const museumContent = `
# The Guardian of Steppe History

The National Museum of the Republic of Kazakhstan is a sprawling cultural complex that stands as the largest museum in Central Asia. Covering an immense 74,000 square meters, the building's architecture is a modern spectacle of blue glass and white stone, designed to interpret the dynamism of the steppe and the rich layers of history it holds. The museum comprises seven separate blocks, some rising up to nine stories, creating a monumental skyline that rivals the city's skyscrapers.

It is not merely a collection of artifacts but a storytelling engine that guides visitors from the deep geological past of the region to its vibrant present. The scale is overwhelming, intended to reflect the vastness of the Kazakh territory itself.

# The Golden Man: A National Icon

The absolute crown jewel of the museum's collection is the "Golden Man" (Altyn Adam), housed in the specialized Hall of Gold. Discovered in 1969 in the Issyk burial mound, this ancient warrior—believed to be a young Saka prince from the 4th–3rd century BC—was buried in a suit of armor made of over 4,000 individual gold plates.

This discovery revolutionized the world's understanding of the ancient nomadic civilizations, proving they possessed advanced metallurgical skills and a complex social hierarchy. The armor is intricately detailed with "Animal Style" motifs, featuring snow leopards, winged horses, and birds. Today, the Golden Man is a symbol of Kazakhstan's independence, and his likeness stands atop the Independence Monument in Almaty. Seeing the shimmer of this ancient craftsmanship in person is a profound experience that connects the modern viewer to the royalty of the iron age.

# The Soaring Eagle of the Atrium

The visitor experience begins with a moment of awe in the Grand Entrance Hall. Suspended high above the floor is a massive, gilded sculpture of a Golden Eagle, caught in mid-flight beneath the sun. It soars over a giant relief map of Kazakhstan, symbolizing the freedom, power, and high aspirations of the nation. This dramatic installation sets the tone for the entire museum: bold, proud, and deeply rooted in the symbolism of the land.

# Halls of Ethnography and Modernity

Beyond the gold, the museum excels in its Hall of Ethnography, which offers a vivid window into the traditional nomadic way of life. Here, visitors can explore authentic yurts, examine intricate saddles and weaponry, and understand the deep connection between the Kazakh people and the horse.

The museum does not dwell only in the past. It features cutting-edge multimedia displays, interactive floors, and holographic projections that bring history to life. The Hall of Independent Kazakhstan showcases the rapid modernization of the country, creating a narrative arc that travels from the ancient Saka warriors to the space-age achievements of the Baikonur Cosmodrome.
`;

async function renovateMuseum() {
    const db = await initFirebase();
    console.log('🚀 Starting National Museum Renovation...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const snapshot = await regionsRef.where('title', '==', 'Astana & Nearby').get();

    if (snapshot.empty) {
        console.error('❌ Astana region not found!');
        return;
    }

    const regionDoc = snapshot.docs[0];
    const attractionsRef = regionDoc.ref.collection('attractions');

    // Search for National Museum
    let snap = await attractionsRef.where('title', '>=', 'National Museum').where('title', '<=', 'National Museum\uf8ff').get();

    if (snap.empty) {
        console.error('❌ National Museum attraction not found!');
        // Fuzzy search
        const all = await attractionsRef.get();
        const found = all.docs.find(d => {
            const t = d.data().title.toLowerCase();
            return t.includes('museum') && t.includes('national');
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
    console.log(`✅ Found Museum: ${doc.data().title} (${doc.id})`);

    await doc.ref.update({
        contentMarkdown: museumContent,
        lastRenovated: new Date().toISOString()
    });
    console.log('✅ Main content updated to Gold Standard.');
}

renovateMuseum().catch(console.error);
