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

async function inspectDoc() {
    const db = await initFirebase();
    const docRef = db.collection('pages').doc('destinationsPage').collection('articles').doc('section-turkistan-and-shymkent').collection('attractions').doc('caravanserai-turkistan');
    const doc = await docRef.get();

    if (!doc.exists) {
        console.log('Doc not found');
        return;
    }

    const data = doc.data();
    console.log('--- MAIN DOC ---');
    console.log('Title:', data.title);
    console.log('Slug:', data.slug);
    console.log('Content Length:', (data.contentMarkdown || '').length);
    console.log('Photos:', (data.photos || []).length);

    console.log('\n--- ARTICLES SUBCOLLECTION ---');
    const subSnap = await docRef.collection('articles').get();
    console.log('Sub-articles:', subSnap.size);
    subSnap.forEach(d => {
        console.log(`- ${d.id}: ${d.data().title} (${(d.data().contentMarkdown || '').length} chars)`);
    });
}

inspectDoc().catch(console.error);
