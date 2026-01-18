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

async function finalize() {
    const db = await initFirebase();
    const id = 'caravanserai-turkistan';
    const regionId = 'section-turkistan-and-shymkent';
    const docRef = db.collection('pages').doc('destinationsPage').collection('articles').doc(regionId).collection('attractions').doc(id);

    await docRef.update({
        slug: id,
        id: id
    });

    // Also check if there is a headerDescription
    const snap = await docRef.get();
    const data = snap.data();
    if (!data.headerDescription || data.headerDescription === 'undefined') {
        await docRef.update({
            headerDescription: "Caravanserai Turkistan is a unique tourist complex that revives the spirit of the Great Silk Road with modern luxury and cultural depth."
        });
    }

    console.log('✅ Slug and Header Description finalized for Caravanserai Turkistan.');
}

finalize().catch(console.error);
