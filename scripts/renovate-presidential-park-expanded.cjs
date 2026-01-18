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

Presidential Park is a sprawling green oasis that hides a massive, secret symbol visible only from the sky. Covering over 80 hectares, the entire park is meticulously landscaped in the shape of the Samruk—the mythical bird of happiness that lays the golden egg in the legend of the Baiterek.

From the ground, this vast design translates into sweeping concrete curves, intimate pathways, and a long, sinuous artificial stream that mimics the bird's tail and wings. It is a brilliant example of modern landscape architecture where the concept dictates the form, turning the city's green lung into a piece of national storytelling. The scale is immense; walking from the "tail" to the "head" of the bird takes you on a journey through diverse zones of fountains, flowerbeds, and groves.

# The Best View in the Capital

Located on the banks of the Ishim River, directly across from the Ak Orda Presidential Palace, this park offers the single best vantage point for admiring the new administrative center. From the water's edge, you can see the white-and-gold splendor of the President's residence reflected in the river, framed by the futuristic curved towers of the "Golden House" ministries.

It is a favorite spot for photographers, especially at the "golden hour" of sunset, when the glass facades of the downtown skyline catch the fire of the setting sun, and the river turns into a ribbon of molten metal. The contrast between the organic weeping willows of the park and the sharp geometric lines of the architecture across the water is striking.

# A Garden of Peace

The park wraps around the Palace of Peace and Reconciliation (the Pyramid), acting as its verdant courtyard. The landscaping here is designed to be contemplative, with quiet groves of spruce and birch trees that screen out the noise of the city. Fountains play a central role, adding the soothing sound of running water to the atmosphere of serenity.

Unlike the busy, energetic Nurzhol Boulevard, Presidential Park is a place of stillness. It is where the city comes to breathe, offering miles of dedicated jogging tracks and cycling paths. In the intense heat of the Astana summer, the mist from the fountains and the shade of the trees make it a sanctuary for residents seeking relief.

# The Bridge of Atyrau Connection

Recently, the park has been connected to the older parts of the city via the pedestrian Atyrau Bridge. This means you can now stand in the center of the park, surrounded by the newest monuments, and walk uninterrupted across the river to the historic Samal district. The park acts as the green hinge connecting the different eras of the city's history.
`;

async function renovateParkExpanded() {
    const db = await initFirebase();
    console.log('🚀 Starting Presidential Park Renovation (Expanded)...');

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
            console.error('❌ Presidential Park attraction not found!');
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

renovateParkExpanded().catch(console.error);
