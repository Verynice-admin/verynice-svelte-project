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

async function listAll() {
    const db = await initFirebase();
    console.log('🔍 Listing all IDs in Turkistan & Shymkent...');

    const attractionsRef = db.collection('pages').doc('destinationsPage').collection('articles').doc('section-turkistan-and-shymkent').collection('attractions');
    const snap = await attractionsRef.get();

    snap.docs.forEach(doc => {
        const data = doc.data();
        console.log(`ID: ${doc.id} | Title: ${data.title} | Slug: ${data.slug}`);
    });
}

listAll().catch(console.error);
