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

async function inspectAttraction() {
    const db = await initFirebase();
    console.log('🔍 Inspecting Astana City Attraction Data...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const snapshot = await regionsRef.where('title', '==', 'Astana & Nearby').get();

    if (snapshot.empty) {
        console.log('Region not found');
        return;
    }

    const regionDoc = snapshot.docs[0];
    const attractionsRef = regionDoc.ref.collection('attractions');
    const snap = await attractionsRef.where('title', '==', 'Astana City').get();

    if (snap.empty) {
        console.log('Astana City not found');
        return;
    }

    const doc = snap.docs[0];
    const data = doc.data();

    console.log('--- Document ID:', doc.id);
    console.log('--- Start Data ---');
    console.log(JSON.stringify(data, null, 2));
    console.log('--- End Data ---');

    // Also check if there is a subcollection 'articles' or similar under the attraction
    const collections = await doc.ref.listCollections();
    if (collections.length > 0) {
        console.log('--- Subcollections ---');
        for (const col of collections) {
            console.log(`Collection ID: ${col.id}`);
            const subDocs = await col.get();
            subDocs.forEach(sd => {
                console.log(`  SubDoc [${sd.id}]:`, JSON.stringify(sd.data(), null, 2));
            });
        }
    }
}

inspectAttraction().catch(console.error);
