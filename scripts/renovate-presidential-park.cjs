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

const parkContent = `
# The Mythical Bird from Above

Presidential Park is a sprawling green oasis that hides a massive secret: it is a piece of land art visible only from the sky. Covering over 80 hectares, the entire park is landscaped in the shape of the Samruk, the mythical bird of happiness that lays the golden egg in the Baiterek legend.

From the ground, this vast design translates into sweeping curves, intricate pathways, and a long, sinuous artificial stream that mimics the bird's tail and wings. It is a brilliant example of modern landscape architecture where the concept dictates the form.

# The Best View in the Capital

Located on the banks of the Ishim River, directly across from the Ak Orda Presidential Palace, this park offers the single best vantage point for admiring the new administrative center. From the water's edge, you can see the white-and-gold splendor of the President's residence reflected in the river, framed by the futuristic skyscrapers of the Left Bank.

It is a favorite spot for photographers, especially at sunset when the glass facades of the downtown skyline catch the fire of the setting sun.

# A Garden of Peace

The park wraps around the Palace of Peace and Reconciliation (the Pyramid), acting as its verdant courtyard. The landscaping here is designed to be contemplative, with quiet groves of trees, flower beds, and fountains that create a sense of serenity appropriate for a global center of interfaith dialogue.

Unlike the busy Nurzhol Boulevard, Presidential Park is a place of stillness. It is where the city comes to breathe, offering miles of jogging tracks and cycling paths that weave through the "feathers" of the great stone bird.
`;

async function renovatePark() {
    const db = await initFirebase();
    console.log('🚀 Starting Presidential Park Renovation...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const snapshot = await regionsRef.where('title', '==', 'Astana & Nearby').get();

    if (snapshot.empty) {
        console.error('❌ Astana region not found!');
        return;
    }

    const regionDoc = snapshot.docs[0];
    const attractionsRef = regionDoc.ref.collection('attractions');

    // Search for Presidential Park
    let snap = await attractionsRef.where('title', '>=', 'Presidential Park').where('title', '<=', 'Presidential Park\uf8ff').get();

    if (snap.empty) {
        console.error('❌ Presidential Park attraction not found!');
        // Fuzzy
        const all = await attractionsRef.get();
        const found = all.docs.find(d => {
            const t = d.data().title.toLowerCase();
            return (t.includes('presidential') && t.includes('park'));
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
    console.log(`✅ Found Park: ${doc.data().title} (${doc.id})`);

    await doc.ref.update({
        contentMarkdown: parkContent,
        lastRenovated: new Date().toISOString()
    });
    console.log('✅ Main content updated to Gold Standard.');
}

renovatePark().catch(console.error);
