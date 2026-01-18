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

async function listAstana() {
    const db = await initFirebase();
    console.log('Listing Astana Attractions...');

    // Find Astana region doc ID first (usually it's a known ID or we query by title)
    // Based on previous contexts, it's likely under 'destinationsPage' -> 'articles' -> [someId]
    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const snapshot = await regionsRef.where('title', '==', 'Astana & Nearby').get();

    if (snapshot.empty) {
        console.log('Astana region not found!');
        return;
    }

    const astanaDoc = snapshot.docs[0];
    console.log(`Found Region: ${astanaDoc.id}`);

    const attractionsSnap = await astanaDoc.ref.collection('attractions').get();
    attractionsSnap.forEach(doc => {
        const data = doc.data();
        console.log(`\nID: ${doc.id}`);
        console.log(`Title: ${data.title}`);
        console.log(`Content Length: ${(data.content || '').length}`);
        console.log(`Markdown Length: ${(data.contentMarkdown || '').length}`);
    });
}

listAstana().then(() => process.exit(0)).catch(console.error);
