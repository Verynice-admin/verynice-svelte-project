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

async function inspectHomepage() {
    const db = await initFirebase();
    console.log('🔍 Inspecting homepage document...');
    const doc = await db.collection('pages').doc('homepage').get();
    if (doc.exists) {
        console.log(JSON.stringify(doc.data(), null, 2));
    } else {
        console.log('Homepage document does not exist.');
    }
}

inspectHomepage().catch(console.error);
