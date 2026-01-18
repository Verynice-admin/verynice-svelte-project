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

async function querySliders() {
    const db = await initFirebase();
    console.log('🔍 Testing dynamic slider queries...');

    const snap = await db.collectionGroup('attractions').limit(100).get();
    const all = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const cities = all.filter(a => (a.title || '').toLowerCase().includes('city') || (a.slug || '').includes('city')).slice(0, 6);
    const parks = all.filter(a => (a.title || '').toLowerCase().includes('park') || (a.title || '').toLowerCase().includes('reserve')).slice(0, 6);
    const lakes = all.filter(a => (a.title || '').toLowerCase().includes('lake') || (a.title || '').toLowerCase().includes('reservoir')).slice(0, 6);
    const mountains = all.filter(a => (a.title || '').toLowerCase().includes('mountain') || (a.title || '').toLowerCase().includes('peak') || (a.title || '').toLowerCase().includes('canyon')).slice(0, 6);

    console.log(`Cities: ${cities.length}`);
    console.log(`Parks: ${parks.length}`);
    console.log(`Lakes: ${lakes.length}`);
    console.log(`Mountains: ${mountains.length}`);

    cities.forEach(c => console.log(`- City: ${c.title}`));
}

querySliders().catch(console.error);
