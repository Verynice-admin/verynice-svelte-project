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

async function listRegions() {
    const db = await initFirebase();
    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const snap = await regionsRef.get();
    snap.docs.forEach(doc => {
        console.log(`Region ID: ${doc.id} | Title: ${doc.data().title}`);
    });
}

listRegions().catch(console.error);
