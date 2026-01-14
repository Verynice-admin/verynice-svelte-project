const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function run() {
    try {
        let sa;
        const saVar = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (saVar) {
            sa = JSON.parse(saVar);
        } else if (fs.existsSync(path.resolve('.secrets/serviceAccountKey.json'))) {
            sa = JSON.parse(fs.readFileSync(path.resolve('.secrets/serviceAccountKey.json'), 'utf8'));
        }

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(sa)
            });
        }

        const db = admin.firestore();
        const docPath = 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/respublika-alany';
        const snap = await db.doc(docPath).get();

        if (snap.exists) {
            const data = snap.data();
            console.log('DOC_EXIST: true');
            console.log('PHOTOS_COUNT:', data.photos ? data.photos.length : 0);
            console.log('PHOTOS:', JSON.stringify(data.photos, null, 2));
            console.log('MAIN_IMAGE:', data.mainImage);
        } else {
            console.log('DOC_EXIST: false');
        }

    } catch (e) {
        console.error(e);
    }
}

run();
