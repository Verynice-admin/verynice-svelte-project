const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initFirebase() {
    if (admin.apps.length) return admin.firestore();
    const saVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    let sa = JSON.parse(saVar);
    admin.initializeApp({ credential: admin.credential.cert(sa) });
    return admin.firestore();
}

async function check() {
    const db = await initFirebase();
    const doc = await db.collection('pages').doc('destinationsPage').collection('articles').doc('almaty-nearby').collection('attractions').doc('charyn-canyon').get();
    console.log(doc.data().contentMarkdown.substring(0, 1000));
}

check().catch(console.error);
