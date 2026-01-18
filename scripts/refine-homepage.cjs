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

async function refineHomepage() {
    const db = await initFirebase();
    console.log('🚀 Refining homepage with social and newsletter content...');

    const updates = {
        newsletterTitle: "Get the Definitive Kazakhstan Digest",
        newsletterSubtitle: "Exclusive travel stories, hidden spot alerts, and cultural deep-dives delivered once a month.",
        socialTitle: "Join our Visual Journey",
        socialSubtitle: "Follow our explorers across the 14 regions of Kazakhstan.",

        // Ensure the featured destination represents the best content
        featuredDestination: {
            id: 'caravanserai-turkistan',
            title: 'Caravanserai Turkistan',
            description: 'Experience the magic of the Silk Road revived. The world\'s largest flying theater, luxury caravanserais, and the spirit of medieval trade routes.',
            imagePublicId: 'content/pages/destinations/Turkistan_Shymkent/karavan-saray-center/main'
        },

        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('pages').doc('homepage').set(updates, { merge: true });
    console.log('✨ Homepage refined!');
}

refineHomepage().catch(console.error);
