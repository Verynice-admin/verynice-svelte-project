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

async function cleanup() {
    const db = await initFirebase();
    const id = 'caravanserai-turkistan';
    const regionId = 'section-turkistan-and-shymkent';
    const galRef = db.collection('pages').doc('destinationsPage').collection('articles').doc(regionId).collection('attractions').doc(id).collection('photoGallery').doc('main');

    await galRef.delete();
    console.log('✅ Deleted empty photoGallery/main to ensure fallback uses the linked photos.');
}

cleanup().catch(console.error);
