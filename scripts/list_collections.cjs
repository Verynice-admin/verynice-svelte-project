const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin (same standard logic)
const possibleKeys = [
    'service-account-key.json',
    'config/service-account-key.json',
    '../service-account-key.json',
    '../config/service-account-key.json'
];

let serviceAccount = null;
for (const keyPath of possibleKeys) {
    const fullPath = path.resolve(__dirname, '..', keyPath);
    if (fs.existsSync(fullPath)) {
        serviceAccount = require(fullPath);
        break;
    }
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function listCollections() {
    const collections = await db.listCollections();
    console.log('Root Collections:');
    collections.forEach(col => console.log(' - ' + col.id));
}

listCollections().catch(console.error);
