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

async function findKaravan() {
    const db = await initFirebase();
    console.log('🔍 Searching for karavan-saray-center across all collections...');

    const collections = ['attractions', 'pages', 'articles'];
    // We'll use collectionGroup for attractions
    const groupSnap = await db.collectionGroup('attractions').get();
    groupSnap.docs.forEach(doc => {
        if (doc.id === 'karavan-saray-center' || (doc.data().slug === 'karavan-saray-center')) {
            console.log(`Found in: ${doc.ref.path}`);
        }
    });

    const docRef = db.collection('pages').doc('destinationsPage').collection('articles').doc('section-turkistan-and-shymkent').collection('attractions').doc('karavan-saray-center');
    const doc = await docRef.get();
    if (doc.exists) {
        console.log(`Found direct path: ${doc.ref.path}`);
    } else {
        console.log('Direct path does not exist.');
    }
}

findKaravan().catch(console.error);
