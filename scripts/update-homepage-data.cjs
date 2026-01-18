const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initFirebase() {
    if (admin.apps.length) return admin.firestore();
    const saVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    let sa;
    if (saVar) sa = JSON.parse(saVar);
    else if (fs.existsSync(path.resolve('.secrets/serviceAccountKey.json'))) {
        sa = JSON.parse(fs.readFileSync(path.resolve('.secrets/serviceAccountKey.json'), 'utf8'));
    }
    admin.initializeApp({ credential: admin.credential.cert(sa) });
    return admin.firestore();
}

async function updateHomepage() {
    const db = await initFirebase();
    console.log('🚀 Updating homepage document with premium content...');

    const updates = {
        title: "VeryNice.kz | The Definitive Guide to Kazakhstan",
        metaDescription: "Experience the monumental beauty of Kazakhstan. From the Silk Road heritage of Turkistan to the futuristic skyline of Astana and the wild Altai mountains.",
        heroTitle: "Kazakhstan: The Great Steppe Reimagined",
        heroSubtitle: "Journey through monumental landscapes, ancient Silk Road heritage, and vibrant modern cities. Your professional guide to Central Asia's pristine frontier.",
        heroImagePublicId: "home/content/pages/homepage/Kazakhstan-bckgrnd",
        featuredVideoUrl: "https://www.youtube.com/watch?v=v_O_E_iSAc4",

        // Premium Portal Sections
        welcomeHeading: "Welcome to Central Asia's Hidden Gem",
        welcomeText: "Kazakhstan is a land of extremes and unexpected beauty. Whether you are seeking the urban energy of Almaty, the spiritual depth of ancient mausoleums, or the silence of high-altitude lakes, our curated guides provide everything you need for the perfect journey.",

        featuredDestination: {
            id: 'charyn-canyon',
            title: 'Charyn Canyon',
            description: 'Kazakhstan\'s "Grand Canyon" – a spectacular 80km valley of red sandstone architecture carved by time and the elements.',
            imagePublicId: 'content/pages/destinations/Almaty_Nearby/charyn-canyon/main'
        },

        stats: [
            { label: 'Destinations', value: '130+' },
            { label: 'Natural Parks', value: '14' },
            { label: 'Silk Road Sites', value: '25+' },
            { label: 'Photos', value: '1500+' }
        ],

        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('pages').doc('homepage').set(updates, { merge: true });
    console.log('✨ Homepage document updated successfully!');
}

updateHomepage().catch(console.error);
