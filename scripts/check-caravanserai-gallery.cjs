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

async function checkGallery() {
    const db = await initFirebase();
    const docRef = db.collection('pages').doc('destinationsPage').collection('articles').doc('section-turkistan-and-shymkent').collection('attractions').doc('caravanserai-turkistan');

    console.log('--- PHOTO GALLERY SUBCOLLECTION ---');
    const galSnap = await docRef.collection('photoGallery').get();
    console.log('Docs:', galSnap.size);
    galSnap.forEach(d => {
        console.log(`- ${d.id}:`, JSON.stringify(d.data(), null, 2));
    });
}

checkGallery().catch(console.error);
