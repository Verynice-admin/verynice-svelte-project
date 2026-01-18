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

const pyramidContent = `
# A Geometric Symbol of Global Unity

The Palace of Peace and Reconciliation is one of the most distinctive silhouettes on the Astana skyline. Shaped as a perfect pyramid, it was commissioned to host the Congress of Leaders of World and Traditional Religions. Designed by the visionary British architect Sir Norman Foster, the structure is a dedicated global center for interfaith understanding and the renunciation of violence. It stands on a 15-meter earth hillock, giving the 62-meter-high pyramid a commanding presence, elevating its total height to 77 meters.

The pyramid form was chosen specifically because it is non-denominational, resonating with spiritual history without favoring any single religion. Its dimensions follow the Fibonacci Golden Ratio, with a base of 62x62 meters, creating a sense of perfect aesthetic harmony.

# The "Hidden" Opera House

While the exterior suggests a monolithic monument, the interior is a complex, multi-layered environment. Remarkably, the base of the pyramid houses a fully equipped, world-class opera house capable of seating 1,500 guests. This performance hall is a study in dramatic contrast: the foyer is clad in dark, polished black stone, representing the underworld or the depth of the earth, which leads into the auditorium itself, finished in deep, rich red wood.

This subterranean cultural hub serves as a venue for high-level state performances and international artistic exchanges, proving that the building is as much a center for culture as it is for spirituality. Above this activity, the structure opens up into the vast "Cheops Atrium," a light-filled space that feels like a cathedral of modernity.

# Ascending the "Hanging Gardens"

Rising from the atrium is a spiraling path lined with greenery, often referred to as the "Hanging Gardens of Astana." Visitors can ascend through these levels, which house the Museum of National History, a library of religious literature, and research centers. The ascent is designed to be a symbolic journey from the darkness of conflict (the lower levels) towards the light of understanding (the apex).

The building also features unique diagonal elevators that move along a 60-degree incline, mimicking the slope of the pyramid walls—a rare engineering feature found in only a few buildings worldwide.

# The Cradle of Peace and Stained-Glass Doves

The journey culminates at the very apex of the pyramid in a circular chamber known as the "Cradle." This is the meeting room for the religious leaders, a space flooded with light. The walls of this transparent peak are adorned with a magnificent work of art by Brian Clarke: a stained-glass masterpiece depicting 130 doves in flight.

Each dove represents one of the many nationalities comprising the people of Kazakhstan, flying together in an endless, peaceful sky. Standing in this room, bathed in the multicolored light filtering through the doves, offers a profound sense of hope and clarity. It is the architectural and spiritual zenith of the capital, representing the highest aspirations of humanity.
`;

async function renovatePyramid() {
    const db = await initFirebase();
    console.log('🚀 Starting Palace of Peace and Reconciliation Renovation...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const snapshot = await regionsRef.where('title', '==', 'Astana & Nearby').get();

    if (snapshot.empty) {
        console.error('❌ Astana region not found!');
        return;
    }

    const regionDoc = snapshot.docs[0];
    const attractionsRef = regionDoc.ref.collection('attractions');

    // Search for Palace of Peace
    let snap = await attractionsRef.where('title', '>=', 'Palace of Peace').where('title', '<=', 'Palace of Peace\uf8ff').get();

    if (snap.empty) {
        console.error('❌ Palace of Peace attraction not found!');
        // Fuzzy search
        const all = await attractionsRef.get();
        const found = all.docs.find(d => {
            const t = d.data().title.toLowerCase();
            return t.includes('peace') && t.includes('palace');
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
    console.log(`✅ Found Pyramid: ${doc.data().title} (${doc.id})`);

    await doc.ref.update({
        contentMarkdown: pyramidContent,
        lastRenovated: new Date().toISOString()
    });
    console.log('✅ Main content updated to Gold Standard.');
}

renovatePyramid().catch(console.error);
